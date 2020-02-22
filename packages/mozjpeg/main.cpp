#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <stdlib.h>
#include <inttypes.h>
#include <stdio.h>
#include <setjmp.h>
#include <string.h>
#include "config.h"
#include "jpeglib.h"
#include "cdjpeg.h"

using namespace emscripten;

struct MozJPEGOptions
{
  int quality;
  bool baseline;
  bool arithmetic;
  bool progressive;
  bool optimize_coding;
  int smoothing;
  int color_space;
  int quant_table;
  bool trellis_multipass;
  bool trellis_opt_zero;
  bool trellis_opt_table;
  int trellis_loops;
  bool auto_subsample;
  int chroma_subsample;
  bool separate_chroma_quality;
  int chroma_quality;
};

class MozJPEG
{
private:
  uint8_t *buffer;
  struct jpeg_compress_struct cinfo;

  int channels;
  int height;
  int width;
  int row_stride;
  size_t length;

public:
  MozJPEG(std::string img_in, int width_, int height_)
  {
    buffer = (uint8_t *)img_in.c_str();
    height = height_;
    width = width_;
    channels = 3;
    length = width * height * channels;
    row_stride = width * channels;
  }

  ~MozJPEG()
  {
    delete[] buffer;
    jpeg_destroy_compress(&cinfo);
  }

  val getBuffer() const
  {
    return val(typed_memory_view(length, buffer));
  }

  size_t getLength() const
  {
    return length;
  }

  val encode(MozJPEGOptions options)
  {
    length = 0;
    uint8_t *result;

    JSAMPROW row_pointer[1];
    struct jpeg_error_mgr jerr;

    cinfo.err = jpeg_std_error(&jerr);
    jpeg_create_compress(&cinfo);
    jpeg_mem_dest(&cinfo, &result, &length);

    cinfo.image_width = width;
    cinfo.image_height = height;
    cinfo.input_components = channels;
    cinfo.in_color_space = JCS_RGB;

    jpeg_set_defaults(&cinfo);
    jpeg_set_colorspace(&cinfo, (J_COLOR_SPACE)options.color_space);

    if (options.quant_table != -1)
    {
      jpeg_c_set_int_param(&cinfo, JINT_BASE_QUANT_TBL_IDX, options.quant_table);
    }

    cinfo.optimize_coding = options.optimize_coding;

    if (options.arithmetic)
    {
      cinfo.arith_code = TRUE;
      cinfo.optimize_coding = FALSE;
    }

    cinfo.smoothing_factor = options.smoothing;

    jpeg_c_set_bool_param(&cinfo, JBOOLEAN_USE_SCANS_IN_TRELLIS, options.trellis_multipass);
    jpeg_c_set_bool_param(&cinfo, JBOOLEAN_TRELLIS_EOB_OPT, options.trellis_opt_zero);
    jpeg_c_set_bool_param(&cinfo, JBOOLEAN_TRELLIS_Q_OPT, options.trellis_opt_table);
    jpeg_c_set_int_param(&cinfo, JINT_TRELLIS_NUM_LOOPS, options.trellis_loops);

    std::string quality_str = std::to_string(options.quality);

    if (options.separate_chroma_quality && options.color_space == JCS_YCbCr)
    {
      quality_str += "," + std::to_string(options.chroma_quality);
    }

    char const *pqual = quality_str.c_str();

    set_quality_ratings(&cinfo, (char *)pqual, options.baseline);

    if (!options.auto_subsample && options.color_space == JCS_YCbCr)
    {
      cinfo.comp_info[0].h_samp_factor = options.chroma_subsample;
      cinfo.comp_info[0].v_samp_factor = options.chroma_subsample;
    }

    if (!options.baseline && options.progressive)
    {
      jpeg_simple_progression(&cinfo);
    }
    else
    {
      cinfo.num_scans = 0;
      cinfo.scan_info = NULL;
    }

    jpeg_start_compress(&cinfo, TRUE);

    while (cinfo.next_scanline < cinfo.image_height)
    {
      row_pointer[0] = &buffer[cinfo.next_scanline * row_stride];
      jpeg_write_scanlines(&cinfo, row_pointer, 1);
    }

    jpeg_finish_compress(&cinfo);

    delete[] buffer;
    buffer = result;

    return val(typed_memory_view(length, buffer));
  }
};

EMSCRIPTEN_BINDINGS(MozJPEG)
{
  enum_<J_COLOR_SPACE>("J_COLOR_SPACE")
      .value("JCS_UNKNOWN", JCS_UNKNOWN)     /* error/unspecified */
      .value("JCS_GRAYSCALE", JCS_GRAYSCALE) /* monochrome */
      .value("JCS_RGB", JCS_RGB)             /* red/green/blue as specified by the RGB_RED, RGB_GREEN, RGB_BLUE, and RGB_PIXELSIZE macros */
      .value("JCS_YCbCr", JCS_YCbCr)         /* Y/Cb/Cr (also known as YUV) */
      .value("JCS_CMYK", JCS_CMYK)           /* C/M/Y/K */
      .value("JCS_YCCK", JCS_YCCK)           /* Y/Cb/Cr/K */
      .value("JCS_EXT_RGB", JCS_EXT_RGB)     /* red/green/blue */
      .value("JCS_EXT_RGBX", JCS_EXT_RGBX)   /* red/green/blue/x */
      .value("JCS_EXT_BGR", JCS_EXT_BGR)     /* blue/green/red */
      .value("JCS_EXT_BGRX", JCS_EXT_BGRX)   /* blue/green/red/x */
      .value("JCS_EXT_XBGR", JCS_EXT_XBGR)   /* x/blue/green/red */
      .value("JCS_EXT_XRGB", JCS_EXT_XRGB)   /* x/red/green/blue */
      .value("JCS_EXT_RGBA", JCS_EXT_RGBA)   /* red/green/blue/alpha */
      .value("JCS_EXT_BGRA", JCS_EXT_BGRA)   /* blue/green/red/alpha */
      .value("JCS_EXT_ABGR", JCS_EXT_ABGR)   /* alpha/blue/green/red */
      .value("JCS_EXT_ARGB", JCS_EXT_ARGB)   /* alpha/red/green/blue */
      .value("JCS_RGB565", JCS_RGB565);      /* 5-bit red/6-bit green/5-bit blue */

  value_object<MozJPEGOptions>("MozJPEGOptions")
      .field("quality", &MozJPEGOptions::quality)
      .field("baseline", &MozJPEGOptions::baseline)
      .field("arithmetic", &MozJPEGOptions::arithmetic)
      .field("progressive", &MozJPEGOptions::progressive)
      .field("optimize_coding", &MozJPEGOptions::optimize_coding)
      .field("smoothing", &MozJPEGOptions::smoothing)
      .field("color_space", &MozJPEGOptions::color_space)
      .field("quant_table", &MozJPEGOptions::quant_table)
      .field("trellis_multipass", &MozJPEGOptions::trellis_multipass)
      .field("trellis_opt_zero", &MozJPEGOptions::trellis_opt_zero)
      .field("trellis_opt_table", &MozJPEGOptions::trellis_opt_table)
      .field("trellis_loops", &MozJPEGOptions::trellis_loops)
      .field("chroma_subsample", &MozJPEGOptions::chroma_subsample)
      .field("auto_subsample", &MozJPEGOptions::auto_subsample)
      .field("separate_chroma_quality", &MozJPEGOptions::separate_chroma_quality)
      .field("chroma_quality", &MozJPEGOptions::chroma_quality);

  class_<MozJPEG>("MozJPEG")
      .constructor<std::string, int, int>()
      .property("buffer", &MozJPEG::getBuffer)
      .property("length", &MozJPEG::getLength)
      .function("encode", &MozJPEG::encode);
}
