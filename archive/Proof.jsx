import { useRef } from 'react'
import { gsap, useGSAP, reducedMotion, appear } from '../motion.js'
import { featureCards, resultRows, patientResult, benefits, links } from '../content.js'
import { Cta, Tag, Img } from '../components/ui.jsx'

const avatars = [1, 2, 3, 4, 5].map((n) => `/img/avatar-${n}-40.webp`)

function Avatars({ count = 4, ring = 'ring-white' }) {
  return (
    <div className="flex -space-x-2.5" aria-hidden>
      {avatars.slice(0, count).map((a) => <img key={a} src={a} alt="" className={`h-10 w-10 rounded-full object-cover ring-2 ${ring}`} />)}
    </div>
  )
}

function Icon({ name }) {
  const p = { protocol: 'M5 4h10v12H5zM8 8h4M8 11h4', lab: 'M8 3v5l-4 7a1.5 1.5 0 001.3 2h9.4A1.5 1.5 0 0016 15l-4-7V3M7 3h6', pharmacy: 'M8 3h4v5h5v4h-5v5H8v-5H3V8h5z' }[name]
  return (
    <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-navy">
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={p} /></svg>
    </span>
  )
}

/** Medora "Features": overlap skyline, centred heading, big image entering diagonally with a rating badge, stacked cards. */
export function Features() {
  const root = useRef(null)
  useGSAP(() => {
    appear(root.current)
    if (reducedMotion()) return
    const q = gsap.utils.selector(root)
    // Measured: x −200 / y +200 / opacity 0 → 0,0,1, scroll-linked with smoothing.
    gsap.fromTo(q('[data-diag]'), { x: -200, y: 200, opacity: 0 }, {
      x: 0, y: 0, opacity: 1, ease: 'power3.out',
      scrollTrigger: { trigger: q('[data-diag]')[0], start: 'top 100%', end: 'top 15%', scrub: 1.2 },
    })
  }, { scope: root })

  return (
    <section ref={root} className="relative z-10 bg-white px-5 pt-10 pb-10 sm:px-[30px]">
      <div className="relative z-10 mx-auto max-w-[1153px]">
        <div className="mx-auto max-w-[760px] pt-16 text-center">
          <Tag data-appear>Why Paramount</Tag>
          <h2 data-appear="0.05" className="t-h2 mt-4">Because average isn’t the goal — integrated, physician-guided optimization.</h2>
          <p data-appear="0.1" className="t-body mx-auto mt-4 max-w-[560px]">Anyone can offer products. Very few build real infrastructure: real clinicians, real labs and licensed pharmacies behind every plan.</p>
        </div>

        <div data-diag className="relative mt-14 aspect-[4/3] overflow-hidden rounded-xl sm:aspect-[1153/760]">
          <Img base="/img/step-plan" widths={[900, 1400]} sizes="100vw" alt="A patient reviewing his personalized care plan on a tablet" loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center bg-gradient-to-t from-black/70 to-transparent px-6 pt-28 pb-8 text-center text-white">
            <p className="text-[32px] leading-none font-medium tracking-[-0.02em]">95%</p>
            <p className="mt-2 text-[14px] uppercase tracking-[0.04em] text-white/85">Simple, convenient experience</p>
            <div className="mt-4"><Avatars ring="ring-black/40" /></div>
          </div>
        </div>

        <ul className="mt-6 space-y-6">
          {featureCards.map((c, i) => (
            <li key={c.title} data-appear={i * 0.08} className="rounded-xl bg-card p-6 pr-6 sm:pr-[88px]">
              <Icon name={c.icon} />
              <h3 className="mt-10 text-[28px] leading-tight font-medium tracking-[-0.02em] sm:text-[32px]">{c.title}</h3>
              <p className="t-body mt-2">{c.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Medora "Results": centred heading, labelled result rows with counting values, large image, patient-result block. */
export function Results() {
  const root = useRef(null)
  useGSAP(() => {
    appear(root.current)
    const q = gsap.utils.selector(root)
    q('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count)
      if (reducedMotion()) { el.textContent = end; return }
      const o = { v: 0 }
      gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v) }, scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
    })
    if (!reducedMotion()) {
      gsap.fromTo(q('[data-photo]'), { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: q('[data-photo]')[0], start: 'top bottom', end: 'bottom top', scrub: true } })
    }
  }, { scope: root })

  return (
    <section ref={root} id="results" className="relative z-10 scroll-mt-20 bg-white px-5 py-10 sm:px-[30px]">
      <div className="mx-auto max-w-[1153px]">
        <div className="mx-auto max-w-[620px] pt-24 text-center">
          <Tag data-appear>Results</Tag>
          <h2 data-appear="0.05" className="t-h2 mt-4">Real treatments. Real results — designed for the way you live today.</h2>
          <p data-appear="0.1" className="t-body mx-auto mt-4 max-w-[480px]">Fast, discreet care with licensed providers, real labs and U.S. pharmacy fulfilment.</p>
        </div>

        <div className="mt-16">
          <p data-appear className="text-[18px] font-medium">Result—01</p>
          <ul className="mt-6">
            {resultRows.map((r, i) => (
              <li key={r.label} data-appear={i * 0.06} className="flex items-center justify-between gap-6 border-b border-line py-4">
                <span className="text-[20px] leading-tight tracking-[-0.02em] sm:text-[24px]">{r.label}</span>
                <span className="shrink-0 rounded-full bg-card px-3.5 py-1.5 text-[16px] tabular-nums"><span data-count={r.value}>{r.value}</span>{r.suffix}</span>
              </li>
            ))}
          </ul>
        </div>

        <div data-appear className="relative mt-16 aspect-[4/5] overflow-hidden rounded-xl sm:aspect-[1153/1000]">
          <Img data-photo base="/img/t-weight-loss" widths={[600, 896]} sizes="100vw" alt="A fit, athletic person measuring their waist" loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div data-appear className="pt-6 pr-14 pb-7 pl-0 sm:pl-6">
          <p className="text-[18px] font-medium">Patient Results</p>
          <p className="mt-6 text-[40px] leading-none font-medium tracking-[-0.03em]"><span data-count={patientResult.value}>{patientResult.value}</span>{patientResult.suffix}</p>
          <p className="t-body mt-3 max-w-[420px]">Patients {patientResult.text.replace('of patients ', '')}</p>
        </div>
      </div>
    </section>
  )
}

/** Medora "Core Benefits": image + heading + arrow list, then a rating strip with avatars and a CTA. */
export function Benefits() {
  const root = useRef(null)
  useGSAP(() => appear(root.current), { scope: root })
  return (
    <section ref={root} className="relative z-10 bg-white px-5 py-10 sm:px-[30px]">
      <div className="mx-auto max-w-[1153px]">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
          <div data-appear className="aspect-[577/483] overflow-hidden rounded-xl">
            <Img base="/img/step-review" widths={[900, 1400]} sizes="(min-width:768px) 50vw, 100vw" alt="A licensed provider explaining a care plan to a patient" loading="lazy" className="h-full w-full scale-[1.25] object-cover object-[40%_center]" />
          </div>
          <div>
            <Tag data-appear>Core Benefits</Tag>
            <h2 data-appear="0.05" className="t-h2 mt-4">Smarter care, designed around your biology.</h2>
            <p data-appear="0.1" className="t-body mt-4 max-w-[460px]">Your biology is unique. Your treatment should be too — with clear guidance every step of the way.</p>
            <ul className="mt-8 space-y-4">
              {benefits.map((b, i) => (
                <li key={b} data-appear={0.12 + i * 0.05} className="flex items-center gap-3 text-[20px] font-medium tracking-[-0.01em]">
                  <span aria-hidden>→</span>{b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div data-appear className="mt-10 grid gap-6 rounded-2xl bg-card p-6 md:grid-cols-[1fr_1fr_auto] md:items-center">
          <div className="flex items-center gap-4">
            <Avatars ring="ring-card" />
            <div>
              <p className="text-[16px] font-medium">Patient experience:</p>
              <p className="text-[14px] text-body">95% report simple, convenient care</p>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-[40px] leading-none font-medium tracking-[-0.03em]">54+</p>
            <p className="text-[16px] font-medium">Treatments prescribed by<br className="hidden lg:block" /> licensed providers</p>
          </div>
          <Cta href={links.products}>Explore Treatments</Cta>
        </div>
      </div>
    </section>
  )
}
