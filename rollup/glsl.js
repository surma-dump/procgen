/**
 * Copyright 2019 Google Inc. All Rights Reserved.
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

import { promises as fsp } from "fs";
import glslify from "glslify";

// Stolen from
// https://github.com/glslify/rollup-plugin-glslify/blob/master/index.js
function compressShader(code) {
  let needNewline = false;
  return code
    .replace(
      /\\(?:\r\n|\n\r|\n|\r)|\/\*.*?\*\/|\/\/(?:\\(?:\r\n|\n\r|\n|\r)|[^\n\r])*/g,
      ""
    )
    .split(/\n+/)
    .reduce((result, line) => {
      line = line.trim().replace(/\s{2,}|\t/, " ");
      if (line.charAt(0) === "#") {
        if (needNewline) {
          result.push("\n");
        }
        result.push(line, "\n");
        needNewline = false;
      } else {
        result.push(
          line.replace(
            /\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|-|!|;)\s*/g,
            "$1"
          )
        );
        needNewline = true;
      }
      return result;
    }, [])
    .join("")
    .replace(/\n+/g, "\n");
}

const defaultOpts = {
  prefix: "glsl:"
};

export default function glslPlugin(opts) {
  opts = { ...defaultOpts, ...opts };

  return {
    name: "glsl",
    async resolveId(id, importer) {
      if (!id.startsWith(opts.prefix)) {
        return;
      }
      const resolvedId = await this.resolve(
        id.slice(opts.prefix.length),
        importer
      );
      return opts.prefix + resolvedId.id;
    },
    async load(id) {
      if (!id.startsWith(opts.prefix)) {
        return;
      }
      id = id.slice(opts.prefix.length);
      this.addWatchFile(id);
      const code = await fsp.readFile(id, { encoding: "utf8" });
      const compiled = glslify.compile(code);
      const compressed = compressShader(compiled);
      return `export default ${JSON.stringify(compressed)};`;
    }
  };
}
