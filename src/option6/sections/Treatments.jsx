import { useEffect, useRef, useState } from 'react'
import { gsap } from '../motion.js'
import { links } from '../content.js'
import { Tag, Img } from '../components/ui.jsx'
import { cards } from './Story.jsx'

// Option 6: "Choose Your Health Journey" as a card stack (Concept I from the Hero Section Options page).
// All six treatments sit in one deck; each step throws the top card away to reveal the next while the list tracks
// where you are. Desktop: the hero's pinned timeline (Top.jsx) drives the deck with the scroll through `treat.set`.
// Phones and tablets: swipe the deck sideways or tap a name.

const N = cards.length
const clamp = (v) => Math.min(N - 1, Math.max(0, v))

/** Hook for the hero timeline: Top.jsx calls treat.set(p) with p from 0 (first card on top) to N - 1. */
export const treat = { set: null, hop: null, now: null, from: 0, to: N - 1 }

function Explore() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-ink transition-colors duration-300 group-hover:bg-sky group-hover:text-white">
      Explore
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 3.5L10.5 8 6 12.5" /></svg>
    </span>
  )
}

export function About() {
  const root = useRef(null)
  const deck = useRef(null)
  const st = useRef({ p: 0 })
  const tween = useRef(null)
  const [cur, setCur] = useState(0)
  const [touch, setTouch] = useState(false)
  const chips = useRef(null)
  // phones / tablets: keep the current name's button in view in the row
  useEffect(() => {
    const row = chips.current
    const b = row?.querySelectorAll('button')[cur]
    if (row && b && row.offsetParent) row.scrollTo({ left: b.offsetLeft - 20, behavior: 'smooth' })
  }, [cur])

  useEffect(() => {
    setTouch(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024)
    const els = gsap.utils.toArray('[data-stack-card]', root.current)
    const shades = els.map((el) => el.querySelector('[data-shade]'))
    const plates = gsap.utils.toArray('[data-plate]', root.current)
    const place = () => {
      const p = st.current.p
      const h = els[0]?.offsetHeight || 0 // read once per frame (reading it per card, between writes, forced extra layouts)
      els.forEach((el, i) => {
        const d = i - p // > 0: still in the deck (d slots down), < 0: thrown away
        if (d >= 0) {
          // a real stack: each card behind is a little narrower and sits 16px lower, so a clear strip of it peeks out
          // under the one in front (the scale's shrink is added back to the offset so the strip doesn't get swallowed)
          // the 4th card back fades in/out gradually instead of popping; depth is a dark layer's opacity, not a CSS
          // filter (a filter repaints the whole photo every frame, which is what made the motion stutter)
          const k = Math.min(d, 3)
          const sc = 1 - k * 0.05
          gsap.set(el, { x: 0, y: k * 16 + (1 - sc) * h / 2, scale: sc, rotation: 0, opacity: Math.max(0, Math.min(1, 4 - d)), zIndex: 100 - i })
          if (shades[i]) shades[i].style.opacity = (k * 0.14).toFixed(3)
        } else {
          const t = Math.min(1, -d) // 0 → 1 as the card is thrown
          gsap.set(el, { x: t * 140, y: -t * window.innerHeight * 0.85, rotation: t * (i % 2 ? 14 : -14), scale: 1, opacity: 1 - t * 0.2, zIndex: 100 + i })
          if (shades[i]) shades[i].style.opacity = '0'
        }
      })
      // the three back plates always sit in the three slots behind the top card (under the real cards), so the stack
      // keeps its four layers even when there are no more real cards behind — right up to the last one
      plates.forEach((el, j) => {
        const sc = 1 - (j + 1) * 0.05
        gsap.set(el, { y: (j + 1) * 16 + (1 - sc) * h / 2, scale: sc, zIndex: 3 - j }) // nearest plate on top of the ones further back
      })
      const a = clamp(Math.round(p))
      setCur((c) => (c === a ? c : a))
    }
    // a jump straight to card k (a click on its name): the deck moves to k at once and only ONE card animates, like a
    // single step — going forward the current top card is thrown away to reveal k, going back k drops onto the deck.
    // Scroll updates that arrive mid-hop are held until it ends, so they can't snap the moving card.
    let hopping = null
    const thrown = (i) => ({ x: 140, y: -window.innerHeight * 0.85, rotation: i % 2 ? 14 : -14, scale: 1, opacity: 0.8 })
    const front = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 }
    treat.hop = (from, k) => {
      hopping?.kill()
      // going back, keep the deck exactly as it was shown (the previous card stays behind) while k drops on top;
      // the cards underneath settle into their real order only once k covers them
      st.current.p = k < from ? from : k
      place()
      st.current.p = k
      setCur(k)
      const el = k > from ? els[from] : els[k]
      const fromState = k > from ? front : thrown(k)
      const toState = k > from ? thrown(from) : front
      gsap.set(el, { zIndex: 300 })
      if (shades[els.indexOf(el)]) shades[els.indexOf(el)].style.opacity = '0'
      hopping = gsap.fromTo(el, fromState, {
        ...toState, duration: 0.7, ease: 'power2.inOut',
        onComplete: () => { hopping = null; place() },
      })
    }
    treat.now = () => st.current.p
    treat.set = (p) => { st.current.p = p; if (!hopping) place() }
    place()
    return () => { treat.set = null; treat.hop = null; treat.now = null; hopping?.kill(); tween.current?.kill() }
  }, [])

  // switch the deck to card i: the next/previous card glides (one throw), a farther one hops so only one card moves
  const target = useRef(0)
  const go = (i) => {
    const k = clamp(i)
    const from = Math.round(st.current.p)
    target.current = k
    if (k === from && !tween.current?.isActive()) return
    if (Math.abs(k - from) > 1 && treat.hop) { tween.current?.kill(); treat.hop(from, k); return }
    tween.current?.kill()
    tween.current = gsap.to(st.current, { p: k, duration: 0.6, ease: 'power2.inOut', onUpdate: () => treat.set?.(st.current.p) })
  }
  const step = (dir) => go(target.current + dir)

  // desktop: scrolling with the pointer over the cards steps one card per scroll gesture (mouse notch or trackpad
  // swipe); at the first / last card the scroll goes on to the page as usual. Elsewhere the page just scrolls.
  useEffect(() => {
    const el = deck.current
    if (!el) return
    let last = 0
    let g = { acc: 0, fired: false, at: 0, peak: 0, floor: Infinity, decayed: false }
    const onWheel = (e) => {
      const dir = e.deltaY > 0 ? 1 : -1
      const k = target.current
      if ((dir > 0 && k >= N - 1) || (dir < 0 && k <= 0)) return // nothing further this way: let the page scroll
      e.preventDefault()
      e.stopPropagation() // keep the smooth page scroller from moving the page meanwhile
      const now = performance.now()
      const gap = now - last
      last = now
      const d = Math.abs(e.deltaY) * (e.deltaMode === 1 ? 16 : 1)
      if (d < 1) return
      // one gesture = one card: a pause starts a new gesture, and so does a trackpad swipe that speeds up again
      // after its coast has slowed down (so a second swipe made while the first is still coasting still counts)
      let fresh = gap >= 140
      if (!fresh && g.fired) {
        g.peak = Math.max(g.peak, d)
        if (!g.decayed && d < g.peak * 0.55) g.decayed = true
        if (g.decayed) g.floor = Math.min(g.floor, d)
        if (g.decayed && now - g.at > 220 && d > Math.max(8, g.floor * 2 + 4)) fresh = true
      }
      if (fresh) g = { acc: 0, fired: false, at: 0, peak: 0, floor: Infinity, decayed: false }
      if (g.fired) return
      g.acc += d
      if (g.acc < 18) return
      g.fired = true
      g.at = now
      g.peak = d
      step(dir)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // touch: a sideways swipe on the deck moves one card (left = next, right = back)
  const start = useRef(null)
  const swiped = useRef(false)
  const onClickCapture = (e) => { if (swiped.current) { e.preventDefault(); e.stopPropagation(); swiped.current = false } }
  const onDown = (e) => { swiped.current = false; if (touch) start.current = { x: e.clientX, y: e.clientY, i: cur } }
  const onUp = (e) => {
    const s = start.current
    start.current = null
    if (!s) return
    const dx = e.clientX - s.x
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y)) {
      swiped.current = true // the click that follows this swipe must not open the card's link
      go(s.i + (dx < 0 ? 1 : -1))
    }
  }

  return (
    <section ref={root} id="about" className="relative z-10 h-lvh min-h-[600px] overflow-hidden bg-gray-100">{/* full large-viewport height (browser bar hidden) so nothing below peeks in */}
      <div className="mx-auto flex h-svh min-h-[600px] max-w-[1200px] flex-col gap-5 px-5 pt-[92px] pb-8 sm:px-8 sm:pt-[112px] lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20 xl:gap-24 lg:pt-[118px] lg:pb-12">
        <div data-fan-head className="flex flex-col gap-4 lg:gap-6">
          <Tag dot={false}>Treatments</Tag>
          <h2 id="treatments-heading" className="t-h2 lg:max-w-[11ch]">Choose Your Health Journey</h2>

          {/* desktop: the full list, the current one pushed in and enlarged; every row links on to the products page */}
          <ol className="mt-2 hidden flex-col lg:flex">
            {cards.map((c, i) => (
              <li key={c.name} className="border-b border-neutral-200">
                <div className={`group flex items-center justify-between gap-4 transition-colors duration-500 ${i === cur ? 'text-ink' : 'text-ink hover:text-navy'}`}>{/* the others are black too and turn navy on hover; the selected one is bigger and bold */}
                  {/* the name brings that card to the top of the deck; the arrow goes on to the products page */}
                  <button type="button" onClick={() => go(i)} aria-current={i === cur ? 'true' : undefined}
                    className={`flex-1 cursor-pointer py-3 text-left text-[22px] font-medium transition-all duration-500 [@media(min-height:820px)]:py-4 ${i === cur ? 'translate-x-2 text-[30px] font-semibold' : ''}`}>{c.name}</button>
                  <a href={links.products} aria-label={`Explore ${c.name}`} className="-m-2 p-2"><svg width="18" height="18" viewBox="0 0 10 9" fill="none" aria-hidden className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"><path fill="currentColor" d="M9.82143 4.73214L5.89286 8.48214C5.66964 8.68304 5.33482 8.68304 5.13393 8.45982C4.93304 8.23661 4.93304 7.90179 5.15625 7.70089L8.125 4.86607H0.535714C0.223214 4.86607 0 4.64286 0 4.33036C0 4.04018 0.223214 3.79464 0.535714 3.79464H8.125L5.15625 0.982143C4.93304 0.78125 4.93304 0.424107 5.13393 0.223214C5.33482 6.70552e-08 5.69196 6.70552e-08 5.89286 0.200893L9.82143 3.95089C9.93304 4.0625 10 4.19643 10 4.33036C10 4.48661 9.93304 4.62054 9.82143 4.73214Z" /></svg></a>
                </div>
              </li>
            ))}
          </ol>

          {/* phones / tablets: a row of names to tap */}
          <div ref={chips} className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:hidden">
            <div className="flex w-max gap-2">
              {cards.map((c, i) => (
                <button key={c.name} type="button" onClick={() => go(i)} aria-pressed={i === cur}
                  className={`rounded-full border px-4 py-2 text-[13px] font-semibold whitespace-nowrap transition-colors duration-300 ${i === cur ? 'border-navy bg-navy text-white' : 'border-neutral-300 bg-white/70 text-neutral-600'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          {touch && <p className="-mt-1 text-[12px] text-neutral-500 lg:hidden">Swipe the cards or tap a name</p>}
        </div>

        <div ref={deck} data-deck className="relative mb-[60px] min-h-[320px] flex-1 lg:mr-16 lg:mb-0 lg:h-[min(560px,calc(100svh-230px))] lg:flex-none"
          style={{ touchAction: touch ? 'pan-y' : undefined }} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { start.current = null }} onClickCapture={onClickCapture}>
          {/* back plates: the stack's depth when the real cards behind run out */}
          {[0, 1, 2].map((j) => (
            <div key={j} data-plate aria-hidden className="pointer-events-none absolute inset-0 rounded-[30px] shadow-[0_-8px_20px_-10px_rgba(10,26,47,0.45),0_40px_80px_-40px_rgba(10,26,47,0.6)] ring-[1.5px] ring-white/30 will-change-transform"
              style={{ background: ['linear-gradient(180deg,#10161d,#07090c)', 'linear-gradient(180deg,#0d1218,#06080a)', 'linear-gradient(180deg,#0a0e13,#050608)'][j] }} />
          ))}
          {cards.map((c, i) => (
            <a key={c.name} data-stack-card href={links.products} aria-label={`Explore ${c.name}`} tabIndex={i === cur ? 0 : -1} draggable={false}
              className="group absolute inset-0 block overflow-hidden rounded-[30px] text-white shadow-[0_-8px_20px_-10px_rgba(10,26,47,0.45),0_40px_80px_-40px_rgba(10,26,47,0.6)] ring-[1.5px] ring-white/30 will-change-transform">
              <Img base={c.photo} widths={[600, 1000]} sizes="(min-width: 1024px) 560px, 92vw" alt="" draggable={false} loading={i < 2 ? 'eager' : 'lazy'} className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div data-shade aria-hidden className="pointer-events-none absolute inset-0 z-[1] bg-black opacity-0 will-change-[opacity]" />
              <span className="absolute top-5 left-5 flex size-12 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-md sm:top-6 sm:left-6"><c.Icon /></span>
              <span className="absolute inset-x-5 bottom-5 flex flex-col items-start gap-3 sm:inset-x-7 sm:bottom-7 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <span className="flex flex-col gap-2">
                  <span className="text-[24px] leading-tight font-semibold sm:text-[32px]">{c.name}</span>
                  <span className="max-w-[32ch] text-[14px] leading-snug text-white/85 sm:text-[16px]">{c.tagline}</span>
                </span>
                <Explore />
              </span>
            </a>
          ))}
          {/* desktop: up / down arrows on the right of the deck switch to the previous / next card */}
          <div className="absolute top-1/2 -right-16 z-[400] hidden -translate-y-1/2 flex-col gap-3 lg:flex">
            {[[-1, 'Previous treatment', 'M5 12.5L10 7.5 15 12.5'], [1, 'Next treatment', 'M5 7.5L10 12.5 15 7.5']].map(([dir, label, d]) => {
              const off = dir < 0 ? cur <= 0 : cur >= N - 1
              return (
                <button key={dir} type="button" aria-label={label} disabled={off} onClick={(e) => { e.preventDefault(); e.stopPropagation(); step(dir) }}
                  className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-navy shadow-[0_8px_20px_-12px_rgba(10,26,47,0.35)] transition-colors duration-300 hover:border-navy hover:bg-navy hover:text-white disabled:cursor-default disabled:opacity-35 disabled:hover:border-neutral-200 disabled:hover:bg-white disabled:hover:text-navy">
                  <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
