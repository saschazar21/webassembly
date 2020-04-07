#!/bin/bash

set -e

export CORES=`nproc --all`
export OPTIMIZE="-Oz"
export LDFLAGS="${OPTIMIZE}"
export CFLAGS="${OPTIMIZE}"
export CPPFLAGS="${OPTIMIZE}"

export CMAKE_TOOLCHAIN_FILE=/emsdk_portable/emscripten/sdk/cmake/Modules/Platform/Emscripten.cmake

export PWD=`pwd`
export LIBDE265_SRC="${PWD}/node_modules/libde265"
export LIBDE265_BUILD="${LIBDE265_SRC}/libde265"
export LIBHEIF_SRC="${PWD}/node_modules/libheif"
export LIBHEIF_BUILD="${LIBHEIF_SRC}/libheif"
export LIBX265_SRC="${PWD}/node_modules/libx265/source"
export LIBX265_BUILD="${LIBDE265_SRC}/embuild"

echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                    Compiling @saschazar/wasm-heif                    ====="      
echo "=====                                                                      ====="
echo "================================================================================"

test -n "$SKIP_LIBHEIF" || (
  apt-get update
  apt-get install -qqy \
    autoconf \
    automake \
    libtool \
    pkg-config

  # echo "======="
  # echo ""
  # echo "libx265"
  # echo ""
  # echo "======="
  # rm -rf $LIBX265_BUILD || true
  # mkdir -p $LIBX265_BUILD && cd $LIBX265_SRC
  # emcmake cmake $LIBX265_SRC \
  #   -G "Unix Makefiles" \
  #   -DCMAKE_TOOLCHAIN_FILE=$CMAKE_TOOLCHAIN_FILE \
  #   -DSTATIC_LINK_CRT=1 \
  #   -DENABLE_LIBNUMA=0 \
  #   -DENABLE_PIC=0 \
  #   -DNATIVE_BUILD=0

  # emmake make -j$(nproc)

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

  emmake make -j${CORES}

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
    libde265_LIBS="-L${LIBDE265_BUILD}/.libs"

  emmake make -j${CORES}
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
    -s 'EXPORT_NAME="wasm_heif"' \
    -I $LIBHEIF_SRC \
    --std=c++11 \
    -o ./wasm_heif.js \
    -x c++ \
    main.cpp \
    $LIBDE265_BUILD/.libs/libde265.so \
    $LIBHEIF_BUILD/.libs/libheif.a 
)


echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                        Successfully completed                        ====="
echo "=====                                                                      ====="
echo "================================================================================"
