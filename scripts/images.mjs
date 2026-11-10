// Resizes and converts brand imagery to WebP for the homepage.
// Run: npm run images   (reads source-images/ and source-images/generated/, writes public/img/)
import sharp from 'sharp'
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'source-images'
const GEN = 'source-images/generated'
const OUT = 'public/img'

const jobs = [
  // [source, output name, widths[], quality]
  [`${SRC}/hero-new.webp`, 'hero', [1000, 1800], 80], // hero background supplied by the client
  [`${SRC}/HeroSectionImage.png`, 'couple', [1000, 1800], 78],
  [`${SRC}/MedicalReviewImageNew.jpg`, 'medical-review', [900, 1800], 78],
  [`${SRC}/OnlineAssessmentImageNew.jpg`, 'step-assessment', [900, 1400], 78],
  [`${SRC}/PersonalizedPlanImageNewNew.jpg`, 'step-plan', [900, 1400], 78],
  [`${SRC}/DiscreteDeliveryImageNew.jpg`, 'step-delivery', [900, 1400], 78],
  [`${SRC}/MedicalReviewImageNew.jpg`, 'step-review', [900, 1400], 78],
  [`${SRC}/BeYourBestSelfImageTwo.png`, 'runner', [500, 776], 82],
  [`${SRC}/HormonesCardImage.png`, 'hormones', [318], 85],
  [`${SRC}/PeptideNewImage.png`, 'peptide-portrait', [500], 80],
  [`${SRC}/IndividualProtocolImageNew.png`, 'pillar-protocols', [260], 82],
  [`${SRC}/pillar-protocols-physio.webp`, 'pillar-protocols-photo', [600], 82], // Step 1 hover photo
  [`${SRC}/pillar-labs-microscope.webp`, 'pillar-labs-photo', [600], 82], // Step 2 hover photo
  [`${SRC}/RealLabsImageNew.png`, 'pillar-labs', [260], 82],
  [`${SRC}/pillar-pharmacy-pharmacist.webp`, 'pillar-pharmacy-photo', [600], 82], // Step 3 hover photo
  [`${SRC}/LicensedPharmacyImageNew.png`, 'pillar-pharmacy', [260], 82],
  [`${SRC}/pillar-monitoring-sensors.webp`, 'pillar-monitoring-photo', [600], 82], // Step 4 hover photo
  [`${SRC}/ContinousMonitoringImageNew.png`, 'pillar-monitoring', [260], 82],
  // Option 4 hero runner (transparent, trimmed; source supplied by the client) is exported directly — see source-images/opt4-runner.webp
  // Option 4 hover photos — site-style product/doctor shots generated on Higgsfield (1168 × 880)
  [`${SRC}/opt4-pillar-protocols.png`, 'opt4-pillar-protocols', [600], 82],
  [`${SRC}/opt4-pillar-labs.png`, 'opt4-pillar-labs', [600], 82],
  [`${SRC}/opt4-pillar-pharmacy.png`, 'opt4-pillar-pharmacy', [600], 82],
  [`${SRC}/opt4-pillar-monitoring.png`, 'opt4-pillar-monitoring', [600], 82],
  // treatment cards — the live site's own card art (blur baked into the lower half for text)
  [`${SRC}/TestosteroneNewImage.png`, 'card-testosterone', [500], 82],
  [`${SRC}/PeptideNewImage.png`, 'card-peptides', [500], 82],
  [`${SRC}/SexualHealthNewImage.png`, 'card-sexual-health', [500], 82],
  [`${SRC}/WeightLossNewImage.png`, 'card-weight-loss', [500], 82],
  [`${SRC}/HairLossNewImage.png`, 'card-hair-loss', [500], 82],
  [`${SRC}/PerformanceEnhancerNewImage.png`, 'card-performance', [500], 82],
  [`${SRC}/BeYourBestCardImage.png`, 'journey-orb', [120], 90],
  [`${SRC}/ParamountImage.png`, 'paramount-banner', [1400, 2600], 80],
  [`${SRC}/HandImage.png`, 'faq-hand', [299], 88],
  [`${SRC}/FingerImage.png`, 'faq-finger', [299], 88],
  [`${SRC}/FooterVideoImage.png`, 'footer-poster', [1448], 80],
  [`${SRC}/AvatarSixImage.png`, 'avatar-6', [40], 85],
  [`${SRC}/AvatarSevenImage.png`, 'avatar-7', [40], 85],
  // clean step photos (no UI cards) used as the backgrounds of the pinned "4 easy steps" panel
  [`${SRC}/biology-swimmer.webp`, 'biology-bg', [900, 1800], 80], // "Your biology is unique" background
  [`${SRC}/step-clean-1.jpg`, 'steps-bg-1', [1800], 95],
  [`${SRC}/step-clean-2.webp`, 'steps-bg-2', [1800], 95],
  [`${SRC}/step-clean-3.jpg`, 'steps-bg-3', [1800], 95],
  [`${SRC}/step-clean-4.jpg`, 'steps-bg-4', [1800], 95],
  [`${SRC}/OnlineAssessmentImageNew.jpg`, 'step1', [900, 1600], 80],
  [`${SRC}/MedicalReviewImageNew.jpg`, 'step2', [900, 1600], 80],
  [`${SRC}/PersonalizedPlanImageNewNew.jpg`, 'step3', [900, 1600], 80],
  [`${SRC}/DiscreteDeliveryImageNew.jpg`, 'step4', [900, 1600], 80],
  [`${SRC}/AvatarOneImage.jpg`, 'avatar-1', [40], 85],
  [`${SRC}/AvatarTwoImage.png`, 'avatar-2', [40], 85],
  [`${SRC}/AvatarThreeImage.png`, 'avatar-3', [40], 85],
  [`${SRC}/AvatarFourImage.png`, 'avatar-4', [40], 85],
  [`${SRC}/AvatarFiveImage.png`, 'avatar-5', [40], 85],
  [`${SRC}/Vial.png`, 'product-vial', [200], 88],
  [`${SRC}/cream.png`, 'product-cream', [200], 88],
  [`${SRC}/capsule.png`, 'product-capsule', [200], 88],
  [`${GEN}/card-testosterone.png`, 't-testosterone', [600, 896], 80],
  [`${GEN}/card-weight-loss.png`, 't-weight-loss', [600, 896], 80],
  [`${GEN}/card-sexual-health.png`, 't-sexual-health', [600, 896], 80],
  [`${GEN}/card-peptides.png`, 't-peptides', [600, 896], 80],
  [`${GEN}/card-hair-loss.png`, 't-hair-loss', [600, 896], 80],
]

await mkdir(OUT, { recursive: true })
let total = 0
for (const [src, name, widths, quality] of jobs) {
  const meta = await sharp(src).metadata()
  for (const w of widths) {
    const width = Math.min(w, meta.width)
    const file = path.join(OUT, `${name}-${w}.webp`)
    await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality, alphaQuality: 90 }).toFile(file)
    total += (await stat(file)).size
  }
}
console.log(`Wrote ${jobs.length} images to ${OUT} — ${(total / 1024 / 1024).toFixed(2)} MB total`)
