import { useState } from "react"
import { REPORT_MODES, normalizeRegistryType } from "../config/registryBranches.js"
import { summarizeRegistryPatients } from "../utils/reporting.js"

function csvEscape(value) {
  if (value == null) return ""
  const text = String(value)
  return /[",\n\r;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function exportColumns(rows) {
  const priority = ["hasta_id", "merkez", "pibo", "ptbo", "cinsiyet", "dogum_tarihi", "tani_tarihi", "yas_ay"]
  const keys = Array.from(new Set(rows.flatMap(row => Object.keys(row))))
  return [
    ...priority.filter(key => keys.includes(key)),
    ...keys.filter(key => !priority.includes(key)).sort(),
  ]
}

function downloadCsv(filename, rows) {
  if (!rows.length) return
  const columns = exportColumns(rows)
  const csv = [
    columns.map(csvEscape).join(";"),
    ...rows.map(row => columns.map(column => csvEscape(row[column])).join(";")),
  ].join("\n")
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function xmlEscape(value) {
  if (value == null) return ""
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function excelCell(value) {
  if (value == null) return "<Cell><Data ss:Type=\"String\"></Data></Cell>"
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`
  }
  return `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`
}

function downloadExcel(filename, rows) {
  if (!rows.length) return
  const columns = exportColumns(rows)
  const header = `<Row>${columns.map(column => `<Cell><Data ss:Type="String">${xmlEscape(column)}</Data></Cell>`).join("")}</Row>`
  const body = rows.map(row => `<Row>${columns.map(column => excelCell(row[column])).join("")}</Row>`).join("")
  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Hastalar">
  <Table>
   ${header}
   ${body}
  </Table>
 </Worksheet>
</Workbook>`
  const blob = new Blob(["\ufeff", workbook], { type: "application/vnd.ms-excel;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function AdminPanel({ patients, onBack, onDelete, onRecalculateAll, calculateDerivedFields, s, THEME }) {
  const [filterGroup, setFilterGroup] = useState("all")
  const [reportMode, setReportMode] = useState(REPORT_MODES.ALL)
  const [query, setQuery] = useState("")
  const [result, setResult] = useState("")
  const [deleteTarget, setDeleteTarget] = useState("")
  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [recalcLoading, setRecalcLoading] = useState(false)

  const pibo = patients.filter(p => p.pibo == 1)
  const ptbo = patients.filter(p => p.ptbo == 1)
  const display = filterGroup==="pibo" ? pibo : filterGroup==="ptbo" ? ptbo : patients
  const reportPatients = reportMode === REPORT_MODES.PIBO
    ? patients.filter(patient => normalizeRegistryType(patient) === REPORT_MODES.PIBO)
    : reportMode === REPORT_MODES.PTBO
      ? patients.filter(patient => normalizeRegistryType(patient) === REPORT_MODES.PTBO)
      : patients
  const reportSummary = summarizeRegistryPatients(reportPatients)

  async function runAnalysis() {
    if (!query.trim()) return
    setLoading(true)
    setResult("")
    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, patients: reportPatients, reportMode })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || "API hatası")
      setResult(data.result || "Yanıt alınamadı.")
    } catch(e) {
      setResult("Hata: " + e.message)
    }
    setLoading(false)
  }

  async function downloadReport() {
    setReportLoading(true)
    try {
      const resp = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patients: reportPatients, reportMode })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || "Rapor oluşturulamadı")
      const blob = new Blob([data.html], { type: "text/html;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `PIBO_Registry_Rapor_${new Date().toISOString().slice(0,10)}.html`
      a.click()
      URL.revokeObjectURL(url)
    } catch(e) {
      alert("Rapor hatası: " + e.message)
    }
    setReportLoading(false)
  }

  async function handleDelete(patient) {
    if (!patient?.hasta_id) {
      setDeleteError("Silmek için hasta seçin.")
      return
    }
    if (!window.confirm(`${patient.hasta_id} kaydı tümüyle silinsin mi? Bu işlem geri alınamaz.`)) return

    setDeleteError("")
    setDeleteMessage("")
    try {
      await onDelete(patient.hasta_id)
      setDeleteMessage(`${patient.hasta_id} silindi.`)
      setDeleteTarget("")
      setTimeout(() => setDeleteMessage(""), 2500)
    } catch (error) {
      setDeleteError(error.message || "Silme işlemi başarısız.")
    }
  }

  async function handleRecalculateAll() {
    if (!window.confirm("Tüm hasta kayıtları yaş, büyüme, tedavi ve immünoloji otomatik alanlarıyla yeniden hesaplansın mı?")) return

    setDeleteError("")
    setDeleteMessage("")
    setRecalcLoading(true)
    try {
      const result = await onRecalculateAll()
      setDeleteMessage(`${result.count} hasta yeniden hesaplandı. Ig/subset ölçümü olan ${result.immunologyCount} kayıt güncellendi.`)
    } catch (error) {
      setDeleteError(error.message || "Toplu yeniden hesaplama başarısız.")
    } finally {
      setRecalcLoading(false)
    }
  }

  function buildExportRows() {
    return reportPatients.map(patient => ({
      ...patient,
      ...calculateDerivedFields(patient),
      registry_type: normalizeRegistryType(patient),
      merkez: patient.hasta_id.split("-")[0],
    }))
  }

  function handleMissingnessCsv() {
    const rows = buildExportRows()
    const columns = Array.from(new Set(rows.flatMap(row => Object.keys(row)))).sort()
    const missingRows = columns.map(column => ({
      registry_mode: reportMode,
      field: column,
      missing_count: rows.filter(row => row[column] == null || row[column] === "").length,
      total: rows.length,
      missing_pct: rows.length ? Math.round(rows.filter(row => row[column] == null || row[column] === "").length / rows.length * 100) : 0,
    }))
    downloadCsv(`pibo_registry_missingness_${reportMode}_${new Date().toISOString().slice(0, 10)}.csv`, missingRows)
    setDeleteMessage(`${reportMode} missingness raporu indirildi.`)
    setTimeout(() => setDeleteMessage(""), 2500)
  }

  function handleExportPatientsCsv() {
    const today = new Date().toISOString().slice(0, 10)
    const rows = buildExportRows()
    downloadCsv(`pibo_registry_${reportMode}_${today}.csv`, rows)
    setDeleteMessage(`${rows.length} hasta ${reportMode} CSV dosyası olarak indirildi.`)
    setTimeout(() => setDeleteMessage(""), 2500)
  }

  function handleExportPatientsExcel() {
    const today = new Date().toISOString().slice(0, 10)
    const rows = buildExportRows()
    downloadExcel(`pibo_registry_${reportMode}_${today}.xls`, rows)
    setDeleteMessage(`${rows.length} hasta ${reportMode} Excel dosyası olarak indirildi.`)
    setTimeout(() => setDeleteMessage(""), 2500)
  }

  return (
    <div style={{maxWidth:900, margin:"0 auto", padding:"20px"}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:20}}>
        <button onClick={onBack} style={s.btn}>← Geri</button>
        <span style={{fontSize:16, fontWeight:500}}>Admin Paneli</span>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16}}>
        {[["Toplam",patients.length],["PIBO",pibo.length],["PTBO",ptbo.length],["Bhalla eksik",patients.filter(p=>p.bhalla_skoru==null).length]].map(([l,v]) => (
          <div key={l} style={{background:"#f9fafb", borderRadius:8, padding:"10px 14px"}}>
            <div style={{fontSize:11, color:"#6b7280", marginBottom:3}}>{l}</div>
            <div style={{fontSize:24, fontWeight:600}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{...s.card, marginBottom:14}}>
        <div style={{fontSize:13, fontWeight:500, marginBottom:8}}>Rapor modu</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:8, alignItems:"center"}}>
          {[[REPORT_MODES.PIBO,"PIBO"],[REPORT_MODES.PTBO,"PTBO"],[REPORT_MODES.ALL,"PIBO + PTBO"]].map(([mode,label]) => (
            <button key={mode} onClick={() => setReportMode(mode)} style={{...s.btn, background: reportMode===mode ? THEME.redSoft : "#fff", borderColor: reportMode===mode ? THEME.red : "#e5e7eb", color: reportMode===mode ? THEME.red : "#374151"}}>
              {label}
            </button>
          ))}
          <span style={{fontSize:12, color:"#6b7280"}}>{reportPatients.length} hasta rapor kapsamına dahil</span>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:8, marginTop:10}}>
          <div style={{fontSize:12, color:"#6b7280"}}>Medyan tanı yaşı: {reportSummary.medianAgeAtDiagnosis ?? "-"} ay</div>
          <div style={{fontSize:12, color:"#6b7280"}}>Medyan tanı gecikmesi: {reportSummary.medianDiagnosticDelay ?? "-"} gün</div>
          <div style={{fontSize:12, color:"#6b7280"}}>PTBO HSCT→BOS: {reportSummary.ptboMedianHsctToBosDays ?? "-"} gün</div>
          <div style={{fontSize:12, color:"#6b7280"}}>PTBO PFT uyumu: {reportSummary.ptboSurveillanceCompletionRate ?? "-"}%</div>
        </div>
        <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:10}}>
          {reportSummary.byBranchCenter.map(item => (
            <span key={`${item.branch}-${item.center}`} style={s.badge(item.branch === "PIBO" ? "blue" : "amber")}>{item.branch} · {item.center}: {item.count}</span>
          ))}
        </div>
      </div>

      {(deleteError || deleteMessage) && (
        <div style={{
          border:"1px solid",
          borderColor: deleteError ? "#fecaca" : "#bbf7d0",
          background: deleteError ? "#fef2f2" : "#f0fdf4",
          color: deleteError ? "#991b1b" : "#166534",
          borderRadius:8,
          padding:"10px 12px",
          fontSize:13,
          marginBottom:12,
        }}>
          {deleteError || deleteMessage}
        </div>
      )}

      <div style={{...s.card, marginBottom:14}}>
        <div style={{fontSize:13, fontWeight:500, marginBottom:8}}>Veri bakım</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:8, marginBottom:8}}>
          <button onClick={handleRecalculateAll} disabled={recalcLoading} style={s.btnPrimary}>
            {recalcLoading ? "Yeniden hesaplanıyor..." : "Tüm otomatik alanları yeniden hesapla"}
          </button>
          <button onClick={handleExportPatientsExcel} style={s.btn}>
            Hasta verisini Excel indir
          </button>
          <button onClick={handleExportPatientsCsv} style={s.btn}>
            CSV indir
          </button>
          <button onClick={handleMissingnessCsv} style={s.btn}>
            Missingness CSV
          </button>
        </div>
        <div style={{fontSize:12, color:"#6b7280"}}>
          Eski kayıtların hesaplanan alanlarını tekrar kaydeder; indirme düğmeleri tüm hasta tablosunu dışa aktarır.
        </div>
      </div>

      <div style={{...s.card, marginBottom:14, borderColor:THEME.redBorder, background:"#fffafa"}}>
        <div style={{fontSize:13, fontWeight:600, color:THEME.red, marginBottom:8}}>Hasta kaydı silme</div>
        <div style={{display:"grid", gridTemplateColumns:"minmax(220px,1fr) auto", gap:8, alignItems:"center"}}>
          <select value={deleteTarget} onChange={e => setDeleteTarget(e.target.value)} style={s.select}>
            <option value="">Silinecek hastayı seçin</option>
            {patients.map(patient => (
              <option key={patient.hasta_id} value={patient.hasta_id}>
                {patient.hasta_id} - {patient.pibo ? "PIBO" : "PTBO"}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleDelete(patients.find(patient => patient.hasta_id === deleteTarget))}
            disabled={!deleteTarget}
            style={{...s.btnDanger, opacity: deleteTarget ? 1 : 0.55}}
          >
            Seçili hastayı sil
          </button>
        </div>
        <div style={{fontSize:12, color:"#7f1d1d", marginTop:8}}>
          Bu işlem hastanın ana kaydını ve ilişkili izlem/SFT kayıtlarını kalıcı olarak siler.
        </div>
      </div>

      <div style={{...s.card, marginBottom:14}}>
        <div style={{fontSize:13, fontWeight:500, marginBottom:8}}>Yapay zeka destekli analiz</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:8}}>
          {["PIBO grubunu demografik olarak özetle","Etken dağılımını analiz et","Tedavi sonuçlarını değerlendir","BT bulgularını özetle","FEV1 değişimini yorumla","İmmünolojik profili değerlendir"].map(q => (
            <button key={q} onClick={() => setQuery(q)} style={{...s.btn, fontSize:11, padding:"3px 10px"}}>{q}</button>
          ))}
        </div>
        <textarea value={query} onChange={e => setQuery(e.target.value)} rows={2} placeholder="Sorunuzu yazın..." style={{...s.input, resize:"vertical", marginBottom:8}} />
        <div style={{display:"flex", gap:8}}>
          <button onClick={runAnalysis} disabled={loading} style={s.btnPrimary}>
            {loading ? "Analiz yapılıyor..." : "Analiz et →"}
          </button>
          <button onClick={downloadReport} disabled={reportLoading} style={{...s.btn, background:"#f0fdf4", borderColor:"#86efac", color:"#166534"}}>
            {reportLoading ? "Rapor oluşturuluyor..." : "Tam Rapor İndir"}
          </button>
        </div>
        {result && <div style={{marginTop:12, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap", borderTop:"1px solid #f3f4f6", paddingTop:12}}>{result}</div>}
      </div>

      <div style={{display:"flex", gap:6, marginBottom:10}}>
        {[["all","Tümü"],["pibo","PIBO"],["ptbo","PTBO"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilterGroup(v)} style={{...s.btn, fontWeight: filterGroup===v?500:400, background: filterGroup===v?THEME.redSoft:"#fff", borderColor: filterGroup===v?THEME.red:"#e5e7eb", color: filterGroup===v?THEME.red:"#374151"}}>{l}</button>
        ))}
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
          <thead>
            <tr style={{borderBottom:"1px solid #e5e7eb"}}>
              {["ID","Grup","Merkez","Cinsiyet","Yaş (ay)","FEV1 bas","FEV1 bit","Sonuç","İşlem"].map(h => (
                <th key={h} style={{textAlign:"left", padding:"6px 8px", color:"#6b7280", fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {display.map(p => (
              <tr key={p.hasta_id} style={{borderBottom:"1px solid #f3f4f6"}}>
                <td style={{padding:"5px 8px", fontWeight:500}}>{p.hasta_id}</td>
                <td style={{padding:"5px 8px"}}><span style={s.badge(p.pibo?"blue":"amber")}>{p.pibo?"PIBO":"PTBO"}</span></td>
                <td style={{padding:"5px 8px", color:"#6b7280"}}>{p.hasta_id.split("-")[0]}</td>
                <td style={{padding:"5px 8px"}}>{p.cinsiyet==="e"?"E":"K"}</td>
                <td style={{padding:"5px 8px"}}>{p.yas_ay?.toFixed(1)??"-"}</td>
                <td style={{padding:"5px 8px", color: p.fev1_bas==null?"#9ca3af":p.fev1_bas<70?"#dc2626":"#16a34a"}}>{p.fev1_bas!=null?p.fev1_bas+"%":"-"}</td>
                <td style={{padding:"5px 8px", color: p.fev1_bit==null?"#9ca3af":p.fev1_bit<70?"#dc2626":"#16a34a"}}>{p.fev1_bit!=null?p.fev1_bit+"%":"-"}</td>
                <td style={{padding:"5px 8px"}}>{p.tedavi_sonucu?["","İyi","Orta","Kötü"][p.tedavi_sonucu]:"-"}</td>
                <td style={{padding:"5px 8px", textAlign:"right"}}>
                  <button onClick={() => handleDelete(p)} style={{...s.btnDanger, fontSize:11, padding:"4px 8px"}}>
                    Kaydı sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
