/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';
import wasm_image_loader, { ImageLoaderModule } from '../../image-loader';
import wasm_mozjpeg, { MozJPEGModule } from '../wasm_mozjpeg';

const RANDOM_URL = 'https://source.unsplash.com/random/';

const defaultOptions = {
  quality: 75,
  baseline: false,
  arithmetic: false,
  progressive: true,
  optimize_coding: true,
  smoothing: 0,
  color_space: 3, // J_COLOR_SPACE.JCS_YCbCr
  quant_table: 3,
  trellis_multipass: false,
  trellis_opt_zero: false,
  trellis_opt_table: false,
  trellis_loops: 1,
  auto_subsample: true,
  chroma_subsample: 2,
  separate_chroma_quality: false,
  chroma_quality: 75,
};

describe('MozJPEG', () => {
  let mozJPEGModule: MozJPEGModule;
  let imageLoaderModule: ImageLoaderModule;

  beforeAll(async () => {
    mozJPEGModule = (await new Promise((resolve) => {
      const wasm = wasm_mozjpeg({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          resolve(other);
        },
      });
    })) as MozJPEGModule;

    imageLoaderModule = (await new Promise((resolve) => {
      const wasm = wasm_image_loader({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          resolve(other);
        },
      });
    })) as ImageLoaderModule;
  });

  it('encodes an image to .jpeg', async () => {
    jest.setTimeout(10000);
    const [inWidth, inHeight] = [1280, 720];
    const options = { ...defaultOptions, quality: 50 };

    const img = new Uint8Array(
      await fetch(`${RANDOM_URL}${inWidth}x${inHeight}`, {}).then((res) =>
        res.buffer(),
      ),
    );
    const { MozJPEG } = mozJPEGModule;

    const loader = new MozJPEG();
    loader.decode(img, img.length) as Uint8Array;
    const { buffer, width, height } = loader;
    expect(buffer).toHaveLength(inWidth * inHeight * 3);
    loader.delete();

    const mozJPEG = new MozJPEG();

    const result = mozJPEG.encode(
      buffer,
      (buffer as Uint8Array).length,
      width,
      height,
      options,
    ) as Uint8Array;
    const { length } = mozJPEG;

    expect(length).toBeGreaterThan(0);
    expect(result.length).toEqual(length);
    expect(length).toBeLessThan(img.length);

    mozJPEG.delete();
  });
});
