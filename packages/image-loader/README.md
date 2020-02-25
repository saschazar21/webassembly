# 📦 WebAssembly image loader/resizer

> A dependency-free image loader/resizer written in WebAssembly

It works primarily as JPEG/PNG decoder, but might as well load 'raw' images from a `Uint8Array` to resize them to a desired width/height.

## Installation

```bash
yarn add @saschazar/wasm-image-loader
```

or

```bash
npm install --save @saschazar/wasm-image-loader
```

## Usage

It supports usage in the browser, in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) and of course Node.js.

```javascript
// Node.js
import wasm_image_loader from '@saschazar/wasm-image-loader';

// Web Worker - see: https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts
importScripts('wasm_image_loader.js');

// -------- Browser/Web Worker/Node.js code below --------

// Load an image into a buffer using the Fetch API
const buffer = fetch('some JPEG or PNG').then(res => res.buffer());

// Initialize the WebAssembly Module
const imageLoaderModule = new Promise(resolve => {
  const wasm = wasm_image_loader({
    onRuntimeInitialized() {
      // remove the 'then' property from wasm_image_loader,
      // otherwise Promise runs into an endless loop.
      const { then, ...other } = wasm;
      // let Promise resolve with 'other' properties.
      resolve(other);
    }
  });
});

async function loadImage() {
  // store image buffer in Uint8Array
  const array = new Uint8Array(await buffer());
  const channels = 3; // 3 if RGB, 4 if Alpha channel is present (e.g. PNG)

  // let imageLoaderModule Promise resolve
  const { ImageLoader } = await imageLoaderModule;

  const loader = new ImageLoader(array, array.length, channels);
  loader.resize(800, 600);
  console.log(loader.buffer); // logs the uncompressed 800x600 RGB Uint8Array

  // cleans up memory, when loader is not needed anymore
  loader.delete();
}
```

## Credits

This package uses [nothings/stb](https://github.com/nothings/stb)'s source code (`stb_image.h` and `stb_image_resize.h` in particular).

## License

Licensed under the MIT license.

Copyright ©️ 2020 [Sascha Zarhuber](https://sascha.work)
