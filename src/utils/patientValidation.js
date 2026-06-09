import { REGISTRY_TYPES, normalizeRegistryType } from "../config/registryBranches.js"

function present(value) {
  return value !== "" && value != null
}

function yes(value) {
  return value == 1 || value === true || value === "1"
}

export function validatePatientBeforeSave(patient = {}) {
  const errors = []
  const registryType = normalizeRegistryType(patient)

  if (!present(patient.hasta_id)) errors.push("Hasta ID gerekli.")
  if (!present(patient.registry_type)) errors.push("Registry kolu gerekli.")
  if (!yes(patient.aydinlatilmis_onam_alindi)) errors.push("Aydınlatılmış onam alınmadan kayıt kaydedilemez.")
  if (!present(patient.dogum_tarihi)) errors.push("Doğum tarihi gerekli.")
  if (registryType === REGISTRY_TYPES.PTBO && !present(patient.ptbo_hsct_tarihi)) {
    errors.push("HSCT kohortu için allojenik HSCT tarihi gerekli.")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
