[![npm](https://img.shields.io/npm/v/@saschazar/wasm-heif)](https://npmjs.org/package/@saschazar/wasm-heif)

# 📦 WebAssembly HEIF decoder

> A dependency-free HEIF decoder written in WebAssembly

It decodes HEIF-encoded image data in a `Uint8Array` containing raw RGB pixels.

## Installation

```bash
yarn add @saschazar/wasm-heif
```

or

```bash
npm install --save @saschazar/wasm-heif
```

## Usage

It supports usage in the browser, in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) and of course Node.js.

```javascript
// Node.js
import wasm_heif from '@saschazar/wasm-heif';

// Web Worker - see: https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts
importScripts('wasm_heif.js');

// -------- Browser/Web Worker/Node.js code below --------

// Load encoded HEIF image data in Uint8Array
const array = new Uint8Array(['some', 'encoded', 'heif', 'image', 'data']);
let result;

// Initialize the WebAssembly Module
const heifModule = wasm_heif({
  onRuntimeInitialized() {
    const alpha = false; // RGBA somehow not yet working ¯\_(ツ)_/¯
    result = heifModule.decode(array, array.length, alpha); // decode image data and return a new Uint8Array
    heifModule.free(); // clean up memory after encoding is done
  },
});
```

### ⚠️ Support

Although [libheif](https://github.com/strukturag/libheif) provides support for decoding HEIF images into an RGBA buffer, none of the respective tests has succeeded yet. Therefore, it is crucial to compare the `channels` property of the object returned from the `dimensions()` function, when `alpha` was set to true in the `decode()` function.

Not all HEIF/HEIC-encoded images seem to be supported, as there have occurred failures while attempting to decode sample images from the [nokiatech/heif](https://github.com/nokiatech/heif/tree/gh-pages/content/images) repository.

However, images encoded on [Cloudinary](https://cloudinary.com) and/or fetched as HEIF/HEIC using the [`fetch_format`](https://cloudinary.com/documentation/image_transformation_reference#fetch_format_parameter) parameter seem to work well.

## Status

The main backbone of the project is the [libheif](https://github.com/strukturag/libheif) library.

Currently only HEIF decoding using [libde265](https://github.com/strukturag/libde265) is enabled.

### Help needed

Concerning the encoding functionality, a few trials have been made towards using the [x265](https://github.com/videolan/x265) encoder, but as of now, there doesn't seem to be a possibility for compiling it in an Emscripten-compatible way.

## Credits

This module uses the [strukturag/libheif](https://github.com/strukturag/libheif)'s source code and most of the code is written according to the examples provided in that repository.

## License

Licensed under the MIT license.

Copyright ©️ 2020 [Sascha Zarhuber](https://sascha.work)
