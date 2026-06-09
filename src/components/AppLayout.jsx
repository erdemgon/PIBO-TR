function BrandLockup({ align = "center", compact = false, THEME, BRAND }) {
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

export function AppHeader({ children, right, THEME, BRAND }) {
  return (
    <div style={{borderBottom:`1px solid ${THEME.border}`, background:"#fff"}}>
      <div style={{maxWidth:920, margin:"0 auto", padding:"14px 18px", display:"flex", alignItems:"center", gap:12}}>
        <BrandLockup align="left" compact THEME={THEME} BRAND={BRAND} />
        {children}
        {right && <div style={{marginLeft:"auto"}}>{right}</div>}
      </div>
    </div>
  )
}
