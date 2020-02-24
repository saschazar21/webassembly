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

export interface WebPModule extends EmscriptenModule {
  WebPImageHint: WebPImageHint;
  free(): void;
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
