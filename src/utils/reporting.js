import { normalizeRegistryType } from "../config/registryBranches.js"

function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function daysBetween(later, earlier) {
  const a = parseDate(later)
  const b = parseDate(earlier)
  return a && b ? Math.round((a.getTime() - b.getTime()) / 86400000) : null
}

function median(values) {
  const sorted = values.filter(value => value != null && Number.isFinite(Number(value))).map(Number).sort((a, b) => a - b)
  if (!sorted.length) return null
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2 * 10) / 10
}

export function summarizeRegistryPatients(patients) {
  const byBranchCenter = patients.reduce((acc, patient) => {
    const branch = normalizeRegistryType(patient)
    const center = patient.merkez || patient.hasta_id?.split("-")[0] || "?"
    const key = `${branch}:${center}`
    acc[key] = { branch, center, count: (acc[key]?.count || 0) + 1 }
    return acc
  }, {})

  const ptbo = patients.filter(patient => normalizeRegistryType(patient) === "PTBO")
  return {
    byBranchCenter: Object.values(byBranchCenter).sort((a, b) => a.branch.localeCompare(b.branch) || a.center.localeCompare(b.center)),
    medianAgeAtDiagnosis: median(patients.map(patient => patient.yas_ay)),
    medianDiagnosticDelay: median(patients.map(patient => patient.semptom_tani_gun)),
    ptboMedianHsctToBosDays: median(ptbo.map(patient => daysBetween(patient.ptbo_bos_tani_tarihi || patient.ptbo_bos_suphe_tarihi, patient.ptbo_hsct_tarihi))),
    ptboSurveillanceCompletionRate: ptbo.length ? Math.round(ptbo.filter(patient => patient.ptbo_survey_uyumlu == 1).length / ptbo.length * 100) : null,
  }
}
