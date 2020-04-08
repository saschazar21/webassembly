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
    imageLoaderModule.free();
    webpModule.free();
  });

  beforeAll(async () => {
    imageLoaderModule = (await new Promise(resolve => {
      const wasm = wasm_image_loader({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          resolve(other);
        },
      });
    })) as ImageLoaderModule;

    webpModule = (await new Promise(resolve => {
      const wasm = wasm_webp({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          resolve(other);
        },
      });
    })) as WebPModule;
  });

  it('encodes a .jpeg into .webp', async () => {
    const options: EncodeOptions = {
      ...defaultOptions,
      quality: 80.0,
    };
    const [inWidth, inHeight] = [3000, 2000];
    const buf = new Uint8Array(
      await fetch(`${RANDOM_URL}${inWidth}x${inHeight}`, {}).then(res =>
        res.buffer()
      )
    );
    const { decode: jpegDecode, resize } = imageLoaderModule;
    const { encode } = webpModule;

    const decoded = new Uint8Array(
      jpegDecode(buf, buf.length, 0) as Uint8Array
    );
    const resized = new Uint8Array(
      resize(
        decoded,
        inWidth,
        inHeight,
        3,
        inWidth * 0.75,
        inHeight * 0.75
      ) as Uint8Array
    );

    const output = encode(
      resized,
      inWidth * 0.75,
      inHeight * 0.75,
      options
    ) as Uint8Array;
    expect(output.length).toBeLessThan(inWidth * 0.75 * (inHeight * 0.75) * 3);
  });

  it('decodes a .webp image', async () => {
    const options: EncodeOptions = {
      ...defaultOptions,
      quality: 100.0,
    };
    const [inWidth, inHeight] = [800, 600];
    const buf = new Uint8Array(
      await fetch(`${RANDOM_URL}${inWidth}x${inHeight}`, {}).then(res =>
        res.buffer()
      )
    );
    const { decode: jpegDecode } = imageLoaderModule;
    const { dimensions, decode, encode } = webpModule;

    const decoded = new Uint8Array(
      jpegDecode(buf, buf.length, 0) as Uint8Array
    );

    const encoded = encode(decoded, inWidth, inHeight, options) as Uint8Array;
    expect(encoded.length).toBeLessThan((decoded as Uint8Array).length);

    const output = decode(encoded, encoded.length) as Uint8Array;
    expect(output).toHaveLength(inWidth * inHeight * 3);

    const dim = dimensions();
    expect(dim.width).toEqual(inWidth);
    expect(dim.height).toEqual(inHeight);
  });
});
