/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';

import wasm_image_loader, { ImageLoaderModule } from '../wasm_image_loader';

const RANDOM_URL = 'https://source.unsplash.com/random/800x600';

describe('Image Loader', () => {
  let module: ImageLoaderModule;

  beforeAll(async () => {
    module = (await new Promise(resolve => {
      const wasm = wasm_image_loader({
        noInitialRun: true,
        onRuntimeInitialized: () => {
          const { then, ...other } = wasm;
          return resolve(other);
        }
      });
    })) as ImageLoaderModule;
  });

  it('exports COLOR_CHANNELS and ImageLoader', () => {
    expect(module).toHaveProperty('COLOR_CHANNELS');
    expect(module).toHaveProperty('ImageLoader');
  });

  it('lets instantiate an ImageLoader class', () => {
    const { ImageLoader } = module;
    const buffer = new Uint8Array(16 * 16 * 3);

    const loader = new ImageLoader(buffer, 16, 16, 3);
    expect(loader.width).toEqual(16);

    loader.delete();
  });

  it('loads a random JPEG image', async () => {
    const buffer = new Uint8Array(
      await fetch(RANDOM_URL, {}).then(res => res.buffer())
    );

    const { ImageLoader } = module;

    const loader = new ImageLoader(buffer, buffer.length, 0);

    expect(loader.width).toEqual(800);
    expect(loader.height).toEqual(600);
    expect(loader.buffer).toHaveLength(800 * 600 * 3);

    loader.resize(
      Math.floor(loader.width * 0.5),
      Math.floor(loader.height * 0.5)
    ) as Uint8Array;

    expect(loader.width).toEqual(400);
    expect(loader.height).toEqual(300);
    expect(loader.buffer).toHaveLength(400 * 300 * 3);

    loader.delete();
  });
});
