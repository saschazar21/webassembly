#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <stdexcept>
#include <stdlib.h>
#include <string.h>
#include "src/webp/decode.h"
#include "src/webp/demux.h"
#include "src/webp/encode.h"

using namespace emscripten;

class WebP
{
private:
  uint8_t *buffer;

  int length;
  int width;
  int height;
  int channels;

public:
  WebP(std::string img_in, int width_, int height_)
  {
    buffer = (uint8_t *)img_in.c_str();
    width = width_;
    height = height_;
    length = width * height;
    channels = 3;
  }

  WebP(std::string img_in, int length_)
  {
    buffer = (uint8_t *)img_in.c_str();
    length = length_;
  }

  ~WebP()
  {
    WebPFree(buffer);
  }

  val getBuffer() const
  {
    return val(typed_memory_view(length || width * height * channels, buffer));
  }

  int getChannels() const
  {
    return channels;
  }

  int getHeight() const
  {
    return height;
  }

  int getWidth() const
  {
    return width;
  }

  val decode()
  {
    uint8_t *decoded = WebPDecodeRGB(buffer, length, &width, &height);
    channels = 3;
    WebPFree(buffer);
    buffer = decoded;
    return val(typed_memory_view(width * height * channels, buffer));
  }

  val encode(WebPConfig config)
  {
    WebPPicture webp;
    WebPMemoryWriter writer;
    int ok;
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

    ok = WebPPictureImportRGB(&webp, buffer, width * channels) && WebPEncode(&config, &webp);
    WebPPictureFree(&webp);

    if (!ok)
    {
      WebPMemoryWriterClear(&writer);
      throw std::runtime_error("Encoding failed!");
    }

    buffer = writer.mem;

    return val(typed_memory_view(writer.size, writer.mem));
  }
};

EMSCRIPTEN_BINDINGS(WebP)
{
  enum_<WebPImageHint>("WebPImageHint")
      .value("WEBP_HINT_DEFAULT", WebPImageHint::WEBP_HINT_DEFAULT)
      .value("WEBP_HINT_PICTURE", WebPImageHint::WEBP_HINT_PICTURE)
      .value("WEBP_HINT_PHOTO", WebPImageHint::WEBP_HINT_PHOTO)
      .value("WEBP_HINT_GRAPH", WebPImageHint::WEBP_HINT_GRAPH);

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

  class_<WebP>("WebP")
      .constructor<std::string, int, int>()
      .constructor<std::string, int>()
      .property("buffer", &WebP::getBuffer)
      .property("channels", &WebP::getChannels)
      .property("height", &WebP::getHeight)
      .property("width", &WebP::getWidth)
      .function("decode", &WebP::decode)
      .function("encode", &WebP::encode);
}