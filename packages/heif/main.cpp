#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "libheif/heif.h"

using namespace emscripten;

uint8_t *image;
uint32_t width;
uint32_t height;
uint32_t length;
uint8_t channels;

struct Dimensions {
  uint32_t width;
  uint32_t height;
  uint8_t channels;
};

void free_buffer() {
  if (image != NULL) {
    delete[] image;
  }
}

val dimensions() {
  val dim = val::object();
  dim.set("width", width);
  dim.set("height", height);
  dim.set("channels", channels);

  return dim;
}

const char * get_mime_type(std::string img_in, size_t len) {
  const uint8_t *buffer = (uint8_t *)img_in.c_str();
  return heif_get_file_mime_type(buffer, len);
}

val decode(std::string img_in, uint32_t len) {
  free_buffer();
  int stride;
  image = (uint8_t *) img_in.c_str();
  length = len;

  heif_filetype_result filetype_check = heif_check_filetype(image, length);
  if (filetype_check != heif_filetype_yes_supported) {
    val err_obj = val::object();
    err_obj.set("error", "File unsupported by libheif!");
    printf("ERROR: Filetype check failed: Error Code %d!\n", filetype_check);
    return err_obj;
  }
  
  heif_error err;
  heif_context *context = heif_context_alloc();
  err = heif_context_read_from_memory_without_copy(context, image, length, NULL);

  if (err.code != heif_error_Ok) {
    val err_obj = val::object();
    err_obj.set("error", err.message);
    printf("ERROR: failed to read from memory: %s\n", err.message);
    return err_obj;
  }

  heif_image_handle *handle;
  err = heif_context_get_primary_image_handle(context, &handle);

  if (err.code != heif_error_Ok) {
    val err_obj = val::object();
    err_obj.set("error", err.message);
    printf("ERROR: failed to get image handle: %s\n", err.message);
    return err_obj;
  }

  heif_image *img;
  err = heif_decode_image(handle, &img, heif_colorspace_RGB, heif_chroma_interleaved_RGB, NULL);

  if (err.code != heif_error_Ok) {
    val err_obj = val::object();
    err_obj.set("error", err.message);
    printf("ERROR: failed to decode: %s\n", err.message);
    return err_obj;
  }

  width = (uint32_t) heif_image_handle_get_width(handle);
  height = (uint32_t) heif_image_handle_get_height(handle);
  channels = (uint8_t) heif_image_handle_has_alpha_channel(handle) == 0 ? 3 : 4;

  image = heif_image_get_plane(img, heif_channel_interleaved, &stride);
  length = height * stride;

  heif_context_free(context);
  heif_image_handle_release(handle);
  heif_image_release(img);

  return val(typed_memory_view(length, image));
}

EMSCRIPTEN_BINDINGS(HEIF) {
  value_object<Dimensions>("Dimensions")
      .field("width", &Dimensions::width)
      .field("height", &Dimensions::height)
      .field("channels", &Dimensions::channels);

  function("free", &free_buffer);
  function("dimensions", &dimensions);
  function("decode", &decode);
}