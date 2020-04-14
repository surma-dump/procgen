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

import { idle, message } from "./utils.js";
import { createShader, createProgram } from "./gl-utils.js";

import vertexShaderSrc from "glsl:./shader/vertex.glsl";
import fragmentShaderSrc from "glsl:./shader/fragment.glsl";

const params = new URLSearchParams(location.search);
function getParameter(name, def, { asString = false } = {}) {
  if (!params.has(name)) {
    return def;
  }
  const param = params.get(name);
  if (asString) {
    return param;
  }
  return parseFloat(param);
}

function generateParameters() {
  const defaultSize = 800;
  const octaves = new Float64Array(7);
  octaves.set(
    getParameter("octaves", "0,0,1,.8,.6,.4,0", { asString: true }).split(",")
  );
  return {
    seed: getParameter("seed", performance.now()),
    width: getParameter("width", defaultSize),
    height: getParameter("height", defaultSize),
    octaves,
    threshold: getParameter("threshold", 0.2)
  };
}

async function createWorld() {
  const cvs = document.querySelector("#gl");
  cvs.width = 800;
  cvs.height = 600;
  const gl = cvs.getContext("webgl2");
  if (!gl) {
    throw Error("No support for WebGL 2");
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSrc
  );
  const program = createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);

  const positionAttributeLocation = gl.getAttribLocation(program, "pos");
  const cameraUniformLocation = gl.getUniformLocation(program, "camera");

  const glBuffer = gl.createBuffer();
  const vao = gl.createVertexArray();
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.viewport(0, 0, 800, 600);
  gl.clearColor(0, 0, 1, 1);

  return {
    updateCameraMatrix(buffer) {
      console.log("camera", new Float64Array(buffer));
      gl.uniformMatrix4fv(
        cameraUniformLocation,
        false,
        new Float64Array(buffer)
      );
    },
    updateMesh(buffer) {
      console.log("mesh", new Float64Array(buffer));
      gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float64Array(buffer), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    },
    draw() {
      gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
      gl.bindVertexArray(vao);
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
  };
}

async function main() {
  const worker = new Worker("./worker.js");
  await message(worker, "READY");
  const parameters = generateParameters();
  const { perlin, initCamera, getCameraMatrix, generateMesh } = wrap(worker);
  // const imageDataPromise = perlin(parameters);

  const world = await createWorld();
  world.updateMesh(await generateMesh());
  await initCamera((50 / 360) * 2 * Math.PI, 1, 0.1, 100);
  world.updateCameraMatrix(await getCameraMatrix());
  world.draw();

  // const imageData = await imageDataPromise;
  // const cvs = document.querySelector("#map");
  // cvs.width = imageData.width;
  // cvs.height = imageData.height;
  // const ctx = cvs.getContext("2d");
  // ctx.putImageData(imageData, 0, 0);
}

main();
idle().then(() => import("./sw-installer.js"));
