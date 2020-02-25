export interface MeanColorModule extends EmscriptenModule {
  getColor(buffer: BufferSource, length: number, channels: number): string;
}

export default function(options: { [key: string]: any }): MeanColorModule;
