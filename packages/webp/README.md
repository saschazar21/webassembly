[![npm](https://img.shields.io/npm/v/@saschazar/wasm-webp)](https://npmjs.org/package/@saschazar/wasm-webp)

# 📦 WebAssembly WebP decoder/encoder

> A dependency-free WebP decoder/encoder written in WebAssembly

It encodes raw RGB(A) image data in a `Uint8Array` into the WebP format and vice versa.

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
import wasm_webp from '@saschazar/wasm-webp';
import defaultOptions from '@saschazar/wasm-webp/options';

// Web Worker - see: https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts
importScripts('wasm_webp.js');

// -------- Browser/Web Worker/Node.js code below --------

// Decoding example:
// Load encoded WebP image data in Uint8Array
const array = new Uint8Array(['some', 'encoded', 'WebP', 'image', 'data']);
let result;

// Initialize the WebAssembly Module
const webpModule = wasm_webp({
  onRuntimeInitialized() {
    const alpha = true; // return RGBA Buffer, instead of RGB
    result = webpModule.encode(array, array.length, alpha); // decode image data and return a new Uint8Array
    webpModule.free(); // clean up memory after encoding is done
  },
});

// Encoding example:
// Load raw RGB image data in Uint8Array (e.g. consistently chained [R][G][B] data)
const array = new Uint8Array(['some', 'raw', 'RGB', 'image', 'data']);
const channels = 3; // 3 for RGB, 4 for RGBA
const width = 800; // the image's width
const height = 600; // the image's height
const options = defaultOptions; // WebP's options, a complete object is crucially needed!
let result;

// Initialize the WebAssembly Module
const webpModule = wasm_webp({
  onRuntimeInitialized() {
    result = webpModule.encode(array, width, height, channels, options); // encode image data and return a new Uint8Array
    webpModule.free(); // clean up memory after encoding is done
  },
});
```

### Example

A working example is available on [RunKit](https://runkit.com/saschazar21/5e8713b993ce6a00127b183b).

### Options

⚠️ It's crucial to provide a complete options object. The default options object may be imported from the `options.js` file.

## Credits

This module uses the [webmproject/libwebp](https://github.com/webmproject/libwebp)'s source code and most of the code is written according to the examples provided in that repository.

## License

Licensed under the MIT license.

Copyright ©️ 2020 [Sascha Zarhuber](https://sascha.work)
