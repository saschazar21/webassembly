// eslint-disable-next-line @typescript-eslint/class-name-casing
export enum COLOR_CHANNELS {
  DEFAULT = 0,
  GREYSCALE = 1,
  GREYSCALE_ALPHA = 2,
  RGB = 3,
  RGB_ALPHA = 4,
}

export interface ImageDimensions {
  width: number;
  height: number;
  channels: number;
}

export interface ImageLoaderModule extends EmscriptenModule {
  COLOR_CHANNELS: COLOR_CHANNELS;
  free(): void;
  dimensions(): ImageDimensions;
  decode(
    buffer: BufferSource,
    length: number,
    desiredChannels: COLOR_CHANNELS
  ): BufferSource;
  resize(
    buffer: BufferSource,
    width: number,
    height: number,
    channels: number,
    outputWidth: number,
    outputHeight: number
  ): BufferSource;
}

export default function (
  moduleOverrides?: Partial<ImageLoaderModule>
): Promise<ImageLoaderModule>;
