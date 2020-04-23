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

import { Vec3, Matrix4 } from "./algebra";
import { multiOctavePerlinValue, seedGradients } from "./perlin";

export class Camera {
  public position: Vec3 = new Vec3(0, 0, 0);
  public lookAt: Vec3 = new Vec3(0, 0, -1);
  public up: Vec3 = new Vec3(0, 1, 0);
  private _perspective: Matrix4 = new Matrix4();
  private _transform: Matrix4 = new Matrix4();
  private _tmp: Matrix4 = new Matrix4();

  constructor(private _aspect: f32) {}

  get buffer(): ArrayBuffer {
    this._perspective.perspective(
      <f32>((50 / 360) * 2 * Math.PI),
      this._aspect,
      0.1,
      10000
    );
    this._transform.lookAt(this.position, this.lookAt, this.up);
    return this._tmp.multiplyMatrices(this._perspective, this._transform)
      .buffer;
  }
}

let camera: Camera;
export function initCamera(aspect: f32): void {
  camera = new Camera(aspect);
}

export function setCameraPosition(x: f32, y: f32, z: f32): void {
  camera.position.set(x, y, z);
}

export function setCameraLookAt(x: f32, y: f32, z: f32): void {
  camera.lookAt.set(x, y, z);
}

export function getCameraMatrix(): ArrayBuffer {
  return camera.buffer;
}

function indexOfNode(size: i32, x: i32, y: i32): u16 {
  return <u16>(y * size + x);
}

export function generateWireframeElements(size: i32): ArrayBuffer {
  const indices = new Uint16Array((size - 1) * (size - 1) * 8);
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const offset = y * (size - 1) + x;

      const x1 = x;
      const x2 = x + 1;
      const y1 = y;
      const y2 = y + 1;

      indices[offset * 8 + 0] = indexOfNode(size, x1, y1);
      indices[offset * 8 + 1] = indexOfNode(size, x1, y2);
      indices[offset * 8 + 2] = indexOfNode(size, x1, y2);
      indices[offset * 8 + 3] = indexOfNode(size, x2, y2);
      indices[offset * 8 + 4] = indexOfNode(size, x2, y2);
      indices[offset * 8 + 5] = indexOfNode(size, x2, y1);
      indices[offset * 8 + 6] = indexOfNode(size, x2, y1);
      indices[offset * 8 + 7] = indexOfNode(size, x1, y1);
    }
  }
  return indices.buffer;
}

function normalizeHeight(mesh: Float32Array, scale: f32): void {
  let min: f32 = f32.MAX_VALUE;
  let max: f32 = f32.MIN_VALUE;
  // We are only looking at y values
  for (let i = 1; i < mesh.length; i+=3) {
    const v:f32 = mesh[i];
    if (v > max) {
      max = v;
    }
    if (v < min) {
      min = v;
    }
  }

  for (let i = 1; i < mesh.length; i+=3) {
    let v: f32 = mesh[i];
    // Map to [0; 1]
    v = (v - min) / (max - min);
    // Map to [-1; 1];
    v = v * 2. - 1.;
    // Map to [-scale; scale]
    v = v * scale;
    mesh[i] = v;
  }
}

export function generateTriangleElements(size: i32): ArrayBuffer {
  const indices = new Uint16Array((size - 1) * (size - 1) * 2 * 3);
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const offset = y * (size - 1) + x;

      const x1 = x;
      const x2 = x + 1;
      const y1 = y;
      const y2 = y + 1;

      indices[offset * 6 + 0] = indexOfNode(size, x1, y1);
      indices[offset * 6 + 1] = indexOfNode(size, x1, y2);
      indices[offset * 6 + 2] = indexOfNode(size, x2, y1);
      indices[offset * 6 + 3] = indexOfNode(size, x2, y1);
      indices[offset * 6 + 4] = indexOfNode(size, x1, y2);
      indices[offset * 6 + 5] = indexOfNode(size, x2, y2);
    }
  }
  return indices.buffer;
}

export function generateMesh(
  seed: i32,
  size: i32,
  scale: f32,
  octave0: f64,
  octave1: f64,
  octave2: f64,
  octave3: f64,
  octave4: f64,
  octave5: f64,
  octave6: f64
): ArrayBuffer {
  seedGradients(seed);
  const fz: f64 = 0.5;
  const mesh = new Float32Array(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nodeOffset = y * size + x;
      const fx: f64 = <f64>x / <f64>size;
      const fy: f64 = <f64>y / <f64>size;
      mesh[nodeOffset * 3 + 0] = <f32>x;
      mesh[nodeOffset * 3 + 2] = -(<f32>y);
      mesh[nodeOffset * 3 + 1] =
        <f32>(
          multiOctavePerlinValue(
            fx,
            fy,
            fz,
            octave0,
            octave1,
            octave2,
            octave3,
            octave4,
            octave5,
            octave6
          )
        );
    }
  }

  normalizeHeight(mesh, scale);

  return mesh.buffer;
}
