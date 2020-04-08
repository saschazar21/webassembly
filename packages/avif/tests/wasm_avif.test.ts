/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';
import wasm_image_loader, { ImageLoaderModule } from '../../image-loader';
import wasm_mozjpeg, { MozJPEGModule } from '../../mozjpeg';
import wasm_avif, { AVIFModule } from '../wasm_avif';
import defaultOptions, { EncodeOptions } from '../options';

const RANDOM_URL = 'https://source.unsplash.com/random/';
const AVIF_TEST_IMAGE =
  'https://github.com/AOMediaCodec/av1-avif/blob/master/testFiles/Microsoft/still_picture.avif?raw=true';

describe('AVIF', () => {
  let avifModule: AVIFModule;
  let imageLoaderModule: ImageLoaderModule;
  let mozjpegModule: MozJPEGModule;

  afterEach(() => {
    avifModule.free();
    imageLoaderModule.free();
    mozjpegModule.free();
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

    mozjpegModule = (await new Promise(resolve => {
      const wasm = wasm_mozjpeg({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          return resolve(other);
        },
      });
    })) as MozJPEGModule;
  });

  it('decodes an AVIF image', async () => {
    const buf = new Uint8Array(
      await fetch(AVIF_TEST_IMAGE).then(res => res.buffer())
    );

    const { decode } = avifModule;

    const decoded = decode(buf, buf.length) as Uint8Array;

    expect(decoded.length).toEqual(1280 * 720 * 3);
    expect(decoded.length).toBeGreaterThan(buf.length);
  });

  // it('encodes an AVIF image', async () => {
  //   const options: EncodeOptions = defaultOptions;
  //   const [inWidth, inHeight] = [3000, 2000];
  //   const buf = new Uint8Array(
  //     await fetch(`${RANDOM_URL}${inWidth}x${inHeight}`, {}).then(res =>
  //       res.buffer()
  //     )
  //   );
  //   const { decode: jpegDecode } = imageLoaderModule;
  //   const { encode } = avifModule;

  //   const decoded = new Uint8Array(
  //     jpegDecode(buf, buf.length, 0) as Uint8Array
  //   );

  //   expect(decoded.length).toEqual(inWidth * inHeight * 3);
  //   const encoded = encode(decoded, inWidth, inHeight, options, 1);
  //   if (Object.hasOwnProperty.call(encoded, 'error')) {
  //     throw new Error((encoded as { error: string }).error);
  //   }
  //   const encodedBuffer = new Uint8Array(encoded as Uint8Array);

  //   expect(encodedBuffer.length).toBeLessThan(buf.length);
  // });
});
