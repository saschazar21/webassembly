import { EncodeOptions } from './options';

export enum AVIF_PIXEL_FORMAT {
  AVIF_PIXEL_FORMAT_NONE = 0,
  AVIF_PIXEL_FORMAT_YUV444 = 1, // default
  AVIF_PIXEL_FORMAT_YUV422 = 2,
  AVIF_PIXEL_FORMAT_YUV420 = 3,
  AVIF_PIXEL_FORMAT_YUV400 = 4,
}

export interface Dimensions {
  width: number;
  height: number;
  channels: number;
  depth: number;
}

export interface AVIFModule extends EmscriptenModule {
  AVIF_PIXEL_FORMAT: AVIF_PIXEL_FORMAT;
  free(): void;
  dimensions(): Dimensions;
  decode(
    img: BufferSource,
    length: number,
    alpha: boolean
  ): BufferSource | { error: string };
  encode(
    buffer: BufferSource,
    width: number,
    height: number,
    channels: number,
    config: EncodeOptions,
    format: AVIF_PIXEL_FORMAT
  ): BufferSource | { error: string };
}

export default function (
  moduleOverrides?: Partial<AVIFModule>
): Promise<AVIFModule>;
