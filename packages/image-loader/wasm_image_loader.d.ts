// eslint-disable-next-line @typescript-eslint/class-name-casing
export enum COLOR_CHANNELS {
  DEFAULT = 0,
  GREYSCALE = 1,
  GREYSCALE_ALPHA = 2,
  RGB = 3,
  RGB_ALPHA = 4
}

export class ImageLoader {
  width: number;
  height: number;
  buffer: BufferSource;
  constructor(
    buffer: BufferSource,
    width: number,
    height: number,
    channels: number
  );
  constructor(
    buffer: BufferSource,
    length: number,
    desiredChannels: COLOR_CHANNELS
  );
  resize(outputWidth: number, outputHeight: number): BufferSource;
  delete(): void;
}

export interface ImageLoaderModule extends EmscriptenModule {
  ImageLoader: {
    new (
      buffer: BufferSource,
      width: number,
      height: number,
      channels: number
    ): ImageLoader;
    new (
      buffer: BufferSource,
      length: number,
      desiredChannels: COLOR_CHANNELS
    ): ImageLoader;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function(options: { [key: string]: any }): ImageLoaderModule;
