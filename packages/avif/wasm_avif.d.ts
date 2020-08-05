import { EncodeOptions } from './options';

export enum AVIF_PIXEL_FORMAT {
  AVIF_PIXEL_FORMAT_NONE,
  AVIF_PIXEL_FORMAT_YUV444, // default
  AVIF_PIXEL_FORMAT_YUV422,
  AVIF_PIXEL_FORMAT_YUV420,
  AVIF_PIXEL_FORMAT_YUV400,
}

export interface Dimensions {
  width: number;
  height: number;
  channels: number;
  depth: number;
}

export interface AVIFModule {
  AVIF_PIXEL_FORMAT: AVIF_PIXEL_FORMAT;
  free(): void;
  dimensions(): Dimensions;
  decode(img: BufferSource, length: number): BufferSource | { error: string };
  encode(
    buffer: BufferSource,
    width: number,
    height: number,
    config: EncodeOptions,
    format: AVIF_PIXEL_FORMAT
  ): BufferSource | { error: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (options: { [key: string]: any }): AVIFModule;
