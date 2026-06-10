import { REGISTRY_BRANCHES } from "../config/registryBranches.js"
import { AppHeader } from "./AppLayout.jsx"

export function LandingPage({ centerInfo, onSelect, onLogout, s, THEME, BRAND }) {
  return (
    <div style={{minHeight:"100vh", background:THEME.page}}>
      <AppHeader THEME={THEME} BRAND={BRAND} right={<button onClick={onLogout} style={s.btn}>Çıkış</button>} />
      <main style={{maxWidth:980, margin:"0 auto", padding:"24px 18px 32px"}}>
        <section style={{display:"grid", gridTemplateColumns:"minmax(0,1fr) auto", gap:18, alignItems:"end", borderBottom:`1px solid ${THEME.border}`, paddingBottom:18, marginBottom:18}}>
          <div>
            <div style={{fontSize:12, fontWeight:900, color:THEME.red, textTransform:"uppercase", letterSpacing:.4}}>Çalışma alanı</div>
            <h1 style={{fontSize:30, lineHeight:1.15, color:THEME.ink, margin:"6px 0 0", fontWeight:900}}>Registry seçimi</h1>
            <div style={{fontSize:14, color:THEME.muted, marginTop:6}}>{centerInfo.label}</div>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(2, minmax(72px, 1fr))", gap:8, minWidth:172}}>
            <div style={{border:`1px solid ${THEME.redBorder}`, background:THEME.redSoft, borderRadius:8, padding:"10px 12px"}}>
              <div style={{fontSize:11, color:THEME.red, fontWeight:900}}>PIBO</div>
              <div style={{fontSize:12, color:THEME.muted, marginTop:2}}>post-infeksiyöz</div>
            </div>
            <div style={{border:`1px solid ${THEME.amberBorder}`, background:THEME.amberSoft, borderRadius:8, padding:"10px 12px"}}>
              <div style={{fontSize:11, color:THEME.amberText, fontWeight:900}}>HSCT</div>
              <div style={{fontSize:12, color:THEME.muted, marginTop:2}}>BOS izlemi</div>
            </div>
          </div>
        </section>

        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:12}}>
          {Object.entries(REGISTRY_BRANCHES).map(([type, branch]) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              style={{background:"#fff", minHeight:176, textAlign:"left", cursor:"pointer", border:`1px solid ${type === "PIBO" ? THEME.redBorder : THEME.amberBorder}`, borderLeft:`6px solid ${type === "PIBO" ? THEME.red : THEME.amberBorder}`, borderRadius:8, padding:"18px 18px 16px", boxShadow:"0 1px 0 rgba(33,31,31,.04)"}}
            >
              <div style={{display:"flex", justifyContent:"space-between", gap:12, alignItems:"center", marginBottom:14}}>
                <div style={{fontSize:12, fontWeight:900, color:type === "PIBO" ? THEME.red : THEME.amberText, textTransform:"uppercase", letterSpacing:.3}}>
                  {branch.shortLabel}
                </div>
                <div style={{width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:type === "PIBO" ? THEME.red : THEME.amberText, background:type === "PIBO" ? THEME.redSoft : THEME.amberSoft, fontSize:18}}>→</div>
              </div>
              <div style={{fontSize:22, fontWeight:900, color:THEME.ink, lineHeight:1.16}}>
                {branch.label}
              </div>
              <div style={{fontSize:14, color:THEME.muted, lineHeight:1.55, marginTop:10, maxWidth:430}}>
                {branch.description}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
