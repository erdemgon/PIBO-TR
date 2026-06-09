import { REGISTRY_BRANCHES, REGISTRY_TYPES, filterByRegistryType } from "../config/registryBranches.js"
import { formatFixed } from "../utils/formatters.js"
import { formatDateDisplay } from "../utils/patientCalculations.js"
import { AppHeader } from "./AppLayout.jsx"

export function ActionScreen({ centerInfo, patients, registryType, onAction, onLogout, onSwitchBranch, s, THEME, BRAND }) {
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
      <AppHeader THEME={THEME} BRAND={BRAND} right={<div style={{display:"flex", gap:8}}><button onClick={onSwitchBranch} style={{...s.btn, fontSize:12}}>Registry değiştir</button><button onClick={onLogout} style={{...s.btn, fontSize:12}}>Çıkış</button></div>} />

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
              <span style={{fontSize:12, color:THEME.muted}}>{p.cinsiyet==="e"?"E":"K"} · {formatFixed(p.yas_ay, 0)} ay</span>
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
