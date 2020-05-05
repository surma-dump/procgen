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
import { join, dirname } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execP = promisify(exec);

const PREFIX = "cargo:";

export default function() {
  return {
    name: "cargo",
    async resolveId(id, importer) {
      if (!id.startsWith(PREFIX)) {
        return;
      }
      const [folder, target] = id.slice(PREFIX.length).split(":", 2);
      let cargoPath = join(folder, "Cargo.toml");
      if (folder.startsWith("./")) {
        cargoPath = "./" + cargoPath;
      }
      const resolvedId = await this.resolve(cargoPath, importer);
      if (!resolvedId) {
        throw Error(`Could not resolve ${cargoPath} relative to ${importer}`);
      }
      const resolvedFolder = dirname(resolvedId.id);

      return `${PREFIX}${resolvedFolder}:${target}`;
    },
    async load(id) {
      if (!id.startsWith(PREFIX)) {
        return;
      }
      const [cwd, target] = id.slice(PREFIX.length).split(":", 2);
      await execP("cargo build --target wasm32-unknown-unknown --release", {
        cwd
      });
      const fileName = `${target}.wasm`;
      const path = join(
        cwd,
        "target",
        "wasm32-unknown-unknown",
        "release",
        fileName
      );
      const source = await fsp.readFile(path);
      const referenceId = this.emitFile({
        type: "asset",
        name: fileName,
        source
      });
      return `export default import.meta.ROLLUP_FILE_URL_${referenceId}`;
    }
  };
}
