/* eslint-disable @typescript-eslint/camelcase */
import fetch from 'node-fetch';
import wasm_exif, { ExifModule } from '../wasm_exif';

const RANDOM_URL = 'https://source.unsplash.com/random/';

describe('Exif', () => {
  let exifModule: ExifModule;

  beforeAll(async () => {
    exifModule = (await new Promise(resolve => {
      const wasm = wasm_exif({
        noInitialRun: true,
        onRuntimeInitialized() {
          const { then, ...other } = wasm;
          resolve(other);
        }
      });
    })) as ExifModule;
  });

  it('reads exif information from a .jpeg', async () => {
    const [inWidth, inHeight] = [1280, 720];
    const buffer = new Uint8Array(
      await fetch(`${RANDOM_URL}${inWidth}x${inHeight}`, {}).then(res =>
        res.buffer()
      )
    );
    const { exif } = exifModule;

    // Unsplash images don't have EXIF information included, so function should throw
    expect(() => exif(buffer, buffer.length)).toThrow();
  });
});
