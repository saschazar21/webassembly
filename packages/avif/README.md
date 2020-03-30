[![npm](https://img.shields.io/npm/v/@saschazar/wasm-avif)](https://npmjs.org/package/@saschazar/wasm-avif)

# 📦 WebAssembly AVIF decoder/encoder

> A dependency-free AVIF decoder/encoder written in WebAssembly

It encodes raw RGB image data in a `Uint8Array` into the AVIF format and vice versa.

## Installation

```bash
yarn add @saschazar/wasm-avif
```

or

```bash
npm install --save @saschazar/wasm-avif
```

## Usage

It supports usage in the browser, in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) and of course Node.js.

```javascript
// Node.js
import wasm_avif from '@saschazar/wasm-avif';

// Web Worker - see: https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts
importScripts('wasm_webp.js');

// -------- Browser/Web Worker/Node.js code below --------

// Load raw RGB image data in Uint8Array (e.g. consistently chained [R][G][B] data)
const array = new Uint8Array(['some', 'raw', 'RGB', 'image', 'data']);
const width = 800; // the image's width
const height = 600; // the image's height
const options = {}; // WebP's options
let result;

// Initialize the WebAssembly Module
const avifModule = wasm_avif({
  onRuntimeInitialized() {
    result = avifModule.encode(array, width, height, options); // encode image data and return a new Uint8Array
    avifModule.free(); // clean up memory after encoding is done
  },
});
```

### Options

It's crucial to provide a full options object, to gain the best possible outcome. The default options object may be imported from the `options.js` file.

## Credits

This module uses the [AOMediaCodec/libavif](https://github.com/AOMediaCodec/libavif)'s source code and most of the code is written according to the examples provided in that repository.

Furthermore, [AOM's AV1 Codec](https://aomedia.googlesource.com/aom/) is enabled at each `libavif` build.

## License

Licensed under the MIT license.

Copyright ©️ 2020 [Sascha Zarhuber](https://sascha.work)
