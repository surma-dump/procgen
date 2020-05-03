#version 300 es

precision highp float;

in vec3 projected_normal;

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

  float diff = clamp(dot(normalize(-sun_direction), normalize(projected_normal)), 0., 1.);
  vec4 normal_color = vec4(normalize(projected_normal.xyz)/2.+.5, 1.0);
  fragColor = mix(mix(black, normal_color, .5), normal_color , diff);
  // fragColor = mix(red, green, clamp((pos.y + scale)/(2.*scale), 0., 1.));
  // float h = abs(mod(pos.y, 2.))/2.;
  // float l = (1. - step(.05, h)) + step(.95, h);
  // fragColor = mix(fragColor, white, l);
  // fragColor = vec4(normalize(projected_normal).xyz / 2. + .5, 1.0);
}