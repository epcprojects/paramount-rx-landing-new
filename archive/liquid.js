// Scroll-scrubbed water surface: one fragment shader, no libraries.
// progress 0 → 0.28: droplet falls toward a still surface (top-down view)
// 0.28: impact — crown flash + splash droplets
// 0.28 → 1: ripples expand and decay; the ripple front reveals the text "under" the water.

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform sampler2D uText;
uniform vec2 uRes;
uniform float uP;
uniform float uTime;
uniform vec2 uImpact;
varying vec2 vUv;

const float IMPACT_AT = 0.28;

float aspect() { return uRes.x / uRes.y; }

// Expanding wave packets from the impact point. q is aspect-corrected, relative to impact.
float ripple(vec2 q, float T) {
  float r = length(q);
  float h = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float t = T - fi * 0.17;
    if (t > 0.0) {
      float front = 0.02 + 0.46 * t;
      float d = r - front;
      float env = exp(-d * d / (0.0025 + 0.012 * t));
      h += (1.0 - fi * 0.2) * env * sin(d * 85.0) * exp(-1.5 * t) / (1.0 + 5.0 * r);
    }
  }
  return h * 0.03;
}

float idle(vec2 q, float time) {
  return 0.0012 * (sin(q.x * 13.0 + time * 0.8) + sin(q.y * 16.0 - time * 0.6) + sin((q.x - q.y) * 10.0 + time * 0.45));
}

float heightAt(vec2 q, vec2 I, float T, float time) { return ripple(q - I, T) + idle(q, time); }

// Soft light network on the "floor" of the water.
float causticLayer(vec2 p, float t) {
  vec2 w = p + vec2(sin(p.y * 2.3 + t * 0.5), cos(p.x * 2.1 - t * 0.4)) * 0.55;
  float a = sin(w.x * 5.0 + sin(w.y * 3.7 + t * 0.6) * 1.8);
  float b = sin(w.y * 5.6 + sin(w.x * 4.3 - t * 0.5) * 1.8);
  return pow(1.0 - abs(a * b), 10.0);
}

// Two rotated, warped layers so the light network reads organic rather than tiled.
float caustic(vec2 p, float t) {
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  return 0.6 * causticLayer(p, t) + 0.4 * causticLayer(rot * p * 1.37 + 4.1, t * 0.8);
}

vec3 bed(vec2 uv, float time) {
  vec2 q = vec2((uv.x - 0.5) * aspect(), uv.y - 0.5);
  float r = length(q);
  vec3 deep = vec3(0.039, 0.102, 0.184);   // ink
  vec3 navy = vec3(0.063, 0.271, 0.518);   // #104584
  vec3 sky  = vec3(0.227, 0.710, 0.996);   // #3AB5FE
  vec3 col = mix(navy * 1.15, deep, smoothstep(0.0, 0.85, r));
  col += sky * 0.22 * smoothstep(0.7, 0.0, r);
  col += sky * 0.11 * caustic(q * 2.0 + 3.0, time) * smoothstep(0.95, 0.05, r);
  return col;
}

void main() {
  float A = aspect();
  vec2 uv = vUv;
  vec2 q = vec2(uv.x * A, uv.y);
  vec2 I = vec2(uImpact.x * A, uImpact.y);
  float T = max(0.0, (uP - IMPACT_AT) / (1.0 - IMPACT_AT)) * 2.4;

  // Surface normal from the height field.
  float e = 1.5 / uRes.y;
  float hx = heightAt(q + vec2(e, 0.0), I, T, uTime) - heightAt(q - vec2(e, 0.0), I, T, uTime);
  float hy = heightAt(q + vec2(0.0, e), I, T, uTime) - heightAt(q - vec2(0.0, e), I, T, uTime);
  vec2 g = vec2(hx, hy) / (2.0 * e);

  // Refraction: everything under the surface is displaced by the slope.
  vec2 ruv = uv - g * 0.018;
  vec3 col = bed(ruv, uTime);

  // Text under the water, uncovered by the ripple front.
  float r = length(q - I);
  float front = 0.02 + 0.46 * T;
  float reveal = (T > 0.0) ? smoothstep(front + 0.02, front - 0.12, r) : 0.0;
  reveal *= smoothstep(0.0, 0.25, T);
  float txt = texture2D(uText, vec2(ruv.x, 1.0 - ruv.y)).a;
  col = mix(col, vec3(0.96, 0.985, 1.0), txt * reveal * 0.96);

  // Light: specular glints and slope brightening.
  vec3 n = normalize(vec3(-g * 0.45, 1.0));
  vec3 L = normalize(vec3(-0.35, 0.5, 0.8));
  float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 48.0);
  col += vec3(0.85, 0.95, 1.0) * spec * 0.55;
  col += vec3(0.23, 0.71, 1.0) * clamp(length(g) * 0.08, 0.0, 0.25);

  // Impact crown flash + splash droplets.
  if (T > 0.0) {
    float ring = exp(-pow((r - (0.015 + 0.32 * T)) / 0.006, 2.0)) * exp(-7.0 * T);
    col += vec3(0.9, 0.97, 1.0) * ring * 0.9;
    for (int i = 0; i < 9; i++) {
      float fi = float(i);
      float ang = fi * 0.698 + 0.4 + sin(fi * 3.1) * 0.25;
      float life = clamp(T / (0.45 + 0.12 * sin(fi * 1.7)), 0.0, 1.0);
      if (life < 1.0) {
        float dist = (0.04 + 0.16 * (0.6 + 0.4 * sin(fi * 2.3))) * sin(life * 1.5708);
        vec2 p = I + vec2(cos(ang), sin(ang)) * dist;
        float s = 0.006 * (1.0 - life) + 0.0015;
        float drop = smoothstep(s, s * 0.3, length(q - p));
        col = mix(col, vec3(0.92, 0.98, 1.0), drop * (1.0 - life * 0.7));
      }
    }
  }

  // Falling droplet (before impact) + its converging shadow.
  if (uP < IMPACT_AT) {
    float fall = clamp(uP / IMPACT_AT, 0.0, 1.0);
    float fe = fall * fall;
    vec2 dc = mix(I + vec2(-0.12, 0.2), I, fe);
    float R = mix(0.2, 0.018, fe);
    float Rs = mix(0.34, 0.03, fe);
    float sh = smoothstep(Rs, 0.0, length(q - I)) * 0.5 * fe;
    col *= 1.0 - sh;
    float dd = length(q - dc);
    float inside = smoothstep(R, R * 0.9, dd);
    if (inside > 0.0) {
      vec2 lens = (q - dc) / R;
      float z = sqrt(max(0.0, 1.0 - dot(lens, lens)));
      vec2 luv = uv - vec2(lens.x / A, lens.y) * R * 0.75;
      vec3 dropCol = bed(luv, uTime) * 1.25;
      dropCol += vec3(0.75, 0.9, 1.0) * pow(1.0 - z, 3.0) * 0.7;
      float hl = smoothstep(0.22, 0.0, length(lens - vec2(-0.38, 0.42)));
      dropCol += vec3(1.0) * hl * 0.9;
      col = mix(col, dropCol, inside * mix(0.45, 1.0, fe));
    }
  }

  // Vignette.
  vec2 vq = uv - 0.5;
  col *= 1.0 - dot(vq, vq) * 0.55;
  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
  return s
}

/** Draws the two text lines into an offscreen canvas (white on transparent) used as the "underwater" texture. */
function drawText(w, h) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')
  const sans = (s) => `300 ${s}px Manrope, sans-serif`
  const serif = (s) => `italic 400 ${s}px "Instrument Serif", serif`
  // Portrait screens get four shorter lines so the message stays large.
  const lines = w / h < 0.85
    ? [
        { text: 'Your biology', font: sans, scale: 1 },
        { text: 'is unique.', font: sans, scale: 1 },
        { text: 'Your treatment', font: serif, scale: 1.1 },
        { text: 'should be too.', font: serif, scale: 1.1 },
      ]
    : [
        { text: 'Your biology is unique.', font: sans, scale: 1 },
        { text: 'Your treatment should be too.', font: serif, scale: 1.1 },
      ]
  // Start from a height-based size, then shrink until the widest line fits 84% of the width.
  let base = h / (lines.length > 2 ? 9 : 7)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  const widest = () => Math.max(...lines.map((l) => { ctx.font = l.font(base * l.scale); return ctx.measureText(l.text).width }))
  const fit = (w * 0.84) / widest()
  if (fit < 1) base *= fit
  const lead = base * 1.15
  const top = h * 0.42 - ((lines.length - 1) * lead) / 2 + (lines.length > 2 ? 0 : lead / 2)
  lines.forEach((l, i) => {
    ctx.font = l.font(base * l.scale)
    ctx.fillText(l.text, w / 2, top + i * lead)
  })
  return c
}

export function createLiquid(canvas, { dprCap = 1.5 } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: false })
  if (!gl || gl.isContextLost()) return null
  let prog
  try {
    prog = gl.createProgram()
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog))
  } catch (err) {
    console.warn('Liquid shader unavailable:', err)
    return null
  }
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const u = Object.fromEntries(['uText', 'uRes', 'uP', 'uTime', 'uImpact'].map((n) => [n, gl.getUniformLocation(prog, n)]))
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.uniform1i(u.uText, 0)
  gl.uniform2f(u.uImpact, 0.5, 0.5)

  let progress = 0
  const t0 = performance.now()

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
    if (canvas.width === w && canvas.height === h) return
    canvas.width = w; canvas.height = h
    gl.viewport(0, 0, w, h)
    gl.uniform2f(u.uRes, w, h)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, drawText(w, h))
  }

  const render = () => {
    resize()
    gl.uniform1f(u.uP, progress)
    gl.uniform1f(u.uTime, (performance.now() - t0) / 1000)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  return {
    setProgress(p) { progress = p },
    render,
    refreshText() { canvas.width = 0; render() },
    destroy() {
      // Free GPU objects but keep the context: the same <canvas> may be re-initialised (React StrictMode, HMR).
      gl.deleteTexture(tex); gl.deleteBuffer(buf); gl.deleteProgram(prog)
    },
  }
}
