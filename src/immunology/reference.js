const IG_AGE_BANDS = [
  { label: "0-30 gun", min: 0, max: 1 },
  { label: "1-3 ay", min: 1, max: 3 },
  { label: "4-6 ay", min: 4, max: 6 },
  { label: "7-12 ay", min: 7, max: 12 },
  { label: "13-24 ay", min: 13, max: 24 },
  { label: "25-36 ay", min: 25, max: 36 },
  { label: "3-5 yas", min: 37, max: 71 },
  { label: "6-8 yas", min: 72, max: 107 },
  { label: "9-11 yas", min: 108, max: 143 },
  { label: "12-16 yas", min: 144, max: 191 },
  { label: "16-18 yas", min: 192, max: 216 },
]

const IG_RANGES = {
  igg: [399, 217, 270, 242, 389, 486, 457, 483, 642, 636, 688],
  iga: [6.67, 6.67, 6.67, 6.68, 13.1, 6.67, 35.7, 44.8, 32.6, 36.4, 46.3],
  igm: [5.1, 15.2, 26.9, 24.2, 38.6, 42.7, 58.7, 50.3, 37.4, 42.4, 60.7],
}

const IGG_SUBCLASS_BANDS = IG_AGE_BANDS.slice(5)
const IGG_SUBCLASS_RANGES = {
  igg1: [309, 273, 292, 410, 344, 403],
  igg2: [87.6, 73.3, 88.1, 81, 159, 184],
  igg3: [7.86, 7.86, 7.86, 7.86, 7.86, 7.86],
  igg4: [19.8, 20.8, 18.9, 34.1, 35.2, 29.3],
}

const LYMPH_AGE_BANDS = [
  { label: "0-39 gun", min: 0, max: 1.3 },
  { label: "40 gun-6 ay", min: 1.31, max: 6 },
  { label: "6-9 ay", min: 6.01, max: 9 },
  { label: "9-12 ay", min: 9.01, max: 12 },
  { label: "1-2 yas", min: 12.01, max: 24 },
  { label: "2-5 yas", min: 24.01, max: 60 },
  { label: "5-10 yas", min: 60.01, max: 120 },
  { label: "10-16 yas", min: 120.01, max: 192 },
  { label: ">16 yas", min: 192.01, max: null },
]

const LYMPH_RANGES = {
  lym_abs: [2279, 2416, 3325, 2965, 1829, 1703, 1803, 1403, 1400],
  cd3_pct: [56.8, 50.4, 49.7, 53.6, 51, 57.6, 55, 57.8, 64.4],
  cd3_abs: [1765, 1492, 1981, 1945, 1338, 1200, 971, 1032, 998],
  cd4_pct: [39.2, 31.6, 28.6, 30, 27.6, 23.6, 23.4, 27.3, 31.7],
  cd4_abs: [1248, 909, 1190, 1161, 820, 458, 445, 505, 673],
  cd8_pct: [9.8, 10.7, 9, 11, 12.7, 12.1, 16.8, 16.5, 13.9],
  cd8_abs: [282, 254, 576, 310, 540, 165, 379, 381, 238],
  cd19_pct: [1.6, 10.2, 5.4, 9.1, 11, 8.4, 6.5, 5.1, 3.4],
  cd19_abs: [212, 237, 51, 467, 516, 205, 122, 94, 87],
  cd16_cd56_pct: [3, 1.8, 0.3, 2.5, 2, 3.5, 4, 1.8, 5.1],
  cd16_cd56_abs: [126, 101, 156, 130, 101, 88, 105, 94, 91],
}

function findBand(ageMonths, bands) {
  if (ageMonths == null) return null
  return bands.find((band) => ageMonths >= band.min && (band.max == null || ageMonths <= band.max)) ?? null
}

function lowFlag(value, lowerLimit) {
  return value == null || lowerLimit == null ? null : value < lowerLimit ? 1 : 0
}

export function calculateImmunologyReferenceFields(patient, ageMonths) {
  const igBand = findBand(ageMonths, IG_AGE_BANDS)
  const subclassBand = findBand(ageMonths, IGG_SUBCLASS_BANDS)
  const lymphBand = findBand(ageMonths, LYMPH_AGE_BANDS)
  const fields = {
    immunology_reference_source: "Bayram2019_Ig_Besci2021_Lymphocyte_TR",
    ...(igBand ? { immunology_ig_ref_age_band: igBand.label } : {}),
    ...(lymphBand ? { lymphocyte_ref_age_band: lymphBand.label } : {}),
  }

  if (igBand) {
    const index = IG_AGE_BANDS.indexOf(igBand)
    for (const key of ["igg", "iga", "igm"]) {
      const valueMgDl = patient[key] == null ? null : Number(patient[key]) * 100
      const lower = IG_RANGES[key][index]
      fields[`${key}_alt_limit_mgdl`] = lower
      fields[`${key}_dusuk`] = lowFlag(valueMgDl, lower)
    }
  }

  if (subclassBand) {
    const index = IGG_SUBCLASS_BANDS.indexOf(subclassBand)
    for (const key of ["igg1", "igg2", "igg3", "igg4"]) {
      const value = patient[key] == null ? null : Number(patient[key])
      const lower = IGG_SUBCLASS_RANGES[key][index]
      fields[`${key}_alt_limit_mgdl`] = lower
      fields[`${key}_dusuk`] = lowFlag(value, lower)
    }
  }

  if (lymphBand) {
    const index = LYMPH_AGE_BANDS.indexOf(lymphBand)
    const checks = {
      lym_abs: patient.cbc_lym,
      cd3_pct: patient.lscd3_pct ?? patient.cd3,
      cd3_abs: patient.lscd3_abs,
      cd4_pct: patient.lscd4_pct ?? patient.cd4,
      cd4_abs: patient.lscd4_abs,
      cd8_pct: patient.lscd8_pct ?? patient.cd8,
      cd8_abs: patient.lscd8_abs,
      cd19_pct: patient.cd19,
      cd19_abs: patient.lscd19,
      cd16_cd56_pct: patient.cd16_cd56,
      cd16_cd56_abs: patient.lscd56,
    }
    for (const [key, value] of Object.entries(checks)) {
      const numericValue = value == null ? null : Number(value)
      const lower = LYMPH_RANGES[key][index]
      fields[`${key}_alt_limit`] = lower
      fields[`${key}_dusuk`] = lowFlag(numericValue, lower)
    }
    const measuredFlags = Object.keys(checks).map((key) => fields[`${key}_dusuk`]).filter((value) => value != null)
    fields.lenfosit_subset_dusuk = measuredFlags.length === 0 ? null : measuredFlags.some((value) => value === 1) ? 1 : 0
  }

  return fields
}
