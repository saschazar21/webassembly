import { EncodeOptions } from './options';

export enum WebPImageHint {
  WEBP_HINT_DEFAULT, // default preset.
  WEBP_HINT_PICTURE, // digital picture, like portrait, inner shot
  WEBP_HINT_PHOTO, // outdoor photograph, with natural lighting
  WEBP_HINT_GRAPH, // Discrete tone image (graph, map-tile etc).
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
  decode(buffer: BufferSource, length: number, alpha: boolean): BufferSource;
  encode(
    buffer: BufferSource,
    width: number,
    height: number,
    channels: number,
    config: EncodeOptions
  ): BufferSource;
}

export default function (
  moduleOverrides?: Partial<WebPModule>
): Promise<WebPModule>;
