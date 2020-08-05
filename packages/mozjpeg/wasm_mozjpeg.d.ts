/* eslint-disable @typescript-eslint/camelcase */
import { MozJPEGOptions } from './options';

export enum J_COLOR_SPACE {
  JCS_UNKNOWN /* error/unspecified */,
  JCS_GRAYSCALE /* monochrome */,
  JCS_RGB /* red/green/blue as specified by the RGB_RED, RGB_GREEN, RGB_BLUE, and RGB_PIXELSIZE macros */,
  JCS_YCbCr /* Y/Cb/Cr (also known as YUV) */,
  JCS_CMYK /* C/M/Y/K */,
  JCS_YCCK /* Y/Cb/Cr/K */,
  JCS_EXT_RGB /* red/green/blue */,
  JCS_EXT_RGBX /* red/green/blue/x */,
  JCS_EXT_BGR /* blue/green/red */,
  JCS_EXT_BGRX /* blue/green/red/x */,
  JCS_EXT_XBGR /* x/blue/green/red */,
  JCS_EXT_XRGB /* x/red/green/blue */,
  JCS_EXT_RGBA /* red/green/blue/alpha */,
  JCS_EXT_BGRA /* blue/green/red/alpha */,
  JCS_EXT_ABGR /* alpha/blue/green/red */,
  JCS_EXT_ARGB /* alpha/red/green/blue */,
  JCS_RGB565 /* 5-bit red/6-bit green/5-bit blue */,
}

export interface MozJPEGModule extends EmscriptenModule {
  J_COLOR_SPACE: J_COLOR_SPACE;
  free(): void;
  encode(
    buffer: BufferSource,
    width: number,
    height: number,
    options: MozJPEGOptions
  ): BufferSource;
}

export default function (
  moduleOverrides?: Partial<MozJPEGModule>
): Promise<MozJPEGModule>;
