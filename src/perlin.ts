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

const GRADIENTS: Vec2[] = new Array<Vec2>(128).map(() =>
  new Vec2(Math.random(), Math.random()).normalize()
);

class Vec2 {
  constructor(public x: f32, public y: f32) {}

  @operator("+")
  static add(left: Vec2, right: Vec2): Vec2 {
    return new Vec2(left.x + right.x, left.y + right.y);
  }

  @operator("-")
  static subtract(left: Vec2, right: Vec2): Vec2 {
    return new Vec2(left.x - right.x, left.y - right.y);
  }

  scalar(right: f32): Vec2 {
    return new Vec2(this.x * right, this.y * right);
  }

  @operator("*")
  static dot(left: Vec2, right: Vec2): f32 {
    return left.x * right.x + left.y + right.y;
  }

  length(): f32 {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize(): Vec2 {
    let len: f32 = this.length();
    this.x /= len;
    this.y /= len;
    return this;
  }

  static normalize(v: Vec2): Vec2 {
    let len: f32 = v.length();
    return new Vec2(v.x / len, v.y / len);
  }

  static floor(v: Vec2): Vec2 {
    return new Vec2(
      Math.floor(v.x),
      Math.floor(v.y)
    )
  }

  static ceil(v: Vec2): Vec2 {
    return new Vec2(
      Math.ceil(v.x),
      Math.ceil(v.y)
    )
  }

  mod(v: f32): Vec2 {
    this.x %= v;
    this.y %= v;
    return this;
  }
}

function sumOfSquares(start: u32, end: u32): u32 {
  if(end < start) {
    return 0;
  }
  let upper: u32 =  end * (end + 1) * (2 * end  + 1) / 6;
  let lower: u32 =  start * (start + 1) * (2 * start  + 1) / 6;
  return upper - lower;
}

export function perlin(width: u32, height: u32, octave: u8): f32 {
  for (let py: u32 = 0; py < height; py++) {
    for (let px: u32 = 0; px < width; px++) {
      let p = new Vec2(
       ((px as f32) / (width as f32)) * 2 ** (octave as f32),
       ((py as f32) / (height as f32)) * 2 ** (octave as f32)
      );
      // o(0) = [0 - 3]
      // o(1) = [4 - 12]
      // o(2) = [13 - 28]
      // o(n) = [sum(n^2, 2, n-1) sum(n^2, 0, n) - 1]
      let gradientStart = sumOfSquares(1, octave + 1)

      let n0 = Vec2.floor(p);
      let n3 = Vec2.floor(p);
      let n1 = new Vec2(n3.x, n0.y);
      let n2 = new Vec2(n0.x, n3.y);
      let d0 = p - n0;
      let d1 = p - n1;
      let d2 = p - n2;
      let d3 = p - n3;
      
    }
  }
  let a = new Vec2(1, 2);
  let b = new Vec2(2, 3);
  return a * b;
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
export function perlin(x: f32, y: f32): f32 {
    let x0: f32 = Math.floor(x);
    let x1: f32 = x0 + 1;
    let y0: f32 = Math.floor(y);
    let y1: f32 = y0 + 1;

    let sx: f32 = x % 1;
    let sy: f32 = y % 1;


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
