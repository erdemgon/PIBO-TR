import {
  cdcBmiForAgeLms,
  cdcStatureForAgeLms,
  cdcWeightForAgeLms,
} from "./cdcGrowthData.js"

export function calculateCdcGrowth({ ageMonths, heightCm, sex, weightKg }) {
  if (ageMonths == null || heightCm == null || !sex) {
    return []
  }

  const results = []
  const statureLms = getInterpolatedLms(cdcStatureForAgeLms, sex, ageMonths)
  results.push(
    buildGrowthResult({
      label: "Boy",
      metric: "stature",
      unit: "cm",
      value: heightCm,
      lms: statureLms,
    }),
  )

  if (weightKg != null) {
    const weightLms = getInterpolatedLms(cdcWeightForAgeLms, sex, ageMonths)
    results.push(
      buildGrowthResult({
        label: "Ağırlık",
        metric: "weight",
        unit: "kg",
        value: weightKg,
        lms: weightLms,
      }),
    )

    const heightM = heightCm / 100
    const bmi = weightKg / (heightM * heightM)
    const bmiLms = getInterpolatedLms(cdcBmiForAgeLms, sex, ageMonths)
    results.push(
      buildGrowthResult({
        label: "Vücut kitle indeksi",
        metric: "bmi",
        unit: "kg/m2",
        value: bmi,
        lms: bmiLms,
      }),
    )
  }

  return results
}

function buildGrowthResult({ label, metric, unit, value, lms }) {
  if (!lms) {
    return {
      label,
      metric,
      percentile: null,
      unit,
      value,
      zScore: null,
      lms,
      warning: "CDC 2-20 yaş LMS aralığı dışında.",
    }
  }

  const zScore = calculateLmsZ(value, lms)
  return {
    label,
    metric,
    percentile: normalCdf(zScore) * 100,
    unit,
    value,
    zScore,
    lms,
  }
}

function calculateLmsZ(value, lms) {
  if (lms.l === 0) {
    return Math.log(value / lms.m) / lms.s
  }
  return (Math.pow(value / lms.m, lms.l) - 1) / (lms.l * lms.s)
}

function getInterpolatedLms(rows, sex, ageMonths) {
  const sexRows = rows.filter((row) => row.sex === sex)
  if (sexRows.length === 0) return null
  if (ageMonths < sexRows[0].ageMonths || ageMonths > sexRows[sexRows.length - 1].ageMonths) {
    return null
  }

  const exact = sexRows.find((row) => row.ageMonths === ageMonths)
  if (exact) return exact

  const upperIndex = sexRows.findIndex((row) => row.ageMonths > ageMonths)
  if (upperIndex <= 0) return sexRows[0]

  const lower = sexRows[upperIndex - 1]
  const upper = sexRows[upperIndex]
  const fraction = (ageMonths - lower.ageMonths) / (upper.ageMonths - lower.ageMonths)

  return {
    sex,
    ageMonths,
    l: interpolate(lower.l, upper.l, fraction),
    m: interpolate(lower.m, upper.m, fraction),
    s: interpolate(lower.s, upper.s, fraction),
  }
}

function interpolate(a, b, fraction) {
  return a + (b - a) * fraction
}

function normalCdf(z) {
  return 0.5 * (1 + erf(z / Math.SQRT2))
}

function erf(x) {
  const sign = x < 0 ? -1 : 1
  const absX = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * absX)
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX))
  return sign * y
}
