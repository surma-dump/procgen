#version 300 es

precision highp float;

uniform mat4 camera;
uniform vec2 canvas;

out vec4 fragColor;

vec4 red = vec4(1.0, 0.0, 0.0, 1.0);
vec4 green = vec4(0.0, 1.0, 0.0, 1.0);
void main() {
  vec4 ndc = vec4(
    (gl_FragCoord.xy/canvas.xy) * 2. - 1.,
    gl_FragCoord.z * 2. - 1.,
    1.
  );

  vec4 pos = inverse(camera) * (ndc / gl_FragCoord.w);
  fragColor = mix(red, green, clamp((pos.y + 20.)/40., 0., 1.));
}