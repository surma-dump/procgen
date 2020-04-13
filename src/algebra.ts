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
