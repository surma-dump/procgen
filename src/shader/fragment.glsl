#version 300 es

precision highp float;

in vec3 face_normal;

uniform mat4 camera;
uniform vec2 canvas;
uniform vec3 spot_light;

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

  vec3 light_direction = spot_light - pos.xyz;
  float dist = length(light_direction);
  float diff = clamp(dot(normalize(light_direction), face_normal), 0., 1.);
  fragColor = mix(white,  mix(black, white, .1), smoothstep(50., 150., dist));
  fragColor = mix(black, fragColor, diff);
}