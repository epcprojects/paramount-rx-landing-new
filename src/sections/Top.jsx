import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, ScrollTrigger, ease, reducedMotion } from '../motion.js'
import { menu, links } from '../content.js'
import { Cta, Tag, Img } from '../components/ui.jsx'

/** Medora header (measured): fixed dark bar, logo left, round menu button right, dropdown panel underneath. */
export function Header() {
  const [open, setOpen] = useState(false)
  const panel = useRef(null)
  const btn = useRef(null)

  useGSAP(() => {
    const el = panel.current
    const items = el.querySelectorAll('li')
    if (reducedMotion()) { gsap.set(el, { autoAlpha: open ? 1 : 0 }); return }
    if (open) {
      gsap.fromTo(el, { autoAlpha: 0, y: -12, clipPath: 'inset(0% 0% 100% 0% round 16px)' }, { autoAlpha: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 0.7, ease: ease.spring })
      gsap.fromTo(items, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: ease.spring, stagger: 0.035, delay: 0.08 })
    } else {
      gsap.to(el, { autoAlpha: 0, y: -8, duration: 0.3, ease: ease.ui })
    }
  }, { dependencies: [open] })

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus() } }
    const onClick = (e) => { if (!panel.current.contains(e.target) && !btn.current.contains(e.target)) setOpen(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onClick)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onClick) }
  }, [open])

  return (
    <>
    <DesktopHeader />
    <header className="site-header sticky top-0 z-50 -mb-[76px] pt-3 text-white sm:-mb-[90px] lg:hidden">
      <div className="px-4 sm:px-[30px]">
        <div className="hdr-pill flex h-[64px] items-center justify-between rounded-2xl px-4 sm:h-[78px] sm:px-6">
          <a href="#top" aria-label="Paramount HealthRx — home"><Logo className="h-8 sm:h-9" /></a>
          <div className="flex items-center gap-3">
            <AccountButtons />
            <button
              ref={btn}
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="menu-panel"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink transition-transform duration-300 hover:scale-105"
            >
              <span className="relative block h-3 w-3.5" aria-hidden>
                <span className={`absolute left-0 h-[1.5px] w-full bg-current transition-all duration-300 ${open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0.5'}`} />
                <span className={`absolute left-0 h-[1.5px] w-full bg-current transition-all duration-300 ${open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0.5'}`} />
              </span>
            </button>
          </div>
        </div>
      </div>
      <nav
        id="menu-panel"
        ref={panel}
        aria-label="Site"
        className="invisible absolute inset-x-4 top-full mt-2 rounded-2xl bg-navy p-6 opacity-0 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:inset-x-[30px] sm:p-8"
        inert={!open}
      >
        <ul className="grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
          {menu.map((m) => (
            <li key={m.label}>
              <a href={m.href} onClick={() => setOpen(false)} className="group flex items-center justify-between border-b border-white/15 py-3 text-[18px] tracking-[-0.02em] text-white/90 hover:text-white">
                {m.label}
                <span className="text-sky opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">→</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[14px] text-white/60">support@paramounthealthrx.com · (888) 706-3905</p>
          <Cta href={links.products}>Start Assessment</Cta>
        </div>
      </nav>
    </header>
    </>
  )
}

/** White mark over the hero, brand-colored mark once the pill goes solid (`.is-scrolled`, see index.css). */
function Logo({ className = '' }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <img src="/images/logo-white.svg" alt="Paramount HealthRx" className="logo-light relative block h-full w-auto" />
      <img src="/images/logo.svg" alt="" aria-hidden className="logo-dark absolute inset-0 block h-full w-full object-contain object-left" />
    </span>
  )
}

const desktopNav = [
  { label: 'Products', href: links.products },
  { label: 'How it Works', href: links.howItWorks },
  { label: 'About Us', href: '#why' },
  { label: 'FAQ', href: links.faqs },
]

/** Login + Consult List pills, matching the live paramounthealthrx.com header.
 *  The Consult List (cart) lives in the production app, so here it links to /products where the cart is available. */
function AccountButtons({ className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <a href={links.portal} className="flex h-9 items-center rounded-full px-3 text-sm font-medium text-[var(--login-fg)] transition-colors duration-300 hover:bg-[var(--login-hover-bg)] hover:text-[var(--login-hover-fg)] md:h-11 md:px-5 md:text-[15px]">Login</a>
      <a href={links.products} aria-label="Consult List (opens products)" className="hidden items-center gap-2 rounded-full bg-[var(--consult-bg)] py-2 pr-3 pl-5 text-sm font-medium whitespace-nowrap text-[var(--consult-fg)] transition-colors duration-300 md:flex md:h-11 md:text-[15px]">
        <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 1.9l1.68 4.06 4.4.33-3.36 2.86 1.04 4.28L8 11.1l-3.76 2.33 1.04-4.28L1.92 6.29l4.4-.33L8 1.9z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
        </svg>
        Consult List
        <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[11px] leading-none font-semibold text-white">0</span>
      </a>
    </div>
  )
}

/** Medora desktop header (measured at 1440px): logo left · 16px/500 white links centred · CTA pill right.
 *
 *  Sticky rule (Function Health pattern): the header is `position: sticky` with a negative bottom margin
 *  equal to its own height, so it reserves no flow space — the hero renders directly underneath it,
 *  overlapping the top of the viewport, and it's stuck there from the very first pixel of scroll.
 *
 *  Scroll-state rule: the pill stays frosted-dark glass (legible over the hero photo) until the pinned hero
 *  stage has been scrolled completely past — not at a fixed pixel offset, since the hero's own tile-flip
 *  ScrollTrigger pins #intro-stage for `+=240%` and that distance changes with viewport/content. Using
 *  `trigger: '#intro-stage', start: 'bottom top'` fires exactly when the hero (pin included) fully clears
 *  the viewport, toggling `.is-scrolled` on <html>. index.css reads that class to flip `.hdr-pill` to white
 *  frosted glass, and the nav links / divider / account buttons all switch via the CSS custom properties
 *  defined there — so the mobile pill (same `.hdr-pill` class) picks up the same light/dark swap for free.
 *
 *  Hide-on-scroll rule: from the very first pixel of scroll, scrolling down toggles `.nav-hidden` on <html>,
 *  which index.css reads to slide `.site-header` (both pills share that class) up off-screen; scrolling back
 *  up — or returning to the very top — removes it. Scroll direction comes from GSAP's own `self.direction` on
 *  a second, page-long ScrollTrigger, kept separate from the hero one above so hiding isn't gated on the hero
 *  having fully cleared the viewport. */
function DesktopHeader() {
  const ref = useRef(null)
  useGSAP(() => {
    if (!reducedMotion()) gsap.fromTo(ref.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1.2, ease: ease.spring, delay: 0.2, onComplete: () => gsap.set(ref.current, { clearProps: 'opacity,transform' }) })
    ScrollTrigger.create({
      trigger: '#intro-stage',
      start: 'bottom top',
      end: 'max',
      toggleClass: { targets: document.documentElement, className: 'is-scrolled' },
    })
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'max',
      onUpdate: (self) => document.documentElement.classList.toggle('nav-hidden', self.direction === 1 && self.scroll() > 10),
      onLeaveBack: () => document.documentElement.classList.remove('nav-hidden'),
    })
  })
  return (
    <header id="desktop-header" ref={ref} className="site-header sticky top-0 z-40 -mb-[102px] hidden pt-5 text-white lg:block">
      <div className="mx-auto max-w-[1280px] px-[30px] min-[1340px]:px-0">
        <div className="hdr-pill grid h-[82px] grid-cols-[1fr_auto_1fr] items-center rounded-2xl px-8">
          <a href="#top" aria-label="Paramount HealthRx — home" className="justify-self-start">
            <Logo className="h-[46px]" />
          </a>
          <nav aria-label="Primary">
            <ul className="flex items-center">
              {desktopNav.map((n, i) => (
                <li key={n.label} className="flex items-center">
                  {i > 0 && <span className="mx-5 h-4 w-px bg-[var(--nav-divider)] transition-colors duration-300" aria-hidden />}
                  <a href={n.href} className="relative text-[16px] font-normal text-[var(--nav-fg)] transition-colors duration-300 hover:text-[var(--nav-fg-hover)] focus-visible:text-[var(--nav-fg-hover)] after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:origin-left hover:after:scale-x-100">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <AccountButtons className="justify-self-end" />
        </div>
      </div>
    </header>
  )
}

const HERO_SRC = '/img/hero-1800.webp'
const HERO_FOCUS = [0.5, 0.22] // matches object-position 50% 22%

/** Builds the tile grid: one element per tile showing its exact slice of the hero photo
 *  (reproducing object-cover + focus maths). Its back is hidden, so a flipped tile reveals whatever is underneath. */
function buildTiles(layer, img) {
  layer.innerHTML = ''
  const W = layer.clientWidth
  const H = layer.clientHeight
  const cols = W < 768 ? 26 : W < 1200 ? 42 : 62
  const rows = Math.max(4, Math.round((H / W) * cols))
  // hero photo is 1800 × 1200 (both srcset sizes share this ratio) — only the ratio matters here
  const iw = 1800
  const ih = 1200
  const s = Math.max(W / iw, H / ih)
  const dw = iw * s
  const dh = ih * s
  const ox = (W - dw) * HERO_FOCUS[0]
  const oy = (H - dh) * HERO_FOCUS[1]
  const tw = W / cols
  const th = H / rows
  const frag = document.createDocumentFragment()
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = document.createElement('div')
      tile.className = 'hero-tile'
      tile.dataset.card = ''
      tile.style.cssText = `left:${c * tw}px;top:${r * th}px;width:${Math.ceil(tw) + 1}px;height:${Math.ceil(th) + 1}px;background-image:url(${HERO_SRC});background-size:${dw}px ${dh}px;background-position:${ox - c * tw}px ${oy - r * th}px`
      frag.append(tile)
    }
  }
  layer.append(frag)
  return { rows, cols }
}

/** Medora hero entrance (photo 1.2→1, copy rises 400px) + scroll transition:
 *  the hero is an overlay on top of the "Who we are" section; both are pinned while the photo breaks into
 *  small tiles that flip straight (left → right), row by row from the top, revealing the real section underneath. */
export function Hero() {
  const root = useRef(null)
  useGSAP(() => {
    const q = gsap.utils.selector(root)
    // Reduced motion: no overlay transition — the hero simply sits in normal flow above "Who we are".
    if (reducedMotion()) { gsap.set(q('[data-rise]'), { opacity: 1, y: 0 }); gsap.set(root.current, { position: 'relative' }); return }
    gsap.fromTo(q('[data-rise]'), { opacity: 0, y: 400 }, { opacity: 1, y: 0, duration: 1.8, ease: ease.spring, delay: 0.1 })

    const layer = q('[data-tiles]')[0]
    const img = q('[data-img]')[0]
    let tl
    const build = () => {
      tl?.scrollTrigger?.kill()
      tl?.kill()
      const { rows, cols } = buildTiles(layer, img)
      const cards = layer.querySelectorAll('[data-card]')
      const stage = root.current.parentElement // #intro-stage: hero overlay + "Who we are"
      tl = gsap.timeline({
        scrollTrigger: { id: 'hero-pin', trigger: stage, start: 'top top', end: '+=240%', pin: stage, scrub: 1, anticipatePin: 1, refreshPriority: 1 },
      })
      // Row-by-row from the top, with a small deterministic jitter inside each row so the wave ripples.
      const delay = (i) => {
        const r = Math.floor(i / cols)
        const c = i % cols
        const jitter = (Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1
        return (r / Math.max(1, rows - 1)) * 0.6 + Math.abs(jitter) * 0.09
      }
      gsap.set(cards, { rotationY: 0, force3D: true })
      // explicit from-values so scrolling back always restores the finished hero, even mid-entrance
      // fades the copy's outer wrapper (the entrance animates the inner [data-rise]), so the two never fight
      tl.fromTo(q('[data-copy]'), { opacity: 1, y: 0 }, { opacity: 0, y: -60, ease: 'power1.in', duration: 0.18, immediateRender: false }, 0)
        .fromTo(q('[data-shade]'), { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.25, immediateRender: false }, 0)
        // swap the single photo for its identical tiled copy the moment the transition starts
        .set(layer, { autoAlpha: 1 }, 0.001)
        .set(img, { autoAlpha: 0 }, 0.002)
        // the hero's own white backing goes away so flipped tiles show the section underneath
        .set(root.current, { backgroundColor: 'transparent' }, 0.003)
        // straight flip, left → right; the back face is hidden, so each tile uncovers what's beneath
        .to(cards, { rotationY: 180, ease: 'power2.inOut', duration: 0.3, stagger: (i) => delay(i) }, 0.05)
        .set(root.current, { pointerEvents: 'none' })
      // The treatment cards underneath unfold while the stage is still pinned, so the page doesn't move on
      // to the next section until every card is flat and fully visible.
      const head = stage.querySelector('[data-fan-head]')
      if (head) tl.fromTo(head, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.35, immediateRender: true }, 0.65)
      const fan = stage.querySelectorAll('[data-fan]')
      const origins = ['100% 50%', '50% 50%', '0% 50%']
      const angles = [78, 82, -78]
      fan.forEach((card) => {
        const col = Number(card.dataset.col)
        const row = Number(card.dataset.row)
        tl.fromTo(card, { rotationY: angles[col], transformOrigin: origins[col] },
          { rotationY: 0, ease: 'power2.out', duration: 0.55, immediateRender: true }, 0.75 + row * 0.15)
      })
      tl.to({}, { duration: 0.2 }) // short hold on the finished grid before the pin releases
      ScrollTrigger.refresh()
    }
    // Build straight away: tile maths only needs the photo's (fixed) proportions, so the pin exists
    // before the first scroll even if the image is still downloading.
    build()

    let t
    const onResize = () => { clearTimeout(t); t = setTimeout(() => { build(); ScrollTrigger.refresh() }, 200) }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t); tl?.scrollTrigger?.kill(); tl?.kill() }
  }, { scope: root })

  return (
    <section id="top" ref={root} className="absolute inset-x-0 top-0 z-20 h-svh min-h-[620px] overflow-hidden bg-white text-white">
      <div className="absolute inset-0">
        <Img data-img base="/img/hero" widths={[1000, 1800]} alt="A man in a tank top holding a high plank, looking directly at the camera" fetchPriority="high" className="h-full w-full object-cover object-[50%_22%]" />
      </div>
      <div data-tiles aria-hidden className="invisible absolute inset-0 opacity-0 [perspective:1400px]" />
      <div data-shade aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,21,42,0.75)_0%,rgba(7,21,42,0.25)_45%,rgba(7,21,42,0)_70%),linear-gradient(180deg,rgba(7,21,42,0.45)_0%,rgba(7,21,42,0)_22%)]" />
      <div data-copy className="relative flex h-full flex-col justify-end px-5 pb-12 sm:px-[30px] sm:pb-20">
        <div data-rise className="mx-auto grid w-full max-w-[1280px] items-end gap-8 md:grid-cols-[1fr_minmax(0,430px)] md:gap-16">
          <div>
            <Tag light dot={false} className="!text-[14px] tracking-[0.04em]">Modern Medicine, Real Results</Tag>
            <h1 className="t-hero mt-5">
              Personalised Care<br />
              for a <span className="t-hero-accent">Stronger You.</span>
            </h1>
          </div>
          <div className="max-w-[430px] md:pb-2">
            <p className="t-lead text-[#e0e0e0]">Evidence-based treatment, provider-guided care, and a healthier, more confident you — all from the comfort of home.</p>
            <Cta href={links.products} variant="white" size="lg" className="mt-7">Explore Treatments</Cta>
          </div>
        </div>
      </div>
    </section>
  )
}
