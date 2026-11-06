import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, ease, reducedMotion, appear } from '../motion.js'
import { products, steps, faqs, links } from '../content.js'
import { Cta, Tag, Img, Arrow } from '../components/ui.jsx'

/** Medora "Blog" layout → Paramount product families. */
export function Products() {
  const root = useRef(null)
  useGSAP(() => appear(root.current), { scope: root })
  return (
    <section ref={root} className="relative z-10 bg-white px-5 py-10 sm:px-[30px]">
      <div className="mx-auto max-w-[1153px] pt-16">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Tag data-appear>Products</Tag>
            <h2 data-appear="0.05" className="t-h2 mt-4 max-w-[480px]">Pharmaceutical-grade care for every goal.</h2>
          </div>
          <p data-appear="0.1" className="t-body max-w-[300px]">Peptides, hormones and vitamins — prescribed by licensed providers, fulfilled by U.S. pharmacies.</p>
        </div>
        <ul className="mt-12 grid gap-x-6 gap-y-10 md:grid-cols-2">
          {products.map((p, i) => (
            <li key={p.name} data-appear={i * 0.08}>
              <a href={links.products} className="group block">
                <div className="relative grid aspect-[577/300] place-items-center overflow-hidden rounded-xl bg-[radial-gradient(90%_120%_at_50%_100%,#d9ecfb_0%,#f1f3f6_60%)]">
                  <img src={p.image} alt="" loading="lazy" className="h-[62%] w-auto transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110" />
                </div>
                <div className="mt-4 flex items-center justify-between border-b border-line pb-4 text-[14px]">
                  <span>{p.name}</span><span className="text-body">{p.meta}</span>
                </div>
                <p className="mt-4 text-[20px] font-medium tracking-[-0.01em] transition-colors group-hover:text-navy">{p.body}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Medora "Testimonials" layout → the six real steps (photo card + text card pairs, autoplaying carousel with dots). */
export function Steps() {
  const root = useRef(null)
  const track = useRef(null)
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useGSAP(() => appear(root.current), { scope: root })
  useGSAP(() => {
    gsap.to(track.current, { xPercent: -100 * i, duration: reducedMotion() ? 0 : 0.9, ease: ease.spring })
  }, { dependencies: [i] })
  useEffect(() => {
    if (paused || reducedMotion()) return
    const t = setTimeout(() => setI((n) => (n + 1) % steps.length), 5000)
    return () => clearTimeout(t)
  }, [i, paused])

  return (
    <section ref={root} id="how" className="relative z-10 scroll-mt-20 bg-white px-5 py-10 sm:px-[30px]">
      <div className="mx-auto max-w-[1153px] pt-16">
        <div className="grid items-end gap-8 md:grid-cols-[243px_1fr] md:gap-16">
          <div data-appear className="aspect-square w-40 overflow-hidden rounded-xl md:w-full">
            <Img base="/img/step-delivery" widths={[900]} sizes="243px" alt="" loading="lazy" className="h-full w-full scale-[1.6] object-cover object-[58%_40%]" />
          </div>
          <div>
            <Tag data-appear>How it works</Tag>
            <h2 data-appear="0.05" className="t-h2 mt-4 max-w-[520px]">Personalized care in six simple steps.</h2>
            <Cta data-appear="0.1" href={links.products} className="mt-6">Start Your Assessment</Cta>
          </div>
        </div>

        <div
          data-appear
          className="relative mt-12 overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          role="region"
          aria-roledescription="carousel"
          aria-label="How it works steps"
        >
          <ul ref={track} className="flex">
            {steps.map((s, n) => (
              <li key={n} className="grid w-full shrink-0 gap-4 md:grid-cols-2 md:gap-6" aria-hidden={n !== i} aria-roledescription="slide" aria-label={`Step ${n + 1} of ${steps.length}`}>
                <div className="relative aspect-[565/426] overflow-hidden rounded-xl">
                  <Img base={s.image} widths={[900, 1400]} sizes="(min-width:768px) 50vw, 100vw" alt="" loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-20 text-white">
                    <p className="text-[16px] font-medium">Step {String(n + 1).padStart(2, '0')}</p>
                    <p className="text-[14px] text-[#d9d9d9]">{s.kicker}</p>
                  </div>
                </div>
                <div className="flex flex-col justify-between rounded-xl bg-card p-6 md:min-h-[426px]">
                  <div>
                    <p className="text-[14px] tracking-[0.3em] text-navy" aria-hidden>{'●'.repeat(n + 1)}{'○'.repeat(steps.length - n - 1)}</p>
                    <h3 className="mt-6 max-w-[420px] text-[24px] leading-[1.25] tracking-[-0.02em]">{s.body}</h3>
                  </div>
                  <p className="mt-8 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy text-[14px] font-medium text-white">{n + 1}</span>
                    <span><span className="block text-[16px] font-medium">{s.title}</span><span className="block text-[14px] text-body">Paramount HealthRx</span></span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-center gap-2">
            {steps.map((_, n) => (
              <button key={n} onClick={() => setI(n)} aria-label={`Go to step ${n + 1}`} aria-current={n === i} className={`h-2 rounded-full transition-all duration-500 ${n === i ? 'w-7 bg-ink' : 'w-2 bg-ink/20 hover:bg-ink/40'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Medora FAQ: heading + small image left, large single-open accordion right. */
export function Faq() {
  const root = useRef(null)
  const [open, setOpen] = useState(0)
  useGSAP(() => appear(root.current), { scope: root })
  return (
    <section ref={root} id="faq" className="relative z-10 scroll-mt-20 bg-white px-5 pt-10 pb-20 sm:px-[30px]">
      <div className="mx-auto grid max-w-[1153px] gap-10 pt-16 md:grid-cols-[1fr_814fr] md:gap-[87px]">
        <div>
          <Tag data-appear>FAQ</Tag>
          <h2 data-appear="0.05" className="t-h2 mt-4">Frequently asked questions.</h2>
          <div data-appear="0.1" className="mt-8 hidden aspect-[252/220] overflow-hidden rounded-xl md:block">
            <Img base="/img/peptide-portrait" widths={[500]} sizes="252px" alt="" loading="lazy" className="h-full w-full origin-top scale-[1.5] object-cover object-top" />
          </div>
        </div>
        <ul>
          {faqs.map((f, n) => {
            const isOpen = open === n
            return (
              <li key={f.q} data-appear={n * 0.05} className="border-b border-line pb-6 pt-6 first:pt-0">
                <h3>
                  <button onClick={() => setOpen(isOpen ? -1 : n)} aria-expanded={isOpen} aria-controls={`faq-${n}`} className="flex w-full items-center justify-between gap-6 text-left">
                    <span className={`text-[clamp(1.4rem,2.6vw,2rem)] leading-tight tracking-[-0.02em] transition-colors duration-300 ${isOpen ? 'text-ink' : 'text-ink/45 hover:text-ink/70'}`}>{f.q}</span>
                    <span aria-hidden className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${isOpen ? 'border-ink' : 'border-ink/30'}`}>
                      <span className="absolute h-px w-3 bg-current" />
                      <span className={`absolute h-3 w-px bg-current transition-transform duration-300 ${isOpen ? 'scale-y-0' : ''}`} />
                    </span>
                  </button>
                </h3>
                <div id={`faq-${n}`} className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden"><p className="t-body max-w-[420px] pt-4">{f.a}</p></div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/** Medora closing band: full-bleed photo, centred statement + CTA. */
export function CtaBand() {
  const root = useRef(null)
  useGSAP(() => {
    appear(root.current)
    if (reducedMotion()) return
    gsap.fromTo(root.current.querySelector('[data-bg]'), { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
  }, { scope: root })
  return (
    <section ref={root} className="relative z-10 overflow-hidden px-5 py-[150px] text-center text-white sm:px-[30px]">
      <div data-bg className="absolute -inset-y-[12%] inset-x-0">
        <Img base="/img/couple" widths={[1000, 1800]} alt="" loading="lazy" className="h-full w-full object-cover object-[70%_30%]" />
      </div>
      <div aria-hidden className="absolute inset-0 bg-night/55" />
      <div className="relative mx-auto max-w-[600px]">
        <h2 data-appear className="t-h2">No gimmicks. No guesswork. Just precision health, made accessible.</h2>
        <Cta data-appear="0.1" href={links.products} className="mt-8">Start Your Assessment</Cta>
      </div>
    </section>
  )
}

export function Footer() {
  const root = useRef(null)
  useGSAP(() => appear(root.current), { scope: root })
  const cols = [
    { title: 'Navigation', items: [['Home', '#top'], ['Treatments', links.products], ['How it Works', '#how'], ['FAQ', '#faq']] },
    { title: 'Resources', items: [['Products', links.products], ['Patient Login', links.portal], ['Privacy Policy', links.privacy], ['Consumer Data Policy', links.consumerData]] },
  ]
  const strip = [['Email Us', links.email], ['Call (888) 706-3905', links.phone], ['Patient Login', links.portal], ['All Products', links.products]]
  return (
    <footer ref={root} className="relative z-10 overflow-x-clip bg-white px-5 pt-20 pb-6 sm:px-[30px]">
      <div className="relative z-10 mx-auto max-w-[1153px]">
        <div className="grid gap-12 md:grid-cols-[862fr_291fr]">
          <div>
            <h2 data-appear className="t-h2 max-w-[560px]">Precision health optimization backed by science and delivered with care.</h2>
            <Cta data-appear="0.05" href={links.email} className="mt-6">Let’s Talk</Cta>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {cols.map((c) => (
              <nav key={c.title} data-appear="0.1" aria-label={c.title}>
                <p className="text-[16px] text-soft">{c.title}</p>
                <ul className="mt-4 space-y-2.5 text-[16px]">
                  {c.items.map(([l, h]) => <li key={l}><a href={h} className="transition-colors hover:text-navy">{l}</a></li>)}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <ul data-appear className="mt-12 grid grid-cols-2 gap-4 rounded-xl bg-card p-6 md:grid-cols-4">
          {strip.map(([l, h]) => (
            <li key={l}><a href={h} className="group flex items-center gap-2 text-[18px] tracking-[-0.02em]">{l}<Arrow className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a></li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col justify-between gap-2 text-[14px] text-body md:flex-row">
          <p>All treatments are prescribed by licensed providers and fulfilled by U.S. pharmacies.</p>
          <p>© {new Date().getFullYear()} Paramount HealthRx. All Rights Reserved.</p>
        </div>

        <div aria-hidden className="mt-10 flex items-center justify-center gap-4 select-none sm:justify-between">
          <svg viewBox="0 0 20 20" className="hidden h-[9vw] max-h-32 w-[9vw] max-w-32 shrink-0 text-sky sm:block" fill="currentColor"><path d="M8 2h4v6h6v4h-6v6H8v-6H2V8h6z" /></svg>
          <p className="text-[clamp(2.25rem,13vw,12.5rem)] leading-[0.8] font-medium tracking-[-0.05em] text-card">PARAMOUNT</p>
          <svg viewBox="0 0 20 20" className="hidden h-[9vw] max-h-32 w-[9vw] max-w-32 shrink-0 text-sky sm:block" fill="currentColor"><path d="M8 2h4v6h6v4h-6v6H8v-6H2V8h6z" /></svg>
        </div>
      </div>
    </footer>
  )
}
