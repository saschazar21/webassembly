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
    mozJPEGModule = (await wasm_mozjpeg({
      noInitialRun: true,
    })) as MozJPEGModule;

    imageLoaderModule = (await wasm_image_loader({
      noInitialRun: true,
    })) as ImageLoaderModule;
  });

  it('encodes an image to .jpeg', async () => {
    const channels = 3;
    const [inWidth, inHeight] = [6000, 4000];
    const options: MozJPEGOptions = { ...defaultOptions, quality: 75 };

    const img = new Uint8Array(
      await fetch(`${RANDOM_URL}${inWidth}x${inHeight}`, {}).then((res) =>
        res.buffer()
      )
    );
    const { decode, resize } = imageLoaderModule;
    const { encode } = mozJPEGModule;

    const decoded = new Uint8Array(
      decode(img, img.length, channels) as Uint8Array
    );
    const resized = new Uint8Array(
      resize(
        decoded,
        inWidth,
        inHeight,
        channels,
        inWidth * 0.25,
        inHeight * 0.25
      ) as Uint8Array
    );
    expect(resized).toHaveLength(inWidth * 0.25 * (inHeight * 0.25) * channels);

    const result = encode(
      resized,
      inWidth * 0.25,
      inHeight * 0.25,
      channels,
      options
    ) as Uint8Array;

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(img.length);
  });

  it('encodes a greyscale image to greyscale .jpeg', async () => {
    const channels = 1;
    const [inWidth, inHeight] = [800, 600];
    const options: MozJPEGOptions = { ...defaultOptions, quality: 75 };

    const img = new Uint8Array(
      await fetch(`${RANDOM_URL}${inWidth}x${inHeight}`, {}).then((res) =>
        res.buffer()
      )
    );
    const { decode } = imageLoaderModule;
    const { encode } = mozJPEGModule;

    const decoded = new Uint8Array(
      decode(img, img.length, channels) as Uint8Array
    );

    const result = encode(decoded, inWidth, inHeight, channels, {
      ...options,
      in_color_space: 1,
      out_color_space: 1,
    }) as Uint8Array;

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(img.length);
  });
});
