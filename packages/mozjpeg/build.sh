#!/bin/bash

set -e

export OPTIMIZE="-Oz"
export LDFLAGS="${OPTIMIZE}"
export CFLAGS="${OPTIMIZE}"
export CPPFLAGS="${OPTIMIZE}"

export CMAKE_TOOLCHAIN_FILE=/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake

export MOZJPEG_SRC="${PWD}/node_modules/mozjpeg"

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
  
  cd $MOZJPEG_SRC
  emcmake cmake $MOZJPEG_SRC \
    -DENABLE_SHARED=false \
    -DPNG_SUPPORTED=false \
    -DWITH_SIMD=false \
    -DCMAKE_TOOLCHAIN_FILE=$CMAKE_TOOLCHAIN_FILE
  
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
    -s 'EXPORT_NAME="wasm_mozjpeg"' \
    -I node_modules/mozjpeg \
    -o ./wasm_mozjpeg.js \
    -Wno-deprecated-register \
    -Wno-writable-strings \
    node_modules/mozjpeg/rdswitch.c \
    -x c++ -std=c++11 \
    main.cpp \
    ${MOZJPEG_SRC}/libjpeg.a
)


echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                        Successfully completed                        ====="
echo "=====                                                                      ====="
echo "================================================================================"
