# 📦 WebAssembly WebP decoder/encoder

> A dependency-free WebP decoder/encoder written in WebAssembly

It encodes raw RGBA image data in a `Uint8Array` into the WebP format and vice versa.

## Installation

```bash
yarn add @saschazar/wasm-webp
```

or

```bash
npm install --save @saschazar/wasm-webp
```

## Usage

It supports usage in the browser, in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) and of course Node.js.

```javascript
// Node.js
import wasm_mean_color from '@saschazar/wasm-webp';

// Web Worker - see: https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts
importScripts('wasm_webp.js');

// -------- Browser/Web Worker/Node.js code below --------

// Load raw RGB image data in Uint8Array (e.g. consistently chained [R][G][B] data)
const array = new Uint8Array(['some', 'raw', 'RGB', 'image', 'data']);
const width = 800;  // the image's width
const height = 600; // the image's height
const options = {}; // MozJPEG's options
let result;

// Initialize the WebAssembly Module
const webpModule = wasm_webp({
  onRuntimeInitialized() {
    result = webpModule.encode(array, width, height, options); // encode image data and return a new Uint8Array
    webpModule.free(); // clean up memory after encoding is done
  }
});
```

### Options

It's crucial to provide a full options object, to gain the best possible outcome. The default options object may be imported from the `options.js` file.

## Credits

This module uses the [webmproject/libwebp](https://github.com/webmproject/libwebp)'s source code and most of the code is written according to the examples provided in that repository.

## License

Licensed under the MIT license.

Copyright ©️ 2020 [Sascha Zarhuber](https://sascha.work)
