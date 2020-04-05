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

export function clamp(v: f64, min: f64, max: f64): f64 {
  if(v < min) {
    return min;
  }
  if(v > max) {
    return max;
  }
  return v;
}

export function remap(v: f64, minIn: f64, maxIn: f64, minOut: f64, maxOut: f64): f64 {
  return (v - minIn) / (maxIn - minIn) * (maxOut - minOut) + minOut;
}

export function lerp(v0: f64, v1: f64, v: f64): f64 {
  return v0 * (1 - v) + v1 * v;
}

export function smooth(v: f64): f64 {
  v = clamp(v, 0, 1);
  return v * v * (3 - 2*v);
}

export function smoothLerp(v0: f64, v1: f64, v: f64): f64 {
  return lerp(v0, v1, smooth(v));
}

export function hsl2rgb(h: f64, s: f64, l: f64): u8[] {
  const c = (1 - abs(2*l - 1))*s;
  const x = c * (1 - abs((h/60) % 2 - 1));
  const m = l - c/2;
  let r: f64 = 0;
  let g: f64 = 0;
  let b : f64 = 0;
  if(h < 60)  {
    r = c; g = x;
  } else if (h < 120) {
    r = x; g = c;
  } else if (h < 180) {
    g =c, b =x;
  } else if (h < 240) {
    g =x; b = c;
  } else if (h < 300) {
    b = c; r = x;
  } else {
    b =x; r = c;
  }
  return [
    <u8>((r + m)*255),
    <u8>((g + m)*255),
    <u8>((b + m)*255)
  ]
}