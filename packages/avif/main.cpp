#include <emscripten/bind.h>

using namespace emscripten;

uint8_t *image;

void free_buffer()
{
  if (image != NULL)
  {
    delete[] image;
  }
}

EMSCRIPTEN_BINDINGS(AVIF)
{
  function("free", &free_buffer);
}