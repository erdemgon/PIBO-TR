export const REGISTRY_TYPES = {
  PIBO: "PIBO",
  PTBO: "PTBO",
}

export const REGISTRY_BRANCHES = {
  [REGISTRY_TYPES.PIBO]: {
    label: "PIBO Registry",
    shortLabel: "PIBO",
    description: "Post-infeksiyöz bronşiyolitis obliterans kayıt kolu",
  },
  [REGISTRY_TYPES.PTBO]: {
    label: "PTBO / post-HSCT BOS Registry",
    shortLabel: "PTBO / BOS",
    description: "Post-HSCT bronşiyolitis obliterans sendromu kayıt kolu",
  },
}

export const REPORT_MODES = {
  PIBO: "PIBO",
  PTBO: "PTBO",
  ALL: "ALL",
}

export function normalizeRegistryType(patient) {
  if (patient?.registry_type === REGISTRY_TYPES.PTBO || patient?.ptbo == 1) return REGISTRY_TYPES.PTBO
  return REGISTRY_TYPES.PIBO
}

export function applyRegistryType(patient, registryType) {
  const type = registryType === REGISTRY_TYPES.PTBO ? REGISTRY_TYPES.PTBO : REGISTRY_TYPES.PIBO
  return {
    ...patient,
    registry_type: type,
    pibo: type === REGISTRY_TYPES.PIBO ? 1 : 0,
    ptbo: type === REGISTRY_TYPES.PTBO ? 1 : 0,
  }
}

export function filterByRegistryType(patients, registryType) {
  return patients.filter(patient => normalizeRegistryType(patient) === registryType)
}
