import { REGISTRY_TYPES, applyRegistryType, normalizeRegistryType } from "../config/registryBranches.js"
import { calculateCdcGrowth } from "../growth/cdcGrowth.js"
import { calculateImmunologyReferenceFields } from "../immunology/reference.js"
import { calculatePtboBosAssessment } from "./ptboBosAssessment.js"

export function parseDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function dateToInput(value) {
  const date = parseDate(value)
  if (!date) return ""
  return date.toISOString().slice(0, 10)
}

export function formatDateDisplay(value) {
  const date = dateToInput(value)
  return date || "-"
}

export function daysBetween(later, earlier) {
  const a = parseDate(later)
  const b = parseDate(earlier)
  if (!a || !b) return null
  return Math.round((a.getTime() - b.getTime()) / 86400000)
}

export function round(value, digits = 1) {
  if (value == null || !Number.isFinite(value)) return null
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function numberOrNull(value) {
  if (value === "" || value == null) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function sexForGrowth(value) {
  if (value === "e" || value === "male") return "male"
  if (value === "k" || value === "female") return "female"
  return null
}

function calculateGrowthFields(patient, ageMonths, vkiBas) {
  const heightCm = numberOrNull(patient.boy_bas)
  const weightKg = numberOrNull(patient.va_bas)
  const sex = sexForGrowth(patient.cinsiyet)
  const numericAgeMonths = numberOrNull(ageMonths ?? patient.yas_ay)

  if (!sex || !heightCm || !weightKg || numericAgeMonths == null) {
    return {
      ...(vkiBas != null ? { vki_bas: vkiBas } : {}),
      growth_reference_status: "missing_input",
    }
  }

  const results = calculateCdcGrowth({
    ageMonths: numericAgeMonths,
    heightCm,
    sex,
    weightKg,
  })
  const byMetric = Object.fromEntries(results.map((result) => [result.metric, result]))
  const hasCdcScore = results.some((result) => result.zScore != null)

  return {
    vki_bas: vkiBas ?? round(byMetric.bmi?.value, 2),
    ...(byMetric.weight?.zScore != null ? { va_z_bas: round(byMetric.weight.zScore, 2) } : {}),
    ...(byMetric.stature?.zScore != null ? { boy_z_bas: round(byMetric.stature.zScore, 2) } : {}),
    ...(byMetric.bmi?.zScore != null ? { vki_z_bas: round(byMetric.bmi.zScore, 2) } : {}),
    growth_reference_status: hasCdcScore
      ? "cdc_2_20"
      : numericAgeMonths < 24
        ? "under_2_needs_who"
        : "cdc_out_of_range",
  }
}

function calculateTreatmentFields(patient) {
  const sistemikDoz = numberOrNull(patient.sistemik_steroid_mgkg_gun ?? patient.steroid_baslangic_dozu)
  const sistemikGun = numberOrNull(patient.sistemik_steroid_gun ?? patient.steroid_suresi_gun)
  const sistemikPlanGun = numberOrNull(patient.sistemik_steroid_plan_gun)
  const kumulatifSistemik = sistemikDoz != null && sistemikGun != null ? round(sistemikDoz * sistemikGun, 2) : null
  const pulseSteroidDoz = numberOrNull(patient.pulse_steroid_mgkg)

  const neb2AdetGun = numberOrNull(patient.flutikazon_neb_2mg_adet_gun)
  const neb2Gun = numberOrNull(patient.flutikazon_neb_2mg_gun)
  const neb05AdetGun = numberOrNull(patient.flutikazon_neb_05mg_adet_gun)
  const neb05Gun = numberOrNull(patient.flutikazon_neb_05mg_gun)
  const inh125Puff = numberOrNull(patient.flutikazon_inhaler_125_puff_gun)
  const inh125Gun = numberOrNull(patient.flutikazon_inhaler_125_gun)
  const inh50Puff = numberOrNull(patient.flutikazon_inhaler_50_puff_gun)
  const inh50Gun = numberOrNull(patient.flutikazon_inhaler_50_gun)
  const seretide125Puff = numberOrNull(patient.seretide_125_puff_gun)
  const seretide125Gun = numberOrNull(patient.seretide_125_gun)
  const seretide250Puff = numberOrNull(patient.seretide_250_puff_gun)
  const seretide250Gun = numberOrNull(patient.seretide_250_gun)

  const flutikazonNebMcg =
    (neb2AdetGun != null && neb2Gun != null ? neb2AdetGun * neb2Gun * 2000 : 0) +
    (neb05AdetGun != null && neb05Gun != null ? neb05AdetGun * neb05Gun * 500 : 0)
  const flutikazonInhalerMcg =
    (inh125Puff != null && inh125Gun != null ? inh125Puff * inh125Gun * 125 : 0) +
    (inh50Puff != null && inh50Gun != null ? inh50Puff * inh50Gun * 50 : 0)
  const seretideFlutikazonMcg =
    (seretide125Puff != null && seretide125Gun != null ? seretide125Puff * seretide125Gun * 125 : 0) +
    (seretide250Puff != null && seretide250Gun != null ? seretide250Puff * seretide250Gun * 250 : 0)
  const toplamInhaleSteroidMcg = flutikazonNebMcg + flutikazonInhalerMcg + seretideFlutikazonMcg

  const azitromisin = patient.azitromisin == 1 || patient.azitromisin_aldi == 1
  const montelukast = patient.montelukast == 1 || patient.montelukast_aldi == 1
  const inhaleSteroid = toplamInhaleSteroidMcg > 0 || patient.flutikazon == 1 || patient.inhale_steroid_aldi == 1
  const ivig = patient.ivig == 1 || patient.ivig_aldi == 1 || patient.ivig_aliyor == 1

  return {
    ...(sistemikDoz != null ? { sistemik_steroid_mgkg_gun: sistemikDoz, steroid_baslangic_dozu: sistemikDoz } : {}),
    ...(sistemikGun != null ? { sistemik_steroid_gun: sistemikGun, steroid_suresi_gun: sistemikGun } : {}),
    ...(sistemikPlanGun != null ? { sistemik_steroid_plan_gun: sistemikPlanGun } : {}),
    ...(kumulatifSistemik != null ? { kumulatif_sistemik_steroid_mgkg: kumulatifSistemik, kumulatif_steroid: kumulatifSistemik } : {}),
    sistemik_steroid: sistemikDoz != null || sistemikGun != null || kumulatifSistemik != null || patient.sistemik_steroid == 1 ? 1 : 0,
    ...(pulseSteroidDoz != null ? { pulse_steroid_mgkg: pulseSteroidDoz } : {}),
    pulse_steroid: pulseSteroidDoz != null || patient.pulse_steroid == 1 ? 1 : patient.pulse_steroid ?? null,
    ...(neb2AdetGun != null ? { flutikazon_neb_2mg_adet_gun: neb2AdetGun } : {}),
    ...(neb05AdetGun != null ? { flutikazon_neb_05mg_adet_gun: neb05AdetGun } : {}),
    ...(inh125Puff != null ? { flutikazon_inhaler_125_puff_gun: inh125Puff } : {}),
    ...(inh50Puff != null ? { flutikazon_inhaler_50_puff_gun: inh50Puff } : {}),
    ...(seretide125Puff != null ? { seretide_125_puff_gun: seretide125Puff } : {}),
    ...(seretide250Puff != null ? { seretide_250_puff_gun: seretide250Puff } : {}),
    flutikazon_neb_toplam_mcg: flutikazonNebMcg || null,
    flutikazon_inhaler_toplam_mcg: flutikazonInhalerMcg || null,
    seretide_toplam_flutikazon_mcg: seretideFlutikazonMcg || null,
    toplam_inhale_steroid_mcg: toplamInhaleSteroidMcg || null,
    inhale_steroid_aldi: inhaleSteroid ? 1 : 0,
    flutikazon: inhaleSteroid ? 1 : patient.flutikazon ?? null,
    azitromisin: azitromisin ? 1 : patient.azitromisin ?? null,
    azitromisin_aldi: azitromisin ? 1 : 0,
    montelukast: montelukast ? 1 : patient.montelukast ?? null,
    montelukast_aldi: montelukast ? 1 : 0,
    fam_aldi: inhaleSteroid || azitromisin || montelukast ? 1 : 0,
    ivig: ivig ? 1 : patient.ivig ?? null,
    ivig_aldi: ivig ? 1 : 0,
    seretide_aldi: seretideFlutikazonMcg > 0 ? 1 : patient.seretide_aldi ?? null,
    ventolin_aldi: patient.ventolin_aldi ?? null,
  }
}

export function calculateDerivedFields(patient) {
  const calculatedTaniYasGun = daysBetween(patient.tani_tarihi, patient.dogum_tarihi)
  const taniYasGun = calculatedTaniYasGun ?? numberOrNull(patient.tani_yas_gun)
  const semptomTaniGun = daysBetween(patient.tani_tarihi, patient.semptom_baslangic_tarihi)
  const muayeneTaniGun = daysBetween(patient.tani_tarihi, patient.ilk_muayene_tarihi)
  const muayeneBronkoskopiGun = daysBetween(patient.bronkoskopi_tarihi, patient.ilk_muayene_tarihi)
  const semptomBronkoskopiGun = daysBetween(patient.bronkoskopi_tarihi, patient.semptom_baslangic_tarihi)
  const azitroBitisTaniGun = daysBetween(patient.azitro_bitis_tarihi, patient.tani_tarihi)
  const weightKg = numberOrNull(patient.va_bas)
  const heightCm = numberOrNull(patient.boy_bas)
  const vkiBas = weightKg && heightCm ? round(weightKg / ((heightCm / 100) ** 2), 2) : null
  const ageMonths = taniYasGun == null ? numberOrNull(patient.yas_ay) : round(taniYasGun / 30.4375, 1)
  const growthFields = calculateGrowthFields(patient, ageMonths, vkiBas)
  const treatmentFields = calculateTreatmentFields(patient)
  const immunologyFields = calculateImmunologyReferenceFields(patient, ageMonths)
  const registryType = normalizeRegistryType(patient)
  const registryFields = applyRegistryType({}, registryType)
  const ptboAssessment = registryType === REGISTRY_TYPES.PTBO ? calculatePtboBosAssessment(patient) : {}

  const derived = {
    ...registryFields,
    tani_yas_gun: taniYasGun,
    tani_yas_ay: taniYasGun == null ? null : round(taniYasGun / 30.4375, 1),
    yas_ay: ageMonths,
    semptom_tani_gun: semptomTaniGun,
    semptom_oncesi_gun: semptomTaniGun,
    muayene_tani_gun: muayeneTaniGun,
    muayene_bronkoskopi_gun: muayeneBronkoskopiGun,
    semptom_bronkoskopi_gun: semptomBronkoskopiGun,
    azitro_bitis_tani_gun: azitroBitisTaniGun,
    ...growthFields,
    ...treatmentFields,
    ...immunologyFields,
    ...ptboAssessment,
    ...(ptboAssessment.ptbo_missing_required_fields ? { ptbo_missing_required_fields: ptboAssessment.ptbo_missing_required_fields.join("; ") } : {}),
    dogum_yil: parseDate(patient.dogum_tarihi)?.getFullYear() ?? patient.dogum_yil ?? null,
    dogum_ay: parseDate(patient.dogum_tarihi) ? parseDate(patient.dogum_tarihi).getMonth() + 1 : patient.dogum_ay ?? null,
    tani_yil: parseDate(patient.tani_tarihi)?.getFullYear() ?? patient.tani_yil ?? null,
    tani_ay: parseDate(patient.tani_tarihi) ? parseDate(patient.tani_tarihi).getMonth() + 1 : patient.tani_ay ?? null,
  }

  return Object.fromEntries(Object.entries(derived).filter(([, value]) => value != null))
}

export function classifyClinicalCourse(visit) {
  if (visit.exitus == 1) return "exitus"
  if (visit.imv == 1 || visit.ecmo == 1 || visit.yeni_oksijen_ihtiyaci == 1) return "kotu_progresif"
  if ((numberOrNull(visit.pnomoni_sayisi) ?? 0) > 0 || (numberOrNull(visit.atak_sayisi) ?? 0) >= 2) return "alevlenmeli"
  if (visit.semptom_devam == 1 || visit.egzersiz_kisitliligi == 1) return "persistan_semptom"
  if (visit.semptom_devam == 0 && visit.o2 == 0 && visit.bipap == 0) return "iyi_stabil"
  return "belirsiz"
}

export function clinicalCourseLabel(value) {
  return {
    iyi_stabil: "İyi/stabil",
    persistan_semptom: "Persistan semptomlu",
    alevlenmeli: "Alevlenmeli",
    kotu_progresif: "Kötü/progresif",
    exitus: "Exitus",
    belirsiz: "Belirsiz",
  }[value] || "-"
}
