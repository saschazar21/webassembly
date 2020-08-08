/* eslint-disable @typescript-eslint/camelcase */
import { MozJPEGOptions } from './options';

export enum J_COLOR_SPACE {
  JCS_UNKNOWN = 0 /* error/unspecified */,
  JCS_GRAYSCALE = 1 /* monochrome */,
  JCS_RGB = 2 /* red/green/blue as specified by the RGB_RED, RGB_GREEN, RGB_BLUE, and RGB_PIXELSIZE macros */,
  JCS_YCbCr = 3 /* Y/Cb/Cr (also known as YUV) */,
  JCS_CMYK = 4 /* C/M/Y/K */,
  JCS_YCCK = 5 /* Y/Cb/Cr/K */,
  JCS_EXT_RGB = 6 /* red/green/blue */,
  JCS_EXT_RGBX = 7 /* red/green/blue/x */,
  JCS_EXT_BGR = 8 /* blue/green/red */,
  JCS_EXT_BGRX = 9 /* blue/green/red/x */,
  JCS_EXT_XBGR = 10 /* x/blue/green/red */,
  JCS_EXT_XRGB = 11 /* x/red/green/blue */,
  JCS_EXT_RGBA = 12 /* red/green/blue/alpha */,
  JCS_EXT_BGRA = 13 /* blue/green/red/alpha */,
  JCS_EXT_ABGR = 14 /* alpha/blue/green/red */,
  JCS_EXT_ARGB = 15 /* alpha/red/green/blue */,
  JCS_RGB565 = 16 /* 5-bit red/6-bit green/5-bit blue */,
}

export interface MozJPEGModule extends EmscriptenModule {
  J_COLOR_SPACE: J_COLOR_SPACE;
  free(): void;
  encode(
    buffer: BufferSource,
    width: number,
    height: number,
    channels: number,
    options: MozJPEGOptions
  ): BufferSource;
}

export default function (
  moduleOverrides?: Partial<MozJPEGModule>
): Promise<MozJPEGModule>;
