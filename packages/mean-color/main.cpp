#include <emscripten/bind.h>
#include <cmath>
#include <string.h>
#include <algorithm>
#include <vector>

using namespace std;

// formulae taken from: http: //www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/

string BASE_16 = "0123456789ABCDEF";

vector<uint16_t> hue;
vector<uint8_t> saturation;
vector<uint8_t> lightness;

uint8_t *buffer;

size_t length;
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
  uint8_t l = static_cast<uint8_t>(round((cMax + cMin) * 50.0));
  float sRel = 0;

  if (cMax != cMin)
  {
    float hInterim = 0.0;
    float c = cMax - cMin;

    if (rgb[2] == red)
    {
      hInterim = (g - b) / c;
      sRel = c / r;
    }
    else if (rgb[2] == green)
    {
      hInterim = (b - r) / c + 2.0;
      sRel = c / g;
    }
    else
    {
      hInterim = (r - g) / c + 4.0;
      sRel = c / b;
    }
    float hAbs = (hInterim < 0.0) ? 360.0 - (hInterim * 60.0) : hInterim * 60.0;
    h = static_cast<uint16_t>(round(hAbs)) % 360;
  }
  uint8_t s = static_cast<uint8_t>(round(sRel * 100));

  hue.push_back(h);
  saturation.push_back(s);
  lightness.push_back(l);
}

uint8_t hue_to_rgb(float tempC, float temp1, float temp2)
{
  if ((tempC * 6.0) < 1.0)
  {
    return static_cast<uint8_t>(round((temp2 + (temp1 - temp2) * 6.0 * tempC) * 255.0));
  }
  if ((tempC * 2.0) < 1.0)
  {
    return static_cast<uint8_t>(round(temp1 * 255.0));
  }
  if ((tempC * 3.0) < 2.0)
  {
    return static_cast<uint8_t>(round((temp2 + (temp1 - temp2) * (0.666 - tempC) * 6.0) * 255.0));
  }
  return static_cast<uint8_t>(round(temp2 * 255.0));
}

string rgb_to_hex(uint8_t color)
{
  uint8_t first = static_cast<uint8_t>(floor(color / 16.0));
  uint8_t second = color % 16;

  string hex = BASE_16.substr(first, 1) + BASE_16.substr(second, 1);

  return hex;
}

string to_rgb(uint16_t h, uint8_t s, uint8_t l)
{
  uint8_t r = 0;
  uint8_t g = 0;
  uint8_t b = 0;

  float hRel = h / 360.0;
  float sRel = s * 0.01;
  float lRel = l * 0.01;

  uint8_t red = static_cast<uint8_t>(round(lRel * 255.0));
  uint8_t green = static_cast<uint8_t>(round(lRel * 255.0));
  uint8_t blue = static_cast<uint8_t>(round(lRel * 255.0));

  if (static_cast<uint8_t>(round(s * 100.0)) > 0)
  {
    float tempR = (hRel > 0.666) ? 1.0 - hRel + 0.333 : hRel + 0.333;
    float tempG = hRel;
    float tempB = (hRel < 0.333) ? 1.0 + hRel - 0.333 : hRel - 0.333;

    float temp1 = (sRel < 50) ? lRel * (1.0 + sRel) : lRel + sRel - lRel * sRel;
    float temp2 = 2 * lRel - temp1;

    red = hue_to_rgb(tempR, temp1, temp2);
    green = hue_to_rgb(tempG, temp1, temp2);
    blue = hue_to_rgb(tempB, temp1, temp2);
  }

  printf("RGB: %d, %d, %d\n", red, green, blue);

  string hex = "#" + rgb_to_hex(red) + rgb_to_hex(green) + rgb_to_hex(blue);

  return hex;
}

string getColor(string img_buffer, size_t length_, int channels_)
{
  buffer = (uint8_t *)img_buffer.c_str();
  length = length_;
  channels = channels_;

  for (uint32_t i = 0; i < length; i += channels)
  {
    uint8_t red = buffer[i];
    uint8_t green = buffer[i + 1];
    uint8_t blue = buffer[i + 2];

    to_hsl(red, green, blue);
  }

  sort(hue.begin(), hue.end());
  sort(saturation.begin(), saturation.end());
  sort(lightness.begin(), lightness.end());

  uint32_t hCenter = static_cast<uint32_t>(floor((hue.size() - 1) * 0.5));
  uint32_t sCenter = static_cast<uint32_t>(floor((saturation.size() - 1) * 0.5));
  uint32_t lCenter = static_cast<uint32_t>(floor((lightness.size() - 1) * 0.5));

  uint16_t hMedian = hue.at(hCenter);
  uint8_t sMedian = saturation.at(sCenter);
  uint8_t lMedian = lightness.at(lCenter);

  printf("HSL: (%d°, %d%%, %d%%)\n", hMedian, sMedian, lMedian);

  string hex = to_rgb(hMedian, sMedian, lMedian);

  return hex;
}

EMSCRIPTEN_BINDINGS(MeanColor)
{
  emscripten::function("getColor", &getColor);
}