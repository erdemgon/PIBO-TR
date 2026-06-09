import { useState, useEffect } from "react"
import { FollowUpPanel } from "./components/FollowUpPanel.jsx"
import { PftPanel } from "./components/PftPanel.jsx"
import { calculateCdcGrowth } from "./growth/cdcGrowth.js"
import { calculateImmunologyReferenceFields } from "./immunology/reference.js"
import {
  deletePatientById,
  listPatients,
  upsertPatients,
} from "./services/registryRepository.js"

const CENTERS = {
  "ADMIN": { label: "Koordinatör (Admin)", prefix: null, isAdmin: true },
  "KOC":   { label: "Koç Üniversitesi Hastanesi", prefix: "KOC", isAdmin: false },
  "MED":   { label: "Medipol", prefix: "MED", isAdmin: false },
}

const THEME = {
  navy: "#211f1f",
  red: "#8f1d2c",
  burgundy: "#8f1d2c",
  redSoft: "#f9e9ec",
  redField: "#f5f5f6",
  redBorder: "#efcbd2",
  redHover: "#751725",
  navySoft: "#f5f5f6",
  surface: "#ffffff",
  ink: "#211f1f",
  muted: "#6f6a6c",
  page: "#ffffff",
  card: "#f5f5f6",
  border: "#ececef",
  amberSoft: "#fff7e6",
  amberBorder: "#f0c36a",
  amberText: "#8a5a00",
}

const BRAND = {
  name: "PIBO-TR Registry",
  subtitle: "Pediatrik ve post-transplant bronşiyolitis obliterans veri ağı",
  logo: "/pibo-logo.png",
}

const ORIGINAL_HASTALAR_COLUMNS = [
  "hasta_id",
  "pibo",
  "ptbo",
  "cinsiyet",
  "yabanci",
  "dogum_tarihi",
  "tani_tarihi",
  "semptom_baslangic_tarihi",
  "bronkoskopi_tarihi",
  "ilk_muayene_tarihi",
  "bt_tarihi",
  "yas_ay",
  "semptom_tani_gun",
  "muayene_tani_gun",
  "muayene_bronkoskopi_gun",
  "tani_yas_gun",
  "semptom_bronkoskopi_gun",
  "steroid_suresi_gun",
  "tedavi_suresi_gun",
  "hsct",
  "solid_tx",
  "gvhd",
  "gvhd_yeri",
  "tx1_tani_gun",
  "tx2_tani_gun",
  "gvhd_tani_gun",
  "azitro_bitis_tarihi",
  "bt_infiltrasyon",
  "bt_atelektazi",
  "bt_sag_orta_atelektazi",
  "bt_lingula_atelektazi",
  "bt_diger_atelektazi",
  "bt_bronsektazi",
  "bt_sag_orta_bronsektazi",
  "bt_lingula_bronsektazi",
  "bt_diger_bronsektazi",
  "sistemik_steroid",
  "pulse_steroid",
  "azitromisin_aldi",
  "inhale_steroid_aldi",
  "montelukast_aldi",
  "bronchomunal",
  "ivig_aldi",
  "o2",
  "bipap",
  "imv",
  "ecmo",
  "ex",
  "sistemik_steroid_mgkg_gun",
  "sistemik_steroid_gun",
  "kumulatif_sistemik_steroid_mgkg",
  "tedi_sonrasi_atak",
  "tedi_sonrasi_pnomoni",
  "tedavi_sonucu",
  "semptom_devam",
  "akut_hfnc",
  "yatis",
  "etken_pnomokok",
  "etken_adenovirus",
  "etken_rinovirus",
  "etken_rsv",
  "etken_cmv",
  "etken_influenza",
  "etken_kizamik",
  "etken_metapneumovirus",
  "etken_covid",
  "etken_varicella",
  "etken_ebv",
  "bal_ureme",
  "bal_coklu_ureme",
  "bal_kultur1",
  "bal_kultur2",
  "bal_kultur3",
  "bal_h_influenza",
  "bal_m_catarrhalis",
  "rpcr",
  "bal_solunum_pcr",
  "bal_cmv_pcr",
  "bal_pjir",
  "bal_lipid_ym",
  "bal_hemosiderin_ym",
  "bal_lenfosit_subset",
  "bal_lenfopeni",
  "lokosit",
  "lenfosit_oran",
  "notrofil_oran",
  "eozinofil_oran",
  "bal_cd3",
  "bal_cd4",
  "bal_cd8",
  "bal_cd4_cd8",
  "bal_cd19",
  "bal_cd16_cd56",
  "bal_cd45",
  "bal_cd56",
  "bal_cd22",
  "bal_cd20",
  "bal_cd16",
  "bal_cd3_hladr",
  "eko",
  "pht",
  "pap",
  "imun_yetmezlik",
  "imdef",
  "imdefdr",
  "tani_surecinde_imyetm",
  "astim",
  "alerjik_rinit",
  "iga",
  "iga_dusuk",
  "igm",
  "igm_dusuk",
  "igg",
  "igg_dusuk",
  "ige",
  "igg1",
  "igg2",
  "igg3",
  "igg4",
  "cbc_bk",
  "cbc_neu",
  "cbc_lym",
  "cbc_eos",
  "cbc_nlr",
  "lswbc",
  "lslym_pct",
  "lscd3_pct",
  "lscd3_abs",
  "lscd4_pct",
  "lscd4_abs",
  "lscd8_pct",
  "lscd8_abs",
  "lscd4_cd8",
  "lscd19",
  "lscd56",
  "cd3",
  "cd4",
  "cd8",
  "cd4_cd8",
  "va_bas",
  "va_z_bas",
  "va_bit",
  "va_z_bit",
  "va_z_fark",
  "boy_bas",
  "boy_z_bas",
  "boy_bit",
  "boy_z_bit",
  "vki_bas",
  "vki_z_bas",
  "vki_bit",
  "vki_z_bit",
  "vki_fark",
  "fev1_bas",
  "fvc_bas",
  "mef2575_bas",
  "fev1_bd_bas",
  "mef2575_bd_bas",
  "x5_bas",
  "r5_bas",
  "ax_bas",
  "dlco_bas",
  "rv_bas",
  "tlc_bas",
  "rv_tlc_bas",
  "fev1_bit",
  "fvc_bit",
  "mef2575_bit",
  "bd_fev1",
  "bd_mef2575",
  "x5_bit",
  "r5_bit",
  "ax_bit",
  "dlco_bit",
  "rv_bit",
  "tlc_bit",
  "rv_tlc_bit",
  "tani_u12ay",
  "tani_u18ay",
  "tani_u36ay",
  "sx_u12ay",
  "sx_u18ay",
  "sx_u36ay",
  "bhalla_skoru",
  "teper_skoru",
  "webb_skoru",
  "merkez",
  "spo2_bas",
  "ates_bas",
  "solunum_sayisi_bas",
  "kalp_tepe_atimi_bas",
]

function pickRecordColumns(record, allowedColumns) {
  return Object.fromEntries(Object.entries(record).filter(([key]) => allowedColumns.has(key)))
}

function formatSupabaseError(error) {
  return [error?.message, error?.details, error?.hint].filter(Boolean).join(" ")
}

function csvEscape(value) {
  if (value == null) return ""
  const text = String(value)
  return /[",\n\r;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function exportColumns(rows) {
  const priority = ["hasta_id", "merkez", "pibo", "ptbo", "cinsiyet", "dogum_tarihi", "tani_tarihi", "yas_ay"]
  const keys = Array.from(new Set(rows.flatMap(row => Object.keys(row))))
  return [
    ...priority.filter(key => keys.includes(key)),
    ...keys.filter(key => !priority.includes(key)).sort(),
  ]
}

function downloadCsv(filename, rows) {
  if (!rows.length) return
  const columns = exportColumns(rows)
  const csv = [
    columns.map(csvEscape).join(";"),
    ...rows.map(row => columns.map(column => csvEscape(row[column])).join(";")),
  ].join("\n")
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function xmlEscape(value) {
  if (value == null) return ""
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function excelCell(value) {
  if (value == null) return "<Cell><Data ss:Type=\"String\"></Data></Cell>"
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`
  }
  return `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`
}

function downloadExcel(filename, rows) {
  if (!rows.length) return
  const columns = exportColumns(rows)
  const header = `<Row>${columns.map(column => `<Cell><Data ss:Type="String">${xmlEscape(column)}</Data></Cell>`).join("")}</Row>`
  const body = rows.map(row => `<Row>${columns.map(column => excelCell(row[column])).join("")}</Row>`).join("")
  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Hastalar">
  <Table>
   ${header}
   ${body}
  </Table>
 </Worksheet>
</Workbook>`
  const blob = new Blob(["\ufeff", workbook], { type: "application/vnd.ms-excel;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function parseDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function dateToInput(value) {
  const date = parseDate(value)
  if (!date) return ""
  return date.toISOString().slice(0, 10)
}

function formatDateDisplay(value) {
  const date = dateToInput(value)
  return date || "-"
}

function daysBetween(later, earlier) {
  const a = parseDate(later)
  const b = parseDate(earlier)
  if (!a || !b) return null
  return Math.round((a.getTime() - b.getTime()) / 86400000)
}

function round(value, digits = 1) {
  if (value == null || !Number.isFinite(value)) return null
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function numberOrNull(value) {
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

function calculateDerivedFields(patient) {
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

  const derived = {
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
    dogum_yil: parseDate(patient.dogum_tarihi)?.getFullYear() ?? patient.dogum_yil ?? null,
    dogum_ay: parseDate(patient.dogum_tarihi) ? parseDate(patient.dogum_tarihi).getMonth() + 1 : patient.dogum_ay ?? null,
    tani_yil: parseDate(patient.tani_tarihi)?.getFullYear() ?? patient.tani_yil ?? null,
    tani_ay: parseDate(patient.tani_tarihi) ? parseDate(patient.tani_tarihi).getMonth() + 1 : patient.tani_ay ?? null,
  }

  return Object.fromEntries(Object.entries(derived).filter(([, value]) => value != null))
}

function classifyClinicalCourse(visit) {
  if (visit.exitus == 1) return "exitus"
  if (visit.imv == 1 || visit.ecmo == 1 || visit.yeni_oksijen_ihtiyaci == 1) return "kotu_progresif"
  if ((numberOrNull(visit.pnomoni_sayisi) ?? 0) > 0 || (numberOrNull(visit.atak_sayisi) ?? 0) >= 2) return "alevlenmeli"
  if (visit.semptom_devam == 1 || visit.egzersiz_kisitliligi == 1) return "persistan_semptom"
  if (visit.semptom_devam == 0 && visit.o2 == 0 && visit.bipap == 0) return "iyi_stabil"
  return "belirsiz"
}

function clinicalCourseLabel(value) {
  return {
    iyi_stabil: "İyi/stabil",
    persistan_semptom: "Persistan semptomlu",
    alevlenmeli: "Alevlenmeli",
    kotu_progresif: "Kötü/progresif",
    exitus: "Exitus",
    belirsiz: "Belirsiz",
  }[value] || "-"
}

const FOLLOWUP_FIELDS = [
  {key:"visit_date", label:"Muayene tarihi", type:"date", required:true},
  {key:"semptom_devam", label:"Semptom devam", type:"bool"},
  {key:"egzersiz_kisitliligi", label:"Egzersiz kısıtlılığı", type:"bool"},
  {key:"atak_sayisi", label:"Son kontrolden beri atak", type:"num"},
  {key:"pnomoni_sayisi", label:"Son kontrolden beri pnömoni", type:"num"},
  {key:"o2", label:"O2 ihtiyacı", type:"bool"},
  {key:"bipap", label:"BiPAP/NIV", type:"bool"},
  {key:"imv", label:"İnvaziv MV", type:"bool"},
  {key:"ecmo", label:"ECMO", type:"bool"},
  {key:"yeni_oksijen_ihtiyaci", label:"Yeni oksijen ihtiyacı", type:"bool"},
  {key:"sistemik_steroid_mgkg_gun", label:"Steroid dozu (mg/kg/gün)", type:"num"},
  {key:"sistemik_steroid_gun", label:"Steroid günü", type:"num"},
  {key:"sistemik_steroid_plan_gun", label:"Planlanan steroid günü", type:"num"},
  {key:"va", label:"Ağırlık (kg)", type:"num"},
  {key:"boy", label:"Boy (cm)", type:"num"},
  {key:"spo2", label:"SpO2 (%)", type:"num"},
  {key:"fev1", label:"FEV1 (%)", type:"num"},
  {key:"fvc", label:"FVC (%)", type:"num"},
  {key:"mef2575", label:"MEF25-75 (%)", type:"num"},
  {key:"klinik_gidis", label:"Klinik gidiş", type:"select", options:[
    {v:"", l:"Otomatik/boş"},
    {v:"iyi_stabil", l:"İyi/stabil"},
    {v:"persistan_semptom", l:"Persistan semptomlu"},
    {v:"alevlenmeli", l:"Alevlenmeli"},
    {v:"kotu_progresif", l:"Kötü/progresif"},
    {v:"exitus", l:"Exitus"},
  ]},
  {key:"notlar", label:"Not", type:"text"},
]

const PFT_FIELDS = [
  {key:"test_date", label:"Tetkik tarihi", type:"date", required:true},
  {key:"test_type", label:"Tetkik tipi", type:"select", options:[
    {v:"", l:"—"},
    {v:"bazal", l:"Bazal"},
    {v:"izlem", l:"İzlem"},
    {v:"bronkodilatator", l:"BD sonrası"},
  ]},
  {key:"fev1", label:"FEV1 (%)", type:"num"},
  {key:"fev1_z", label:"FEV1 z-skor", type:"num"},
  {key:"fvc", label:"FVC (%)", type:"num"},
  {key:"fvc_z", label:"FVC z-skor", type:"num"},
  {key:"fev1_fvc", label:"FEV1/FVC", type:"num"},
  {key:"fev1_fvc_z", label:"FEV1/FVC z-skor", type:"num"},
  {key:"mef2575", label:"MEF25-75 (%)", type:"num"},
  {key:"mef2575_z", label:"MEF25-75 z-skor", type:"num"},
  {key:"bd_fev1", label:"BD FEV1 değişim (%)", type:"num"},
  {key:"bd_mef2575", label:"BD MEF25-75 değişim (%)", type:"num"},
  {key:"dlco", label:"DLCO (%)", type:"num"},
  {key:"dlco_z", label:"DLCO z-skor", type:"num"},
  {key:"rv", label:"RV (%)", type:"num"},
  {key:"tlc", label:"TLC (%)", type:"num"},
  {key:"rv_tlc", label:"RV/TLC (%)", type:"num"},
  {key:"notlar", label:"Not", type:"text"},
]

const DOSING_FREQUENCY_OPTIONS = [
  {v:"1", l:"1x"},
  {v:"2", l:"2x"},
  {v:"3", l:"3x"},
  {v:"4", l:"4x"},
]

const FIELD_GROUPS = {
  genel: {
    label: "Genel", fields: [
      {key:"hasta_id", label:"Hasta ID", type:"text", required:true},
      {key:"pibo", label:"PIBO", type:"bool", required:true},
      {key:"ptbo", label:"PTBO", type:"bool", required:true},
      {key:"aydinlatilmis_onam_alindi", label:"Aydınlatılmış onam alındı", type:"bool", required:true},
      {key:"cinsiyet", label:"Cinsiyet", type:"select", options:[{v:"e",l:"Erkek"},{v:"k",l:"Kız"}]},
      {key:"yabanci", label:"Yabancı uyruklu", type:"bool"},
      {key:"dogum_tarihi", label:"Doğum tarihi", type:"date", required:true},
      {key:"semptom_baslangic_tarihi", label:"Yakınmaların başladığı tarih", type:"date"},
      {key:"ilk_muayene_tarihi", label:"İlk çocuk göğüs muayene tarihi", type:"date"},
      {key:"tani_tarihi", label:"PIBO/PTBO tanı tarihi", type:"date"},
      {key:"bt_tarihi", label:"BT inceleme tarihi", type:"date"},
      {key:"bronkoskopi_tarihi", label:"Bronkoskopi tarihi", type:"date"},
      {key:"yas_ay", label:"Tanı yaşı (ay)", type:"num", readonly:true},
      {key:"tani_yas_gun", label:"Tanı anındaki yaş (gün)", type:"num", readonly:true},
      {key:"semptom_tani_gun", label:"Semptom → tanı (gün)", type:"num", readonly:true},
      {key:"muayene_tani_gun", label:"İlk muayene → tanı (gün)", type:"num", readonly:true},
      {key:"muayene_bronkoskopi_gun", label:"İlk muayene → bronkoskopi (gün)", type:"num", readonly:true},
      {key:"semptom_bronkoskopi_gun", label:"Semptom → bronkoskopi (gün)", type:"num", readonly:true},
    ]
  },
  vitaller: {
    label: "Vitaller & Antropometri", fields: [
      {key:"spo2_bas", label:"SpO2 (%)", type:"num"},
      {key:"ates_bas", label:"Ateş (°C)", type:"num"},
      {key:"solunum_sayisi_bas", label:"Solunum sayısı (/dk)", type:"num"},
      {key:"kalp_tepe_atimi_bas", label:"Kalp tepe atımı (/dk)", type:"num"},
      {key:"va_bas", label:"Ağırlık başlangıç (kg)", type:"num"},
      {key:"va_z_bas", label:"Ağırlık z-skor başlangıç", type:"num", readonly:true},
      {key:"va_bit", label:"Ağırlık bitiş (kg)", type:"num"},
      {key:"va_z_bit", label:"Ağırlık z-skor bitiş", type:"num", readonly:true},
      {key:"boy_bas", label:"Boy başlangıç (cm)", type:"num"},
      {key:"boy_z_bas", label:"Boy z-skor başlangıç", type:"num", readonly:true},
      {key:"boy_bit", label:"Boy bitiş (cm)", type:"num"},
      {key:"boy_z_bit", label:"Boy z-skor bitiş", type:"num", readonly:true},
      {key:"vki_bas", label:"VKI başlangıç", type:"num", readonly:true},
      {key:"vki_z_bas", label:"VKI z-skor başlangıç", type:"num", readonly:true},
      {key:"vki_bit", label:"VKI bitiş", type:"num", readonly:true},
      {key:"vki_z_bit", label:"VKI z-skor bitiş", type:"num", readonly:true},
      {key:"vki_fark", label:"VKI z-skor fark", type:"num", readonly:true},
      {key:"premature", label:"Prematüre doğum", type:"bool"},
      {key:"gestasyon_haftasi", label:"Gestasyon haftası", type:"num"},
      {key:"dogum_agirligi_g", label:"Doğum ağırlığı (g)", type:"num"},
      {key:"yenidogan_yogun_bakim", label:"Yenidoğan yoğun bakım", type:"bool"},
      {key:"neonatal_oksijen", label:"Neonatal oksijen", type:"bool"},
      {key:"bpd_oykusu", label:"BPD öyküsü", type:"bool"},
    ]
  },
  akut: {
    label: "Akut Dönem", fields: [
      {key:"akut_asye_tarihi", label:"İlk akut ASYE tarihi", type:"date"},
      {key:"ates_suresi_gun", label:"Ateş süresi (gün)", type:"num"},
      {key:"agir_pnomoni", label:"Ağır pnömoni", type:"bool"},
      {key:"ilk_akut_asye_yatis_gun", label:"İlk akut ASYE yatış süresi (gün)", type:"num"},
      {key:"tekrarlayan_pnomoni", label:"Tekrarlayan pnömoni öyküsü", type:"bool"},
      {key:"pnomoni_atak_sayisi", label:"Toplam pnömoni atağı", type:"num"},
      {key:"toplam_pnomoni_yatis_gun", label:"Toplam pnömoni yatış süresi (gün)", type:"num"},
      {key:"akut_hipoksemi", label:"Akut hipoksemi", type:"bool"},
      {key:"akut_yatis", label:"Akut hastane yatışı", type:"bool"},
      {key:"cocuk_yogun_bakim", label:"Çocuk yoğun bakım", type:"bool"},
      {key:"akut_oksijen", label:"Akut oksijen", type:"bool"},
      {key:"akut_hfnc", label:"Akut HFNC", type:"bool"},
      {key:"akut_niv", label:"Akut NIV/BiPAP", type:"bool"},
      {key:"akut_imv", label:"Akut invaziv MV", type:"bool"},
      {key:"akut_ivig", label:"Akut IVIG", type:"bool"},
      {key:"akut_glukokortikoid", label:"Akut glukokortikoid", type:"bool"},
      {key:"yatis", label:"Toplam hastane yatışı", type:"bool"},
      {key:"o2", label:"O2 desteği", type:"bool"},
      {key:"bipap", label:"BiPAP", type:"bool"},
      {key:"imv", label:"İnvaziv MV", type:"bool"},
      {key:"ecmo", label:"ECMO", type:"bool"},
    ]
  },
  etiyoloji: {
    label: "Etiyoloji", fields: [
      {key:"etken_adenovirus", label:"Adenovirüs", type:"bool"},
      {key:"etken_mycoplasma", label:"Mycoplasma pneumoniae", type:"bool"},
      {key:"etken_rsv", label:"RSV", type:"bool"},
      {key:"etken_rinovirus", label:"Rinovirus", type:"bool"},
      {key:"etken_pnomokok", label:"Pnömokok", type:"bool"},
      {key:"etken_cmv", label:"CMV", type:"bool"},
      {key:"etken_influenza", label:"İnfluenza", type:"bool"},
      {key:"etken_parainfluenza", label:"Parainfluenza", type:"bool"},
      {key:"etken_kizamik", label:"Kızamık", type:"bool"},
      {key:"etken_metapneumovirus", label:"Metapneumovirus", type:"bool"},
      {key:"etken_covid", label:"COVID-19", type:"bool"},
      {key:"etken_varicella", label:"Varicella", type:"bool"},
      {key:"etken_ebv", label:"EBV", type:"bool"},
      {key:"etken_bakteri", label:"Bakteriyel etken", type:"bool"},
      {key:"koenfeksiyon", label:"Ko-enfeksiyon", type:"bool"},
      {key:"etken_diger", label:"Diğer etken", type:"text"},
      {key:"hsct", label:"HSCT", type:"bool"},
      {key:"solid_tx", label:"Solid Tx", type:"bool"},
      {key:"gvhd", label:"GVHD", type:"bool"},
      {key:"gvhd_yeri", label:"GVHD yeri", type:"text"},
      {key:"tx1_tani_gun", label:"1.Tx → tanı (gün, negatif=önce)", type:"num"},
      {key:"gvhd_tani_gun", label:"GVHD → tanı (gün, negatif=önce)", type:"num"},
    ]
  },
  radyoloji: {
    label: "Radyoloji (BT)", fields: [
      {key:"bt_infiltrasyon", label:"İnfiltrasyon", type:"bool"},
      {key:"bt_mozaik", label:"Mozaik perfüzyon/attenüasyon", type:"bool"},
      {key:"bt_air_trapping", label:"Air trapping", type:"bool"},
      {key:"bt_bronduvar_kalinlasma", label:"Bronş duvar kalınlaşması", type:"bool"},
      {key:"bt_atelektazi", label:"Atelektazi", type:"bool"},
      {key:"bt_sag_orta_atelektazi", label:"Sağ orta lob atelektazi", type:"bool"},
      {key:"bt_lingula_atelektazi", label:"Lingula atelektazi", type:"bool"},
      {key:"bt_diger_atelektazi", label:"Diğer atelektazi", type:"bool"},
      {key:"bt_bronsektazi", label:"Bronşektazi", type:"bool"},
      {key:"bt_sag_orta_bronsektazi", label:"Sağ orta lob bronşektazi", type:"bool"},
      {key:"bt_lingula_bronsektazi", label:"Lingula bronşektazi", type:"bool"},
      {key:"bt_diger_bronsektazi", label:"Diğer bronşektazi", type:"bool"},
      {key:"bt_buyuk_lobar_konsolidasyon", label:"Büyük lobar konsolidasyon", type:"bool"},
      {key:"bt_diffuz_bronsiolit", label:"Diffüz bronşiolit", type:"bool"},
      {key:"bhalla_skoru", label:"Bhalla skoru", type:"num", note:"rad"},
      {key:"teper_skoru", label:"Teper skoru", type:"num", note:"rad"},
      {key:"webb_skoru", label:"WEBB skoru", type:"num", note:"rad"},
    ]
  },
  tedavi: {
    label: "Tedavi", fields: [
      {key:"sistemik_steroid", label:"Sistemik steroid aldı", type:"bool", readonly:true},
      {key:"sistemik_steroid_mgkg_gun", label:"Sistemik steroid dozu (mg/kg/gün)", type:"num"},
      {key:"sistemik_steroid_gun", label:"Sistemik steroid aldığı gün", type:"num"},
      {key:"sistemik_steroid_plan_gun", label:"Planlanan sistemik steroid günü", type:"num"},
      {key:"kumulatif_sistemik_steroid_mgkg", label:"Kümülatif sistemik steroid (mg/kg)", type:"num", readonly:true},
      {key:"pulse_steroid", label:"Pulse steroid aldı", type:"bool", readonly:true},
      {key:"pulse_steroid_mgkg", label:"Pulse steroid dozu (mg/kg)", type:"select", options:[
        {v:"10", l:"10 mg/kg"},
        {v:"20", l:"20 mg/kg"},
        {v:"30", l:"30 mg/kg"},
      ]},
      {key:"tanidan_once_antibiyotik", label:"Tanı öncesi antibiyotik", type:"bool"},
      {key:"inhale_steroid_aldi", label:"İnhale steroid aldı", type:"bool", readonly:true},
      {key:"flutikazon_neb_2mg_adet_gun", label:"Flutikazon neb 2 mg sıklık", type:"select", options:DOSING_FREQUENCY_OPTIONS},
      {key:"flutikazon_neb_2mg_gun", label:"Flutikazon neb 2 mg gün", type:"num"},
      {key:"flutikazon_neb_05mg_adet_gun", label:"Flutikazon neb 0.5 mg sıklık", type:"select", options:DOSING_FREQUENCY_OPTIONS},
      {key:"flutikazon_neb_05mg_gun", label:"Flutikazon neb 0.5 mg gün", type:"num"},
      {key:"flutikazon_neb_toplam_mcg", label:"Neb flutikazon toplam (mcg)", type:"num", readonly:true},
      {key:"flutikazon_inhaler_125_puff_gun", label:"Flutikazon 125 mcg sıklık", type:"select", options:DOSING_FREQUENCY_OPTIONS},
      {key:"flutikazon_inhaler_125_gun", label:"Flutikazon 125 mcg gün", type:"num"},
      {key:"flutikazon_inhaler_50_puff_gun", label:"Flutikazon 50 mcg sıklık", type:"select", options:DOSING_FREQUENCY_OPTIONS},
      {key:"flutikazon_inhaler_50_gun", label:"Flutikazon 50 mcg gün", type:"num"},
      {key:"flutikazon_inhaler_toplam_mcg", label:"İnhaler flutikazon toplam (mcg)", type:"num", readonly:true},
      {key:"seretide_125_puff_gun", label:"Seretide 125 sıklık", type:"select", options:DOSING_FREQUENCY_OPTIONS},
      {key:"seretide_125_gun", label:"Seretide 125 gün", type:"num"},
      {key:"seretide_250_puff_gun", label:"Seretide 250 sıklık", type:"select", options:DOSING_FREQUENCY_OPTIONS},
      {key:"seretide_250_gun", label:"Seretide 250 gün", type:"num"},
      {key:"seretide_aldi", label:"Seretide aldı", type:"bool", readonly:true},
      {key:"seretide_toplam_flutikazon_mcg", label:"Seretide flutikazon toplam (mcg)", type:"num", readonly:true},
      {key:"toplam_inhale_steroid_mcg", label:"Toplam inhale steroid (mcg)", type:"num", readonly:true},
      {key:"azitromisin_aldi", label:"Azitromisin", type:"bool"},
      {key:"azitro_bitis_tarihi", label:"Azitromisin bitiş tarihi", type:"date"},
      {key:"azitro_bitis_tani_gun", label:"Tanı -> azitromisin bitişi (gün)", type:"num", readonly:true},
      {key:"montelukast_aldi", label:"Montelukast", type:"bool"},
      {key:"fam_aldi", label:"FAM aldı", type:"bool", readonly:true},
      {key:"bronchomunal", label:"Bronchomunal", type:"bool"},
      {key:"ivig_aldi", label:"IVIG verildi", type:"bool"},
      {key:"ivig_aliyor", label:"IVIG halen alıyor", type:"bool"},
      {key:"ventolin_aldi", label:"Ventolin", type:"bool"},
      {key:"tedavi_suresi_gun", label:"Tedavi süresi (gün)", type:"num"},
    ]
  },
  bal: {
    label: "BAL", fields: [
      {key:"bal_ureme", label:"BAL üreme", type:"bool"},
      {key:"bal_coklu_ureme", label:"BAL çoklu üreme", type:"bool"},
      {key:"bal_kultur1", label:"BAL kültür 1", type:"text"},
      {key:"bal_kultur2", label:"BAL kültür 2", type:"text"},
      {key:"bal_kultur3", label:"BAL kültür 3", type:"text"},
      {key:"bal_h_influenza", label:"H. influenzae üremesi", type:"bool"},
      {key:"bal_m_catarrhalis", label:"M. catarrhalis üremesi", type:"bool"},
      {key:"rpcr", label:"Respiratuvar PCR", type:"bool"},
      {key:"bal_solunum_pcr", label:"BAL solunum PCR sonucu", type:"text"},
      {key:"bal_cmv_pcr", label:"BAL CMV PCR", type:"bool"},
      {key:"bal_pjir", label:"BAL PJİR", type:"bool"},
      {key:"bal_lipid_ym", label:"BAL lipid yüklü makrofaj", type:"bool"},
      {key:"bal_hemosiderin_ym", label:"BAL hemosiderin yüklü makrofaj", type:"bool"},
      {key:"bal_lenfosit_subset", label:"BAL lenfosit subset yapıldı", type:"bool"},
      {key:"bal_lenfopeni", label:"BAL lenfopeni", type:"bool"},
      {key:"lokosit", label:"BAL lökosit sayısı", type:"num"},
      {key:"lenfosit_oran", label:"BAL lenfosit oranı (%)", type:"num"},
      {key:"notrofil_oran", label:"BAL nötrofil oranı (%)", type:"num"},
      {key:"eozinofil_oran", label:"BAL eozinofil oranı (%)", type:"num"},
      {key:"bal_cd3", label:"BAL CD3", type:"num"},
      {key:"bal_cd4", label:"BAL CD4", type:"num"},
      {key:"bal_cd8", label:"BAL CD8", type:"num"},
      {key:"bal_cd4_cd8", label:"BAL CD4/CD8", type:"num"},
      {key:"bal_cd19", label:"BAL CD19", type:"num"},
      {key:"bal_cd16_cd56", label:"BAL CD16/CD56", type:"num"},
      {key:"bal_cd45", label:"BAL CD45", type:"num"},
      {key:"bal_cd56", label:"BAL CD56", type:"num"},
      {key:"bal_cd22", label:"BAL CD22", type:"num"},
      {key:"bal_cd20", label:"BAL CD20", type:"num"},
      {key:"bal_cd16", label:"BAL CD16", type:"num"},
      {key:"bal_cd3_hladr", label:"BAL CD3+HLA-DR+", type:"num"},
    ]
  },
  immunoloji: {
    label: "İmmünoloji & Lab", fields: [
      {key:"imun_yetmezlik", label:"İmmün yetmezlik", type:"bool"},
      {key:"imdef", label:"İmmün yetmezlik açıklaması", type:"text"},
      {key:"tani_surecinde_imyetm", label:"Tanı sürecinde immün yetmezlik", type:"bool"},
      {key:"imdefdr", label:"İmmün yetmezlik tedavisi/notu", type:"text"},
      {key:"astim", label:"Astım", type:"bool"},
      {key:"alerjik_rinit", label:"Alerjik rinit", type:"bool"},
      {key:"atopik_dermatit", label:"Atopik dermatit", type:"bool"},
      {key:"kisisel_atopi", label:"Kişisel atopi", type:"bool"},
      {key:"aile_atopi", label:"Aile atopi", type:"bool"},
      {key:"spesifik_ige_pozitif", label:"Spesifik IgE pozitif", type:"bool"},
      {key:"iga", label:"IgA (g/L)", type:"num", hint:"g/L olarak girin; örn 0.48. Ondalık için nokta kullanın."},
      {key:"iga_dusuk", label:"IgA düşük", type:"bool", readonly:true},
      {key:"igm", label:"IgM (g/L)", type:"num", hint:"g/L olarak girin; örn 1.49. Ondalık için nokta kullanın."},
      {key:"igm_dusuk", label:"IgM düşük", type:"bool", readonly:true},
      {key:"igg", label:"IgG (g/L)", type:"num", hint:"g/L olarak girin; örn 7.91. Yaşa göre düşük hesabı otomatik yapılır."},
      {key:"igg_dusuk", label:"IgG düşük", type:"bool", readonly:true},
      {key:"ige", label:"IgE (IU/mL)", type:"num", hint:"IU/mL olarak girin; örn 55.4."},
      {key:"igg1", label:"IgG1 (g/L)", type:"num", hint:"g/L olarak girin; örn 9.89. Sistem mg/dL referansa çevirir."},
      {key:"igg1_dusuk", label:"IgG1 düşük", type:"bool", readonly:true},
      {key:"igg2", label:"IgG2 (g/L)", type:"num", hint:"g/L olarak girin; örn 0.95. Ondalık için nokta kullanın."},
      {key:"igg2_dusuk", label:"IgG2 düşük", type:"bool", readonly:true},
      {key:"igg3", label:"IgG3 (g/L)", type:"num", hint:"g/L olarak girin; örn 0.77. Ondalık için nokta kullanın."},
      {key:"igg3_dusuk", label:"IgG3 düşük", type:"bool", readonly:true},
      {key:"igg4", label:"IgG4 (g/L)", type:"num", hint:"g/L olarak girin; örn 0.57. Ondalık için nokta kullanın."},
      {key:"igg4_dusuk", label:"IgG4 düşük", type:"bool", readonly:true},
      {key:"cbc_bk", label:"Lökosit (/mm³)", type:"num"},
      {key:"cbc_neu", label:"Nötrofil (/mm³)", type:"num"},
      {key:"cbc_lym", label:"Lenfosit (/mm³)", type:"num"},
      {key:"lym_abs_dusuk", label:"Lenfosit düşük", type:"bool", readonly:true},
      {key:"cbc_eos", label:"Eozinofil (/mm³)", type:"num"},
      {key:"cbc_nlr", label:"NLR", type:"num", readonly:true},
      {key:"cd3", label:"Kan CD3 (%)", type:"num"},
      {key:"cd3_pct_dusuk", label:"CD3 % düşük", type:"bool", readonly:true},
      {key:"cd4", label:"Kan CD4 (%)", type:"num"},
      {key:"cd4_pct_dusuk", label:"CD4 % düşük", type:"bool", readonly:true},
      {key:"cd8", label:"Kan CD8 (%)", type:"num"},
      {key:"cd8_pct_dusuk", label:"CD8 % düşük", type:"bool", readonly:true},
      {key:"cd4_cd8", label:"Kan CD4/CD8", type:"num"},
      {key:"cd19", label:"Kan CD19", type:"num"},
      {key:"cd19_pct_dusuk", label:"CD19 % düşük", type:"bool", readonly:true},
      {key:"cd16_cd56", label:"Kan CD16/CD56", type:"num"},
      {key:"cd16_cd56_pct_dusuk", label:"CD16/56 % düşük", type:"bool", readonly:true},
      {key:"lswbc", label:"Lenfosit subset WBC", type:"num"},
      {key:"lslym_pct", label:"LS lenfosit %", type:"num"},
      {key:"lscd3_pct", label:"LS CD3 %", type:"num"},
      {key:"lscd3_abs", label:"LS CD3 abs", type:"num"},
      {key:"cd3_abs_dusuk", label:"CD3 abs düşük", type:"bool", readonly:true},
      {key:"lscd4_pct", label:"LS CD4 %", type:"num"},
      {key:"lscd4_abs", label:"LS CD4 abs", type:"num"},
      {key:"cd4_abs_dusuk", label:"CD4 abs düşük", type:"bool", readonly:true},
      {key:"lscd8_pct", label:"LS CD8 %", type:"num"},
      {key:"lscd8_abs", label:"LS CD8 abs", type:"num"},
      {key:"cd8_abs_dusuk", label:"CD8 abs düşük", type:"bool", readonly:true},
      {key:"lscd4_cd8", label:"LS CD4/CD8", type:"num"},
      {key:"lscd19", label:"LS CD19", type:"num"},
      {key:"cd19_abs_dusuk", label:"CD19 abs düşük", type:"bool", readonly:true},
      {key:"lscd56", label:"LS CD56", type:"num"},
      {key:"cd16_cd56_abs_dusuk", label:"CD16/56 abs düşük", type:"bool", readonly:true},
      {key:"lenfosit_subset_dusuk", label:"Lenfosit subset düşük var", type:"bool", readonly:true},
    ]
  },
  sft: {
    label: "SFT", fields: [
      {key:"sft_bas_tarihi", label:"Bazal SFT tarihi", type:"date"},
      {key:"fev1_bas", label:"FEV1 başlangıç (%)", type:"num"},
      {key:"fvc_bas", label:"FVC başlangıç (%)", type:"num"},
      {key:"mef2575_bas", label:"MEF25-75 başlangıç (%)", type:"num"},
      {key:"fev1_bd_bas", label:"Bazal BD FEV1 değişim (%)", type:"num"},
      {key:"mef2575_bd_bas", label:"Bazal BD MEF25-75 değişim (%)", type:"num"},
      {key:"dlco_bas", label:"DLCO başlangıç (%)", type:"num"},
      {key:"rv_bas", label:"RV başlangıç (%)", type:"num"},
      {key:"tlc_bas", label:"TLC başlangıç (%)", type:"num"},
      {key:"rv_tlc_bas", label:"RV/TLC başlangıç (%)", type:"num"},
      {key:"x5_bas", label:"X5 başlangıç", type:"num"},
      {key:"r5_bas", label:"R5 başlangıç", type:"num"},
      {key:"ax_bas", label:"AX başlangıç", type:"num"},
      {key:"sft_bit_tarihi", label:"Son SFT tarihi", type:"date"},
      {key:"fev1_bit", label:"FEV1 bitiş (%)", type:"num"},
      {key:"fvc_bit", label:"FVC bitiş (%)", type:"num"},
      {key:"mef2575_bit", label:"MEF25-75 bitiş (%)", type:"num"},
      {key:"bd_fev1", label:"BD FEV1 değişim bitiş (%)", type:"num"},
      {key:"bd_mef2575", label:"BD MEF25-75 değişim bitiş (%)", type:"num"},
      {key:"dlco_bit", label:"DLCO bitiş (%)", type:"num"},
      {key:"rv_bit", label:"RV bitiş (%)", type:"num"},
      {key:"tlc_bit", label:"TLC bitiş (%)", type:"num"},
      {key:"rv_tlc_bit", label:"RV/TLC bitiş (%)", type:"num"},
      {key:"x5_bit", label:"X5 bitiş", type:"num"},
      {key:"r5_bit", label:"R5 bitiş", type:"num"},
      {key:"ax_bit", label:"AX bitiş", type:"num"},
      {key:"xu_siddet", label:"Xu klinik şiddet (1-5)", type:"num", note:"kln"},
    ]
  },
  kardiyak_sonuc: {
    label: "Kardiyak & Sonuç", fields: [
      {key:"eko", label:"EKO yapıldı", type:"bool"},
      {key:"pht", label:"Pulmoner HT", type:"bool"},
      {key:"pap", label:"PAP (mmHg)", type:"num"},
      {key:"tedi_sonrasi_atak", label:"Tedavi sonrası atak sayısı", type:"num"},
      {key:"tedi_sonrasi_pnomoni", label:"Tedavi sonrası pnömoni sayısı", type:"num"},
      {key:"tedavi_sonucu", label:"Tedavi sonucu (1=iyi, 2=orta, 3=kötü)", type:"num"},
      {key:"semptom_devam", label:"Semptom devam ediyor", type:"bool"},
      {key:"ex", label:"Exitus", type:"bool"},
    ]
  },
  ptbo_tb: {
    label: "PTBO/TB", fields: [
      {key:"akciger_goruntuleme_yapildi", label:"Akciğer görüntüleme yapıldı", type:"bool"},
      {key:"akciger_goruntuleme_tarihi", label:"Akciğer görüntüleme tarihi", type:"date"},
      {key:"akciger_goruntuleme_yontemi", label:"Görüntüleme yöntemi", type:"select", options:[
        {v:"akciger_grafisi", l:"Akciğer grafisi"},
        {v:"toraks_bt", l:"Toraks BT"},
        {v:"hrct", l:"HRCT"},
        {v:"diger", l:"Diğer"},
      ]},
      {key:"akciger_goruntuleme_bulgu", label:"Görüntüleme bulgusu", type:"text"},
      {key:"ppd_mm", label:"PPD endürasyon (mm)", type:"num"},
      {key:"ppd_sonuc", label:"PPD sonucu", type:"select", options:[
        {v:"negatif", l:"Negatif"},
        {v:"pozitif", l:"Pozitif"},
        {v:"supheli", l:"Şüpheli"},
        {v:"yapilmadi", l:"Yapılmadı"},
      ]},
      {key:"tb_igra_sonuc", label:"TB IGRA sonucu", type:"select", options:[
        {v:"negatif", l:"Negatif"},
        {v:"pozitif", l:"Pozitif"},
        {v:"indeterminate", l:"Belirsiz"},
        {v:"yapilmadi", l:"Yapılmadı"},
      ]},
      {key:"tb_igra_tarihi", label:"TB IGRA tarihi", type:"date"},
      {key:"tb_mikrobiyoloji_pozitif", label:"TB mikrobiyoloji pozitif", type:"bool"},
      {key:"tb_tedavi_baslangic_tarihi", label:"TB tedavi başlangıç tarihi", type:"date"},
      {key:"tb_tedavi_suresi_ay", label:"TB tedavi süresi (ay)", type:"num"},
    ]
  },
}

const DERIVED_PATIENT_COLUMNS = [
  "tani_yas_ay",
  "growth_reference_status",
  "guncelleme_tarihi",
  "raw_excel_payload",
  "flutikazon_neb_toplam_mcg",
  "flutikazon_inhaler_toplam_mcg",
  "seretide_aldi",
  "seretide_toplam_flutikazon_mcg",
  "toplam_inhale_steroid_mcg",
  "inhale_steroid_aldi",
  "fam_aldi",
  "flutikazon",
  "azitromisin",
  "azitromisin_aldi",
  "montelukast",
  "montelukast_aldi",
  "ivig",
  "ivig_aldi",
  "sistemik_steroid",
  "steroid_baslangic_dozu",
  "kumulatif_sistemik_steroid_mgkg",
  "kumulatif_steroid",
  "pulse_steroid",
  "semptom_oncesi_gun",
  "azitro_bitis_tani_gun",
  "immunology_reference_source",
  "immunology_ig_ref_age_band",
  "lymphocyte_ref_age_band",
  "iga_alt_limit_mgdl",
  "igm_alt_limit_mgdl",
  "igg_alt_limit_mgdl",
  "igg1_alt_limit_mgdl",
  "igg2_alt_limit_mgdl",
  "igg3_alt_limit_mgdl",
  "igg4_alt_limit_mgdl",
  "lenfosit_subset_dusuk",
  "lym_abs_alt_limit",
  "lym_abs_dusuk",
  "cd3_pct_alt_limit",
  "cd3_pct_dusuk",
  "cd3_abs_alt_limit",
  "cd3_abs_dusuk",
  "cd4_pct_alt_limit",
  "cd4_pct_dusuk",
  "cd4_abs_alt_limit",
  "cd4_abs_dusuk",
  "cd8_pct_alt_limit",
  "cd8_pct_dusuk",
  "cd8_abs_alt_limit",
  "cd8_abs_dusuk",
  "cd19_pct_alt_limit",
  "cd19_pct_dusuk",
  "cd19_abs_alt_limit",
  "cd19_abs_dusuk",
  "cd16_cd56_pct_alt_limit",
  "cd16_cd56_pct_dusuk",
  "cd16_cd56_abs_alt_limit",
  "cd16_cd56_abs_dusuk",
]

function formFieldKeys(fieldGroups) {
  return Object.values(fieldGroups).flatMap(group => group.fields.map(field => field.key))
}

// UI-only alanlar (dogum_ay, dogum_yil, tani_ay, tani_yil) kasıtlı olarak dışarıda kalır.
const DB_COLUMN_KEYS = new Set([
  ...ORIGINAL_HASTALAR_COLUMNS,
  ...formFieldKeys(FIELD_GROUPS),
  ...DERIVED_PATIENT_COLUMNS,
])

// ─── styles ───────────────────────────────────────────────────────────────────
const s = {
  card: { background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:8, padding:"16px 20px", boxShadow:"none" },
  btn: { padding:"7px 16px", borderRadius:8, border:`1px solid ${THEME.redBorder}`, background:"#fff", color:THEME.burgundy, cursor:"pointer", fontSize:13 },
  btnPrimary: { padding:"8px 20px", borderRadius:8, border:`1px solid ${THEME.red}`, background:THEME.red, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:800 },
  btnDanger: { padding:"7px 16px", borderRadius:8, border:`1px solid ${THEME.red}`, background:THEME.red, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 },
  input: { width:"100%", fontSize:13, padding:"6px 8px", borderRadius:6, border:`1px solid ${THEME.redBorder}`, background:THEME.redField, color:THEME.ink, boxSizing:"border-box", caretColor:THEME.red },
  select: { width:"100%", fontSize:13, padding:"6px 8px", borderRadius:6, border:`1px solid ${THEME.redBorder}`, background:THEME.redField, color:THEME.ink, boxSizing:"border-box" },
  label: { display:"block", fontSize:11, color:THEME.burgundy, marginBottom:3, fontWeight:800, textTransform:"uppercase" },
  hint: { fontSize:10.5, color:THEME.burgundy, opacity:.76, marginTop:3, lineHeight:1.3 },
  badge: (color) => ({ fontSize:11, padding:"2px 8px", borderRadius:20, background: color==="blue"?THEME.redSoft:color==="amber"?"#fef3c7":"#f3f4f6", color: color==="blue"?THEME.red:color==="amber"?"#92400e":"#374151" }),
}

function BrandLockup({ align = "center", compact = false }) {
  const horizontal = align === "left"
  return (
    <div style={{
      display:"flex",
      alignItems:"center",
      justifyContent: horizontal ? "flex-start" : "center",
      gap: compact ? 10 : 12,
      textAlign: horizontal ? "left" : "center",
    }}>
      <div style={{width: compact ? 42 : 52, height: compact ? 42 : 52, borderRadius:8, border:`1px solid ${THEME.border}`, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flex:"0 0 auto"}}>
        <img
          src={BRAND.logo}
          alt=""
          aria-hidden="true"
          style={{
            width: compact ? 38 : 48,
            height: compact ? 38 : 48,
            objectFit:"contain",
            flex:"0 0 auto",
          }}
        />
      </div>
      <div>
        <div style={{fontSize: compact ? 19 : 22, fontWeight:800, color:THEME.ink, lineHeight:1.1}}>
          {BRAND.name}
        </div>
        <div style={{fontSize: compact ? 11 : 13, color:THEME.muted, marginTop: compact ? 3 : 5, maxWidth: compact ? 320 : 360}}>
          {BRAND.subtitle}
        </div>
      </div>
    </div>
  )
}

function AppHeader({ children, right }) {
  return (
    <div style={{borderBottom:`1px solid ${THEME.border}`, background:"#fff"}}>
      <div style={{maxWidth:920, margin:"0 auto", padding:"14px 18px", display:"flex", alignItems:"center", gap:12}}>
        <BrandLockup align="left" compact />
        {children}
        {right && <div style={{marginLeft:"auto"}}>{right}</div>}
      </div>
    </div>
  )
}

// ─── Login ───────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [code, setCode] = useState("")
  const [err, setErr] = useState("")

  function tryLogin() {
    const c = code.trim().toUpperCase()
    if (CENTERS[c]) onLogin(c, CENTERS[c])
    else { setErr("Geçersiz merkez kodu."); setCode("") }
  }

  return (
    <div style={{minHeight:"100vh", background:THEME.page}}>
      <AppHeader />
      <main style={{maxWidth:620, margin:"0 auto", padding:"18px"}}>
        <section style={{...s.card, textAlign:"center", marginBottom:14, padding:"18px"}}>
          <img src={BRAND.logo} alt="" aria-hidden="true" style={{width:"100%", maxWidth:190, height:150, objectFit:"contain", margin:"0 auto 8px", display:"block"}} />
          <div style={{fontSize:13, color:THEME.red, fontWeight:800, marginBottom:8}}>Registry veri ağı</div>
          <h1 style={{fontSize:26, lineHeight:1.2, color:THEME.ink, margin:0, fontWeight:900}}>PIBO-TR Registry</h1>
          <p style={{fontSize:15, color:THEME.muted, lineHeight:1.5, margin:"10px auto 0", maxWidth:430}}>
            Pediatrik ve post-transplant bronşiyolitis obliterans için merkezler arası klinik veri girişi.
          </p>
        </section>

        <section style={{...s.card, padding:14}}>
          <div style={{background:THEME.amberSoft, border:`1px solid ${THEME.amberBorder}`, borderRadius:8, padding:"8px 10px", marginBottom:12}}>
            <div style={{fontSize:11, lineHeight:1.4, color:THEME.amberText, fontWeight:800}}>
              Kontrollü merkez girişi · KOC / MED / ADMIN
            </div>
          </div>
          <label style={s.label}>Merkez kodu</label>
          <input
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setErr("") }}
            onKeyDown={e => e.key==="Enter" && tryLogin()}
            placeholder="KOC veya MED"
            autoFocus
            style={{...s.input, minHeight:46, fontSize:16, letterSpacing:3, fontWeight:800, marginBottom:4, color:THEME.ink, borderColor:"#dfdfe3", caretColor:THEME.red}}
          />
          {err && <div style={{fontSize:12, color:"#dc2626", marginBottom:8}}>{err}</div>}
          <button onClick={tryLogin} style={{...s.btnPrimary, width:"100%", marginTop:10, minHeight:44, padding:11}}>
            PIBO-TR’ye gir
          </button>
        </section>

        <div style={{textAlign:"center", marginTop:12, fontSize:11, lineHeight:1.5, color:THEME.muted, fontWeight:700}}>
          Merkez kodunuz için koordinatör merkez ile iletişime geçin
        </div>
      </main>
    </div>
  )
}

// ─── Action Screen ────────────────────────────────────────────────────────────
function ActionScreen({ center, centerInfo, patients, onAction, onLogout }) {
  const my = centerInfo.isAdmin ? patients : patients.filter(p => p.hasta_id.startsWith(centerInfo.prefix + "-"))
  const pibo = my.filter(p => p.pibo == 1)
  const ptbo = my.filter(p => p.ptbo == 1)
  const nextId = centerInfo.isAdmin ? "" : `${centerInfo.prefix}-${String(my.length + 1).padStart(3, "0")}`

  return (
    <div style={{minHeight:"100vh", background:THEME.page}}>
      <AppHeader right={<button onClick={onLogout} style={{...s.btn, fontSize:12}}>Çıkış</button>} />

      <main style={{maxWidth:920, margin:"0 auto", padding:"18px"}}>
        <section style={{...s.card, textAlign:"center", marginBottom:14, padding:"18px"}}>
          <img src={BRAND.logo} alt="" aria-hidden="true" style={{width:"100%", maxWidth:150, height:118, objectFit:"contain", margin:"0 auto 8px", display:"block"}} />
          <div style={{fontSize:13, color:THEME.red, fontWeight:800, marginBottom:8}}>Registry çalışma alanı</div>
          <h1 style={{fontSize:26, lineHeight:1.2, color:THEME.ink, margin:0, fontWeight:900}}>{centerInfo.label}</h1>
          <p style={{fontSize:15, color:THEME.muted, lineHeight:1.5, margin:"10px auto 0", maxWidth:520}}>
            Başlangıç kaydı, klinik takip ve merkez verilerini aynı sakin akış içinde yönetin.
          </p>
        </section>

        <section style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginBottom:14}}>
          {[
            ["Toplam", my.length],
            ["PIBO", pibo.length],
            ["PTBO", ptbo.length],
          ].map(([label, value]) => (
            <div key={label} style={{...s.card, background:THEME.card, padding:"12px 14px"}}>
              <div style={{fontSize:12, color:THEME.red, fontWeight:900, textTransform:"uppercase"}}>{label}</div>
              <div style={{fontSize:24, color:THEME.ink, fontWeight:900, marginTop:4}}>{value}</div>
            </div>
          ))}
        </section>

        <section style={{...s.card, marginBottom:14, padding:14}}>
          <div style={{fontSize:13, fontWeight:900, color:THEME.red, textTransform:"uppercase", marginBottom:10}}>Pratik işlem</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:10}}>
            <button onClick={() => onAction("new")} style={{background:THEME.card, border:"1px solid #e9e9eb", borderRadius:8, padding:14, textAlign:"left", cursor:"pointer"}}>
              <div style={{width:34, height:34, borderRadius:8, background:THEME.red, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:800, marginBottom:10}}>+</div>
              <div style={{fontSize:15, fontWeight:900, color:THEME.ink}}>Yeni hasta ekle</div>
              <div style={{fontSize:12, color:THEME.muted, marginTop:5}}>
                {centerInfo.isAdmin ? "Herhangi bir merkez için" : `Önerilen ID: ${nextId}`}
              </div>
            </button>

            <button onClick={() => onAction("update")} style={{background:THEME.card, border:"1px solid #e9e9eb", borderRadius:8, padding:14, textAlign:"left", cursor:"pointer"}}>
              <div style={{width:34, height:34, borderRadius:8, background:"#fff", border:`1px solid ${THEME.redBorder}`, color:THEME.red, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:800, marginBottom:10}}>✎</div>
              <div style={{fontSize:15, fontWeight:900, color:THEME.ink}}>Mevcut kaydı güncelle</div>
              <div style={{fontSize:12, color:THEME.muted, marginTop:5}}>{my.length} hasta listesinden seç</div>
            </button>

            <button onClick={() => onAction("followup")} style={{background:THEME.redSoft, border:`1px solid ${THEME.redBorder}`, borderRadius:8, padding:14, textAlign:"left", cursor:"pointer"}}>
              <div style={{width:34, height:34, borderRadius:8, background:THEME.red, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, marginBottom:10}}>K</div>
              <div style={{fontSize:15, fontWeight:900, color:THEME.red}}>Klinik takip</div>
              <div style={{fontSize:12, color:THEME.muted, marginTop:5}}>Başlangıç kaydı yapılmış hastaya izlem ziyareti ekle</div>
            </button>
          </div>
        </section>

        {centerInfo.isAdmin && (
          <button onClick={() => onAction("admin")} style={{...s.card, width:"100%", textAlign:"left", cursor:"pointer", border:`1px solid ${THEME.amberBorder}`, background:THEME.amberSoft, marginBottom:14}}>
            <div style={{fontSize:13, fontWeight:900, color:THEME.amberText}}>Admin paneli — tüm merkezler, analiz, istatistik →</div>
          </button>
        )}

        <div style={s.card}>
          <div style={{fontSize:13, fontWeight:900, color:THEME.red, textTransform:"uppercase", marginBottom:10}}>Son eklenen hastalar</div>
          {my.slice(-5).reverse().map(p => (
            <div key={p.hasta_id} style={{display:"flex", width:"100%", alignItems:"center", gap:8, padding:"8px 0", borderBottom:"1px solid #f3f4f6", textAlign:"left"}}>
              <span style={{fontSize:13, fontWeight:800, minWidth:90, color:THEME.ink}}>{p.hasta_id}</span>
              <span style={s.badge(p.pibo ? "blue" : "amber")}>{p.pibo ? "PIBO" : "PTBO"}</span>
              <span style={{fontSize:12, color:THEME.muted}}>{p.cinsiyet==="e"?"E":"K"} · {p.yas_ay?.toFixed(0)} ay</span>
              <span style={{fontSize:12, color:"#9ca3af"}}>D: {formatDateDisplay(p.dogum_tarihi)}</span>
              <span style={{marginLeft:"auto", fontSize:12, color:"#9ca3af"}}>Tanı {formatDateDisplay(p.tani_tarihi)}</span>
            </div>
          ))}
          {my.length === 0 && <div style={{fontSize:13, color:"#9ca3af", textAlign:"center", padding:12}}>Henüz hasta yok</div>}
        </div>
      </main>
    </div>
  )
}

// ─── Patient Select ───────────────────────────────────────────────────────────
function SelectPatient({ patients, centerInfo, onSelect, onBack, title = "Hasta seç", subtitle = "" }) {
  const [search, setSearch] = useState("")
  const my = centerInfo.isAdmin ? patients : patients.filter(p => p.hasta_id.startsWith(centerInfo.prefix + "-"))
  const filtered = my.filter(p => p.hasta_id.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{maxWidth:600, margin:"0 auto", padding:"20px"}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:16}}>
        <button onClick={onBack} style={s.btn}>← Geri</button>
        <div>
          <div style={{fontSize:16, fontWeight:500, color:THEME.ink}}>{title}</div>
          {subtitle && <div style={{fontSize:12, color:THEME.muted, marginTop:2}}>{subtitle}</div>}
        </div>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hasta ID ile ara..." autoFocus style={{...s.input, marginBottom:10}} />
      {filtered.map(p => (
        <button key={p.hasta_id} onClick={() => onSelect(p)} style={{display:"flex", width:"100%", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer", marginBottom:6, textAlign:"left"}}>
          <span style={{fontSize:14, fontWeight:500, minWidth:90}}>{p.hasta_id}</span>
          <span style={s.badge(p.pibo ? "blue" : "amber")}>{p.pibo ? "PIBO" : "PTBO"}</span>
          <span style={{fontSize:12, color:"#6b7280"}}>{p.cinsiyet==="e"?"Erkek":"Kız"} · {p.yas_ay?.toFixed(1)} ay</span>
          <span style={{fontSize:12, color:"#9ca3af"}}>D: {formatDateDisplay(p.dogum_tarihi)}</span>
          <span style={{marginLeft:"auto", fontSize:12, color:"#9ca3af"}}>Tanı {formatDateDisplay(p.tani_tarihi)}</span>
        </button>
      ))}
      {filtered.length === 0 && <div style={{fontSize:13, color:"#9ca3af", textAlign:"center", padding:20}}>Hasta bulunamadı</div>}
    </div>
  )
}

// ─── Patient Form ─────────────────────────────────────────────────────────────
function ClinicalFollowUpScreen({ patient, onBack, onEdit }) {
  const displayPatient = {...patient, ...calculateDerivedFields(patient)}
  const diagnosis = patient?.pibo == 1 ? "PIBO" : patient?.ptbo == 1 ? "PTBO" : "Tanı grubu seçilmemiş"

  return (
    <div style={{maxWidth:720, margin:"0 auto", padding:"20px"}}>
      <div style={{...s.card, marginBottom:14, border:`1px solid ${THEME.redBorder}`, background:`linear-gradient(135deg, ${THEME.redSoft}, #fff)`}}>
        <div style={{display:"flex", alignItems:"center", gap:12, flexWrap:"wrap"}}>
          <button onClick={onBack} style={s.btn}>← Geri</button>
          <div>
            <div style={{fontSize:18, fontWeight:700, color:THEME.burgundy}}>Klinik takip</div>
            <div style={{fontSize:12, color:THEME.muted, marginTop:3}}>
              {patient?.hasta_id} · {diagnosis} · D: {formatDateDisplay(patient?.dogum_tarihi)} · Tanı: {formatDateDisplay(patient?.tani_tarihi)}
            </div>
          </div>
          <button onClick={onEdit} style={{...s.btn, marginLeft:"auto", borderColor:THEME.redBorder, color:THEME.red}}>
            Klinik kaydı düzenle
          </button>
        </div>
      </div>
      <FollowUpPanel
        patient={displayPatient}
        fields={FOLLOWUP_FIELDS}
        s={s}
        dateToInput={dateToInput}
        daysBetween={daysBetween}
        round={round}
        numberOrNull={numberOrNull}
        classifyClinicalCourse={classifyClinicalCourse}
        clinicalCourseLabel={clinicalCourseLabel}
        formatSupabaseError={formatSupabaseError}
      />
    </div>
  )
}

function PatientForm({ patient, isNew, onSave, onBack }) {
  const [form, setForm] = useState({...patient})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [saveError, setSaveError] = useState("")
  const [activeGroup, setActiveGroup] = useState("genel")

  useEffect(() => {
    if (activeGroup === "ptbo_tb" && form.ptbo != 1) setActiveGroup("genel")
  }, [activeGroup, form.ptbo])

  function set(key, val) { setForm(f => ({...f, [key]: val})) }

  async function handleSave() {
    setSaving(true)
    setSaveError("")
    setSaveMessage("")
    try {
      const result = await onSave(form)
      setSaved(true)
      setSaveMessage(result?.warning || "Kaydedildi.")
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      setSaved(false)
      setSaveError(error.message || "Kayıt başarısız.")
    } finally {
      setSaving(false)
    }
  }

  const groups = Object.entries(FIELD_GROUPS).filter(([key]) => key !== "ptbo_tb" || form.ptbo == 1)
  const displayForm = {...form, ...calculateDerivedFields(form)}

  return (
    <div style={{maxWidth:720, margin:"0 auto", padding:"20px"}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:16}}>
        <button onClick={onBack} style={s.btn}>← Geri</button>
        <span style={{fontSize:16, fontWeight:500}}>{isNew ? "Yeni hasta" : form.hasta_id}</span>
        {!isNew && <span style={s.badge(form.pibo ? "blue" : "amber")}>{form.pibo ? "PIBO" : "PTBO"}</span>}
        <button onClick={handleSave} disabled={saving} style={{...s.btnPrimary, marginLeft:"auto", background: saved?"#d1fae5":THEME.redSoft, borderColor: saved?"#6ee7b7":THEME.red, color: saved?"#065f46":THEME.red}}>
          {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      </div>
      {(saveError || saveMessage) && (
        <div style={{
          border:"1px solid",
          borderColor: saveError ? "#fecaca" : saveMessage.includes("SQL") ? "#fde68a" : "#bbf7d0",
          background: saveError ? "#fef2f2" : saveMessage.includes("SQL") ? "#fffbeb" : "#f0fdf4",
          color: saveError ? "#991b1b" : saveMessage.includes("SQL") ? "#92400e" : "#166534",
          borderRadius:8,
          padding:"10px 12px",
          fontSize:13,
          marginBottom:12,
        }}>
          {saveError || saveMessage}
        </div>
      )}

      <div style={{display:"flex", gap:4, flexWrap:"wrap", marginBottom:14}}>
        {groups.map(([k, g]) => {
          const missing = g.fields.filter(f => f.note && form[f.key] == null).length
          return (
            <button key={k} onClick={() => setActiveGroup(k)} style={{fontSize:12, padding:"4px 12px", borderRadius:20, border:"1px solid", borderColor: activeGroup===k?THEME.red:"#e5e7eb", background: activeGroup===k?THEME.redSoft:"#fff", color: activeGroup===k?THEME.red:"#6b7280", cursor:"pointer", fontWeight: activeGroup===k?500:400}}>
              {g.label}{missing > 0 ? ` ⚠${missing}` : ""}
            </button>
          )
        })}
        {!isNew && (
          <>
            <button onClick={() => setActiveGroup("izlem")} style={{fontSize:12, padding:"4px 12px", borderRadius:20, border:"1px solid", borderColor: activeGroup==="izlem"?THEME.red:"#e5e7eb", background: activeGroup==="izlem"?THEME.redSoft:"#fff", color: activeGroup==="izlem"?THEME.red:"#6b7280", cursor:"pointer", fontWeight: activeGroup==="izlem"?500:400}}>
              İzlem ziyaretleri
            </button>
            <button onClick={() => setActiveGroup("sft_kayitlari")} style={{fontSize:12, padding:"4px 12px", borderRadius:20, border:"1px solid", borderColor: activeGroup==="sft_kayitlari"?THEME.red:"#e5e7eb", background: activeGroup==="sft_kayitlari"?THEME.redSoft:"#fff", color: activeGroup==="sft_kayitlari"?THEME.red:"#6b7280", cursor:"pointer", fontWeight: activeGroup==="sft_kayitlari"?500:400}}>
              SFT kayıtları
            </button>
          </>
        )}
      </div>

      {activeGroup === "izlem" ? (
        <FollowUpPanel
          patient={displayForm}
          fields={FOLLOWUP_FIELDS}
          s={s}
          dateToInput={dateToInput}
          daysBetween={daysBetween}
          round={round}
          numberOrNull={numberOrNull}
          classifyClinicalCourse={classifyClinicalCourse}
          clinicalCourseLabel={clinicalCourseLabel}
          formatSupabaseError={formatSupabaseError}
        />
      ) : activeGroup === "sft_kayitlari" ? (
        <PftPanel
          patient={displayForm}
          fields={PFT_FIELDS}
          s={s}
          dateToInput={dateToInput}
          daysBetween={daysBetween}
          round={round}
          formatSupabaseError={formatSupabaseError}
        />
      ) : <div style={s.card}>
        <div style={{fontSize:14, fontWeight:500, marginBottom:14}}>{FIELD_GROUPS[activeGroup].label}</div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12}}>
          {FIELD_GROUPS[activeGroup].fields.map(f => {
            const val = displayForm[f.key]
            return (
              <div key={f.key}>
                <label style={{...s.label, color: f.note ? "#d97706" : f.required && val==null ? "#dc2626" : "#6b7280"}}>
                  {f.label}
                  {f.note==="rad" && <span style={{marginLeft:4, fontSize:10, opacity:.7}}>(radyoloji)</span>}
                  {f.note==="kln" && <span style={{marginLeft:4, fontSize:10, opacity:.7}}>(klinisyen)</span>}
                </label>
                {f.readonly ? (
                  <input value={f.type==="bool" ? (val == null ? "" : val == 1 ? "Evet" : "Hayır") : val??""} readOnly style={{...s.input, color:"#6b7280", background:"#f3f4f6"}} />
                ) : f.type==="bool" ? (
                  <select value={val??""} onChange={e => set(f.key, e.target.value===""?null:Number(e.target.value))} style={s.select}>
                    <option value="">— bilinmiyor</option>
                    <option value="1">Evet</option>
                    <option value="0">Hayır</option>
                  </select>
                ) : f.type==="select" ? (
                  <select value={val??""} onChange={e => set(f.key, e.target.value||null)} style={s.select}>
                    <option value="">—</option>
                    {f.options?.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                ) : f.type==="date" ? (
                  <input type="date" value={dateToInput(val)} onChange={e => set(f.key, e.target.value||null)} style={{...s.input, borderColor: f.required&&val==null?"#fca5a5":THEME.redBorder}} />
                ) : (
                  <input type={f.type==="num"?"number":"text"} step={f.type==="num"?"any":undefined} value={val??""} onChange={e => set(f.key, e.target.value===""?null:(f.type==="num"?Number(e.target.value):e.target.value))} style={{...s.input, borderColor: f.note&&val==null?"#fbbf24":f.required&&val==null?"#fca5a5":THEME.redBorder}} />
                )}
                {f.hint && <div style={s.hint}>{f.hint}</div>}
              </div>
            )
          })}
        </div>
      </div>}
      {activeGroup !== "izlem" && activeGroup !== "sft_kayitlari" && (
        <button onClick={handleSave} disabled={saving} style={{...s.btnPrimary, width:"100%", marginTop:12, padding:10, fontSize:14}}>
          {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      )}
    </div>
  )
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────
function AdminPanel({ patients, onBack, onDelete, onRecalculateAll }) {
  const [filterGroup, setFilterGroup] = useState("all")
  const [query, setQuery] = useState("")
  const [result, setResult] = useState("")
  const [deleteTarget, setDeleteTarget] = useState("")
  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [recalcLoading, setRecalcLoading] = useState(false)

  const pibo = patients.filter(p => p.pibo == 1)
  const ptbo = patients.filter(p => p.ptbo == 1)
  const display = filterGroup==="pibo" ? pibo : filterGroup==="ptbo" ? ptbo : patients

  async function runAnalysis() {
    if (!query.trim()) return
    setLoading(true); setResult("")
    try {
      const summary = {
        n_total: patients.length, n_pibo: pibo.length, n_ptbo: ptbo.length,
        pibo_median_yas: pibo.length ? (pibo.reduce((a,p) => a+(p.yas_ay||0),0)/pibo.length).toFixed(1) : null,
        pibo_erkek_pct: pibo.length ? Math.round(pibo.filter(p=>p.cinsiyet==="e").length/pibo.length*100) : null,
        pibo_adv_pct: pibo.length ? Math.round(pibo.filter(p=>p.etken_adenovirus==1).length/pibo.length*100) : null,
        pibo_bronsektazi_pct: pibo.length ? Math.round(pibo.filter(p=>p.bt_bronsektazi==1).length/pibo.length*100) : null,
        merkezler: [...new Set(patients.map(p=>p.hasta_id.split("-")[0]))]
      }
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, patients })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || "API hatası")
      setResult(data.result || "Yanıt alınamadı.")
    } catch(e) { setResult("Hata: " + e.message) }
    setLoading(false)
  }

  async function downloadReport() {
    setReportLoading(true)
    try {
      const resp = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patients })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || "Rapor oluşturulamadı")
      const blob = new Blob([data.html], { type: "text/html;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `PIBO_Registry_Rapor_${new Date().toISOString().slice(0,10)}.html`
      a.click()
      URL.revokeObjectURL(url)
    } catch(e) { alert("Rapor hatası: " + e.message) }
    setReportLoading(false)
  }

  async function handleDelete(patient) {
    if (!patient?.hasta_id) {
      setDeleteError("Silmek için hasta seçin.")
      return
    }
    const ok = window.confirm(`${patient.hasta_id} kaydı tümüyle silinsin mi? Bu işlem geri alınamaz.`)
    if (!ok) return

    setDeleteError("")
    setDeleteMessage("")
    try {
      await onDelete(patient.hasta_id)
      setDeleteMessage(`${patient.hasta_id} silindi.`)
      setDeleteTarget("")
      setTimeout(() => setDeleteMessage(""), 2500)
    } catch (error) {
      setDeleteError(error.message || "Silme işlemi başarısız.")
    }
  }

  async function handleRecalculateAll() {
    const ok = window.confirm("Tüm hasta kayıtları yaş, büyüme, tedavi ve immünoloji otomatik alanlarıyla yeniden hesaplansın mı?")
    if (!ok) return

    setDeleteError("")
    setDeleteMessage("")
    setRecalcLoading(true)
    try {
      const result = await onRecalculateAll()
      setDeleteMessage(`${result.count} hasta yeniden hesaplandı. Ig/subset ölçümü olan ${result.immunologyCount} kayıt güncellendi.`)
    } catch (error) {
      setDeleteError(error.message || "Toplu yeniden hesaplama başarısız.")
    } finally {
      setRecalcLoading(false)
    }
  }

  function buildExportRows() {
    return patients.map(patient => ({
      ...patient,
      ...calculateDerivedFields(patient),
      merkez: patient.hasta_id.split("-")[0],
    }))
  }

  function handleExportPatientsCsv() {
    const today = new Date().toISOString().slice(0, 10)
    const rows = buildExportRows()
    downloadCsv(`pibo_registry_hastalar_${today}.csv`, rows)
    setDeleteMessage(`${rows.length} hasta Excel/CSV dosyası olarak indirildi.`)
    setTimeout(() => setDeleteMessage(""), 2500)
  }

  function handleExportPatientsExcel() {
    const today = new Date().toISOString().slice(0, 10)
    const rows = buildExportRows()
    downloadExcel(`pibo_registry_hastalar_${today}.xls`, rows)
    setDeleteMessage(`${rows.length} hasta Excel dosyası olarak indirildi.`)
    setTimeout(() => setDeleteMessage(""), 2500)
  }

  return (
    <div style={{maxWidth:900, margin:"0 auto", padding:"20px"}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:20}}>
        <button onClick={onBack} style={s.btn}>← Geri</button>
        <span style={{fontSize:16, fontWeight:500}}>Admin Paneli</span>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16}}>
        {[["Toplam",patients.length],["PIBO",pibo.length],["PTBO",ptbo.length],["Bhalla eksik",patients.filter(p=>p.bhalla_skoru==null).length]].map(([l,v]) => (
          <div key={l} style={{background:"#f9fafb", borderRadius:8, padding:"10px 14px"}}>
            <div style={{fontSize:11, color:"#6b7280", marginBottom:3}}>{l}</div>
            <div style={{fontSize:24, fontWeight:600}}>{v}</div>
          </div>
        ))}
      </div>

      {(deleteError || deleteMessage) && (
        <div style={{
          border:"1px solid",
          borderColor: deleteError ? "#fecaca" : "#bbf7d0",
          background: deleteError ? "#fef2f2" : "#f0fdf4",
          color: deleteError ? "#991b1b" : "#166534",
          borderRadius:8,
          padding:"10px 12px",
          fontSize:13,
          marginBottom:12,
        }}>
          {deleteError || deleteMessage}
        </div>
      )}

      <div style={{...s.card, marginBottom:14}}>
        <div style={{fontSize:13, fontWeight:500, marginBottom:8}}>Veri bakım</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:8, marginBottom:8}}>
          <button onClick={handleRecalculateAll} disabled={recalcLoading} style={s.btnPrimary}>
            {recalcLoading ? "Yeniden hesaplanıyor..." : "Tüm otomatik alanları yeniden hesapla"}
          </button>
          <button onClick={handleExportPatientsExcel} style={s.btn}>
            Hasta verisini Excel indir
          </button>
          <button onClick={handleExportPatientsCsv} style={s.btn}>
            CSV indir
          </button>
        </div>
        <div style={{fontSize:12, color:"#6b7280"}}>
          Eski kayıtların hesaplanan alanlarını tekrar kaydeder; indirme düğmeleri tüm hasta tablosunu dışa aktarır.
        </div>
      </div>

      <div style={{...s.card, marginBottom:14, borderColor:THEME.redBorder, background:"#fffafa"}}>
        <div style={{fontSize:13, fontWeight:600, color:THEME.red, marginBottom:8}}>Hasta kaydı silme</div>
        <div style={{display:"grid", gridTemplateColumns:"minmax(220px,1fr) auto", gap:8, alignItems:"center"}}>
          <select value={deleteTarget} onChange={e => setDeleteTarget(e.target.value)} style={s.select}>
            <option value="">Silinecek hastayı seçin</option>
            {patients.map(patient => (
              <option key={patient.hasta_id} value={patient.hasta_id}>
                {patient.hasta_id} - {patient.pibo ? "PIBO" : "PTBO"}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleDelete(patients.find(patient => patient.hasta_id === deleteTarget))}
            disabled={!deleteTarget}
            style={{...s.btnDanger, opacity: deleteTarget ? 1 : 0.55}}
          >
            Seçili hastayı sil
          </button>
        </div>
        <div style={{fontSize:12, color:"#7f1d1d", marginTop:8}}>
          Bu işlem hastanın ana kaydını ve ilişkili izlem/SFT kayıtlarını kalıcı olarak siler.
        </div>
      </div>

      <div style={{...s.card, marginBottom:14}}>
        <div style={{fontSize:13, fontWeight:500, marginBottom:8}}>Yapay zeka destekli analiz</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:8}}>
          {["PIBO grubunu demografik olarak özetle","Etken dağılımını analiz et","Tedavi sonuçlarını değerlendir","BT bulgularını özetle","FEV1 değişimini yorumla","İmmünolojik profili değerlendir"].map(q => (
            <button key={q} onClick={() => setQuery(q)} style={{...s.btn, fontSize:11, padding:"3px 10px"}}>{q}</button>
          ))}
        </div>
        <textarea value={query} onChange={e => setQuery(e.target.value)} rows={2} placeholder="Sorunuzu yazın..." style={{...s.input, resize:"vertical", marginBottom:8}} />
        <div style={{display:"flex", gap:8}}>
          <button onClick={runAnalysis} disabled={loading} style={s.btnPrimary}>
            {loading ? "Analiz yapılıyor..." : "Analiz et →"}
          </button>
          <button onClick={downloadReport} disabled={reportLoading} style={{...s.btn, background:"#f0fdf4", borderColor:"#86efac", color:"#166534"}}>
            {reportLoading ? "Rapor oluşturuluyor..." : "📄 Tam Rapor İndir"}
          </button>
        </div>
        {result && <div style={{marginTop:12, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap", borderTop:"1px solid #f3f4f6", paddingTop:12}}>{result}</div>}
      </div>

      <div style={{display:"flex", gap:6, marginBottom:10}}>
        {[["all","Tümü"],["pibo","PIBO"],["ptbo","PTBO"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilterGroup(v)} style={{...s.btn, fontWeight: filterGroup===v?500:400, background: filterGroup===v?THEME.redSoft:"#fff", borderColor: filterGroup===v?THEME.red:"#e5e7eb", color: filterGroup===v?THEME.red:"#374151"}}>{l}</button>
        ))}
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
          <thead>
            <tr style={{borderBottom:"1px solid #e5e7eb"}}>
              {["ID","Grup","Merkez","Cinsiyet","Yaş (ay)","FEV1 bas","FEV1 bit","Sonuç","İşlem"].map(h => (
                <th key={h} style={{textAlign:"left", padding:"6px 8px", color:"#6b7280", fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {display.map(p => (
              <tr key={p.hasta_id} style={{borderBottom:"1px solid #f3f4f6"}}>
                <td style={{padding:"5px 8px", fontWeight:500}}>{p.hasta_id}</td>
                <td style={{padding:"5px 8px"}}><span style={s.badge(p.pibo?"blue":"amber")}>{p.pibo?"PIBO":"PTBO"}</span></td>
                <td style={{padding:"5px 8px", color:"#6b7280"}}>{p.hasta_id.split("-")[0]}</td>
                <td style={{padding:"5px 8px"}}>{p.cinsiyet==="e"?"E":"K"}</td>
                <td style={{padding:"5px 8px"}}>{p.yas_ay?.toFixed(1)??"-"}</td>
                <td style={{padding:"5px 8px", color: p.fev1_bas==null?"#9ca3af":p.fev1_bas<70?"#dc2626":"#16a34a"}}>{p.fev1_bas!=null?p.fev1_bas+"%":"-"}</td>
                <td style={{padding:"5px 8px", color: p.fev1_bit==null?"#9ca3af":p.fev1_bit<70?"#dc2626":"#16a34a"}}>{p.fev1_bit!=null?p.fev1_bit+"%":"-"}</td>
                <td style={{padding:"5px 8px"}}>{p.tedavi_sonucu?["","İyi","Orta","Kötü"][p.tedavi_sonucu]:"-"}</td>
                <td style={{padding:"5px 8px", textAlign:"right"}}>
                  <button
                    onClick={() => handleDelete(p)}
                    style={{...s.btnDanger, fontSize:11, padding:"4px 8px"}}
                  >
                    Kaydı sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState("action")
  const [editing, setEditing] = useState(null)

  // Supabase gerçek veri kaynağıdır; örnek veri frontend bundle'ına gömülmez
  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        setPatients(await listPatients())
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function savePatient(p) {
    const full = { ...p, ...calculateDerivedFields(p), merkez: p.hasta_id.split("-")[0], guncelleme_tarihi: new Date().toISOString() }
    // UI-only alanları (dogum_ay, dogum_yil, tani_ay, tani_yil vb.) Supabase'e gönderme
    const record = pickRecordColumns(full, DB_COLUMN_KEYS)

    try {
      await upsertPatients(record)
    } catch (error) {
      console.error("Supabase save failed:", error)
      const details = formatSupabaseError(error)
      throw new Error(details ? `${details} Supabase SQL migrasyonu eksik olabilir.` : "Supabase kayıt hatası. SQL migrasyonunu kontrol edin.")
    }

    setPatients(prev => {
      const idx = prev.findIndex(x => x.hasta_id === p.hasta_id)
      return idx >= 0 ? prev.map((x,i) => i===idx ? full : x) : [...prev, full]
    })
    return {}
  }

  async function deletePatient(hastaId) {
    try {
      await deletePatientById(hastaId)
    } catch (error) {
      console.error("Supabase delete failed:", error)
      throw new Error(formatSupabaseError(error) || "Supabase silme hatası.")
    }
    setPatients(prev => prev.filter(patient => patient.hasta_id !== hastaId))
  }

  async function recalculateAllPatients() {
    const recalculated = patients.map(patient => ({
      ...patient,
      ...calculateDerivedFields(patient),
      merkez: patient.hasta_id.split("-")[0],
      guncelleme_tarihi: new Date().toISOString(),
    }))
    try {
      await upsertPatients(recalculated)
    } catch (error) {
      console.error("Supabase recalculation failed:", error)
      throw new Error(formatSupabaseError(error) || "Supabase toplu güncelleme hatası.")
    }

    setPatients(recalculated)
    const immunologyCount = recalculated.filter(patient =>
      [
        patient.iga,
        patient.igm,
        patient.igg,
        patient.igg1,
        patient.igg2,
        patient.igg3,
        patient.igg4,
        patient.cbc_lym,
        patient.cd3,
        patient.cd4,
        patient.cd8,
        patient.cd19,
        patient.cd16_cd56,
        patient.lscd3_abs,
        patient.lscd4_abs,
        patient.lscd8_abs,
        patient.lscd19,
        patient.lscd56,
      ].some(value => value != null)
    ).length
    return { count: recalculated.length, immunologyCount }
  }

  if (loading) return (
    <div style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f9fafb"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:16, color:"#6b7280", marginBottom:8}}>Veriler yükleniyor...</div>
        <div style={{fontSize:12, color:"#9ca3af"}}>Supabase bağlantısı kuruluyor</div>
      </div>
    </div>
  )

  if (!session) return <Login onLogin={(code, info) => { setSession({code, info}); setScreen("action") }} />

  if (screen==="action") return (
    <ActionScreen
      center={session.code}
      centerInfo={session.info}
      patients={patients}
      onAction={a => {
        if (a==="new") {
          const prefix = session.info.isAdmin ? "XXX" : session.info.prefix
          const count = session.info.isAdmin ? patients.length : patients.filter(p=>p.hasta_id.startsWith(prefix+"-")).length
          setEditing({ hasta_id:`${prefix}-${String(count+1).padStart(3,"0")}`, pibo:0, ptbo:0, merkez:prefix })
          setScreen("new")
        } else if (a==="update") {
          setScreen("select")
        } else if (a==="followup") {
          setScreen("followup_select")
        } else if (a==="admin") {
          setScreen("admin")
        }
      }}
      onLogout={() => { setSession(null); setScreen("action") }}
    />
  )

  if (screen==="select") return (
    <SelectPatient
      patients={patients}
      centerInfo={session.info}
      onSelect={p => { setEditing({...p}); setScreen("edit") }}
      onBack={() => setScreen("action")}
    />
  )

  if (screen==="followup_select") return (
    <SelectPatient
      patients={patients}
      centerInfo={session.info}
      title="Klinik takip için hasta seç"
      subtitle="Başlangıç kaydı yapılmış hastaya yeni izlem ziyareti eklenecek."
      onSelect={p => { setEditing({...p}); setScreen("followup") }}
      onBack={() => setScreen("action")}
    />
  )

  if (screen==="followup") return (
    <ClinicalFollowUpScreen
      patient={editing}
      onBack={() => setScreen("action")}
      onEdit={() => setScreen("edit")}
    />
  )

  if (screen==="new" || screen==="edit") return (
    <PatientForm
      patient={editing}
      isNew={screen==="new"}
      onSave={p => savePatient(p)}
      onBack={() => setScreen("action")}
    />
  )

  if (screen==="admin") return (
    <AdminPanel patients={patients} onBack={() => setScreen("action")} onDelete={deletePatient} onRecalculateAll={recalculateAllPatients} />
  )

  return null
}
