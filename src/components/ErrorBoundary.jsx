import React from "react"

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error("PIBO-TR render error:", error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f5f5f6", padding:20}}>
        <div style={{maxWidth:640, width:"100%", background:"#fff", border:"1px solid #efcbd2", borderRadius:8, padding:20}}>
          <div style={{fontSize:18, fontWeight:800, color:"#8f1d2c", marginBottom:8}}>Uygulama ekranı yüklenemedi</div>
          <div style={{fontSize:13, color:"#6f6a6c", lineHeight:1.5, marginBottom:12}}>
            Beklenmeyen bir arayüz hatası oluştu. Bu mesajı ekran görüntüsü olarak paylaşabilirsen hata noktasını hızlıca düzeltebiliriz.
          </div>
          <pre style={{whiteSpace:"pre-wrap", background:"#f9e9ec", color:"#211f1f", borderRadius:6, padding:12, fontSize:12}}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button onClick={() => window.location.reload()} style={{marginTop:12, border:"1px solid #8f1d2c", background:"#8f1d2c", color:"#fff", borderRadius:8, padding:"8px 14px"}}>
            Sayfayı yenile
          </button>
        </div>
      </div>
    )
  }
}
