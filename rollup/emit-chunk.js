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

import { basename } from "path";

const HASHED_CHUNK_PREFIX = "emit-hashed-chunk:";
const CHUNK_PREFIX = "emit-chunk:";

export default function() {
  return {
    name: "Emit chunk",
    async resolveId(prefixedId, importer) {
      if (
        !prefixedId.startsWith(HASHED_CHUNK_PREFIX) &&
        !prefixedId.startsWith(CHUNK_PREFIX)
      ) {
        return;
      }
      const [prefix, id] = prefixedId.split(":", 2);
      const { id: resolvedId } = await this.resolve(id, importer);
      return `${prefix}:${resolvedId}`;
    },
    load(prefixedId) {
      if (
        !prefixedId.startsWith(HASHED_CHUNK_PREFIX) &&
        !prefixedId.startsWith(CHUNK_PREFIX)
      ) {
        return;
      }
      const [, id] = prefixedId.split(":", 2);
      const hashed = prefixedId.startsWith(HASHED_CHUNK_PREFIX);
      const fileName = basename(id);
      const referenceId = this.emitFile({
        type: "chunk",
        id,
        fileName: !hashed ? fileName : undefined
      });
      return `export default import.meta.ROLLUP_FILE_URL_${referenceId}`;
    }
  };
}
