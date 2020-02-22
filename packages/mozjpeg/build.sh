#!/bin/bash

set -e

export OPTIMIZE="-Os"
export LDFLAGS="${OPTIMIZE}"
export CFLAGS="${OPTIMIZE}"
export CPPFLAGS="${OPTIMIZE}"

echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                  Compiling @saschazar/wasm-mozjpeg                   ====="      
echo "=====                                                                      ====="
echo "================================================================================"

test -n "$SKIP_MOZJPEG" || (
  echo "======="
  echo ""
  echo "mozjpeg"
  echo ""
  echo "======="
  apt-get update
  apt-get install -qqy autoconf libtool libpng-dev pkg-config
  cd node_modules/mozjpeg
  autoreconf -fiv
  emconfigure ./configure --without-simd
  emmake make libjpeg.la
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
    -s 'EXPORT_NAME="wasm_mozjpeg"' \
    -I node_modules/mozjpeg \
    -o ./wasm_mozjpeg.js \
    -Wno-deprecated-register \
    -Wno-writable-strings \
    node_modules/mozjpeg/rdswitch.c \
    -x c++ -std=c++11 \
    main.cpp \
    node_modules/mozjpeg/.libs/libjpeg.a
)


echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                        Successfully completed                        ====="
echo "=====                                                                      ====="
echo "================================================================================"
