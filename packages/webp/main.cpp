#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <stdexcept>
#include <stdlib.h>
#include <string.h>
#include "src/webp/decode.h"
#include "src/webp/demux.h"
#include "src/webp/encode.h"

using namespace emscripten;

uint8_t *buffer;

int width;
int height;
int channels = 3;
int row_stride;
size_t length;

struct Dimensions
{
  int width;
  int height;
  int channels;
};

void free_buffer()
{
  WebPFree(buffer);
}

val dimensions()
{
  val dim = val::object();
  dim.set("width", width);
  dim.set("height", height);
  dim.set("channels", channels);

  return dim;
}

val decode(std::string img_in, size_t _length, bool alpha)
{
  if (buffer != NULL)
  {
    free_buffer();
  }
  uint8_t *decoded;
  buffer = (uint8_t *)img_in.c_str();
  length = _length;
  channels = alpha ? 4 : 3;

  if (alpha)
  {
    decoded = WebPDecodeRGBA(buffer, length, &width, &height);
  }
  else
  {
    decoded = WebPDecodeRGB(buffer, length, &width, &height);
  }
  free_buffer();

  buffer = decoded;
  row_stride = width * channels;
  length = height * row_stride;
  return val(typed_memory_view(length, buffer));
}

val encode(std::string img_in, int _width, int _height, int _channels, WebPConfig config)
{
  if (buffer != NULL)
  {
    free_buffer();
  }

  WebPPicture webp;
  WebPMemoryWriter writer;
  int ok;

  buffer = (uint8_t *)img_in.c_str();
  channels = _channels;
  width = _width;
  height = _height;
  row_stride = width * channels;
  length = height * row_stride;

  if (!WebPValidateConfig(&config)) {
    throw std::runtime_error("WebP config is invalid!");
  }

  if (!WebPPictureInit(&webp))
  {
    throw std::runtime_error("WebP picture init failed!");
  }

  WebPMemoryWriterInit(&writer);

  webp.use_argb = config.lossless || config.use_sharp_yuv || config.preprocessing > 0;
  webp.width = width;
  webp.height = height;
  webp.writer = WebPMemoryWrite;
  webp.custom_ptr = &writer;

  ok = (channels > 3 ? WebPPictureImportRGBA(&webp, buffer, row_stride) : WebPPictureImportRGB(&webp, buffer, row_stride)) && WebPEncode(&config, &webp);
  WebPPictureFree(&webp);

  if (!ok)
  {
    WebPMemoryWriterClear(&writer);
    throw std::runtime_error("Encoding failed!");
  }
  free_buffer();

  buffer = writer.mem;
  length = writer.size;

  return val(typed_memory_view(length, buffer));
};

EMSCRIPTEN_BINDINGS(WebP)
{
  enum_<WebPImageHint>("WebPImageHint")
      .value("WEBP_HINT_DEFAULT", WebPImageHint::WEBP_HINT_DEFAULT)
      .value("WEBP_HINT_PICTURE", WebPImageHint::WEBP_HINT_PICTURE)
      .value("WEBP_HINT_PHOTO", WebPImageHint::WEBP_HINT_PHOTO)
      .value("WEBP_HINT_GRAPH", WebPImageHint::WEBP_HINT_GRAPH);

  value_object<Dimensions>("Dimensions")
      .field("width", &Dimensions::width)
      .field("height", &Dimensions::height)
      .field("channels", &Dimensions::channels);

  value_object<WebPConfig>("WebPConfig")
      .field("lossless", &WebPConfig::lossless)
      .field("quality", &WebPConfig::quality)
      .field("method", &WebPConfig::method)
      .field("image_hint", &WebPConfig::image_hint)
      .field("target_size", &WebPConfig::target_size)
      .field("target_PSNR", &WebPConfig::target_PSNR)
      .field("segments", &WebPConfig::segments)
      .field("sns_strength", &WebPConfig::sns_strength)
      .field("filter_strength", &WebPConfig::filter_strength)
      .field("filter_sharpness", &WebPConfig::filter_sharpness)
      .field("filter_type", &WebPConfig::filter_type)
      .field("autofilter", &WebPConfig::autofilter)
      .field("alpha_compression", &WebPConfig::alpha_compression)
      .field("alpha_filtering", &WebPConfig::alpha_filtering)
      .field("alpha_quality", &WebPConfig::alpha_quality)
      .field("pass", &WebPConfig::pass)
      .field("show_compressed", &WebPConfig::show_compressed)
      .field("preprocessing", &WebPConfig::preprocessing)
      .field("partitions", &WebPConfig::partitions)
      .field("partition_limit", &WebPConfig::partition_limit)
      .field("emulate_jpeg_size", &WebPConfig::emulate_jpeg_size)
      .field("thread_level", &WebPConfig::thread_level)
      .field("low_memory", &WebPConfig::low_memory)
      .field("near_lossless", &WebPConfig::near_lossless)
      .field("exact", &WebPConfig::exact)
      .field("use_delta_palette", &WebPConfig::use_delta_palette)
      .field("use_sharp_yuv", &WebPConfig::use_sharp_yuv);

  function("free", &free_buffer);
  function("dimensions", &dimensions);
  function("decode", &decode);
  function("encode", &encode);
}
