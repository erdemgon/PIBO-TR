function num(value) {
  if (value === "" || value == null) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function yes(value) {
  return value == 1 || value === true || value === "1"
}

function hasValue(value) {
  return value !== "" && value != null
}

function normalizeBosStatus(value) {
  return ["no_bos", "suspected", "probable", "confirmed", "confirmed_biopsy", "uncertain"].includes(value) ? value : null
}

function statusFromCategory(category) {
  if (category === "confirmed BO by biopsy") return "confirmed"
  if (category === "probable PTBO/BOS") return "probable"
  if (category?.startsWith("suspected PTBO/BOS")) return "suspected"
  return "uncertain"
}

function bosStatusFields(patient, category) {
  const explicitStatus = normalizeBosStatus(patient.ptbo_bos_status || patient.ptbo_klinisyen_son_tani)
  const status = explicitStatus === "confirmed_biopsy" ? "confirmed" : explicitStatus || statusFromCategory(category)
  const positive = hasValue(patient.ptbo_bos_pozitif)
    ? (yes(patient.ptbo_bos_pozitif) ? 1 : 0)
    : ["suspected", "probable", "confirmed"].includes(status) ? 1 : 0
  return {
    ptbo_bos_pozitif: positive,
    ptbo_bos_status: status,
  }
}

export function calculatePtboBosAssessment(patient = {}) {
  const spirometryFeasible = patient.ptbo_spirometri_yapabilir != null ? yes(patient.ptbo_spirometri_yapabilir) : null
  const baselineFev1 = num(patient.ptbo_pre_hsct_fev1_pct)
  const currentFev1 = num(patient.ptbo_bos_fev1_pct)
  const fev1DeclinePct = baselineFev1 && currentFev1 != null ? ((baselineFev1 - currentFev1) / baselineFev1) * 100 : null
  const fev1Decline15 = fev1DeclinePct != null && fev1DeclinePct >= 15
  const persistentDecline = yes(patient.ptbo_fev1_dusus_iki_test)
  const infectionIdentified = yes(patient.ptbo_enfeksiyon_saptandi)
  const infectionResolved = yes(patient.ptbo_enfeksiyon_tedavi_duzeldi)
  const persistentAfterInfection = yes(patient.ptbo_enfeksiyon_sonrasi_suphe_devam)

  const supportingFeatures = [
    ["FEV1/VC LLN altında", yes(patient.ptbo_fev1_vc_lln_altinda)],
    ["Ekspiratuvar BT air trapping", yes(patient.ptbo_ct_air_trapping)],
    ["RV veya RV/TLC ULN üstünde", yes(patient.ptbo_rv_veya_rvtlc_uln_ustu)],
    ["LCI > 8.0", (num(patient.ptbo_lci) ?? 0) > 8],
    ["Ekstrapulmoner cGVHD", yes(patient.ptbo_cgvhd) || yes(patient.ptbo_extrapulmoner_cgvhd)],
  ].filter(([, present]) => present)

  const missing = []
  if (spirometryFeasible == null) missing.push("Spirometri yapılabilirliği")
  if (spirometryFeasible === true && baselineFev1 == null) missing.push("Pre-HSCT FEV1 %")
  if (spirometryFeasible === true && currentFev1 == null) missing.push("Güncel/suspected BOS FEV1 %")
  if (spirometryFeasible === true && !patient.ptbo_fev1_dusus_iki_test) missing.push("FEV1 düşüşünün iki testte kalıcılığı")
  if (infectionIdentified && !patient.ptbo_enfeksiyon_sonrasi_suphe_devam) missing.push("Enfeksiyon tedavisi/rezolüsyonu sonrası şüphe durumu")

  if (spirometryFeasible === false) {
    const alternateSupport = [
      yes(patient.ptbo_yeni_solunum_semptomu),
      yes(patient.ptbo_ct_air_trapping),
      yes(patient.ptbo_ct_mozaik),
      (num(patient.ptbo_lci) ?? 0) > 8,
      yes(patient.ptbo_klinik_adjudikasyon_bos),
    ].filter(Boolean).length
    const category = alternateSupport >= 2 ? "suspected PTBO/BOS – spirometry not feasible" : "insufficient data"
    return {
      ...bosStatusFields(patient, category),
      ptbo_suspicion_flag: alternateSupport >= 2 ? 1 : 0,
      ptbo_supporting_features_count: alternateSupport,
      ptbo_criteria_summary: `Spirometri yapılamıyor; alternatif destekleyici bulgu sayısı ${alternateSupport}.`,
      ptbo_missing_required_fields: missing,
      ptbo_recommended_next_step: alternateSupport >= 2 ? "MBW/LCI, inspiratuvar-ekspiratuvar BT, BAL/enfeksiyon değerlendirmesi ve klinisyen adjudikasyonu ile izlem." : "Alternatif PTBO/BOS değerlendirme alanlarını tamamlayın.",
      ptbo_diagnostic_category: category,
    }
  }

  const coreCriteriaMet = fev1Decline15 && persistentDecline && supportingFeatures.length >= 2
  const infectionGateOk = !infectionIdentified || infectionResolved || persistentAfterInfection
  const suspicionFlag = coreCriteriaMet && infectionGateOk ? 1 : 0
  const category = patient.ptbo_biyopsi_bo == 1
    ? "confirmed BO by biopsy"
    : suspicionFlag
      ? "probable PTBO/BOS"
      : fev1Decline15 || supportingFeatures.length >= 2
        ? "suspected PTBO/BOS"
        : "insufficient data"

  return {
    ...bosStatusFields(patient, category),
    ptbo_suspicion_flag: suspicionFlag,
    ptbo_supporting_features_count: supportingFeatures.length,
    ptbo_criteria_summary: [
      fev1DeclinePct != null ? `FEV1 düşüşü ${Math.round(fev1DeclinePct)}%` : "FEV1 düşüşü hesaplanamadı",
      persistentDecline ? "düşüş iki testte kalıcı" : "kalıcılık gösterilmedi/eksik",
      `${supportingFeatures.length} destekleyici bulgu: ${supportingFeatures.map(([label]) => label).join(", ") || "yok"}`,
      infectionIdentified ? "enfeksiyon kaydedildi; tedavi/rezolüsyon sonrası şüphe ayrıca değerlendirilmeli" : "enfeksiyon kaydı yok",
    ].join("; "),
    ptbo_missing_required_fields: missing,
    ptbo_recommended_next_step: missing.length
      ? `Eksik alanları tamamlayın: ${missing.join(", ")}.`
      : suspicionFlag
        ? "PTBO/BOS tanı-tedavi planını multidisipliner ekip ile gözden geçirin ve tedavi sonrası 4. hafta PFT planlayın."
        : "Klinik şüphe varsa enfeksiyon tedavisi/rezolüsyonu sonrası PFT/BT/MBW ile yeniden değerlendirin.",
    ptbo_diagnostic_category: category,
  }
}
