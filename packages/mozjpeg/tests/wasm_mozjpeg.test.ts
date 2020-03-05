/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';
import wasm_image_loader, { ImageLoaderModule } from '../../image-loader';
import wasm_mozjpeg, { MozJPEGModule } from '../wasm_mozjpeg';
import defaultOptions, { MozJPEGOptions } from '../options';

const RANDOM_URL = 'https://source.unsplash.com/random/';

describe('MozJPEG', () => {
  let mozJPEGModule: MozJPEGModule;
  let imageLoaderModule: ImageLoaderModule;

  afterAll(() => {
    imageLoaderModule.free();
    mozJPEGModule.free();
  });

  beforeAll(async () => {
    mozJPEGModule = (await new Promise((resolve) => {
      const wasm = wasm_mozjpeg({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          resolve(other);
        },
      });
    })) as MozJPEGModule;

    imageLoaderModule = (await new Promise((resolve) => {
      const wasm = wasm_image_loader({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          resolve(other);
        },
      });
    })) as ImageLoaderModule;
  });

  it('encodes an image to .jpeg', async () => {
    jest.setTimeout(10000);
    const [inWidth, inHeight] = [6000, 4000];
    const options: MozJPEGOptions = { ...defaultOptions, quality: 75 };

    const img = new Uint8Array(
      await fetch(`${RANDOM_URL}${inWidth}x${inHeight}`, {}).then((res) =>
        res.buffer(),
      ),
    );
    const { decode, resize } = imageLoaderModule;
    const { encode } = mozJPEGModule;

    const decoded = new Uint8Array(decode(img, img.length, 0) as Uint8Array);
    const resized = new Uint8Array(
      resize(
        decoded,
        inWidth,
        inHeight,
        3,
        inWidth * 0.25,
        inHeight * 0.25,
      ) as Uint8Array,
    );
    expect(resized).toHaveLength(inWidth * 0.25 * (inHeight * 0.25) * 3);

    const result = encode(
      resized,
      inWidth * 0.25,
      inHeight * 0.25,
      options,
    ) as Uint8Array;

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(img.length);
  });
});
