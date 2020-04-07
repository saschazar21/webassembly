export interface Dimensions {
  width: number;
  height: number;
  channels: number;
}

export interface HEIFModule extends EmscriptenModule {
  free(): void;
  dimensions(): Dimensions;
  decode(img: BufferSource, length: number): BufferSource | { error: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function(options: { [key: string]: any }): HEIFModule;