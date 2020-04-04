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

class Vec2 {
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

const GRADIENTS: Vec2[] = new Array<Vec2>(1 << 10);
export function seedGradients(seed: i32): void {
  Math.seedRandom(seed);
  for (let i = 0; i < GRADIENTS.length; i++) {
    GRADIENTS[i] = new Vec2(Math.random() * 2 - 1, Math.random() * 2 - 1)
      .normalize()
      .scalar(sqrt(2));
  }
}

function lerp(v0: f64, v1: f64, v: f64): f64 {
  return v0 * (1 - v) + v1 * v;
}

export function perlinValue(x: f64, y: f64, octave: u8): f64 {
  let p = new Vec2(x, y);
  let gradientStartIndex: i32 = 0; //octave === 0 ? 0 : 1<< (1 << (octave - 1) + 1);

  // Node coordinates
  let n0: Vec2 = Vec2.floor(p);
  let n3: Vec2 = n0 + new Vec2(1, 1);
  let n1: Vec2 = new Vec2(n3.x, n0.y);
  let n2: Vec2 = new Vec2(n0.x, n3.y);

  // Gradient for each node
  let g0: Vec2 =
    GRADIENTS[gradientStartIndex + i32(n0.y) * (1 << (octave + 1)) + i32(n0.x)];
  let g1: Vec2 =
    GRADIENTS[gradientStartIndex + i32(n1.y) * (1 << (octave + 1)) + i32(n1.x)];
  let g2: Vec2 =
    GRADIENTS[gradientStartIndex + i32(n2.y) * (1 << (octave + 1)) + i32(n2.x)];
  let g3: Vec2 =
    GRADIENTS[gradientStartIndex + i32(n3.y) * (1 << (octave + 1)) + i32(n3.x)];

  // Vector from each node to the point (“Distance vector”)
  let d0: Vec2 = p - n0;
  let d1: Vec2 = p - n1;
  let d2: Vec2 = p - n2;
  let d3: Vec2 = p - n3;

  // Dot product of distance vector and gradient vector
  let p0: f64 = d0 * g0;
  let p1: f64 = d1 * g1;
  let p2: f64 = d2 * g2;
  let p3: f64 = d3 * g3;

  // Bilinear interpolation of the dot products
  let by1: f64 = lerp(p0, p1, d0.x);
  let by2: f64 = lerp(p2, p3, d0.x);
  let b: f64 = lerp(by1, by2, d0.y);
  return b;
}

export function renderPerlin(): void {
  // for (let py: u32 = 0; py < height; py++) {
  //   for (let px: u32 = 0; px < width; px++) {
  //     let p = new Vec2(
  //       ((px as f64) / (width as f64)) * 2 ** (octave as f64),
  //       ((py as f64) / (height as f64)) * 2 ** (octave as f64)
  //     );
  //     let gradientStartIndex = octave === 0 ? 0 : (2 ** (octave - 1) + 1) ** 2;
  //   }
  // }
}

/*
float lerp(float a0, float a1, float w) {
    return (1.0f - w)*a0 + w*a1;
}

// Computes the dot product of the distance and gradient vectors.
float dotGridGradient(int ix, int iy, float x, float y) {

    // Precomputed (or otherwise) gradient vectors at each grid node
    extern float Gradient[IYMAX][IXMAX][2];

    // Compute the distance vector
    float dx = x - (float)ix;
    float dy = y - (float)iy;

    // Compute the dot-product
    return (dx*Gradient[iy][ix][0] + dy*Gradient[iy][ix][1]);
}



// Compute Perlin noise at coordinates x, y
export function perlin(x: f64, y: f64): f64 {
    let x0: f64 = Math.floor(x);
    let x1: f64 = x0 + 1;
    let y0: f64 = Math.floor(y);
    let y1: f64 = y0 + 1;

    let sx: f64 = x % 1;
    let sy: f64 = y % 1;


    n0 = dotGridGradient(x0, y0, x, y);
    n1 = dotGridGradient(x1, y0, x, y);
    ix0 = lerp(n0, n1, sx);

    n0 = dotGridGradient(x0, y1, x, y);
    n1 = dotGridGradient(x1, y1, x, y);
    ix1 = lerp(n0, n1, sx);

    value = lerp(ix0, ix1, sy);
    return value;
}
*/
