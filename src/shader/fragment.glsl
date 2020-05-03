#version 300 es

precision highp float;

in vec4 projected_normal;

uniform mat4 camera;
uniform vec2 canvas;
uniform vec3 sun_direction;

out vec4 fragColor;

vec4 white = vec4(1.0, 1.0, 1.0, 1.0);
vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
void main() {
  vec4 ndc = vec4(
    (gl_FragCoord.xy/canvas.xy) * 2. - 1.,
    gl_FragCoord.z * 2. - 1.,
    1.
  );
  vec4 pos = inverse(camera) * (ndc / gl_FragCoord.w);

  vec3 normal = normalize((transpose(camera) * projected_normal).xyz);
  float diff = clamp(dot(normalize(-sun_direction), normal), 0., 1.);
  vec4 normal_color = vec4(normal/2.+.5, 1.0);
  fragColor = mix(mix(black, normal_color, .5), normal_color , diff);
}