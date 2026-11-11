import { useEffect, useRef } from 'react'

// Falling Paramount pills (sprites cut from Higgsfield renders, see scripts/pills.mjs).
// When the section scrolls into view, pills rain down from the top and others pop up from the bottom,
// then pile on the floor. Visitors can grab and throw them (mouse or touch), and the cursor nudges them.
// The canvas is purely visual (pointer-events: none); events are read on the parent section so the FAQ
// buttons underneath keep working whenever you're not on a pill.

const SPRITES = [
  { src: 'pill-0', kind: 'round' }, { src: 'pill-1', kind: 'round' }, { src: 'pill-2', kind: 'round' },
  { src: 'pill-3', kind: 'round' }, { src: 'pill-4', kind: 'round' }, { src: 'pill-5', kind: 'round' },
  { src: 'pill-6', kind: 'round' }, { src: 'pill-7', kind: 'long' },
]
// 24 pills: each of the 7 round tablets three times, plus three white caplets (no gel capsules)
const LINEUP = [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7]

export function PillDrop() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = canvas?.parentElement
    if (!canvas || !section) return
    let disposed = false
    let cleanup = () => {}

    // only load the physics engine once the section is close
    const loadIo = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting) return
      loadIo.disconnect()
      const Matter = (await import('matter-js')).default
      if (!disposed) cleanup = start(Matter, canvas, section)
    }, { rootMargin: '400px 0px' })
    loadIo.observe(section)

    return () => { disposed = true; loadIo.disconnect(); cleanup() }
  }, [])

  // the canvas runs a little past the section so the pile can rest on the footer card's top edge;
  // its top fades out so pills ease in instead of popping in at a hard line
  const fade = 'linear-gradient(to bottom, transparent 0, #000 140px)'
  return (
    <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute top-0 left-0 z-20 w-full"
      style={{ maskImage: fade, WebkitMaskImage: fade }} />
  )
}

function start(Matter, canvas, section) {
  const { Engine, Bodies, Body, Composite, Constraint, Query, Sleeping } = Matter
  const ctx = canvas.getContext('2d')
  const engine = Engine.create({ enableSleeping: true })
  engine.gravity.y = 1
  const world = engine.world

  const imgs = SPRITES.map((s) => { const im = new Image(); im.src = `/img/pills/${s.src}.webp`; return im })

  let W = 0, H = 0, CH = 0, dpr = 1, size = 64
  let walls = []
  const pills = []

  function measure() {
    const r = section.getBoundingClientRect()
    W = r.width
    // floor = the footer card's top edge (pills sit just over its rim); falls back to the section bottom
    const card = document.querySelector('footer > div')
    H = card ? card.getBoundingClientRect().top - r.top + 6 : r.height
    CH = H + 40 // canvas height: a little below the floor so nothing gets clipped
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.style.height = `${CH}px`
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(CH * dpr)
    size = Math.max(34, Math.min(56, W / 26))
    walls.forEach((w) => Composite.remove(world, w))
    const t = 200
    walls = [
      Bodies.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true }), // floor
      Bodies.rectangle(-t / 2, H / 2 - 2000, t, H + 4000, { isStatic: true }), // left (tall so throws stay in)
      Bodies.rectangle(W + t / 2, H / 2 - 2000, t, H + 4000, { isStatic: true }), // right
    ]
    Composite.add(world, walls)
    // keep pills inside after a resize
    pills.forEach((p) => {
      const x = Math.min(Math.max(p.body.position.x, size), W - size)
      const y = Math.min(p.body.position.y, H - size / 2)
      Body.setPosition(p.body, { x, y }); Sleeping.set(p.body, false)
    })
  }

  function makePill(i, x, y) {
    const sp = SPRITES[LINEUP[i]]
    const opts = { restitution: 0.35, friction: 0.25, frictionAir: 0.012, density: 0.002, angle: Math.random() * Math.PI * 2 }
    const scale = 0.85 + Math.random() * 0.3
    let body, w, h
    if (sp.kind === 'round') {
      w = h = size * scale
      body = Bodies.circle(x, y, w / 2 * 0.96, opts)
    } else {
      const im = imgs[LINEUP[i]]
      const ratio = im.naturalWidth ? im.naturalHeight / im.naturalWidth : 0.42
      w = size * 1.45 * scale; h = w * ratio
      body = Bodies.rectangle(x, y, w, h * 0.92, { ...opts, chamfer: { radius: h * 0.44 } })
    }
    pills.push({ body, img: imgs[LINEUP[i]], w, h })
    Composite.add(world, body)
    return body
  }

  measure()

  // ---- spawn: two thirds rain from the top, a third pop up from the bottom ----
  const timers = []
  function spawn() {
    LINEUP.forEach((_, i) => {
      timers.push(setTimeout(() => {
        const x = size + Math.random() * (W - size * 2)
        if (i % 3 === 2) {
          const b = makePill(i, x, H - size)
          Body.setVelocity(b, { x: (Math.random() - 0.5) * 6, y: -(Math.min(19, Math.sqrt(H) * 0.75) + Math.random() * 3) })
        } else {
          // start just above whatever is visible (on phones the section top may already be off screen)
          const top = Math.max(0, -section.getBoundingClientRect().top)
          const b = makePill(i, x, top - size - Math.random() * 80)
          Body.setVelocity(b, { x: (Math.random() - 0.5) * 2, y: 2 + Math.random() * 3 })
        }
        Body.setAngularVelocity(pills[pills.length - 1].body, (Math.random() - 0.5) * 0.25)
      }, i * 110))
    })
  }

  // ---- render loop (paused while off screen) ----
  let raf = 0, running = false, last = 0
  function frame(t) {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(32, last ? t - last : 16.67); last = t
    Engine.update(engine, dt)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, CH)
    ctx.shadowColor = 'rgba(16, 38, 70, 0.18)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6
    for (const p of pills) {
      if (!p.img.complete || !p.img.naturalWidth) continue
      const { x, y } = p.body.position
      ctx.save(); ctx.translate(x, y); ctx.rotate(p.body.angle)
      ctx.drawImage(p.img, -p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }
  }
  // run the loop only while the section is on screen
  const viewIo = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; last = 0; raf = requestAnimationFrame(frame) }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf) }
  })
  viewIo.observe(section)

  // drop the pills once the visitor can see the whole section, i.e. its floor (the footer's top edge)
  // is on screen, after a short beat so the questions register first
  const floorMark = document.createElement('div')
  floorMark.style.cssText = 'position:absolute;left:0;width:1px;height:1px;pointer-events:none'
  section.appendChild(floorMark)
  const placeMark = () => { floorMark.style.top = `${Math.max(0, H - 2)}px` }
  placeMark()
  let spawned = false
  const dropIo = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting || spawned) return
    spawned = true; dropIo.disconnect()
    timers.push(setTimeout(spawn, 350))
  }, { rootMargin: '0px 0px -6% 0px' })
  dropIo.observe(floorMark)

  const ro = new ResizeObserver(() => { measure(); placeMark() })
  ro.observe(section)

  // ---- interaction: grab & throw, cursor nudge ----
  let drag = null, lastPt = null, dragged = false
  const pt = (cx, cy) => { const r = section.getBoundingClientRect(); return { x: cx - r.left, y: cy - r.top } }
  const hit = (p) => Query.point(pills.map((q) => q.body), p)[0]

  function onDown(e) {
    const p = pt(e.clientX, e.clientY)
    const b = hit(p)
    dragged = false
    if (!b) return
    e.preventDefault()
    section.setPointerCapture?.(e.pointerId)
    Sleeping.set(b, false)
    const local = Matter.Vector.rotate(Matter.Vector.sub(p, b.position), -b.angle)
    drag = Constraint.create({ pointA: p, bodyB: b, pointB: local, stiffness: 0.2, damping: 0.1, length: 0 })
    Composite.add(world, drag)
    section.style.cursor = 'grabbing'
  }
  function onMove(e) {
    const p = pt(e.clientX, e.clientY)
    if (drag) { drag.pointA = p; dragged = true; lastPt = p; return }
    // cursor gently pushes nearby pills
    if (lastPt && e.pointerType === 'mouse') {
      const vx = p.x - lastPt.x, vy = p.y - lastPt.y
      for (const q of pills) {
        const dx = q.body.position.x - p.x, dy = q.body.position.y - p.y
        if (dx * dx + dy * dy < (size * 0.8) ** 2) {
          Sleeping.set(q.body, false)
          Body.applyForce(q.body, q.body.position, { x: vx * 0.0009 * q.body.mass, y: vy * 0.0009 * q.body.mass - 0.0025 * q.body.mass })
        }
      }
    }
    lastPt = p
    if (e.pointerType === 'mouse') section.style.cursor = hit(p) ? 'grab' : ''
  }
  function onUp() {
    if (!drag) return
    Composite.remove(world, drag); drag = null
    section.style.cursor = ''
  }
  // a click that started on a pill shouldn't also toggle the FAQ underneath
  function onClick(e) { if (dragged || hit(pt(e.clientX, e.clientY))) { e.stopPropagation(); e.preventDefault() } dragged = false }
  // touch: if the finger lands on a pill, grab it instead of scrolling the page
  function onTouchStart(e) { const t = e.touches[0]; if (t && hit(pt(t.clientX, t.clientY))) e.preventDefault() }

  section.addEventListener('pointerdown', onDown)
  section.addEventListener('pointermove', onMove)
  section.addEventListener('pointerup', onUp)
  section.addEventListener('pointercancel', onUp)
  section.addEventListener('click', onClick, true)
  section.addEventListener('touchstart', onTouchStart, { passive: false })

  return () => {
    timers.forEach(clearTimeout)
    cancelAnimationFrame(raf)
    viewIo.disconnect(); dropIo.disconnect(); ro.disconnect(); floorMark.remove()
    section.removeEventListener('pointerdown', onDown)
    section.removeEventListener('pointermove', onMove)
    section.removeEventListener('pointerup', onUp)
    section.removeEventListener('pointercancel', onUp)
    section.removeEventListener('click', onClick, true)
    section.removeEventListener('touchstart', onTouchStart)
    section.style.cursor = ''
    Composite.clear(world, false); Engine.clear(engine)
  }
}
