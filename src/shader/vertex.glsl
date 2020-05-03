#version 300 es

precision highp float;

in vec3 position;
in vec3 normal;

uniform mat4 camera;

out vec4 projected_normal;

void main() {
  gl_Position = camera * vec4(position, 1.0);
  projected_normal = transpose(inverse(camera)) * vec4(normal, 0.);
}