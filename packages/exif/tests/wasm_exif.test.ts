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

    const e = exif(buffer, buffer.length);

    expect(e).toBeTruthy();
  });

  it('reads exif from local file', async () => {
    const buffer = new Uint8Array(
      await import('fs').then(fs =>
        fs.readFileSync('/Users/zasa/Downloads/_DSC1312.jpg')
      )
    );
    const { exif } = exifModule;

    const e = exif(buffer, buffer.length);
    console.log(e);

    expect(e).toBeTruthy();
  });
});
