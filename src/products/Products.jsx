import { useMemo, useRef, useState } from 'react'
import { Img } from '../option5/components/ui.jsx'
import { categories, products, formImage, countFor, links } from './data.js'

// Products page (products-option/): the live /products page rebuilt, with the category pills replaced by photo
// cards. Hovering a card lifts it and opens it up a little (photo zooms, a short line + product count slide in);
// picking one filters the grid below.

const money = (n) => `$${n.toFixed(2)}`

function ArrowUpRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden><path d="M5.5 14.5l9-9M8 5.25h6.75V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  )
}

function Hero() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 pt-[120px] md:flex-row md:gap-12 md:pt-[160px] xl:px-8">
      <div className="flex flex-1 flex-col items-start gap-6 md:gap-14">
        <div className="flex flex-col gap-2">
          <h1 className="text-[34px] leading-tight font-medium tracking-[-0.02em] text-ink xl:text-[54px]">Products</h1>
          <p className="text-base text-ink xl:text-xl">Peak performance isn't accidental. It's engineered.</p>
        </div>
        <div className="relative flex w-fit max-w-full items-center rounded-full bg-gradient-to-b from-[#F5F5F5] to-[#E9EAEB] p-2 pl-[calc(clamp(7rem,30vw,12rem)+0.5rem)]">
          <img alt="" src="https://www.paramounthealthrx.com/images/ProductsPageBoy.png" className="pointer-events-none absolute bottom-0 left-2 h-auto w-[clamp(7rem,30vw,12rem)]" />
          <a href={links.assessment} className="group relative z-10 flex items-center gap-2.5 rounded-full bg-[#111111] py-2 pr-2 pl-4 whitespace-nowrap md:py-2.5 md:pr-2.5 md:pl-5">
            <span className="text-xs font-semibold text-white md:text-sm">Start Your Assessment</span>
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-ink transition-transform duration-300 group-hover:rotate-45 md:size-9"><ArrowUpRight /></span>
          </a>
        </div>
      </div>
      <div className="w-full flex-1 overflow-hidden rounded-[20px] md:max-w-[520px]">
        {/* the live /products page's hero video (served from paramounthealthrx.com) */}
        <video autoPlay muted loop playsInline preload="metadata" poster="/img/medical-review-900.webp" aria-label="Paramount HealthRx members training and a provider explaining care" className="aspect-[16/10] h-full w-full object-cover">
          <source src="https://www.paramounthealthrx.com/videos/Paramount_Hero_Video.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  )
}

/** One category card: photo behind, name + count in front. Hover: lift, grow, zoom the photo, slide in the blurb. */
function CategoryCard({ c, active, onPick }) {
  const n = countFor(c.id)
  return (
    <button type="button" onClick={() => onPick(c.id)} aria-pressed={active}
      className={`group relative h-[102px] w-[146px] shrink-0 snap-start overflow-hidden rounded-[14px] text-left text-white transition-[transform,box-shadow,width,height] duration-500 ease-[cubic-bezier(.22,1,.36,1)] outline-none sm:h-[114px] sm:w-[164px]
        hover:z-10 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_26px_44px_-20px_rgba(10,26,47,0.55)] focus-visible:-translate-y-2 focus-visible:scale-[1.03] md:hover:h-[156px] md:hover:w-[244px] md:focus-visible:h-[156px] md:focus-visible:w-[244px]
        ${active ? 'shadow-[0_18px_34px_-18px_rgba(16,69,132,0.7)] ring-[3px] ring-navy ring-offset-2 ring-offset-white' : 'shadow-[0_10px_24px_-18px_rgba(10,26,47,0.5)]'}`}>
      <Img base={c.photo} widths={c.widths} sizes="240px" alt="" loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110" />
      <span aria-hidden className={`absolute inset-0 transition-colors duration-500 ${active ? 'bg-gradient-to-t from-navy/90 via-navy/40 to-navy/10' : 'bg-gradient-to-t from-black/80 via-black/30 to-black/5 group-hover:from-navy/85 group-hover:via-navy/35'}`} />
      <span className="absolute top-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-full border border-white/20 bg-black/45 px-1.5 text-[12px] font-bold tabular-nums text-white backdrop-blur-md">{n}</span>
      {c.hot && <img src="/img/flame-48.png" alt="" aria-hidden className="absolute top-2 left-2 size-6" />}
      <span className="absolute inset-x-3 bottom-2.5 flex flex-col">
        <span className="text-[13px] leading-tight font-semibold sm:text-[14px]">{c.name}</span>
        <span className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-visible:grid-rows-[1fr] group-focus-visible:opacity-100">
          <span className="overflow-hidden">
            <span className="mt-1 block truncate text-[12px] leading-snug text-white/90">{c.blurb}</span>
          </span>
        </span>
      </span>
    </button>
  )
}

function Categories({ cat, setCat }) {
  const row = useRef(null)
  const nudge = (d) => row.current?.scrollBy({ left: d * 420, behavior: 'smooth' })
  return (
    <div className="relative">
      <div ref={row} data-lenis-prevent-wheel className="no-scrollbar -mx-4 flex h-[136px] snap-x snap-mandatory scroll-px-4 items-center gap-3 overflow-x-auto px-4 sm:h-[196px] sm:gap-3 xl:-mx-8 xl:scroll-px-8 xl:px-8">
        {categories.map((c) => <CategoryCard key={c.id} c={c} active={cat === c.id} onPick={setCat} />)}
      </div>
      {/* desktop: step the row sideways */}
      <div className="pointer-events-none absolute inset-y-0 -right-4 hidden w-24 bg-gradient-to-l from-white to-transparent md:block xl:-right-8" />
      <div className="absolute -top-12 right-0 hidden gap-2 md:flex">
        {[-1, 1].map((d) => (
          <button key={d} type="button" onClick={() => nudge(d)} aria-label={d < 0 ? 'Previous categories' : 'More categories'}
            className="flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-ink transition-colors hover:border-navy hover:bg-navy hover:text-white">
            <svg viewBox="0 0 16 16" className={`h-4 w-4 ${d < 0 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 3.5L10.5 8 6 12.5" /></svg>
          </button>
        ))}
      </div>
    </div>
  )
}

function ProductCard({ p, i }) {
  const [saved, setSaved] = useState(false)
  return (
    <article className="anim-fade-up flex min-w-0 flex-col rounded-[24px] bg-[#F5F5F5] p-5 sm:p-6" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-white px-3 py-1 text-[13px] text-ink">{p.category}</span>
        <span className="flex items-center gap-2">
          <span className="text-[18px] leading-none font-medium text-ink" aria-label="Prescription">R<sub className="text-[10px]">x</sub></span>
          <button type="button" onClick={() => setSaved((s) => !s)} aria-pressed={saved} aria-label={saved ? `Remove ${p.name} from consult list` : `Add ${p.name} to consult list`}
            className={`flex size-8 items-center justify-center rounded-full transition-colors ${saved ? 'bg-navy text-white' : 'bg-white text-ink hover:bg-navy/10'}`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z" /></svg>
          </button>
        </span>
      </div>
      <div className="flex h-[200px] items-center justify-center py-4 sm:h-[230px]">
        <img src={formImage[p.form]} alt={p.name} loading="lazy" className="max-h-full w-auto object-contain transition-transform duration-500 hover:scale-105" />
      </div>
      <h3 className="text-[22px] leading-tight text-ink sm:text-[24px]">{p.name}</h3>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-neutral-600">
        <span className="max-w-full rounded-[12px] bg-white px-2.5 py-0.5 break-words">{p.strength}</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-500" />{p.form}</span>
      </p>
      <div className="mt-auto flex items-end justify-between pt-5">
        <span className="text-[13px] text-neutral-600">Starting at:</span>
        <span className="text-[26px] leading-none font-medium text-ink sm:text-[28px]">{money(p.price)}</span>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <a href={links.products} className="rounded-full border border-ink/80 px-4 py-2.5 text-center text-[14px] font-medium text-ink transition-colors hover:bg-ink hover:text-white">Start Consultation</a>
        <a href={links.products} className="rounded-full bg-white px-5 py-2.5 text-center text-[14px] font-medium text-ink transition-colors hover:bg-navy hover:text-white">Learn More</a>
      </div>
    </article>
  )
}

export default function Products() {
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return products.filter((p) => (cat === 'all' || (cat === 'in-demand' ? p.hot : p.category === cat))
      && (!t || `${p.name} ${p.category} ${p.form} ${p.strength}`.toLowerCase().includes(t)))
  }, [cat, q])

  return (
    <main id="main" className="bg-white pb-16 xl:pb-24">
      <Hero />
      <section className="mx-auto mt-10 flex max-w-7xl flex-col gap-6 px-4 md:mt-16 xl:px-8" aria-label="Browse products">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <label className="flex h-[52px] w-full items-center gap-3 rounded-full border border-neutral-200 px-5 focus-within:border-navy sm:max-w-[384px]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search products" aria-label="Search products" className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-neutral-500" />
          </label>
          <p className="text-[14px] text-neutral-600" aria-live="polite">Showing {list.length} products</p>
        </div>

        <Categories cat={cat} setCat={setCat} />

        {list.length ? (
          <div key={`${cat}|${q}`} className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
          </div>
        ) : (
          <p className="rounded-[24px] bg-[#F5F5F5] px-6 py-16 text-center text-neutral-600">No products match “{q}”. Try another name or pick a different category.</p>
        )}
      </section>
    </main>
  )
}
