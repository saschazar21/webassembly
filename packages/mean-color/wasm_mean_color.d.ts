export interface MeanColorModule extends EmscriptenModule {
  free(): void;
  getColor(buffer: BufferSource, length: number, channels: number): string;
}

export default function(options: { [key: string]: any }): MeanColorModule;
