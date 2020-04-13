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

import { reportProgress, resetProgress } from "./env.ts";
import { Vec3 } from "./algebra.ts";
import { clamp, hsl2rgb, smoothLerp, remap } from "./utils.ts";

const GRADIENTS: Vec3[] = [
  new Vec3(0, 1, 1),
  new Vec3(0, -1, 1),
  new Vec3(0, 1, -1),
  new Vec3(0, -1, -1),
  new Vec3(1, 0, 1),
  new Vec3(-1, 0, 1),
  new Vec3(1, 0, -1),
  new Vec3(-1, 0, -1),
  new Vec3(1, 1, 0),
  new Vec3(-1, 1, 0),
  new Vec3(1, -1, 0),
  new Vec3(-1, -1, 0)
].map<Vec3>(vec => vec.normalize().scalar(1 / sqrt(2)));

let seed = 0;
export function seedGradients(_seed: i32): void {
  seed = _seed;
}

function getGradientForNode(n: Vec3, octave: u8): Vec3 {
  Math.seedRandom(
    seed +
      <i64>floor(n.z * 32) +
      <i64>floor(n.y * 13) +
      <i64>floor(n.x) +
      octave
  );
  const index: i32 = <i32>floor(Math.random() * GRADIENTS.length);
  return GRADIENTS[index];
}

// Static variables for `perlinValue`
const one: Vec3 = new Vec3(1, 1, 1);

const n000: Vec3 = new Vec3(0, 0, 0);
const n111: Vec3 = new Vec3(0, 0, 0);
const n001: Vec3 = new Vec3(0, 0, 0);
const n010: Vec3 = new Vec3(0, 0, 0);
const n011: Vec3 = new Vec3(0, 0, 0);
const n100: Vec3 = new Vec3(0, 0, 0);
const n101: Vec3 = new Vec3(0, 0, 0);
const n110: Vec3 = new Vec3(0, 0, 0);

const d000: Vec3 = new Vec3(0, 0, 0);
const d111: Vec3 = new Vec3(0, 0, 0);
const d001: Vec3 = new Vec3(0, 0, 0);
const d010: Vec3 = new Vec3(0, 0, 0);
const d011: Vec3 = new Vec3(0, 0, 0);
const d100: Vec3 = new Vec3(0, 0, 0);
const d101: Vec3 = new Vec3(0, 0, 0);
const d110: Vec3 = new Vec3(0, 0, 0);
export function perlinValue(p: Vec3, octave: u8): f64 {
  // Node coordinates
  n000.copyFrom(p).floor();
  n111.addVectors(n000, one);
  n001.set(n000.x, n000.y, n111.z);
  n010.set(n000.x, n111.y, n000.z);
  n011.set(n000.x, n111.y, n111.z);
  n100.set(n111.x, n000.y, n000.z);
  n101.set(n111.x, n000.y, n111.z);
  n110.set(n111.x, n111.y, n000.z);

  // Gradient for each node
  const g000: Vec3 = getGradientForNode(n000, octave);
  const g111: Vec3 = getGradientForNode(n111, octave);
  const g001: Vec3 = getGradientForNode(n001, octave);
  const g010: Vec3 = getGradientForNode(n010, octave);
  const g011: Vec3 = getGradientForNode(n011, octave);
  const g100: Vec3 = getGradientForNode(n100, octave);
  const g101: Vec3 = getGradientForNode(n101, octave);
  const g110: Vec3 = getGradientForNode(n110, octave);

  // Vector from each node to the point (“Distance vector”)
  d000.subtractVectors(p, n000);
  d111.subtractVectors(p, n111);
  d001.subtractVectors(p, n001);
  d010.subtractVectors(p, n010);
  d011.subtractVectors(p, n011);
  d100.subtractVectors(p, n100);
  d101.subtractVectors(p, n101);
  d110.subtractVectors(p, n110);

  // Dot product of distance vector and gradient vector
  const p000: f64 = d000 * g000;
  const p111: f64 = d111 * g111;
  const p001: f64 = d001 * g001;
  const p010: f64 = d010 * g010;
  const p011: f64 = d011 * g011;
  const p100: f64 = d100 * g100;
  const p101: f64 = d101 * g101;
  const p110: f64 = d110 * g110;

  // Bilinear interpolation of the dot products
  const by1: f64 = smoothLerp(p000, p100, d000.x);
  const by2: f64 = smoothLerp(p001, p101, d000.x);
  const by3: f64 = smoothLerp(p010, p110, d000.x);
  const by4: f64 = smoothLerp(p011, p111, d000.x);
  const bz1: f64 = smoothLerp(by1, by3, d000.y);
  const bz2: f64 = smoothLerp(by2, by4, d000.y);
  const b: f64 = smoothLerp(bz1, bz2, d000.z);
  return b;
}

const p = new Vec3(0, 0, 0);
export function multiOctavePerlinValue(
  x: f64,
  y: f64,
  z: f64,
  octave0: f64,
  octave1: f64,
  octave2: f64,
  octave3: f64,
  octave4: f64,
  octave5: f64,
  octave6: f64
): f64 {
  p.set(x, y, z);
  const octaveFactors: f64[] = [
    octave0,
    octave1,
    octave2,
    octave3,
    octave4,
    octave5,
    octave6
  ];
  let sum: f64 = 0;
  for (let octave = 0; octave < octaveFactors.length; octave++) {
    const factor = octaveFactors[octave];
    if (factor !== 0) {
      sum += perlinValue(p, <u8>octave) * factor;
    }
    // Next octave in X and Y
    p.x *= 2;
    p.y *= 2;
  }
  return sum;
}

export function renderPerlin(
  width: u32,
  height: u32,
  z: f64,
  octave0: f64,
  octave1: f64,
  octave2: f64,
  octave3: f64,
  octave4: f64,
  octave5: f64,
  octave6: f64
): ArrayBuffer {
  resetProgress();
  const totalPixels = width * height;
  const b = new Float64Array(totalPixels);
  for (let py: u32 = 0; py < height; py++) {
    for (let px: u32 = 0; px < width; px++) {
      const x: f64 = <f64>px / <f64>width;
      const y: f64 = <f64>py / <f64>height;
      const pixelIndex: u32 = py * width + px;
      b[pixelIndex] = multiOctavePerlinValue(
        x,
        y,
        z,
        octave0,
        octave1,
        octave2,
        octave3,
        octave4,
        octave5,
        octave6
      );
      reportProgress(<i8>floor((<f32>pixelIndex * 100) / <f32>totalPixels));
    }
  }
  return b.buffer;
}

export function threshold(
  perlin: ArrayBuffer,
  threshold: f64,
  inPlace: bool
): ArrayBuffer {
  const perlinView = Float64Array.wrap(perlin);
  let out = perlinView;
  if (!inPlace) {
    out = new Float64Array(perlinView.length);
  }
  for (let i = 0; i < perlinView.length; i++) {
    out[i] = perlinView[i] < threshold ? -1 : 1;
  }
  return out.buffer;
}

export function redGreenBitmap(perlin: ArrayBuffer): ArrayBuffer {
  const perlinView = Float64Array.wrap(perlin);
  const bmp = new Uint8ClampedArray(perlinView.length * 4);
  for (let i = 0; i < perlinView.length; i++) {
    if (perlinView[i] > 0) {
      bmp[i * 4 + 1] = <u8>floor(remap(perlinView[i], 0, 1, 0, 255));
    } else {
      bmp[i * 4 + 0] = <u8>floor(remap(perlinView[i], -1, 0, 255, 0));
    }
    bmp[i * 4 + 3] = 255;
  }
  return bmp.buffer;
}

export function blackWhiteBitmap(perlin: ArrayBuffer): ArrayBuffer {
  const perlinView = Float64Array.wrap(perlin);
  const bmp = new Uint8ClampedArray(perlinView.length * 4);
  for (let i = 0; i < perlinView.length; i++) {
    bmp[i * 4 + 0] = <u8>floor(remap(perlinView[i], -1, 1, 0, 255));
    bmp[i * 4 + 1] = bmp[i * 4 + 0];
    bmp[i * 4 + 2] = bmp[i * 4 + 0];
    bmp[i * 4 + 3] = 255;
  }
  return bmp.buffer;
}

function getColorForLevel(v: f64): u8[] {
  if (v >= 0.3) {
    // Snow tops
    const c = <u8>remap(clamp(v, 0.3, 0.4), 0.3, 0.4, 170, 255);
    return [c, c, c];
  } else if (v >= 0.2) {
    // Bare mountain
    return hsl2rgb(20, 0.8, remap(v, 0.2, 0.3, 0.3, 0.4));
  } else if (v >= 0.1)
    // Greenland
    return hsl2rgb(120, 1, remap(v, 0.1, 0.2, 0.5, 0.3));
  else if (v >= 0.072)
    // Beach
    return [255, 230, 180];
  else if (v >= 0.05)
    // Shallow water
    return [0, 255, 255];
  // Sea water
  else return [0, 0, <u8>remap(v, 0.05, -1, 200, 70)];
}

export function worldBitmap(perlin: ArrayBuffer): ArrayBuffer {
  resetProgress();
  const perlinView = Float64Array.wrap(perlin);
  const bmp = new Uint8ClampedArray(perlinView.length * 4);
  for (let i = 0; i < perlinView.length; i++) {
    const color = getColorForLevel(perlinView[i]);
    bmp[i * 4 + 0] = color[0];
    bmp[i * 4 + 1] = color[1];
    bmp[i * 4 + 2] = color[2];
    bmp[i * 4 + 3] = 255;
    reportProgress(<i8>floor((<f32>i * 100) / <f32>perlinView.length));
  }
  return bmp.buffer;
}

export function add(
  map0: ArrayBuffer,
  map1: ArrayBuffer,
  inPlace: bool
): ArrayBuffer {
  const map0View = Float64Array.wrap(map0);
  const map1View = Float64Array.wrap(map1);
  if (map0View.length !== map1View.length) {
    throw Error("Can’t add Perlin noise of different sizes");
  }
  let out = map0View;
  if (!inPlace) {
    out = new Float64Array(map0View.length);
  }
  for (let i = 0; i < out.length; i++) {
    out[i] = map0View[i] + map1View[i];
  }
  return out.buffer;
}

export function multiply(
  map0: ArrayBuffer,
  map1: ArrayBuffer,
  inPlace: bool
): ArrayBuffer {
  const map0View = Float64Array.wrap(map0);
  const map1View = Float64Array.wrap(map1);
  if (map0View.length !== map1View.length) {
    throw Error("Can’t multiply Perlin noise of different sizes");
  }
  let out = map0View;
  if (!inPlace) {
    out = new Float64Array(map0View.length);
  }
  for (let i = 0; i < out.length; i++) {
    out[i] = map0View[i] * map1View[i];
  }
  return out.buffer;
}

export function min(
  map0: ArrayBuffer,
  map1: ArrayBuffer,
  inPlace: bool
): ArrayBuffer {
  const map0View = Float64Array.wrap(map0);
  const map1View = Float64Array.wrap(map1);
  if (map0View.length !== map1View.length) {
    throw Error("Can’t min Perlin noise of different sizes");
  }
  let out = map0View;
  if (!inPlace) {
    out = new Float64Array(map0View.length);
  }
  for (let i = 0; i < out.length; i++) {
    out[i] = map0View[i] < map1View[i] ? map0View[i] : map1View[i];
  }
  return out.buffer;
}
