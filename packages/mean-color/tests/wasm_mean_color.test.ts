/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';

import wasm_image_loader, { ImageLoaderModule } from '../../image-loader';
import wasm_mean_color, { MeanColorModule } from '../wasm_mean_color';

const RANDOM_URL = 'https://source.unsplash.com/random/800x600';

describe('Mean Color', () => {
  let imageLoader: ImageLoaderModule;
  let meanColor: MeanColorModule;

  afterAll(() => {
    imageLoader.free();
  });

  beforeAll(async () => {
    imageLoader = (await new Promise((resolve) => {
      const wasm = wasm_image_loader({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          resolve(other);
        },
      });
    })) as ImageLoaderModule;

    meanColor = (await new Promise((resolve) => {
      const wasm = wasm_mean_color({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          resolve(other);
        },
      });
    })) as MeanColorModule;
  });

  it('calculates the mean color of an image', async () => {
    const [width, height] = [80, 60];
    const { decode, resize } = imageLoader;

    const img = new Uint8Array(
      await fetch(RANDOM_URL, {}).then((res) => {
        console.log(res.url);
        return res.buffer();
      }),
    );

    const decoded = new Uint8Array(decode(img, img.length, 0) as Uint8Array);
    const buffer = new Uint8Array(
      resize(decoded, 800, 600, 3, width, height) as Uint8Array,
    );
    expect(buffer).toHaveLength(width * height * 3);

    const mean = meanColor.getColor(buffer, (buffer as Uint8Array).length, 3);

    expect(mean).toHaveLength(7);
  });
});
