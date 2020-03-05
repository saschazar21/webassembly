/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';

import wasm_image_loader, { ImageLoaderModule } from '../wasm_image_loader';

const RANDOM_URL = 'https://source.unsplash.com/random/800x600';

describe('Image Loader', () => {
  let module: ImageLoaderModule;

  afterAll(() => {
    module.free();
  });

  beforeAll(async () => {
    module = (await new Promise((resolve) => {
      const wasm = wasm_image_loader({
        noInitialRun: true,
        onRuntimeInitialized: () => {
          const { then, ...other } = wasm;
          return resolve(other);
        },
      });
    })) as ImageLoaderModule;
  });

  it('exports COLOR_CHANNELS and ImageLoader', () => {
    expect(module).toHaveProperty('COLOR_CHANNELS');
    expect(module).toHaveProperty('free');
    expect(module).toHaveProperty('dimensions');
    expect(module).toHaveProperty('decode');
    expect(module).toHaveProperty('resize');
  });

  it('loads a random JPEG image', async () => {
    const buffer = new Uint8Array(
      await fetch(RANDOM_URL, {}).then((res) => res.buffer()),
    );

    const { decode, dimensions, resize } = module;

    const result = new Uint8Array(
      decode(buffer, buffer.length, 0) as Uint8Array,
    );
    const { width, height } = dimensions();

    expect(width).toEqual(800);
    expect(height).toEqual(600);
    expect(result).toHaveLength(800 * 600 * 3);

    const resized = new Uint8Array(
      resize(
        result,
        width,
        height,
        3,
        Math.floor(width * 0.5),
        Math.floor(height * 0.5),
      ) as Uint8Array,
    );
    const { width: outWidth, height: outHeight } = dimensions();

    expect(outWidth).toEqual(400);
    expect(outHeight).toEqual(300);
    expect(resized).toHaveLength(400 * 300 * 3);
  });
});
