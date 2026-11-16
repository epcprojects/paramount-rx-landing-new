import { useEffect, useRef, useState } from 'react'
import { gsap } from '../motion.js'
import { links } from '../content.js'
import { Tag, Img } from '../components/ui.jsx'
import { cards } from './Story.jsx'

// Option 7: "Choose Your Health Journey" as a big type index (Concept M from the Hero Section Options page).
// The six names are set huge; each one fills with navy like a progress bar and wipes its photo up into the card
// beside the list. Desktop: the hero's pinned timeline (Top.jsx) drives it with the scroll through `treat.set`.
// Phones and tablets: tap a name.

const N = cards.length

/** Hook for the hero timeline: Top.jsx calls treat.set(p) with p from 1 (first name filled) to N (all filled). */
export const treat = { set: null, from: 1, to: N }

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
  const st = useRef({ p: 1 })
  const tween = useRef(null)
  const [cur, setCur] = useState(0)
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    setTouch(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024)
    const lines = gsap.utils.toArray('[data-line]', root.current)
    const shots = gsap.utils.toArray('[data-shot]', root.current)
    const paint = () => {
      const p = st.current.p
      lines.forEach((el, i) => {
        const f = Math.min(1, Math.max(0, p - i)) * 100
        el.style.backgroundImage = `linear-gradient(90deg, #104584 ${f}%, #cfd6df ${f}%)`
        el.style.transform = `translateX(${(Math.max(0, 1 - Math.abs(p - i - 0.5) * 2) * 24).toFixed(1)}px)`
      })
      shots.forEach((el, i) => {
        const w = i === 0 ? 1 : Math.max(0, Math.min(1, p - i)) // the photo wipes up as its name fills
        el.style.clipPath = `inset(${((1 - w) * 100).toFixed(1)}% 0% 0% 0%)`
      })
      // the card's copy switches to a name once its photo is half way in
      const a = Math.min(N - 1, Math.max(0, Math.round(p) - 1))
      setCur((c) => (c === a ? c : a))
    }
    treat.set = (p) => { st.current.p = p; paint() }
    paint()
    return () => { treat.set = null; tween.current?.kill() }
  }, [])

  // touch: fill up to name i (or back down to it)
  const go = (i) => {
    tween.current?.kill()
    tween.current = gsap.to(st.current, { p: i + 1, duration: 0.8, ease: 'power2.inOut', onUpdate: () => treat.set?.(st.current.p) })
  }

  const c = cards[cur]
  return (
    <section ref={root} id="about" className="relative z-10 h-lvh min-h-[620px] overflow-hidden bg-gray-100">{/* full large-viewport height (browser bar hidden) so nothing below peeks in */}
      <div className="mx-auto flex h-svh min-h-[620px] max-w-[1280px] flex-col gap-5 px-5 pt-[92px] pb-6 sm:px-8 sm:pt-[112px] sm:pb-8 lg:grid lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-12 lg:pt-[118px] lg:pb-12">
        <div data-fan-head>
          <Tag dot={false}>Treatments</Tag>
          <h2 id="treatments-heading" className="t-h2 mt-3">Choose Your Health Journey</h2>
          <ol className="mt-4 flex flex-col sm:mt-6 lg:mt-8">
            {cards.map((card, i) => (
              <li key={card.name} className="border-b border-neutral-200">
                <button type="button" onClick={touch ? () => go(i) : undefined} tabIndex={touch ? 0 : -1} aria-pressed={touch ? i === cur : undefined}
                  className={`flex w-full items-baseline py-2 text-left sm:py-2.5 lg:py-3.5 ${touch ? 'cursor-pointer' : 'cursor-default'}`}>
                  <span data-line className="bg-clip-text pb-[0.1em] text-[clamp(20px,5.4vw,28px)] leading-[1.1] font-semibold tracking-[-0.03em] text-transparent will-change-transform lg:text-[clamp(24px,2.5vw,38px)] lg:leading-[1.08]">{card.name}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <a data-deck href={links.products} aria-label={`Explore ${c.name}`}
          className="group relative block min-h-[260px] w-full flex-1 overflow-hidden rounded-[26px] bg-gray-100 text-white shadow-[0_40px_80px_-40px_rgba(10,26,47,0.5)] lg:h-[min(560px,calc(100svh-230px))] lg:flex-none">
          {cards.map((card, i) => (
            <div key={card.name} data-shot aria-hidden className="absolute inset-0" style={{ clipPath: i === 0 ? undefined : 'inset(100% 0 0 0)' }}>
              <Img base={card.photo} widths={[600, 1000]} sizes="(min-width: 1024px) 480px, 92vw" alt="" loading={i < 2 ? 'eager' : 'lazy'} className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105" />
            </div>
          ))}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
          <span className="absolute top-5 right-5 flex size-12 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-md transition-colors duration-300 group-hover:bg-sky sm:top-6 sm:right-6"><c.Icon /></span>
          <span key={c.name} className="anim-fade-up absolute inset-x-5 bottom-5 flex flex-col items-start gap-3 sm:inset-x-7 sm:bottom-7 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <span className="flex flex-col gap-2">
              <span className="text-[22px] leading-tight font-semibold sm:text-[28px]">{c.name}</span>
              <span className="max-w-[30ch] text-[14px] leading-snug text-white/85 sm:text-[15px]">{c.tagline}</span>
            </span>
            <Explore />
          </span>
        </a>
      </div>
    </section>
  )
}
