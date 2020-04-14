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

import { expose } from "comlink";

import { decodeString, exports } from "./asc-utils.js";

import { modulePromise } from "asc:./asc/main.ts";

async function init(cb) {
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
  postMessage("READY");
  const fs = exports(instance, {
    generateMesh: { returnType: "ArrayBuffer" },
    getCameraMatrix: { returnType: "ArrayBuffer" }
  });
  self.fs = fs;
  expose(fs);
}
init();
