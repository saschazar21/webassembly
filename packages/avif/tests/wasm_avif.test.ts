/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';
import wasm_image_loader, { ImageLoaderModule } from '../../image-loader';
import wasm_mozjpeg, { MozJPEGModule } from '../../mozjpeg';
import wasm_avif, { AVIFModule } from '../wasm_avif';
import defaultOptions, { EncodeOptions } from '../options';
import { unsplashRequest } from './../../../utils/request';

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
    imageLoaderModule = (await wasm_image_loader({
      noInitialRun: true,
    })) as ImageLoaderModule;

    avifModule = (await wasm_avif({
      noInitialRun: true,
    })) as AVIFModule;

    mozjpegModule = (await wasm_mozjpeg({
      noInitialRun: true,
    })) as MozJPEGModule;
  });

  it('decodes an AVIF image', async () => {
    const buf = new Uint8Array(
      await fetch(AVIF_TEST_IMAGE).then((res) => res.buffer())
    );

    const { decode } = avifModule;

    const decoded = decode(buf, buf.length, false) as Uint8Array;

    expect(decoded.length).toEqual(1280 * 720 * 3);
    expect(decoded.length).toBeGreaterThan(buf.length);
  });

  it('encodes an AVIF image', async () => {
    const channels = 4;
    const options: EncodeOptions = defaultOptions;
    const [inWidth, inHeight] = [3000, 2000];
    const buf = new Uint8Array(
      await unsplashRequest({ format: 'png', width: inWidth, height: inHeight })
    );
    const { decode: jpegDecode } = imageLoaderModule;
    const { encode } = avifModule;

    const decoded = new Uint8Array(
      jpegDecode(buf, buf.length, 0) as Uint8Array
    );

    expect(decoded.length).toEqual(inWidth * inHeight * channels);
    const encoded = encode(
      decoded,
      inWidth,
      inHeight,
      channels,
      { ...options, minQuantizer: 0, maxQuantizer: 30, speed: 8 },
      3
    );
    if (Object.hasOwnProperty.call(encoded, 'error')) {
      throw new Error((encoded as { error: string }).error);
    }
    const encodedBuffer = new Uint8Array(encoded as Uint8Array);

    expect(encodedBuffer.length).toBeLessThan(buf.length);
  });
});
