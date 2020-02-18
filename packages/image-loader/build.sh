#!/bin/bash

set -e

export OPTIMIZE="-Os"
export LDFLAGS="${OPTIMIZE}"
export CFLAGS="${OPTIMIZE}"
export CPPFLAGS="${OPTIMIZE}"

TIME=

echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                Compiling @saschazar/wasm-image-loader                ====="
echo "=====                                                                      ====="
echo "================================================================================"

(
  time emcc \
    --bind \
    ${OPTIMIZE} \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s 'EXPORT_NAME="wasm_image_loader"' \
    --std=c++11 \
    -o ./wasm_image_loader.js \
    -x c++ \
    main.cpp
)


echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                        Successfully completed                        ====="
echo "=====                                                                      ====="
echo "================================================================================"
