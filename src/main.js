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

import { proxy, wrap } from "comlink";

import { idle } from "./utils.js";

const params = new URLSearchParams(location.search);
function getParameter(name, def) {
  if (!params.has(name)) {
    return def;
  }
  return parseFloat(params.get(name));
}

function generateParameters() {
  const defaultSize = 800;

  return {
    seed: getParameter("seed", performance.now()),
    width: getParameter("width", defaultSize),
    height: getParameter("height", defaultSize),
    octave: getParameter("octave", 3),
    threshold: getParameter("threshold", 0.2)
  };
}

async function main() {
  const worker = new Worker("./worker.js");
  const parameters = generateParameters();
  const { perlin } = wrap(worker);
  const progressLabel = document.querySelector("#progress label");
  const progressBar = document.querySelector("#progress progress");
  const cb = proxy(({ name, percentage }) => {
    progressLabel.textContent = `${name}: ${percentage}%`;
    progressBar.value = percentage;
  });
  const imageData = await perlin(parameters, cb);
  cb({ name: "Transferring", percentage: 100 });
  const cvs = document.querySelector("canvas");
  cvs.width = imageData.width;
  cvs.height = imageData.height;
  const ctx = cvs.getContext("2d");
  ctx.putImageData(imageData, 0, 0);
}

main();
idle().then(() => import("./sw-installer.js"));
