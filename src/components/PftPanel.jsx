import { useEffect, useState } from "react"
import {
  createPftRecord,
  deletePftRecord,
  listPftRecords,
} from "../services/registryRepository.js"

export function PftPanel({ patient, fields, s, dateToInput, daysBetween, round, formatSupabaseError }) {
  const [records, setRecords] = useState([])
  const [draft, setDraft] = useState({ test_date: new Date().toISOString().slice(0, 10), test_type: "izlem" })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!patient?.hasta_id) return
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        setRecords(await listPftRecords(patient.hasta_id))
      } catch (error) {
        setError(formatSupabaseError(error) || "SFT kayıtları yüklenemedi.")
      } finally {
        setLoading(false)
      }
    })()
  }, [formatSupabaseError, patient?.hasta_id])

  function setDraftField(key, value) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  async function savePft() {
    setError("")
    setMessage("")
    if (!draft.test_date) {
      setError("Tetkik tarihi gerekli.")
      return
    }

    const taniGun = daysBetween(draft.test_date, patient.tani_tarihi)
    const record = {
      ...draft,
      hasta_id: patient.hasta_id,
      tani_sonrasi_gun: taniGun,
      tani_sonrasi_ay: taniGun == null ? null : round(taniGun / 30.4375, 1),
      created_at: new Date().toISOString(),
    }

    try {
      const data = await createPftRecord(record)
      setRecords(prev => [data, ...prev])
      setDraft({ test_date: new Date().toISOString().slice(0, 10), test_type: "izlem" })
      setMessage("SFT kaydı kaydedildi.")
      setTimeout(() => setMessage(""), 2500)
    } catch (error) {
      setError(formatSupabaseError(error) || "SFT kaydı kaydedilemedi. SQL tablosu oluşturuldu mu?")
    }
  }

  async function deletePft(id) {
    if (!window.confirm("Bu SFT kaydı silinsin mi?")) return
    try {
      await deletePftRecord(id)
      setRecords(prev => prev.filter(record => record.id !== id))
    } catch (error) {
      setError(formatSupabaseError(error) || "SFT kaydı silinemedi.")
    }
  }

  function renderField(field) {
    const val = draft[field.key]
    if (field.type === "select") {
      return (
        <select value={val??""} onChange={e => setDraftField(field.key, e.target.value || null)} style={s.select}>
          {field.options?.map(option => <option key={option.v} value={option.v}>{option.l}</option>)}
        </select>
      )
    }
    if (field.type === "date") {
      return <input type="date" value={dateToInput(val)} onChange={e => setDraftField(field.key, e.target.value || null)} style={s.input} />
    }
    return (
      <input
        type={field.type==="num" ? "number" : "text"}
        step={field.type==="num" ? "any" : undefined}
        value={val??""}
        onChange={e => setDraftField(field.key, e.target.value===""?null:(field.type==="num"?Number(e.target.value):e.target.value))}
        style={s.input}
      />
    )
  }

  const sortedRecords = [...records].sort((a, b) => String(b.test_date).localeCompare(String(a.test_date)))

  return (
    <div style={{...s.card, marginTop:16}}>
      <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
        <div style={{fontSize:14, fontWeight:500}}>Solunum fonksiyon kayıtları</div>
        <span style={{fontSize:12, color:"#6b7280"}}>{records.length} kayıt</span>
      </div>
      {(error || message) && (
        <div style={{
          border:"1px solid",
          borderColor: error ? "#fecaca" : "#bbf7d0",
          background: error ? "#fef2f2" : "#f0fdf4",
          color: error ? "#991b1b" : "#166534",
          borderRadius:8,
          padding:"8px 10px",
          fontSize:12,
          marginBottom:12,
        }}>
          {error || message}
        </div>
      )}
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10, marginBottom:12}}>
        {fields.map(field => (
          <div key={field.key}>
            <label style={s.label}>{field.label}</label>
            {renderField(field)}
          </div>
        ))}
      </div>
      <button onClick={savePft} disabled={loading} style={{...s.btnPrimary, marginBottom:14}}>
        SFT kaydını kaydet
      </button>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
          <thead>
            <tr style={{borderBottom:"1px solid #e5e7eb"}}>
              {["Tarih","Tip","Tanıdan sonra","FEV1","FVC","MEF25-75","DLCO","RV/TLC",""].map(h => (
                <th key={h} style={{textAlign:"left", padding:"6px 8px", color:"#6b7280", fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map(record => (
              <tr key={record.id} style={{borderBottom:"1px solid #f3f4f6"}}>
                <td style={{padding:"5px 8px", fontWeight:500}}>{dateToInput(record.test_date)}</td>
                <td style={{padding:"5px 8px"}}>{record.test_type || "-"}</td>
                <td style={{padding:"5px 8px"}}>{record.tani_sonrasi_ay != null ? `${record.tani_sonrasi_ay} ay` : "-"}</td>
                <td style={{padding:"5px 8px"}}>{record.fev1 ?? "-"}</td>
                <td style={{padding:"5px 8px"}}>{record.fvc ?? "-"}</td>
                <td style={{padding:"5px 8px"}}>{record.mef2575 ?? "-"}</td>
                <td style={{padding:"5px 8px"}}>{record.dlco ?? "-"}</td>
                <td style={{padding:"5px 8px"}}>{record.rv_tlc ?? "-"}</td>
                <td style={{padding:"5px 8px", textAlign:"right"}}>
                  <button onClick={() => deletePft(record.id)} style={{...s.btn, fontSize:11, padding:"4px 8px", color:"#b91c1c", borderColor:"#fecaca"}}>Sil</button>
                </td>
              </tr>
            ))}
            {sortedRecords.length === 0 && (
              <tr><td colSpan={9} style={{padding:12, textAlign:"center", color:"#9ca3af"}}>Henüz SFT kaydı yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
