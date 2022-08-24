// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

const UPPER32 = Math.pow(2, 32);

let warnedPrecision = false;
function warnPrecision() {
  if (!warnedPrecision) {
    warnedPrecision = true;
    console.warn("CBOR 64-bit integer array values may lose precision. No further warnings.");
  }
}

/**
 * Unpacks 64-bit unsigned integer from byte array.
 * @param {Uint8Array} bytes
 */
function decodeUint64LE(bytes: Uint8Array) {
  warnPrecision();

  const byteLen = bytes.byteLength;
  const offset = bytes.byteOffset;
  const arrLen = byteLen / 8;

  const buffer = bytes.buffer.slice(offset, offset + byteLen);
  const uint32View = new Uint32Array(buffer);

  const arr = new Array(arrLen);
  for (let i = 0; i < arrLen; i++) {
    const si = i * 2;
    const lo = uint32View[si];
    const hi = uint32View[si + 1];
    arr[i] = lo + UPPER32 * hi;
  }

  return arr;
}

/**
 * Unpacks 64-bit signed integer from byte array.
 * @param {Uint8Array} bytes
 */
function decodeInt64LE(bytes: Uint8Array) {
  warnPrecision();

  const byteLen = bytes.byteLength;
  const offset = bytes.byteOffset;
  const arrLen = byteLen / 8;

  const buffer = bytes.buffer.slice(offset, offset + byteLen);
  const uint32View = new Uint32Array(buffer);
  const int32View = new Int32Array(buffer);

  const arr = new Array(arrLen);
  for (let i = 0; i < arrLen; i++) {
    const si = i * 2;
    const lo = uint32View[si];
    const hi = int32View[si + 1];
    arr[i] = lo + UPPER32 * hi;
  }

  return arr;
}

/**
 * Unpacks typed array from byte array.
 * @param {Uint8Array} bytes
 * @param {type} ArrayType - desired output array type
 */
function decodeNativeArray(bytes: Uint8Array, ArrayType) {
  const byteLen = bytes.byteLength;
  const offset = bytes.byteOffset;
  const buffer = bytes.buffer.slice(offset, offset + byteLen);
  return new ArrayType(buffer);
}

/**
 * Support a subset of draft CBOR typed array tags:
 *   <https://tools.ietf.org/html/draft-ietf-cbor-array-tags-00>
 * Only support little-endian tags for now.
 */
const nativeArrayTypes = {
  64: Uint8Array,
  69: Uint16Array,
  70: Uint32Array,
  72: Int8Array,
  77: Int16Array,
  78: Int32Array,
  85: Float32Array,
  86: Float64Array,
};

/**
 * We can also decode 64-bit integer arrays, since ROS has these types.
 */
const conversionArrayTypes = {
  71: decodeUint64LE,
  79: decodeInt64LE,
};

/**
 * Handles CBOR typed array tags during decoding.
 * @param {Uint8Array} data
 * @param {Number} tag
 */
function cborTypedArrayTagger(data: Uint8Array, tag: number) {
  if (tag in nativeArrayTypes) {
    const arrayType = nativeArrayTypes[tag];
    return decodeNativeArray(data, arrayType);
  }
  if (tag in conversionArrayTypes) {
    return conversionArrayTypes[tag](data);
  }
  return data;
}

export { cborTypedArrayTagger };
