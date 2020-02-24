#!/bin/bash

set -e

export OPTIMIZE="-Oz"
export LDFLAGS="${OPTIMIZE}"
export CFLAGS="${OPTIMIZE}"
export CPPFLAGS="${OPTIMIZE}"

echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                 Compiling @saschazar/wasm-mean-color                 ====="
echo "=====                                                                      ====="
echo "================================================================================"

(
  time emcc \
    --bind \
    ${OPTIMIZE} \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s 'EXPORT_NAME="wasm_mean_color"' \
    --std=c++11 \
    -o ./wasm_mean_color.js \
    -x c++ \
    main.cpp
)


echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                        Successfully completed                        ====="
echo "=====                                                                      ====="
echo "================================================================================"
