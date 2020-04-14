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

export class Vec3 {
  constructor(public x: f64, public y: f64, public z: f64) {}

  set(x: f64, y: f64, z: f64): Vec3 {
    this.x = x;
    this.y = y;
    this.z = z;
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
  public fields: Float64Array= new Float64Array(16);

  get(x: usize, y: usize): f64 {
    return this.fields[y * 4 + x];
  }

  set(x: usize, y: usize, v: f64): Matrix4 {
    this.fields[y * 4 + x] = v;
    return this;
  }

  copyFrom(other: Matrix4): Matrix4 {
    this.fields.set(other.fields);
    return this;
  }

  perspective(fovY: f64, aspect: f64, near: f64, far: f64): Matrix4 {
    const f = 1 / Math.tan(fovY / 2);
    this.fields.fill(0);
    this.fields[0] = f / aspect;
    this.fields[5] = f;
    this.fields[11] = -1;
    const nf = 1 / (near - far);
    this.fields[10] = (far + near) * nf;
    this.fields[14] = 2 * far * near * nf;
    this.fields[15] = 1;
    return this;
  }

  multiplyMatrices(left: Matrix4, right: Matrix4): Matrix4 {
    for(let y = 0; y < 4; y++) {
      for(let x = 0; x < 4; x++) {
        let sum: f64 = 0;
        for(let i = 0; i < 4; i++) {
          sum += left.get(i, y) * right.get(x, i)
        }
        this.set(x, y, sum);
      }
    }
    return this;
  }

  identity(): Matrix4 {
    this.fields.fill(0);
    this
      .set(0, 0, 1)
      .set(1, 1, 1)
      .set(2, 2, 1)
      .set(3, 3, 1);
    return this;
  }
}
