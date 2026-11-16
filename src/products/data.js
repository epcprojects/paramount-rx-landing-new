// Products page (products-option/): the 54 products listed on paramounthealthrx.com/products, copied as they
// appear there (category, name, strength, form, starting price). Product shots are the live site's form images.

const SITE = 'https://www.paramounthealthrx.com'
export const links = { products: `${SITE}/products`, assessment: `${SITE}/products` }

const media = `${SITE}/_next/static/media`
export const formImage = {
  Vial: `${media}/Vial.70f04fe9.png`,
  Injectable: `${media}/injectable.70f04fe9.png`,
  'Nasal Spray': `${media}/Nasal%20Spray.da1b0de2.png`,
  Troche: `${media}/Troche.444620f7.png`,
  Capsule: `${media}/capsule.826dde57.png`,
  Cream: `${media}/cream.e60f3eec.png`,
  Insert: `${media}/insert.04efc7bb.png`,
  Patch: `${media}/Patch.4c9377af.png`,
  Tablet: `${media}/Tablet.3b18ea01.png`,
  Topical: `${SITE}/images/ParamountProductDemo.png`,
}

// Category cards. `photo` is the background behind each card (base name for <Img>, with its widths).
// These are stand-ins from the project until the category photos are generated.
export const categories = [
  { id: 'all', name: 'All', blurb: 'Every treatment we offer', photo: '/img/steps-bg-1', widths: [800, 1800] },
  { id: 'in-demand', name: 'In Demand', blurb: 'What patients choose most', photo: '/img/runners-duo', widths: [1425, 1920], hot: true },
  { id: 'Hair Loss', name: 'Hair Loss', blurb: 'Stronger hair, greater confidence', photo: '/img/opt5-card-hair-loss', widths: [600, 1000] },
  { id: 'Hormones', name: 'Hormones', blurb: 'Balance that you can feel', photo: '/img/step-plan', widths: [900, 1400] },
  { id: 'Peptides', name: 'Peptides', blurb: 'Recovery, skin and longevity', photo: '/img/opt5-card-peptides', widths: [600, 1000] },
  { id: 'Performance Enhancer', name: 'Performance Enhancer', blurb: 'More energy, more strength', photo: '/img/opt5-card-performance', widths: [600, 1000] },
  { id: 'Sexual Wellness', name: 'Sexual Wellness', blurb: 'Confidence and intimacy', photo: '/img/opt5-card-sexual-health', widths: [600, 1000] },
  { id: 'Testosterone', name: 'Testosterone', blurb: 'Optimize your hormones', photo: '/img/opt5-card-testosterone', widths: [600, 1000] },
  { id: 'Weight Loss', name: 'Weight Loss', blurb: 'Sustainable, lasting results', photo: '/img/opt5-card-weight-loss', widths: [600, 1000] },
]

// [category, name, strength, form, price, in demand]
const rows = [
  ['Weight Loss', 'Lipo-C', '15mg/50mg/mL - 10 mL', 'Vial', 125],
  ['Weight Loss', 'Semaglutide w/B12', '1mg/0.5mg/mL - 1 mL', 'Vial', 90, true],
  ['Sexual Wellness', 'Bremelanotide [PT-141]', '25 mg/mL - 2.5 mL', 'Nasal Spray', 247.5],
  ['Sexual Wellness', 'Bremelanotide [PT-141]', '0.5 mg - 12 Troches', 'Troche', 120],
  ['Peptides', 'Methylene Blue', '20 mg - 30 Capsules', 'Capsule', 145],
  ['Hair Loss', 'Minoxidil/Finasteride', '1mg/1 mg - 30 Capsules', 'Capsule', 97.5],
  ['Hair Loss', 'Minoxidil/Finasteride', '5/0.25% - 30 Grams', 'Topical', 112.5],
  ['Peptides', 'NAD+', '100 mg/mL - 5 mL', 'Injectable', 163.5],
  ['Testosterone', 'Testosterone', '1 mg E4M - 30 Capsules', 'Capsule', 81.25],
  ['Testosterone', 'Testosterone', '2 mg - 30 Troches', 'Troche', 112.5],
  ['Weight Loss', 'Semaglutide w/Glycine', '1mg/0.5mg/mL - 1 mL', 'Vial', 90],
  ['Peptides', 'Glutathione', '200 mg/mL - 30 mL', 'Injectable', 112.5],
  ['Peptides', 'Glutathione', '200 mg/mL - 10 mL', 'Nasal Spray', 112.5],
  ['Peptides', 'Methylcobalamin (Vit B12)', '5 mg/mL - 10 mL', 'Injectable', 112.5],
  ['Hair Loss', 'Minoxidil', '1 mg - 60 Capsules', 'Capsule', 127.5],
  ['Testosterone', 'Testosterone Cypionate in MCT Oil', '25 mg/mL - 4 mL', 'Injectable', 120],
  ['Weight Loss', 'Tirzepatide w/B12', '10mg/0.5 mg/mL - 2 mL', 'Vial', 180],
  ['Peptides', 'Sermorelin Acetate', '1mg/mL - 5 mL', 'Injectable', 135],
  ['Sexual Wellness', 'Sildenafil/Tadalafil/Oxytocin', '50mg/20mg/25U - 12 Troches', 'Troche', 120],
  ['Sexual Wellness', 'PT-141', '2mg/mL - 5 mL', 'Vial', 125],
  ['Weight Loss', 'Tirzepatide w/Glycine', '10mg/0.5 mg/mL - 2 mL', 'Vial', 180],
  ['Hair Loss', 'Minoxidil/Spironolactone', '0.25mg/25 mg - 30 Capsules', 'Capsule', 97.5],
  ['Testosterone', 'Testosterone Cypionate in Cottonseed Oil', '200 mg/mL - 10 mL', 'Injectable', 90, true],
  ['Peptides', 'Tretinoin/Triamcinolone/Hydroquinone', '0.1%/0.1%/8% - 30 Units', 'Cream', 97.5],
  ['Testosterone', 'Bi-Est [Estriol (E3): Estradiol (E2)] 80:20', '1 mg/mL - 30 mL', 'Cream', 97.5],
  ['Peptides', 'GHK-Cu', '5 mg - 30 Troches', 'Troche', 148.5],
  ['Weight Loss', 'Semaglutide (Sublingual)', '1mg/mL - 30 mL', 'Troche', 285],
  ['Weight Loss', 'Lipo-MIC B', '25mg/50mg/mL - 10 mL', 'Vial', 65],
  ['Peptides', 'Clindamycin/Tretinoin', '1.5%/0.025% - 30 Grams', 'Cream', 97.5],
  ['Peptides', 'Kojic Acid/Niacinamide/Tretinoin', '2%/2%/0.05% - 30 Units', 'Cream', 97.5],
  ['Sexual Wellness', 'Tri-Mix (Papaverine/Phentolamine/Alprostadil)', '30mg/1mg/25mcg/mL - 5 mL', 'Injectable', 300],
  ['Sexual Wellness', 'Bi-Mix (Papaverine/Phentolamine)', '30mg/1mg/mL - 5 mL', 'Injectable', 300],
  ['Peptides', 'GHK-Cu/Tretinoin', '0.5%/0.1% - 30 Units', 'Cream', 172.5],
  ['Weight Loss', 'Lipo-Mino with Carnitine 30mL', 'B6 2mg, Methionine 12.4mg, Inositol 25mg, Choline 25mg, B1 50mg, B2 5mg, Cyano 1mg, Carnitine 125mg - 30 mL', 'Injectable', 135],
  ['Testosterone', 'Bi-Est [Estriol (E3): Estradiol (E2)] 80:20 / Testosterone', '1/2 mg/mL - 30 mL', 'Cream', 127.5],
  ['Peptides', 'Clindamycin/Benzoyl Peroxide', '3%/7% - 30 Grams', 'Cream', 97.5],
  ['Peptides', 'Azelaic Acid/Ivermectin/Metronidazole', '15%/1%/1.2% - 60 Grams', 'Cream', 189],
  ['Testosterone', 'Estradiol', '0.01% - 30 Suppositories', 'Insert', 123],
  ['Testosterone', 'Estradiol Patch (2/WK)', '0.025 mg - 1 box (8 per box)', 'Patch', 111.25],
  ['Hair Loss', 'Minoxidil/Arginine/Dutasteride/GHK-Cu with Saw Palmetto', '5%/6%/0.1%/0.5% - 30 Grams', 'Topical', 225],
  ['Sexual Wellness', 'Estriol', '0.10% - 30 Suppositories', 'Insert', 123],
  ['Peptides', 'Azelaic Acid/Niacinamide', '15%/4% - 30 Grams', 'Cream', 97.5],
  ['Testosterone', 'Enclomiphene', '25 mg - 30 Capsules', 'Capsule', 150],
  ['Testosterone', 'Anastrozole', '1 mg - 10 Capsules', 'Tablet', 15],
  ['Testosterone', 'Pregnyl (HCG)', '10,000 IU/10mL - 10 mL', 'Injectable', 375],
  ['Sexual Wellness', 'DHEA with Sodium Hyaluronate', '1% - 30 Grams', 'Cream', 97.5],
  ['Performance Enhancer', 'Oxandrolone', '12.5 mg - 30 Capsules', 'Capsule', 112.5],
  ['Performance Enhancer', 'Stanozolol', '12.5 mg - 30 Capsules', 'Capsule', 93.75],
  ['Sexual Wellness', 'Estriol', '0.05% - 30 Grams', 'Cream', 115.5],
  ['Peptides', 'GHK-Cu', '0.50% - 30 mL', 'Topical', 225],
  ['Hormones', 'Progesterone (C)', '200 mg - 90 Capsules', 'Capsule', 90],
  ['Sexual Wellness', 'Sildenafil (C)', '100 mg - 30 Tablets', 'Tablet', 67.5],
  ['Sexual Wellness', 'Tadalafil (C)', '5 mg - 30 Tablets', 'Tablet', 67.5],
  ['Testosterone', 'Testosterone', '10 mg/mL - 30 mL', 'Cream', 97.5],
]

export const products = rows.map(([category, name, strength, form, price, hot], i) => ({ id: i, category, name, strength, form, price, hot: !!hot }))

export const countFor = (id) => (id === 'all' ? products.length : id === 'in-demand' ? products.filter((p) => p.hot).length : products.filter((p) => p.category === id).length)
