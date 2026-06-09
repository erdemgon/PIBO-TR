import { REGISTRY_BRANCHES } from "../config/registryBranches.js"

export function LandingPage({ centerInfo, onSelect, onLogout, s, THEME }) {
  return (
    <div style={{minHeight:"100vh", background:THEME.page}}>
      <main style={{maxWidth:860, margin:"0 auto", padding:"32px 18px"}}>
        <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:20}}>
          <div>
            <div style={{fontSize:24, fontWeight:900, color:THEME.ink}}>Registry seçimi</div>
            <div style={{fontSize:13, color:THEME.muted, marginTop:3}}>{centerInfo.label}</div>
          </div>
          <button onClick={onLogout} style={{...s.btn, marginLeft:"auto"}}>Çıkış</button>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:14}}>
          {Object.entries(REGISTRY_BRANCHES).map(([type, branch]) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              style={{...s.card, minHeight:170, textAlign:"left", cursor:"pointer", borderColor: type === "PIBO" ? THEME.redBorder : THEME.amberBorder, background:type === "PIBO" ? THEME.redSoft : THEME.amberSoft}}
            >
              <div style={{fontSize:12, fontWeight:900, color:type === "PIBO" ? THEME.red : THEME.amberText, textTransform:"uppercase", marginBottom:10}}>
                {branch.shortLabel}
              </div>
              <div style={{fontSize:22, fontWeight:900, color:THEME.ink, lineHeight:1.18}}>
                {branch.label}
              </div>
              <div style={{fontSize:14, color:THEME.muted, lineHeight:1.5, marginTop:10}}>
                {branch.description}
              </div>
              <div style={{fontSize:18, color:type === "PIBO" ? THEME.red : THEME.amberText, marginTop:18}}>→</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
