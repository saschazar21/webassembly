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
    mozJPEGModule.free();
  });

  beforeAll(async () => {
    mozJPEGModule = (await new Promise(resolve => {
      const wasm = wasm_mozjpeg({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          resolve(other);
        }
      });
    })) as MozJPEGModule;

    imageLoaderModule = (await new Promise(resolve => {
      const wasm = wasm_image_loader({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          resolve(other);
        }
      });
    })) as ImageLoaderModule;
  });

  it('encodes an image to .jpeg', async () => {
    jest.setTimeout(10000);
    const [inWidth, inHeight] = [6000, 4000];
    const options: MozJPEGOptions = { ...defaultOptions, quality: 75 };

    const img = new Uint8Array(
      await fetch(`${RANDOM_URL}${inWidth}x${inHeight}`, {}).then(res =>
        res.buffer()
      )
    );
    const { ImageLoader } = imageLoaderModule;
    const { encode } = mozJPEGModule;

    const loader = new ImageLoader(img, img.length, 0);
    loader.resize(inWidth * 0.25, inHeight * 0.25);
    const { buffer, width, height } = loader;
    expect(buffer).toHaveLength(width * height * 3);
    loader.delete();

    const result = encode(buffer, width, height, options) as Uint8Array;

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(img.length);
  });
});
