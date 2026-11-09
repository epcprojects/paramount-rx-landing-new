import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, ScrollTrigger, appear, reducedMotion } from '../motion.js'
import { links, faqs } from '../content.js'

// Sections rebuilt from the live paramounthealthrx.com homepage (same copy, imagery, icons and layout),
// placed after "Physician-Guided Care": Smart Choice → 4 easy steps → This isn't wellness → Your biology is unique → FAQ → footer.



/* ---------- shared bits ---------- */

/** True once the ref'd element is within `margin` of the viewport (see BodyMap.jsx's identical hook —
 *  kept local here too rather than shared, since it's a 10-line hook, not worth a cross-file import). */
function useNearViewport(margin = '800px') {
  const ref = useRef(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    if (near || !ref.current) return
    let io
    let cancelled = false
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

/** Autoplaying background video (steps/footer wordmark loops) that only fetches once it's actually
 *  near the viewport — these were downloading in full on page load regardless of scroll position,
 *  the single biggest piece of unnecessary weight on the page (the footer loop alone is ~13MB). */
function LazyVideo({ src, poster, className, style, ...rest }) {
  const [ref, near] = useNearViewport()
  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      src={near ? src : undefined}
      className={className}
      style={style}
      aria-hidden
      {...rest}
    />
  )
}

const ArrowUpRight = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path fill="white" d="M14.8222 4.90976C14.6192 4.7215 14.3514 4.61707 14.1233 4.55138C13.8801 4.4813 13.6018 4.43352 13.3153 4.40006C12.741 4.33301 12.0677 4.31625 11.4374 4.32169C10.8037 4.32717 10.1966 4.35533 9.74911 4.38197C9.525 4.39531 9.34003 4.40832 9.21068 4.41804C9.14599 4.4229 9.09516 4.42694 9.06024 4.42978L9.02004 4.43311L9.00936 4.43402L9.00521 4.43438C8.66538 4.46398 8.4139 4.76347 8.4435 5.1033C8.4731 5.44311 8.77304 5.69455 9.11285 5.66497L9.11492 5.66479L9.1239 5.66403L9.16055 5.661C9.19304 5.65835 9.24127 5.65452 9.30321 5.64986C9.42711 5.64056 9.60564 5.62799 9.82253 5.61508C10.2571 5.58921 10.842 5.56218 11.4481 5.55694C12.0578 5.55168 12.6724 5.56868 13.172 5.62702C13.2 5.6303 13.2275 5.63368 13.2544 5.63717L4.50439 14.3872C4.26318 14.6284 4.26318 15.0195 4.50439 15.2607C4.7456 15.5019 5.13667 15.5019 5.37788 15.2607L14.13 6.50862C14.1314 6.52044 14.1328 6.53238 14.1342 6.54444C14.1921 7.03842 14.2094 7.65642 14.2047 8.27406C14.2 8.88783 14.1737 9.4839 14.1485 9.92778C14.1359 10.1493 14.1236 10.3321 14.1145 10.459C14.1099 10.5225 14.1062 10.572 14.1036 10.6053L14.1006 10.643L14.0996 10.655C14.0714 10.9949 14.3241 11.2933 14.664 11.3216C15.0039 11.3499 15.3025 11.0968 15.3307 10.7568L15.331 10.7531L15.3319 10.7422L15.3352 10.7011C15.3379 10.6654 15.3419 10.6135 15.3466 10.5474C15.3561 10.4152 15.3688 10.2264 15.3818 9.99788C15.4077 9.54172 15.435 8.92415 15.4399 8.28355C15.4448 7.64681 15.4278 6.96969 15.3611 6.40067C15.3279 6.11715 15.2803 5.84169 15.2096 5.60361C15.1452 5.38664 15.036 5.10798 14.8222 4.90976Z" />
  </svg>
)

const ArrowRight = () => (
  <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
    <path fill="white" fillRule="evenodd" clipRule="evenodd" d="M11.5303 0L17.0607 5.53029L11.5304 11.0607L10.4697 10L14.1894 6.2803L0 6.28033V4.78033L14.1894 4.7803L10.4697 1.06066L11.5303 0Z" />
  </svg>
)

/** The live site's pill button: light fill, label, black circle with a tilting arrow. */
function PillButton({ href, children, light = false, className = '' }) {
  return (
    <a href={href} className={`group flex w-fit items-center gap-3 rounded-full py-1 pr-1 pl-5 md:py-2 md:pr-2 xl:pl-[26px] ${light ? 'bg-[#FAF7F6]' : 'bg-neutral-100'} ${className}`}>
      <span className="text-sm font-medium text-gray-950 xl:text-lg">{children}</span>
      <span className="flex size-9 items-center justify-center rounded-full bg-black xl:size-11">
        <span className="transition-transform duration-300 group-hover:rotate-45"><ArrowUpRight /></span>
      </span>
    </a>
  )
}

/* ---------- Why Paramount is the Smart Choice ---------- */

const stats = [
  {
    value: 95, bg: 'bg-[#EBF6FA]', ring: 'shadow-[inset_0_0_8px_0_rgba(0,122,255,0.25)]', lift: false,
    text: 'of patients report a simple, convenient treatment experience.',
    icon: <path fill="#3AB5FE" fillRule="evenodd" clipRule="evenodd" d="M17.0377 2.42144C15.7623 2.24997 14.0161 2.24999 11.9431 2.25C9.87002 2.24999 8.23769 2.24998 6.96234 2.42144C5.65376 2.59738 4.60928 2.9661 3.78769 3.78769C2.9661 4.60928 2.59737 5.65376 2.42144 6.96234C2.24997 8.23769 2.24999 9.98391 2.25 12.0569C2.24999 14.13 2.24998 15.7623 2.42144 17.0377C2.59738 18.3462 2.9661 19.3907 3.78769 20.2123C4.60928 21.0339 5.65376 21.4026 6.96234 21.5786C8.23769 21.75 9.98391 21.75 12.0569 21.75C14.13 21.75 15.7623 21.75 17.0377 21.5786C18.3462 21.4026 19.3907 21.0339 20.2123 20.2123C21.0339 19.3907 21.4026 18.3462 21.5786 17.0377C21.75 15.7623 21.75 14.13 21.75 12.0569C21.75 9.9839 21.75 8.23769 21.5786 6.96234C21.4026 5.65376 21.0339 4.60928 20.2123 3.78769C19.3907 2.9661 18.3462 2.59737 17.0377 2.42144ZM13.2276 7.8181C13.1467 7.49461 12.862 7.26335 12.5288 7.25056C12.1956 7.23776 11.8939 7.44649 11.7885 7.76283L10.5 11.6283L9.71151 9.26283C9.61889 8.98497 9.37299 8.78644 9.08184 8.75448C8.79069 8.72252 8.50758 8.86298 8.35688 9.11413L7.07536 11.25H5.5C5.08579 11.25 4.75 11.5858 4.75 12C4.75 12.4142 5.08579 12.75 5.5 12.75H7.5C7.76345 12.75 8.00758 12.6118 8.14312 12.3859L8.80415 11.2842L9.78849 14.2372C9.89057 14.5434 10.1772 14.75 10.5 14.75C10.8228 14.75 11.1094 14.5434 11.2115 14.2372L12.3971 10.6806L13.7724 16.1819C13.8485 16.4864 14.1062 16.7113 14.4182 16.7455C14.7301 16.7798 15.0305 16.6161 15.1708 16.3354L16.9635 12.75H18.5C18.9142 12.75 19.25 12.4142 19.25 12C19.25 11.5858 18.9142 11.25 18.5 11.25H16.5C16.2159 11.25 15.9562 11.4105 15.8292 11.6646L14.7359 13.8512L13.2276 7.8181Z" />,
  },
  {
    value: 100, label: 'Personalized', bg: 'bg-[#F5F5F5]', ring: 'shadow-[inset_0_0_8px_0_#D3D3D3]', lift: true,
    text: 'Care begins with your health history, goals, and a licensed provider’s clinical evaluation.',
    icon: (
      <>
        <path fill="#2E80A6" fillRule="evenodd" clipRule="evenodd" d="M11.5833 0.75H10.4167C8.46586 0.749988 6.92941 0.749978 5.72885 0.902422C4.49987 1.05847 3.50965 1.38575 2.72552 2.12631C1.93535 2.87259 1.5806 3.82468 1.41255 5.00521C1.24997 6.14728 1.24998 7.60539 1.25 9.44065V13.5593C1.24998 15.3946 1.24997 16.8527 1.41255 17.9948C1.5806 19.1753 1.93534 20.1274 2.72552 20.8737C3.50965 21.6142 4.49987 21.9415 5.72885 22.0976C6.92941 22.25 8.46586 22.25 10.4167 22.25L11.1941 22.25C11.4715 22.25 11.6103 22.25 11.6969 22.1686C11.7835 22.0872 11.7925 21.9415 11.8106 21.6501C11.8558 20.9237 12.0001 20.4098 12.3286 19.9678C12.8992 19.2001 13.6076 18.5818 14.397 18.1209C14.7901 17.8914 14.9867 17.7766 15.0127 17.6436C15.0388 17.5105 14.8923 17.32 14.5994 16.9388C14.0699 16.2499 13.75 15.3875 13.75 14.4287C13.75 12.0404 15.7349 10.25 18 10.25C18.5816 10.25 19.1448 10.368 19.6606 10.584C20.2085 10.8133 20.4824 10.9279 20.6162 10.8389C20.75 10.7499 20.75 10.4884 20.75 9.96542V9.44074C20.75 7.60547 20.75 6.14729 20.5875 5.00521C20.4194 3.82468 20.0647 2.87259 19.2745 2.12631C18.4904 1.38575 17.5001 1.05847 16.2712 0.902422C15.0706 0.749979 13.5342 0.749988 11.5833 0.75ZM6 6.5C6 5.94772 6.44772 5.5 7 5.5H15C15.5523 5.5 16 5.94772 16 6.5C16 7.05228 15.5523 7.5 15 7.5H7C6.44772 7.5 6 7.05228 6 6.5ZM6 11.5C6 10.9477 6.44772 10.5 7 10.5H11C11.5523 10.5 12 10.9477 12 11.5C12 12.0523 11.5523 12.5 11 12.5H7C6.44772 12.5 6 12.0523 6 11.5Z" />
        <path fill="#2E80A6" d="M18 11.75C16.5071 11.75 15.25 12.9239 15.25 14.4287C15.25 15.9335 16.5071 17.1074 18 17.1074C19.4929 17.1074 20.75 15.9335 20.75 14.4287C20.75 12.9239 19.4929 11.75 18 11.75Z" />
        <path fill="#2E80A6" d="M22.4798 20.8737C20.2703 17.7998 15.6777 17.9765 13.5325 20.8626C13.3348 21.1285 13.25 21.4399 13.25 21.7334C13.25 22.571 13.929 23.25 14.7666 23.25H21.2289C22.069 23.25 22.75 22.569 22.75 21.7289C22.75 21.441 22.6685 21.1363 22.4798 20.8737Z" />
      </>
    ),
  },
  {
    value: 92, bg: 'bg-[#FFF6EB]', ring: 'shadow-[inset_0_0_8px_0_#F0D6C6]', lift: false,
    text: 'of patients stay engaged with their recommended care plan.',
    icon: <path fill="#F59E0B" fillRule="evenodd" clipRule="evenodd" d="M11.999 1.25C10.3178 1.25 8.95094 1.81794 7.75881 2.43555C7.39857 2.62217 7.06392 2.80678 6.74414 2.98319C5.96168 3.41482 5.26815 3.7974 4.50658 4.04039C4.05929 4.1831 3.66307 4.30951 3.38214 4.4196C3.11772 4.52321 2.80348 4.6652 2.58051 4.91299C2.38023 5.13558 2.27734 5.38547 2.20912 5.6245C2.14719 5.84148 2.09425 6.13523 2.04347 6.41705C0.805527 13.2827 3.51252 19.787 10.123 22.3179C10.7727 22.5667 11.2513 22.75 12.0023 22.75C12.7534 22.75 13.2319 22.5667 13.8816 22.3179C20.4919 19.7869 23.1962 13.2824 21.9579 6.417C21.9071 6.13515 21.8541 5.84133 21.7922 5.62434C21.7239 5.38529 21.621 5.13537 21.4207 4.91278C21.1977 4.66499 20.8835 4.52304 20.619 4.41946C20.3381 4.30941 19.9419 4.18307 19.4946 4.04044C18.7327 3.79744 18.0386 3.41479 17.2555 2.98309C16.9356 2.80673 16.6007 2.6221 16.2405 2.43554C15.0477 1.81795 13.6803 1.25 11.999 1.25ZM17.3338 9.9429C17.8544 9.75852 18.127 9.18702 17.9426 8.66643C17.7582 8.14583 17.1868 7.87327 16.6662 8.05765C15.788 8.36865 14.9486 8.96179 14.212 9.60781C13.465 10.2629 12.7666 11.0235 12.1733 11.7347C11.734 12.2613 11.3456 12.7689 11.0304 13.1997C10.7416 12.8538 10.454 12.6011 10.1797 12.4182C9.9053 12.2353 9.55228 12.0003 9 12.0003C8.44772 12.0003 8 12.448 8 13.0003C8 13.521 8.39799 13.9487 8.90638 13.9959C9.11042 14.0149 9.66489 14.5661 10.1056 15.4475C10.2668 15.7698 10.5889 15.9805 10.9489 15.999C11.3087 16.0174 11.6508 15.8406 11.8441 15.5365C11.8441 15.5365 12.1922 15.0141 12.3574 14.7801C12.6885 14.3111 13.1572 13.6774 13.7091 13.0159C14.2628 12.3521 14.888 11.6751 15.5307 11.1115C16.1837 10.5388 16.8002 10.1319 17.3338 9.9429Z" />,
  },
]

const avatars = [1, 2, 3, 4, 5, 6, 7]

function Avatars({ className = '' }) {
  return (
    <div className={`floating-avatars flex items-center ${className}`} aria-hidden>
      {avatars.map((n, i) => (
        <img key={n} src={`/img/avatar-${n}-40.webp`} alt="" width="40" height="40" className={`size-10 shrink-0 rounded-full border-2 border-white object-cover transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105 ${i ? '-ml-3' : ''}`} />
      ))}
    </div>
  )
}

function StatCard({ s }) {
  return (
    <div className={`rounded-[10px] p-4 md:rounded-[20px] md:p-10 ${s.bg}`}>
      <div className="flex flex-col items-center gap-2 md:gap-4">
        <div className={`flex size-14 items-center justify-center rounded-full bg-white/10 md:size-[72px] ${s.ring}`}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>{s.icon}</svg>
        </div>
        <div className="text-center">
          <p className="text-[28px] leading-[1.2] font-medium text-navy md:text-4xl xl:text-[56px]">
            <span data-count={s.value}>{s.value}</span>%
          </p>
          {s.label && <span className="text-lg font-semibold text-navy md:text-[26px]">{s.label}</span>}
        </div>
        <p className="text-center text-base leading-[1.4] text-[#143849] md:text-lg">{s.text}</p>
      </div>
    </div>
  )
}

export function SmartChoice() {
  const root = useRef(null)
  useGSAP(() => {
    appear(root.current)
    if (reducedMotion()) return
    // numbers count up from 0 the first time the cards come into view (as on the live site)
    gsap.utils.toArray(root.current.querySelectorAll('[data-count]')).forEach((el) => {
      const to = Number(el.dataset.count)
      const o = { v: 0 }
      gsap.to(o, {
        v: to, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = Math.round(o.v) },
        onStart: () => { el.textContent = '0' },
      })
    })
  }, { scope: root })

  return (
    <section ref={root} className="relative z-10 bg-white pt-10 md:pt-[72px] xl:pt-24">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 border-b border-b-neutral-300 px-4 md:gap-12 xl:px-8">
        <div data-appear className="flex flex-col gap-3">
          <h2 className="text-center text-2xl leading-[1.2] font-medium text-navy md:text-4xl xl:text-[58px]">
            Why Paramount is the<br /> <span className="text-[#171717]">Smart Choice</span>
          </h2>
          <p className="text-center text-sm text-neutral-700 md:text-lg">Real treatments. Real results. <br />Fast, discreet, and designed for the way you live today.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6 lg:px-[100px]">
          {stats.map((s) =>
            s.lift ? (
              <div key={s.value} data-appear className="flex flex-col items-center gap-5">
                <StatCard s={s} />
                <Avatars className="hidden md:flex" />
              </div>
            ) : (
              <div key={s.value} data-appear className="pb-4 md:py-20 md:pb-20">
                <StatCard s={s} />
              </div>
            ),
          )}
          <div className="mb-8 flex items-center justify-center md:hidden"><Avatars /></div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Get Started in 4 easy steps ---------- */

const steps = [
  { title: 'Online Assessment', body: 'Answer clinically relevant questions about your health goals and history.', img: 'step1' },
  { title: 'Medical Review', body: 'A licensed provider evaluates your data and lab results.', img: 'step2' },
  { title: 'Personalized Plan', body: 'Receive tailored peptides, hormones, and vitamins designed for you.', img: 'step3' },
  { title: 'Delivery & Support', body: 'Receive tailored peptides, hormones, and vitamins designed for you', img: 'step4' },
]

function StepsIntro({ large = false }) {
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col gap-3">
        <h2 className={`leading-[1.2] font-medium text-[#17171766] ${large ? 'text-5xl' : 'text-[28px]'}`}>Get Started in<br /><span className="text-[#171717]">4 easy steps</span></h2>
        <p className={`text-neutral-700 ${large ? 'text-lg' : 'text-base'}`}>Simple. Secure. Physician-Guided.</p>
      </div>
      <PillButton href={links.products}>Explore Treatments</PillButton>
    </div>
  )
}

// Non-active steps sit at a flat dimmed opacity; the current step is fully opaque white.
const INACTIVE_OPACITY = 0.4

export function Steps() {
  const root = useRef(null)
  const stage = useRef(null)
  const list = useRef(null)
  const [active, setActive] = useState(0)

  useGSAP(() => {
    appear(root.current)
    const mm = gsap.matchMedia()
    // Desktop: the dark panel pins; scrolling slides the step list up, fades items by distance from the current one,
    // and cross-fades the background photo + description for the current step.
    mm.add('(min-width: 1024px)', () => {
      const items = gsap.utils.toArray(list.current.children)
      const itemH = () => items[0]?.offsetHeight || 100
      const paint = (p) => {
        gsap.set(list.current, { y: -p * itemH() })
        const a = Math.min(steps.length - 1, Math.round(p))
        items.forEach((el, i) => { el.style.opacity = i === a ? '1' : String(INACTIVE_OPACITY) })
        setActive((cur) => (cur === a ? cur : a))
      }
      paint(0)
      const st = ScrollTrigger.create({
        trigger: stage.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * 0.9 * steps.length}`,
        pin: true,
        anticipatePin: 1,
        scrub: reducedMotion() ? false : 0.6,
        onUpdate: (self) => paint(self.progress * (steps.length - 1)),
      })
      return () => st.kill()
    })
    return () => mm.revert()
  }, { scope: root })

  const jump = (i) => {
    const st = ScrollTrigger.getAll().find((t) => t.trigger === stage.current)
    if (!st) return setActive(i)
    window.scrollTo({ top: st.start + (i / (steps.length - 1)) * (st.end - st.start), behavior: 'smooth' })
  }

  return (
    <section ref={root} className="relative z-10 bg-white">
      {/* phones / tablets: stacked steps */}
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:gap-14 md:py-16 lg:hidden">
        <div data-appear className="flex flex-col items-start gap-8">
          <StepsIntro />
          <LazyVideo className="h-[200px] w-full rounded-2xl object-cover md:h-[400px]" src="/videos/steps.mp4" />
        </div>
        <div className="flex flex-col gap-5 md:gap-6">
          {steps.map((st, i) => (
            <article key={st.title} data-appear className="flex flex-col gap-3">
              <div className="w-fit rounded-full bg-sky px-4 py-1.5"><span className="text-sm font-medium text-white">Step 0{i + 1}</span></div>
              <img src={`/img/steps-bg-${i + 1}-1800.webp`} alt={st.title} loading="lazy" className="w-full rounded-2xl object-contain" />
              <div className="flex flex-col gap-1 px-1">
                <h3 className="text-base leading-[1.4] text-black md:text-lg">{i + 1}. {st.title}</h3>
                <p className="text-sm leading-[1.6] text-neutral-600">{st.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* desktop: intro row (heading, CTA, looping video) above the pinned panel, as on the live site */}
      <div className="mx-auto hidden max-w-6xl items-start justify-between gap-9 bg-white px-8 pt-12 pb-10 lg:flex">
        <div data-appear><StepsIntro large /></div>
        <LazyVideo className="h-[200px] w-[320px] rounded-[20px] object-cover" src="/videos/steps.mp4" />
      </div>

      {/* desktop: pinned dark panel with a sliding step list (reference: roveia.com "Trusted by" section) */}
      <div ref={stage} className="hidden h-svh px-5 py-4 lg:block">
        <div className="relative isolate flex h-full flex-col items-center justify-center overflow-hidden rounded-[40px] bg-black/65 px-5">
          {steps.map((st, i) => (
            <img key={st.img} src={`/img/steps-bg-${i + 1}-1800.webp`} alt="" aria-hidden loading="lazy"
              className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-700 ease-out ${i === active ? 'opacity-100' : 'opacity-0'}`} />
          ))}
          {/* 65% dark overlay over the photo, as in the reference */}
          <div aria-hidden className="absolute inset-0 -z-[5] bg-black/65" />
          <div className="mx-auto flex h-full w-full max-w-[1100px] justify-between gap-20">
            {/* step list: the current step sits at ~42% of the panel height and the list slides up past it */}
            <div className="relative h-full flex-1 overflow-hidden" role="tablist" aria-label="How it works">
              <div ref={list} className="absolute inset-x-0 top-[calc(42%-56px)] will-change-transform">
                {steps.map((st, i) => (
                  <button key={st.title} type="button" role="tab" aria-selected={i === active} onClick={() => jump(i)}
                    className="flex w-full cursor-pointer flex-col items-start gap-1 py-2 text-left transition-opacity duration-300 hover:!opacity-100"
                    style={{ opacity: i === 0 ? 1 : INACTIVE_OPACITY }}>
                    <span aria-hidden className={`text-xs font-medium tracking-[0.1em] text-white uppercase transition-opacity duration-300 ${i === active ? 'opacity-100' : 'opacity-0'}`}>Step 0{i + 1}</span>
                    <span className="text-[clamp(40px,4.2vw,64px)] leading-[1.2] tracking-[-0.03em] whitespace-nowrap text-[#f4f4f4]">{st.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* the current step's description */}
            <div className="flex max-w-[440px] flex-1 flex-col justify-center self-center">
              <div className="relative min-h-[220px]" role="tabpanel">
                {steps.map((st, i) => (
                  <div key={st.title} aria-hidden={i !== active}
                    className={`absolute inset-x-0 top-0 flex flex-col items-start gap-8 transition-opacity duration-500 ${i === active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                    <p className="text-[24px] leading-[1.5] text-white/[0.64]">{st.body}</p>
                    <PillButton href={links.products} light>Explore Treatments</PillButton>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


/* ---------- This isn't wellness. This is medicine—done right. ---------- */

/* ---------- This isn't wellness. This is medicine—done right. ---------- */
// Layout + interaction modelled on endpointclients.com "Our Services": a numbered list; hovering a row expands it
// (description + chips), greys out the other rows, turns the arrow 45°, and a photo preview follows the pointer.

const pillars = [
  {
    title: 'Individualized protocols', thumb: 'pillar-protocols', preview: '/img/pillar-protocols-photo-600.webp',
    body: 'Care begins with your health history, your goals and a licensed provider’s clinical evaluation—no one-size-fits-all plans.',
    chips: ['Health history', 'Your goals', 'Clinical evaluation'],
  },
  {
    title: 'Real labs, real doctors', thumb: 'pillar-labs', preview: '/img/pillar-labs-photo-600.webp',
    body: 'Hormones and many peptides require lab work to ensure safety and efficacy—reviewed by licensed providers.',
    chips: ['Lab work', 'Licensed providers', 'Safety first'],
  },
  {
    title: 'Compounded by licensed pharmacies', thumb: 'pillar-pharmacy', preview: '/img/pillar-pharmacy-photo-600.webp',
    body: 'Every treatment is prescribed by licensed providers, compounded by licensed pharmacies and fulfilled in the U.S.',
    chips: ['U.S. pharmacies', 'Prescribed by providers', 'Discreet delivery'],
  },
  {
    title: 'Continuous monitoring & refinement', thumb: 'pillar-monitoring', preview: '/img/pillar-monitoring-photo-600.webp',
    body: 'Adjust protocols, stay consistent and level up intentionally as your goals evolve.',
    chips: ['Ongoing support', 'Protocol adjustments', 'Progress check-ins'],
  },
]

export function Pillars() {
  const root = useRef(null)
  const list = useRef(null)
  const [hover, setHover] = useState(-1)
  const [previewY, setPreviewY] = useState(0)
  useGSAP(() => appear(root.current), { scope: root })

  const onMove = (e) => {
    const r = list.current?.getBoundingClientRect()
    if (r) setPreviewY(e.clientY - r.top)
  }

  return (
    <section ref={root} className="group/card relative z-10 bg-white py-16 lg:py-24">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-4 lg:gap-14 lg:px-8">
        <div data-appear className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-[920px] flex-col gap-5">
            <h2 className="text-4xl leading-[1.12] font-semibold tracking-[-0.02em] text-gray-950 lg:text-5xl">
              This isn&apos;t wellness.<br />
              This is{' '}
              <span className="t-hero-accent relative inline-block font-normal text-navy transition-colors duration-300 ease-out after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-navy after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100">
                medicine—done right.
              </span>
            </h2>
            <p className="max-w-[900px] text-base leading-[1.6] text-gray-500 lg:text-lg">
              Paramount HealthRx was built to deliver integrated, physician-guided optimization<br className="hidden lg:block" />—not isolated products. Because average isn&apos;t the goal.
            </p>
          </div>
          <a href={links.products} className="group/btn flex items-center gap-2 rounded-full border border-transparent bg-navy py-2 pr-2 pl-4 transition-colors duration-300 hover:bg-[#0c3a6f] md:gap-3 md:pl-[26px]">
            <span className="text-sm leading-none font-medium text-white md:text-base">Explore Treatments</span>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white md:size-11">
              <span className="scale-75 transition-transform duration-300 group-hover/btn:rotate-45 md:scale-100">
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden><path fill="#104584" d="M14.8222 4.90976C14.6192 4.7215 14.3514 4.61707 14.1233 4.55138C13.8801 4.4813 13.6018 4.43352 13.3153 4.40006C12.741 4.33301 12.0677 4.31625 11.4374 4.32169C10.8037 4.32717 10.1966 4.35533 9.74911 4.38197C9.525 4.39531 9.34003 4.40832 9.21068 4.41804C9.14599 4.4229 9.09516 4.42694 9.06024 4.42978L9.02004 4.43311L9.00936 4.43402L9.00521 4.43438C8.66538 4.46398 8.4139 4.76347 8.4435 5.1033C8.4731 5.44311 8.77304 5.69455 9.11285 5.66497L9.11492 5.66479L9.1239 5.66403L9.16055 5.661C9.19304 5.65835 9.24127 5.65452 9.30321 5.64986C9.42711 5.64056 9.60564 5.62799 9.82253 5.61508C10.2571 5.58921 10.842 5.56218 11.4481 5.55694C12.0578 5.55168 12.6724 5.56868 13.172 5.62702C13.2 5.6303 13.2275 5.63368 13.2544 5.63717L4.50439 14.3872C4.26318 14.6284 4.26318 15.0195 4.50439 15.2607C4.7456 15.5019 5.13667 15.5019 5.37788 15.2607L14.13 6.50862C14.1314 6.52044 14.1328 6.53238 14.1342 6.54444C14.1921 7.03842 14.2094 7.65642 14.2047 8.27406C14.2 8.88783 14.1737 9.4839 14.1485 9.92778C14.1359 10.1493 14.1236 10.3321 14.1145 10.459C14.1099 10.5225 14.1062 10.572 14.1036 10.6053L14.1006 10.643L14.0996 10.655C14.0714 10.9949 14.3241 11.2933 14.664 11.3216C15.0039 11.3499 15.3025 11.0968 15.3307 10.7568L15.331 10.7531L15.3319 10.7422L15.3352 10.7011C15.3379 10.6654 15.3419 10.6135 15.3466 10.5474C15.3561 10.4152 15.3688 10.2264 15.3818 9.99788C15.4077 9.54172 15.435 8.92415 15.4399 8.28355C15.4448 7.64681 15.4278 6.96969 15.3611 6.40067C15.3279 6.11715 15.2803 5.84169 15.2096 5.60361C15.1452 5.38664 15.036 5.10798 14.8222 4.90976Z" /></svg>
              </span>
            </span>
          </a>
        </div>

        <div ref={list} data-appear className="relative flex flex-col border-t border-gray-200" onMouseMove={onMove} onMouseLeave={() => setHover(-1)}>
          {/* photo preview that follows the pointer (desktop) */}
          <div aria-hidden className="pointer-events-none absolute right-28 z-10 hidden h-[200px] w-[260px] overflow-hidden rounded-[16px] shadow-[0_24px_60px_-24px_rgba(10,26,47,0.45)] transition-opacity duration-300 lg:block"
            style={{ top: previewY, transform: 'translateY(-50%)', opacity: hover >= 0 ? 1 : 0 }}>
            {pillars.map((p, i) => (
              <img key={p.title} src={p.preview} alt="" loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${i === hover ? 'opacity-100' : 'opacity-0'}`} />
            ))}
          </div>

          {pillars.map((p, i) => {
            const on = i === hover
            const dim = hover >= 0 && !on
            return (
              <a key={p.title} href={links.products} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(-1)}
                className="group flex cursor-pointer items-center justify-between gap-4 border-b border-gray-200 py-6 lg:py-8">
                <div className="flex min-w-0 items-center gap-4 lg:gap-6">
                  <div className="flex min-w-0 flex-col gap-1 lg:gap-2">
                    <span className={`text-xs font-medium transition-colors duration-300 lg:text-sm ${on ? 'text-navy' : 'text-gray-400'}`}>Step {i + 1}</span>
                    <h3 className={`text-xl font-semibold transition-colors duration-300 lg:text-3xl ${dim ? 'text-gray-950 lg:text-gray-300' : 'text-gray-950'}`}>{p.title}</h3>
                    <div className={`hidden transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:grid ${on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <p className="max-w-xl pt-1 text-base leading-relaxed text-gray-500 lg:text-lg">{p.body}</p>
                        <div className="flex flex-wrap gap-2 pt-3">
                          {p.chips.map((c) => <span key={c} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600 lg:text-base">{c}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------- Your biology is unique ---------- */
// Layout + motion modelled on brandlos.nl "De Brandlos Aanpak": a pinned section whose background takes the colour of the
// current card; the current card widens to half the row, grows tall, turns into an outline and shows its copy,
// while the other two stay as short filled pills. Scrolling hands the "current" role from one card to the next.

const families = [
  { name: 'Peptides', body: 'Advanced compounds designed to accelerate healing, improve body composition, and support longevity.', icon: 'peptides', page: '#F1E6DB', fill: '#104584' },
  { name: 'Hormones', body: 'Precision-dosed testosterone, estrogen, progesterone, and more—medically supervised.', icon: 'hormones', page: '#DFE5EE', fill: '#C3A184' },
  { name: 'Vitamins', body: 'Pharmaceutical-grade micronutrients, not store-bought fillers.', icon: 'vitamins', page: '#D7E7F9', fill: '#3AB5FE' },
]

// Each family's icon in a disc before the card title. Closed: white disc, icon in the card's own colour.
// Open (driven by the card's --glass, 0→1 on scroll): the disc turns to frosted glass and the icon to white.
const FamilyIcon = ({ icon, color }) => {
  const url = `url(/img/icons/${icon}-stroke.svg)` // supplied outline icons (24px grid)
  const size = 26
  const mask = { WebkitMaskImage: url, maskImage: url, width: size, height: size }
  return (
    <span className="bio-icon relative grid size-11 shrink-0 place-items-center rounded-full" aria-hidden>
      <span className="bio-icon-glyph absolute" style={{ ...mask, backgroundColor: color, opacity: 'calc(1 - var(--glass, 0))' }} />
      <span className="bio-icon-glyph absolute bg-white" style={{ ...mask, opacity: 'var(--glass, 0)' }} />
    </span>
  )
}

function BiologyHeader({ center = false, light = false }) {
  return (
    <div className={`grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16 ${center ? 'items-start' : ''}`}>
      <div className="flex flex-col gap-4 lg:gap-5">
        <p className={`t-tag ${light ? "text-white/90" : "text-ink"}`}>Your treatment should be too</p>
        <h2 className={`text-[34px] leading-[1.08] font-medium tracking-[-0.03em] md:text-5xl xl:text-[56px] ${light ? "text-white" : "text-ink"}`}>
          Your biology<br className="hidden lg:block" /> is unique.
        </h2>
      </div>
      <div className="flex flex-col items-start gap-7 lg:pt-8">
        <p className={`max-w-[500px] text-base leading-[1.55] xl:text-lg ${light ? "text-white/85" : "text-ink/80"}`}>
          Paramount HealthRx was built to deliver integrated, physician-guided optimization—not isolated products. Every plan starts with your
          history, your goals and a licensed provider&apos;s clinical evaluation.
        </p>
        <PillButton href={links.products} light={light}>Start Your Assessment</PillButton>
      </div>
    </div>
  )
}

export function Biology() {
  const root = useRef(null)
  const stage = useRef(null)
  const row = useRef(null)
  const tint = useRef(null)
  const [active, setActive] = useState(0)

  useGSAP(() => appear(root.current), { scope: root })

  // Static layout: the active card's styling is painted once per click, with no scroll-driven animation or pin.
  useEffect(() => {
    if (!row.current) return
    const cards = row.current.children
    const mixFill = gsap.utils.interpolate(families.map((f) => f.fill))
    tint.current.style.backgroundColor = mixFill(active / (families.length - 1))
    Array.from(cards).forEach((el, i) => {
      const w = i === active ? 1 : 0
      const fill = families[i].fill
      el.style.flexGrow = (1 + w).toFixed(3)
      el.style.height = `${(104 + 138 * w).toFixed(1)}px`
      el.style.borderColor = `rgba(255,255,255,${(0.12 * w).toFixed(3)})`
      el.style.setProperty('--glass', w.toFixed(3)) // drives the Liquid Glass sheen + rim (index.css .bio-glass)
      const [r, g, b] = [1, 3, 5].map((k) => parseInt(fill.slice(k, k + 2), 16))
      const mix = (c, to) => Math.round(c * (1 - w) + to * w)
      el.style.backgroundColor = `rgba(${mix(r, 6)},${mix(g, 12)},${mix(b, 14)},${(1 - 0.55 * w).toFixed(3)})` // filled pill → smoked black glass
      el.querySelector('[data-more]').style.opacity = w.toFixed(3)
    })
  }, [active])

  const jump = (i) => setActive(i)

  return (
    <section ref={root} className="relative z-10 bg-white">
      {/* phones / tablets: header + all three cards open */}
      <div className="relative isolate mx-3 my-3 flex flex-col gap-10 overflow-hidden rounded-[24px] px-4 py-14 lg:hidden">
        <img src="/img/biology-bg-900.webp" alt="" aria-hidden loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/45" />
        <div data-appear><BiologyHeader light /></div>
        <div className="flex flex-col gap-3">
          {families.map((f) => (
            <a key={f.name} href={links.products} data-appear className="relative flex flex-col gap-4 overflow-hidden rounded-[20px] px-7 py-5 text-white" style={{ backgroundColor: f.fill }}>
              <img src={`/img/icons/${f.icon}.svg`} alt="" width="96" height="96" className="absolute -top-2 -right-2 opacity-60" />
              <span className="flex items-center gap-4"><FamilyIcon icon={f.icon} color={f.fill} /><h3 className="text-xl font-medium">{f.name}</h3></span>
              <p className="max-w-[85%] text-[15px] leading-[1.55] text-white/90">{f.body}</p>
              <span className="text-sm underline underline-offset-4">Learn more</span>
            </a>
          ))}
        </div>
      </div>

      {/* desktop: pinned stage over the swimmer photo; a tint layer shifts toward the current card's colour */}
      <div ref={stage} className="hidden h-svh px-5 py-4 lg:block">
        {/* rounded panel inside a 20px / 16px frame, matching the "4 easy steps" panel */}
        <div className="relative isolate flex h-full flex-col justify-between overflow-hidden rounded-[40px] pt-[clamp(108px,13vh,134px)] pb-[clamp(32px,6vh,56px)]">
        <img src="/img/biology-bg-1800.webp" srcSet="/img/biology-bg-900.webp 900w, /img/biology-bg-1800.webp 1800w" sizes="100vw" alt="" aria-hidden loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div ref={tint} aria-hidden className="absolute inset-0 -z-10 opacity-30 mix-blend-multiply" style={{ backgroundColor: families[0].fill }} />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.55),rgba(0,0,0,0.25)_45%,rgba(0,0,0,0.45))]" />
        <div className="mx-auto w-full max-w-[1336px] px-10" data-appear><BiologyHeader light /></div>
        <div ref={row} className="mx-auto flex w-full max-w-[1336px] items-center gap-4 px-10" role="tablist" aria-label="Treatment families">
          {families.map((f, i) => (
            <div key={f.name} role="tab" tabIndex={0} aria-selected={i === active}
              onClick={() => i !== active && jump(i)} onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && i !== active) { e.preventDefault(); jump(i) } }}
              className={`relative min-w-0 basis-0 overflow-hidden rounded-[26px] border border-solid text-white bio-glass ${i === active ? '' : 'cursor-pointer'}`}
              style={{ flexGrow: i === 0 ? 2 : 1, height: i === 0 ? 242 : 104, backgroundColor: i === 0 ? 'rgba(6,12,14,0.45)' : f.fill, borderColor: i === 0 ? 'rgba(255,255,255,0.35)' : 'transparent', '--glass': i === 0 ? 1 : 0 }}>
              {/* title row (44px) sits 30px down in both states: centred in a 104px pill, top-aligned in the open card */}
              <div className="flex h-full flex-col px-6 pt-[30px]">
                <span className="flex items-center gap-5"><FamilyIcon icon={f.icon} color={f.fill} /><h3 className="text-[22px] leading-tight font-medium whitespace-nowrap">{f.name}</h3></span>
                <div data-more className="mt-1.5 flex max-w-[440px] flex-col items-start gap-5 pl-16" style={{ opacity: i === 0 ? 1 : 0 }} aria-hidden={i !== active}>
                  <p className="text-[15px] leading-[1.6] opacity-70">{f.body}</p>
                  <a href={links.products} tabIndex={i === active ? 0 : -1} className="text-[15px] underline underline-offset-4 opacity-85 transition-opacity hover:opacity-100">Learn more about {f.name.toLowerCase()}</a>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Frequently Asked Questions ---------- */

export function Faq() {
  const root = useRef(null)
  const [open, setOpen] = useState(0)
  useGSAP(() => appear(root.current), { scope: root })
  return (
    <section ref={root} id="faq" className="relative z-10 bg-white pt-12 pb-10 xl:pt-24 xl:pb-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 xl:gap-[54px] xl:px-8">
        <h2 data-appear className="text-2xl font-medium text-neutral-900 xl:text-5xl">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 items-center gap-6 xl:grid-cols-2 xl:gap-16">
          <div data-appear className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = open === i
              return (
                <div key={f.q} className="border-b border-b-gray-200 last:border-b-0">
                  <button type="button" aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? -1 : i)} className="group w-full cursor-pointer py-3 text-left md:py-5">
                    <span className="flex items-center justify-between gap-4">
                      <h3 className="text-base font-medium text-black md:text-2xl">{f.q}</h3>
                      <span className={`flex size-5 shrink-0 items-center justify-center transition-[color,transform] duration-300 group-hover:text-sky ${isOpen ? 'rotate-90 text-sky' : 'text-[#1F252E]'}`}>
                        <svg width="18" height="18" viewBox="0 0 10 9" fill="none" aria-hidden><path fill="currentColor" d="M9.82143 4.73214L5.89286 8.48214C5.66964 8.68304 5.33482 8.68304 5.13393 8.45982C4.93304 8.23661 4.93304 7.90179 5.15625 7.70089L8.125 4.86607H0.535714C0.223214 4.86607 0 4.64286 0 4.33036C0 4.04018 0.223214 3.79464 0.535714 3.79464H8.125L5.15625 0.982143C4.93304 0.78125 4.93304 0.424107 5.13393 0.223214C5.33482 6.70552e-08 5.69196 6.70552e-08 5.89286 0.200893L9.82143 3.95089C9.93304 4.0625 10 4.19643 10 4.33036C10 4.48661 9.93304 4.62054 9.82143 4.73214Z" /></svg>
                      </span>
                    </span>
                  </button>
                  <div id={`faq-${i}`} role="region" className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="pb-3 text-sm text-neutral-700 md:pb-5 lg:text-lg">{f.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div data-appear className="flex flex-col gap-2 md:flex-row xl:items-center xl:gap-5">
            <div className="relative h-[300px] w-full overflow-hidden rounded-[10px] bg-[#EBF6FA] xl:w-[300px] xl:rounded-[30px]">
              <img src="/img/faq-hand-299.webp" alt="" loading="lazy" className="absolute bottom-0" />
            </div>
            <div className="relative h-[300px] w-full overflow-hidden rounded-[10px] bg-[#FEF5EA] xl:w-[300px] xl:rounded-[30px]">
              <img src="/img/faq-finger-299.webp" alt="" loading="lazy" className="absolute right-0 bottom-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Footer ---------- */

// The live site masks its footer video with the words "Paramount / HealthRx".
const wordmarkMask = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 300"><text x="0" y="125" font-size="175" font-weight="800" font-family="Poppins, Arial, sans-serif" letter-spacing="-7" fill="white">Paramount</text><text x="0" y="290" font-size="175" font-weight="800" font-family="Poppins, Arial, sans-serif" letter-spacing="-7" fill="white">HealthRx</text></svg>')}")`

const footerLinks = [
  { label: 'How it Works', href: links.howItWorks },
  { label: 'FAQ', href: links.faqs },
  { label: 'Privacy Policy', href: links.privacy },
  { label: 'Consumer Data Privacy Policy', href: links.consumerData },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  return (
    <footer className="relative z-10 bg-white p-2.5 sm:p-4 lg:p-5">
      <div className="overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,#104584,#04101E)] px-2 pt-2 sm:rounded-[24px] sm:px-3 sm:pt-3 lg:rounded-[30px]">
        <div className="flex flex-col gap-2 lg:gap-10">
          <div className="grid grid-cols-1 gap-3 rounded-[14px] bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0))] px-4 py-8 sm:px-8 sm:py-10 lg:grid-cols-12 lg:rounded-[18px] lg:px-0 lg:py-[52px]">
            <div className="w-full lg:col-start-3 lg:col-end-11">
              <p className="sr-only">Paramount HealthRx</p>
              <div role="img" aria-label="Paramount HealthRx" className="relative mx-auto aspect-[921/251] w-full max-w-[921px]">
                <LazyVideo src="/videos/footer.mp4" poster="/img/footer-poster-1448.webp" disablePictureInPicture
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  style={{ maskImage: wordmarkMask, WebkitMaskImage: wordmarkMask, maskSize: '100% 100%', WebkitMaskSize: '100% 100%', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }} />
              </div>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 sm:px-8 lg:px-16">
            <div className="flex w-full flex-col gap-7 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:flex lg:flex-row lg:flex-wrap lg:gap-10 lg:pb-[38px]">
              <div className="flex w-full min-w-0 flex-col gap-5 md:flex-none lg:flex-1 lg:gap-[30px]">
                <div className="flex flex-col gap-4">
                  <a className="hidden w-fit md:flex" href="#top"><img src="/images/logo-footer.svg" alt="Paramount HealthRx" width="126" height="40" loading="lazy" /></a>
                  <p className="max-w-md text-sm text-white sm:text-base">Precision health optimization backed by science and delivered with care.</p>
                </div>
                <div className="flex flex-col gap-4 sm:gap-6">
                  <a className="flex min-w-0 items-center gap-3 sm:gap-4" href={links.email}>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/25">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><rect x="1.75" y="3.25" width="12.5" height="9.5" rx="2" stroke="white" strokeWidth="1.3" /><path d="M2.5 4.5 8 8.5l5.5-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span className="min-w-0 text-sm font-medium break-all text-white sm:text-base sm:break-normal">support@paramounthealthrx.com</span>
                  </a>
                  <a className="flex items-center gap-3 sm:gap-4" href={links.phone}>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/25">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M5.6 2.2 4 2C2.9 2.2 2 3.2 2.1 4.4c.4 4.9 4.6 9.1 9.5 9.5 1.2.1 2.2-.8 2.4-1.9l-.2-1.6a1 1 0 0 0-.7-.8l-1.8-.6a1 1 0 0 0-1 .3l-.8.9a7.6 7.6 0 0 1-3.3-3.3l.9-.8a1 1 0 0 0 .3-1l-.6-1.8a1 1 0 0 0-.8-.7Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round" /></svg>
                    </span>
                    <span className="text-sm font-medium text-white sm:text-base">(888) 706-3905</span>
                  </a>
                </div>
              </div>

              <div className="flex w-full min-w-0 flex-col gap-6 md:flex-none lg:flex-1 lg:gap-[30px]">
                <p className="text-base font-bold text-neutral-400">Paramount HealthRx</p>
                <ul className="flex flex-col gap-1.5 lg:gap-5">
                  {footerLinks.map((l) => (
                    <li key={l.label} className="text-sm font-medium text-white underline-offset-2 hover:text-sky hover:underline md:text-base"><a href={l.href}>{l.label}</a></li>
                  ))}
                </ul>
              </div>

              <div className="flex w-full min-w-0 flex-col gap-5 md:col-span-2 md:flex-none lg:flex-1 lg:gap-[30px]">
                {/* No newsletter endpoint exists for this page, so the signup opens an email to support with the address filled in. */}
                <form
                  className="flex flex-col gap-5 md:gap-[30px]"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!valid) return
                    window.location.href = `${links.email}?subject=${encodeURIComponent('Newsletter signup')}&body=${encodeURIComponent(`Please add ${email} to the Paramount HealthRx newsletter.`)}`
                  }}
                >
                  <div>
                    <p className="text-lg font-medium text-white sm:text-xl">Receive a newsletter from us!</p>
                    <p className="text-xs font-medium text-neutral-300 md:text-sm">Insights and Support Straight to your inbox</p>
                  </div>
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                      <input id="newsletter-email" type="email" autoComplete="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border-gray-200 bg-white px-5 py-3 text-base text-gray-700 outline-none placeholder:text-[#717680] focus-visible:ring-2 focus-visible:ring-sky" />
                      <button type="submit" disabled={!valid} className={`w-full rounded-full bg-sky px-[34px] py-3 transition-opacity sm:w-auto md:w-full ${valid ? 'cursor-pointer hover:bg-[#1fa4f0]' : 'cursor-not-allowed opacity-60'}`}>
                        <span className="text-base font-semibold text-white">Start Now</span>
                      </button>
                    </div>
                    <p className="text-xs text-white md:text-sm">We care about your data in our <a className="underline underline-offset-2" href={links.privacy}>privacy policy</a>.</p>
                  </div>
                </form>
              </div>
            </div>
            <div className="flex flex-col items-start justify-center gap-4 border-t border-t-white/[0.14] py-5 sm:flex-row sm:items-center lg:py-6">
              <p className="text-xs text-white sm:text-base">© {new Date().getFullYear()} Paramount HealthRx. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


