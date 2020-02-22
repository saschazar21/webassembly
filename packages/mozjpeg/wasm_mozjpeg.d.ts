/* eslint-disable @typescript-eslint/camelcase */
export enum J_COLOR_SPACE {
  JCS_UNKNOWN,            /* error/unspecified */
  JCS_GRAYSCALE,          /* monochrome */
  JCS_RGB,                /* red/green/blue as specified by the RGB_RED, RGB_GREEN, RGB_BLUE, and RGB_PIXELSIZE macros */
  JCS_YCbCr,              /* Y/Cb/Cr (also known as YUV) */
  JCS_CMYK,               /* C/M/Y/K */
  JCS_YCCK,               /* Y/Cb/Cr/K */
  JCS_EXT_RGB,            /* red/green/blue */
  JCS_EXT_RGBX,           /* red/green/blue/x */
  JCS_EXT_BGR,            /* blue/green/red */
  JCS_EXT_BGRX,           /* blue/green/red/x */
  JCS_EXT_XBGR,           /* x/blue/green/red */
  JCS_EXT_XRGB,           /* x/red/green/blue */
  JCS_EXT_RGBA,           /* red/green/blue/alpha */
  JCS_EXT_BGRA,           /* blue/green/red/alpha */
  JCS_EXT_ABGR,           /* alpha/blue/green/red */
  JCS_EXT_ARGB,           /* alpha/red/green/blue */
  JCS_RGB565              /* 5-bit red/6-bit green/5-bit blue */
}

export interface MozJPEGOptions {
  quality?: number;
  baseline?: boolean;
  arithmetic?: boolean;
  progressive?: boolean;
  optimize_coding?: boolean;
  smoothing?: number;
  color_space?: number;
  quant_table?: number;
  trellis_multipass?: boolean;
  trellis_opt_zero?: boolean;
  trellis_opt_table?: boolean;
  trellis_loops?: number;
  auto_subsample?: boolean;
  chroma_subsample?: number;
  separate_chroma_quality?: boolean;
  chroma_quality?: number;
}

export class MozJPEG {
  constructor(buffer: BufferSource, width: number, height: number);
  buffer: BufferSource;
  length: number;
  delete(): void;
  encode(options: MozJPEGOptions): BufferSource;
}

export interface MozJPEGModule extends EmscriptenModule {
  J_COLOR_SPACE: J_COLOR_SPACE;
  MozJPEG: {
    new (buffer: BufferSource, width: number, height: number): MozJPEG;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (options: { [key: string]: any }): MozJPEGModule;
