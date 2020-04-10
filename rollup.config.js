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

import resolve from "@rollup/plugin-node-resolve";
import omt from "@surma/rollup-plugin-off-main-thread";
import { asc } from "rollup-plugin-assemblyscript";
import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";

import ejs from "./rollup/ejs.js";
import fileList from "./rollup/file-list.js";
import emitChunk from "./rollup/emit-chunk.js";

require("rimraf").sync("build");

export default {
  output: {
    dir: "build",
    format: "amd",
    entryFileNames: "[name]-[hash].js"
  },
  plugins: [
    ejs({
      files: ["src/_headers", "src/index.html.ejs"]
    }),
    asc({
      compilerOptions: {
        runtime: "half",
        optimizeLevel: 3,
        shrinkLevel: 2,
        explicitStart: true
      }
    }),
    emitChunk(),
    resolve(),
    babel(),
    omt(),
    fileList(),
    terser({
      compress: true,
      mangle: true
    })
  ]
};
