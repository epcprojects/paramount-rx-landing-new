import { useRef } from 'react'
import { gsap, useGSAP } from '../motion.js'
import { links } from '../content.js'
import { Tag } from '../components/ui.jsx'
import { cards } from '../sections/Story.jsx'
import { Reel, Stack } from './Concepts.jsx'
import { Coverflow, GoalFlip } from './Concepts3.jsx'
import { Strips, TypeIndex } from './Concepts2.jsx'

// Hero Section Options page (option-5/hero-section-options.html): alternative layouts + entrance animations for the "Choose Your Health Journey" treatment cards.
// Each option is pinned and scroll-scrubbed (like the real section), so scrolling plays it forward and back.

function Card({ c }) {
  return (
    <a href={links.products} aria-label={`Explore ${c.name}`} className="group relative block aspect-[259/254] overflow-hidden rounded-[22px] border-2 border-white/50 text-left text-white shadow-[0_18px_40px_-24px_rgba(10,26,47,0.55)]">
      <div data-img aria-hidden className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-out group-hover:scale-105" style={{ backgroundImage: `url(${c.image})` }} />
      <div className="relative z-10 flex h-full flex-col items-start justify-between p-3 sm:p-5">
        <span data-icon className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/50 backdrop-blur-[52px] transition-colors duration-300 group-hover:bg-sky sm:size-[54px]"><c.Icon /></span>
        <span data-copy className="block w-full">
          <span className="block text-[16px] leading-tight font-semibold tracking-[-0.01em] sm:text-[22px]">{c.name}</span>
          <span className="mt-1 flex items-end justify-between gap-2">
            <span className="line-clamp-2 text-[11px] leading-[1.3] text-white/90 sm:line-clamp-none sm:text-[15px] sm:leading-snug">{c.tagline}</span>
            <svg viewBox="0 0 16 16" className="mb-0.5 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 3.5L10.5 8 6 12.5" /></svg>
          </span>
        </span>
      </div>
    </a>
  )
}

const OPTIONS = [
  {
    id: 'B', name: 'Deal from the deck',
    note: 'All six start stacked in the middle like a deck of cards, slightly fanned, then deal out to their places one by one.',
    build: (tl, q, grid) => {
      const g = grid.getBoundingClientRect()
      const cx = g.left + g.width / 2, cy = g.top + g.height / 2
      q('[data-c]').forEach((el, i) => {
        const r = el.getBoundingClientRect()
        tl.fromTo(el,
          { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2) + 40, rotation: (i - 2.5) * 4, scale: 0.78, zIndex: 10 - i, boxShadow: '0 30px 60px -30px rgba(10,26,47,0.6)' },
          { x: 0, y: 0, rotation: 0, scale: 1, ease: 'power3.inOut', duration: 0.55 }, 0.2 + i * 0.12)
      })
      tl.fromTo(q('[data-c]'), { opacity: 0 }, { opacity: 1, duration: 0.15, stagger: 0.02 }, 0)
    },
  },
  {
    id: 'F', name: 'Orbit', fresh: true,
    note: 'NEW · The cards circle the centre like a carousel wheel, then the ring unwinds and each card glides out to its place.',
    build: (tl, q, grid) => {
      const els = q('[data-c]')
      const g = grid.getBoundingClientRect()
      const cx = g.left + g.width / 2, cy = g.top + g.height / 2
      const R = Math.min(g.width, g.height) * 0.36
      const homes = els.map((el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
      const st = { a: -0.9, m: 0 }
      const draw = () => {
        els.forEach((el, i) => {
          const t = (i / els.length) * Math.PI * 2 + st.a
          const ox = cx + Math.cos(t) * R - homes[i].x
          const oy = cy + Math.sin(t) * R * 0.62 - homes[i].y
          const m = st.m
          gsap.set(el, { x: ox * (1 - m), y: oy * (1 - m), rotation: (Math.cos(t) * 10) * (1 - m), scale: 0.62 + 0.38 * m, zIndex: Math.round(50 + Math.sin(t) * 40) })
        })
      }
      draw()
      tl.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.15, stagger: 0.02 }, 0)
        .to(st, { a: 0.9, ease: 'none', duration: 0.5, onUpdate: draw }, 0)
        .to(st, { m: 1, ease: 'power3.inOut', duration: 0.55, onUpdate: draw }, 0.5)
    },
  }
]

function Option({ o }) {
  const root = useRef(null)
  const grid = useRef(null)
  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=140%', pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true } })
    tl.fromTo(q('[data-head]'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.3 }, 0)
    o.build(tl, q, grid.current, root.current)
    tl.to({}, { duration: 0.3 }) // hold on the finished grid before the pin releases
  }, { scope: root })

  return (
    <section ref={root} className="relative flex h-svh min-h-[640px] flex-col overflow-hidden bg-gray-100 px-3 pt-[96px] pb-8 sm:px-[30px]">
      <div className={`pointer-events-none absolute top-6 left-6 z-30 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg ${o.fresh ? 'bg-sky' : 'bg-navy'}`}>Option {o.id} · {o.name}{o.fresh ? ' · new' : ''}</div>
      <p className="absolute top-[70px] left-6 z-20 max-w-[380px] text-[13px] leading-snug text-neutral-500">{o.note}</p>
      <div data-head className="mx-auto mb-8 flex max-w-[985px] flex-col items-center text-center sm:mb-12">
        <Tag dot={false}>Treatments</Tag>
        <h2 className="t-h2 mt-3 max-w-none md:whitespace-nowrap">Choose Your Health Journey</h2>
      </div>
      <ul ref={grid} className="mx-auto grid w-full max-w-[min(985px,calc((100svh-330px)*1.53+40px))] grid-cols-2 gap-3 [perspective:1200px] sm:gap-5 md:grid-cols-3">
        {cards.map((c) => <li key={c.name} data-c className="relative will-change-transform"><Card c={c} /></li>)}
      </ul>
    </section>
  )
}

export default function CardsLab() {
  return (
    <main className="bg-white">
      <header className="mx-auto flex h-svh max-w-3xl flex-col items-center justify-center px-6 text-center">
        <Tag dot={false}>Option 5 · Treatments section</Tag>
        <h1 className="t-h2 mt-4">Hero Section Options</h1>
        <p className="t-body mt-4 max-w-xl text-neutral-500">New layouts rethink the section completely (N and O are interactive: drag, click and hover them). B and F (animations on the current grid) are kept at the end for comparison. Each holds on screen and plays as you scroll (scroll back up to replay).</p>
        <p className="mt-10 animate-bounce text-sm text-neutral-400">Scroll ↓</p>
      </header>
      <Reel />
      <Stack />
      <Coverflow />
      <GoalFlip />
      <Strips />
      <TypeIndex />
      {OPTIONS.map((o) => <Option key={o.id} o={o} />)}
      <footer className="flex h-[60svh] items-center justify-center bg-white text-neutral-400">End of options. Tell me which one to use.</footer>
    </main>
  )
}
