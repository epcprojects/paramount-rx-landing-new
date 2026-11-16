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
const pad = (i) => String(i + 1).padStart(2, '0')
const clamp = (v) => Math.min(N - 1, Math.max(0, v))

/** Hook for the hero timeline: Top.jsx calls treat.set(p) with p from 0 (first card on top) to N - 1. */
export const treat = { set: null, from: 0, to: N - 1 }

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
    const place = () => {
      const p = st.current.p
      els.forEach((el, i) => {
        const d = i - p // > 0: still in the deck (d slots down), < 0: thrown away
        if (d >= 0) {
          gsap.set(el, { x: 0, y: d * 22, scale: 1 - d * 0.06, rotation: 0, opacity: d > 3 ? 0 : 1, zIndex: 100 - i, filter: `brightness(${1 - Math.min(d, 3) * 0.12})` })
        } else {
          const t = Math.min(1, -d) // 0 → 1 as the card is thrown
          gsap.set(el, { x: t * 140, y: -t * window.innerHeight * 0.85, rotation: t * (i % 2 ? 14 : -14), scale: 1, opacity: 1 - t * 0.2, zIndex: 100 + i, filter: 'brightness(1)' })
        }
      })
      const a = clamp(Math.round(p))
      setCur((c) => (c === a ? c : a))
    }
    treat.set = (p) => { st.current.p = p; place() }
    place()
    return () => { treat.set = null; tween.current?.kill() }
  }, [])

  // touch: glide the deck to card i
  const go = (i) => {
    tween.current?.kill()
    tween.current = gsap.to(st.current, { p: clamp(i), duration: 0.7, ease: 'power2.inOut', onUpdate: () => treat.set?.(st.current.p) })
  }
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
      <div className="mx-auto flex h-svh min-h-[600px] max-w-[1200px] flex-col gap-5 px-5 pt-[92px] pb-8 sm:px-8 sm:pt-[112px] lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12 lg:pt-[118px] lg:pb-12">
        <div data-fan-head className="flex flex-col gap-4 lg:gap-6">
          <Tag dot={false}>Treatments</Tag>
          <h2 id="treatments-heading" className="t-h2 lg:max-w-[11ch]">Choose Your Health Journey</h2>

          {/* desktop: the full list, the current one pushed in and enlarged */}
          <ol className="mt-2 hidden flex-col lg:flex">
            {cards.map((c, i) => (
              <li key={c.name} className={`flex items-baseline gap-4 border-b border-neutral-200 py-2.5 transition-all duration-500 ${i === cur ? 'translate-x-2 text-ink' : 'text-neutral-400'}`}>
                <span className="w-7 text-[13px] font-semibold tabular-nums">{pad(i)}</span>
                <span className={`text-[20px] font-medium transition-all duration-500 ${i === cur ? 'text-[26px] font-semibold' : ''}`}>{c.name}</span>
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

        <div data-deck className="relative mb-[60px] min-h-[320px] flex-1 lg:mb-0 lg:h-[min(560px,calc(100svh-230px))] lg:flex-none"
          style={{ touchAction: touch ? 'pan-y' : undefined }} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { start.current = null }} onClickCapture={onClickCapture}>
          {cards.map((c, i) => (
            <a key={c.name} data-stack-card href={links.products} aria-label={`Explore ${c.name}`} tabIndex={i === cur ? 0 : -1} draggable={false}
              className="group absolute inset-0 block overflow-hidden rounded-[30px] text-white shadow-[0_40px_80px_-40px_rgba(10,26,47,0.6)] will-change-transform">
              <Img base={c.photo} widths={[600, 1000]} sizes="(min-width: 1024px) 560px, 92vw" alt="" draggable={false} loading={i < 2 ? 'eager' : 'lazy'} className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute top-5 left-5 flex size-12 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-md sm:top-6 sm:left-6"><c.Icon /></span>
              <span className="absolute top-6 right-6 text-sm font-semibold tabular-nums text-white/80 sm:top-7 sm:right-7">{pad(i)} / {pad(N - 1)}</span>
              <span className="absolute inset-x-5 bottom-5 flex flex-col items-start gap-3 sm:inset-x-7 sm:bottom-7 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <span className="flex flex-col gap-2">
                  <span className="text-[24px] leading-tight font-semibold sm:text-[32px]">{c.name}</span>
                  <span className="max-w-[32ch] text-[14px] leading-snug text-white/85 sm:text-[16px]">{c.tagline}</span>
                </span>
                <Explore />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
