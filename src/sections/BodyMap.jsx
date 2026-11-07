import { forwardRef, lazy, Suspense, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from 'react'
import { gsap, useGSAP, reducedMotion as prefersReduced } from '../motion.js'
import { categories, category as getCategory, inCategory, treatments } from '../data/treatments.js'
import { links } from '../content.js'

// "Every treatment, mapped to the body" — rebuilt from the Paramount products prototype (paramountmodel.vercel.app):
// category tabs + description on the left, a rotatable 3D body with category pins in the middle,
// and the full treatment list (grouped by category, synced to the tabs as you scroll) on the right.

const BodyScene = lazy(() => import('../components/BodyScene.jsx'))
const groups = categories.filter((c) => c.id !== 'all')
const usd = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

function useMedia(q) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = (e) => setM(e.matches)
    setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

/** True once the ref'd element is within `margin` of the viewport — used to defer the 3D body scene
 *  (three.js + a GLTF model, ~1-2MB) so it isn't fetched on page load fighting the hero for bandwidth,
 *  only once the visitor has actually scrolled close to this section. */
function useNearViewport(margin = '600px') {
  const ref = useRef(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    if (near || !ref.current) return
    let io
    let cancelled = false
    // Wait for web fonts to finish swapping in before taking the first measurement: on a cold cache,
    // the heading/body copy above this section still renders in the fallback font at mount time, which
    // is shorter than the final Inter/Playfair layout — an observer snapshot taken during that window
    // can wrongly report "already in view" and (since it only needs to fire once) never recheck.
    const start = () => {
      if (cancelled || !ref.current) return
      io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) setNear(true) }, { rootMargin: margin })
      io.observe(ref.current)
    }
    if (document.fonts?.ready) document.fonts.ready.then(start)
    else start()
    return () => { cancelled = true; io?.disconnect() }
  }, [near, margin])
  return [ref, near]
}

/* ---------- category tabs ---------- */

function Tabs({ active, onChange, size = 'md', className = '' }) {
  const ref = useRef(null)
  const sm = size === 'sm'
  // keep the active tab in view when the row scrolls sideways (phones)
  useEffect(() => {
    const el = ref.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    const t = el.querySelector('[aria-selected="true"]')
    if (!t) return
    const left = el.scrollLeft + (t.getBoundingClientRect().left - el.getBoundingClientRect().left) - (el.clientWidth - t.offsetWidth) / 2
    el.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [active])
  return (
    <div ref={ref} role="tablist" aria-label="Treatment categories" className={`flex gap-2 ${className.includes('flex-nowrap') ? '' : 'flex-wrap'} ${className}`}>
      {categories.map((c) => {
        const on = c.id === active
        const big = c.id === 'in-demand'
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(c.id)}
            className={`flex shrink-0 cursor-pointer items-center rounded-full border transition-colors ${sm ? 'gap-1.5 px-3.5 py-1.5 md:px-4 md:py-2' : 'gap-2 px-[22px] py-3'} ${on ? 'border-navy bg-navy' : 'border-neutral-200 bg-white hover:border-navy'}`}
          >
            {c.icon && <img src={c.icon} alt="" aria-hidden width={big ? 28 : 24} height={big ? 28 : 24} className={`${big ? (sm ? 'size-5' : 'size-7') : sm ? 'size-4' : 'size-6'} shrink-0 object-contain`} />}
            <span className={`whitespace-nowrap ${sm ? 'text-[13px] md:text-sm' : 'text-base'} ${on ? 'font-semibold text-white' : 'font-medium text-neutral-700'}`}>{c.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------- product art (simple packaging by form) ---------- */

function ProductArt({ form, className }) {
  const id = useId().replace(/:/g, '')
  const g = `g-${id}`, cap = `c-${id}`, w = `w-${id}`
  let body
  switch (form) {
    case 'Vial':
    case 'Injectable':
      body = (<>
        <rect x="33" y="44" width="34" height="68" rx="7" fill={`url(#${g})`} stroke="#c3ccd6" />
        <rect x="37" y="62" width="26" height="44" rx="4" fill="#f7f9fb" opacity="0.7" />
        <rect x="38" y="36" width="24" height="10" rx="2" fill="#aeb8c2" />
        <rect x="34" y="18" width="32" height="20" rx="5" fill={`url(#${cap})`} />
        <ellipse cx="50" cy="19" rx="15" ry="3" fill="#9cc9f5" />
      </>)
      break
    case 'Nasal Spray':
      body = (<>
        <rect x="32" y="52" width="36" height="60" rx="9" fill={`url(#${w})`} stroke="#d0d6dc" />
        <rect x="40" y="44" width="20" height="10" rx="2" fill="#e3e7eb" />
        <rect x="28" y="40" width="44" height="5" rx="2.5" fill={`url(#${cap})`} />
        <path d="M44 40 L46 12 Q50 6 54 12 L56 40 Z" fill={`url(#${w})`} stroke="#d0d6dc" />
        <text x="50" y="88" textAnchor="middle" fontSize="14" fontStyle="italic" fill="#b9c1c9" fontFamily="serif">P</text>
      </>)
      break
    case 'Troche':
    case 'Capsule':
    case 'Tablet':
      body = (<>
        <rect x="28" y="44" width="44" height="68" rx="8" fill={`url(#${w})`} stroke="#d0d6dc" />
        <rect x="31" y="30" width="38" height="16" rx="4" fill={form === 'Troche' ? '#d9dee3' : `url(#${cap})`} />
        <rect x="34" y="62" width="32" height="30" rx="3" fill="#f3f6f9" stroke="#e2e7ec" />
        <text x="50" y="82" textAnchor="middle" fontSize="13" fontStyle="italic" fill="#9aa6b2" fontFamily="serif">P</text>
      </>)
      break
    case 'Cream':
    case 'Topical':
      body = (<>
        <path d="M36 28 H64 L70 104 Q50 110 30 104 Z" fill={`url(#${w})`} stroke="#d0d6dc" />
        <rect x="40" y="104" width="20" height="10" rx="2" fill={`url(#${cap})`} />
        <rect x="34" y="24" width="32" height="6" rx="2" fill="#e1e5ea" />
        <text x="50" y="72" textAnchor="middle" fontSize="13" fontStyle="italic" fill="#9aa6b2" fontFamily="serif">P</text>
      </>)
      break
    default: // Insert
      body = (<>
        <rect x="24" y="40" width="52" height="72" rx="4" fill={`url(#${w})`} stroke="#d0d6dc" />
        <rect x="24" y="40" width="52" height="14" rx="4" fill={`url(#${cap})`} />
        <text x="50" y="88" textAnchor="middle" fontSize="13" fontStyle="italic" fill="#9aa6b2" fontFamily="serif">P</text>
      </>)
  }
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden>
      <defs>
        <linearGradient id={g} x1="0" x2="1"><stop offset="0" stopColor="#dfe6ee" /><stop offset="0.25" stopColor="#ffffff" /><stop offset="0.6" stopColor="#eef2f6" /><stop offset="1" stopColor="#c9d3de" /></linearGradient>
        <linearGradient id={cap} x1="0" x2="1"><stop offset="0" stopColor="#3f86d6" /><stop offset="0.35" stopColor="#7cb6f0" /><stop offset="1" stopColor="#2f6fb8" /></linearGradient>
        <linearGradient id={w} x1="0" x2="1"><stop offset="0" stopColor="#e9ecef" /><stop offset="0.35" stopColor="#ffffff" /><stop offset="1" stopColor="#d5dade" /></linearGradient>
      </defs>
      <ellipse cx="50" cy="114" rx="24" ry="3.5" fill="#000" opacity="0.08" />
      {body}
    </svg>
  )
}

/* ---------- grouped list (scroll-synced with the tabs) ---------- */

const ProductList = forwardRef(function ProductList({ focus, onScrollFocus, reduced, inline, topOffset }, ref) {
  const box = useRef(null)
  const programmatic = useRef(false) // a tab click is scrolling the list
  const userScrolled = useRef(false)
  const raf = useRef(0)
  const anim = useRef(0)
  const focusRef = useRef(focus)
  focusRef.current = focus
  const [current, setCurrent] = useState(groups[0].id)
  const [picked, setPicked] = useState(null)

  const line = useCallback(() => {
    const el = box.current
    if (!el) return 0
    if (inline) { const t = topOffset?.() ?? 0; return t + (window.innerHeight - t) * 0.25 }
    return el.getBoundingClientRect().top + el.clientHeight * 0.4
  }, [inline, topOffset])
  const getY = useCallback(() => (inline ? window.scrollY : box.current?.scrollTop ?? 0), [inline])
  const setY = useCallback((y) => { if (inline) window.scrollTo(0, y); else if (box.current) box.current.scrollTop = y }, [inline])
  const maxY = useCallback(() => (inline ? document.documentElement.scrollHeight - window.innerHeight : box.current ? box.current.scrollHeight - box.current.clientHeight : 0), [inline])

  const groupAtLine = useCallback(() => {
    const el = box.current
    if (!el) return groups[0].id
    let id = groups[0].id
    const y = line()
    el.querySelectorAll('[data-group]').forEach((s) => { if (s.getBoundingClientRect().top <= y) id = s.dataset.group })
    return id
  }, [line])

  const smoothTo = useCallback((y) => {
    cancelAnimationFrame(anim.current)
    const from = getY()
    const to = Math.max(0, Math.min(y, maxY()))
    if (reduced || Math.abs(to - from) < 2) { setY(to); programmatic.current = false; return }
    const dur = Math.min(1100, 520 + Math.abs(to - from) * 0.35)
    const t0 = performance.now()
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur)
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
      setY(from + (to - from) * e)
      if (p < 1) anim.current = requestAnimationFrame(step)
      else programmatic.current = false
    }
    anim.current = requestAnimationFrame(step)
  }, [reduced, getY, setY, maxY])

  const syncFocus = useCallback(() => {
    const el = box.current
    if (!el) return
    const first = el.querySelector('[data-group]')
    const atTop = inline ? !!first && first.getBoundingClientRect().top > line() : el.scrollTop < 6
    if (atTop) { if (focusRef.current !== 'all') onScrollFocus('all'); return }
    const g = groupAtLine()
    if (g !== focusRef.current) onScrollFocus(g)
  }, [inline, line, groupAtLine, onScrollFocus])

  const onScroll = useCallback(() => {
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      setCurrent(groupAtLine())
      if (!programmatic.current && userScrolled.current) syncFocus()
    })
  }, [groupAtLine, syncFocus])
  const onUserInput = useCallback(() => { cancelAnimationFrame(anim.current); userScrolled.current = true; programmatic.current = false }, [])

  useEffect(() => {
    if (!inline) return
    const evs = ['wheel', 'touchstart', 'keydown']
    window.addEventListener('scroll', onScroll, { passive: true })
    evs.forEach((e) => window.addEventListener(e, onUserInput, { passive: true }))
    return () => { window.removeEventListener('scroll', onScroll); evs.forEach((e) => window.removeEventListener(e, onUserInput)) }
  }, [inline, onScroll, onUserInput])
  useEffect(() => { setCurrent(groupAtLine()); return () => { cancelAnimationFrame(raf.current); cancelAnimationFrame(anim.current) } }, [groupAtLine])

  useImperativeHandle(ref, () => ({
    scrollToCategory(id) {
      const el = box.current
      if (!el) return
      let y
      if (inline) {
        const node = id === 'all' ? el : el.querySelector(`[data-group="${id}"] h3`)
        y = (node?.getBoundingClientRect().top ?? 0) + window.scrollY - (topOffset?.() ?? 0) - (id === 'all' ? 0 : 36)
      } else {
        y = id === 'all' ? 0 : (el.querySelector(`[data-group="${id}"]`)?.offsetTop ?? 0) - el.clientHeight * 0.12
      }
      programmatic.current = true
      userScrolled.current = false
      smoothTo(y)
    },
  }), [smoothTo, inline, topOffset])

  return (
    <div
      ref={box}
      onScroll={inline ? undefined : onScroll}
      onWheel={inline ? undefined : onUserInput}
      onTouchStart={inline ? undefined : onUserInput}
      onKeyDown={inline ? undefined : onUserInput}
      onPointerDown={inline ? undefined : onUserInput}
      tabIndex={inline ? undefined : 0}
      aria-label="Treatments by category"
      className={inline ? 'relative' : 'no-scrollbar relative h-full overflow-y-auto overscroll-contain outline-none [mask-image:linear-gradient(to_bottom,transparent,black_9%,black_86%,transparent)]'}
    >
      <div className={inline ? 'pt-10 pb-10 md:pt-12' : 'pt-[18vh] pb-[45vh]'}>
        {groups.map((gr) => {
          const items = inCategory(gr.id)
          const on = gr.id === current
          return (
            <section key={gr.id} data-group={gr.id} className="pb-4 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-gray-100 [&:not(:first-child)]:pt-4">
              <h3 className={`mb-2.5 text-[18px] tracking-tight transition-colors duration-500 ${on ? 'text-[#242424]' : 'text-neutral-400'}`}>
                {gr.label} <span className="text-neutral-400">({items.length})</span>
              </h3>
              <ul className="flex flex-col gap-2">
                {items.length === 0 && (
                  <li className="flex flex-col gap-2.5 rounded-xl bg-[#eef5fd] p-3 ring-1 ring-[#d9e7f7] md:p-3.5">
                    <div>
                      <p className="text-[13px] font-semibold text-[#242424]">Not available in your state yet</p>
                      <p className="mt-0.5 text-xs leading-snug text-neutral-500">A provider can still discuss {gr.label.toLowerCase()} options with you.</p>
                    </div>
                    <a href={links.products} className="inline-flex items-center justify-center gap-1.5 self-end rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0c3a6f]">
                      Start a consultation
                      <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </a>
                  </li>
                )}
                {items.map((t) => {
                  const key = `${gr.id}-${t.id}`
                  const sel = picked === key
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        aria-pressed={sel}
                        onClick={() => setPicked(sel ? null : key)}
                        className={`group flex h-[52px] w-full cursor-pointer items-center gap-2.5 rounded-xl border bg-white p-1 pr-2.5 text-left transition-colors duration-300 hover:border-navy md:h-[60px] ${sel ? 'border-navy' : 'border-neutral-300'}`}
                      >
                        <span className={`grid aspect-square h-full shrink-0 place-items-center rounded-lg transition-colors duration-300 group-hover:bg-[#eef5fd] ${sel ? 'bg-[#eef5fd]' : 'bg-neutral-100'}`}>
                          <ProductArt form={t.form} className="h-[30px] transition-transform duration-500 group-hover:scale-105 md:h-[36px]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-[#242424]">{t.name}</span>
                          <span className="block truncate text-xs text-neutral-500">{t.form} · from {usd(t.price)}</span>
                          {sel && <span className="block truncate text-[11px] text-neutral-400">{t.strength}</span>}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
})

/* ---------- the section ---------- */

export function BodyMap() {
  const [cat, setCat] = useState('all')
  const desktop = useMedia('(min-width: 1024px)')
  const [reduced] = useState(() => prefersReduced())
  const root = useRef(null)
  const stickyBar = useRef(null)
  const list = useRef(null)
  const scroll = useRef({ dolly: 0, lift: 0 })
  const info = getCategory(cat)
  const [sceneAnchor, sceneNear] = useNearViewport()

  const topOffset = useCallback(() => {
    const el = stickyBar.current
    return el ? (parseFloat(getComputedStyle(el).top) || 0) + el.offsetHeight : 0
  }, [])
  const choose = useCallback((id) => { setCat(id); list.current?.scrollToCategory(id) }, [])

  // desktop: as the section scrolls away the camera eases back a little and the side columns fade
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add({ reduce: '(prefers-reduced-motion: reduce)', desktop: '(min-width: 1024px)' }, (ctx) => {
      if (ctx.conditions.reduce || !ctx.conditions.desktop) return
      const s = scroll.current
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 1 } })
      tl.to(s, { dolly: 0.16, lift: 0.05, ease: 'sine.in' }).to(root.current.querySelectorAll('.hero-side'), { opacity: 0.25, y: -24, ease: 'none' }, 0)
      return () => { s.dolly = 0; s.lift = 0 }
    })
    return () => mm.revert()
  }, { scope: root })

  return (
    // Same system font and proportions as the prototype (its 108px header space is kept as top/bottom padding here).
    <section ref={root} id="treatments" aria-label="Treatments mapped to the body" className="font-system relative z-10 bg-white lg:py-[54px]">
      <div className="mx-auto flex max-w-[96rem] flex-col px-5 pt-6 md:px-10 md:pt-8 lg:grid lg:h-[calc(100svh-108px)] lg:min-h-[40rem] lg:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)_minmax(22rem,27rem)] lg:gap-8 lg:pt-0">
        <div className="hero-side relative z-[3] flex flex-col gap-5 pb-4 md:gap-6 lg:justify-center lg:gap-10 lg:pb-8">
          <div className="flex flex-col gap-3">
            <p className="t-tag text-ink">Products</p>
            <h2 className="text-[28px] leading-[1.1] font-normal tracking-tight text-[#242424] sm:text-[34px] md:text-[40px]">
              <span className="block whitespace-nowrap md:inline lg:block">Every treatment,</span>{' '}
              <span className="block whitespace-nowrap md:inline lg:block">mapped to the body.</span>
            </h2>
            <p className="max-w-[21rem] text-sm leading-relaxed text-neutral-500 md:max-w-none md:text-[15px] lg:max-w-[21rem]">{treatments.length} treatments, prescribed by licensed providers and organised by focus area.</p>
          </div>
          <div key={cat} className="anim-fade-up hidden max-w-[24rem] border-l-4 border-navy bg-[#eef5fd] px-4 py-3 md:block md:max-w-none md:px-5 md:py-4 lg:min-h-[5.5rem] lg:max-w-[24rem]" aria-live="polite">
            <p className="text-sm font-semibold text-navy">{info.label}</p>
            <p className="mt-1 max-w-[20rem] text-sm leading-relaxed text-neutral-500 md:max-w-none lg:max-w-[20rem]">{info.blurb}</p>
          </div>
          <Tabs active={cat} onChange={choose} className="hidden max-w-[26rem] lg:flex" />
        </div>

        {/* top offset = floating mobile header's own rendered bottom edge (12px top padding + its pill
            height, 64px below 640px / 78px from 640px up), minus this box's own pt-3, plus a 10px gap —
            so the tab pills sit 10px clear of the header instead of flush under it. */}
        <div ref={stickyBar} className="sticky top-[74px] z-[4] -mx-5 bg-white px-5 pt-3 sm:top-[88px] md:-mx-10 md:px-10 lg:static lg:top-auto lg:mx-0 lg:flex lg:min-h-0 lg:flex-col lg:bg-transparent lg:p-0">
          <Tabs active={cat} onChange={choose} size="sm" className="no-scrollbar -mx-5 flex-nowrap overflow-x-auto px-5 pb-1 md:-mx-10 md:px-10 lg:hidden" />
          <div ref={sceneAnchor} className="relative -mx-5 h-[clamp(220px,34svh,300px)] md:mx-0 md:h-[clamp(280px,38svh,400px)] lg:h-auto lg:min-h-0 lg:flex-1">
            <div className="pointer-events-none absolute inset-x-[12%] bottom-[4%] h-[40%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(16,69,132,0.09),rgba(47,143,224,0.06)_45%,transparent)]" />
            {sceneNear && (
              <Suspense fallback={null}>
                <BodyScene category={cat} onSelect={choose} scroll={scroll} reducedMotion={reduced} />
              </Suspense>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-white/0 to-white lg:hidden" />
            <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center md:bottom-4 lg:bottom-16">
              <svg width="320" height="63" viewBox="0 0 235 46" fill="none" className="h-auto w-[200px] max-w-[80%] md:w-[260px] lg:w-[320px]" role="img" aria-label="Drag to rotate">
                <defs>
                  <linearGradient id="rotate-arc-stroke" x1="0.450378" y1="20.775" x2="234.45" y2="20.775" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white" stopOpacity="0" /><stop offset="0.5" stopColor="#C0C0C0" /><stop offset="1" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id="rotate-arc-dot" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(116.95 40.775) rotate(90) scale(5)">
                    <stop stopColor="white" /><stop offset="1" stopColor="#E0E0E0" />
                  </radialGradient>
                </defs>
                <path d="M0.450378 3.80978C0.450378 3.80978 16.7266 37.8146 111.075 41.1002C205.424 44.3857 234.45 0.275024 234.45 0.275024" stroke="url(#rotate-arc-stroke)" />
                <path d="M121.95 40.775C121.95 43.5364 119.712 45.775 116.95 45.775C114.189 45.775 111.95 43.5364 111.95 40.775C111.95 38.0136 114.189 35.775 116.95 35.775C119.712 35.775 121.95 38.0136 121.95 40.775Z" fill="url(#rotate-arc-dot)" />
              </svg>
            </div>
            {/* phones/tablets: soft blurred fade under the sticky body so list items slide out of view smoothly */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-full h-14 bg-gradient-to-b from-white via-white/70 to-white/0 backdrop-blur-[6px] [mask-image:linear-gradient(to_bottom,black_30%,transparent)] lg:hidden" />
          </div>
        </div>

        <aside className="hero-side relative z-[3] mx-auto min-h-0 w-full max-w-[42rem] lg:mx-0 lg:max-w-none">
          <ProductList ref={list} focus={cat} onScrollFocus={setCat} reduced={reduced} inline={!desktop} topOffset={topOffset} />
        </aside>
      </div>
    </section>
  )
}
