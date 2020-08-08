/* eslint-disable @typescript-eslint/camelcase */
import wasm_image_loader, { ImageLoaderModule } from '../../image-loader';
import wasm_webp, { WebPModule } from '../wasm_webp';
import defaultOptions, { EncodeOptions } from '../options';
import { unsplashRequest } from './../../../utils/request';

describe('WebP', () => {
  let imageLoaderModule: ImageLoaderModule;
  let webpModule: WebPModule;

  afterAll(() => {
    imageLoaderModule.free();
    webpModule.free();
  });

  beforeAll(async () => {
    imageLoaderModule = (await wasm_image_loader({
      noInitialRun: true,
    })) as ImageLoaderModule;

    webpModule = (await wasm_webp({
      noInitialRun: true,
    })) as WebPModule;
  });

  it('encodes a .jpeg into .webp', async () => {
    const channels = 3;
    const options: EncodeOptions = {
      ...defaultOptions,
      quality: 80.0,
    };
    const [inWidth, inHeight] = [3000, 2000];
    const buf = new Uint8Array(
      await unsplashRequest({ format: 'jpg', width: inWidth, height: inHeight })
    );
    const { decode: jpegDecode, resize } = imageLoaderModule;
    const { encode } = webpModule;

    const decoded = new Uint8Array(
      jpegDecode(buf, buf.length, channels) as Uint8Array
    );
    const resized = new Uint8Array(
      resize(
        decoded,
        inWidth,
        inHeight,
        channels,
        inWidth * 0.75,
        inHeight * 0.75
      ) as Uint8Array
    );

    const output = encode(
      resized,
      inWidth * 0.75,
      inHeight * 0.75,
      channels,
      options
    ) as Uint8Array;
    expect(output.length).toBeLessThan(
      inWidth * 0.75 * (inHeight * 0.75) * channels
    );
  });

  it('decodes a .webp image', async () => {
    const channels = 3;
    const [inWidth, inHeight] = [800, 600];
    const buf = new Uint8Array(
      await unsplashRequest({
        format: 'webp',
        width: inWidth,
        height: inHeight,
      })
    );
    const { dimensions, decode } = webpModule;

    const output = decode(buf, buf.length, false) as Uint8Array;
    expect(output).toHaveLength(inWidth * inHeight * channels);

    const dim = dimensions();
    expect(dim.width).toEqual(inWidth);
    expect(dim.height).toEqual(inHeight);
  });

  it('decodes a .webp image containing alpha channel', async () => {
    const channels = 4;
    const [inWidth, inHeight] = [1800, 1200];
    const buf = new Uint8Array(
      await unsplashRequest({
        format: 'webp',
        width: inWidth,
        height: inHeight,
      })
    );
    const { dimensions, decode } = webpModule;

    const output = decode(buf, buf.length, true) as Uint8Array;
    expect(output).toHaveLength(inWidth * inHeight * channels);

    const dim = dimensions();
    expect(dim.width).toEqual(inWidth);
    expect(dim.height).toEqual(inHeight);
  });
});
