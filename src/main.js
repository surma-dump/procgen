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
  const octaves = new Float32Array(7);
  octaves.set(
    getParameter("octaves", "0,0,1,.8,.6,.4,0", { asString: true }).split(",")
  );
  return {
    seed: getParameter("seed", performance.now()),
    width: getParameter("width", defaultSize),
    height: getParameter("height", defaultSize),
    octaves,
    threshold: getParameter("threshold", 0.2),
    animate: getParameter("animate", "true", { asString: true }) === "true"
  };
}

async function createWorld() {
  const cvs = document.querySelector("#gl");
  const width = 800;
  const height = 600;
  cvs.width = Math.floor(width * devicePixelRatio);
  cvs.height = Math.floor(height * devicePixelRatio);
  cvs.style.width = `${width}px`;
  cvs.style.height = `${height}px`;
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
  const canvasSizeUniformLocation = gl.getUniformLocation(program, "canvas");

  gl.uniform2f(canvasSizeUniformLocation, cvs.width, cvs.height);

  const nodeBuffer = gl.createBuffer();
  const elementBuffer = gl.createBuffer();
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindVertexArray(null);

  gl.viewport(0, 0, cvs.width, cvs.height);
  gl.clearColor(0, 0, 1, 1);
  gl.enable(gl.DEPTH_TEST);
  return {
    cvs,
    position: [0, 0, 0],
    lookAt: [0, 0, 0],
    speed: 0.1,
    updateCameraMatrix(buffer) {
      const view = new Float32Array(buffer);
      gl.uniformMatrix4fv(cameraUniformLocation, false, view);
    },
    updateElements(buffer) {
      const view = new Uint16Array(buffer);
      this.elementCounter = view.length;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, view, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    },
    updateMesh(buffer) {
      const view = new Float32Array(buffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, view, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    },
    draw() {
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, this.elementCounter, gl.UNSIGNED_SHORT, 0);
      // gl.drawElements(gl.LINES, this.elementCounter, gl.UNSIGNED_SHORT, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindVertexArray(null);
    }
  };
}

async function main() {
  const worker = new Worker("./worker.js");
  await message(worker, "READY");
  const parameters = generateParameters();
  const {
    initCamera,
    getCameraMatrix,
    generateMesh,
    generateWireframeElements,
    generateTriangleElements,
    setCameraPosition,
    setCameraLookAt,
    minMax
  } = wrap(worker);

  const world = await createWorld();
  self.world = world;
  document.addEventListener("keydown", ev => {
    switch (ev.code) {
      case "KeyQ":
        world.position[0] -= world.speed;
        break;
      case "KeyE":
        world.position[0] += world.speed;
        break;
      case "KeyW":
        world.position[1] += world.speed;
        break;
      case "KeyS":
        world.position[1] -= world.speed;
        break;
      case "KeyA":
        world.position[2] -= world.speed;
        break;
      case "KeyD":
        world.position[2] += world.speed;
        break;
      default:
        return;
    }
    ev.preventDefault();
  });
  const size = 100;
  const scale = 20;
  world.position = [-size / 2 - 1, 7 * scale, size / 2 + 1];
  world.lookAt = [size / 2, 0, -size / 2];
  const mesh = await generateMesh(
    parameters.seed,
    size,
    scale,
    ...parameters.octaves
  );
  world.mesh = mesh;
  world.updateMesh(mesh);
  world.updateElements(await generateTriangleElements(size));
  // world.updateElements(await generateWireframeElements(size));
  await initCamera(world.cvs.height / world.cvs.width);
  requestAnimationFrame(async function f() {
    await setCameraPosition(...world.position);
    await setCameraLookAt(...world.lookAt);
    world.updateCameraMatrix(await getCameraMatrix());
    world.draw();
    if (parameters.animate) {
      requestAnimationFrame(f);
    }
  });
}

main();
idle().then(() => import("./sw-installer.js"));
