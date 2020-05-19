// Created by sebastien durand - 2016
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//-----------------------------------------------------
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

#define NB 40.
#define MAX_VEL .5

// Distance to a fish
float sdFish(float i, vec2 p, float a) {
    float ds, c = cos(a), s = sin(a);
    p *= 20.*mat2(c,s,-s,c); // Rotate and rescale
    p.x *= .97 + (.04+.2*p.y)*cos(i+9.*time);  // Swiming ondulation (+rotate in Z axes)
    ds = min(length(p-vec2(.8,0))-.45, length(p-vec2(-.14,0))-.12);   // Distance to fish
    p.y = abs(p.y)+.13;
    return max(min(length(p),length(p-vec2(.56,0)))-.3,-ds)*.05;
}

void main(void) {
    vec2 p = 1./resolution.xy;
    float d, m = 1e6;
    vec4 c, ct, fish;
    vec2 uv = texcoordVarying;

    for(float i=0.; i<NB; i++) {
        fish = texture2D(texture,vec2(i,0.0)); // (xy = position, zw = velocity)
        m = min(m, d = sdFish(i, fish.xy-uv.xy*p.y, atan(fish.w,fish.z))); // Draw fish according to its direction
        // Background color sum based on fish velocity (blue => red) + Halo - simple version: c*smoothstep(.5,0.,d);
        ct += mix(vec4(0,0,1,1), vec4(1,0,0,1), length(fish.zw)/MAX_VEL)*(2./(1.+3e3*d*d*d) + .5/(1.+30.*d*d));
    }
    // Mix fish color (white) and Halo
    gl_FragColor = mix(vec4(1.),.5*sqrt(ct/NB), smoothstep(0.,p.y*1.2, m));
}