import { FollowUpPanel } from "./FollowUpPanel.jsx"
import { FOLLOWUP_FIELDS } from "../config/patientFields.js"
import { calculateDerivedFields, classifyClinicalCourse, clinicalCourseLabel, dateToInput, daysBetween, formatDateDisplay, numberOrNull, round } from "../utils/patientCalculations.js"

export function ClinicalFollowUpScreen({ patient, onBack, onEdit, s, THEME, formatSupabaseError }) {
  const displayPatient = {...patient, ...calculateDerivedFields(patient)}
  const diagnosis = patient?.pibo == 1 ? "PIBO" : patient?.ptbo == 1 ? "HSCT kohortu" : "Registry kolu seçilmemiş"

  return (
    <div style={{maxWidth:720, margin:"0 auto", padding:"20px"}}>
      <div style={{...s.card, marginBottom:14, border:`1px solid ${THEME.redBorder}`, background:`linear-gradient(135deg, ${THEME.redSoft}, #fff)`}}>
        <div style={{display:"flex", alignItems:"center", gap:12, flexWrap:"wrap"}}>
          <button onClick={onBack} style={s.btn}>← Geri</button>
          <div>
            <div style={{fontSize:18, fontWeight:700, color:THEME.burgundy}}>Klinik takip</div>
            <div style={{fontSize:12, color:THEME.muted, marginTop:3}}>
              {patient?.hasta_id} · {diagnosis} · D: {formatDateDisplay(patient?.dogum_tarihi)} · Tanı: {formatDateDisplay(patient?.tani_tarihi)}
            </div>
          </div>
          <button onClick={onEdit} style={{...s.btn, marginLeft:"auto", borderColor:THEME.redBorder, color:THEME.red}}>
            Klinik kaydı düzenle
          </button>
        </div>
      </div>
      <FollowUpPanel
        patient={displayPatient}
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
    </div>
  )
}
