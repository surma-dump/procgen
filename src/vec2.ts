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

export class Vec2 {
  constructor(public x: f64, public y: f64) {}

  @operator("+")
  static add(left: Vec2, right: Vec2): Vec2 {
    return new Vec2(left.x + right.x, left.y + right.y);
  }

  @operator("-")
  static subtract(left: Vec2, right: Vec2): Vec2 {
    return new Vec2(left.x - right.x, left.y - right.y);
  }

  scalar(right: f64): Vec2 {
    return new Vec2(this.x * right, this.y * right);
  }

  @operator("*")
  static dot(left: Vec2, right: Vec2): f64 {
    return left.x * right.x + left.y * right.y;
  }

  length(): f64 {
    return sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize(): Vec2 {
    let len: f64 = this.length();
    this.x /= len;
    this.y /= len;
    return this;
  }

  static normalize(v: Vec2): Vec2 {
    let len: f64 = v.length();
    return new Vec2(v.x / len, v.y / len);
  }

  static floor(v: Vec2): Vec2 {
    return new Vec2(floor(v.x), floor(v.y));
  }

  static ceil(v: Vec2): Vec2 {
    return new Vec2(ceil(v.x), ceil(v.y));
  }

  mod(v: f64): Vec2 {
    this.x %= v;
    this.y %= v;
    return this;
  }
}
