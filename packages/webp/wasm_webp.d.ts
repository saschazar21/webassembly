import { EncodeOptions } from './options';

export enum WebPImageHint {
  WEBP_HINT_DEFAULT, // default preset.
  WEBP_HINT_PICTURE, // digital picture, like portrait, inner shot
  WEBP_HINT_PHOTO, // outdoor photograph, with natural lighting
  WEBP_HINT_GRAPH // Discrete tone image (graph, map-tile etc).
}

export interface Dimensions {
  width: number;
  height: number;
  channels: number;
}

export interface WebPModule extends EmscriptenModule {
  WebPImageHint: WebPImageHint;
  free(): void;
  dimensions(): Dimensions;
  decode(buffer: BufferSource, length: number): BufferSource;
  encode(
    buffer: BufferSource,
    width: number,
    height: number,
    config: EncodeOptions
  ): BufferSource;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function(options: { [key: string]: any }): WebPModule;
