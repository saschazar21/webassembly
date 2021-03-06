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
    heifModule = (await wasm_heif({
      noInitialRun: true,
    })) as HEIFModule;
  });

  it('decodes a HEIF image into 3 channels', async () => {
    const alpha = false;
    const buf = new Uint8Array(
      await fetch(HEIF_TEST_IMAGE).then((res) => res.buffer())
    );

    const { decode, dimensions } = heifModule;

    const decoded = decode(buf, buf.length, alpha);
    expect(decoded).not.toHaveProperty('error');

    const { channels, height, width } = dimensions();
    expect(channels).toEqual(alpha ? 4 : 3);
    expect(width).toEqual(HEIF_TEST_IMAGE_WIDTH);
    expect(height).toEqual(HEIF_TEST_IMAGE_HEIGHT);

    expect(decoded).toHaveLength(width * height * channels);
  });

  it.skip('decodes a HEIF image into 4 channels', async () => {
    const alpha = true;
    const buf = new Uint8Array(
      await fetch(HEIF_TEST_IMAGE).then((res) => res.buffer())
    );

    const { decode, dimensions } = heifModule;

    const decoded = decode(buf, buf.length, alpha);
    expect(decoded).not.toHaveProperty('error');

    const { channels, height, width } = dimensions();
    expect(channels).toEqual(alpha ? 4 : 3);
    expect(width).toEqual(HEIF_TEST_IMAGE_WIDTH);
    expect(height).toEqual(HEIF_TEST_IMAGE_HEIGHT);

    expect(decoded).toHaveLength(width * height * channels);
  });
});
