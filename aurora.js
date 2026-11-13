/**
 * Aurora — WebGL2 light-mode adaptation of the React Bits Aurora supplied by the user.
 * Static HTML/CSS/JS, no network dependency or React runtime needed on Hostinger.
 * A CSS aurora remains visible if WebGL2 is unavailable.
 */
(() => {
  'use strict';
  const container = document.querySelector('[data-aurora]');
  if (!container) return;
  const canvas = container.querySelector('canvas');
  if (!canvas) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const colors = ['#d7c8aa', '#c6dfd2', '#b4cdc1', '#e4d5b5'];
  const MAX_STOPS = 5;
  const MAX_LAYERS = 3;
const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uStops[${MAX_STOPS}];
uniform int uStopCount;
uniform float uAmplitude;
uniform float uBlend;
uniform float uHeight;
uniform float uScale;
uniform float uGlow;
uniform float uBrightness;
uniform int uLayers;
uniform float uFlip;
uniform vec3 uPointer;
uniform float uReveal;
uniform float uOpacity;
uniform float uLightMode;
out vec4 outColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float smootherstep(float edge0, float edge1, float x) {
  float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec3 oklabToLinear(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

vec3 ramp(float t) {
  float x = clamp(t, 0.0, 1.0) * float(uStopCount - 1);
  int i = int(min(floor(x), float(uStopCount - 2)));
  float f = x - float(i);
  f = f * f * (3.0 - 2.0 * f);
  vec3 lch = mix(uStops[i], uStops[i + 1], f);
  lch.x = mix(lch.x, min(lch.x, 0.7), uLightMode);
  return toSrgb(oklabToLinear(vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z))));
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float y = 1.0 - frag.y / uResolution.y;
  y = mix(y, 1.0 - y, uFlip);
  float u = frag.x / uResolution.x;
  float X = (frag.x - uResolution.x * 0.5) / uResolution.y;
  float t = uTime;
  float reach = uPointer.z * exp(-pow((X - uPointer.x) / 0.38, 2.0));

  vec3 glow = vec3(0.0);
  float cover = 0.0;
  for (int k = 0; k < ${MAX_LAYERS}; k++) {
    if (k >= uLayers) break;
    float layer = float(k);
    float seed = layer * 13.7;
    float pace = t * (1.0 - layer * 0.18);
    float warp = snoise(vec2(X * 0.45 * uScale + pace * 0.02 + seed, pace * 0.05 + seed));
    float wave = snoise(vec2(X * 0.75 * uScale + warp * 0.35 - pace * 0.03 + seed, pace * 0.07 - seed)) * 0.72
      + snoise(vec2(X * 1.6 * uScale + warp * 0.5 + pace * 0.04 - seed, pace * 0.1 + seed * 0.5)) * 0.28;
    float hem = uHeight + layer * 0.07 + wave * 0.15 * uAmplitude;
    hem += reach * 0.08 * (layer < 0.5 ? 1.0 : 0.4);
    hem = mix(-0.25, hem, uReveal);

    float soft = (0.04 + uBlend * 0.16) * (1.0 + layer * 0.9);
    float rise = hem - y;
    float low = -soft - uGlow * 0.14;
    float high = 0.26 + soft * 0.6;
    float body = pow(smootherstep(low, high, rise), 1.5 + uGlow * 0.6);
    float lobes = 0.86 + 0.14 * snoise(vec2(X * 0.9 * uScale - pace * 0.025 + seed, y * 0.3 + pace * 0.04));
    float alpha = body * lobes * (layer < 0.5 ? 1.0 : 0.32 / layer);
    alpha = clamp(alpha * (1.0 + reach * 0.25 * smootherstep(0.9, 0.0, abs(y - hem))), 0.0, 1.0);

    vec3 tint = ramp(u + 0.05 * sin(pace * 0.08 + layer * 2.3) + layer * 0.1 + max(rise, 0.0) * 0.05);
    glow = 1.0 - (1.0 - glow) * (1.0 - tint * alpha);
    cover = 1.0 - (1.0 - cover) * (1.0 - alpha);
  }

  float fade = smootherstep(0.0, 0.7, uReveal) * uOpacity;
  float strength = clamp(uBrightness, 0.0, 2.0);
  glow *= fade * min(strength, 1.0);
  cover *= fade * min(strength, 1.0);
  glow = 1.0 - pow(1.0 - glow, vec3(max(strength, 1.0)));
  float dither = (hash(frag) - 0.5) / 255.0;

  if (uLightMode > 0.5) {
    vec3 tint = cover > 0.0001 ? glow / cover : vec3(0.0);
    cover *= smootherstep(0.0, 0.25, cover);
    float alpha = cover * 0.7;
    outColor = vec4(tint * alpha + dither, clamp(alpha + dither, 0.0, 1.0));
    return;
  }
  outColor = vec4(glow + dither, clamp(cover + dither, 0.0, 1.0));
}`;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const toOklch = rgb => {
    const [r, g, b] = rgb.map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return [L, Math.hypot(A, B), Math.atan2(B, A)];
  };
  const stops = colors.map(hex => toOklch([1,3,5].map(i => parseInt(hex.slice(i, i+2),16)/255)));
  let hue = stops[0][2];
  const palette = new Float32Array(MAX_STOPS * 3);
  stops.forEach((stop, i) => {
    let current = stop[1] > .02 ? stop[2] : hue;
    while (current - hue > Math.PI) current -= Math.PI * 2;
    while (current - hue < -Math.PI) current += Math.PI * 2;
    hue = current;
    palette.set([stop[0], stop[1], hue], i*3);
  });
  let gl;
  try { gl = canvas.getContext('webgl2', {alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,powerPreference:'low-power'}); }
  catch { return; }
  if (!gl) return;
  function shader(type, source) {
    const item = gl.createShader(type);
    if (!item) return null;
    gl.shaderSource(item, source);
    gl.compileShader(item);
    if (gl.getShaderParameter(item, gl.COMPILE_STATUS)) return item;
    console.warn('Aurora shader unavailable:', gl.getShaderInfoLog(item));
    gl.deleteShader(item);
    return null;
  }
  const vertex=shader(gl.VERTEX_SHADER, VERTEX), fragment=shader(gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vertex || !fragment) return;
  const program=gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program,0,'aPosition');
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) { gl.deleteProgram(program); return; }
  const u = {};
  for(let i=0;i<gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS);i++) {
    const item=gl.getActiveUniform(program,i);
    if(item) u[item.name.replace('[0]','')]=gl.getUniformLocation(program,item.name);
  }
  const buffer=gl.createBuffer(),vao=gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  let width=1,height=1,visible=true,raf=0,last=0,clock=0,fadeIn=0;
  const pointer={x:0,y:.5,intensity:0,inside:false};
  let lastFrame=0;
  const prefersStill=() => reduced.matches;
  function draw(){
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform2f(u.uResolution,canvas.width,canvas.height);
    gl.uniform1f(u.uTime,clock);
    gl.uniform3fv(u.uStops,palette);
    gl.uniform1i(u.uStopCount,colors.length);
    gl.uniform1f(u.uAmplitude,.56);
    gl.uniform1f(u.uBlend,.78);
    gl.uniform1f(u.uHeight,.57);
    gl.uniform1f(u.uScale,.72);
    gl.uniform1f(u.uGlow,.78);
    gl.uniform1f(u.uBrightness,.84);
    gl.uniform1i(u.uLayers,2);
    gl.uniform1f(u.uFlip,0);
    gl.uniform3f(u.uPointer,pointer.x,pointer.y,pointer.intensity);
    gl.uniform1f(u.uReveal,prefersStill()?1:fadeIn);
    gl.uniform1f(u.uOpacity,.59);
    gl.uniform1f(u.uLightMode,1);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  const resize=()=>{
    width=Math.max(1,container.clientWidth);
    height=Math.max(1,container.clientHeight);
    const ratio=Math.min(window.devicePixelRatio||1,1.5);
    canvas.width=Math.max(1,Math.round(width*ratio));
    canvas.height=Math.max(1,Math.round(height*ratio));
    draw();
  };
  function tick(now){
    raf=0;
    if(!visible||document.hidden) return;
    const dt=last?clamp((now-last)/1000,.001,.05):1/60;
    last=now;
    if(!prefersStill()) {
      clock+=dt*.36;
      fadeIn=Math.min(1,fadeIn+dt/1.7);
      pointer.intensity+=( (pointer.inside?1:0)-pointer.intensity )*Math.min(1,dt*1.4);
    } else { fadeIn=1;pointer.intensity=0; }
    if(now-lastFrame>31 || prefersStill()) { draw();lastFrame=now; }
    if(!prefersStill()) raf=requestAnimationFrame(tick);
  }
  const wake=()=>{
    if(!visible || document.hidden) return;
    if(prefersStill()){ fadeIn=1;draw();return; }
    if(!raf){last=0;raf=requestAnimationFrame(tick);}
  };
  const onPointer=event=>{
    if(prefersStill())return;
    const r=container.getBoundingClientRect();
    const x=event.clientX-r.left, y=event.clientY-r.top;
    pointer.inside=x>=0&&y>=0&&x<=r.width&&y<=r.height;
    if(pointer.inside){pointer.x=(x-r.width*.5)/Math.max(1,r.height);pointer.y=y/Math.max(1,r.height);}
  };
  const onLeave=()=>{pointer.inside=false;};
  container.addEventListener('pointermove',onPointer,{passive:true});
  container.addEventListener('pointerleave',onLeave,{passive:true});
  document.addEventListener('visibilitychange',wake);
  reduced.addEventListener?.('change',()=>{cancelAnimationFrame(raf);raf=0;resize();wake();});
  if('ResizeObserver' in window) new ResizeObserver(resize).observe(container);
  else window.addEventListener('resize',resize,{passive:true});
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{
      visible=entries.some(e=>e.isIntersecting);
      if(!visible){cancelAnimationFrame(raf);raf=0;}
      else wake();
    },{threshold:.01}).observe(container);
  }
  resize();
  canvas.classList.add('is-ready');
  container.classList.add('has-webgl');
  wake();
})();
