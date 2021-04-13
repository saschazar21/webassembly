[![Build status](https://github.com/saschazar21/webassembly/actions/workflows/build-and-test.yml/badge.svg)
](https://github.com/saschazar21/webassembly/actions) ![Github lerna version](https://img.shields.io/github/lerna-json/v/saschazar21/webassembly)

# 📦 WebAssembly Monorepo

> A Monorepo for dependency-free WebAssembly projects. Supports browser, web worker and Node.js runtimes.

All of the listed packages below will work on their own—without any external dependencies. The only precondition is to also include the `.wasm` file into the distribution, when using a bundler like [Webpack](https://webpack.js.org/) or [Rollup](https://rollupjs.org/guide/en/), etc.

## Packages

- **[`@saschazar/wasm-avif`](https://github.com/saschazar21/webassembly/tree/master/packages/avif)** - decodes and encodes raw RGB(A) image data from/into an [AVIF](https://aomediacodec.github.io/av1-avif/)-encoded image.
- **[`@saschazar/wasm-exif`](https://github.com/saschazar21/webassembly/tree/master/packages/exif)** - reads JPEG-encoded data and returns the included EXIF as JavaScript object.
- **[`@saschazar/wasm-heif`](https://github.com/saschazar21/webassembly/tree/master/packages/heif)** - decodes a [HEIF/HEIC](http://nokiatech.github.io/heif/technical.html)-encoded image and returns raw RGB data.
- **[`@saschazar/wasm-image-loader`](https://github.com/saschazar21/webassembly/tree/master/packages/image-loader)** - decodes JPEG- & PNG-encoded image data and resizes it, if desired.
- **[`@saschazar/wasm-mean-color`](https://github.com/saschazar21/webassembly/tree/master/packages/mean-color)** - calculates the mean color from raw RGB/A image data and returns it as hex string.
- **[`@saschazar/wasm-mozjpeg`](https://github.com/saschazar21/webassembly/tree/master/packages/mozjpeg)** - encodes raw RGB image data into JPEG using the [MozJPEG](https://github.com/mozilla/mozjpeg) encoder.
- **[`@saschazar/wasm-webp`](https://github.com/saschazar21/webassembly/tree/master/packages/webp)** - decodes and encodes raw RGB(A) image data from/into the [WebP](https://github.com/webmproject/libwebp) format.

## License

Licensed under the MIT license.

Copyright ©️ 2020—2021 [Sascha Zarhuber](https://sascha.work)
