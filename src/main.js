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
    scale: getParameter("scale", 20),
    width: getParameter("width", defaultSize),
    height: getParameter("height", defaultSize),
    octaves,
    threshold: getParameter("threshold", 0.2),
    animate: getParameter("animate", "true", { asString: true }) === "true"
  };
}

const out = document.querySelector("#matrixlog");
function logMatrix(m) {
  const view = new Float32Array(m);
  out.innerHTML = Array.from({ length: 4 }, (_, row) =>
    [...view]
      .filter((_, i) => i % 4 === row)
      .map(v => v.toFixed(2))
      .join(" ")
  ).join("\n");
}

async function createWorld({ scale }) {
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
  const scaleUniformLocation = gl.getUniformLocation(program, "scale");

  gl.uniform2f(canvasSizeUniformLocation, cvs.width, cvs.height);
  gl.uniform1f(scaleUniformLocation, scale);

  const nodeBuffer = gl.createBuffer();
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindVertexArray(null);

  gl.viewport(0, 0, cvs.width, cvs.height);
  gl.clearColor(0.2, 0.1, 0.1, 1);
  gl.enable(gl.DEPTH_TEST);
  return {
    cvs,
    position: [0, 0, 0],
    lookAt: [0, 0, 0],
    speed: 0.3,
    updateCameraMatrix(buffer) {
      const view = new Float32Array(buffer);
      gl.uniformMatrix4fv(cameraUniformLocation, false, view);
    },
    updateMesh(buffer) {
      const view = new Float32Array(buffer);
      this.elementCounter = view.length / 3;
      gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, view, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    },
    draw() {
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, this.elementCounter);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindVertexArray(null);
    }
  };
}

function controller() {
  const direction = [0, 0, 0];
  document.addEventListener("keydown", ev => {
    switch (ev.code) {
      case "KeyQ":
        direction[2] = 1;
        break;
      case "KeyE":
        direction[2] = -1;
        break;
      case "KeyW":
        direction[0] = 1;
        break;
      case "KeyS":
        direction[0] = -1;
        break;
      case "KeyA":
        direction[1] = -1;
        break;
      case "KeyD":
        direction[1] = 1;
        break;
      default:
        return;
    }
    ev.preventDefault();
  });
  document.addEventListener("keyup", ev => {
    switch (ev.code) {
      case "KeyQ":
      case "KeyE":
        direction[2] = 0;
        break;
      case "KeyW":
      case "KeyS":
        direction[0] = 0;
        break;
      case "KeyA":
      case "KeyD":
        direction[1] = 0;
        break;
      default:
        return;
    }
    ev.preventDefault();
  });
  return direction;
}

async function main() {
  const worker = new Worker("./worker.js");
  await message(worker, "READY");
  const parameters = generateParameters();
  const {
    initCamera,
    getCameraMatrix,
    getCameraTransform,
    generateMesh,
    setCameraPosition,
    translateCamera,
    rotateCamera
  } = wrap(worker);

  const world = await createWorld(parameters);
  self.world = world;
  let lastX, lastY;
  world.cvs.addEventListener("mousemove", ev => {
    if (typeof lastX !== "number" || typeof lastY !== "number") {
      lastX = ev.offsetX;
      lastY = ev.offsetY;
      return;
    }
    rotateCamera(
      ((((ev.offsetY - lastY) / 100) * 90) / 360) * 2 * Math.PI,
      ((((ev.offsetX - lastX) / 100) * 90) / 360) * 2 * Math.PI
    );
    lastX = ev.offsetX;
    lastY = ev.offsetY;
  });

  const direction = controller();
  const size = 256;
  const scale = parameters.scale;
  const mesh = await generateMesh(
    parameters.seed,
    size,
    scale,
    ...parameters.octaves
  );
  world.mesh = mesh;
  world.updateMesh(mesh);
  await initCamera(world.cvs.height / world.cvs.width);
  await setCameraPosition(-15, 150, 15);
  await rotateCamera((60 / 360) * 2 * Math.PI, (45 / 360) * 2 * Math.PI);
  requestAnimationFrame(async function f() {
    await translateCamera(
      direction[0] * world.speed,
      direction[1] * world.speed,
      direction[2] * world.speed
    );
    logMatrix(await getCameraTransform());
    world.updateCameraMatrix(await getCameraMatrix());
    world.draw();
    if (parameters.animate) {
      requestAnimationFrame(f);
    }
  });
}

main();
idle().then(() => import("./sw-installer.js"));
