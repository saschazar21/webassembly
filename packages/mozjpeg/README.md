[![npm](https://img.shields.io/npm/v/@saschazar/wasm-mozjpeg)](https://npmjs.org/package/@saschazar/wasm-mozjpeg)

# 📦 WebAssembly MozJPEG encoder

> A dependency-free MozJPEG encoder written in WebAssembly

It encodes raw RGB(A) image data in a `Uint8Array` into the JPEG format.

## Installation

```bash
yarn add @saschazar/wasm-mozjpeg
```

or

```bash
npm install --save @saschazar/wasm-mozjpeg
```

## Usage

It supports usage in the browser, in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) and of course Node.js.

```javascript
// Node.js
import wasm_mozjpeg from '@saschazar/wasm-mozjpeg';
import defaultOptions from '@saschazar/wasm-mozjpeg/options';

// Web Worker - see: https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts
importScripts('wasm_mozjpeg.js');

// -------- Browser/Web Worker/Node.js code below --------

// Load raw RGB image data in Uint8Array (e.g. consistently chained [R][G][B] data)
const array = new Uint8Array(['some', 'raw', 'RGB', 'image', 'data']);
const channels = 3; // 3 for RGB, 4 for RGBA (must adapt options.in_color_space!)
const width = 800; // the image's width
const height = 600; // the image's height
const options = defaultOptions; // MozJPEG's options, complete object crucially needed!
options.in_color_space = 6; // 6 for RGB, 12 for RGBA, see J_COLOR_SPACE in wasm_mozjpeg.d.ts
let result;

// Initialize the WebAssembly Module
const mozjpegModule = wasm_mozjpeg({
  onRuntimeInitialized() {
    result = mozjpegModule.encode(array, width, height, channels, options); // encode image data and return a new Uint8Array
    mozjpegModule.free(); // clean up memory after encoding is done
  },
});
```

### Example

A working example is available on [RunKit](https://runkit.com/saschazar21/5e8746e3c924510013db78f4).

### Options

⚠️ It's crucial to provide a full options object. The default options object may be imported from the `options.js` file.

Also take a close look at the `in_color_space` property, if an image Buffer containing an alpha channel is provided! (e.g. RGBA data from `<canvas />`). The `J_COLOR_SPACE` enum in `wasm_mozjpeg.d.ts` contains all the valid numeric values for the respective `in_color_space` and `out_color_space` properties.

## Credits

This module uses the [mozilla/mozjpeg](https://github.com/mozilla/mozjpeg)'s source code and most of the code is written according to the examples provided in that repository.

## License

Licensed under the MIT license.

Copyright ©️ 2020—2021 [Sascha Zarhuber](https://sascha.work)
