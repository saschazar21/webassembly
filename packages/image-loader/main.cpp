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
uint8_t *buffer;

int width;
int height;
int channels;

void free_buffer()
{
  delete[] buffer;
}

val decode(std::string img_in, int length, int desired_channels)
{
  if (buffer != NULL)
  {
    free_buffer();
  }
  uint8_t *img_buffer = (uint8_t *)img_in.c_str();
  buffer = stbi_load_from_memory(img_buffer, length, &width, &height, &channels, desired_channels);

  if (buffer == NULL)
  {
    printf("Image loading failed!\n");
    exit(1);
  }

  channels = desired_channels ? desired_channels : channels;

  printf("JPEG/PNG with %d x %d pixels and %d channels successfully loaded.\n", width, height, channels);

  return val(typed_memory_view(width * height * channels, buffer));
}

val dimensions()
{
  val dim = val::object();

  dim.set("width", width);
  dim.set("height", height);
  dim.set("channels", channels);

  return dim;
}

val resize(std::string img_in, int _width, int _height, int _channels, int output_width, int output_height)
{
  if (buffer != NULL)
  {
    free_buffer();
  }
  buffer = (uint8_t *)img_in.c_str();
  width = _width;
  height = _height;
  channels = _channels;

  uint8_t stride = 0;
  uint8_t output_stride = 0;
  uint8_t *resized = new uint8_t[output_width * output_height * channels];
  if (!stbir_resize_uint8(buffer, width, height, stride, resized, output_width, output_height, output_stride, channels))
  {
    printf("Image resizing failed!\n");
    exit(1);
  }
  free_buffer();
  buffer = resized;
  width = output_width;
  height = output_height;
  return val(typed_memory_view(width * height * channels, buffer));
};

EMSCRIPTEN_BINDINGS(ImageLoader)
{
  enum_<COLOR_CHANNELS>("COLOR_CHANNELS")
      .value("DEFAULT", COLOR_CHANNELS::DEFAULT)
      .value("GREYSCALE", COLOR_CHANNELS::GREYSCALE)
      .value("GREYSCALE_ALPHA", COLOR_CHANNELS::GREYSCALE_ALPHA)
      .value("RGB", COLOR_CHANNELS::RGB)
      .value("RGB_ALPHA", COLOR_CHANNELS::RGB_ALPHA);

  function("free", &free_buffer);
  function("dimensions", &dimensions);
  function("decode", &decode);
  function("resize", &resize);
}
