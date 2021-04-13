[![npm](https://img.shields.io/npm/v/@saschazar/wasm-mean-color)](https://npmjs.org/package/@saschazar/wasm-mean-color)

# 📦 WebAssembly mean-color calculator

> A dependency-free mean-color calculator written in WebAssembly

It calculates the mean color from raw RGB/A image data in a `Uint8Array` and returns a hex string.

## Installation

```bash
yarn add @saschazar/wasm-mean-color
```

or

```bash
npm install --save @saschazar/wasm-mean-color
```

## Usage

It supports usage in the browser, in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) and of course Node.js.

```javascript
// Node.js
import wasm_mean_color from '@saschazar/wasm-mean-color';

// Web Worker - see: https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts
importScripts('wasm_mean_color.js');

// -------- Browser/Web Worker/Node.js code below --------

// Load raw RGB/A image data in Uint8Array (e.g. consistently chained [R][G][B] data)
const array = new Uint8Array(['some', 'raw', 'RGB', 'image', 'data']);

// Initialize the WebAssembly Module
const meanColorModule = wasm_mean_color({
  onRuntimeInitialized() {
    const channels = 3; // 3 if image has 3 color channels (RGB), 4 if image has an additional alpha channel (RGBA)
    console.log(meanColorModule.getColor(array, array.length, channels)); // returns e.g. '#FAFAFA'
  },
});
```

### Example

A working example is available on [RunKit](https://runkit.com/saschazar21/5e87484d3237810013d4ee6c).

## License

Licensed under the MIT license.

Copyright ©️ 2020—2021 [Sascha Zarhuber](https://sascha.work)
