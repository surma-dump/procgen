/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { decodeString } from "./asc-utils.js";

import { modulePromise } from "asc:./perlin.ts";

async function perlinGenerator() {
  const module = await modulePromise;
  const instance = await WebAssembly.instantiate(module, {
    env: {
      abort(messagePtr, fileNamePtr, line, column) {
        const { buffer } = instance.exports.memory;

        const message = decodeString(buffer, messagePtr);
        const fileName = decodeString(buffer, fileNamePtr);
        console.log(`${fileName}:${line}:${column}${"\n"}${message}`);
      }
    }
  });
  instance.exports._start();
  return instance;
}

export async function perlin({ width, height, octave, seed, threshold }) {
  const z = 0.5;
  const instance = await perlinGenerator();
  instance.exports.seedGradients(seed);
  const perlinPtr = instance.exports.renderPerlin(width, height, octave, 1, z);
  const perlin1Ptr = instance.exports.renderPerlin(
    width,
    height,
    octave + 1,
    0.8,
    z
  );
  instance.exports.add(perlinPtr, perlin1Ptr, true);
  const perlin2Ptr = instance.exports.renderPerlin(
    width,
    height,
    octave + 2,
    0.5,
    z
  );
  instance.exports.add(perlinPtr, perlin2Ptr, true);
  const perlin3Ptr = instance.exports.renderPerlin(
    width,
    height,
    octave + 3,
    0.2,
    z
  );
  instance.exports.add(perlinPtr, perlin3Ptr, true);

  // instance.exports.threshold(perlinPtr, threshold, true);
  const bitmapDataPtr = instance.exports.worldBitmap(perlinPtr);
  // const bitmapDataPtr = instance.exports.redGreenBitmap(perlinPtr);
  // const bitmapDataPtr = instance.exports.blackWhiteBitmap(perlinPtr);
  const bitmapData = new Uint8ClampedArray(
    instance.exports.memory.buffer,
    bitmapDataPtr,
    width * height * 4
  );
  const bitmap = new ImageData(bitmapData, width, height);
  return bitmap;
}
