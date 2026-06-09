export const THEME = {
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

export function createUiStyles(theme = THEME) {
  return {
    card: { background:"#fff", border:`1px solid ${theme.border}`, borderRadius:8, padding:"16px 20px", boxShadow:"none" },
    btn: { padding:"7px 16px", borderRadius:8, border:`1px solid ${theme.redBorder}`, background:"#fff", color:theme.burgundy, cursor:"pointer", fontSize:13 },
    btnPrimary: { padding:"8px 20px", borderRadius:8, border:`1px solid ${theme.red}`, background:theme.red, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:800 },
    btnDanger: { padding:"7px 16px", borderRadius:8, border:`1px solid ${theme.red}`, background:theme.red, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 },
    input: { width:"100%", fontSize:13, padding:"6px 8px", borderRadius:6, border:`1px solid ${theme.redBorder}`, background:theme.redField, color:theme.ink, boxSizing:"border-box", caretColor:theme.red },
    select: { width:"100%", fontSize:13, padding:"6px 8px", borderRadius:6, border:`1px solid ${theme.redBorder}`, background:theme.redField, color:theme.ink, boxSizing:"border-box" },
    label: { display:"block", fontSize:11, color:theme.burgundy, marginBottom:3, fontWeight:800, textTransform:"uppercase" },
    hint: { fontSize:10.5, color:theme.burgundy, opacity:.76, marginTop:3, lineHeight:1.3 },
    badge: (color) => ({ fontSize:11, padding:"2px 8px", borderRadius:20, background: color==="blue"?theme.redSoft:color==="amber"?"#fef3c7":color==="red"?"#fee2e2":"#f3f4f6", color: color==="blue"?theme.red:color==="amber"?"#92400e":color==="red"?"#991b1b":"#374151" }),
  }
}
