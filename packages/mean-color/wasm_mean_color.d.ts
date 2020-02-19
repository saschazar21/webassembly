export class MeanColor {
  constructor(
    buffer: Uint8Array,
    width: number,
    height: number,
    channels: number,
  );
  delete(): void;
  getColor(): string;
}

export interface MeanColorModule extends EmscriptenModule {
  MeanColor: {
    new (
      buffer: Uint8Array,
      width: number,
      height: number,
      channels: number,
    ): MeanColor;
  };
}

export default function(options: { [key: string]: any }): MeanColorModule;
