/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';
import wasm_image_loader, { ImageLoaderModule } from '../../image-loader';
import wasm_webp, { EncodeOptions, WebPModule } from '../wasm_webp';

const RANDOM_URL = 'https://source.unsplash.com/random/';

const defaultOptions: EncodeOptions = {
  quality: 75,
  target_size: 0,
  target_PSNR: 0,
  method: 4,
  sns_strength: 50,
  filter_strength: 60,
  filter_sharpness: 0,
  filter_type: 1,
  partitions: 0,
  segments: 4,
  pass: 1,
  show_compressed: 0,
  preprocessing: 0,
  autofilter: 0,
  partition_limit: 0,
  alpha_compression: 1,
  alpha_filtering: 1,
  alpha_quality: 100,
  lossless: 0,
  exact: 0,
  image_hint: 0,
  emulate_jpeg_size: 0,
  thread_level: 0,
  low_memory: 0,
  near_lossless: 100,
  use_delta_palette: 0,
  use_sharp_yuv: 0
};

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
    const options = {
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
    const options = {
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
