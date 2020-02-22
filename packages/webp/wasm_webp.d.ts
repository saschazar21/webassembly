export enum WebPImageHint {
  WEBP_HINT_DEFAULT, // default preset.
  WEBP_HINT_PICTURE, // digital picture, like portrait, inner shot
  WEBP_HINT_PHOTO, // outdoor photograph, with natural lighting
  WEBP_HINT_GRAPH // Discrete tone image (graph, map-tile etc).
}

export interface EncodeOptions {
  quality?: number;
  target_size?: number;
  target_PSNR?: number;
  method?: number;
  sns_strength?: number;
  filter_strength?: number;
  filter_sharpness?: number;
  filter_type?: number;
  partitions?: number;
  segments?: number;
  pass?: number;
  show_compressed?: number;
  preprocessing?: number;
  autofilter?: number;
  partition_limit?: number;
  alpha_compression?: number;
  alpha_filtering?: number;
  alpha_quality?: number;
  lossless?: number;
  exact?: number;
  image_hint?: number;
  emulate_jpeg_size?: number;
  thread_level?: number;
  low_memory?: number;
  near_lossless?: number;
  use_delta_palette?: number;
  use_sharp_yuv?: number;
}

export class WebP {
  buffer: BufferSource;
  width: number;
  height: number;
  channels: number;
  constructor(buffer: BufferSource, width: number, height: number);
  constructor(buffer: BufferSource, length: number);
  delete(): void;
  decode(): BufferSource;
  // eslint-disable-next-line @typescript-eslint/camelcase
  encode_without_options(quality: number): BufferSource;
  encode(config: EncodeOptions): BufferSource;
}

export interface WebPModule extends EmscriptenModule {
  WebPImageHint: WebPImageHint;
  WebP: {
    new (buffer: BufferSource, width: number, height: number): WebP;
    new (buffer: BufferSource, length: number): WebP;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function(options: { [key: string]: any }): WebPModule;
