/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';

import wasm_image_loader, { ImageLoaderModule } from '../../image-loader';
import wasm_mean_color, { MeanColorModule } from '../wasm_mean_color';

const RANDOM_URL = 'https://source.unsplash.com/random/800x600';

describe('Mean Color', () => {
  let imageLoader: ImageLoaderModule;
  let meanColor: MeanColorModule;

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
    const [width, height] = [8, 6];
    const { ImageLoader } = imageLoader;
    const { MeanColor } = meanColor;

    const img = new Uint8Array(
      await fetch(RANDOM_URL, {}).then((res) => res.buffer()),
    );

    const loader = new ImageLoader(img, img.length, 0);
    loader.resize(width, height);

    expect(loader.getBuffer()).toHaveLength(width * height * 3);

    const mean = new MeanColor(
      loader.getBuffer() as Uint8Array,
      loader.getWidth(),
      loader.getHeight(),
      3,
    );
    const color = mean.getColor();

    // expect(color).toHaveLength(7);

    loader.delete();
    mean.delete();
  });
});
