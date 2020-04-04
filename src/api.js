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

const instancePromise = modulePromise.then(async module => {
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
});

export async function perlin() {
  const instance = await instancePromise;
  const width = 300;
  const height = 300;
  const octave = 1;
  const buffer = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = instance.exports.perlinValue(
        (x / width) * (1 << octave),
        (y / height) * (1 << octave),
        octave
      );
      const offset = y * width + x;
      if (v < 0) {
        buffer[offset * 4 + 0] = Math.floor(-v * 256);
      } else {
        buffer[offset * 4 + 1] = Math.floor(v * 256);
      }
      buffer[offset * 4 + 3] = 255;
    }
  }
  return new ImageData(buffer, width, height);
}
