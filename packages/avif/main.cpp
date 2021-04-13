#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "avif/avif.h"

using namespace emscripten;

uint8_t *pixels;
uint32_t len;
uint32_t width;
uint32_t height;
uint32_t depth = 8;
uint8_t channels;

struct Dimensions
{
  uint32_t width;
  uint32_t height;
  uint32_t depth;
  uint8_t channels;
};

void free_buffer()
{
  if (pixels != NULL)
  {
    delete[] pixels;
  }
}

val dimensions()
{
  val dim = val::object();
  dim.set("width", width);
  dim.set("height", height);
  dim.set("channels", channels);
  dim.set("depth", depth);

  return dim;
}

val decode(std::string img, uint32_t _len, bool alpha)
{
  free_buffer();
  pixels = (uint8_t *)img.c_str();

  avifROData raw;
  raw.data = pixels;
  raw.size = _len;

  avifDecoder *decoder = avifDecoderCreate();
  avifResult decodeResult = avifDecoderSetIOMemory(decoder, raw.data, raw.size);
  if (decodeResult != AVIF_RESULT_OK)
  {
    val obj = val::object();
    obj.set("error", avifResultToString(decodeResult));
    printf("ERROR: Cannot set IO on decoder: %s\n", avifResultToString(decodeResult));
    return obj;
  }
  
  decodeResult = avifDecoderParse(decoder);
  if (decodeResult != AVIF_RESULT_OK)
  {
    val obj = val::object();
    obj.set("error", avifResultToString(decodeResult));
    printf("ERROR: Failed to decode: %s\n", avifResultToString(decodeResult));
    return obj;
  }

  avifResult nextImage = avifDecoderNextImage(decoder);
  if (nextImage != AVIF_RESULT_OK)
  {
    val obj = val::object();
    obj.set("error", avifResultToString(nextImage));
    printf("ERROR: Failed to decode: %s\n", avifResultToString(nextImage));
    return obj;
  }

  width = decoder->image->width;
  height = decoder->image->height;
  depth = decoder->image->depth;

  avifRGBImage rgb;
  avifRGBImageSetDefaults(&rgb, decoder->image);
  rgb.format = alpha ? AVIF_RGB_FORMAT_RGBA : AVIF_RGB_FORMAT_RGB;
  rgb.depth = 8;

  channels = (uint8_t)avifRGBFormatChannelCount(rgb.format);

  avifRGBImageAllocatePixels(&rgb);
  avifImageYUVToRGB(decoder->image, &rgb);

  free_buffer();
  avifDecoderDestroy(decoder);
  pixels = rgb.pixels;
  len = width * height * channels;

  return val(typed_memory_view(len, pixels));
}

val encode(std::string img, uint32_t _width, uint32_t _height, uint8_t _channels, avifEncoder config, uint8_t format)
{
  free_buffer();
  channels = _channels;
  width = _width;
  height = _height;
  pixels = (uint8_t *)img.c_str();

  avifImage *image = avifImageCreate(width, height, depth, (avifPixelFormat)format);

  image->colorPrimaries = AVIF_COLOR_PRIMARIES_BT709;
  image->transferCharacteristics = AVIF_TRANSFER_CHARACTERISTICS_BT709;
  image->matrixCoefficients = AVIF_MATRIX_COEFFICIENTS_BT709;
  image->yuvRange = AVIF_RANGE_FULL;

  avifRGBImage rgb;
  avifRGBImageSetDefaults(&rgb, image);

  rgb.chromaUpsampling = AVIF_CHROMA_UPSAMPLING_AUTOMATIC;
  rgb.format = channels > 3 ? AVIF_RGB_FORMAT_RGBA : AVIF_RGB_FORMAT_RGB;
  rgb.pixels = pixels;
  rgb.rowBytes = width * avifRGBImagePixelSize(&rgb);
  rgb.ignoreAlpha = channels > 3 ? false : true;

  avifResult convertedToYUV = avifImageRGBToYUV(image, &rgb);

  if (convertedToYUV != AVIF_RESULT_OK)
  {
    val obj = val::object();
    obj.set("error", avifResultToString(convertedToYUV));
    printf("ERROR: Failed to convert to YUV: %s\n", avifResultToString(convertedToYUV));
    return obj;
  }

  avifRWData output = AVIF_DATA_EMPTY;

  avifEncoder *encoder = avifEncoderCreate();
  encoder->codecChoice = AVIF_CODEC_CHOICE_AOM;
  encoder->maxThreads = 1;
  encoder->minQuantizer = config.minQuantizer ? config.minQuantizer : AVIF_QUANTIZER_LOSSLESS;
  encoder->maxQuantizer = config.maxQuantizer ? config.maxQuantizer : AVIF_QUANTIZER_LOSSLESS;
  encoder->minQuantizerAlpha = config.minQuantizerAlpha ? config.minQuantizerAlpha : AVIF_QUANTIZER_LOSSLESS;
  encoder->maxQuantizerAlpha = config.maxQuantizerAlpha ? config.maxQuantizerAlpha : AVIF_QUANTIZER_LOSSLESS;
  encoder->tileRowsLog2 = config.tileRowsLog2 ? config.tileRowsLog2 : 0;
  encoder->tileColsLog2 = config.tileColsLog2 ? config.tileColsLog2 : 0;
  encoder->speed = config.speed < AVIF_SPEED_FASTEST ? config.speed : AVIF_SPEED_FASTEST;

  avifResult addImageResult = avifEncoderAddImage(encoder, image, 1, AVIF_ADD_IMAGE_FLAG_SINGLE);
  if (addImageResult != AVIF_RESULT_OK) {
    val obj = val::object();
    obj.set("error", avifResultToString(addImageResult));
    fprintf(stderr, "ERROR: Failed to add image to encoder: %s\n", avifResultToString(addImageResult));
    return obj;
  }

  avifResult finishResult = avifEncoderFinish(encoder, &output);
  if (finishResult != AVIF_RESULT_OK) {
    val obj = val::object();
    obj.set("error", avifResultToString(finishResult));
    fprintf(stderr, "ERROR: Failed to finish encode: %s\n", avifResultToString(finishResult));
    return obj;
  }

  free_buffer();
  avifEncoderDestroy(encoder);
  avifImageDestroy(image);
  pixels = output.data;
  len = output.size;
  return val(typed_memory_view(len, pixels));
}

EMSCRIPTEN_BINDINGS(AVIF)
{
  enum_<avifPixelFormat>("AVIF_PIXEL_FORMAT")
      .value("AVIF_PIXEL_FORMAT_NONE", avifPixelFormat::AVIF_PIXEL_FORMAT_NONE)
      .value("AVIF_PIXEL_FORMAT_YUV444", avifPixelFormat::AVIF_PIXEL_FORMAT_YUV444)
      .value("AVIF_PIXEL_FORMAT_YUV422", avifPixelFormat::AVIF_PIXEL_FORMAT_YUV422)
      .value("AVIF_PIXEL_FORMAT_YUV420", avifPixelFormat::AVIF_PIXEL_FORMAT_YUV420)
      .value("AVIF_PIXEL_FORMAT_YUV400", avifPixelFormat::AVIF_PIXEL_FORMAT_YUV400);

  value_object<avifEncoder>("EncodeOptions")
      .field("minQuantizer", &avifEncoder::minQuantizer)
      .field("maxQuantizer", &avifEncoder::maxQuantizer)
      .field("minQuantizerAlpha", &avifEncoder::minQuantizerAlpha)
      .field("maxQuantizerAlpha", &avifEncoder::maxQuantizerAlpha)
      .field("tileRowsLog2", &avifEncoder::tileRowsLog2)
      .field("tileColsLog2", &avifEncoder::tileColsLog2)
      .field("speed", &avifEncoder::speed);

  value_object<Dimensions>("Dimensions")
      .field("width", &Dimensions::width)
      .field("height", &Dimensions::height)
      .field("channels", &Dimensions::channels)
      .field("depth", &Dimensions::depth);

  function("free", &free_buffer);
  function("dimensions", &dimensions);
  function("decode", &decode);
  function("encode", &encode);
}
