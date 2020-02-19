#include <emscripten/bind.h>
#include <string.h>
#include <algorithm>
#include <vector>

using namespace std;

// formulae taken from: http: //www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/

const char *BASE_16 = "0123456789ABCDEF";

class MeanColor
{
private:
  vector<uint16_t> hue;
  vector<uint8_t> saturation;
  vector<uint8_t> lightness;

  uint8_t *buffer;

  uint16_t width;
  uint16_t height;
  uint8_t channels;

  void to_hsl(uint8_t red, uint8_t green, uint8_t blue)
  {
    float r = red / 255.0;
    float g = green / 255.0;
    float b = blue / 255.0;

    uint8_t rgb[] = {red, green, blue};
    sort(rgb, rgb + 3);

    float cMin = rgb[0] / 255.0;
    float cMax = rgb[2] / 255.0;

    uint16_t h = 0;
    uint8_t s = 0;
    uint8_t l = (uint8_t)(cMax + cMin) * 50.0;

    if (cMax != cMin)
    {
      float hInterim = 0.0;
      float c = cMax - cMin;
      if (l > 50)
      {
        s = (uint8_t)(c / (2.0 - c)) * 100.0;
      }
      else
      {
        s = (uint8_t)(c / (cMax + cMin)) * 100.0;
      }

      if (rgb[2] == red)
      {
        hInterim = (g - b) / c;
      }
      else if (rgb[2] == green)
      {
        hInterim = (b - r) / c + 2.0;
      }
      else
      {
        hInterim = (r - g) / c + 4.0;
      }

      h = (uint16_t)hInterim * 60.0;
    }

    hue.push_back(h);
    saturation.push_back(s);
    lightness.push_back(l);
  }

  uint8_t hue_to_rgb(float tempC, float temp1, float temp2)
  {
    if ((tempC * 6.0) < 1.0)
    {
      return (uint8_t)(temp2 + (temp1 - temp2) * 6.0 * tempC) * 255.0;
    }
    if ((tempC * 2.0) < 1.0)
    {
      return (uint8_t)temp1 * 255.0;
    }
    if ((tempC * 3.0) < 2.0)
    {
      return (uint8_t)(temp2 + (temp1 - temp2) * (0.666 - tempC) * 6.0) * 255.0;
    }
    return (uint8_t)temp2 * 255.0;
  }

  string rgb_to_hex(uint8_t color)
  {
    uint8_t first = (uint8_t)color / 16.0;
    uint8_t second = color % 16;

    string hex;
    hex += BASE_16[first] + BASE_16[second];

    return hex;
  }

  string to_rgb(uint16_t h, uint8_t s, uint8_t l)
  {
    uint8_t r = 0;
    uint8_t g = 0;
    uint8_t b = 0;

    float hRel = 360.0 / h;
    float sRel = s * 0.01;
    float lRel = l * 0.01;

    uint8_t red = (uint8_t)lRel * 255.0;
    uint8_t green = (uint8_t)lRel * 255.0;
    uint8_t blue = (uint8_t)lRel * 255.0;

    if (s > 0)
    {
      float tempR = (hRel > 0.666) ? 1.0 - hRel + 0.333 : hRel + 0.333;
      float tempG = hRel;
      float tempB = (hRel < 0.333) ? 1.0 + hRel - 0.333 : hRel - 0.333;

      float temp1 = (s < 50) ? lRel * (1.0 + sRel) : lRel + sRel - lRel * sRel;
      float temp2 = 2 * lRel - temp1;

      red = hue_to_rgb(tempR, temp1, temp2);
      green = hue_to_rgb(tempG, temp1, temp2);
      blue = hue_to_rgb(tempB, temp1, temp2);
    }

    string hex = "#" + rgb_to_hex(red) + rgb_to_hex(green) + rgb_to_hex(blue);

    return hex;
  }

public:
  MeanColor(string img_buffer, int width_, int height_, int channels_)
  {
    buffer = (uint8_t *)img_buffer.c_str();
    width = width_;
    height = height_;
    channels = channels_;
  }

  ~MeanColor()
  {
  }

  string getColor()
  {
    for (uint32_t i = 0; i < (width * height * channels); i += channels)
    {
      uint8_t red = buffer[i];
      uint8_t green = buffer[i + 1];
      uint8_t blue = buffer[i + 2];

      to_hsl(red, green, blue);
    }

    sort(hue.begin(), hue.end());
    sort(saturation.begin(), saturation.end());
    sort(lightness.begin(), lightness.end());

    uint32_t hCenter = (uint32_t)hue.size() * 0.5;
    uint32_t sCenter = (uint32_t)saturation.size() * 0.5;
    uint32_t lCenter = (uint32_t)lightness.size() * 0.5;

    uint16_t hMedian = hue.at(hCenter);
    uint8_t sMedian = saturation.at(sCenter);
    uint8_t lMedian = lightness.at(lCenter);

    string hex = to_rgb(hMedian, sMedian, lMedian);

    return hex;
  }
};

EMSCRIPTEN_BINDINGS(MeanColor)
{

  emscripten::class_<MeanColor>("MeanColor")
      .constructor<std::string, int, int, int>()
      .function("getColor", &MeanColor::getColor);
}