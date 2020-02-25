#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "node_modules/easyexif/exif.h"

using namespace emscripten;

val exif(std::string img_in, size_t length)
{
  uint8_t *buffer = (uint8_t *)img_in.c_str();

  easyexif::EXIFInfo result;
  val info = val::object();

  if (!result.parseFrom(buffer, length))
  {
    info.set("make", result.Make.c_str());
    info.set("model", result.Model.c_str());
    info.set("software", result.Software.c_str());
    info.set("bitsPerSample", result.BitsPerSample);
    info.set("imageWidth", result.ImageWidth);
    info.set("imageHeight", result.ImageHeight);
    info.set("imageDescription", result.ImageDescription.c_str());
    info.set("orientation", result.Orientation);
    info.set("copyright", result.Copyright.c_str());
    info.set("dateTime", result.DateTime.c_str());
    info.set("dateTimeOriginal", result.DateTimeOriginal.c_str());
    info.set("dateTimeDigitized", result.DateTimeDigitized.c_str());
    info.set("subSecTimeOriginal", result.SubSecTimeOriginal.c_str());
    info.set("exposureTime", result.ExposureTime);
    info.set("fStop", result.FNumber);
    info.set("exposureProgram", result.ExposureProgram);
    info.set("isoSpeedRatings", result.ISOSpeedRatings);
    info.set("exposureProgram", result.ExposureProgram);
    info.set("subjectDistance", result.SubjectDistance);
    info.set("exposureBiasValue", result.ExposureBiasValue);
    info.set("flash", result.Flash);
    info.set("flashReturnedLight", result.FlashReturnedLight);
    info.set("flashMode", result.FlashMode);
    info.set("meteringMode", result.MeteringMode);
    info.set("focalLength", result.FocalLength);
    info.set("focalLengthIn35mm", result.FocalLengthIn35mm);

    val geo = val::object();
    geo.set("latitude", result.GeoLocation.Latitude);
    geo.set("latDegrees", result.GeoLocation.LatComponents.degrees);
    geo.set("latMinutes", result.GeoLocation.LatComponents.minutes);
    geo.set("latSeconds", result.GeoLocation.LatComponents.seconds);
    geo.set("latDirection", result.GeoLocation.LatComponents.direction);

    geo.set("longitude", result.GeoLocation.Longitude);
    geo.set("lonDegrees", result.GeoLocation.LonComponents.degrees);
    geo.set("lonMinutes", result.GeoLocation.LonComponents.minutes);
    geo.set("lonSeconds", result.GeoLocation.LonComponents.seconds);
    geo.set("lonDirection", result.GeoLocation.LonComponents.direction);

    geo.set("altitude", result.GeoLocation.Altitude);
    geo.set("precisionDOP", result.GeoLocation.DOP);
    info.set("geoLocation", geo);

    val lens_info = val::object();
    lens_info.set("focalLengthMin", result.LensInfo.FocalLengthMin);
    lens_info.set("focalLengthMax", result.LensInfo.FocalLengthMax);
    lens_info.set("fStopMin", result.LensInfo.FStopMin);
    lens_info.set("fStopMax", result.LensInfo.FStopMax);
    lens_info.set("lensMake", result.LensInfo.Make.c_str());
    lens_info.set("lensModel", result.LensInfo.Model.c_str());
    lens_info.set("focalPlaneXResolution", result.LensInfo.FocalPlaneXResolution);
    lens_info.set("focalPlaneYResolution", result.LensInfo.FocalPlaneYResolution);
    info.set("lensInfo", lens_info);
  }

  return info;
}

EMSCRIPTEN_BINDINGS(Exif)
{
  function("exif", &exif);
}
