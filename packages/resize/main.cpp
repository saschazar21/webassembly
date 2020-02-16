#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string.h>
#include <exception>

#define STB_IMAGE_IMPLEMENTATION
#include "node_modules/stb/stb_image.h"

#define STB_IMAGE_RESIZE_IMPLEMENTATION
#include "node_modules/stb/stb_image_resize.h"

using namespace emscripten;

uint8_t *buffer;

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

val load_image(std::string img, int length, COLOR_CHANNELS desired_channels = COLOR_CHANNELS::DEFAULT)
{
  try
  {
    int width;
    int height;
    int channels;
    uint8_t *img_buffer = (uint8_t *)img.c_str();
    buffer = stbi_load_from_memory(img_buffer, length, &width, &height, &channels, (int)desired_channels);
    printf("Image with %d x %d pixels and %d channels successfully loaded.", width, height, channels);
    return val(typed_memory_view(sizeof(buffer) / sizeof(uint8_t), buffer));
  }
  catch (std::exception &e)
  {
    printf("Loading image buffer failed!");
    printf("%s", e.what());
    exit(1);
  }
};

EMSCRIPTEN_BINDINGS(resize)
{
  enum_<COLOR_CHANNELS>("COLOR_CHANNELS")
      .value("DEFAULT", COLOR_CHANNELS::DEFAULT)
      .value("GREYSCALE", COLOR_CHANNELS::GREYSCALE)
      .value("GREYSCALE_ALPHA", COLOR_CHANNELS::GREYSCALE_ALPHA)
      .value("RGB", COLOR_CHANNELS::RGB)
      .value("RGB_ALPHA", COLOR_CHANNELS::RGB_ALPHA);

  function("free_buffer", &free_buffer);
  function("load_image", &load_image);
}
