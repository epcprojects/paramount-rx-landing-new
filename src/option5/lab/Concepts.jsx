import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../motion.js'
import { links } from '../content.js'
import { Tag } from '../components/ui.jsx'
import { cards } from '../sections/Story.jsx'

// Three "out of the box" layouts for the treatment section (preview page only). Each one is a different way to
// lay the six treatments out, with its own scroll-driven motion. All pinned + scrubbed, so scrolling plays them.

const N = cards.length
const pad = (i) => String(i + 1).padStart(2, '0')

function Label({ id, name, note }) {
  return (
    <>
      <div className="pointer-events-none absolute top-6 left-6 z-40 rounded-full bg-[#3AB5FE] px-4 py-2 text-sm font-semibold text-white shadow-lg">Concept {id} · {name} · new layout</div>
      <p className="pointer-events-none absolute top-[70px] left-6 z-40 max-w-[360px] text-[13px] leading-snug text-neutral-500">{note}</p>
    </>
  )
}

function Explore({ light = true }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold ${light ? 'bg-white text-ink' : 'bg-navy text-white'}`}>
      Explore
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 3.5L10.5 8 6 12.5" /></svg>
    </span>
  )
}

/* ───────── H · Horizontal reel ───────── */
export function Reel() {
  const root = useRef(null)
  const track = useRef(null)
  const giant = useRef(null)
  useGSAP(() => {
    const dist = () => Math.max(0, track.current.scrollWidth - window.innerWidth)
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist() + window.innerHeight * 0.4}`, pin: true, scrub: 1, invalidateOnRefresh: true } })
    tl.to(track.current, { x: () => -dist(), ease: 'none', duration: 1 }, 0)
      .fromTo(giant.current, { xPercent: 8 }, { xPercent: -28, ease: 'none', duration: 1 }, 0)
    // each photo drifts inside its card as the reel moves (parallax), and cards lift a little as they pass centre
    gsap.utils.toArray('[data-reel-img]', root.current).forEach((img) => tl.fromTo(img, { xPercent: -12 }, { xPercent: 12, ease: 'none', duration: 1 }, 0))
    tl.fromTo(gsap.utils.toArray('[data-reel-card]', root.current), { y: (i) => (i % 2 ? 60 : -20), rotation: (i) => (i % 2 ? 2 : -2) }, { y: (i) => (i % 2 ? -20 : 40), rotation: (i) => (i % 2 ? -1.5 : 1.5), ease: 'none', duration: 1 }, 0)
  }, { scope: root })
  return (
    <section ref={root} className="relative h-svh min-h-[640px] overflow-hidden bg-gray-100">
      <Label id="H" name="Horizontal reel" note="Big tall cards on a reel that slides sideways as you scroll down; a giant title drifts the other way behind them and each photo parallaxes inside its card." />
      <div ref={giant} aria-hidden className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-[17vw] leading-none font-semibold tracking-[-0.05em] whitespace-nowrap text-navy/[0.06]">Choose Your Health Journey</div>
      <div className="relative z-10 flex h-full flex-col justify-center">
        <div className="mb-8 px-[8vw]">
          <Tag dot={false}>Treatments</Tag>
          <h2 className="t-h2 mt-3">Choose Your Health Journey</h2>
        </div>
        <ul ref={track} className="flex w-max items-center gap-6 px-[8vw] will-change-transform">
          {cards.map((c, i) => (
            <li key={c.name} data-reel-card className="w-[min(380px,72vw)] shrink-0">
              <a href={links.products} className="group relative block h-[min(58svh,520px)] overflow-hidden rounded-[30px] text-white shadow-[0_30px_60px_-30px_rgba(10,26,47,0.55)]">
                <div data-reel-img aria-hidden className="absolute inset-[-12%] bg-cover bg-center" style={{ backgroundImage: `url(${c.image})` }} />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
                <span className="absolute top-5 left-6 text-[64px] leading-none font-semibold tracking-[-0.04em] text-white/90">{pad(i)}</span>
                <span className="absolute top-6 right-6 flex size-12 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-md"><c.Icon /></span>
                <span className="absolute inset-x-6 bottom-6 flex flex-col items-start gap-2">
                  <span className="text-[26px] leading-tight font-semibold">{c.name}</span>
                  <span className="max-w-[30ch] text-[15px] leading-snug text-white/85">{c.tagline}</span>
                  <span className="mt-2"><Explore /></span>
                </span>
              </a>
            </li>
          ))}
          <li className="flex w-[min(320px,60vw)] shrink-0 flex-col items-start gap-4 pr-[8vw]">
            <p className="t-h3 text-ink">Not sure where to start?</p>
            <a href={links.products} className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">Start your assessment</a>
          </li>
        </ul>
      </div>
    </section>
  )
}

/* ───────── I · Card stack ───────── */
export function Stack() {
  const root = useRef(null)
  const [cur, setCur] = useState(0)
  useGSAP(() => {
    const els = gsap.utils.toArray('[data-stack-card]', root.current)
    const st = { p: 0 }
    const place = () => {
      els.forEach((el, i) => {
        const d = i - st.p // >0: still in the deck (d slots down), <0: thrown away
        if (d >= 0) {
          gsap.set(el, { x: 0, y: d * 22, scale: 1 - d * 0.06, rotation: 0, opacity: d > 3 ? 0 : 1, zIndex: 100 - i, filter: `brightness(${1 - Math.min(d, 3) * 0.12})` })
        } else {
          const t = Math.min(1, -d) // 0→1 as the card is thrown
          gsap.set(el, { x: t * 140, y: -t * window.innerHeight * 0.85, rotation: t * (i % 2 ? 14 : -14), scale: 1, opacity: 1 - t * 0.2, zIndex: 100 + i, filter: 'brightness(1)' })
        }
      })
      const a = Math.min(N - 1, Math.max(0, Math.round(st.p)))
      setCur((c) => (c === a ? c : a))
    }
    place()
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: `+=${(N - 1) * 55}%`, pin: true, scrub: 0.8 } })
      .to(st, { p: N - 1, ease: 'none', duration: N - 1, onUpdate: place })
      .to({}, { duration: 0.3 })
  }, { scope: root })
  return (
    <section ref={root} className="relative h-svh min-h-[640px] overflow-hidden bg-gray-100">
      <Label id="I" name="Card stack" note="All six treatments sit in one deck. Each bit of scrolling throws the top card away to reveal the next, while the list on the left tracks where you are." />
      <div className="mx-auto grid h-full max-w-[1200px] items-center gap-10 px-8 pt-24 pb-10 md:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-6">
          <Tag dot={false}>Treatments</Tag>
          <h2 className="t-h2 max-w-[11ch]">Choose Your Health Journey</h2>
          <ol className="mt-2 flex flex-col">
            {cards.map((c, i) => (
              <li key={c.name} className={`flex items-baseline gap-4 border-b border-neutral-200 py-2.5 transition-all duration-500 ${i === cur ? 'translate-x-2 text-ink' : 'text-neutral-400'}`}>
                <span className="w-7 text-[13px] font-semibold tabular-nums">{pad(i)}</span>
                <span className={`text-[20px] font-medium transition-all duration-500 ${i === cur ? 'text-[26px] font-semibold' : ''}`}>{c.name}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative h-[min(64svh,560px)]">
          {cards.map((c, i) => (
            <a key={c.name} data-stack-card href={links.products} className="absolute inset-0 block overflow-hidden rounded-[30px] text-white shadow-[0_40px_80px_-40px_rgba(10,26,47,0.6)] will-change-transform">
              <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${c.image})` }} />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute top-6 left-6 flex size-12 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-md"><c.Icon /></span>
              <span className="absolute top-7 right-7 text-sm font-semibold tabular-nums text-white/80">{pad(i)} / {pad(N - 1)}</span>
              <span className="absolute inset-x-7 bottom-7 flex items-end justify-between gap-4">
                <span className="flex flex-col gap-2">
                  <span className="text-[32px] leading-tight font-semibold">{c.name}</span>
                  <span className="max-w-[32ch] text-[16px] leading-snug text-white/85">{c.tagline}</span>
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
