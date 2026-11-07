export function Arrow({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={`h-3.5 w-3.5 ${className}`} fill="currentColor">
      {/* arrow-up-right-01 (client-supplied icon) */}
      <path d="M14.8222 4.90978C14.6192 4.72151 14.3514 4.61709 14.1233 4.5514C13.8801 4.48132 13.6018 4.43354 13.3153 4.40008C12.741 4.33302 12.0677 4.31627 11.4374 4.32171C10.8037 4.32718 10.1966 4.35534 9.74911 4.38198C9.525 4.39532 9.34003 4.40834 9.21068 4.41806C9.14599 4.42291 9.09516 4.42695 9.06024 4.4298L9.02004 4.43313L9.00936 4.43403L9.00521 4.43439C8.66538 4.464 8.4139 4.76348 8.4435 5.10331C8.4731 5.44312 8.77304 5.69456 9.11285 5.66499L9.11492 5.66481L9.1239 5.66405L9.16055 5.66101C9.19304 5.65836 9.24127 5.65453 9.30321 5.64988C9.42711 5.64057 9.60564 5.628 9.82253 5.61509C10.2571 5.58922 10.842 5.56219 11.4481 5.55696C12.0578 5.55169 12.6724 5.5687 13.172 5.62703C13.2 5.63031 13.2275 5.63369 13.2544 5.63718L4.50439 14.3872C4.26318 14.6284 4.26318 15.0195 4.50439 15.2607C4.7456 15.5019 5.13667 15.5019 5.37788 15.2607L14.13 6.50864C14.1314 6.52046 14.1328 6.5324 14.1342 6.54446C14.1921 7.03843 14.2094 7.65644 14.2047 8.27407C14.2 8.88785 14.1737 9.48392 14.1485 9.92779C14.1359 10.1493 14.1236 10.3321 14.1145 10.459C14.1099 10.5225 14.1062 10.572 14.1036 10.6054L14.1006 10.643L14.0996 10.655C14.0714 10.9949 14.3241 11.2934 14.664 11.3216C15.0039 11.3499 15.3025 11.0968 15.3307 10.7569L15.331 10.7531L15.3319 10.7422L15.3352 10.7011C15.3379 10.6655 15.3419 10.6135 15.3466 10.5474C15.3561 10.4153 15.3688 10.2264 15.3818 9.9979C15.4077 9.54173 15.435 8.92416 15.4399 8.28356C15.4448 7.64682 15.4278 6.96971 15.3611 6.40068C15.3279 6.11717 15.2803 5.84171 15.2096 5.60363C15.1452 5.38666 15.036 5.10799 14.8222 4.90978Z" />
    </svg>
  )
}

/** Medora CTA pill (measured): 46px tall, 30px radius, padding 4/4/4/16, 18px label, white arrow chip. */
export function Cta({ href, children, className = '', variant = 'solid', size = 'md', ...rest }) {
  const look = variant === 'glass' ? 'cta-glass' : variant === 'white' ? 'bg-white text-ink transition-colors duration-300' : variant === 'black' ? 'bg-ink text-white transition-colors duration-300' : 'bg-sky text-ink transition-colors duration-300 hover:bg-[#6cc8ff]'
  const lg = size === 'lg'
  const box = lg ? `h-14 gap-3 pl-5 pr-1.5 text-[19px] font-medium ${variant === 'glass' ? 'cta-lg' : ''}` : 'h-[46px] gap-3 pl-4 pr-1 text-[18px]'
  const chip = lg ? 'h-11 w-11' : 'h-[38px] w-[38px]'
  const chipTone = variant === 'white' ? 'bg-ink text-white' : variant === 'black' ? 'bg-white text-ink' : 'bg-white text-navy'
  return (
    <a
      href={href}
      className={`group inline-flex items-center rounded-full py-1 leading-none tracking-[-0.02em] ${box} ${look} ${className}`}
      {...rest}
    >
      {children}
      <span className={`grid ${chip} place-items-center overflow-hidden rounded-full ${chipTone}`}>
        <span className="relative block h-5 w-5">
          <Arrow className="absolute inset-0 !h-5 !w-5 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-5 group-hover:-translate-y-5" />
          <Arrow className="absolute inset-0 !h-5 !w-5 -translate-x-5 translate-y-5 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0 group-hover:translate-y-0" />
        </span>
      </span>
    </a>
  )
}

/** Small tag with the accent dot ("• WHO WE ARE"). */
export function Tag({ children, light = false, pill = false, dot = true, className = '', ...rest }) {
  return (
    <p
      className={`inline-flex items-center gap-2 ${pill ? 'rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[14px] backdrop-blur-md' : 't-tag'} ${light ? 'text-white/90' : 'text-ink'} ${className}`}
      {...rest}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-sky" aria-hidden />}
      {children}
    </p>
  )
}

/** <img> with srcset from scripts/images.mjs output (base = '/img/name'). */
export function Img({ base, widths = [900, 1400], sizes = '100vw', alt = '', className = '', ...rest }) {
  const srcSet = widths.map((w) => `${base}-${w}.webp ${w}w`).join(', ')
  return <img src={`${base}-${widths[widths.length - 1]}.webp`} srcSet={srcSet} sizes={sizes} alt={alt} className={className} decoding="async" {...rest} />
}

