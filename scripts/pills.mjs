// Cuts the Higgsfield pill renders (shot on pure #00FF00) into transparent, trimmed webp sprites
// for the falling-pills FAQ section.  Run: node scripts/pills.mjs
import sharp from 'sharp'
import { readdirSync, mkdirSync } from 'node:fs'

const SRC = 'source-images/pills'
const OUT = 'public/img/pills'
mkdirSync(OUT, { recursive: true })

for (const f of readdirSync(SRC).filter((n) => /^pill-\d+\.png$/.test(n)).sort()) {
  const { data, info } = await sharp(`${SRC}/${f}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const spill = g - Math.max(r, b) // how "green screen" the pixel is
    if (spill > 90) data[i + 3] = 0
    else if (spill > 25) data[i + 3] = Math.round(255 * (1 - (spill - 25) / 65))
    if (spill > 0) data[i + 1] = Math.max(r, b) // despill the edges
  }
  const name = f.replace('.png', '')
  await sharp(data, { raw: info })
    .trim({ threshold: 1 })
    .resize(220, 220, { fit: 'inside' })
    .webp({ quality: 86, alphaQuality: 90 })
    .toFile(`${OUT}/${name}.webp`)
    .then((o) => console.log(name, o.width, o.height, o.size))
}
