// Treatment catalogue and categories for the "Every treatment, mapped to the body" section.
// Copied from the Paramount products prototype (paramountmodel.vercel.app) — names, strengths, forms and starting prices.

const icon = {
  inDemand: '/images/categories/InDemandCategoryImage.png',
  generic: '/images/categories/GenericCategoryImage.png',
  peptide: '/images/categories/PeptideCategoryImage.png',
  sexual: '/images/categories/SexualWellnessCategoryImage.png',
}

export const categories = [
  { id: 'all', label: 'All', icon: null, blurb: 'Every treatment we offer, prescribed by licensed providers and compounded by U.S. pharmacies.' },
  { id: 'in-demand', label: 'In Demand', icon: icon.inDemand, blurb: 'The treatments our patients ask about most right now.' },
  { id: 'hair-loss', label: 'Hair Loss', icon: icon.generic, blurb: 'Oral and topical options your provider may consider for thinning hair.' },
  { id: 'hormones', label: 'Hormones', icon: icon.generic, blurb: 'Precision-dosed hormone therapy, medically supervised and adjusted to your labs.' },
  { id: 'peptides', label: 'Peptides', icon: icon.peptide, blurb: 'Peptides and supporting compounds used across a range of wellness protocols.' },
  { id: 'performance-enhancer', label: 'Performance Enhancer', icon: icon.generic, blurb: 'Protocols built around training, recovery and physical performance.' },
  { id: 'sexual-wellness', label: 'Sexual Wellness', icon: icon.sexual, blurb: 'Discreet, physician-guided options for sexual health.' },
  { id: 'testosterone', label: 'Testosterone', icon: icon.generic, blurb: 'Testosterone therapy guided by real labs and ongoing monitoring.' },
  { id: 'weight-loss', label: 'Weight Loss', icon: icon.peptide, blurb: 'Clinician-guided weight management programs. Results vary by individual.' },
]

export const category = (id) => categories.find((c) => c.id === id)

export const treatments = [
  { name: 'Lipo-C', category: 'weight-loss', strength: '15mg/50mg/mL - 10 mL', form: 'Vial', price: 125 },
  { name: 'Semaglutide w/B12', category: 'weight-loss', strength: '1mg/0.5mg/mL - 1 mL', form: 'Vial', price: 90, inDemand: true },
  { name: 'Bremelanotide [PT-141]', category: 'sexual-wellness', strength: '25 mg/mL - 2.5 mL', form: 'Nasal Spray', price: 247.5 },
  { name: 'Bremelanotide [PT-141]', category: 'sexual-wellness', strength: '0.5 mg - 12 Troches', form: 'Troche', price: 120 },
  { name: 'Methylene Blue', category: 'peptides', strength: '20 mg - 30 Capsules', form: 'Capsule', price: 145 },
  { name: 'Minoxidil/Finasteride', category: 'hair-loss', strength: '1mg/1 mg - 30 Capsules', form: 'Capsule', price: 97.5 },
  { name: 'Minoxidil/Finasteride', category: 'hair-loss', strength: '5/0.25% - 30 Grams', form: 'Topical', price: 112.5 },
  { name: 'NAD+', category: 'peptides', strength: '100 mg/mL - 5 mL', form: 'Injectable', price: 163.5 },
  { name: 'Semaglutide w/Glycine', category: 'weight-loss', strength: '1mg/0.5mg/mL - 1 mL', form: 'Vial', price: 90 },
  { name: 'Glutathione', category: 'peptides', strength: '200 mg/mL - 30 mL', form: 'Injectable', price: 112.5 },
  { name: 'Glutathione', category: 'peptides', strength: '200 mg/mL - 10 mL', form: 'Nasal Spray', price: 112.5 },
  { name: 'Methylcobalamin (Vit B12)', category: 'peptides', strength: '5 mg/mL - 10 mL', form: 'Injectable', price: 112.5 },
  { name: 'Minoxidil', category: 'hair-loss', strength: '1 mg - 60 Capsules', form: 'Capsule', price: 127.5 },
  { name: 'Tirzepatide w/B12', category: 'weight-loss', strength: '10mg/0.5 mg/mL - 2 mL', form: 'Vial', price: 180 },
  { name: 'Sermorelin Acetate', category: 'peptides', strength: '1mg/mL - 5 mL', form: 'Injectable', price: 135 },
  { name: 'Sildenafil/Tadalafil/Oxytocin', category: 'sexual-wellness', strength: '50mg/20mg/25U - 12 Troches', form: 'Troche', price: 120 },
  { name: 'PT-141', category: 'sexual-wellness', strength: '2mg/mL - 5 mL', form: 'Vial', price: 125 },
  { name: 'Tirzepatide w/Glycine', category: 'weight-loss', strength: '10mg/0.5 mg/mL - 2 mL', form: 'Vial', price: 180 },
  { name: 'Minoxidil/Spironolactone', category: 'hair-loss', strength: '0.25mg/25 mg - 30 Capsules', form: 'Capsule', price: 97.5 },
  { name: 'Tretinoin/Triamcinolone/Hydroquinone', category: 'peptides', strength: '0.1%/0.1%/8% - 30 Units', form: 'Cream', price: 97.5 },
  { name: 'GHK-Cu', category: 'peptides', strength: '5 mg - 30 Troches', form: 'Troche', price: 148.5 },
  { name: 'Semaglutide (Sublingual)', category: 'weight-loss', strength: '1mg/mL - 30 mL', form: 'Troche', price: 285 },
  { name: 'Lipo-MIC B', category: 'weight-loss', strength: '25mg/50mg/mL - 10 mL', form: 'Vial', price: 65 },
  { name: 'Clindamycin/Tretinoin', category: 'peptides', strength: '1.5%/0.025% - 30 Grams', form: 'Cream', price: 97.5 },
  { name: 'Kojic Acid/Niacinamide/Tretinoin', category: 'peptides', strength: '2%/2%/0.05% - 30 Units', form: 'Cream', price: 97.5 },
  { name: 'Tri-Mix (Papaverine/Phentolamine/Alprostadil)', category: 'sexual-wellness', strength: '30mg/1mg/25mcg/mL - 5 mL', form: 'Injectable', price: 300 },
  { name: 'Bi-Mix (Papaverine/Phentolamine)', category: 'sexual-wellness', strength: '30mg/1mg/mL - 5 mL', form: 'Injectable', price: 300 },
  { name: 'GHK-Cu/Tretinoin', category: 'peptides', strength: '0.5%/0.1% - 30 Units', form: 'Cream', price: 172.5 },
  { name: 'Lipo-Mino with Carnitine 30mL', category: 'weight-loss', strength: 'B6 2mg, Methionine 12.4mg, Inositol 25mg, Choline 25mg, B1 50mg, B2 5mg, Cyano 1mg, Carnitine 125mg - 30 mL', form: 'Injectable', price: 135 },
  { name: 'Clindamycin/Benzoyl Peroxide', category: 'peptides', strength: '3%/7% - 30 Grams', form: 'Cream', price: 97.5 },
  { name: 'Azelaic Acid/Ivermectin/Metronidazole', category: 'peptides', strength: '15%/1%/1.2% - 60 Grams', form: 'Cream', price: 189 },
  { name: 'Minoxidil/Arginine/Dutasteride/GHK-Cu with Saw Palmetto', category: 'hair-loss', strength: '5%/6%/0.1%/0.5% - 30 Grams', form: 'Topical', price: 225 },
  { name: 'Estriol', category: 'sexual-wellness', strength: '0.10% - 30 Suppositories', form: 'Insert', price: 123 },
  { name: 'Azelaic Acid/Niacinamide', category: 'peptides', strength: '15%/4% - 30 Grams', form: 'Cream', price: 97.5 },
  { name: 'DHEA with Sodium Hyaluronate', category: 'sexual-wellness', strength: '1% - 30 Grams', form: 'Cream', price: 97.5 },
  { name: 'Estriol', category: 'sexual-wellness', strength: '0.05% - 30 Grams', form: 'Cream', price: 115.5 },
  { name: 'GHK-Cu', category: 'peptides', strength: '0.50% - 30 mL', form: 'Topical', price: 225 },
  { name: 'Progesterone (C)', category: 'hormones', strength: '200 mg - 90 Capsules', form: 'Capsule', price: 90 },
  { name: 'Sildenafil (C)', category: 'sexual-wellness', strength: '100 mg - 30 Tablets', form: 'Tablet', price: 67.5 },
  { name: 'Tadalafil (C)', category: 'sexual-wellness', strength: '5 mg - 30 Tablets', form: 'Tablet', price: 67.5 },
].map((t, i) => ({ ...t, id: `p${i + 1}` }))

export const inCategory = (id) =>
  treatments.filter((t) => id === 'all' || (id === 'in-demand' ? t.inDemand : t.category === id))
