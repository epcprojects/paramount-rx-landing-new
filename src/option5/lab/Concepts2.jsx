import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../motion.js'
import { links } from '../content.js'
import { Tag } from '../components/ui.jsx'
import { cards } from '../sections/Story.jsx'

// More "out of the box" layouts for the treatment section (preview page only): L accordion strips,
// M big type index. Each pinned + scroll-scrubbed.

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

function Explore() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-ink">
      Explore
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 3.5L10.5 8 6 12.5" /></svg>
    </span>
  )
}

/* ───────── L · Accordion strips ───────── */
// Six tall strips side by side. Closed strips show a vertical title over a navy-tinted photo; scrolling opens them
// one at a time into a wide panel with the photo, copy and button, while the previous one folds shut.
export function Strips() {
  const root = useRef(null)
  useGSAP(() => {
    const strips = gsap.utils.toArray('[data-strip]', root.current)
    const ease = gsap.parseEase('sine.inOut')
    const st = { p: 0 }
    const paint = () => {
      strips.forEach((el, i) => {
        const w = ease(Math.max(0, 1 - Math.abs(st.p - i)))
        el.style.flexGrow = (1 + 6 * w).toFixed(3)
        el.querySelector('[data-strip-v]').style.opacity = (1 - w).toFixed(3)
        el.querySelector('[data-strip-open]').style.opacity = Math.max(0, (w - 0.55) / 0.45).toFixed(3)
        el.querySelector('[data-strip-shade]').style.opacity = (0.55 * (1 - w)).toFixed(3)
      })
    }
    paint()
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: `+=${(N - 1) * 50}%`, pin: true, scrub: 1 } })
      .to(st, { p: N - 1, ease: 'none', duration: N - 1, onUpdate: paint })
      .to({}, { duration: 0.3 })
  }, { scope: root })
  return (
    <section ref={root} className="relative h-svh min-h-[640px] overflow-hidden bg-gray-100">
      <Label id="L" name="Accordion strips" note="Six tall strips side by side, each with a vertical title. Scrolling opens them one at a time into a wide panel with photo and copy, folding the last one shut." />
      <div className="mx-auto flex h-full max-w-[1280px] flex-col px-8 pt-28 pb-10">
        <div className="mb-6"><Tag dot={false}>Treatments</Tag><h2 className="t-h2 mt-3">Choose Your Health Journey</h2></div>
        <ul className="flex min-h-0 flex-1 gap-3">
          {cards.map((c, i) => (
            <li key={c.name} data-strip className="relative min-w-0 basis-0 overflow-hidden rounded-[26px] text-white" style={{ flexGrow: i === 0 ? 7 : 1 }}>
              <a href={links.products} className="absolute inset-0 block">
                <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${c.image})` }} />
                <div data-strip-shade aria-hidden className="absolute inset-0 bg-navy" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {/* closed: number, vertical name, icon */}
                <div data-strip-v className="absolute inset-0 flex flex-col items-center justify-between py-6">
                  <span className="text-[13px] font-semibold tabular-nums text-white/80">{pad(i)}</span>
                  <span className="rotate-180 text-[20px] font-semibold whitespace-nowrap [writing-mode:vertical-rl]">{c.name}</span>
                  <span className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/40 [&_svg]:scale-75"><c.Icon /></span>
                </div>
                {/* open: full card copy */}
                <div data-strip-open className="absolute inset-x-8 bottom-8 flex min-w-[320px] items-end justify-between gap-6">
                  <span className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold tabular-nums text-white/70">{pad(i)} / {pad(N - 1)}</span>
                    <span className="text-[34px] leading-tight font-semibold">{c.name}</span>
                    <span className="max-w-[34ch] text-[16px] leading-snug text-white/85">{c.tagline}</span>
                  </span>
                  <Explore />
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ───────── M · Big type index ───────── */
// An editorial index: the six treatment names set huge, one per line. Scrolling fills each name with navy like a
// progress bar and wipes its photo up into a card that sits beside the list.
export function TypeIndex() {
  const root = useRef(null)
  const [cur, setCur] = useState(0)
  useGSAP(() => {
    const lines = gsap.utils.toArray('[data-line]', root.current)
    const shots = gsap.utils.toArray('[data-shot]', root.current)
    const st = { p: 0 }
    const paint = () => {
      lines.forEach((el, i) => {
        const f = Math.min(1, Math.max(0, st.p - i)) * 100
        el.style.backgroundImage = `linear-gradient(90deg, #104584 ${f}%, #cfd6df ${f}%)`
        el.style.transform = `translateX(${(Math.max(0, 1 - Math.abs(st.p - i - 0.5) * 1.3) * 24).toFixed(1)}px)`
      })
      shots.forEach((el, i) => {
        const w = Math.max(0, Math.min(1, st.p - i)) // the photo wipes up as its name fills
        el.style.clipPath = `inset(${((1 - w) * 100).toFixed(1)}% 0% 0% 0%)`
      })
      const a = Math.min(N - 1, Math.max(0, Math.floor(st.p)))
      setCur((c) => (c === a ? c : a))
    }
    paint()
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: `+=${N * 45}%`, pin: true, scrub: 0.8 } })
      .to(st, { p: N, ease: 'none', duration: N, onUpdate: paint })
      .to({}, { duration: 0.3 })
  }, { scope: root })
  const c = cards[cur]
  return (
    <section ref={root} className="relative h-svh min-h-[640px] overflow-hidden bg-white">
      <Label id="M" name="Big type index" note="An editorial index: the six names set huge. Scrolling fills each name with navy like a progress bar and wipes its photo up into the card beside the list." />
      <div className="mx-auto grid h-full max-w-[1280px] items-center gap-10 px-8 pt-24 pb-10 md:grid-cols-[1.35fr_1fr]">
        <div>
          <Tag dot={false}>Treatments · Choose Your Health Journey</Tag>
          <ol className="mt-6 flex flex-col">
            {cards.map((card, i) => (
              <li key={card.name} className="flex items-baseline gap-5 border-b border-neutral-200 py-1.5">
                <span className="w-8 text-[13px] font-semibold tabular-nums text-neutral-400">{pad(i)}</span>
                <span data-line className="bg-clip-text text-[clamp(30px,4.6vw,64px)] leading-[1.08] font-semibold tracking-[-0.03em] text-transparent will-change-transform">{card.name}</span>
              </li>
            ))}
          </ol>
        </div>
        <a href={links.products} className="relative block aspect-[1/1.12] w-full overflow-hidden rounded-[26px] bg-gray-100 text-white">
          {cards.map((card) => <div key={card.name} data-shot aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${card.image})` }} />)}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
          <span key={c.name} className="anim-fade-up absolute inset-x-7 bottom-7 flex items-end justify-between gap-4">
            <span className="flex flex-col gap-2">
              <span className="text-[28px] leading-tight font-semibold">{c.name}</span>
              <span className="max-w-[30ch] text-[15px] leading-snug text-white/85">{c.tagline}</span>
            </span>
            <Explore />
          </span>
        </a>
      </div>
    </section>
  )
}
