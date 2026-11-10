import { useEffect, useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { gsap } from '../motion.js'
import { links } from '../content.js'
import { Cta, Tag } from './ui.jsx'
import { cards } from '../sections/Story.jsx'
import { IconTestosterone, IconPeptides, IconSexualHealth, IconWeightLoss, IconHairLoss, IconPerformance } from './TreatmentIcons.jsx'

// Option 3 hero "film" — an original scroll-driven sequence in the style of why.zero.university, built from
// Paramount assets (3D body model, treatment icons, our copy, generated hands + meadow) in Paramount's blues:
//   water-light stage → the body rises in the centre in glossy blue glass, "Your biology / deserves" sits behind it
//   and the treatment coins orbit it in 3D → the camera pushes into the body and out into a sunlit meadow,
//   "Real medicine." → two real human hands reach in from either side and the treatment cards appear between them.

const NAVY = '#104584'
const SKY = '#3AB5FE'

/** Option 3 shows a photo of a sprinter in the centre instead of the 3D glass body. */
const SHOW_MODEL = false

/** Scroll-driven values the 3D scene reads every frame (tweened by the hero's pinned timeline). */
export const filmState = { enter: 0, rise: 0, spin: 0, coins: 0, scatter: 0, push: 0, alive: true }

const icons = [IconTestosterone, IconPeptides, IconSexualHealth, IconWeightLoss, IconHairLoss, IconPerformance]

/** Lays an arm out so that, once the hands have met, its shoulder end crosses the screen exactly at its corner of the
 *  hands zone (man's arm: top-left, woman's arm: bottom-right) and its fingertip sits by the centre — on any screen size.
 *  The photo is longer than that line, so the extra length runs off-screen past the corner. Returns the unit vector from
 *  fingertip back toward the shoulder, used to slide the arm along its own axis. */
const ARM_RATIO = { l: 276 / 1322, r: 295 / 1335 } // film-arm-*.webp height / width
function layoutArm(img, side) {
  const zone = img.parentElement
  const W = zone.clientWidth, H = zone.clientHeight
  const left = side === 'l'
  const A = left ? { x: 0, y: 0 } : { x: W, y: H } // corner the arm comes from
  const F = left ? { x: W / 2 - 12, y: H * 0.42 } : { x: W / 2 + 12, y: H * 0.6 } // where the fingertip ends up
  const L = Math.hypot(A.x - F.x, A.y - F.y)
  const ux = (A.x - F.x) / L, uy = (A.y - F.y) / L
  const w = Math.max(L * 1.15, W * (W >= 768 ? 0.6 : 1.1))
  const h = w * ARM_RATIO[side]
  const o = w - L // distance from the photo's shoulder end to the corner
  const fade = `linear-gradient(${left ? 90 : 270}deg, rgba(0,0,0,0.25) ${o}px, #000 ${o + L * 0.12}px)`
  Object.assign(img.style, { left: `${left ? F.x - w : F.x}px`, top: `${F.y - h / 2}px`, width: `${w}px`, maskImage: fade, webkitMaskImage: fade })
  gsap.set(img, { transformOrigin: left ? '100% 50%' : '0% 50%', rotation: Math.atan2(uy, ux) * 180 / Math.PI - (left ? 180 : 0) })
  return { ux, uy, L }
}

/** Length of the film in timeline units; the hero's pinned timeline is exactly this long. */
export const FILM_LEN = 5.0
export function addFilm(tl, scope) {
  const q = gsap.utils.selector(scope)
  if (!q('[data-film]')[0]) return

  // 1 — body rises in the centre, slowly turning; coins spin up into orbit; the words write on behind it
  tl.fromTo(filmState, { rise: 0, spin: 0, coins: 0, scatter: 0, push: 0 }, { rise: 1, ease: 'power2.out', duration: 0.8, immediateRender: false }, 0)
    .fromTo(q('[data-runner]'), { y: 60 }, { y: 0, ease: 'power2.out', duration: 0.8, immediateRender: false }, 0)
    .to(filmState, { spin: 1, ease: 'none', duration: 1.6 }, 0)
    .to(filmState, { coins: 1, ease: 'power2.out', duration: 0.5 }, 0.2)
    .fromTo(q('[data-film-hint]'), { opacity: 1, y: 0 }, { opacity: 0, y: 20, duration: 0.15, immediateRender: false }, 0)
    .fromTo(q('[data-film-title] > span'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'power3.out', duration: 0.4, stagger: 0.12, immediateRender: false }, 0.1)
    .fromTo(q('[data-film-desc]'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.35, immediateRender: false }, 0.55)

  // 2 — coins fly outward, the camera pushes into the body, the water gives way to the meadow
  tl.to(filmState, { scatter: 1, ease: 'power2.in', duration: 0.45 }, 1.05)
    .to(filmState, { push: 1, ease: 'power2.in', duration: 0.55 }, 1.05)
    .fromTo(q('[data-runner]'), { scale: 1 }, { scale: 4.5, opacity: 0, transformOrigin: '55% 30%', ease: 'power2.in', duration: 0.55, immediateRender: false }, 1.05)
    .to(q('[data-film-a]'), { opacity: 0, scale: 1.06, ease: 'power1.in', duration: 0.3 }, 1.1)
    .to(q('[data-film-desc]'), { opacity: 0, y: -20, ease: 'power1.in', duration: 0.25 }, 1.1)
    .to(q('[data-film-gl]'), { opacity: 0, ease: 'none', duration: 0.25 }, 1.4)
    .set(filmState, { alive: false }, 1.7)
    .fromTo(q('[data-film-sun]'), { opacity: 0, scale: 1.2 }, { opacity: 1, scale: 1, ease: 'power2.out', duration: 0.7, immediateRender: false }, 1.25)
    .to(q('[data-film-sun]'), { scale: 1.06, ease: 'none', duration: 1.7 }, 1.95) // slow drift for the rest of the film
    .fromTo(q('[data-petal]'), { y: () => window.innerHeight * Math.random() * 0.3, opacity: 0 },
      { y: () => -window.innerHeight * (1.15 + Math.random() * 0.35), x: () => (Math.random() - 0.5) * 260, rotation: () => (Math.random() - 0.5) * 300, opacity: 1, ease: 'none', duration: 2.2, stagger: 0.03, immediateRender: false }, 1.3)

  // header: white glass on the dark stage → the earlier dark tint once the bright meadow takes over (1.35 → 1.65).
  // Driven from the timeline's own playhead so it is always right, scrubbing forward or back.
  const html = document.documentElement
  html.style.setProperty('--hdr-l', '1')
  tl.eventCallback('onUpdate', () => {
    const p = Math.min(1, Math.max(0, (tl.time() - 1.35) / 0.3))
    html.style.setProperty('--hdr-l', (1 - p).toFixed(3))
  })

  // 3 — "Real medicine." blurs in, holds, then lifts away
  tl.fromTo(q('[data-film-b] > *'), { opacity: 0, y: 40, filter: 'blur(14px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out', duration: 0.4, stagger: 0.1, immediateRender: false }, 1.55)
    .to(q('[data-film-b]'), { opacity: 0, y: -80, filter: 'blur(8px)', ease: 'power2.in', duration: 0.3 }, 2.1)

  // 4 — two real hands reach in from either side, heading + CTA rise, the cards rise in a row
  const handL = q('[data-hand="l"]')[0]
  const handR = q('[data-hand="r"]')[0]
  const track = q('[data-film-track]')[0]
  const gL = layoutArm(handL, 'l')
  const gR = layoutArm(handR, 'r')
  const along = (g, k) => ({ x: g.ux * g.L * k, y: g.uy * g.L * k }) // k × arm-line length back toward the corner
  const REST = 0.4 // how far back the hands wait before closing in
  tl.fromTo(handL, { ...along(gL, 1.05), opacity: 0 }, { ...along(gL, REST), opacity: 1, ease: 'power3.out', duration: 0.6, immediateRender: false }, 2.15)
    .fromTo(handR, { ...along(gR, 1.05), opacity: 0 }, { ...along(gR, REST), opacity: 1, ease: 'power3.out', duration: 0.6, immediateRender: false }, 2.2)
    .fromTo(q('[data-film-head] > *'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.35, stagger: 0.08, immediateRender: false }, 2.3)
    .fromTo(q('[data-film-card]'), { opacity: 0, y: 80, rotationX: -25 }, { opacity: 1, y: 0, rotationX: 0, ease: 'power3.out', duration: 0.45, stagger: 0.06, immediateRender: false }, 2.45)
    .fromTo(q('[data-film-cta]'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3, immediateRender: false }, 2.75)
    .set(q('[data-film-final]'), { pointerEvents: 'auto' }, 2.6)

  // 5 — scroll on: the card row slides sideways through every card while the hands close in until the fingertips almost touch
  const MOVE = 3.0, MOVE_LEN = 1.8
  tl.fromTo(track, { x: 0 }, { x: () => Math.min(0, window.innerWidth - track.scrollWidth), ease: 'none', duration: MOVE_LEN, immediateRender: false }, MOVE)
    .fromTo(handL, along(gL, REST), { x: 0, y: 0, ease: 'power1.inOut', duration: MOVE_LEN, immediateRender: false }, MOVE)
    .fromTo(handR, along(gR, REST), { x: 0, y: 0, ease: 'power1.inOut', duration: MOVE_LEN, immediateRender: false }, MOVE)
    .to({}, { duration: 0.0001 }, FILM_LEN)
}

/* ---------- treatment pills: frosted "liquid glass" discs with white icons ----------
   Real DOM elements with backdrop-filter, so they genuinely blur whatever sits behind them (the body, the stage).
   Each frame they're projected from their 3D orbit position and moved between a layer behind the body canvas and
   one in front of it, so the body still hides them as they pass round the back. Built imperatively (not by React)
   because they change parents. */
const PILL_SIZE = 0.16 // world-space diameter
// one colour per treatment pill (Option 3): testosterone, peptides, sexual health, weight loss, hair loss, performance
const PILL_COLORS = ['58,181,254', '45,212,191', '244,114,182', '251,191,36', '167,139,250', '74,222,128']
function makePill(Icon, rgb) {
  const el = document.createElement('div')
  el.className = 'film-pill'
  if (rgb) el.style.setProperty('--pill', rgb)
  el.innerHTML = '<span class="film-pill-gloss"></span>' + renderToStaticMarkup(<Icon />)
  return el
}

/* ---------- background shader: deep navy stage with slow aurora light ----------
   Domain-warped noise drifts like soft northern light in navy and sky blue, a gentle spotlight falls from above onto
   the body, a faint halo sits behind it, tiny specks of light drift upward and a whisper of film grain keeps it from
   looking flat. Calm on purpose so the body and the copy stay the focus. */
const waterFrag = /* glsl */ `
  uniform float uTime; uniform vec2 uRes;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }
  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    float t = uTime;
    vec3 deep = vec3(0.012, 0.055, 0.125);   // #030e20
    vec3 navy = vec3(0.063, 0.271, 0.518);   // #104584
    vec3 sky  = vec3(0.227, 0.710, 0.996);   // #3AB5FE
    // aurora: warped noise drifting slowly
    vec2 q = vec2(fbm(p * 1.4 + vec2(0.0, t * 0.035)), fbm(p * 1.4 + vec2(5.2, 1.3) - vec2(t * 0.03, 0.0)));
    float f = fbm(p * 1.1 + q * 1.8 + vec2(t * 0.015, -t * 0.02));
    vec3 col = mix(deep, navy, smoothstep(0.25, 0.85, f) * 0.85);
    col = mix(col, sky, smoothstep(0.62, 0.92, f) * 0.28);
    col *= mix(0.75, 1.05, smoothstep(-0.2, 1.1, uv.y)); // darker toward the floor
    // spotlight from above + halo behind the body
    float spot = smoothstep(0.95, 0.0, length((p - vec2(0.0, 0.62)) * vec2(1.7, 0.75)));
    float halo = smoothstep(0.55, 0.0, length((p - vec2(0.0, 0.02)) * vec2(1.6, 0.8)));
    col += sky * (spot * 0.16 + halo * (0.10 + 0.03 * sin(t * 1.2)));
    // drifting specks of light
    vec2 g = p * 16.0 + vec2(0.0, t * 0.25);
    vec2 id = floor(g); vec2 gf = fract(g) - 0.5;
    float h = hash(id);
    vec2 o = (vec2(hash(id + 2.3), hash(id + 5.9)) - 0.5) * 0.7;
    float speck = step(0.86, h) * smoothstep(0.07, 0.0, length(gf - o)) * (0.5 + 0.5 * sin(t * 2.0 + h * 40.0));
    col += vec3(0.75, 0.9, 1.0) * speck * 0.55;
    // vignette + grain
    float v = smoothstep(1.2, 0.2, length(p * vec2(0.85, 1.1)));
    col *= mix(0.6, 1.0, v);
    col += (hash(uv * uRes + fract(t)) - 0.5) * 0.025;
    gl_FragColor = vec4(col, 1.0);
  }`

function makeRenderer(el, coarse) {
  const gl = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  gl.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 1.75))
  gl.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
  el.appendChild(gl.domElement)
  return gl
}

/* ---------- water background + glossy blue-glass body + orbiting coins (three.js) ----------
   Two canvases so the words can sit between them: water (back) → "Your biology deserves" → body + coins (front). */
function useBodyScene(waterWrap, bodyWrap, pillBack, pillFront) {
  useEffect(() => {
    const el = bodyWrap.current
    const coarse = window.matchMedia('(pointer: coarse)').matches
    let gl, bgGl
    try { bgGl = makeRenderer(waterWrap.current, true); gl = makeRenderer(el, coarse) } catch { bgGl?.dispose(); return }
    gl.toneMapping = THREE.ACESFilmicToneMapping

    const bgScene = new THREE.Scene()
    const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const bgMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: waterFrag, depthWrite: false, depthTest: false,
    })
    const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat)
    bgScene.add(bgQuad)

    const scene = new THREE.Scene()
    const envScene = new THREE.Scene()
    const plane = new THREE.PlaneGeometry(1, 1)
    const panel = (color, k, pos, s) => {
      const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }))
      m.position.set(...pos); m.scale.set(...s); m.lookAt(0, 0, 0); envScene.add(m)
    }
    panel('#ffffff', 3, [0, 4, 3], [6, 3, 1])
    panel('#ffffff', 1.6, [-4, 1.5, 1], [4, 4, 1])
    panel('#bfe6ff', 1.4, [4, 1, -2], [3, 4, 1])
    const envRT = new THREE.WebGLCubeRenderTarget(coarse ? 64 : 256, { type: THREE.HalfFloatType })
    new THREE.CubeCamera(1, 1000, envRT).update(gl, envScene)
    scene.environment = envRT.texture
    scene.add(new THREE.HemisphereLight('#ffffff', '#3d7fc4', 0.9))
    const key = new THREE.DirectionalLight('#ffffff', 2.2); key.position.set(-2, 4, 3); scene.add(key)
    const rim = new THREE.DirectionalLight('#cfeeff', 1.8); rim.position.set(3, 2, -3); scene.add(rim)

    const material = new THREE.MeshPhysicalMaterial({
      color: '#4cbcff', roughness: 0.16, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06,
      sheen: 0.6, sheenColor: new THREE.Color('#e6f6ff'), iridescence: 0.2, emissive: new THREE.Color(NAVY), emissiveIntensity: 0.22,
    })
    const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50)
    const holder = new THREE.Group()
    scene.add(holder)

    // six glass pills evenly spaced on one tilted ring around the body
    const back = pillBack.current, front = pillFront.current
    // the orbit line: one 2D canvas behind the runner (back half of the ring) and one in front (front half)
    const mkRing = (layer) => {
      const c = document.createElement('canvas')
      c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none'
      layer.prepend(c)
      return c
    }
    const ringCanvases = [mkRing(back), mkRing(front)]
    const [ctxB, ctxF] = ringCanvases.map((c) => c.getContext('2d'))
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const TAU = Math.PI * 2
    const placed = [] // where each pill was drawn this frame, to cut the line out underneath it
    const pills = icons.map((Icon, i) => { const p = makePill(Icon, PILL_COLORS[i]); front.appendChild(p); return p })
    const ring = new THREE.Euler(0.3, 0, 0.34) // tilted: right side higher
    const tmp = new THREE.Vector3()
    const proj = new THREE.Vector3()
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(15)) // camera fov 30°

    let disposed = false
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    if (SHOW_MODEL) loader.load(coarse ? '/models/human-body-lite.glb' : '/models/human-body.glb', (gltf) => {
      if (disposed) return
      const model = gltf.scene
      model.traverse((o) => { if (o.isMesh) { o.material = material; if (!o.geometry.getAttribute('normal')) o.geometry.computeVertexNormals() } })
      const box = new THREE.Box3().setFromObject(model)
      const s = 1.79 / box.getSize(new THREE.Vector3()).y
      model.scale.setScalar(s)
      const c = box.getCenter(new THREE.Vector3())
      model.position.set(-c.x * s, -box.min.y * s, -c.z * s)
      holder.add(model)
    })

    let W = 1, H = 1
    const resize = () => {
      W = Math.max(el.clientWidth, 1); H = Math.max(el.clientHeight, 1)
      gl.setSize(W, H, false); bgGl.setSize(W, H, false)
      camera.aspect = W / H; camera.updateProjectionMatrix()
      bgMat.uniforms.uRes.value.set(W, H)
      ringCanvases.forEach((c) => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr) })
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(el)

    const clock = new THREE.Clock()
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!filmState.alive) return // canvases are faded out: stop drawing
      const t = clock.getElapsedTime()
      const wide = W / H > 1.15
      const { enter, rise, spin, coins: cIn, scatter, push } = filmState
      const bodyY = (wide ? -0.05 : -0.2) - 0.9 * (1 - rise) - 1.3 * (1 - enter)
      holder.position.set(0, bodyY + Math.sin(t * 0.9) * 0.015, 0)
      holder.rotation.y = -0.4 + spin * 0.8 + Math.sin(t * 0.4) * 0.04

      const z = THREE.MathUtils.lerp(wide ? 4.6 : 5.8, 0.35, push * push)
      const y = THREE.MathUtils.lerp(1.0, 1.3, push)
      camera.position.set(0, y, z)
      camera.lookAt(0, y - 0.05, 0)
      camera.updateMatrixWorld()

      // pills: continuous 360° orbit (time + scroll), projected to the screen; the radius grows as they scatter
      const radius = (wide ? 0.68 : 0.5) + scatter * 2.6
      const angle0 = t * 0.45 + spin * Math.PI * 1.2
      const ringY = bodyY + 1.08 + scatter * 0.3
      placed.length = 0
      pills.forEach((el, i) => {
        const a = angle0 + (i / pills.length) * TAU
        tmp.set(Math.cos(a) * radius, 0, Math.sin(a) * radius).applyEuler(ring)
        tmp.y += ringY
        const k = Math.max(0, Math.min(1, cIn * 1.4 - i * 0.07)) * (1 - scatter)
        if (k < 0.01) { el.style.opacity = '0'; return }
        const layer = tmp.z < -0.02 ? back : front // behind the body's plane → under the body canvas
        if (el.parentNode !== layer) layer.appendChild(el)
        proj.copy(tmp).project(camera)
        const size = (PILL_SIZE * k * H) / (2 * camera.position.distanceTo(tmp) * tanHalf)
        const sx = (proj.x * 0.5 + 0.5) * W - size / 2
        const sy = (-proj.y * 0.5 + 0.5) * H - size / 2
        el.style.transform = 'translate3d(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px,0)'
        el.style.width = el.style.height = size.toFixed(1) + 'px'
        el.style.opacity = String(k)
        placed.push([sx + size / 2, sy + size / 2, size / 2])
      })

      // orbit line: a faint glowing ellipse along the pills' path, brighter in a trail just behind each pill so
      // the light seems to travel with them; split so the back half passes behind the runner
      ctxB.setTransform(dpr, 0, 0, dpr, 0, 0); ctxB.clearRect(0, 0, W, H)
      ctxF.setTransform(dpr, 0, 0, dpr, 0, 0); ctxF.clearRect(0, 0, W, H)
      const fade = Math.min(1, cIn * 1.4) * (1 - scatter)
      if (fade > 0.01) {
        for (const c of [ctxB, ctxF]) { c.lineCap = 'round'; c.shadowColor = 'rgba(255,255,255,0.75)'; c.shadowBlur = 8 }
        const N = 180, TRAIL = 1.3
        let px = 0, py = 0
        for (let j = 0; j <= N; j++) {
          const a = (j / N) * TAU
          tmp.set(Math.cos(a) * radius, 0, Math.sin(a) * radius).applyEuler(ring)
          tmp.y += ringY
          const isBack = tmp.z < -0.02
          proj.copy(tmp).project(camera)
          const x = (proj.x * 0.5 + 0.5) * W, yy = (-proj.y * 0.5 + 0.5) * H
          if (j > 0) {
            let tr = 0 // 1 right behind a pill, fading to 0 over TRAIL radians
            for (let i = 0; i < pills.length; i++) {
              const d = (((angle0 + (i / pills.length) * TAU - a) % TAU) + TAU) % TAU
              if (d < TRAIL) tr = Math.max(tr, 1 - d / TRAIL)
            }
            const c = isBack ? ctxB : ctxF
            c.strokeStyle = 'rgba(255,255,255,' + (fade * (0.3 + 0.7 * tr * tr)).toFixed(3) + ')'
            c.lineWidth = 1.2 + 1.6 * tr * tr
            c.beginPath(); c.moveTo(px, py); c.lineTo(x, yy); c.stroke()
          }
          px = x; py = yy
        }
        // never draw the line inside a pill
        for (const c of [ctxB, ctxF]) {
          c.globalCompositeOperation = 'destination-out'; c.shadowBlur = 0
          for (const [cx, cy, r] of placed) { c.beginPath(); c.arc(cx, cy, r + 2, 0, TAU); c.fill() }
          c.globalCompositeOperation = 'source-over'
        }
      }

      bgMat.uniforms.uTime.value = t
      // (Option 3: the studio photo is the stage, so the shader background isn't drawn)
      gl.render(scene, camera)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      disposed = true
      cancelAnimationFrame(raf); ro.disconnect()
      scene.traverse((o) => { if (o.isMesh) o.geometry.dispose() })
      pills.forEach((p) => p.remove())
      ringCanvases.forEach((c) => c.remove())
      bgMat.dispose(); bgQuad.geometry.dispose()
      material.dispose(); envRT.dispose(); plane.dispose()
      gl.dispose(); gl.domElement.remove(); bgGl.dispose(); bgGl.domElement.remove()
    }
  }, [waterWrap, bodyWrap, pillBack, pillFront])
}

/* ---------- the film layer ---------- */
const petals = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 37) % 100, size: 12 + ((i * 13) % 24), blur: i % 3, hue: i % 3,
}))

export function HeroFilm() {
  const waterWrap = useRef(null)
  const bodyWrap = useRef(null)
  const pillBack = useRef(null)
  const pillFront = useRef(null)
  useBodyScene(waterWrap, bodyWrap, pillBack, pillFront)
  return (
    <div data-film className="absolute inset-0 overflow-hidden text-navy">
      {/* fallback stage colour (the WebGL water draws over it) */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,#104584_0%,#0a2b57_60%,#04122a_100%)]" />

      <div data-film-gl aria-hidden className="absolute inset-0">
        {/* water light (back) */}
        {/* Option 3 stage: a dark studio backdrop with a softly lit floor (replaces the animated navy shader) */}
        <img src="/img/film-studio-1024.webp" srcSet="/img/film-studio-800.webp 800w, /img/film-studio-1024.webp 1024w" sizes="100vw" alt="" className="absolute inset-0 h-full w-full object-cover object-bottom" />
        <div ref={waterWrap} className="hidden" />

        {/* "Your biology / deserves" heading (top-left on desktop, top-centre on phone/tablet) + a short line bottom-right, framing the body */}
        <div data-film-a className="absolute inset-0">
          <h2 data-film-title className="absolute inset-x-5 top-[13%] text-center text-[clamp(40px,7vw,96px)] leading-[0.98] font-semibold tracking-[-0.03em] text-white lg:inset-x-auto lg:top-[18%] lg:left-[6%] lg:text-left">
            <span className="block opacity-0">Your biology</span>
            <span className="intro-serif block font-normal text-[#3AB5FE] opacity-0">deserves.</span>
          </h2>
        </div>

        {/* body + coins (front) */}
        {/* glass pills orbit the body: this layer holds the ones behind it, the next the ones in front */}
        <div ref={pillBack} className="pointer-events-none absolute inset-0" />
        <div ref={bodyWrap} className="absolute inset-0" />
        {/* the runner (Option 3) — sits between the two pill layers so the pills pass behind and in front of him */}
        <div data-runner-wrap className="pointer-events-none absolute inset-x-0 top-[9%] bottom-[3%] flex items-center justify-center">
          <img data-runner src="/img/film-runner-1024.webp" srcSet="/img/film-runner-600.webp 600w, /img/film-runner-1024.webp 976w" sizes="(max-width: 768px) 90vw, 45vw" alt="" className="h-[86%] w-auto max-w-[90vw] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]" />
        </div>
        <div ref={pillFront} className="pointer-events-none absolute inset-0" />
        {/* short description — copy from the live hero; in front of the body so it never hides behind the legs */}
        <div data-film-desc className="absolute inset-x-5 bottom-[7%] mx-auto max-w-[420px] text-center opacity-0 lg:inset-x-auto lg:right-[6%] lg:bottom-[16%] lg:mx-0 lg:max-w-[340px] lg:text-left">
          <p className="text-[15px] leading-relaxed text-white/65 sm:text-[17px]">Evidence-based treatment, provider-guided care, and a healthier, more confident you — all from the comfort of home.</p>
        </div>
      </div>

      {/* sunlit meadow the camera pushes out into */}
      <div data-film-sun aria-hidden className="absolute inset-0 opacity-0">
        <img src="/img/film-meadow-1800.webp" srcSet="/img/film-meadow-1000.webp 1000w, /img/film-meadow-1800.webp 1800w" sizes="100vw" alt="" className="h-full w-full object-cover object-[50%_60%]" />
        <div className="absolute inset-0 opacity-70 mix-blend-screen bg-[conic-gradient(from_200deg_at_88%_-8%,transparent_0deg,rgba(255,255,255,0.5)_8deg,transparent_16deg,rgba(255,255,255,0.35)_26deg,transparent_34deg,rgba(255,255,255,0.3)_46deg,transparent_56deg)]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,rgba(255,255,255,0.35),rgba(255,255,255,0)_70%)]" />
      </div>

      {/* "Real medicine." — centre, blurs in over the meadow */}
      <div data-film-b aria-hidden className="absolute inset-0 grid place-content-center text-center">
        <p className="intro-script text-[clamp(56px,9vw,150px)] leading-none text-[#3AB5FE] opacity-0 [text-shadow:0_2px_24px_rgba(255,255,255,0.8)]">Real</p>
        <p className="intro-serif -mt-2 text-[clamp(64px,11vw,190px)] leading-[0.9] text-navy opacity-0 [text-shadow:0_2px_30px_rgba(255,255,255,0.7)]">medicine.</p>
      </div>

      {/* final scene: two-line heading on top, two real hands reaching toward each other, the treatment cards in a row below, CTA under them */}
      <div data-film-final className="pointer-events-none absolute inset-0 z-[5] flex flex-col items-center pt-[96px] pb-6 sm:pt-[118px] sm:pb-10">
        <div data-film-head className="mt-6 flex flex-col items-center px-4 text-center sm:mt-10">
          <Tag dot={false} className="opacity-0 !text-navy/80">Modern Medicine, Real Results</Tag>
          <h1 className="intro-serif mt-2 text-[clamp(36px,5.6vw,84px)] leading-[1.02] text-navy opacity-0 [text-shadow:0_2px_24px_rgba(255,255,255,0.8)]">
            Personalised care<br />
            for a <span className="intro-script text-[#2391e0]">Stronger You.</span>
          </h1>
        </div>

        {/* the arms are full-length photos, a man's (left) and a woman's (right), laid out by layoutArm() so each one's end meets
            its corner of this zone when the hands have closed in; the hands close in as you scroll */}
        <div aria-hidden className="relative w-full flex-1">
          <img data-hand="l" src="/img/film-arm-left.webp" alt="" className="absolute max-w-none opacity-0" />
          <img data-hand="r" src="/img/film-arm-right.webp" alt="" className="absolute max-w-none opacity-0" />
        </div>

        {/* treatment cards in one row — the row slides sideways with scroll until the last card is in view */}
        <div className="w-full overflow-visible">
          <ul data-film-track className="flex w-max gap-3 px-[6vw] [perspective:1000px] sm:gap-5" aria-label="Treatments">
            {cards.map((c) => (
              <li key={c.name} data-film-card className="w-[min(50vw,200px,26svh)] shrink-0 opacity-0 sm:w-[min(26vw,280px,30svh)]">
                <a href={links.products} aria-label={`Explore ${c.name}`} className="group relative block aspect-[259/230] overflow-hidden rounded-[18px] border-2 border-white/60 text-left text-white shadow-[0_20px_40px_-20px_rgba(16,69,132,0.6)]">
                  <div aria-hidden className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105" style={{ backgroundImage: `url(${c.image})` }} />
                  <div className="relative z-10 flex h-full flex-col items-start justify-between p-3 sm:p-4">
                    <span className="flex size-9 items-center justify-center rounded-full border border-white/30 bg-black/50 backdrop-blur-[52px] transition-colors duration-300 group-hover:bg-sky sm:size-11 [&_svg]:scale-75 sm:[&_svg]:scale-90">
                      <c.Icon />
                    </span>
                    <span className="block">
                      <span className="block text-[15px] leading-tight font-semibold tracking-[-0.01em] sm:text-[19px]">{c.name}</span>
                      <span className="mt-1 block text-[11px] leading-snug text-white/85 sm:text-[13px]">{c.tagline}</span>
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA under the card row */}
        <div data-film-cta className="mt-4 opacity-0 sm:mt-6">
          <Cta href={links.products} variant="white" size="lg">Explore Treatments</Cta>
        </div>
      </div>

      {/* drifting petals over everything */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {petals.map((p, i) => (
          <span key={i} data-petal className="absolute top-full rounded-[60%_40%_55%_45%] opacity-0"
            style={{ left: `${p.left}%`, width: p.size, height: p.size * 0.72, filter: `blur(${p.blur}px)`, background: ['#ffffff', '#bfe6ff', SKY][p.hue] }} />
        ))}
      </div>

      {/* scroll hint (shown once the intro hands over): breathing label + a scroll-mouse icon with a traveling dot */}
      <div data-film-hint aria-hidden className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 opacity-0">
        <span className="scroll-hint-pulse text-[13px] tracking-[0.25em] text-white uppercase">Scroll to begin</span>
        <span className="relative block h-8 w-5 rounded-full border border-white/50">
          <span className="scroll-hint-dot absolute top-1.5 left-1/2 h-1.5 w-1.5 rounded-full bg-white" />
        </span>
      </div>
    </div>
  )
}

/** Time-based entrance once the intro's circle opens: the body eases up into frame and the scroll hint appears. */
export function playFilmEntrance(scope) {
  const hint = scope.querySelector('[data-film-hint]')
  gsap.to(filmState, { enter: 1, duration: 2, ease: 'power3.out' })
  const runner = scope.querySelector('[data-runner-wrap]')
  if (runner) gsap.fromTo(runner, { yPercent: 35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.8, ease: 'power3.out' })
  if (hint && window.scrollY < 40) gsap.fromTo(hint, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, delay: 1.2, ease: 'power2.out', onStart() { if (window.scrollY > 40) this.kill() } })
}
