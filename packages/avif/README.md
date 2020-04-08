[![npm](https://img.shields.io/npm/v/@saschazar/wasm-avif)](https://npmjs.org/package/@saschazar/wasm-avif)

# 📦 WebAssembly AVIF decoder

> A dependency-free AVIF decoder written in WebAssembly

It decodes AVIF-encoded image data in a `Uint8Array` containing raw RGB pixels.

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
importScripts('wasm_avif.js');

// -------- Browser/Web Worker/Node.js code below --------

// Load encoded AVIF image data in Uint8Array
const array = new Uint8Array(['some', 'encoded', 'AVIF', 'image', 'data']);
let result;

// Initialize the WebAssembly Module
const avifModule = wasm_avif({
  onRuntimeInitialized() {
    result = avifModule.decode(array, array.length); // decode image data and return a new Uint8Array
    avifModule.free(); // clean up memory after encoding is done
  },
});
```

### Example

A working example is available on [RunKit](https://runkit.com/saschazar21/5e8749d3492dfa001362b42c).

## Status

The main backbone of the project is the [libavif](https://github.com/AOMediaCodec/libavif) library.

Currently only AVIF decoding using [dav1d](https://github.com/videolan/dav1d) is enabled. Furthermore, only 8-bit images are getting decoded reliably.

### Help needed

Concerning the encoding functionality, a few trials have been made towards using the [libaom](https://aomedia.googlesource.com/aom) and [rav1e](https://github.com/xiph/rav1e) encoder, but none of them succeeded yet.

The latest progress is visible as commented-out code in the [build.sh](https://github.com/saschazar21/webassembly/blob/master/packages/avif/build.sh) and [main.cpp](https://github.com/saschazar21/webassembly/blob/master/packages/avif/main.cpp).

## Credits

This module uses the [AOMediaCodec/libavif](https://github.com/AOMediaCodec/libavif)'s source code and most of the code is written according to the examples provided in that repository.

## License

Licensed under the MIT license.

Copyright ©️ 2020 [Sascha Zarhuber](https://sascha.work)
