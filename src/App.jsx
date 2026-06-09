import { useState, useEffect } from "react"
import { AdminPanel } from "./components/AdminPanel.jsx"
import { FollowUpPanel } from "./components/FollowUpPanel.jsx"
import { LandingPage } from "./components/LandingPage.jsx"
import { PatientForm } from "./components/PatientForm.jsx"
import {
  REGISTRY_BRANCHES,
  REGISTRY_TYPES,
  applyRegistryType,
  filterByRegistryType,
  normalizeRegistryType,
} from "./config/registryBranches.js"
import {
  FIELD_GROUPS,
  FOLLOWUP_FIELDS,
  formFieldKeys,
} from "./config/patientFields.js"
import {
  deletePatientById,
  listPatients,
  upsertPatients,
} from "./services/registryRepository.js"
import {
  calculateDerivedFields,
  classifyClinicalCourse,
  clinicalCourseLabel,
  dateToInput,
  daysBetween,
  formatDateDisplay,
  numberOrNull,
  round,
} from "./utils/patientCalculations.js"

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
  badge: (color) => ({ fontSize:11, padding:"2px 8px", borderRadius:20, background: color==="blue"?THEME.redSoft:color==="amber"?"#fef3c7":color==="red"?"#fee2e2":"#f3f4f6", color: color==="blue"?THEME.red:color==="amber"?"#92400e":color==="red"?"#991b1b":"#374151" }),
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
function ActionScreen({ center, centerInfo, patients, registryType, onAction, onLogout, onSwitchBranch }) {
  const branch = REGISTRY_BRANCHES[registryType]
  const branchPatients = filterByRegistryType(patients, registryType)
  const my = centerInfo.isAdmin ? branchPatients : branchPatients.filter(p => p.hasta_id.startsWith(centerInfo.prefix + "-"))
  const pibo = my.filter(p => p.pibo == 1)
  const ptbo = my.filter(p => p.ptbo == 1)
  const bosPositive = my.filter(p => p.ptbo_bos_pozitif == 1 || ["suspected", "probable", "confirmed"].includes(p.ptbo_bos_status)).length
  const stats = registryType === REGISTRY_TYPES.PTBO
    ? [["HSCT kohortu", my.length], ["BOS pozitif/şüpheli", bosPositive], ["BOS yok/belirsiz", Math.max(my.length - bosPositive, 0)]]
    : [["Toplam", my.length], ["PIBO", pibo.length], ["PTBO", ptbo.length]]
  const allCenterPatients = centerInfo.isAdmin ? patients : patients.filter(p => p.hasta_id.startsWith(centerInfo.prefix + "-"))
  const nextId = centerInfo.isAdmin ? "" : `${centerInfo.prefix}-${String(allCenterPatients.length + 1).padStart(3, "0")}`

  return (
    <div style={{minHeight:"100vh", background:THEME.page}}>
      <AppHeader right={<div style={{display:"flex", gap:8}}><button onClick={onSwitchBranch} style={{...s.btn, fontSize:12}}>Registry değiştir</button><button onClick={onLogout} style={{...s.btn, fontSize:12}}>Çıkış</button></div>} />

      <main style={{maxWidth:920, margin:"0 auto", padding:"18px"}}>
        <section style={{...s.card, textAlign:"center", marginBottom:14, padding:"18px"}}>
          <img src={BRAND.logo} alt="" aria-hidden="true" style={{width:"100%", maxWidth:150, height:118, objectFit:"contain", margin:"0 auto 8px", display:"block"}} />
          <div style={{fontSize:13, color:THEME.red, fontWeight:800, marginBottom:8}}>Registry çalışma alanı</div>
          <h1 style={{fontSize:26, lineHeight:1.2, color:THEME.ink, margin:0, fontWeight:900}}>{branch.label}</h1>
          <p style={{fontSize:15, color:THEME.muted, lineHeight:1.5, margin:"10px auto 0", maxWidth:520}}>
            {centerInfo.label} · Başlangıç kaydı, klinik takip ve merkez verilerini seçili registry kolunda yönetin.
          </p>
        </section>

        <section style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginBottom:14}}>
          {stats.map(([label, value]) => (
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
              <span style={s.badge(p.pibo ? "blue" : "amber")}>{p.pibo ? "PIBO" : "HSCT"}</span>
              {p.ptbo == 1 && (p.ptbo_bos_pozitif == 1 || ["suspected", "probable", "confirmed"].includes(p.ptbo_bos_status)) && <span style={s.badge("red")}>BOS+</span>}
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
function SelectPatient({ patients, centerInfo, registryType, onSelect, onBack, title = "Hasta seç", subtitle = "" }) {
  const [search, setSearch] = useState("")
  const branchPatients = registryType ? filterByRegistryType(patients, registryType) : patients
  const my = centerInfo.isAdmin ? branchPatients : branchPatients.filter(p => p.hasta_id.startsWith(centerInfo.prefix + "-"))
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
          <span style={s.badge(p.pibo ? "blue" : "amber")}>{p.pibo ? "PIBO" : "HSCT"}</span>
          {p.ptbo == 1 && (p.ptbo_bos_pozitif == 1 || ["suspected", "probable", "confirmed"].includes(p.ptbo_bos_status)) && <span style={s.badge("red")}>BOS+</span>}
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
  const diagnosis = patient?.pibo == 1 ? "PIBO" : patient?.ptbo == 1 ? "HSCT kohortu" : "Registry kolu seçilmemiş"

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

  if (!session) return <Login onLogin={(code, info) => { setSession({code, info}); setScreen("landing") }} />

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
      center={session.code}
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
    />
  )

  if (screen==="select") return (
    <SelectPatient
      patients={patients}
      centerInfo={session.info}
      registryType={selectedRegistryType}
      onSelect={p => { setEditing({...p}); setScreen("edit") }}
      onBack={() => setScreen("action")}
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
