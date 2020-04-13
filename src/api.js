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

import { transfer } from "comlink";

import { decodeString } from "./asc-utils.js";

import { modulePromise } from "asc:./perlin.ts";

async function perlinGenerator(cb) {
  const module = await modulePromise;
  const instance = await WebAssembly.instantiate(module, {
    env: {
      onProgress(percentage) {
        cb(percentage);
      },
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

export async function perlin({ width, height, octaves, seed }, cb = () => {}) {
  const z = 0.5;
  let name = "Rendering image";
  const instance = await perlinGenerator(percentage =>
    cb({ name, percentage })
  );
  instance.exports.seedGradients(seed);
  console.log(octaves);
  const perlinPtr = instance.exports.renderPerlin(width, height, z, ...octaves);
  name = "Colorizing";
  const bitmapDataPtr = instance.exports.worldBitmap(perlinPtr);
  // const bitmapDataPtr = instance.exports.redGreenBitmap(perlinPtr);
  // const bitmapDataPtr = instance.exports.blackWhiteBitmap(perlinPtr);
  const bitmapData = new Uint8ClampedArray(
    instance.exports.memory.buffer,
    bitmapDataPtr,
    width * height * 4
  );
  const bitmap = new ImageData(
    new Uint8ClampedArray(bitmapData),
    width,
    height
  );
  return transfer(bitmap, [bitmap.data.buffer]);
}
