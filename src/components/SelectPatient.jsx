import { useState } from "react"
import { filterByRegistryType } from "../config/registryBranches.js"
import { formatDateDisplay } from "../utils/patientCalculations.js"

export function SelectPatient({ patients, centerInfo, registryType, onSelect, onBack, s, THEME, title = "Hasta seç", subtitle = "" }) {
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
