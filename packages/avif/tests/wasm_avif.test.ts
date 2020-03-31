/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';
import wasm_image_loader, { ImageLoaderModule } from '../../image-loader';
import wasm_avif, { AVIFModule } from '../wasm_avif';
import defaultOptions, { EncodeOptions } from '../options';

const RANDOM_URL = 'https://source.unsplash.com/random/';

describe('AVIF', () => {
  let avifModule: AVIFModule;
  let imageLoaderModule: ImageLoaderModule;

  afterEach(() => {
    avifModule.free();
    imageLoaderModule.free();
  });

  beforeEach(async () => {
    imageLoaderModule = (await new Promise(resolve => {
      const wasm = wasm_image_loader({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          return resolve(other);
        },
      });
    })) as ImageLoaderModule;

    avifModule = (await new Promise(resolve => {
      const wasm = wasm_avif({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          return resolve(other);
        },
      });
    })) as AVIFModule;
  });

  it('encodes an AVIF image', async () => {
    jest.setTimeout(10000);
    const options: EncodeOptions = defaultOptions;
    const [inWidth, inHeight] = [3000, 2000];
    const buf = new Uint8Array(
      await fetch(`${RANDOM_URL}${inWidth}x${inHeight}`, {}).then(res =>
        res.buffer()
      )
    );
    const { decode: jpegDecode } = imageLoaderModule;
    const { encode } = avifModule;

    const decoded = new Uint8Array(
      jpegDecode(buf, buf.length, 0) as Uint8Array
    );

    const encoded = encode(decoded, inWidth, inHeight, options, 3);
    if (Object.hasOwnProperty.call(encoded, 'error')) {
      throw new Error((encoded as { error: string }).error);
    }
    const encodedBuffer = new Uint8Array(encoded as Uint8Array);

    expect(encodedBuffer.length).toBeLessThan(buf.length);
  });
});
