export interface MeanColorModule extends EmscriptenModule {
  getColor(buffer: BufferSource, length: number, channels: number): string;
}

export default function (
  moduleOverrides?: Partial<MeanColorModule>
): Promise<MeanColorModule>;
