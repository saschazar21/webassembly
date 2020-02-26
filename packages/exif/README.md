[![npm](https://img.shields.io/npm/v/@saschazar/wasm-exif)](https://npmjs.org/package/@saschazar/wasm-exif)

# 📦 WebAssembly EXIF reader

> A dependency-free EXIF reader written in WebAssembly

It just needs valid JPEG/TIFF data in a `Uint8Array` to output EXIF information, if any is included in the source file.

## Installation

```bash
yarn add @saschazar/wasm-exif
```

or

```bash
npm install --save @saschazar/wasm-exif
```

## Usage

It supports usage in the browser, in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) and of course Node.js.

```javascript
// Node.js
import wasm_exif from '@saschazar/wasm-exif';

// Web Worker - see: https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts
importScripts('wasm_exif.js');

// -------- Browser/Web Worker/Node.js code below --------

// Load an image into a buffer using the Fetch API
const buffer = fetch('some JPEG with EXIF data').then(res => res.buffer());

// Initialize the WebAssembly Module
const exifModule = wasm_exif({
  onRuntimeInitialized() {
    // Let the Fetch Promise fulfill
    buffer()
      .then(result => new Uint8Array(result)) // Convert to a Uint8Array
      .then(array => exifModule.exif(array, array.length)) // Read EXIF
      .then(console.log); // Print result to console.log
  }
});
```

## Credits

This package uses [mayanklahiri/easyexif](https://github.com/mayanklahiri/easyexif)'s source code and lots of the emscripten setup code was copied from [tuananh/easyexif](https://github.com/tuananh/easy-exif).

## License

Licensed under the MIT license.

Copyright ©️ 2020 [Sascha Zarhuber](https://sascha.work)
