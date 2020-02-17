#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string.h>
#include <exception>

#define STB_IMAGE_IMPLEMENTATION
#define STBI_ONLY_JPEG
#define STBI_ONLY_PNG
#include "node_modules/stb/stb_image.h"

static void progress(float progress_percentage)
{
  printf("Resize progress: %f%%\n", progress_percentage * 100);
}
#define STBIR_PROGRESS_REPORT(progress_percentage) progress(progress_percentage)

#define STB_IMAGE_RESIZE_IMPLEMENTATION
#include "node_modules/stb/stb_image_resize.h"

using namespace emscripten;

uint8_t *buffer;
int width;
int height;
int channels;

#ifdef __cplusplus
extern "C"
{
#endif

  void free_buffer()
  {
    free(buffer);
  };

#ifdef __cplusplus
}
#endif

enum class COLOR_CHANNELS
{
  DEFAULT = 0,
  GREYSCALE = 1,
  GREYSCALE_ALPHA = 2,
  RGB = 3,
  RGB_ALPHA = 4
};

val load(std::string img, int length, COLOR_CHANNELS desired_channels = COLOR_CHANNELS::DEFAULT)
{
  if (buffer != NULL)
  {
    free_buffer();
  }
  uint8_t *img_buffer = (uint8_t *)img.c_str();
  buffer = stbi_load_from_memory(img_buffer, length, &width, &height, &channels, (int)desired_channels);

  if (buffer == NULL)
  {
    printf("Image loading failed!\n");
    exit(1);
  }

  printf("Image with %d x %d pixels and %d channels successfully loaded.", width, height, channels);
  return val(typed_memory_view(sizeof(buffer) / sizeof(uint8_t), buffer));
};

val resize(int output_width, int output_height)
{
  uint8_t stride = 0;
  uint8_t output_stride = 0;
  uint8_t *resized = (uint8_t *)malloc(width * height * channels);
  if (!stbir_resize_uint8(buffer, width, height, stride, resized, output_width, output_height, output_stride, channels))
  {
    printf("Image resizing failed!\n");
    exit(1);
  }
  free_buffer();
  buffer = resized;
  return val(typed_memory_view(sizeof(buffer) / sizeof(uint8_t), buffer));
}

EMSCRIPTEN_BINDINGS(resize)
{
  enum_<COLOR_CHANNELS>("COLOR_CHANNELS")
      .value("DEFAULT", COLOR_CHANNELS::DEFAULT)
      .value("GREYSCALE", COLOR_CHANNELS::GREYSCALE)
      .value("GREYSCALE_ALPHA", COLOR_CHANNELS::GREYSCALE_ALPHA)
      .value("RGB", COLOR_CHANNELS::RGB)
      .value("RGB_ALPHA", COLOR_CHANNELS::RGB_ALPHA);

  function("free_buffer", &free_buffer);
  function("load", &load);
  function("resize", &resize);
}
