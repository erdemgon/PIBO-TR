import { useState } from "react"
import { AppHeader } from "./AppLayout.jsx"

export function Login({ onLogin, centers, s, THEME, BRAND }) {
  const [code, setCode] = useState("")
  const [err, setErr] = useState("")

  function tryLogin() {
    const c = code.trim().toUpperCase()
    if (centers[c]) onLogin(c, centers[c])
    else { setErr("Geçersiz merkez kodu."); setCode("") }
  }

  return (
    <div style={{minHeight:"100vh", background:THEME.page}}>
      <AppHeader THEME={THEME} BRAND={BRAND} />
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
