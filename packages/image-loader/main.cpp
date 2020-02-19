#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string.h>
#include <exception>

#define STB_IMAGE_IMPLEMENTATION
#define STBI_ONLY_JPEG
#define STBI_ONLY_PNG
#include "node_modules/stb/stb_image.h"

#define STB_IMAGE_RESIZE_IMPLEMENTATION
#include "node_modules/stb/stb_image_resize.h"

using namespace emscripten;

enum class COLOR_CHANNELS
{
  DEFAULT = 0,
  GREYSCALE = 1,
  GREYSCALE_ALPHA = 2,
  RGB = 3,
  RGB_ALPHA = 4
};

class ImageLoader
{
private:
  uint8_t *buffer;
  int width;
  int height;
  int channels;

public:
  ImageLoader(std::string raw, int _width, int _height, int _channels)
  {
    buffer = (uint8_t *)raw.c_str();
    width = _width;
    height = _height;
    channels = _channels;

    printf("Raw image with %d x %d pixels and %d channels successfully loaded.\n", width, height, channels);
  }

  ImageLoader(std::string img, int length, COLOR_CHANNELS desired_channels = COLOR_CHANNELS::DEFAULT)
  {
    uint8_t *img_buffer = (uint8_t *)img.c_str();
    buffer = stbi_load_from_memory(img_buffer, length, &width, &height, &channels, (int)desired_channels);

    if (buffer == NULL)
    {
      printf("Image loading failed!\n");
      exit(1);
    }

    printf("JPEG/PNG with %d x %d pixels and %d channels successfully loaded.\n", width, height, channels);
  }

  ~ImageLoader()
  {
    delete buffer;
  }

  val getBuffer()
  {
    return val(typed_memory_view(width * height * channels, buffer));
  }

  int getHeight()
  {
    return height;
  }

  int getWidth()
  {
    return width;
  }

  val resize(int output_width, int output_height)
  {
    uint8_t stride = 0;
    uint8_t output_stride = 0;
    uint8_t *resized = new uint8_t[width * height * channels];
    if (!stbir_resize_uint8(buffer, width, height, stride, resized, output_width, output_height, output_stride, channels))
    {
      printf("Image resizing failed!\n");
      exit(1);
    }
    delete buffer;
    buffer = resized;
    width = output_width;
    height = output_height;
    return val(typed_memory_view(width * height * channels, buffer));
  }
};

EMSCRIPTEN_BINDINGS(ImageLoader)
{
  enum_<COLOR_CHANNELS>("COLOR_CHANNELS")
      .value("DEFAULT", COLOR_CHANNELS::DEFAULT)
      .value("GREYSCALE", COLOR_CHANNELS::GREYSCALE)
      .value("GREYSCALE_ALPHA", COLOR_CHANNELS::GREYSCALE_ALPHA)
      .value("RGB", COLOR_CHANNELS::RGB)
      .value("RGB_ALPHA", COLOR_CHANNELS::RGB_ALPHA);

  class_<ImageLoader>("ImageLoader")
      .constructor<std::string, int, int, int>()
      .constructor<std::string, int, COLOR_CHANNELS>()
      .function("getBuffer", &ImageLoader::getBuffer)
      .function("getHeight", &ImageLoader::getHeight)
      .function("getWidth", &ImageLoader::getWidth)
      .function("resize", &ImageLoader::resize);
}
