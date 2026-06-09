import { useState, useEffect } from "react"
import { ActionScreen } from "./components/ActionScreen.jsx"
import { AdminPanel } from "./components/AdminPanel.jsx"
import { ClinicalFollowUpScreen } from "./components/ClinicalFollowUpScreen.jsx"
import { LandingPage } from "./components/LandingPage.jsx"
import { Login } from "./components/Login.jsx"
import { PatientForm } from "./components/PatientForm.jsx"
import { SelectPatient } from "./components/SelectPatient.jsx"
import { BRAND, CENTERS } from "./config/appConfig.js"
import {
  applyRegistryType,
  normalizeRegistryType,
} from "./config/registryBranches.js"
import {
  FIELD_GROUPS,
  formFieldKeys,
} from "./config/patientFields.js"
import {
  deletePatientById,
  listPatients,
  upsertPatients,
} from "./services/registryRepository.js"
import {
  calculateDerivedFields,
} from "./utils/patientCalculations.js"
import { validatePatientBeforeSave } from "./utils/patientValidation.js"
import { THEME, createUiStyles } from "./styles/uiStyles.js"

const ORIGINAL_HASTALAR_COLUMNS = [
  "hasta_id",
  "registry_type",
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

// UI-only alanlar (dogum_ay, dogum_yil, tani_ay, tani_yil) kasıtlı olarak dışarıda kalır.
const DB_COLUMN_KEYS = new Set([
  ...ORIGINAL_HASTALAR_COLUMNS,
  ...formFieldKeys(FIELD_GROUPS),
  ...DERIVED_PATIENT_COLUMNS,
])

const s = createUiStyles(THEME)

// ─── Login ───────────────────────────────────────────────────────────────────
// ─── Action Screen ────────────────────────────────────────────────────────────
// ─── Patient Select ───────────────────────────────────────────────────────────
// ─── Patient Form ─────────────────────────────────────────────────────────────
// ─── Admin Panel ──────────────────────────────────────────────────────────────
// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState("action")
  const [editing, setEditing] = useState(null)
  const [selectedRegistryType, setSelectedRegistryType] = useState(null)

  // Supabase gerçek veri kaynağıdır; örnek veri frontend bundle'ına gömülmez
  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        setPatients((await listPatients()).map(patient => applyRegistryType(patient, normalizeRegistryType(patient))))
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function savePatient(p) {
    const typed = applyRegistryType(p, p.registry_type || selectedRegistryType || normalizeRegistryType(p))
    const validation = validatePatientBeforeSave(typed)
    if (!validation.valid) throw new Error(validation.errors.join(" "))
    const full = { ...typed, ...calculateDerivedFields(typed), merkez: typed.hasta_id.split("-")[0], guncelleme_tarihi: new Date().toISOString() }
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
    return validation.warnings.length ? { warning: `Kaydedildi. Eksik alan uyarısı: ${validation.warnings.join(" ")}` } : {}
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

  if (!session) return (
    <Login
      centers={CENTERS}
      s={s}
      THEME={THEME}
      BRAND={BRAND}
      onLogin={(code, info) => { setSession({code, info}); setScreen("landing") }}
    />
  )

  if (screen==="landing" || !selectedRegistryType) return (
    <LandingPage
      centerInfo={session.info}
      s={s}
      THEME={THEME}
      onSelect={type => { setSelectedRegistryType(type); setScreen("action") }}
      onLogout={() => { setSession(null); setSelectedRegistryType(null); setScreen("action") }}
    />
  )

  if (screen==="action") return (
    <ActionScreen
      centerInfo={session.info}
      patients={patients}
      registryType={selectedRegistryType}
      onAction={a => {
        if (a==="new") {
          const prefix = session.info.isAdmin ? "XXX" : session.info.prefix
          const count = session.info.isAdmin ? patients.length : patients.filter(p=>p.hasta_id.startsWith(prefix+"-")).length
          setEditing(applyRegistryType({ hasta_id:`${prefix}-${String(count+1).padStart(3,"0")}`, merkez:prefix }, selectedRegistryType))
          setScreen("new")
        } else if (a==="update") {
          setScreen("select")
        } else if (a==="followup") {
          setScreen("followup_select")
        } else if (a==="admin") {
          setScreen("admin")
        }
      }}
      onSwitchBranch={() => setScreen("landing")}
      onLogout={() => { setSession(null); setSelectedRegistryType(null); setScreen("action") }}
      s={s}
      THEME={THEME}
      BRAND={BRAND}
    />
  )

  if (screen==="select") return (
    <SelectPatient
      patients={patients}
      centerInfo={session.info}
      registryType={selectedRegistryType}
      onSelect={p => { setEditing({...p}); setScreen("edit") }}
      onBack={() => setScreen("action")}
      s={s}
      THEME={THEME}
    />
  )

  if (screen==="followup_select") return (
    <SelectPatient
      patients={patients}
      centerInfo={session.info}
      registryType={selectedRegistryType}
      title="Klinik takip için hasta seç"
      subtitle="Başlangıç kaydı yapılmış hastaya yeni izlem ziyareti eklenecek."
      onSelect={p => { setEditing({...p}); setScreen("followup") }}
      onBack={() => setScreen("action")}
      s={s}
      THEME={THEME}
    />
  )

  if (screen==="followup") return (
    <ClinicalFollowUpScreen
      patient={editing}
      onBack={() => setScreen("action")}
      onEdit={() => setScreen("edit")}
      s={s}
      THEME={THEME}
      formatSupabaseError={formatSupabaseError}
    />
  )

  if (screen==="new" || screen==="edit") return (
    <PatientForm
      patient={editing}
      isNew={screen==="new"}
      onSave={p => savePatient(p)}
      onBack={() => setScreen("action")}
      s={s}
      THEME={THEME}
      formatSupabaseError={formatSupabaseError}
    />
  )

  if (screen==="admin") return (
    <AdminPanel
      patients={patients}
      onBack={() => setScreen("action")}
      onDelete={deletePatient}
      onRecalculateAll={recalculateAllPatients}
      calculateDerivedFields={calculateDerivedFields}
      s={s}
      THEME={THEME}
    />
  )

  return null
}
