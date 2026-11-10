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

const ArrowUpRight = ({ color = 'white' }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path fill={color} d="M14.8222 4.90976C14.6192 4.7215 14.3514 4.61707 14.1233 4.55138C13.8801 4.4813 13.6018 4.43352 13.3153 4.40006C12.741 4.33301 12.0677 4.31625 11.4374 4.32169C10.8037 4.32717 10.1966 4.35533 9.74911 4.38197C9.525 4.39531 9.34003 4.40832 9.21068 4.41804C9.14599 4.4229 9.09516 4.42694 9.06024 4.42978L9.02004 4.43311L9.00936 4.43402L9.00521 4.43438C8.66538 4.46398 8.4139 4.76347 8.4435 5.1033C8.4731 5.44311 8.77304 5.69455 9.11285 5.66497L9.11492 5.66479L9.1239 5.66403L9.16055 5.661C9.19304 5.65835 9.24127 5.65452 9.30321 5.64986C9.42711 5.64056 9.60564 5.62799 9.82253 5.61508C10.2571 5.58921 10.842 5.56218 11.4481 5.55694C12.0578 5.55168 12.6724 5.56868 13.172 5.62702C13.2 5.6303 13.2275 5.63368 13.2544 5.63717L4.50439 14.3872C4.26318 14.6284 4.26318 15.0195 4.50439 15.2607C4.7456 15.5019 5.13667 15.5019 5.37788 15.2607L14.13 6.50862C14.1314 6.52044 14.1328 6.53238 14.1342 6.54444C14.1921 7.03842 14.2094 7.65642 14.2047 8.27406C14.2 8.88783 14.1737 9.4839 14.1485 9.92778C14.1359 10.1493 14.1236 10.3321 14.1145 10.459C14.1099 10.5225 14.1062 10.572 14.1036 10.6053L14.1006 10.643L14.0996 10.655C14.0714 10.9949 14.3241 11.2933 14.664 11.3216C15.0039 11.3499 15.3025 11.0968 15.3307 10.7568L15.331 10.7531L15.3319 10.7422L15.3352 10.7011C15.3379 10.6654 15.3419 10.6135 15.3466 10.5474C15.3561 10.4152 15.3688 10.2264 15.3818 9.99788C15.4077 9.54172 15.435 8.92415 15.4399 8.28355C15.4448 7.64681 15.4278 6.96969 15.3611 6.40067C15.3279 6.11715 15.2803 5.84169 15.2096 5.60361C15.1452 5.38664 15.036 5.10798 14.8222 4.90976Z" />
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
      <span className="t-btn text-gray-950">{children}</span>
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
        <p className="t-lead text-center text-[#143849]">{s.text}</p>
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
          <h2 className="t-h2 text-center text-navy">
            Why Paramount is the<br /> <span className="t-hero-accent font-normal text-[#171717]">Smart Choice</span>
          </h2>
          <p className="t-lead text-center text-neutral-700">Real treatments. Real results. <br />Fast, discreet, and designed for the way you live today.</p>
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
  // pos: horizontal crop on phones/tablets so each photo's subject (who sits right of centre) lands mid-screen
  { title: 'Online Assessment', body: 'Answer clinically relevant questions about your health goals and history.', img: 'step1', pos: '90%' },
  { title: 'Medical Review', body: 'A licensed provider evaluates your data and lab results.', img: 'step2', pos: '86%' },
  { title: 'Personalized Plan', body: 'Receive tailored peptides, hormones, and vitamins designed for you.', img: 'step3', pos: '74%' },
  { title: 'Delivery & Support', body: 'Receive tailored peptides, hormones, and vitamins designed for you', img: 'step4', pos: '78%' },
]

function StepsIntro({ large = false }) {
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="t-h2 text-[#17171766]">Get Started in<br /><span className="text-[#171717]">4 easy steps</span></h2>
        <p className="t-lead text-neutral-700">Simple. Secure. Physician-Guided.</p>
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
    // The dark panel pins; scrolling slides the step list up, fades items by distance from the current one, and
    // cross-fades the background photo + description for the current step. Option 4: on every screen size (it used
    // to be desktop-only, with stacked step photos on phones/tablets). Item height is read live, so it follows the
    // smaller phone titles.
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
  }, { scope: root })

  const jump = (i) => {
    const st = ScrollTrigger.getAll().find((t) => t.trigger === stage.current)
    if (!st) return setActive(i)
    window.scrollTo({ top: st.start + (i / (steps.length - 1)) * (st.end - st.start), behavior: 'smooth' })
  }

  return (
    <section ref={root} className="relative z-10 bg-white">
      {/* phones / tablets: intro (heading, CTA, looping video); the pinned step panel below is shared with desktop */}
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 pt-8 pb-6 md:pt-16 md:pb-8 lg:hidden">
        <div data-appear><StepsIntro /></div>
        <LazyVideo className="h-[200px] w-full rounded-2xl object-cover md:h-[360px]" src="/videos/steps.mp4" />
      </div>

      {/* desktop: intro row (heading, CTA, looping video) above the pinned panel, as on the live site */}
      <div className="mx-auto hidden max-w-6xl items-start justify-between gap-9 bg-white px-8 pt-12 pb-10 lg:flex">
        <div data-appear><StepsIntro large /></div>
        <LazyVideo className="h-[200px] w-[320px] rounded-[20px] object-cover" src="/videos/steps.mp4" />
      </div>

      {/* pinned dark panel with a sliding step list (reference: roveia.com "Trusted by" section) — all screen sizes;
          phones/tablets stack the list above the description and leave room at the top for the floating header */}
      <div ref={stage} className="h-svh px-3 py-3 lg:px-5 lg:py-4">
        <div className="relative isolate flex h-full flex-col items-center justify-center overflow-hidden rounded-[24px] bg-black/65 px-5 lg:rounded-[40px]">
          {steps.map((st, i) => (
            <img key={st.img} src={`/img/steps-bg-${i + 1}-1800.webp`} alt="" aria-hidden loading="lazy" style={{ '--pos': st.pos }}
              className={`absolute inset-0 -z-10 h-full w-full object-cover object-[var(--pos)_center] transition-opacity duration-700 ease-out lg:object-center ${i === active ? 'opacity-100' : 'opacity-0'}`} />
          ))}
          {/* 65% dark overlay over the photo, as in the reference */}
          <div aria-hidden className="absolute inset-0 -z-[5] bg-black/65" />
          <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col gap-4 pt-[96px] pb-6 sm:pt-[112px] sm:pb-10 lg:flex-row lg:justify-between lg:gap-20 lg:p-0">
            {/* step list: the current step sits at ~42% of its area and the list slides up past it */}
            {/* soft fade at the top and bottom of the list area, so step names ease out as they slide past its edges */}
            <div className="relative min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,#000_22%,#000_80%,transparent_100%)] lg:h-full" role="tablist" aria-label="How it works">
              <div ref={list} className="absolute inset-x-0 top-[calc(45%-40px)] will-change-transform lg:top-[calc(42%-56px)]">
                {steps.map((st, i) => (
                  <button key={st.title} type="button" role="tab" aria-selected={i === active} onClick={() => jump(i)}
                    className="flex w-full cursor-pointer flex-col items-start gap-1 py-2 text-left transition-opacity duration-300 hover:!opacity-100"
                    style={{ opacity: i === 0 ? 1 : INACTIVE_OPACITY }}>
                    <span aria-hidden className={`text-xs font-medium tracking-[0.1em] text-white uppercase transition-opacity duration-300 ${i === active ? 'opacity-100' : 'opacity-0'}`}>Step 0{i + 1}</span>
                    <span className="text-[clamp(28px,7.5vw,48px)] leading-[1.2] tracking-[-0.03em] whitespace-nowrap text-[#f4f4f4] lg:text-[clamp(40px,4.2vw,64px)]">{st.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* the current step's description */}
            <div className="flex w-full flex-none flex-col justify-center lg:max-w-[440px] lg:flex-1 lg:self-center">
              <div className="relative min-h-[150px] sm:min-h-[170px] lg:min-h-[220px]" role="tabpanel">
                {steps.map((st, i) => (
                  <div key={st.title} aria-hidden={i !== active}
                    className={`absolute inset-x-0 top-0 flex flex-col items-start gap-5 transition-opacity duration-500 lg:gap-8 ${i === active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                    <p className="t-lead text-white/[0.64]">{st.body}</p>
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

// Option 4: hover previews are on-brand product/doctor shots in the live site's style (generated on Higgsfield,
// sources in source-images/opt4-pillar-*.png); a line icon sits to the left of each pillar title (24 × 24, drawn with the current text colour)
const pillarIcons = {
  // client-supplied icon (filled shapes, so each path draws with fill and no stroke)
  protocols: <g fill="currentColor" stroke="none">
    <path d="M11.4079 22.7539C9.1979 22.7539 6.8799 22.6979 5.2499 22.6029C3.8879 22.5229 2.7809 21.8199 2.0499 20.5679C1.4689 19.5719 1.26088 18.4579 1.26088 17.7459C1.24511 16.4932 1.24974 13.9961 1.25466 11.3375L1.25488 11.2209C1.25788 9.79893 1.26088 8.32793 1.26088 6.96693C1.26088 2.30493 4.19088 1.55994 5.48388 1.45894C5.74488 1.42194 7.61987 1.17293 10.0259 1.27393C10.4399 1.29093 10.7609 1.64094 10.7439 2.05494C10.7269 2.46894 10.3779 2.78993 9.96288 2.77293C7.57188 2.67293 5.6939 2.94493 5.6749 2.94793C5.6569 2.95093 5.63789 2.95294 5.61889 2.95394C4.31489 3.04794 2.75991 3.82093 2.75991 6.96793C2.75991 8.32993 2.7569 9.80194 2.7539 11.2249L2.75302 11.6952C2.74828 14.2138 2.7439 16.5411 2.75991 17.7369C2.75991 18.4239 3.19688 20.9809 5.33588 21.1059C8.40288 21.2839 13.9279 21.3239 16.4549 21.1069C16.4582 21.1069 16.4615 21.1067 16.4649 21.1064L16.4759 21.1049C16.4989 21.1039 18.7669 20.9489 19.0269 18.7109C19.2879 16.4659 19.2699 14.8279 19.2629 14.2109C19.2629 14.1652 19.2622 14.1248 19.2617 14.0897C19.2613 14.0627 19.2609 14.0388 19.2609 14.0179C19.2609 13.6039 19.5969 13.2679 20.0109 13.2679C20.4249 13.2679 20.7609 13.6039 20.7609 14.0179C20.7609 14.0619 20.7609 14.1209 20.7629 14.1939L20.763 14.203C20.7701 14.8528 20.7886 16.5558 20.5169 18.8839C20.1949 21.6569 17.8029 22.5269 16.5729 22.6009C15.3389 22.7059 13.4169 22.7519 11.4069 22.7519L11.4079 22.7539Z" />
    <path d="M15.9802 9.26892H15.9412C15.6712 9.25492 15.4292 9.09694 15.3092 8.85494C14.8762 7.98794 14.4542 7.55393 14.4492 7.54993C14.1562 7.25693 14.1562 6.78194 14.4492 6.48895C14.7422 6.19594 15.2172 6.19594 15.5102 6.48895C15.5462 6.52494 15.7572 6.74192 16.0372 7.14292C16.6882 6.29992 17.7072 5.17494 18.7302 4.81194C19.1202 4.67394 19.5492 4.87792 19.6872 5.26792C19.8252 5.65792 19.6212 6.08693 19.2312 6.22493C18.3812 6.52593 17.1742 8.03793 16.6132 8.91993C16.4752 9.13693 16.2362 9.26792 15.9802 9.26792V9.26892Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M11.2402 7.01904C11.2402 10.19 13.8223 12.769 16.9953 12.769C20.1683 12.769 22.7502 10.19 22.7502 7.01904C22.7502 3.84804 20.1683 1.26904 16.9953 1.26904C13.8223 1.26904 11.2402 3.84804 11.2402 7.01904ZM12.7402 7.01904C12.7402 4.67604 14.6493 2.76904 16.9953 2.76904C19.3413 2.76904 21.2502 4.67604 21.2502 7.01904C21.2502 9.36204 19.3413 11.269 16.9953 11.269C14.6493 11.269 12.7402 9.36204 12.7402 7.01904Z" />
    <path d="M10.98 13.769H6.97998C6.56598 13.769 6.22998 13.433 6.22998 13.019C6.22998 12.605 6.56598 12.269 6.97998 12.269H10.98C11.394 12.269 11.73 12.605 11.73 13.019C11.73 13.433 11.394 13.769 10.98 13.769Z" />
    <path d="M6.97998 17.769H14.98C15.394 17.769 15.73 17.433 15.73 17.019C15.73 16.605 15.394 16.269 14.98 16.269H6.97998C6.56598 16.269 6.22998 16.605 6.22998 17.019C6.22998 17.433 6.56598 17.769 6.97998 17.769Z" />
  </g>,
  // client-supplied icon (filled)
  labs: <g fill="currentColor" stroke="none">
    <path d="M8.03421 16.2608C7.89127 15.7274 8.20785 15.179 8.74132 15.0361L8.74999 15.0338C9.28346 14.8908 9.8318 15.2074 9.97474 15.7409C10.1177 16.2744 9.8011 16.8227 9.26763 16.9656L9.25895 16.968C8.72549 17.1109 8.17715 16.7943 8.03421 16.2608Z" />
    <path d="M14.7413 17.0361C14.2079 17.179 13.8913 17.7274 14.0342 18.2608C14.1772 18.7943 14.7255 19.1109 15.259 18.968L15.2676 18.9656C15.8011 18.8227 16.1177 18.2744 15.9747 17.7409C15.8318 17.2074 15.2835 16.8908 14.75 17.0338L14.7413 17.0361Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M7.25 2C7.25 1.58579 7.58579 1.25 8 1.25H16C16.4142 1.25 16.75 1.58579 16.75 2C16.75 2.41421 16.4142 2.75 16 2.75H15.2906V4.48622C15.2906 6.27061 15.2959 7.03487 15.4813 7.76179C15.6668 8.48908 16.0292 9.16585 16.8855 10.7387L18.0547 12.8864C19.0959 14.7989 19.919 16.3109 20.363 17.527C20.8148 18.7646 20.9502 19.8964 20.3352 20.917L20.3336 20.9198L20.32 20.942L20.3183 20.9449C19.6971 21.9559 18.6277 22.3696 17.3116 22.5612C16.0148 22.75 14.2735 22.75 12.0664 22.75H11.9337C9.72671 22.75 7.98537 22.75 6.68858 22.5612C5.37244 22.3696 4.30309 21.9559 3.68186 20.9449L3.68015 20.9421L3.66659 20.9198L3.66491 20.917C3.05 19.8964 3.18533 18.7646 3.63716 17.527C4.08115 16.3109 4.9043 14.7989 5.94549 12.8864L6.77548 11.3618C6.80394 11.2554 6.85637 11.1537 6.93335 11.0649C6.93667 11.0611 6.94 11.0572 6.94333 11.0534L7.11466 10.7387C7.97093 9.16585 8.33333 8.48908 8.51883 7.76179C8.70423 7.03487 8.70955 6.27061 8.70955 4.48622V2.75H8C7.58579 2.75 7.25 2.41421 7.25 2ZM8.16411 11.9482L7.29545 13.5438C6.21455 15.5293 5.44713 16.9432 5.0462 18.0414C4.64886 19.1298 4.68778 19.7071 4.949 20.1417L4.94974 20.1429L4.95989 20.1596L4.96063 20.1608C5.22915 20.5969 5.73633 20.9067 6.90473 21.0769C8.08058 21.2481 9.71215 21.25 12.0001 21.25C14.288 21.25 15.9196 21.2481 17.0954 21.0769C18.2638 20.9067 18.771 20.5969 19.0395 20.1609L19.0403 20.1596L19.0504 20.1429L19.0512 20.1416C19.3124 19.7071 19.3513 19.1297 18.954 18.0414C18.553 16.9432 17.7856 15.5293 16.7047 13.5438L16.389 12.9639C16.0714 13.239 15.6802 13.4685 15.2152 13.6078C14.2211 13.9055 13.0083 13.7565 11.6285 12.9696C10.6589 12.4167 9.87171 11.9934 9.22273 11.8239C8.90986 11.7421 8.68109 11.7347 8.512 11.7702C8.39272 11.7953 8.27847 11.8464 8.16411 11.9482ZM15.639 11.5862C15.4442 11.8357 15.159 12.0588 14.7849 12.1709C14.279 12.3223 13.4917 12.3054 12.3715 11.6666C11.4405 11.1357 10.4777 10.6014 9.60185 10.3726C9.42854 10.3273 9.25109 10.2918 9.07145 10.2709C9.514 9.43022 9.8013 8.80293 9.9723 8.1325C10.2097 7.20158 10.2097 6.23943 10.2096 4.59414L10.2096 2.75H13.7906L13.7906 4.59415C13.7905 6.23942 13.7904 7.20159 14.0279 8.1325C14.2652 9.06308 14.7266 9.91056 15.5163 11.3608L15.639 11.5862Z" />
  </g>,
  // client-supplied icon (filled)
  pharmacy: <g fill="currentColor" stroke="none">
    <path d="M21.128 3.63568C19.8448 1.36103 16.9872 0.567845 14.7461 1.89212L4.57618 7.90139C2.34557 9.21943 1.59407 12.1233 2.87172 14.3881C3.64288 15.7551 4.9828 16.5881 6.41788 16.7459C6.82961 16.7912 7.20009 16.4941 7.24537 16.0824C7.29065 15.6707 6.99358 15.3002 6.58184 15.2549C5.61604 15.1487 4.70682 14.5882 4.17817 13.6511C3.29396 12.0837 3.82541 10.0873 5.33925 9.19279L9.77944 6.56914L10.8547 8.3829C11.066 8.7392 11.526 8.8568 11.8823 8.64557C12.2386 8.43434 12.3562 7.97426 12.145 7.61795L11.0708 5.80607L15.5092 3.18352C17.0124 2.29524 18.9429 2.81508 19.8216 4.37268C20.5299 5.62833 20.3308 7.16724 19.4359 8.18825C19.1628 8.49974 19.194 8.97359 19.5055 9.24662C19.817 9.51966 20.2908 9.48848 20.5639 9.17699C21.869 7.68801 22.1565 5.45881 21.128 3.63568Z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M20.8429 12.6245C18.9789 9.396 14.8507 8.28985 11.6222 10.1538C8.39375 12.0178 7.28759 16.146 9.15155 19.3745C11.0155 22.603 15.1437 23.7091 18.3722 21.8451C21.6007 19.9812 22.7069 15.853 20.8429 12.6245ZM12.3722 11.4528C14.6627 10.1304 17.5355 10.7301 19.1228 12.7515L10.1216 17.9484C9.16469 15.5631 10.0817 12.7753 12.3722 11.4528ZM10.8716 19.2474L19.8728 14.0506C20.8298 16.4359 19.9127 19.2237 17.6222 20.5461C15.3317 21.8685 12.4589 21.2688 10.8716 19.2474Z" />
  </g>,
  // client-supplied icon (filled)
  monitoring: <path fill="currentColor" stroke="none" fillRule="evenodd" clipRule="evenodd" d="M12.5836 3.46861C14.1991 2.25537 16.8734 1.52662 19.8543 3.35515C21.9156 4.61952 23.0754 7.2606 22.6684 10.2951C22.2595 13.3443 20.2859 16.7929 16.1063 19.8865L16.0022 19.9635C14.5509 21.0384 13.5897 21.7503 11.9996 21.7503C10.4096 21.7503 9.44837 21.0384 7.997 19.9635L7.89295 19.8865C3.71334 16.7929 1.73976 13.3443 1.33081 10.2951C0.923824 7.2606 2.08366 4.61952 4.1449 3.35515C7.12587 1.52662 9.8001 2.25537 11.4156 3.46861C11.6814 3.6682 11.8638 3.8048 11.9996 3.89704C12.1354 3.8048 12.3178 3.6682 12.5836 3.46861ZM12.1584 3.99456C12.1583 3.99455 12.1577 3.99428 12.1564 3.99369L12.155 3.99305C12.1574 3.99401 12.1585 3.99457 12.1584 3.99456ZM11.8443 3.99305C11.8402 3.99467 11.8397 3.99514 11.8429 3.99369L11.8443 3.99305ZM19.07 4.63377C16.6877 3.17245 14.6809 3.76948 13.4843 4.66804L13.4635 4.68372C13.1931 4.88678 12.9608 5.06125 12.775 5.18287C12.6784 5.24609 12.5715 5.31047 12.4605 5.36061C12.3552 5.4082 12.1934 5.46774 11.9996 5.46774C11.8058 5.46774 11.644 5.4082 11.5387 5.36061C11.4277 5.31047 11.3208 5.24609 11.2242 5.18287C11.0384 5.06125 10.8062 4.88684 10.5358 4.68379L10.5149 4.66804C9.31836 3.76948 7.31152 3.17245 4.9292 4.63377C3.47107 5.52819 2.47304 7.52746 2.8175 10.0957C2.82514 10.1527 2.83345 10.21 2.84244 10.2675C2.89316 10.2567 2.94577 10.251 2.99971 10.251L5.0989 10.2509C5.56733 10.2502 5.98012 10.2496 6.35457 10.3859C6.88124 10.5775 7.24927 11.0249 7.46807 11.2909C7.48607 11.3128 7.50327 11.3337 7.51925 11.3529C7.53078 11.3667 7.54181 11.381 7.55231 11.3956L8.44355 12.6368L10.8566 8.61511C10.995 8.3844 11.2464 8.24552 11.5154 8.25114C11.7844 8.25676 12.0297 8.40604 12.1584 8.64232L13.8385 11.728C14.0619 12.0848 14.0898 12.1094 14.1134 12.1275C14.1854 12.1828 14.2718 12.2175 14.41 12.236C14.5397 12.2533 14.6664 12.2526 14.8472 12.2515C14.894 12.2513 14.9446 12.251 14.9997 12.251H15.9997C16.4139 12.251 16.7497 12.5868 16.7497 13.001C16.7497 13.4152 16.4139 13.751 15.9997 13.751H14.9997C14.9647 13.751 14.9255 13.7516 14.8827 13.7524C14.4892 13.7591 13.7906 13.771 13.1997 13.3172C12.933 13.1123 12.7602 12.8344 12.5935 12.5664L12.5547 12.504C12.5467 12.4913 12.5392 12.4784 12.532 12.4652L11.4681 10.5113L9.14283 14.3868C9.01293 14.6033 8.78283 14.74 8.53056 14.7503C8.2783 14.7607 8.03774 14.6435 7.89049 14.4384L6.34975 12.2926C6.06044 11.9463 5.94753 11.834 5.84176 11.7955C5.74928 11.7618 5.62592 11.751 4.99971 11.751H3.21239C3.95694 13.9338 5.66419 16.3707 8.78534 18.6808C10.3675 19.8519 10.945 20.2503 11.9996 20.2503C13.0542 20.2503 13.6317 19.8519 15.2139 18.6808C19.1521 15.7659 20.8392 12.6493 21.1817 10.0957C21.5262 7.52746 20.5282 5.52819 19.07 4.63377Z" />,
}
function PillarIcon({ name }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {pillarIcons[name]}
    </svg>
  )
}

const pillars = [
  {
    icon: 'protocols', title: 'Individualized protocols', thumb: 'pillar-protocols', preview: '/img/opt4-pillar-protocols-600.webp',
    body: 'Care begins with your health history, your goals and a licensed provider’s clinical evaluation—no one-size-fits-all plans.',
    chips: ['Health history', 'Your goals', 'Clinical evaluation'],
  },
  {
    icon: 'labs', title: 'Real labs, real doctors', thumb: 'pillar-labs', preview: '/img/opt4-pillar-labs-600.webp',
    body: 'Hormones and many peptides require lab work to ensure safety and efficacy—reviewed by licensed providers.',
    chips: ['Lab work', 'Licensed providers', 'Safety first'],
  },
  {
    icon: 'pharmacy', title: 'Compounded by licensed pharmacies', thumb: 'pillar-pharmacy', preview: '/img/opt4-pillar-pharmacy-600.webp',
    body: 'Every treatment is prescribed by licensed providers, compounded by licensed pharmacies and fulfilled in the U.S.',
    chips: ['U.S. pharmacies', 'Prescribed by providers', 'Discreet delivery'],
  },
  {
    icon: 'monitoring', title: 'Continuous monitoring & refinement', thumb: 'pillar-monitoring', preview: '/img/opt4-pillar-monitoring-600.webp',
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
            <h2 className="t-h2 text-gray-950">
              This isn&apos;t wellness.<br />
              This is{' '}
              <span className="t-hero-accent relative inline-block font-normal text-navy transition-colors duration-300 ease-out after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-navy after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100">
                medicine-done right.
              </span>
            </h2>
            <p className="t-lead max-w-[900px] text-gray-500">
              Paramount HealthRx was built to deliver integrated, physician-guided<br className="hidden lg:block" /> optimization—not isolated products. Because average isn&apos;t the goal.
            </p>
          </div>
          <a href={links.products} className="group/btn flex items-center gap-2 rounded-full border border-transparent bg-navy py-2 pr-2 pl-4 transition-colors duration-300 hover:bg-[#0c3a6f] md:gap-3 md:pl-[26px]">
            <span className="t-btn text-white">Explore Treatments</span>
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
                <div className="flex min-w-0 items-start gap-4 lg:gap-6">
                  <span className={`flex size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 lg:size-12 ${dim ? 'bg-[#eef5fd] text-navy lg:bg-gray-100 lg:text-gray-300' : on ? 'bg-navy text-white' : 'bg-[#eef5fd] text-navy'}`}>
                    <PillarIcon name={p.icon} />
                  </span>
                  <div className="flex min-w-0 flex-col gap-1 self-center lg:gap-2">
                    <h3 className={`t-h3 transition-colors duration-300 ${dim ? 'text-gray-950 lg:text-gray-300' : 'text-gray-950'}`}>{p.title}</h3>
                    <div className={`hidden transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:grid ${on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <p className="t-lead max-w-xl pt-1 text-gray-500">{p.body}</p>
                        <div className="flex flex-wrap gap-2 pt-3">
                          {p.chips.map((c) => <span key={c} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600 lg:text-base">{c}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Option 4: arrow at the end of each row, same shape as the Explore Treatments button — fills navy and
                    turns 45° on the hovered row, greys out with the others */}
                <span aria-hidden className={`flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 lg:size-12 ${on ? 'border-navy bg-navy' : dim ? 'border-gray-200 bg-white lg:opacity-40' : 'border-gray-200 bg-white'}`}>
                  <span className={`transition-transform duration-300 ${on ? 'rotate-45' : ''}`}>
                    <ArrowUpRight color={on ? '#ffffff' : '#104584'} />
                  </span>
                </span>
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
        <h2 className={`t-h2 ${light ? "text-white" : "text-ink"}`}>
          Your biology<br className="hidden lg:block" /> is unique.
        </h2>
      </div>
      <div className="flex flex-col items-start gap-7 lg:pt-8">
        <p className={`t-lead max-w-[500px] ${light ? "text-white/85" : "text-ink/80"}`}>
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

  useGSAP(() => appear(root.current), { scope: root })

  return (
    <section ref={root} className="relative z-10 bg-white">
      {/* phones / tablets: header + all three cards open */}
      <div className="relative isolate mx-3 my-8 flex flex-col gap-10 overflow-hidden rounded-[24px] px-4 py-10 md:py-12 lg:hidden">
        <img src="/img/biology-bg-900.webp" alt="" aria-hidden loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-black/45" />
        <div data-appear><BiologyHeader light /></div>
        <div className="flex flex-col gap-3">
          {/* Option 4: same dark glass cards as the desktop layout (they used to be solid colour blocks here) */}
          {families.map((f) => (
            <a key={f.name} href={links.products} data-appear className="relative flex flex-col gap-4 overflow-hidden rounded-[20px] bg-[rgba(6,12,14,0.55)] px-6 py-6 text-white backdrop-blur-md md:px-7">
              <span className="flex items-center gap-4"><FamilyIcon icon={f.icon} color={f.fill} /><h3 className="t-h3">{f.name}</h3></span>
              <p className="t-body text-white/70">{f.body}</p>
              <span className="t-small underline underline-offset-4 opacity-85">Learn more about {f.name.toLowerCase()}</span>
            </a>
          ))}
        </div>
      </div>

      {/* desktop: pinned stage over the swimmer photo; a tint layer shifts toward the current card's colour */}
      {/* Option 4: more white space above/below the panel and more room inside it, top and bottom */}
      <div ref={stage} className="hidden px-5 py-12 lg:block xl:py-16">
        {/* rounded panel inside a 20px side frame, matching the "4 easy steps" panel */}
        <div className="relative isolate flex h-svh min-h-[700px] flex-col justify-between overflow-hidden rounded-[40px] pt-[clamp(120px,15vh,160px)] pb-[clamp(56px,9vh,96px)]">
        <img src="/img/biology-bg-1800.webp" srcSet="/img/biology-bg-900.webp 900w, /img/biology-bg-1800.webp 1800w" sizes="100vw" alt="" aria-hidden loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 opacity-30 mix-blend-multiply" style={{ backgroundColor: families[0].fill }} />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.55),rgba(0,0,0,0.25)_45%,rgba(0,0,0,0.45))]" />
        <div className="mx-auto w-full max-w-[1336px] px-10" data-appear><BiologyHeader light /></div>
        <div className="mx-auto flex w-full max-w-[1336px] items-stretch gap-4 px-10">
          {families.map((f) => (
            <div key={f.name}
              className="relative min-w-0 basis-0 flex-grow overflow-hidden rounded-[26px] bg-[rgba(6,12,14,0.45)] text-white bio-glass bio-glass--no-rim"
              style={{ height: 242, '--glass': 1 }}>
              <div className="flex h-full flex-col px-6 pt-[30px]">
                <span className="flex items-center gap-5"><FamilyIcon icon={f.icon} color={f.fill} /><h3 className="t-h3 whitespace-nowrap">{f.name}</h3></span>
                <div className="mt-1.5 flex max-w-[440px] flex-col items-start gap-5 pl-16">
                  <p className="t-body opacity-70">{f.body}</p>
                  <a href={links.products} className="t-small underline underline-offset-4 opacity-85 transition-opacity hover:opacity-100">Learn more about {f.name.toLowerCase()}</a>
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
        <h2 data-appear className="t-h2 text-neutral-900">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 items-center gap-6 xl:grid-cols-2 xl:gap-16">
          <div data-appear className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = open === i
              return (
                <div key={f.q} className="border-b border-b-gray-200 last:border-b-0">
                  <button type="button" aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? -1 : i)} className="group w-full cursor-pointer py-3 text-left md:py-5">
                    <span className="flex items-center justify-between gap-4">
                      <h3 className="t-h3 text-black">{f.q}</h3>
                      <span className={`flex size-5 shrink-0 items-center justify-center transition-[color,transform] duration-300 group-hover:text-sky ${isOpen ? 'rotate-90 text-sky' : 'text-[#1F252E]'}`}>
                        <svg width="18" height="18" viewBox="0 0 10 9" fill="none" aria-hidden><path fill="currentColor" d="M9.82143 4.73214L5.89286 8.48214C5.66964 8.68304 5.33482 8.68304 5.13393 8.45982C4.93304 8.23661 4.93304 7.90179 5.15625 7.70089L8.125 4.86607H0.535714C0.223214 4.86607 0 4.64286 0 4.33036C0 4.04018 0.223214 3.79464 0.535714 3.79464H8.125L5.15625 0.982143C4.93304 0.78125 4.93304 0.424107 5.13393 0.223214C5.33482 6.70552e-08 5.69196 6.70552e-08 5.89286 0.200893L9.82143 3.95089C9.93304 4.0625 10 4.19643 10 4.33036C10 4.48661 9.93304 4.62054 9.82143 4.73214Z" /></svg>
                      </span>
                    </span>
                  </button>
                  <div id={`faq-${i}`} role="region" className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="t-lead pb-3 text-neutral-700 md:pb-5">{f.a}</p>
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
// Option 4: an inline SVG clip path (not a data-URI mask image) so the words use the page's own Manrope ExtraBold —
// an SVG loaded as an image can't reach web fonts and was falling back to Arial. Drawn in a 1100 × 300 box and
// scaled to the video's bounding box, like the old 100% × 100% mask.
function WordmarkClip() {
  const word = { fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 175, letterSpacing: -7 }
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <clipPath id="footer-wordmark" clipPathUnits="objectBoundingBox">
          {/* (a clipPath can't contain <g>, so each line carries the 1100 × 300 → bounding-box scale itself) */}
          <text x="0" y="125" transform="scale(0.000909091 0.003333333)" style={word}>Paramount</text>
          <text x="0" y="290" transform="scale(0.000909091 0.003333333)" style={word}>HealthRx</text>
        </clipPath>
      </defs>
    </svg>
  )
}

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
                <WordmarkClip />
                <LazyVideo src="/videos/footer.mp4" poster="/img/footer-poster-1448.webp" disablePictureInPicture
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  style={{ clipPath: 'url(#footer-wordmark)', WebkitClipPath: 'url(#footer-wordmark)' }} />
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


