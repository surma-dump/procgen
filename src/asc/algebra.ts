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

export class Vec4 {
  constructor(public x: f32, public y: f32, public z: f32, public w: f32) {}

  fromVec3(v: Vec3, w: f32): Vec4 {
    this.x = <f32>v.x;
    this.y = <f32>v.y;
    this.z = <f32>v.z;
    this.w = w;
    return this;
  }

  copyFrom(v: Vec4): Vec4 {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = v.w;
    return this;
  }

  setW(w: f32): Vec4 {
    this.w = w;
    return this;
  }

  applyMatrix(m: Matrix4, v: Vec4): Vec4 {
    const vin: f32[] = [v.x, v.y, v.z, v.w];
    const vout: f32[] = [0, 0, 0, 0];
    for (let o = 0; o < 3; o++) {
      let sum: f32 = 0;
      for (let i = 0; i < 3; i++) {
        sum += m.get(i, o) * vin[i];
      }
      vout[o] = sum;
    }
    this.x = vout[0] 
    this.y = vout[1]
    this.z = vout[2]
    this.w = vout[3];
    return this;
  }
}

export class Vec3 {
  constructor(public x: f64, public y: f64, public z: f64) {}

  set(x: f64, y: f64, z: f64): Vec3 {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  fromVec4(v: Vec4): Vec3 {
    let w: f64 = 1;
    if(v.w !== 0) {
      w = v.w;
    }
    this.x = v.x / w;
    this.y = v.y / w;
    this.z = v.z / w;
    return this;
  }

  copyFrom(v: Vec3): Vec3 {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  add(right: Vec3): Vec3 {
    this.x += right.x;
    this.y += right.y;
    this.z += right.z;
    return this;
  }

  addVectors(left: Vec3, right: Vec3): Vec3 {
    this.x = left.x + right.x;
    this.y = left.y + right.y;
    this.z = left.z + right.z;
    return this;
  }

  subtract(right: Vec3): Vec3 {
    right.scalar(-1);
    this.add(right);
    right.scalar(-1);
    return this;
  }

  subtractVectors(left: Vec3, right: Vec3): Vec3 {
    this.x = left.x - right.x;
    this.y = left.y - right.y;
    this.z = left.z - right.z;
    return this;
  }

  crossVectors(left: Vec3, right: Vec3): Vec3 {
    this.x = left.y * right.z - left.z * right.y;
    this.y = -left.x * right.z + left.z * right.x;
    this.z = left.x * right.y - left.y * right.x;
    return this;
  }

  scalar(right: f64): Vec3 {
    this.x *= right;
    this.y *= right;
    this.z *= right;
    return this;
  }

  @operator("*")
  static dot(left: Vec3, right: Vec3): f64 {
    return left.x * right.x + left.y * right.y + left.z * right.z;
  }

  length(): f64 {
    return sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  normalize(): Vec3 {
    let len: f64 = this.length();
    this.x /= len;
    this.y /= len;
    this.z /= len;
    return this;
  }

  floor(): Vec3 {
    this.x = floor(this.x);
    this.y = floor(this.y);
    this.z = floor(this.z);
    return this;
  }

  mod(v: f64): Vec3 {
    this.x %= v;
    this.y %= v;
    this.z %= v;
    return this;
  }

  
}

export class Matrix4 {
  public fields: Float32Array = new Float32Array(16);

  private _tmp1: Vec3 = new Vec3(0, 0, 0);
  private _tmp2: Vec3 = new Vec3(0, 0, 0);
  private _tmp3: Vec3 = new Vec3(0, 0, 0);

  get(x: i32, y: i32): f32 {
    return this.fields[x * 4 + y];
  }

  set(x: i32, y: i32, v: f32): Matrix4 {
    this.fields[x * 4 + y] = v;
    return this;
  }

  copyFrom(other: Matrix4): Matrix4 {
    this.fields.set(other.fields);
    return this;
  }

  perspective(fovY: f32, aspect: f32, near: f32, far: f32): Matrix4 {
    this.identity();
    const f: f32 = 1 / <f32>Math.tan(fovY / 2);
    this.fields.fill(0);
    this.fields[0] = f / aspect;
    this.fields[5] = f;
    this.fields[11] = -1;
    const nf: f32 = 1 / (near - far);
    this.fields[10] = (far + near) * nf;
    this.fields[14] = 2.0 * far * near * nf;
    return this;
  }

  lookAt(position: Vec3, lookAt: Vec3, up: Vec3): Matrix4 {
    const x = this._tmp1;
    const y = this._tmp2;
    const z = this._tmp3;

    z.subtractVectors(position, lookAt).normalize();
    x.crossVectors(up, z).normalize();
    y.crossVectors(z, x);
    this.fields.fill(0);
    this.fields[0] = <f32>x.x;
    this.fields[1] = <f32>y.x;
    this.fields[2] = <f32>z.x;
    this.fields[4] = <f32>x.y;
    this.fields[5] = <f32>y.y;
    this.fields[6] = <f32>z.y;
    this.fields[8] = <f32>x.z;
    this.fields[9] = <f32>y.z;
    this.fields[10] = <f32>z.z;
    this.fields[12] = -(<f32>(x * position));
    this.fields[13] = -(<f32>(y * position));
    this.fields[14] = -(<f32>(z * position));
    this.fields[15] = <f32>1;
    return this;
  }

  translate(x: f32, y: f32, z: f32): Matrix4 {
    this.identity();
    this.fields[12] = x;
    this.fields[13] = y;
    this.fields[14] = z;
    return this;
  }

  translateByVector(v: Vec3): Matrix4 {
    return this.translate(<f32>v.x, <f32>v.y, <f32>v.z);
  }

  rotateX(theta: f32): Matrix4 {
    this.identity();
    const cos = <f32>Math.cos(theta);
    const sin = <f32>Math.sin(theta);
    this.set(1, 1, cos);
    this.set(1, 2, -sin);
    this.set(2, 1, sin);
    this.set(2, 2, cos);
    return this;
  }

  rotateY(theta: f32): Matrix4 {
    this.identity();
    const cos = <f32>Math.cos(theta);
    const sin = <f32>Math.sin(theta);
    this.set(0, 0, cos);
    this.set(0, 2, sin);
    this.set(2, 0, -sin);
    this.set(2, 2, cos);
    return this;
  }

  rotateZ(theta: f32): Matrix4 {
    this.identity();
    const cos = <f32>Math.cos(theta);
    const sin = <f32>Math.sin(theta);
    this.set(0, 0, cos);
    this.set(0, 1, -sin);
    this.set(1, 0, sin);
    this.set(1, 1, cos);
    return this;
  }

  invert(other: Matrix4): Matrix4 {
    const b00: f32 =
      other.get(0, 0) * other.get(1, 1) - other.get(0, 1) * other.get(1, 0);
    const b01: f32 =
      other.get(0, 0) * other.get(1, 2) - other.get(0, 2) * other.get(1, 0);
    const b02: f32 =
      other.get(0, 0) * other.get(1, 3) - other.get(0, 3) * other.get(1, 0);
    const b03: f32 =
      other.get(0, 1) * other.get(1, 2) - other.get(0, 2) * other.get(1, 1);
    const b04: f32 =
      other.get(0, 1) * other.get(1, 3) - other.get(0, 3) * other.get(1, 1);
    const b05: f32 =
      other.get(0, 2) * other.get(1, 3) - other.get(0, 3) * other.get(1, 2);
    const b06: f32 =
      other.get(2, 0) * other.get(3, 1) - other.get(2, 1) * other.get(3, 0);
    const b07: f32 =
      other.get(2, 0) * other.get(3, 2) - other.get(2, 2) * other.get(3, 0);
    const b08: f32 =
      other.get(2, 0) * other.get(3, 3) - other.get(2, 3) * other.get(3, 0);
    const b09: f32 =
      other.get(2, 1) * other.get(3, 2) - other.get(2, 2) * other.get(3, 1);
    const b10: f32 =
      other.get(2, 1) * other.get(3, 3) - other.get(2, 3) * other.get(3, 1);
    const b11: f32 =
      other.get(2, 2) * other.get(3, 3) - other.get(2, 3) * other.get(3, 2);

    let det: f32 =
      b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (det === 0) {
      throw Error("Not invertible");
    }
    det = 1.0 / det;

    this.fields[0] =
      (other.get(1, 1) * b11 - other.get(1, 2) * b10 + other.get(1, 3) * b09) *
      det;
    this.fields[1] =
      (other.get(0, 2) * b10 - other.get(0, 1) * b11 - other.get(0, 3) * b09) *
      det;
    this.fields[2] =
      (other.get(3, 1) * b05 - other.get(3, 2) * b04 + other.get(3, 3) * b03) *
      det;
    this.fields[3] =
      (other.get(2, 2) * b04 - other.get(2, 1) * b05 - other.get(2, 3) * b03) *
      det;
    this.fields[4] =
      (other.get(1, 2) * b08 - other.get(1, 0) * b11 - other.get(1, 3) * b07) *
      det;
    this.fields[5] =
      (other.get(0, 0) * b11 - other.get(0, 2) * b08 + other.get(0, 3) * b07) *
      det;
    this.fields[6] =
      (other.get(3, 2) * b02 - other.get(3, 0) * b05 - other.get(3, 3) * b01) *
      det;
    this.fields[7] =
      (other.get(2, 0) * b05 - other.get(2, 2) * b02 + other.get(2, 3) * b01) *
      det;
    this.fields[8] =
      (other.get(1, 0) * b10 - other.get(1, 1) * b08 + other.get(1, 3) * b06) *
      det;
    this.fields[9] =
      (other.get(0, 1) * b08 - other.get(0, 0) * b10 - other.get(0, 3) * b06) *
      det;
    this.fields[10] =
      (other.get(3, 0) * b04 - other.get(3, 1) * b02 + other.get(3, 3) * b00) *
      det;
    this.fields[11] =
      (other.get(2, 1) * b02 - other.get(2, 0) * b04 - other.get(2, 3) * b00) *
      det;
    this.fields[12] =
      (other.get(1, 1) * b07 - other.get(1, 0) * b09 - other.get(1, 2) * b06) *
      det;
    this.fields[13] =
      (other.get(0, 0) * b09 - other.get(0, 1) * b07 + other.get(0, 2) * b06) *
      det;
    this.fields[14] =
      (other.get(3, 1) * b01 - other.get(3, 0) * b03 - other.get(3, 2) * b00) *
      det;
    this.fields[15] =
      (other.get(2, 0) * b03 - other.get(2, 1) * b01 + other.get(2, 2) * b00) *
      det;

    return this;
  }

  get buffer(): ArrayBuffer {
    return this.fields.buffer;
  }

  multiplyMatrices(left: Matrix4, right: Matrix4): Matrix4 {
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        let sum: f32 = 0;
        for (let i = 0; i < 4; i++) {
          sum += left.get(i, y) * right.get(x, i);
        }
        this.set(x, y, sum);
      }
    }
    return this;
  }

  addMatrices(left: Matrix4, right: Matrix4): Matrix4 {
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        this.set(x, y, left.get(x, y) + right.get(x,y));
      }
    }
    return this;
  }

  identity(): Matrix4 {
    this.fields.fill(0);
    this.set(0, 0, 1)
      .set(1, 1, 1)
      .set(2, 2, 1)
      .set(3, 3, 1);
    return this;
  }

  scalar(v: f32): Matrix4 {
    for(let i =0; i < this.fields.length; i++) {
      this.fields[i] *= v;
    }
    return this;
  }

  crossProductMatrix(v: Vec3): Matrix4 {
    this.fields.fill(0);
    this.set(1, 0, -<f32>v.z);
    this.set(2, 0, <f32>v.y);
    this.set(0, 1, <f32>v.z);
    this.set(2, 1, -<f32>v.x);
    this.set(0, 2, -<f32>v.y);
    this.set(1, 2, -<f32>v.x);
    return this;
  }

  outerVectorProduct(left: Vec3, right: Vec3): Matrix4 {
    const leftV: f64[] = [left.x, left.y, left.z, 1];
    const rightV: f64[] = [right.x, right.y, right.z, 1];
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        this.set(x, y, <f32>(leftV[y] * rightV[x]));
      }
    }
    return this;
  }

  static _tmpMatrix1: Matrix4 = new Matrix4();
  static _tmpMatrix2: Matrix4 = new Matrix4();
  static _tmpMatrix3: Matrix4 = new Matrix4();
  rotateAroundAxis(axis: Vec3, theta: f32): Matrix4 {
    Matrix4._tmpMatrix1.identity().scalar(<f32>Math.cos(theta));
    Matrix4._tmpMatrix2.crossProductMatrix(axis).scalar(<f32>Math.sin(theta));
    Matrix4._tmpMatrix3.addMatrices(Matrix4._tmpMatrix1, Matrix4._tmpMatrix2);
    Matrix4._tmpMatrix1.outerVectorProduct(axis, axis).scalar(1-<f32>Math.cos(theta));
    this.addMatrices(Matrix4._tmpMatrix3, Matrix4._tmpMatrix1);
    return this;
  }
}
