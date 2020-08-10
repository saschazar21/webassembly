[![npm](https://img.shields.io/npm/v/@saschazar/wasm-avif)](https://npmjs.org/package/@saschazar/wasm-avif)

# 📦 WebAssembly AVIF decoder/encoder

> A dependency-free AVIF decoder/encoder written in WebAssembly

It encodes raw RGB(A) pixels in a `Uint8Array` into [AVIF-encoded image data](https://netflixtechblog.com/avif-for-next-generation-image-coding-b1d75675fe4) and vice versa.

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
import defaultOptions from '@saschazar/wasm-avif/options';

// Web Worker - see: https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts
importScripts('wasm_avif.js');

// -------- Browser/Web Worker/Node.js code below --------

// Decoding example:
// Load encoded AVIF image data in Uint8Array
const array = new Uint8Array(['some', 'encoded', 'AVIF', 'image', 'data']);
let result;

// Initialize the WebAssembly Module
const avifModule = wasm_avif({
  onRuntimeInitialized() {
    const alpha = true; // return RGBA buffer, instead of RGB
    result = avifModule.decode(array, array.length, alpha); // decode image data and return a new Uint8Array
    avifModule.free(); // clean up memory after encoding is done
  },
});

// Encoding example:
// Load raw RGB(A) pixels in Uint8Array
const array = new Uint8Array(['some', 'raw', 'RGB', 'image', 'data']);
const width = 800;
const height = 600;
let result;

// Initialize the WebAssembly Module
const avifModule = wasm_avif({
  onRuntimeInitialized() {
    const channels = 4; // 4 representing RGBA buffer in source array, 3 RGB
    const chroma = 3; // chroma subsampling: 1 for 4:4:4, 2 for 4:2:2, 3 for 4:2:0
    result = avifModule.encode(
      array,
      width,
      height,
      channels,
      defaultOptions,
      chroma
    ); // encode image data and return a new Uint8Array
    avifModule.free(); // clean up memory after encoding is done
  },
});
```

### Example

A working example is available on [RunKit](https://runkit.com/saschazar21/5e8749d3492dfa001362b42c).

## Status

The main backbone of the project is the [libavif](https://github.com/AOMediaCodec/libavif) library.

Both decoding and encoding is done via the [AOM AV1 codec](https://aomedia.googlesource.com/aom/). Encoding is still very slow, since helpers such as multithreading and/or runtime CPU detection have to be disabled in order to successfully compile to WebAssembly.

### Help needed

Concerning the encoding functionality, a few trials have been made towards using the more performant [rav1e](https://github.com/xiph/rav1e) encoder, but it constantly fails during linking.

As soon as encoding is done via `rav1e`, decoding could be switched back to [dav1d](https://github.com/videolan/dav1d) again.

## Credits

This module uses the [AOMediaCodec/libavif](https://github.com/AOMediaCodec/libavif)'s source code and most of the code is written according to the examples provided in that repository.

## License

Licensed under the MIT license.

Copyright ©️ 2020 [Sascha Zarhuber](https://sascha.work)
