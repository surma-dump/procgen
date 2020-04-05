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

export function clamp(min: f64, max: f64, v: f64): f64 {
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
  v = clamp(0, 1, v);
  return v * v * (3 - 2*v);
}

export function smoothLerp(v0: f64, v1: f64, v: f64): f64 {
  return lerp(v0, v1, smooth(v));
}