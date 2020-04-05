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

import { Vec2 } from "./vec2.ts";
import { smoothLerp, remap } from "./utils.ts";

const GRADIENTS: Vec2[] = new Array<Vec2>(1 << 10);
export function seedGradients(seed: i32): void {
  Math.seedRandom(seed);
  for (let i = 0; i < GRADIENTS.length; i++) {
    GRADIENTS[i] = new Vec2(Math.random() * 2 - 1, Math.random() * 2 - 1)
      .normalize()
      .scalar(sqrt(2));
  }
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
  let by1: f64 = smoothLerp(p0, p1, d0.x);
  let by2: f64 = smoothLerp(p2, p3, d0.x);
  let b: f64 = smoothLerp(by1, by2, d0.y);
  return b;
}

export function renderPerlin(
  width: u32,
  height: u32,
  octave: u8
): Float64Array {
  const b = new Float64Array(width * height);
  for (let py: u32 = 0; py < height; py++) {
    for (let px: u32 = 0; px < width; px++) {
      let p = new Vec2(
        ((px as f64) / (width as f64)) * 2 ** (octave as f64),
        ((py as f64) / (height as f64)) * 2 ** (octave as f64)
      );
      b[py * width + px] = perlinValue(p.x, p.y, octave);
    }
  }
  return b;
}

export function toBitmap(perlin: Float64Array): Uint8ClampedArray {
  const bmp = new Uint8ClampedArray(perlin.length * 4);
  for (let i = 0; i < perlin.length; i++) {
    if (perlin[i] > 0) {
      bmp[i * 4 + 1] = <u8>floor(remap(perlin[i], 0, 1, 0, 255));
    } else {
      bmp[i * 4 + 0] = <u8>floor(remap(perlin[i], -1, 0, 255, 0));
    }
    bmp[i * 4 + 3] = 255;
  }
  return bmp;
}