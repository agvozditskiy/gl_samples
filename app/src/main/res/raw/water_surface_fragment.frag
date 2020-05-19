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

#define TWO_PI 6.283185
#define PI 3.14159265359

vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

vec2 mouse(float x, float y) {
    vec2 cPos = -1.0 + 2.0 * texcoordVarying;
    cPos.x -= rippleCenterUvX;
    cPos.y -= rippleCenterUvY;
    return cPos;
}

// Value Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/lsf3WH
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = smoothstep(0.,1.,f);

    return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                     dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                     dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

float bumpFunc(vec2 st){
    vec2 aspect = vec2(resolution.x/resolution.y,1.);
    float center = length((st-(mouse/resolution.xy*2.-vec2(1.)))*aspect);
    float noisevalue = noise((st+vec2(0.,time*0.5))*5.*aspect);
    noisevalue += noise((st+vec2(0.,time*0.25))*20.*aspect)*0.1;
    return pow(smoothstep(1.3,0.,center)*0.5+noisevalue*0.8,3.);
}

//LIGHTING and BUMP section adapted from https://www.shadertoy.com/view/4l2XWK

vec3 bumpMap(vec3 st){
    vec2 ts = st.xy+(0.,time*0.2);
    vec3 noisedist = vec3(noise(ts.xy*3.6),noise((ts.xy+4.)*3.5),0.)*0.1;
    noisedist += vec3(noise((ts.xy+0.39)*8.),noise((ts.xy+4.2)*8.),0.)*0.05;
    vec3 sp = st+noisedist;
    vec2 eps = vec2(4./resolution.y, 0.);
    float f = bumpFunc(sp.xy); // Sample value multiplied by the amplitude.
    float fx = bumpFunc(sp.xy-eps.xy); // Same for the nearby sample in the X-direction.
    float fy = bumpFunc(sp.xy-eps.yx); // Same for the nearby sample in the Y-direction.

	const float bumpFactor = 0.2;
    fx = (fx-f)/eps.x; // Change in X
    fy = (fy-f)/eps.x; // Change in Y.
    return vec3(fx,fy,0.)*bumpFactor;
}

void main(void) {

      vec2 uv = (gl_FragCoord.xy - resolution.xy*.5)/resolution.y;
        
      
          // VECTOR SETUP - surface postion, ray origin, unit direction vector, and light postion.
          vec3 sp = vec3(uv, 0); // Surface position.
          vec3 rd = normalize(vec3(uv, 1.)); // Direction vector from the origin to the screen plane.
          vec3 lp = vec3(mouse/resolution.xy*2.-vec2(1.), -0.5); // Light position
      	vec3 sn = vec3(0., 0., -1); // Plane normal. Z pointing toward the viewer.
          
          // Using the gradient vector, "vec3(fx, fy, 0)," to perturb the XY plane normal ",vec3(0, 0, -1)." 
          sn = normalize( sn + bumpMap(sp));           
         
          
          // LIGHTING
      	// Determine the light direction vector, calculate its distance, then normalize it.
      	vec3 ld = lp - sp;
      	float lDist = max(length(ld), 0.001);
      	ld /= lDist;  
          float atten = 1./(1.0 + lDist*lDist*0.15);
      
      	// Diffuse value.
      	float diff = max(dot(sn, ld), 0.);  
          // Specular highlighting.
          float spec = pow(max(dot( reflect(-ld, sn), -rd), 0.), 8.);
          float grain = noise(uv.xy*110.);
          gl_FragColor = vec4(vec3(diff*0.7+spec*0.75)*(vec3(1.,0.2,0.2)+vec3(grain*0.1)),1.);
}