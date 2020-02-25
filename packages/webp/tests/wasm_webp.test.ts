/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';
import wasm_image_loader, { ImageLoaderModule } from '../../image-loader';
import wasm_webp, { WebPModule } from '../wasm_webp';
import defaultOptions, { EncodeOptions } from '../options';

const RANDOM_URL = 'https://source.unsplash.com/random/';

describe('WebP', () => {
  let imageLoaderModule: ImageLoaderModule;
  let webpModule: WebPModule;

  afterAll(() => {
    webpModule.free();
  });

  beforeAll(async () => {
    imageLoaderModule = (await new Promise(resolve => {
      const wasm = wasm_image_loader({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          resolve(other);
        }
      });
    })) as ImageLoaderModule;

    webpModule = (await new Promise(resolve => {
      const wasm = wasm_webp({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          resolve(other);
        }
      });
    })) as WebPModule;
  });

  it('encodes a .jpeg into .webp', async () => {
    jest.setTimeout(10000);
    const options: EncodeOptions = {
      ...defaultOptions,
      quality: 80.0
    };
    const [inWidth, inHeight] = [3000, 2000];
    const buf = new Uint8Array(
      await fetch(`${RANDOM_URL}${inWidth}x${inHeight}`, {}).then(res =>
        res.buffer()
      )
    );
    const { ImageLoader } = imageLoaderModule;
    const { encode } = webpModule;

    const loader = new ImageLoader(buf, buf.length, 0);
    loader.resize(inWidth * 0.75, inHeight * 0.75);
    const { buffer, width, height } = loader;
    loader.delete();

    const output = encode(buffer, width, height, options) as Uint8Array;
    expect(output.length).toBeLessThan(width * height * 3);
  });

  it('decodes a .webp image', async () => {
    const options: EncodeOptions = {
      ...defaultOptions,
      quality: 100.0
    };
    const [inWidth, inHeight] = [800, 600];
    const buf = new Uint8Array(
      await fetch(`${RANDOM_URL}${inWidth}x${inHeight}`, {}).then(res =>
        res.buffer()
      )
    );
    const { ImageLoader } = imageLoaderModule;
    const { decode, encode } = webpModule;

    const loader = new ImageLoader(buf, buf.length, 0);
    const { buffer, width, height } = loader;
    loader.delete();

    const encoded = encode(buffer, width, height, options) as Uint8Array;
    expect(encoded.length).toBeLessThan((buffer as Uint8Array).length);

    const output = decode(encoded, encoded.length) as Uint8Array;
    expect(output).toHaveLength(width * height * 3);
  });
});
