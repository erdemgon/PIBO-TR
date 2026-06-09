import { useEffect, useState } from "react"
import {
  createFollowUpVisit,
  deleteFollowUpVisit,
  listFollowUpVisits,
} from "../services/registryRepository.js"

export function FollowUpPanel({
  patient,
  fields,
  s,
  dateToInput,
  daysBetween,
  round,
  numberOrNull,
  classifyClinicalCourse,
  clinicalCourseLabel,
  formatSupabaseError,
}) {
  const [visits, setVisits] = useState([])
  const [draft, setDraft] = useState({ visit_date: new Date().toISOString().slice(0, 10) })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!patient?.hasta_id) return
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        setVisits(await listFollowUpVisits(patient.hasta_id))
      } catch (error) {
        setError(formatSupabaseError(error) || "İzlem ziyaretleri yüklenemedi.")
      } finally {
        setLoading(false)
      }
    })()
  }, [formatSupabaseError, patient?.hasta_id])

  function setDraftField(key, value) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  async function saveVisit() {
    setError("")
    setMessage("")
    if (!draft.visit_date) {
      setError("Muayene tarihi gerekli.")
      return
    }

    const takipGun = daysBetween(draft.visit_date, patient.tani_tarihi)
    const steroidDoz = numberOrNull(draft.sistemik_steroid_mgkg_gun)
    const steroidGun = numberOrNull(draft.sistemik_steroid_gun)
    const record = {
      ...draft,
      hasta_id: patient.hasta_id,
      takip_suresi_gun: takipGun,
      takip_suresi_ay: takipGun == null ? null : round(takipGun / 30.4375, 1),
      klinik_gidis_otomatik: classifyClinicalCourse(draft),
      sistemik_steroid: steroidDoz != null || steroidGun != null ? 1 : null,
      kumulatif_sistemik_steroid_mgkg: steroidDoz != null && steroidGun != null ? round(steroidDoz * steroidGun, 2) : null,
      created_at: new Date().toISOString(),
    }

    try {
      const data = await createFollowUpVisit(record)
      setVisits(prev => [data, ...prev])
      setDraft({ visit_date: new Date().toISOString().slice(0, 10) })
      setMessage("İzlem ziyareti kaydedildi.")
      setTimeout(() => setMessage(""), 2500)
    } catch (error) {
      setError(formatSupabaseError(error) || "İzlem ziyareti kaydedilemedi. SQL tablosu oluşturuldu mu?")
    }
  }

  async function deleteVisit(id) {
    if (!window.confirm("Bu izlem ziyareti silinsin mi?")) return
    try {
      await deleteFollowUpVisit(id)
      setVisits(prev => prev.filter(visit => visit.id !== id))
    } catch (error) {
      setError(formatSupabaseError(error) || "İzlem ziyareti silinemedi.")
    }
  }

  function renderField(field) {
    const val = draft[field.key]
    if (field.type === "bool") {
      return (
        <select value={val??""} onChange={e => setDraftField(field.key, e.target.value===""?null:Number(e.target.value))} style={s.select}>
          <option value="">— bilinmiyor</option>
          <option value="1">Evet</option>
          <option value="0">Hayır</option>
        </select>
      )
    }
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

  const sortedVisits = [...visits].sort((a, b) => String(b.visit_date).localeCompare(String(a.visit_date)))

  return (
    <div style={{...s.card, marginTop:16}}>
      <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:12}}>
        <div style={{fontSize:14, fontWeight:500}}>İzlem ziyaretleri</div>
        <span style={{fontSize:12, color:"#6b7280"}}>{visits.length} kayıt</span>
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
      <button onClick={saveVisit} disabled={loading} style={{...s.btnPrimary, marginBottom:14}}>
        İzlem ziyaretini kaydet
      </button>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
          <thead>
            <tr style={{borderBottom:"1px solid #e5e7eb"}}>
              {["Tarih","Takip","Klinik gidiş","Atak","Pnömoni","Steroid","SpO2","FEV1",""].map(h => (
                <th key={h} style={{textAlign:"left", padding:"6px 8px", color:"#6b7280", fontWeight:500}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedVisits.map(visit => (
              <tr key={visit.id} style={{borderBottom:"1px solid #f3f4f6"}}>
                <td style={{padding:"5px 8px", fontWeight:500}}>{dateToInput(visit.visit_date)}</td>
                <td style={{padding:"5px 8px"}}>{visit.takip_suresi_ay != null ? `${visit.takip_suresi_ay} ay` : "-"}</td>
                <td style={{padding:"5px 8px"}}>{clinicalCourseLabel(visit.klinik_gidis || visit.klinik_gidis_otomatik)}</td>
                <td style={{padding:"5px 8px"}}>{visit.atak_sayisi ?? "-"}</td>
                <td style={{padding:"5px 8px"}}>{visit.pnomoni_sayisi ?? "-"}</td>
                <td style={{padding:"5px 8px"}}>{visit.kumulatif_sistemik_steroid_mgkg != null ? `${visit.kumulatif_sistemik_steroid_mgkg} mg/kg` : "-"}</td>
                <td style={{padding:"5px 8px"}}>{visit.spo2 ?? "-"}</td>
                <td style={{padding:"5px 8px"}}>{visit.fev1 ?? "-"}</td>
                <td style={{padding:"5px 8px", textAlign:"right"}}>
                  <button onClick={() => deleteVisit(visit.id)} style={{...s.btn, fontSize:11, padding:"4px 8px", color:"#b91c1c", borderColor:"#fecaca"}}>Sil</button>
                </td>
              </tr>
            ))}
            {sortedVisits.length === 0 && (
              <tr><td colSpan={9} style={{padding:12, textAlign:"center", color:"#9ca3af"}}>Henüz izlem ziyareti yok</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
