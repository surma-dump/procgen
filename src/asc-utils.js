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

export function decodeString(buffer, ptr) {
  const data = new Uint16Array(buffer, ptr);
  const len = data.indexOf(0);
  return [...data.subarray(0, len)].map(v => String.fromCharCode(v)).join("");
}

const fromAS = {
  ArrayBuffer: (v, instance) => {
    const dataView = new DataView(instance.exports.memory.buffer);
    const length = dataView.getUint32(v - 4, true);
    const region = new Uint8Array(instance.exports.memory.buffer, v, length);
    return new Uint8Array(region).buffer;
  }
};

function createWrapperFunction(f, desc, instance) {
  return (...args) => {
    // TODO Wrap
    const v = f(...args);
    return fromAS[desc.returnType](v, instance);
  };
}

export function exports(instance, exportDesc) {
  return Object.fromEntries(
    Object.entries(instance.exports).map(([exportName, value]) => {
      if (!(exportName in exportDesc)) {
        return [exportName, value];
      }
      return [
        exportName,
        createWrapperFunction(value, exportDesc[exportName], instance)
      ];
    })
  );
}
