#!/bin/bash

set -e

export OPTIMIZE="-Oz"
export LDFLAGS="${OPTIMIZE}"
export CFLAGS="${OPTIMIZE}"
export CPPFLAGS="${OPTIMIZE}"

echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                    Compiling @saschazar/wasm-webp                    ====="      
echo "=====                                                                      ====="
echo "================================================================================"

test -n "$SKIP_LIBWEBP" || (
  echo "======="
  echo ""
  echo "libwebp"
  echo ""
  echo "======="
  apt-get update
  apt-get install -qqy autoconf libtool libpng-dev pkg-config
  cd node_modules/libwebp
  autoreconf -fiv
  rm -rf build || true
  mkdir -p build && cd build
  emconfigure ../configure \
    --disable-libwebpdemux \
    --disable-wic \
    --disable-gif \
    --disable-tiff \
    --disable-jpeg \
    --disable-png \
    --disable-sdl \
    --disable-gl \
    --disable-threading \
    --disable-neon-rtcd \
    --disable-neon \
    --disable-sse2 \
    --disable-sse4.1
  emmake make -j$(nproc)
)

echo "======="
echo ""
echo "wasm"
echo ""
echo "======="

(
  time emcc \
    --bind \
    ${OPTIMIZE} \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s 'EXPORT_NAME="wasm_webp"' \
    -I node_modules/libwebp \
    --std=c++11 \
    -o ./wasm_webp.js \
    -x c++ \
    main.cpp \
    node_modules/libwebp/build/src/.libs/libwebp.a
)


echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                        Successfully completed                        ====="
echo "=====                                                                      ====="
echo "================================================================================"
