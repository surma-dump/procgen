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

import { Vec3, Vec4, Matrix4 } from "./algebra";
import { multiOctavePerlinValue, seedGradients } from "./perlin";

export class Camera {
  public perspective: Matrix4 = new Matrix4();
  public transform: Matrix4 = new Matrix4();
  public up: Vec4 = new Vec4(0, 1, 0, 0);
  private _tmpMatrix1: Matrix4 = new Matrix4();
  private _tmpMatrix2: Matrix4 = new Matrix4();
  private _tmpMatrix3: Matrix4 = new Matrix4();
  private _tmpVector3a: Vec3 = new Vec3(0, 0, 0);
  private _tmpVector4a: Vec4 = new Vec4(0, 0, 0, 0);

  constructor(private _aspect: f32) {
    this.perspective.perspective(
      <f32>((50 / 360) * 2 * Math.PI),
      this._aspect,
      0.1,
      10000
    );
    this.transform.identity();
  }

  translate(forward: f32, sideways: f32, up: f32): void {
    // View direction
    // const projectedUp = this._tmpVector1
    //   .applyMatrix(
    //     this.transform,
    //     this.up
    //   )
    //   .normalize();
    // Move forward direction

    // const moveForwardDirection = this._tmpVector2;
    // this._tmpVector1.crossVectors(viewDirection, this.up);
    // moveForwardDirection.crossVectors(this.up, this._tmpVector1).normalize();

    // this._tmpMatrix3.multiplyMatrices(
    //   this._tmpMatrix1.copyFrom(this.transform),
    //   this._tmpMatrix2.invert(this._tmpMatrix1)
    // );
    // this.transform.multiplyMatrices(this._tmpMatrix1.copyFrom(this.transform), this._tmpMatrix2.translate(0, 0, -z));
    // this.transform.multiplyMatrices(
    //   this._tmpMatrix1.copyFrom(this.transform),
    //   this._tmpMatrix2.translateByVector(viewDirection.scalar(z))
    // );
    // this.transform.multiplyMatrices(this._tmpMatrix1.copyFrom(this.transform), this._tmpMatrix2.translateByVector(moveForwardDirection.scalar(-z)));
    this.transform.multiplyMatrices(
      this._tmpMatrix1.copyFrom(this.transform),
      this._tmpMatrix2.translateByVector(
        this._tmpVector3a
          .fromVec4(this.up)
          .normalize()
          .scalar(-up)
      )
    );
    this.transform.multiplyMatrices(
      this._tmpMatrix2.translateByVector(this._tmpVector3a.set(1, 0, 0)
        .scalar(-sideways)),
        this._tmpMatrix1.copyFrom(this.transform),
    );
    // this.transform.multiplyMatrices(this._tmpMatrix2.translate(-x, 0, 0), this._tmpMatrix1.copyFrom(this.transform));
  }

  rotateX(theta: f32): void {
    this.transform.multiplyMatrices(
      this._tmpMatrix2.rotateX(-theta),
      this._tmpMatrix1.copyFrom(this.transform)
    );
  }

  rotateUp(theta: f32): void {
    this.transform.multiplyMatrices(
      this._tmpMatrix3.rotateAroundAxis(this._tmpVector3a.fromVec4(this._tmpVector4a.applyMatrix(this.transform, this.up)).normalize(), theta),
      this._tmpMatrix2.copyFrom(this.transform),
    );
  }

  get buffer(): ArrayBuffer {
    return this._tmpMatrix1.multiplyMatrices(this.perspective, this.transform)
      .buffer;
  }
}

let camera: Camera;
export function initCamera(aspect: f32): void {
  camera = new Camera(aspect);
}

export function setCameraPosition(x: f32, y: f32, z: f32): void {
  camera.transform.translate(x, y, z);
}

export function translateCamera(forward: f32, sideways: f32, up: f32): void {
  camera.translate(forward, sideways, up);
}

export function rotateCamera(x: f32, y: f32): void {
  camera.rotateX(x);
  camera.rotateUp(y);
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
  for (let i = 1; i < mesh.length; i += 3) {
    const v: f32 = mesh[i];
    if (v > max) {
      max = v;
    }
    if (v < min) {
      min = v;
    }
  }

  for (let i = 1; i < mesh.length; i += 3) {
    let v: f32 = mesh[i];
    // Map to [0; 1]
    v = (v - min) / (max - min);
    // Map to [-1; 1];
    v = v * 2 - 1;
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
      mesh[nodeOffset * 3 + 1] = <f32>(
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
