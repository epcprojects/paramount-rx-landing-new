import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../motion.js'
import { Flip } from 'gsap/Flip'
import { links } from '../content.js'
import { Tag } from '../components/ui.jsx'
import { cards } from '../sections/Story.jsx'

gsap.registerPlugin(Flip)

// Interactive layouts for the treatment section (preview page only):
// N drag coverflow · O goal filter + flip cards. None are pinned: they're played with.

const N = cards.length
const pad = (i) => String(i + 1).padStart(2, '0')

function Label({ id, name, note }) {
  return (
    <>
      <div className="pointer-events-none absolute top-6 left-6 z-40 rounded-full bg-[#3AB5FE] px-4 py-2 text-sm font-semibold text-white shadow-lg">Concept {id} · {name} · interactive</div>
      <p className="pointer-events-none absolute top-[70px] left-6 z-40 max-w-[360px] text-[13px] leading-snug text-neutral-500">{note}</p>
    </>
  )
}

function Explore({ dark = false }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold ${dark ? 'bg-navy text-white' : 'bg-white text-ink'}`}>
      Explore
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 3.5L10.5 8 6 12.5" /></svg>
    </span>
  )
}

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={dir < 0 ? 'M10 3.5L5.5 8 10 12.5' : 'M6 3.5L10.5 8 6 12.5'} />
  </svg>
)

/* ───────── N · Drag coverflow ───────── */
// A 3D coverflow: the current treatment big in the middle, the others angled away on either side. Drag or flick it
// (mouse or finger), scroll sideways, use the arrows/keys or click a side card. It glides and settles with momentum.
export function Coverflow() {
  const root = useRef(null)
  const stage = useRef(null)
  const [cur, setCur] = useState(0)
  const api = useRef({})
  useGSAP(() => {
    const els = gsap.utils.toArray('[data-cf]', root.current)
    const s = { i: 3 } // starts off to the side for the entrance, then flies in to card 0
    const layout = () => {
      const w = els[0].offsetWidth
      els.forEach((el, k) => {
        const r = k - s.i
        const a = Math.abs(r)
        gsap.set(el, {
          x: r * w * 0.58 + Math.sign(r) * Math.min(a, 1) * w * 0.12,
          z: -a * 160,
          rotationY: gsap.utils.clamp(-48, 48, -r * 42),
          scale: 1 - Math.min(a, 3) * 0.04,
          opacity: a > 3.2 ? 0 : 1 - Math.max(0, a - 2.2) * 0.8,
          zIndex: 100 - Math.round(a * 10),
          filter: `brightness(${1 - Math.min(a, 2) * 0.18})`,
        })
      })
      const c = gsap.utils.clamp(0, N - 1, Math.round(s.i))
      setCur((v) => (v === c ? v : c))
    }
    layout()
    const go = (to, dur = 0.7) => gsap.to(s, { i: gsap.utils.clamp(0, N - 1, to), duration: dur, ease: 'power3.out', overwrite: true, onUpdate: layout })
    api.current.go = (to) => go(to)
    api.current.cur = () => Math.round(s.i)
    // entrance: fly in from the right when the section scrolls into view
    gsap.to(s, { i: 0, duration: 1.4, ease: 'power3.out', onUpdate: layout, scrollTrigger: { trigger: root.current, start: 'top 65%', once: true } })
    // drag / flick
    const el = stage.current
    let x0 = 0, i0 = 0, last = 0, lastT = 0, vel = 0, dragging = false, moved = 0
    const down = (e) => { dragging = true; moved = 0; x0 = last = e.clientX; lastT = performance.now(); i0 = s.i; vel = 0; gsap.killTweensOf(s); el.setPointerCapture?.(e.pointerId) }
    const move = (e) => {
      if (!dragging) return
      const w = els[0].offsetWidth * 0.62
      const now = performance.now()
      vel = (e.clientX - last) / Math.max(1, now - lastT) // px/ms
      last = e.clientX; lastT = now
      moved = Math.max(moved, Math.abs(e.clientX - x0))
      s.i = gsap.utils.clamp(-0.4, N - 0.6, i0 - (e.clientX - x0) / w)
      layout()
    }
    const up = () => {
      if (!dragging) return
      dragging = false
      const w = els[0].offsetWidth * 0.62
      go(Math.round(s.i - (vel * 260) / w), 0.9) // fling: carry on with the drag's speed, then settle on a card
    }
    // horizontal trackpad scroll / shift+wheel
    let wheelT = 0
    const wheel = (e) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0
      if (!dx) return
      e.preventDefault()
      const now = performance.now()
      if (now - wheelT < 350) return
      wheelT = now
      go(Math.round(s.i) + (dx > 0 ? 1 : -1))
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    el.addEventListener('wheel', wheel, { passive: false })
    // a click (not a drag) on a side card brings it to the front
    api.current.clickCard = (k, e) => { if (moved > 6) { e.preventDefault(); return } if (k !== Math.round(s.i)) { e.preventDefault(); go(k) } }
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      el.removeEventListener('wheel', wheel)
    }
  }, { scope: root })
  const step = (d) => api.current.go?.(api.current.cur() + d)
  return (
    <section ref={root} className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#ffffff,#eef2f7_70%)] pt-28 pb-16" tabIndex={-1}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1) }}>
      <Label id="N" name="Coverflow" note="Drag or flick the cards (mouse or finger), scroll sideways, use the arrows/keys or click a side card. It glides in 3D and settles with momentum." />
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-6 text-center">
        <Tag dot={false}>Treatments</Tag>
        <h2 className="t-h2 mt-3">Choose Your Health Journey</h2>
      </div>
      <div ref={stage} className="relative mx-auto mt-10 h-[min(56svh,500px)] cursor-grab touch-pan-y select-none [perspective:1400px] active:cursor-grabbing">
        {cards.map((c, k) => (
          <a key={c.name} data-cf href={links.products} draggable={false} onClick={(e) => api.current.clickCard?.(k, e)}
            className="absolute top-0 left-1/2 -ml-[min(170px,36vw)] block h-full w-[min(340px,72vw)] overflow-hidden rounded-[28px] text-white shadow-[0_40px_70px_-35px_rgba(10,26,47,0.6)] will-change-transform">
            <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${c.image})` }} />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <span className="absolute top-5 left-5 flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-md [&_svg]:scale-90"><c.Icon /></span>
            <span className="absolute top-6 right-6 text-[13px] font-semibold tabular-nums text-white/80">{pad(k)}</span>
            <span className="absolute inset-x-6 bottom-6 flex flex-col items-start gap-2">
              <span className="text-[26px] leading-tight font-semibold">{c.name}</span>
              <span className="text-[14px] leading-snug text-white/85">{c.tagline}</span>
              <span className="mt-1"><Explore /></span>
            </span>
          </a>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-center gap-5">
        <button type="button" aria-label="Previous" onClick={() => step(-1)} className="grid size-11 place-items-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-navy hover:bg-navy hover:text-white"><Arrow dir={-1} /></button>
        <div className="flex items-center gap-2">
          {cards.map((c, k) => <button key={c.name} type="button" aria-label={c.name} onClick={() => api.current.go?.(k)} className={`h-2 rounded-full transition-all duration-300 ${k === cur ? 'w-8 bg-navy' : 'w-2 bg-ink/20'}`} />)}
        </div>
        <button type="button" aria-label="Next" onClick={() => step(1)} className="grid size-11 place-items-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-navy hover:bg-navy hover:text-white"><Arrow dir={1} /></button>
      </div>
      <p className="mt-4 text-center text-[13px] text-neutral-400">Drag, swipe or use ← → to explore</p>
    </section>
  )
}

/* ───────── O · Goal filter + flip cards ───────── */
// "What's your goal?" chips reshuffle the grid (cards glide to their new spots, non-matching ones shrink away).
// Hover (or tap) a card and it flips over to a back with more detail and a call to action.
const GOALS = [
  { id: 'all', label: 'Show all', match: () => true },
  { id: 'look', label: 'Look better', names: ['Weight Loss', 'Hair Loss', 'Peptides & Longevity'] },
  { id: 'strong', label: 'Feel stronger', names: ['Testosterone', 'Performance Enhancers', 'Peptides & Longevity'] },
  { id: 'long', label: 'Live longer', names: ['Peptides & Longevity', 'Weight Loss', 'Testosterone'] },
  { id: 'close', label: 'Closer connection', names: ['Sexual Health', 'Testosterone'] },
]
const BACK = {
  Testosterone: ['Capsules, troches, creams or injections', 'Lab-guided dosing', 'Ongoing monitoring'],
  'Peptides & Longevity': ['Recovery & repair peptides', 'NAD+ and longevity support', 'Physician-selected protocols'],
  'Sexual Health': ['Fast-acting troches & sprays', 'Discreet delivery', 'Private provider consult'],
  'Weight Loss': ['GLP-1 programs', 'Dosing tailored to you', 'Check-ins as you progress'],
  'Hair Loss': ['Oral & topical formulas', 'Minoxidil + finasteride options', 'Visible results in months'],
  'Performance Enhancers': ['Energy & strength support', 'Recovery protocols', 'Provider-guided cycles'],
}
export function GoalFlip() {
  const root = useRef(null)
  const flipState = useRef(null)
  const [goal, setGoal] = useState('all')
  const [flipped, setFlipped] = useState(-1)
  const g = GOALS.find((x) => x.id === goal)
  const show = (c) => (g.match ? g.match(c) : g.names.includes(c.name))
  const choose = (id) => {
    if (id === goal) return
    flipState.current = Flip.getState(root.current.querySelectorAll('[data-gf]'))
    setFlipped(-1)
    setGoal(id)
  }
  useLayoutEffect(() => {
    if (!flipState.current) return
    Flip.from(flipState.current, {
      duration: 0.7, ease: 'power3.inOut', absolute: true, scale: true, nested: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)', delay: 0.15 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.6, duration: 0.4, ease: 'power2.in' }),
    })
    flipState.current = null
  }, [goal])
  useGSAP(() => {
    gsap.from(root.current.querySelectorAll('[data-gf]'), { y: 60, opacity: 0, rotationX: -25, duration: 0.9, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: root.current, start: 'top 70%', once: true } })
  }, { scope: root })
  return (
    <section ref={root} className="relative bg-white px-6 pt-28 pb-20">
      <Label id="O" name="Goal filter + flip" note="Pick a goal and the grid reshuffles to the treatments that match. Hover (or tap) any card to flip it over for more detail and a call to action." />
      <div className="mx-auto flex max-w-[1100px] flex-col items-center text-center">
        <Tag dot={false}>Treatments</Tag>
        <h2 className="t-h2 mt-3">What&apos;s your goal?</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Goals">
          {GOALS.map((x) => (
            <button key={x.id} type="button" role="tab" aria-selected={x.id === goal} onClick={() => choose(x.id)}
              className={`rounded-full border px-5 py-2.5 text-[14px] font-semibold transition-colors duration-300 ${x.id === goal ? 'border-navy bg-navy text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:border-navy'}`}>{x.label}</button>
          ))}
        </div>
      </div>
      <ul className="mx-auto mt-10 grid max-w-[1000px] grid-cols-2 gap-5 [perspective:1400px] md:grid-cols-3">
        {cards.map((c, i) => (
          <li key={c.name} data-gf data-flip-id={c.name} className={`aspect-[259/254] ${show(c) ? '' : 'hidden'}`}
            onMouseEnter={() => setFlipped(i)} onMouseLeave={() => setFlipped(-1)}
            onClick={() => { if (window.matchMedia('(hover: none)').matches) setFlipped((f) => (f === i ? -1 : i)) }}>{/* touch: tap to flip */}
            <div className={`relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] ${flipped === i ? '[transform:rotateY(180deg)]' : ''}`}>
              {/* front */}
              <div className="absolute inset-0 overflow-hidden rounded-[22px] text-white [backface-visibility:hidden]">
                <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${c.image})` }} />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                <span className="absolute top-4 left-4 flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-md [&_svg]:scale-90"><c.Icon /></span>
                <span className="absolute inset-x-5 bottom-5 flex flex-col gap-1">
                  <span className="text-[22px] leading-tight font-semibold">{c.name}</span>
                  <span className="text-[14px] leading-snug text-white/85">{c.tagline}</span>
                </span>
              </div>
              {/* back */}
              <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[22px] bg-[linear-gradient(160deg,#104584,#04101E)] p-6 text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-white/10 [&_svg]:scale-75"><c.Icon /></span><span className="text-[20px] font-semibold">{c.name}</span></span>
                <ul className="flex flex-col gap-2 text-[14px] text-white/85">
                  {BACK[c.name].map((b) => <li key={b} className="flex items-start gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#3AB5FE]" />{b}</li>)}
                </ul>
                <a href={links.products} className="self-start"><Explore /></a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
