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

import { Matrix4 } from "./algebra.ts";

export class Camera {
  public matrix: Matrix4;

  constructor(private _fovY: f64, private _aspect: f64, private _near: f64, private _far: f64) {
    this.matrix = new Matrix4().perspective(_fovY, _aspect, _near, _far);
  }

  get buffer(): ArrayBuffer {
    return this.matrix.fields.buffer;
  }
}

let camera: Camera;
export function initCamera(fovY: f64, aspect: f64, near: f64, far: f64): void {
  camera = new Camera(fovY, aspect, near, far);
}

export function getCameraMatrix(): ArrayBuffer {
  return camera.buffer;
}

export function generateMesh(): ArrayBuffer {
  const mesh = new Float64Array(9);
  mesh[0*3 + 0] = -1;
  mesh[0*3 + 1] = -1;
  mesh[0*3 + 2] = 10;

  mesh[1*3 + 0] = 0;
  mesh[1*3 + 1] = 1;
  mesh[1*3 + 2] = 10;

  mesh[2*3 + 0] = 1;
  mesh[2*3 + 1] = -1;
  mesh[2*3 + 2] = 10;

  return mesh.buffer
}