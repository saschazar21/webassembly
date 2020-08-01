#!/bin/bash

set -e

export OPTIMIZE="-Os"
export LDFLAGS="${OPTIMIZE}"
export CFLAGS="${OPTIMIZE}"
export CPPFLAGS="${OPTIMIZE}"

export RUST_WASM32_TARGET=wasm32-unknown-emscripten
export RUSTFLAGS="-C target-cpu=generic -C link-arg=-s"

export DAV1D_DOWNLOAD="https://github.com/videolan/dav1d/archive/0.7.1.tar.gz"
export RAV1E_DOWNLOAD="https://github.com/xiph/rav1e/archive/v0.3.3.tar.gz"

export CMAKE_TOOLCHAIN_FILE=/emsdk_portable/emscripten/sdk/cmake/Modules/Platform/Emscripten.cmake

export PATH="/root/.cargo/bin:${PATH}"
export PWD=`pwd`
export LIBAVIF_SRC="${PWD}/node_modules/libavif"
export LIBAVIF_BUILD="${LIBAVIF_SRC}/embuild"
export LIBAVIF_DAV1D_SRC="${LIBAVIF_SRC}/ext/dav1d"
export LIBAVIF_DAV1D_BUILD="${LIBAVIF_DAV1D_SRC}/build"
export LIBAVIF_RAV1E_SRC="${LIBAVIF_SRC}/ext/rav1e"
export LIBAVIF_RAV1E_BUILD="${LIBAVIF_RAV1E_SRC}"
export LIBAVIF_RAV1E_RELEASE="${LIBAVIF_RAV1E_BUILD}/target/${RUST_WASM32_TARGET}/release"
export MESON_CROSS="${PWD}/build/cross.txt"

echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                    Compiling @saschazar/wasm-avif                    ====="
echo "=====                                                                      ====="
echo "================================================================================"

test -n "$SKIP_LIBAVIF" || (
  apt-get update
  apt-get install -qqy \
    nasm \
    meson \
    ninja-build \
    pkg-config \
    libssl-dev

  echo "======="
  echo ""
  echo "dav1d"
  echo ""
  echo "======="
  rm -rf $LIBAVIF_DAV1D_SRC || true
  mkdir -p $LIBAVIF_DAV1D_BUILD && cd $LIBAVIF_DAV1D_BUILD
  curl -fsSL $DAV1D_DOWNLOAD | tar xz --strip-components 1 -C $LIBAVIF_DAV1D_SRC

  meson $LIBAVIF_DAV1D_SRC \
    --default-library=static \
    --buildtype release \
    --cross-file=$MESON_CROSS \
    -Denable_asm=false \
    -Denable_avx512=false \
    -Denable_tests=false \
    -Denable_tools=false \
    -Dbitdepths='["8"]' \
    -Dlogging=false \
    -Dfuzzing_engine='none'
  ninja

  echo "======="
  echo ""
  echo "rav1e"
  echo ""
  echo "======="
  export RAV1E_CPU_TARGET=rust
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain nightly

  rm -rf $LIBAVIF_RAV1E_SRC || true
  mkdir -p $LIBAVIF_RAV1E_BUILD && cd $LIBAVIF_RAV1E_BUILD
  curl -fsSL $RAV1E_DOWNLOAD | tar xz --strip-components 1 -C $LIBAVIF_RAV1E_BUILD

  rustup target add $RUST_WASM32_TARGET
  cargo install cargo-c
  cargo cbuild \
    --destdir $LIBAVIF_RAV1E_BUILD \
    --libdir $LIBAVIF_RAV1E_RELEASE
  # cargo install cbindgen
  # cbindgen \
  #   -c cbindgen.toml \
  #   -l C \
  #   -o $LIBAVIF_RAV1E_RELEASE/include/rav1e/rav1e.h \
  #   --crate rav1e \
  #   $LIBAVIF_RAV1E_BUILD

  # cargo build \
  #   --target $RUST_WASM32_TARGET \
  #   --lib \
  #   --release \
  #   --features capi

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
    -DAVIF_CODEC_DAV1D=1 \
    -DAVIF_LOCAL_DAV1D=1
    -DAVIF_CODEC_RAV1E=1 \
    -DRAV1E_INCLUDE_DIR=$LIBAVIF_RAV1E_RELEASE/include \
    -DRAV1E_LIBRARY=$LIBAVIF_RAV1E_RELEASE/librav1e.a \
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
    $LIBAVIF_DAV1D_BUILD/src/libdav1d.a
    # $LIBAVIF_RAV1E_RELEASE/librav1e.a
)


echo "================================================================================"
echo "=====                                                                      ====="
echo "=====                        Successfully completed                        ====="
echo "=====                                                                      ====="
echo "================================================================================"
