#!/bin/bash

set -e

export OPTIMIZE="-Os"
export LDFLAGS="${OPTIMIZE}"
export CFLAGS="${OPTIMIZE}"
export CPPFLAGS="${OPTIMIZE}"

TIME=

echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                   Compiling @saschazar/wasm-resize                   ====="
echo "=====                                                                      ====="
echo "================================================================================"

(
  time emcc \
    --bind \
    ${OPTIMIZE} \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s 'EXPORT_NAME="wasm_resize"' \
    --std=c++11 \
    -o ./wasm_resize.js \
    -x c++ \
    main.cpp
)


echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                   Successfully completed compiling                   ====="
echo "=====                                                                      ====="
echo "================================================================================"
