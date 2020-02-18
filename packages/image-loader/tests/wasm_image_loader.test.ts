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
    expect(loader.getWidth()).toEqual(16);

    loader.delete();
  });

  it('loads a random JPEG image', async () => {
    const buffer = new Uint8Array(
      await fetch(RANDOM_URL, {}).then(res => res.buffer())
    );

    const { ImageLoader } = module;

    const loader = new ImageLoader(buffer, buffer.length, 0);

    expect(loader.getWidth()).toEqual(800);
    expect(loader.getHeight()).toEqual(600);

    console.log(loader.getBuffer());
    console.log(loader.resize(400, 300));
    console.log(loader.getBuffer());

    loader.delete();
  });
});
