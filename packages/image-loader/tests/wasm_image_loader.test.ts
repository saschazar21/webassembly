/* eslint-disable @typescript-eslint/camelcase */
import wasm_image_loader, { ImageLoaderModule } from '../wasm_image_loader';
import { unsplashRequest } from './../../../utils/request';

describe('Image Loader', () => {
  let module: ImageLoaderModule;

  afterAll(() => {
    module.free();
  });

  beforeAll(async () => {
    module = (await wasm_image_loader({
      noInitialRun: true,
    })) as ImageLoaderModule;
  });

  it('exports COLOR_CHANNELS and ImageLoader', () => {
    expect(module).toHaveProperty('COLOR_CHANNELS');
    expect(module).toHaveProperty('free');
    expect(module).toHaveProperty('dimensions');
    expect(module).toHaveProperty('decode');
    expect(module).toHaveProperty('resize');
  });

  it('loads a random JPEG image', async () => {
    const channels = 3;
    const [inWidth, inHeight] = [800, 600];
    const buffer = new Uint8Array(
      await unsplashRequest({
        format: 'jpg',
        width: inWidth,
        height: inHeight,
      })
    );

    const { decode, dimensions, resize } = module;

    const result = new Uint8Array(
      decode(buffer, buffer.length, channels) as Uint8Array
    );
    const { width, height } = dimensions();

    expect(width).toEqual(inWidth);
    expect(height).toEqual(inHeight);
    expect(result).toHaveLength(inWidth * inHeight * channels);

    const resized = new Uint8Array(
      resize(
        result,
        width,
        height,
        channels,
        Math.floor(width * 0.5),
        Math.floor(height * 0.5)
      ) as Uint8Array
    );
    const { width: outWidth, height: outHeight } = dimensions();

    expect(outWidth).toEqual(400);
    expect(outHeight).toEqual(300);
    expect(resized).toHaveLength(400 * 300 * channels);
  });

  it('decodes a JPEG into a greyscale image', async () => {
    const channels = 1;
    const [inWidth, inHeight] = [800, 600];
    const buffer = new Uint8Array(
      await unsplashRequest({
        format: 'jpg',
        width: inWidth,
        height: inHeight,
      })
    );

    const { decode, dimensions } = module;

    const result = new Uint8Array(
      decode(buffer, buffer.length, channels) as Uint8Array
    );
    const { width, height } = dimensions();

    expect(width).toEqual(inWidth);
    expect(height).toEqual(inHeight);
    expect(result).toHaveLength(inWidth * inHeight * channels);
  });
});
