/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';
import wasm_heif, { HEIFModule } from '../wasm_heif';

const HEIF_TEST_IMAGE =
  'https://res.cloudinary.com/demo/image/fetch/f_heic/https://source.unsplash.com/random/1440x960';
const HEIF_TEST_IMAGE_WIDTH = 1440;
const HEIF_TEST_IMAGE_HEIGHT = 960;

describe('HEIF', () => {
  let heifModule: HEIFModule;

  afterEach(() => {
    heifModule.free();
  });

  beforeEach(async () => {
    heifModule = (await new Promise(resolve => {
      const wasm = wasm_heif({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm as any;
          return resolve(other);
        }
      });
    })) as HEIFModule;
  });

  it('decodes a HEIF image', async () => {
    const buf = new Uint8Array(
      await fetch(HEIF_TEST_IMAGE).then(res => res.buffer())
    );

    const { decode, dimensions } = heifModule;

    const decoded = decode(buf, buf.length);
    expect(decoded).not.toHaveProperty('error');

    const { channels, height, width } = dimensions();
    expect(width).toEqual(HEIF_TEST_IMAGE_WIDTH);
    expect(height).toEqual(HEIF_TEST_IMAGE_HEIGHT);

    expect(decoded).toHaveLength(width * height * channels);
  });
});
