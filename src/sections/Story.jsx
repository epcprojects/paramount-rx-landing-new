import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, ScrollTrigger, reducedMotion } from '../motion.js'
import { links } from '../content.js'
import { Cta, Tag, Img } from '../components/ui.jsx'
import { IconTestosterone, IconPeptides, IconSexualHealth, IconWeightLoss, IconHairLoss, IconPerformance } from '../components/TreatmentIcons.jsx'

const FAN_ROW_GAP = 12 // px — matches the grid's gap-3
const FAN_COL_GAP = 12 // px — matches the grid's gap-3
const FAN_CARD_RATIO = 254 / 259 // card height = width * 254/259, matches the cards' aspect-[259/254]

/** Sizes the below-`md` (mobile/narrow-tablet) card grid to use the full available width while still
 *  guaranteeing the heading + all 3 card rows fit within one screen's height — this section is pinned
 *  during its unfold (see Top.jsx), so there's no way to scroll further to reach a row cut off below.
 *  This used to be a hand-tuned `calc()` guess at how much vertical space the heading/padding leave
 *  free, which on a real phone — where Safari's toolbar shrinks `100svh` well below what desktop tools
 *  report — produced a grid far narrower than necessary, reading as oversized side padding. Measuring
 *  the real rendered heading height and viewport instead means it uses exactly the space available. */
function useMobileFanGridWidth(sectionRef, headingRef) {
  const [width, setWidth] = useState(null)

  useEffect(() => {
    const compute = () => {
      const section = sectionRef.current
      const heading = headingRef.current
      if (!section || !heading || window.innerWidth >= 768) { setWidth(null); return }

      const svh = window.visualViewport ? window.visualViewport.height : window.innerHeight
      const sectionCS = getComputedStyle(section)
      const reservedV = parseFloat(sectionCS.paddingTop) + parseFloat(sectionCS.paddingBottom)
      const headingCS = getComputedStyle(heading)
      const headingSpace = heading.getBoundingClientRect().height + parseFloat(headingCS.marginBottom)

      const availableForGrid = svh - reservedV - headingSpace
      const rowHeight = (availableForGrid - 2 * FAN_ROW_GAP) / 3
      const cardWidthByHeight = rowHeight / FAN_CARD_RATIO
      const gridWidthByHeight = 2 * cardWidthByHeight + FAN_COL_GAP

      const containerWidth = section.clientWidth - parseFloat(sectionCS.paddingLeft) - parseFloat(sectionCS.paddingRight)

      // No "legibility floor" here on purpose: clamping up on a very short viewport would silently
      // defeat the fit-within-height guarantee this hook exists for. 100px only guards against a
      // zero/negative result from a measurement glitch, not a real design minimum.
      setWidth(Math.round(Math.max(100, Math.min(containerWidth, gridWidthByHeight))))
      // #about's height can change with this grid; keep ScrollTrigger's cached positions for
      // sections below it in sync, the same way Top.jsx's own resize handler does.
      ScrollTrigger.refresh()
    }
    compute()
    window.addEventListener('resize', compute)
    window.addEventListener('orientationchange', compute)
    return () => {
      window.removeEventListener('resize', compute)
      window.removeEventListener('orientationchange', compute)
    }
  }, [sectionRef, headingRef])

  return width
}

const cards = [
  { name: 'Testosterone', tagline: 'Optimize your hormones. Reclaim your edge.', image: '/img/card-testosterone-500.webp', Icon: IconTestosterone },
  { name: 'Peptides & Longevity', tagline: 'Science-backed solutions for a longer, healthier life.', image: '/img/card-peptides-500.webp', Icon: IconPeptides },
  { name: 'Sexual Health', tagline: 'Confidence. Performance. Intimacy.', image: '/img/card-sexual-health-500.webp', Icon: IconSexualHealth },
  { name: 'Weight Loss', tagline: 'Sustainable results. A healthier, lighter you.', image: '/img/card-weight-loss-500.webp', Icon: IconWeightLoss },
  { name: 'Hair Loss', tagline: 'Stronger hair. Greater confidence.', image: '/img/card-hair-loss-500.webp', Icon: IconHairLoss },
  { name: 'Performance Enhancers', tagline: 'More energy, more strength, more you.', image: '/img/card-performance-500.webp', Icon: IconPerformance },
]

/** Treatment cards revealed under the hero tiles, unfolding from edge-on. */
export function About() {
  // The cards' unfold lives in the hero's pinned timeline (Top.jsx), so the page holds until they're all flat.
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const mobileGridWidth = useMobileFanGridWidth(sectionRef, headingRef)

  return (
    <section ref={sectionRef} id="about" className="relative z-10 flex h-svh min-h-[560px] items-center overflow-x-clip bg-gray-100 px-3 py-10 sm:px-[30px] sm:py-14">
      <div className="relative z-10 w-full">
        {/* Heading — wording from the live site's "Choose a Health Journey" treatment picker */}
        <div ref={headingRef} data-fan-head className="mx-auto mb-8 flex max-w-[985px] flex-col items-center text-center sm:mb-14">
          <Tag dot={false}>Treatments</Tag>
          <h2 id="treatments-heading" className="t-h2 mt-3 max-w-none !text-[28px] sm:!text-[36px] md:!text-[56px] md:whitespace-nowrap">Choose Your Health Journey</h2>
        </div>
        {/* Treatment cards — same art, icons and copy as the live paramounthealthrx.com cards (3 × 2).
            Below md, width comes from useMobileFanGridWidth (measured, see above); the calc() here is
            only the pre-measurement fallback for the first paint. md+ (tablet/desktop, 3 cols) keeps
            its own formula untouched. */}
        <ul
          data-fanwrap
          style={mobileGridWidth ? { maxWidth: `${mobileGridWidth}px` } : undefined}
          className="mx-auto grid w-full max-w-[min(985px,calc((100svh-230px)*0.70))] grid-cols-2 gap-3 [perspective:1200px] sm:gap-5 md:max-w-[min(985px,calc((100svh-290px)*1.53+40px))] md:grid-cols-3"
          aria-labelledby="treatments-heading"
        >
          {cards.map((c, i) => (
            <li key={c.name} data-fan data-col={i % 3} data-row={Math.floor(i / 3)} className="will-change-transform">
              <a
                href={links.products}
                aria-label={`Explore ${c.name}`}
                className="group relative block aspect-[259/254] overflow-hidden rounded-[22px] border-2 border-white/50 text-left text-white shadow-[0_18px_40px_-24px_rgba(10,26,47,0.55)]"
              >
                <div aria-hidden className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-out group-hover:scale-105" style={{ backgroundImage: `url(${c.image})` }} />
                <div className="relative z-10 flex h-full flex-col items-start justify-between p-3 sm:p-5">
                  <span className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-black/50 backdrop-blur-[52px] transition-colors duration-300 group-hover:bg-sky sm:size-[54px]">
                    <c.Icon />
                  </span>
                  <span className="block w-full">
                    <span className="block text-[16px] leading-tight font-semibold tracking-[-0.01em] sm:text-[22px]">{c.name}</span>
                    <span className="mt-1 flex items-end justify-between gap-2">
                      <span className="text-[11px] leading-[1.3] text-white/90 sm:text-[15px] sm:leading-snug">{c.tagline}</span>
                      <svg viewBox="0 0 16 16" className="mb-0.5 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 3.5L10.5 8 6 12.5" /></svg>
                    </span>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Medora "Difference": pinned media grows from a small rounded card to full-bleed, then a dark blur layer and centred copy. */
export function Difference() {
  const root = useRef(null)
  useGSAP(() => {
    const q = gsap.utils.selector(root)
    if (reducedMotion()) { gsap.set(q('[data-frame]'), { width: '100%', height: '100%', borderRadius: 0 }); gsap.set(q('[data-blur], [data-text]'), { opacity: 1 }); return }
    const mobile = window.innerWidth < 768
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=160%', pin: true, scrub: true, anticipatePin: 1 } })
    // Phase lengths follow Medora's triggers: grow 846px · overlay 338px · text 423px.
    tl.fromTo(q('[data-frame]'), { width: mobile ? '78%' : '40%', height: mobile ? '42%' : '50%', borderRadius: 16 }, { width: '100%', height: '100%', borderRadius: 0, ease: 'none', duration: 0.53 })
      .fromTo(q('[data-media]'), { scale: 1.25 }, { scale: 1, ease: 'none', duration: 0.53 }, 0)
      .fromTo(q('[data-blur]'), { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.21 }, 0.53)
      .fromTo(q('[data-text] > *'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'power1.out', duration: 0.2, stagger: 0.04 }, 0.74)
  }, { scope: root })

  return (
    <section ref={root} id="why" className="relative z-10 flex h-svh min-h-[560px] items-center justify-center overflow-hidden bg-white">
      <div data-frame className="relative h-full w-full overflow-hidden">
        <Img data-media base="/img/medical-review" widths={[900, 1800]} alt="A Paramount HealthRx provider reviewing a patient’s health history, lab results and goals" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[45%_center]" />
        <div data-blur className="absolute inset-0 bg-black/50 opacity-0 backdrop-blur-md" />
        <div data-text className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <Tag light dot={false}>Physician-Guided Care</Tag>
          <h2 className="t-h2 mt-4 max-w-[640px]">Real clinicians. Real oversight. Care <br className="hidden md:block" />built around your goals.</h2>
          <p className="t-body mt-4 max-w-[520px] !text-[#d9d9d9]">If appropriate, your information is reviewed by a licensed medical provider — so every recommendation is responsible, personalized and medically grounded.</p>
          <Cta href={links.products} variant="glass" size="lg" className="mt-7">Start Your Assessment</Cta>
        </div>
      </div>
    </section>
  )
}
