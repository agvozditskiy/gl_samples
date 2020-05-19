#ifdef GL_ES
precision highp float;
#endif

varying vec2 texcoordVarying;  // position received from vertex shader
uniform sampler2D texture;

uniform float time;
uniform vec2 resolution;
uniform float rippleOffset;
uniform float rippleCenterUvX;
uniform float rippleCenterUvY;
uniform float alpha;

#define PI 3.14159265359
#define WAVES 8.

   float wavePosition(vec2 uv, float i) {
       return sin((uv.x + i * 8.456) * (sin(time * 0.1 + 7.539 + i * 0.139) + 2.) * 0.5) * 0.65
           + sin(uv.x * (sin(time * 0.1 + i * 0.2) + 2.) * 0.3) * 0.3
           - (i - WAVES / 2.) * 2. - uv.y;
   }

   // http://iquilezles.org/www/articles/palettes/palettes.htm
   vec3 colorPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
       return a + b * cos(PI * 2. * (c * t + d));
   }
   vec3 color(float x) {
       return colorPalette(x, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(2., 1., 0.), vec3(0.5, 0.2, 0.25));
   }

void main(void) {

       vec2 uv = gl_FragCoord.xy / resolution.xy;

       vec2 waveUv = (2. * gl_FragCoord.xy - resolution.xy) / resolution.y * (WAVES - 1.);

       float aa = WAVES * 2. / resolution.y;

       for (float i = 0.; i < WAVES; i++) {
           float waveTop = wavePosition(waveUv, i);
           float waveBottom = wavePosition(waveUv, i + 1.);

           vec3 col = color(i * 0.12 + uv.x * 0.2 + time * 0.02);

           col += smoothstep(0.3, 0., waveTop) * 0.05;
           col += (1. - abs(0.5 - smoothstep(waveTop, waveBottom, 0.))) * 0.06;
           col += smoothstep(-0.3, 0., waveBottom) * -0.05;

           gl_FragColor.xyz = mix(gl_FragColor.xyz, col, smoothstep(0., aa, waveTop));
       }

       gl_FragColor.w = 1.;
}