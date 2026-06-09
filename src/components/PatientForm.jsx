import { useEffect, useState } from "react"
import { FollowUpPanel } from "./FollowUpPanel.jsx"
import { PftPanel } from "./PftPanel.jsx"
import { applyRegistryType, normalizeRegistryType } from "../config/registryBranches.js"
import { FIELD_GROUPS, FOLLOWUP_FIELDS, PFT_FIELDS } from "../config/patientFields.js"
import { calculateDerivedFields, classifyClinicalCourse, clinicalCourseLabel, dateToInput, daysBetween, numberOrNull, round } from "../utils/patientCalculations.js"

export function PatientForm({ patient, isNew, onSave, onBack, s, THEME, formatSupabaseError }) {
  const [form, setForm] = useState({...patient})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [saveError, setSaveError] = useState("")
  const [activeGroup, setActiveGroup] = useState("genel")

  useEffect(() => {
    if (activeGroup === "ptbo_tb" && form.ptbo != 1) setActiveGroup("genel")
  }, [activeGroup, form.ptbo])

  function set(key, val) {
    setForm(f => key === "registry_type" ? applyRegistryType(f, val) : ({...f, [key]: val}))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError("")
    setSaveMessage("")
    try {
      const result = await onSave(form)
      setSaved(true)
      setSaveMessage(result?.warning || "Kaydedildi.")
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      setSaved(false)
      setSaveError(error.message || "Kayıt başarısız.")
    } finally {
      setSaving(false)
    }
  }

  const formRegistryType = normalizeRegistryType(form)
  const groups = Object.entries(FIELD_GROUPS).filter(([, group]) => !group.registry || group.registry === formRegistryType)
  const displayForm = {...form, ...calculateDerivedFields(form)}

  return (
    <div style={{maxWidth:720, margin:"0 auto", padding:"20px"}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:16}}>
        <button onClick={onBack} style={s.btn}>← Geri</button>
        <span style={{fontSize:16, fontWeight:500}}>{isNew ? "Yeni hasta" : form.hasta_id}</span>
        {!isNew && <span style={s.badge(form.pibo ? "blue" : "amber")}>{form.pibo ? "PIBO" : "HSCT"}</span>}
        <button onClick={handleSave} disabled={saving} style={{...s.btnPrimary, marginLeft:"auto", background: saved?"#d1fae5":THEME.redSoft, borderColor: saved?"#6ee7b7":THEME.red, color: saved?"#065f46":THEME.red}}>
          {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      </div>
      {(saveError || saveMessage) && (
        <div style={{
          border:"1px solid",
          borderColor: saveError ? "#fecaca" : saveMessage.includes("SQL") ? "#fde68a" : "#bbf7d0",
          background: saveError ? "#fef2f2" : saveMessage.includes("SQL") ? "#fffbeb" : "#f0fdf4",
          color: saveError ? "#991b1b" : saveMessage.includes("SQL") ? "#92400e" : "#166534",
          borderRadius:8,
          padding:"10px 12px",
          fontSize:13,
          marginBottom:12,
        }}>
          {saveError || saveMessage}
        </div>
      )}

      <div style={{display:"flex", gap:4, flexWrap:"wrap", marginBottom:14}}>
        {groups.map(([k, g]) => {
          const missing = g.fields.filter(f => f.note && form[f.key] == null).length
          return (
            <button key={k} onClick={() => setActiveGroup(k)} style={{fontSize:12, padding:"4px 12px", borderRadius:20, border:"1px solid", borderColor: activeGroup===k?THEME.red:"#e5e7eb", background: activeGroup===k?THEME.redSoft:"#fff", color: activeGroup===k?THEME.red:"#6b7280", cursor:"pointer", fontWeight: activeGroup===k?500:400}}>
              {g.label}{missing > 0 ? ` ⚠${missing}` : ""}
            </button>
          )
        })}
        {!isNew && (
          <>
            <button onClick={() => setActiveGroup("izlem")} style={{fontSize:12, padding:"4px 12px", borderRadius:20, border:"1px solid", borderColor: activeGroup==="izlem"?THEME.red:"#e5e7eb", background: activeGroup==="izlem"?THEME.redSoft:"#fff", color: activeGroup==="izlem"?THEME.red:"#6b7280", cursor:"pointer", fontWeight: activeGroup==="izlem"?500:400}}>
              İzlem ziyaretleri
            </button>
            <button onClick={() => setActiveGroup("sft_kayitlari")} style={{fontSize:12, padding:"4px 12px", borderRadius:20, border:"1px solid", borderColor: activeGroup==="sft_kayitlari"?THEME.red:"#e5e7eb", background: activeGroup==="sft_kayitlari"?THEME.redSoft:"#fff", color: activeGroup==="sft_kayitlari"?THEME.red:"#6b7280", cursor:"pointer", fontWeight: activeGroup==="sft_kayitlari"?500:400}}>
              SFT kayıtları
            </button>
          </>
        )}
      </div>

      {activeGroup === "izlem" ? (
        <FollowUpPanel
          patient={displayForm}
          fields={FOLLOWUP_FIELDS}
          s={s}
          dateToInput={dateToInput}
          daysBetween={daysBetween}
          round={round}
          numberOrNull={numberOrNull}
          classifyClinicalCourse={classifyClinicalCourse}
          clinicalCourseLabel={clinicalCourseLabel}
          formatSupabaseError={formatSupabaseError}
        />
      ) : activeGroup === "sft_kayitlari" ? (
        <PftPanel
          patient={displayForm}
          fields={PFT_FIELDS}
          s={s}
          dateToInput={dateToInput}
          daysBetween={daysBetween}
          round={round}
          formatSupabaseError={formatSupabaseError}
        />
      ) : <div style={s.card}>
        <div style={{fontSize:14, fontWeight:500, marginBottom:14}}>{FIELD_GROUPS[activeGroup].label}</div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12}}>
          {FIELD_GROUPS[activeGroup].fields.map(f => {
            const val = displayForm[f.key]
            return (
              <div key={f.key}>
                <label style={{...s.label, color: f.note ? "#d97706" : f.required && val==null ? "#dc2626" : "#6b7280"}}>
                  {f.label}
                  {f.note==="rad" && <span style={{marginLeft:4, fontSize:10, opacity:.7}}>(radyoloji)</span>}
                  {f.note==="kln" && <span style={{marginLeft:4, fontSize:10, opacity:.7}}>(klinisyen)</span>}
                </label>
                {f.readonly ? (
                  <input value={f.type==="bool" ? (val == null ? "" : val == 1 ? "Evet" : "Hayır") : val??""} readOnly style={{...s.input, color:"#6b7280", background:"#f3f4f6"}} />
                ) : f.type==="bool" ? (
                  <select value={val??""} onChange={e => set(f.key, e.target.value===""?null:Number(e.target.value))} style={s.select}>
                    <option value="">— bilinmiyor</option>
                    <option value="1">Evet</option>
                    <option value="0">Hayır</option>
                  </select>
                ) : f.type==="select" ? (
                  <select value={val??""} onChange={e => set(f.key, e.target.value||null)} style={s.select}>
                    <option value="">—</option>
                    {f.options?.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                ) : f.type==="date" ? (
                  <input type="date" value={dateToInput(val)} onChange={e => set(f.key, e.target.value||null)} style={{...s.input, borderColor: f.required&&val==null?"#fca5a5":THEME.redBorder}} />
                ) : (
                  <input type={f.type==="num"?"number":"text"} step={f.type==="num"?"any":undefined} value={val??""} onChange={e => set(f.key, e.target.value===""?null:(f.type==="num"?Number(e.target.value):e.target.value))} style={{...s.input, borderColor: f.note&&val==null?"#fbbf24":f.required&&val==null?"#fca5a5":THEME.redBorder}} />
                )}
                {f.hint && <div style={s.hint}>{f.hint}</div>}
              </div>
            )
          })}
        </div>
      </div>}
      {activeGroup !== "izlem" && activeGroup !== "sft_kayitlari" && (
        <button onClick={handleSave} disabled={saving} style={{...s.btnPrimary, width:"100%", marginTop:12, padding:10, fontSize:14}}>
          {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      )}
    </div>
  )
}
