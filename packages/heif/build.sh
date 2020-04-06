#!/bin/bash

set -e

export OPTIMIZE="-Oz"
export LDFLAGS="${OPTIMIZE}"
export CFLAGS="${OPTIMIZE}"
export CPPFLAGS="${OPTIMIZE}"

export PWD=`pwd`
export LIBHEIF_SRC="${PWD}/node_modules/libheif"
export LIBDE265_SRC="${PWD}/node_modules/libde265"

echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                    Compiling @saschazar/wasm-heif                    ====="      
echo "=====                                                                      ====="
echo "================================================================================"

test -n "$SKIP_LIBHEIF" || (
  apt-get update
  apt-get install -qqy autoconf automake libtool pkg-config

  echo "======="
  echo ""
  echo "libde265"
  echo ""
  echo "======="
  cd $LIBDE265_SRC
  [ -x configure ] || ./autogen.sh
  emconfigure ./configure \
    --disable-arm \
    --disable-sse \
    --disable-dec265 \
    --disable-sherlock265

  emmake make -j$(nproc)

  echo "======="
  echo ""
  echo "libheif"
  echo ""
  echo "======="
  cd $LIBHEIF_SRC
  [ -x configure ] || ./autogen.sh
  emconfigure ./configure \
    --disable-examples \
    --disable-gdk-pixbuf \
    --disable-go \
    --disable-multithreading \
    PKG_CONFIG_PATH="${LIBDE265_SRC}" \
    libde265_CFLAGS="-I${LIBDE265_SRC}" \
    libde265_LIBS="-L${LIBDE265_SRC}/libde265/.libs"

  emmake make -j$(nproc)
)

# echo "======="
# echo ""
# echo "wasm"
# echo ""
# echo "======="

# (
#   time emcc \
#     --bind \
#     ${OPTIMIZE} \
#     -s ALLOW_MEMORY_GROWTH=1 \
#     -s MODULARIZE=1 \
#     -s 'EXPORT_NAME="wasm_heif"' \
#     -I node_modules/libheif \
#     --std=c++11 \
#     -o ./wasm_heif.js \
#     -x c++ \
#     main.cpp
# )


echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                        Successfully completed                        ====="
echo "=====                                                                      ====="
echo "================================================================================"
