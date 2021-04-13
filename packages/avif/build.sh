#!/bin/bash

set -e

export OPTIMIZE="-Oz"
export LDFLAGS="${OPTIMIZE}"
export CFLAGS="${OPTIMIZE}"
export CPPFLAGS="${OPTIMIZE}"

export AOM_DOWNLOAD="https://aomedia.googlesource.com/aom/+archive/cb1d48da8da2061e72018761788a18b8fa8013bb.tar.gz" #v2.0.2

export CMAKE_TOOLCHAIN_FILE=/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake

export PATH="/root/.cargo/bin:${PATH}"
export PWD=`pwd`
export LIBAVIF_SRC="${PWD}/node_modules/libavif"
export LIBAVIF_BUILD="${LIBAVIF_SRC}/embuild"
export LIBAVIF_AOM_SRC="${LIBAVIF_SRC}/ext/aom"
export LIBAVIF_AOM_BUILD="${LIBAVIF_AOM_SRC}/build.libavif"

echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                    Compiling @saschazar/wasm-avif                    ====="
echo "=====                                                                      ====="
echo "================================================================================"

test -n "$SKIP_LIBAVIF" || (
  apt-get update
  apt-get install -qqy \
    nasm \
    ccache

  echo "======="
  echo ""
  echo "aom"
  echo ""
  echo "======="
  rm -rf $LIBAVIF_AOM_SRC || true
  mkdir -p $LIBAVIF_AOM_BUILD && cd $LIBAVIF_AOM_BUILD
  curl -fsSL $AOM_DOWNLOAD | tar xz -C $LIBAVIF_AOM_SRC

  emcmake cmake $LIBAVIF_AOM_SRC \
    -DCMAKE_BUILD_TYPE=Release \
    -DENABLE_CCACHE=1 \
    -DAOM_TARGET_CPU=generic \
    -DAOM_EXTRA_C_FLAGS=-UNDEBUG \
    -DAOM_EXTRA_CXX_FLAGS=-UNDEBUG \
    -DENABLE_DOCS=0 \
    -DENABLE_EXAMPLES=0 \
    -DENABLE_TESTDATA=0 \
    -DENABLE_TESTS=0 \
    -DENABLE_TOOLS=0 \
    -DCONFIG_ACCOUNTING=1 \
    -DCONFIG_INSPECTION=1 \
    -DCONFIG_MULTITHREAD=0 \
    -DCONFIG_RUNTIME_CPU_DETECT=0 \
    -DCONFIG_WEBM_IO=0 \
    -DCMAKE_TOOLCHAIN_FILE=$CMAKE_TOOLCHAIN_FILE
  emmake make -j$(nproc)

  echo "======="
  echo ""
  echo "libavif"
  echo ""
  echo "======="
  rm -rf $LIBAVIF_BUILD || true
  mkdir -p $LIBAVIF_BUILD && cd $LIBAVIF_BUILD
  emcmake cmake $LIBAVIF_SRC \
    -G "Unix Makefiles" \
    -DCMAKE_TOOLCHAIN_FILE=$CMAKE_TOOLCHAIN_FILE \
    -DAVIF_CODEC_AOM=1 \
    -DAVIF_LOCAL_AOM=1 
  emmake make -j$(nproc)
)

echo "======="
echo ""
echo "wasm"
echo ""
echo "======="
(
  time emcc \
    --llvm-lto 3 \
    --llvm-opts 3 \
    --bind \
    ${OPTIMIZE} \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s 'EXPORT_NAME="wasm_avif"' \
    -I node_modules/libavif/include \
    --std=c++11 \
    -o ./wasm_avif.js \
    -x c++ \
    main.cpp \
    $LIBAVIF_BUILD/libavif.a \
    $LIBAVIF_AOM_BUILD/libaom.a
)


echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                        Successfully completed                        ====="
echo "=====                                                                      ====="
echo "================================================================================"
