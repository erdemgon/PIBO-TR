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
  const actionItems = [
    {
      key: "new",
      marker: "+",
      title: "Yeni hasta ekle",
      detail: centerInfo.isAdmin ? "Merkez kodu ile yeni kayıt başlat" : `Önerilen ID: ${nextId}`,
      tone: "primary",
    },
    {
      key: "update",
      marker: "✎",
      title: "Mevcut kaydı güncelle",
      detail: `${my.length} kayıt içinde düzenleme yap`,
      tone: "neutral",
    },
    {
      key: "followup",
      marker: "K",
      title: "Klinik takip",
      detail: "İzlem ziyareti, atak ve PFT akışını kaydet",
      tone: "soft",
    },
  ]

  return (
    <div style={{minHeight:"100vh", background:THEME.page}}>
      <AppHeader THEME={THEME} BRAND={BRAND} right={<div style={{display:"flex", gap:8}}><button onClick={onSwitchBranch} style={{...s.btn, fontSize:12}}>Registry değiştir</button><button onClick={onLogout} style={{...s.btn, fontSize:12}}>Çıkış</button></div>} />

      <main style={{maxWidth:1040, margin:"0 auto", padding:"20px 18px 32px"}}>
        <section style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14, alignItems:"stretch", marginBottom:14}}>
          <div style={{background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:8, padding:"18px 20px", display:"flex", gap:16, alignItems:"center"}}>
            <div style={{width:58, height:58, borderRadius:8, border:`1px solid ${THEME.redBorder}`, background:THEME.redSoft, display:"flex", alignItems:"center", justifyContent:"center", flex:"0 0 auto"}}>
              <img src={BRAND.logo} alt="" aria-hidden="true" style={{width:50, height:50, objectFit:"contain"}} />
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:12, color:THEME.red, fontWeight:900, textTransform:"uppercase", letterSpacing:.3}}>Registry çalışma alanı</div>
              <h1 style={{fontSize:25, lineHeight:1.18, color:THEME.ink, margin:"5px 0 0", fontWeight:900}}>{branch.label}</h1>
              <div style={{fontSize:13, color:THEME.muted, lineHeight:1.45, marginTop:7}}>
                {centerInfo.label} · Başlangıç kaydı, klinik takip ve merkez verilerini seçili registry kolunda yönetin.
              </div>
            </div>
          </div>
          <div style={{background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:8, padding:14, display:"grid", gap:8}}>
            {stats.map(([label, value]) => (
              <div key={label} style={{display:"flex", justifyContent:"space-between", gap:12, alignItems:"baseline", borderBottom:"1px solid #e7e7ea", paddingBottom:7}}>
                <div style={{fontSize:12, color:THEME.muted, fontWeight:800}}>{label}</div>
                <div style={{fontSize:22, color:THEME.ink, fontWeight:900}}>{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:8, padding:14, marginBottom:14}}>
          <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, marginBottom:10}}>
            <div style={{fontSize:13, fontWeight:900, color:THEME.red, textTransform:"uppercase", letterSpacing:.3}}>İşlem menüsü</div>
            <div style={{fontSize:12, color:THEME.muted}}>Tek kayıt, düzenleme ve takip akışı</div>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:8}}>
            {actionItems.map(item => (
              <button
                key={item.key}
                onClick={() => onAction(item.key)}
                style={{background:item.tone === "soft" ? THEME.redSoft : "#fff", border:`1px solid ${item.tone === "primary" ? THEME.red : THEME.redBorder}`, borderLeft:`5px solid ${item.tone === "primary" ? THEME.red : item.tone === "soft" ? THEME.redBorder : "#d6d6da"}`, borderRadius:8, padding:"13px 14px", textAlign:"left", cursor:"pointer", display:"grid", gridTemplateColumns:"38px 1fr", gap:12, alignItems:"center"}}
              >
                <div style={{width:34, height:34, borderRadius:8, background:item.tone === "primary" ? THEME.red : "#fff", border:`1px solid ${item.tone === "primary" ? THEME.red : THEME.redBorder}`, color:item.tone === "primary" ? "#fff" : THEME.red, display:"flex", alignItems:"center", justifyContent:"center", fontSize:item.marker === "+" ? 22 : 16, fontWeight:900}}>{item.marker}</div>
                <div>
                  <div style={{fontSize:15, fontWeight:900, color:THEME.ink}}>{item.title}</div>
                  <div style={{fontSize:12, color:THEME.muted, marginTop:3, lineHeight:1.35}}>{item.detail}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {centerInfo.isAdmin && (
          <button onClick={() => onAction("admin")} style={{width:"100%", textAlign:"left", cursor:"pointer", border:`1px solid ${THEME.amberBorder}`, borderRadius:8, background:THEME.amberSoft, padding:"12px 14px", marginBottom:14}}>
            <div style={{display:"flex", justifyContent:"space-between", gap:12, alignItems:"center"}}>
              <div>
                <div style={{fontSize:13, fontWeight:900, color:THEME.amberText}}>Admin paneli</div>
                <div style={{fontSize:12, color:THEME.muted, marginTop:2}}>Tüm merkezler, analiz, dışa aktarım ve veri bakımı</div>
              </div>
              <div style={{fontSize:18, color:THEME.amberText}}>→</div>
            </div>
          </button>
        )}

        <div style={{background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:8, padding:"14px 16px"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:12, marginBottom:8}}>
            <div style={{fontSize:13, fontWeight:900, color:THEME.red, textTransform:"uppercase", letterSpacing:.3}}>Son eklenen hastalar</div>
            <div style={{fontSize:12, color:THEME.muted}}>{my.length} kayıt</div>
          </div>
          {my.slice(-5).reverse().map(p => (
            <div key={p.hasta_id} style={{display:"flex", width:"100%", alignItems:"center", gap:8, padding:"9px 0", borderTop:"1px solid #f3f4f6", textAlign:"left", minHeight:42}}>
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
