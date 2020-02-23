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

  int channels = 3;
  int height;
  int width;
  int row_stride;
  size_t length;

public:
  MozJPEG()
  {
  }

  MozJPEG(std::string img_in, int length_)
  {
    buffer = (uint8_t *)img_in.c_str();
    length = length_;
  }

  ~MozJPEG()
  {
    delete[] buffer;
  }

  val getBuffer() const
  {
    return val(typed_memory_view(length, buffer));
  }

  int getHeight() const
  {
    return height;
  }

  int getWidth() const
  {
    return width;
  }

  size_t getLength() const
  {
    return length;
  }

  val decode(std::string img_in, size_t length_)
  {
    if (buffer != NULL)
    {
      delete[] buffer;
    }

    uint8_t *result;
    struct jpeg_error_mgr jerr;
    struct jpeg_decompress_struct decompress;

    decompress.err = jpeg_std_error(&jerr);

    buffer = (uint8_t *)img_in.c_str();

    jpeg_create_decompress(&decompress);
    jpeg_mem_src(&decompress, buffer, length_);

    (void)jpeg_read_header(&decompress, TRUE);
    (void)jpeg_start_decompress(&decompress);

    width = decompress.output_width;
    height = decompress.output_height;
    channels = decompress.output_components;
    row_stride = width * channels;
    length = height * row_stride;
    result = new uint8_t[length];

    while (decompress.output_scanline < height)
    {
      uint8_t *row_pointer[1];
      row_pointer[0] = result + decompress.output_scanline * row_stride;
      jpeg_read_scanlines(&decompress, row_pointer, 1);
    }
    (void)jpeg_finish_decompress(&decompress);
    jpeg_destroy_decompress(&decompress);

    delete[] buffer;
    buffer = result;

    return val(typed_memory_view(length, buffer));
  }

  val encode(std::string img_in, size_t length_, int width_, int height_, MozJPEGOptions options)
  {
    if (buffer != NULL)
    {
      delete[] buffer;
    }

    uint8_t *result;
    JSAMPROW row_pointer[1];
    struct jpeg_error_mgr jerr;
    struct jpeg_compress_struct compress;

    compress.err = jpeg_std_error(&jerr);

    buffer = (uint8_t *)img_in.c_str();
    length = length_;
    width = width_;
    height = height_;

    jpeg_create_compress(&compress);
    jpeg_mem_dest(&compress, &result, &length);

    compress.image_width = width;
    compress.image_height = height;
    compress.input_components = channels;
    compress.in_color_space = JCS_RGB;

    jpeg_set_defaults(&compress);
    jpeg_set_colorspace(&compress, (J_COLOR_SPACE)options.color_space);

    if (options.quant_table != -1)
    {
      jpeg_c_set_int_param(&compress, JINT_BASE_QUANT_TBL_IDX, options.quant_table);
    }

    compress.optimize_coding = options.optimize_coding;

    if (options.arithmetic)
    {
      compress.arith_code = TRUE;
      compress.optimize_coding = FALSE;
    }

    compress.smoothing_factor = options.smoothing;

    jpeg_c_set_bool_param(&compress, JBOOLEAN_USE_SCANS_IN_TRELLIS, options.trellis_multipass);
    jpeg_c_set_bool_param(&compress, JBOOLEAN_TRELLIS_EOB_OPT, options.trellis_opt_zero);
    jpeg_c_set_bool_param(&compress, JBOOLEAN_TRELLIS_Q_OPT, options.trellis_opt_table);
    jpeg_c_set_int_param(&compress, JINT_TRELLIS_NUM_LOOPS, options.trellis_loops);

    std::string quality_str = std::to_string(options.quality);

    if (options.separate_chroma_quality && options.color_space == JCS_YCbCr)
    {
      quality_str += "," + std::to_string(options.chroma_quality);
    }

    char const *pqual = quality_str.c_str();

    set_quality_ratings(&compress, (char *)pqual, options.baseline);

    if (!options.auto_subsample && options.color_space == JCS_YCbCr)
    {
      compress.comp_info[0].h_samp_factor = options.chroma_subsample;
      compress.comp_info[0].v_samp_factor = options.chroma_subsample;
    }

    if (!options.baseline && options.progressive)
    {
      jpeg_simple_progression(&compress);
    }
    else
    {
      compress.num_scans = 0;
      compress.scan_info = NULL;
    }

    jpeg_start_compress(&compress, TRUE);

    while (compress.next_scanline < compress.image_height)
    {
      row_pointer[0] = &buffer[compress.next_scanline * row_stride];
      jpeg_write_scanlines(&compress, row_pointer, 1);
    }

    jpeg_finish_compress(&compress);
    jpeg_destroy_compress(&compress);

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
      .constructor<>()
      .property("buffer", &MozJPEG::getBuffer)
      .property("height", &MozJPEG::getHeight)
      .property("width", &MozJPEG::getWidth)
      .property("length", &MozJPEG::getLength)
      .function("decode", &MozJPEG::decode)
      .function("encode", &MozJPEG::encode);
}
