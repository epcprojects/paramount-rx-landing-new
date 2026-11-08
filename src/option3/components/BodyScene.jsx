import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { gsap } from '../motion.js'
import { category as getCategory } from '../data/treatments.js'

// 3D body for "Every treatment, mapped to the body" — a plain three.js port of the Paramount products prototype
// (same model, camera shots, region glow shader, pins, drag-to-rotate with inertia).

const START = { position: [0, 1.5, 7.5], target: [0, 1, 0], fov: 30 }
const SHOTS = {
  all: { position: [0, 1, 4.7], target: [0, 0.9, 0], fov: 30, duration: 1.6 },
  'in-demand': { position: [0.7, 1.15, 4.2], target: [0, 0.95, 0], fov: 30, duration: 1.6 },
  'hair-loss': { position: [0.3, 1.86, 1.55], target: [0, 1.66, 0], fov: 28, duration: 1.8 },
  hormones: { position: [-0.35, 1.3, 2.9], target: [0, 1.17, 0], fov: 30, duration: 1.6 },
  peptides: { position: [-0.85, 1.05, 3.9], target: [0, 0.95, 0], fov: 30, duration: 1.7 },
  'performance-enhancer': { position: [1.9, 1.25, 2.9], target: [0, 1, 0], fov: 30, duration: 1.7 },
  'sexual-wellness': { position: [0.35, 1.05, 3], target: [0, 1, 0], fov: 30, duration: 1.6 },
  testosterone: { position: [0.15, 1.42, 2.35], target: [0, 1.24, 0], fov: 30, duration: 1.7 },
  'weight-loss': { position: [0.45, 1.12, 2.15], target: [0, 1.05, 0], fov: 30, duration: 1.8 },
}
const REGIONS = ['scalp', 'chest', 'abdomen', 'pelvis', 'shoulders', 'arms', 'legs', 'aura']
const GLOW = {
  all: {}, 'in-demand': {},
  'hair-loss': { scalp: 0.9 }, hormones: { chest: 0.9 }, peptides: { arms: 0.9 }, 'performance-enhancer': { legs: 0.9 },
  'sexual-wellness': { pelvis: 0.85 }, testosterone: { shoulders: 0.9 }, 'weight-loss': { abdomen: 0.9 },
}
// Rays cast at the body to place each category's pin on the skin.
const PINS = [
  { id: 'hair-loss', from: [0, 2.6, 1.2], dir: [0, -0.84, -1.2] },
  { id: 'hormones', from: [0, 1.36, 2], dir: [0, 0, -1] },
  { id: 'testosterone', from: [0.19, 1.42, 2], dir: [0, 0, -1] },
  { id: 'peptides', from: [-0.24, 1, 2], dir: [0, 0, -1] },
  { id: 'weight-loss', from: [0.04, 1.15, 2], dir: [0, 0, -1] },
  { id: 'sexual-wellness', from: [0, 1, 2], dir: [0, 0, -1] },
  { id: 'performance-enhancer', from: [-0.09, 0.7, 2], dir: [0, 0, -1] },
]
const camState = (s) => ({ px: s.position[0], py: s.position[1], pz: s.position[2], tx: s.target[0], ty: s.target[1], tz: s.target[2], fov: s.fov })

function bodyMaterial(glow) {
  const m = new THREE.MeshPhysicalMaterial({
    color: '#f5f5f5', roughness: 0.52, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.6,
    sheen: 0.4, sheenRoughness: 0.8, sheenColor: new THREE.Color('#ffffff'),
  })
  m.customProgramCacheKey = () => 'body-region-glow-v5'
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, glow)
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform mat4 uRestMatrix;\nvarying vec3 vRest;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = (uRestMatrix * vec4(position, 1.0)).xyz;')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
uniform float uRegion[${REGIONS.length}];
uniform float uPulse, uTime;
uniform vec3 uColorA, uColorB;
varying vec3 vRest;
float glowBlob(vec3 p, vec3 c, vec3 r) { return 1.0 - smoothstep(0.45, 1.0, length((p - c) / r)); }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
{
  vec3 p = vRest;
  float m[${REGIONS.length}];
  m[0] = glowBlob(p, vec3(0.0, 1.785, -0.02), vec3(0.13, 0.09, 0.16));
  m[1] = glowBlob(p, vec3(0.0, 1.35, -0.01), vec3(0.19, 0.14, 0.24));
  m[2] = glowBlob(p, vec3(0.0, 1.13, -0.01), vec3(0.175, 0.16, 0.23));
  m[3] = glowBlob(p, vec3(0.0, 0.97, -0.02), vec3(0.17, 0.095, 0.21));
  m[4] = glowBlob(p, vec3(0.20, 1.42, -0.02), vec3(0.115, 0.115, 0.16));
  m[5] = glowBlob(p, vec3(-0.24, 1.0, 0.0), vec3(0.095, 0.23, 0.12));
  m[6] = glowBlob(p, vec3(-0.085, 0.71, -0.01), vec3(0.12, 0.27, 0.16));
  m[7] = 0.0;
  float a = 0.0;
  for (int i = 0; i < ${REGIONS.length - 1}; i++) a = max(a, uRegion[i] * m[i]);
  float facing = clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);
  a = max(a, uRegion[${REGIONS.length - 1}] * smoothstep(0.55, 0.05, facing) * 0.8);
  a = clamp(a * (1.0 + uPulse * 0.3 * sin(uTime * 1.6)), 0.0, 1.0);
  vec3 glowCol = mix(uColorB, uColorA, a);
  diffuseColor.rgb = mix(diffuseColor.rgb, glowCol, a * 0.95);
  totalEmissiveRadiance += glowCol * a * 0.06;
}`)
  }
  return m
}

export default function BodyScene({ category, onSelect, scroll, reducedMotion }) {
  const wrap = useRef(null)
  const pinEls = useRef([])
  const shadowEl = useRef(null)
  const api = useRef(null)
  const [ready, setReady] = useState(false)
  const [supported, setSupported] = useState(true)
  const [anchors, setAnchors] = useState([])
  const [grabbing, setGrabbing] = useState(false)

  // ---- scene setup (once) ----
  useEffect(() => {
    const el = wrap.current
    let gl
    try {
      const c = document.createElement('canvas')
      if (!(c.getContext('webgl2') || c.getContext('webgl'))) throw new Error('no webgl')
      gl = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      setSupported(false)
      return
    }
    const coarse = window.matchMedia('(pointer: coarse)').matches
    gl.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 1.75))
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 0.98
    gl.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;z-index:1'
    el.prepend(gl.domElement)

    const scene = new THREE.Scene()
    // Studio reflections, same as the prototype: four light panels (three soft-boxes + a pale-blue ring behind)
    // rendered once into a cube map and used as the environment.
    const envScene = new THREE.Scene()
    const panel = (geo, color, intensity, pos, scale, rotY = 0) => {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide, toneMapped: false }))
      m.position.set(...pos)
      m.scale.set(...scale)
      m.lookAt(0, 0, 0)
      if (rotY) m.rotation.y = rotY
      envScene.add(m)
    }
    const rect = new THREE.PlaneGeometry(1, 1)
    panel(rect, '#ffffff', 2.2, [0, 4, 3], [6, 3, 1])
    panel(rect, '#ffffff', 1.2, [-4, 1.5, 1], [4, 4, 1], Math.PI / 2)
    panel(rect, '#ffffff', 1.5, [4, 1.5, -2], [3, 4, 1], -Math.PI / 2)
    panel(new THREE.RingGeometry(0.5, 1, 64), '#e3eefa', 0.6, [0, 1, -4], [3, 3, 3])
    const envTarget = new THREE.WebGLCubeRenderTarget(coarse ? 64 : 256, { type: THREE.HalfFloatType })
    new THREE.CubeCamera(1, 1000, envTarget).update(gl, envScene)
    const env = envTarget.texture
    const pmrem = { dispose: () => { envTarget.dispose(); rect.dispose(); envScene.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose() } }) } }
    scene.environment = env
    scene.add(new THREE.HemisphereLight('#ffffff', '#dfe5ea', 0.55))
    const key = new THREE.DirectionalLight('#ffffff', 2.1); key.position.set(-3, 4, 2.5); scene.add(key)
    const rim = new THREE.DirectionalLight('#eef6ff', 0.9); rim.position.set(3, 2.5, -3); scene.add(rim)
    const fill = new THREE.DirectionalLight('#ffffff', 0.25); fill.position.set(0, -1, 3); scene.add(fill)

    const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 40)
    const holder = new THREE.Group()
    scene.add(holder)

    const glow = {
      uRegion: { value: Array(REGIONS.length).fill(0) }, uPulse: { value: 0 }, uTime: { value: 0 },
      uRestMatrix: { value: new THREE.Matrix4() }, uColorA: { value: new THREE.Color('#D90F1A') }, uColorB: { value: new THREE.Color('#EE3A42') },
    }
    const material = bodyMaterial(glow)

    const cam = camState(reducedMotion ? SHOTS[category] || SHOTS.all : START)
    const regions = Object.fromEntries([...REGIONS.map((r) => [r, 0]), ['pulse', 0]])
    const spin = { angle: 0, velocity: 0, tilt: 0, dragging: false, home: false }
    let tilt = 0
    let first = true
    let anchorList = []

    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    let disposed = false
    loader.load(coarse ? '/models/human-body-lite.glb' : '/models/human-body.glb', (gltf) => {
      if (disposed) return
      const model = gltf.scene
      const meshes = []
      model.traverse((o) => { if (o.isMesh) meshes.push(o) })
      model.updateMatrixWorld(true)
      if (meshes[0]) glow.uRestMatrix.value.copy(meshes[0].matrixWorld)
      meshes.forEach((m) => { m.material = material; m.frustumCulled = false; if (!m.geometry.getAttribute('normal')) m.geometry.computeVertexNormals() })
      // normalise to 1.79 m tall, feet on the floor, centred
      const box = new THREE.Box3().setFromObject(model)
      const s = 1.79 / box.getSize(new THREE.Vector3()).y
      model.scale.setScalar(s)
      const c = box.getCenter(new THREE.Vector3())
      model.position.set(-c.x * s, -box.min.y * s, -c.z * s)
      holder.add(model)
      model.updateMatrixWorld(true)
      meshes.forEach((m) => m.geometry.computeBoundingSphere())
      const ray = new THREE.Raycaster()
      anchorList = PINS.map((p) => {
        const from = new THREE.Vector3(...p.from)
        const dir = new THREE.Vector3(...p.dir).normalize()
        ray.set(from, dir)
        const hit = ray.intersectObjects(meshes, false)[0]
        const position = hit ? hit.point.clone() : from.clone().addScaledVector(dir, from.z > 1 ? from.z - 0.12 : 1.2)
        return { id: p.id, position, normal: dir.clone().negate() }
      })
      setAnchors(anchorList)
      requestAnimationFrame(() => setReady(true))
    })

    // ---- camera + glow tweens per category ----
    const go = (id) => {
      const shot = SHOTS[id] || SHOTS.all
      const g = GLOW[id] || {}
      const pulse = id === 'all' || id === 'in-demand' ? 0 : 0.12
      const intro = first
      first = false
      const dur = reducedMotion ? 0.001 : intro ? 2.4 : shot.duration
      gsap.to(cam, { px: shot.position[0], py: shot.position[1], pz: shot.position[2], tx: shot.target[0], ty: shot.target[1], tz: shot.target[2], fov: shot.fov, duration: dur, ease: intro ? 'expo.out' : 'power3.inOut', overwrite: 'auto' })
      REGIONS.forEach((r) => {
        const to = g[r] ?? 0
        const fading = to < regions[r]
        gsap.to(regions, { [r]: to, duration: reducedMotion ? 0.001 : fading ? 0.35 : 0.9, delay: reducedMotion || fading ? 0 : intro ? 1.2 : 0.55, ease: fading ? 'power2.out' : 'power2.inOut', overwrite: 'auto' })
      })
      gsap.to(regions, { pulse: reducedMotion ? 0 : pulse, duration: 0.8, overwrite: 'auto' })
      spin.home = !intro
    }
    api.current = { go, spin }
    go(category)

    // ---- render loop ----
    const target = new THREE.Vector3()
    const offset = new THREE.Vector3()
    const axis = new THREE.Vector3()
    const up = new THREE.Vector3(0, 1, 0)
    const q = new THREE.Vector3(); const n = new THREE.Vector3(); const toCam = new THREE.Vector3(); const proj = new THREE.Vector3()
    const feetProj = new THREE.Vector3()
    const clock = new THREE.Clock()
    let visible = true
    let raf = 0
    let W = 1, H = 1

    const resize = () => {
      W = Math.max(el.clientWidth, 1); H = Math.max(el.clientHeight, 1)
      gl.setSize(W, H, false)
      camera.aspect = W / H
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick) }, { rootMargin: '100px' })
    io.observe(el)

    function tick() {
      raf = 0
      if (!visible) return
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime
      // drag inertia, then ease back to the front view after a category change
      if (!spin.dragging) {
        spin.angle += spin.velocity * dt
        spin.velocity *= Math.exp(-2.6 * dt)
        if (Math.abs(spin.velocity) < 0.001) spin.velocity = 0
      }
      if (spin.home && !spin.dragging) {
        spin.velocity = 0
        const homeAngle = Math.round(spin.angle / (2 * Math.PI)) * Math.PI * 2
        const k = reducedMotion ? 1 : 1 - Math.exp(-3.2 * dt)
        spin.angle += (homeAngle - spin.angle) * k
        spin.tilt += (0 - spin.tilt) * k
        if (Math.abs(homeAngle - spin.angle) < 0.001 && Math.abs(spin.tilt) < 0.001) { spin.angle = homeAngle; spin.tilt = 0; spin.home = false }
      }
      tilt += (spin.tilt - tilt) * (1 - Math.exp(-8 * dt))
      const sc = scroll?.current || { dolly: 0, lift: 0 }
      holder.rotation.y = spin.angle
      // pull the camera back on tall/narrow frames so the whole body still fits
      const aspect = W / H
      let fit = aspect < 0.62 ? Math.min(0.62 / aspect, 1.4) : 1
      if (H < 480) fit *= 1 + 0.35 * THREE.MathUtils.clamp((3.6 - Math.hypot(cam.px - cam.tx, cam.py - cam.ty, cam.pz - cam.tz)) / 1.3, 0, 1)
      target.set(cam.tx, cam.ty + sc.lift, cam.tz)
      offset.set(cam.px, cam.py + sc.lift, cam.pz).sub(target).multiplyScalar(fit * (1 + sc.dolly))
      axis.crossVectors(up, offset).normalize()
      offset.applyAxisAngle(axis, -tilt * (coarse ? 0.6 : 1))
      camera.position.copy(target).add(offset)
      camera.lookAt(target)
      if (Math.abs(camera.fov - cam.fov) > 0.001) { camera.fov = cam.fov; camera.updateProjectionMatrix() }
      REGIONS.forEach((r, i) => { glow.uRegion.value[i] = regions[r] })
      glow.uPulse.value = regions.pulse
      glow.uTime.value = t
      holder.updateMatrixWorld(true)
      gl.render(scene, camera)
      // ground contact shadow tracks the feet: project the model's floor point (holder-local origin)
      // through the same camera, so it follows every rotation, drag-tilt, and scroll dolly/lift.
      if (shadowEl.current) {
        feetProj.set(0, 0, 0).applyMatrix4(holder.matrixWorld).project(camera)
        const sx = (feetProj.x * 0.5 + 0.5) * W
        const sy = (-feetProj.y * 0.5 + 0.5) * H
        const zoom = fit * (1 + sc.dolly)
        const scale = THREE.MathUtils.clamp(1 / zoom, 0.55, 1.6)
        shadowEl.current.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
      }
      // project pins onto the canvas; fade them out as they turn away from the camera
      anchorList.forEach((a, i) => {
        const pin = pinEls.current[i]
        if (!pin) return
        q.copy(a.position).addScaledVector(a.normal, 0.012).applyMatrix4(holder.matrixWorld)
        n.copy(a.normal).transformDirection(holder.matrixWorld)
        toCam.copy(camera.position).sub(q).normalize()
        proj.copy(q).project(camera)
        const on = proj.z < 1 && Math.abs(proj.x) < 1.1 && Math.abs(proj.y) < 1.1 ? THREE.MathUtils.clamp((n.dot(toCam) - 0.05) / 0.25, 0, 1) : 0
        const x = (proj.x * 0.5 + 0.5) * W
        const y = (-proj.y * 0.5 + 0.5) * H
        pin.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`
        pin.style.opacity = on.toFixed(3)
        pin.style.pointerEvents = on > 0.3 ? 'auto' : 'none'
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect(); io.disconnect()
      gsap.killTweensOf(cam); gsap.killTweensOf(regions)
      scene.traverse((o) => { if (o.isMesh) o.geometry.dispose() })
      material.dispose(); pmrem.dispose()
      gl.dispose()
      gl.domElement.remove()
    }
    // the scene is built once; category changes go through api.current.go below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return }
    api.current?.go(category)
  }, [category])

  // ---- drag to rotate (horizontal spin with inertia, slight vertical tilt on mouse) ----
  const drag = useRef(null)
  const onPointerDown = (e) => {
    if (e.button !== 0 || !api.current) return
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), touch: e.pointerType !== 'mouse' }
    Object.assign(api.current.spin, { dragging: true, home: false, velocity: 0 })
    setGrabbing(true)
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* noop */ }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const w = wrap.current?.clientWidth || 600
    const now = performance.now()
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    const dt = Math.max((now - d.t) / 1000, 1 / 240)
    const da = (dx / w) * Math.PI * 1.6
    const s = api.current.spin
    s.angle += da
    s.velocity = s.velocity * 0.6 + (da / dt) * 0.4
    if (!d.touch) s.tilt = THREE.MathUtils.clamp(s.tilt + (dy / w) * 1.6, -0.35, 0.55)
    Object.assign(d, { x: e.clientX, y: e.clientY, t: now })
  }
  const onPointerUp = (e) => {
    if (!drag.current || drag.current.id !== e.pointerId) return
    drag.current = null
    const s = api.current.spin
    s.dragging = false
    s.velocity = THREE.MathUtils.clamp(s.velocity, -8, 8)
    setGrabbing(false)
  }

  return (
    <div
      ref={wrap}
      className={`absolute inset-0 touch-pan-y select-none transition-opacity duration-1000 ease-out ${ready || !supported ? 'opacity-100' : 'opacity-0'} ${grabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {!supported && (
        <div className="grid h-full place-items-center px-8 text-center text-sm text-neutral-400">3D view isn&apos;t available in this browser. Use the categories to browse treatments.</div>
      )}
      {/* soft contact shadow under the feet, repositioned every frame to track the body's rotation, tilt and zoom;
          sits behind the canvas (z-0 vs the canvas's z-1) so the body occludes it like a real ground shadow */}
      <div ref={shadowEl} aria-hidden className="pointer-events-none absolute top-0 left-0 z-0 h-6 w-[220px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(91,100,112,0.32),transparent)] will-change-transform" />
      <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
        {anchors.map((a, i) => {
          const active = a.id === category
          const label = getCategory(a.id).label
          return (
            <div key={a.id} ref={(el) => { pinEls.current[i] = el }} className="absolute top-0 left-0 opacity-0 will-change-transform" style={{ pointerEvents: 'none' }}>
              <button
                type="button"
                aria-label={`Show ${label}`}
                aria-pressed={active}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onSelect(a.id) }}
                className={`pin group/pin relative grid h-8 w-8 cursor-pointer place-items-center ${active ? 'pin-active' : ''}`}
              >
                <span className="pin-ring" />
                <span className="pin-dot" />
                <span className={`pointer-events-none absolute top-1/2 left-[calc(100%+2px)] -translate-y-1/2 rounded-md border border-neutral-200 bg-white/95 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-neutral-800 shadow-sm backdrop-blur transition-all duration-300 ${active ? 'opacity-100' : '-translate-x-1 opacity-0 group-hover/pin:translate-x-0 group-hover/pin:opacity-100'}`}>{label}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
