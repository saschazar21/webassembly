#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "node_modules/easyexif/exif.h"

using namespace emscripten;

uint8_t *buffer;
size_t length;

void free_buffer()
{
  delete[] buffer;
}

val exif(std::string img_in, size_t length_)
{
  buffer = (uint8_t *)img_in.c_str();
  length = length_;

  return val(typed_memory_view(length, buffer));
}

EMSCRIPTEN_BINDINGS(Exif)
{
  function("free", &free_buffer);
  function("exif", &exif);
}
