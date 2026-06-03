# PIBO/PTBO Registry Variable Plan

Bu belge PIBO/PTBO uygulamasinin veri modelini sade, klinik olarak kullanilabilir ve makale temelli hale getirmek icin ilk taslaktir.

Kaynaklar:
- `PIBO PTBO.xlsx`, `Sayfa2`: 23 olgu, 242 kolon.
- `bo1.pdf`: Mazenq et al., Acta Paediatrica 2025, French paediatric PIBO cohort.
- `bo2.pdf`: Xu et al., BMC Pediatrics 2024, adenovirus pneumonia sonrasi PIBO risk factors.
- `bo3.pdf`: Xu et al., Italian Journal of Pediatrics 2025, Mycoplasma pneumoniae pneumonia sonrasi PIBO risk factors.
- SolAcik uygulamasindaki CDC growth ve GLI spirometry modulleri.

## Core Principles

- Klinik kullaniciya hesaplanabilir alanlar yazdirilmayacak.
- Tarih, cinsiyet, boy, kilo ve tetkik degerlerinden tureyen alanlar uygulama tarafinda hesaplanip Supabase'e kaydedilecek.
- Excel'deki tum eski veri kaybolmasin diye gecis doneminde `raw_excel_payload` gibi bir `jsonb` alan tutulacak.
- Hasta adi, dosya no gibi kimlikleyici alanlar merkezi analiz veri setine alinmayacak; gerekiyorsa merkez ici, ayri ve kisitli saklanacak.
- Ilk ekran kisa olacak; makalelerdeki risk faktorleri moduller halinde eklenecek.

## Centers

| Kod | Merkez | Not |
|---|---|---|
| `ADMIN` | Koordinator | Tum veri ve analiz ekranlari |
| `KOC` | Koc Universitesi Hastanesi | Mevcut KOC hasta ID yapisi |
| `MED` | Medipol | Yeni veri giris merkezi |

## Phase 1: First Screen / Initial Clinical Entry

Bu ekran hasta eklerken ilk acilacak sade klinik giris ekranidir.

### Manual Inputs

| Field | Supabase key | Type | Required | Notes |
|---|---|---:|---:|---|
| Merkez | `merkez` | select | yes | KOC, MED; admin secilebilir |
| Hasta ID | `hasta_id` | text | yes | Merkez prefix ile otomatik onerilir |
| Grup | `case_group` | select | yes | PIBO, PTBO, diger/aday |
| Cinsiyet | `cinsiyet` | select | yes | `e`, `k` |
| Dogum tarihi | `dogum_tarihi` | date | yes | Excel: `Dogum T arihi` |
| Baslangic vucut agirligi | `va_bas` | number | recommended | kg |
| Baslangic boy | `boy_bas` | number | recommended | cm |
| SpO2 | `spo2_bas` | number | optional | Baslangic klinik deger |
| Ates | `ates_bas` | number | optional | Celsius |
| Solunum sayisi | `solunum_sayisi_bas` | number | optional | /dk |
| Kalp tepe atimi | `kalp_tepe_atimi_bas` | number | optional | /dk |
| Yakinma baslangic tarihi | `semptom_baslangic_tarihi` | date | recommended | Excel: `Ilk Solunum Semptom tarihi` |
| Ilk Cocuk Gogus muayene tarihi | `ilk_muayene_tarihi` | date | recommended | Excel: `Cocuk Gogus ilk Degerlendirme` |
| PIBO/PTBO tani tarihi | `tani_tarihi` | date | recommended | Excel: `Bronchiolitis Obliterans Tani Tarihi` |
| BT inceleme tarihi | `bt_tarihi` | date | optional | Excel: `Bilgisayarli Toraks Tomografi Tarihi` |
| Bronkoskopi tarihi | `bronkoskopi_tarihi` | date | optional | Excel: `Bronkoskopi Tarihi` |

### Computed Fields

| Field | Supabase key | Formula / logic | Notes |
|---|---|---|---|
| Yas ay | `yas_ay` | reference date - birth date / 30.4375 | Reference date may be current visit date or diagnosis date depending screen |
| Tani anindaki yas gun | `tani_yas_gun` | `tani_tarihi - dogum_tarihi` | Excel has formula |
| Tani anindaki yas ay | `tani_yas_ay` | `tani_yas_gun / 30.4375` | Useful for analysis |
| Semptomdan taniya gun | `semptom_tani_gun` | `tani_tarihi - semptom_baslangic_tarihi` | Important correction: not BT date |
| Ilk muayeneden taniya gun | `muayene_tani_gun` | `tani_tarihi - ilk_muayene_tarihi` | Requested by user |
| Ilk muayeneden bronkoskopiye gun | `muayene_bronkoskopi_gun` | `bronkoskopi_tarihi - ilk_muayene_tarihi` | Excel has mixed formula |
| Semptomdan bronkoskopiye gun | `semptom_bronkoskopi_gun` | `bronkoskopi_tarihi - semptom_baslangic_tarihi` | Excel has formula |
| VKI baslangic | `vki_bas` | `va_bas / (boy_bas / 100)^2` | Save numeric |
| VA z skoru baslangic | `va_z_bas` | CDC growth if eligible | SolAcik CDC module |
| Boy z skoru baslangic | `boy_z_bas` | CDC growth if eligible | SolAcik CDC module |
| VKI z skoru baslangic | `vki_z_bas` | CDC growth if eligible | SolAcik CDC module |
| CDC eligibility | `growth_reference_status` | age/sex/height/weight validity | e.g. `cdc_2_20`, `under_2_needs_who`, `missing_input` |

## Phase 2: Story / Perinatal / Acute Infection Module

Bu modul makalelerden cikan en onemli risk faktorlerini kapsar.

### Perinatal History

| Field | Supabase key | Type | Priority | Source rationale |
|---|---|---:|---:|---|
| Premature birth | `premature` | bool | high | bo1 reports prematurity and ICU association |
| Gestational age | `gestasyon_haftasi` | number | high | bo1 uses <37 weeks and <32 weeks |
| Birth weight | `dogum_agirligi_g` | number | high | bo1 Table 1 |
| Neonatal respiratory history | `neonatal_solunum_oykusu` | bool | high | bo1 Table 1 |
| NICU admission | `yenidogan_yogun_bakim` | bool | high | User requested; clinically important |
| Neonatal oxygen requirement | `neonatal_oksijen` | bool | high | bo3 mentions neonatal oxygen context |
| Bronchopulmonary dysplasia | `bpd_oykusu` | bool | medium | bo1 notes severe BPD absent; still useful |

### Acute Infection Severity

| Field | Supabase key | Type | Priority | Source rationale |
|---|---|---:|---:|---|
| Acute lower respiratory infection date | `akut_asye_tarihi` | date | high | Etiologic event anchor |
| Fever | `akut_ates` | bool | high | bo2/bo3 all cohorts |
| Duration of fever | `ates_suresi_gun` | number | high | Independent risk factor in bo2/bo3 |
| Cough | `akut_oksuruk` | bool | medium | Common symptom |
| Wheezing/dyspnea | `akut_hisilti_dispne` | bool | high | bo2/bo3 |
| Tachypnea | `akut_takipne` | bool | medium | bo2 |
| Hypoxemia | `akut_hipoksemi` | bool | high | bo2 |
| Severe pneumonia | `agir_pnomoni` | bool | high | bo2 risk comparison |
| Hospital admission | `akut_yatis` | bool | high | bo1 severity |
| PICU admission | `cocuk_yogun_bakim` | bool | high | bo1 severity |
| Supplemental oxygen | `akut_oksijen` | bool | high | bo1/bo2 |
| HFNC | `akut_hfnc` | bool | medium | Respiratory support |
| Non-invasive ventilation | `akut_niv` | bool | high | bo2/bo3 grouped ventilation |
| Invasive mechanical ventilation | `akut_imv` | bool | high | bo2/bo3 |
| IVIG | `akut_ivig` | bool | medium | bo2 Table 3 |
| Acute glucocorticoid | `akut_glukokortikoid` | bool | high | bo2/bo3 risk comparison |

### Etiology

| Field | Supabase key | Type | Priority |
|---|---|---:|---:|
| Adenovirus | `etken_adenovirus` | bool | high |
| RSV | `etken_rsv` | bool | high |
| Rhinovirus | `etken_rinovirus` | bool | medium |
| Influenza | `etken_influenza` | bool | medium |
| Parainfluenza | `etken_parainfluenza` | bool | medium |
| Metapneumovirus | `etken_metapneumovirus` | bool | medium |
| SARS-CoV-2 | `etken_covid` | bool | medium |
| Measles | `etken_kizamik` | bool | medium |
| Mycoplasma pneumoniae | `etken_mycoplasma` | bool | high |
| Bacterial pathogen | `etken_bakteri` | bool | medium |
| Other pathogen text | `etken_diger` | text | medium |
| Co-infection | `koenfeksiyon` | bool | high |

## Phase 3: Atopy / Immune Background

| Field | Supabase key | Type | Priority | Source rationale |
|---|---|---:|---:|---|
| Personal atopic disease | `kisisel_atopi` | bool | high | bo2/bo3 independent risk |
| Atopic dermatitis | `atopik_dermatit` | bool | high | bo2/bo3 |
| Allergic rhinitis | `alerjik_rinit` | bool | high | bo2/bo3 |
| Asthma | `astim` | bool | high | Asthma-BO overlap in bo2 |
| Family atopic disease | `aile_atopi` | bool | high | bo2/bo3 |
| Parent asthma | `aile_astim` | bool | medium | bo2 |
| Specific IgE positive | `spesifik_ige_pozitif` | bool | high | bo2 |
| Total IgE | `ige` | number | medium | Existing Excel field |
| Immune deficiency | `imun_yetmezlik` | bool | medium | Existing Excel field/differential diagnosis |

## Phase 4: Lab Module

| Field | Supabase key | Type | Priority | Source rationale |
|---|---|---:|---:|---|
| WBC | `wbc` | number | high | bo3 |
| CRP | `crp` | number | high | bo2/bo3 risk factor |
| Eosinophil count | `eozinofil_sayisi` | number | medium | bo3 |
| Eosinophil >300/uL | `eozinofil_300_ustu` | bool/computed | medium | bo3 |
| D-dimer | `d_dimer` | number | medium | bo3 |
| ALT | `alt` | number | medium | bo3 |
| LDH | `ldh` | number | medium | bo3 |
| IgA | `iga` | number | medium | Existing Excel field |
| IgM | `igm` | number | medium | Existing Excel field |
| IgG | `igg` | number | medium | Existing Excel field |

## Phase 5: Radiology Module

| Field | Supabase key | Type | Priority | Source rationale |
|---|---|---:|---:|---|
| Mosaic attenuation/perfusion | `bt_mozaik` | bool | high | All PIBO definitions |
| Air trapping | `bt_air_trapping` | bool | high | bo2 |
| Bronchial wall thickening | `bt_bronduvar_kalinlasma` | bool | high | bo2/bo3 |
| Bronchiectasis | `bt_bronsektazi` | bool | high | Existing Excel field |
| Atelectasis | `bt_atelektazi` | bool | high | Existing Excel field |
| Hyperlucency | `bt_hiperlusensi` | bool | medium | bo2 |
| Large lobar consolidation | `bt_buyuk_lobar_konsolidasyon` | bool | high | bo3 risk factor |
| Diffuse bronchiolitis | `bt_diffuz_bronsiolit` | bool | high | bo3 risk factor |
| Bhalla score | `bhalla_skoru` | number | radiology | Existing Excel field |
| Teper score | `teper_skoru` | number | radiology | Existing Excel field |
| WEBB score | `webb_skoru` | number | radiology | Existing Excel field |

## Phase 6: Bronchoscopy / BAL Module

| Field | Supabase key | Type | Priority | Source rationale |
|---|---|---:|---:|---|
| Bronchoscopy done | `bronkoskopi_yapildi` | bool | high | bo1 diagnostics |
| Bronchial mucus plug | `bronkoskopi_mukus_plug` | bool | high | bo3 independent risk factor |
| BAL culture growth | `bal_ureme` | bool | medium | Existing Excel field |
| BAL multiple growth | `bal_coklu_ureme` | bool | medium | Existing Excel field |
| BAL culture 1 | `bal_kultur1` | text | medium | Existing Excel field |
| BAL culture 2 | `bal_kultur2` | text | medium | Existing Excel field |
| BAL culture 3 | `bal_kultur3` | text | medium | Existing Excel field |
| BAL respiratory PCR | `bal_solunum_pcr` | text | medium | Existing Excel field |
| BAL CMV PCR | `bal_cmv_pcr` | bool/text | medium | Existing Excel field |
| BAL P. jirovecii | `bal_pjir` | bool/text | medium | Existing Excel field |

## Phase 7: Treatment / Outcome Module

| Field | Supabase key | Type | Priority |
|---|---|---:|---:|
| Inhaled corticosteroid | `flutikazon` or `inhaler_steroid` | bool | high |
| ICS/LABA | `ics_laba` | bool | medium |
| Azithromycin | `azitromisin` | bool | high |
| Montelukast | `montelukast` | bool | high |
| Long-term oral corticosteroid | `uzun_sureli_oral_steroid` | bool | medium |
| Pulse steroid | `pulse_steroid` | bool | high |
| Chest physiotherapy | `gogus_fizyoterapi` | bool | medium |
| Respiratory support at follow-up | `izlem_solunum_destegi` | bool | high |
| Oxygen at follow-up | `o2` | bool | high |
| BiPAP at follow-up | `bipap` | bool | high |
| IMV | `imv` | bool | high |
| ECMO | `ecmo` | bool | medium |
| Nutritional support | `nutrisyon_destegi` | bool | medium |
| Exitus | `ex` | bool | high |
| Symptoms ongoing | `semptom_devam` | bool | high |
| Post-treatment attacks | `ted_sonrasi_atak_sayisi` | number | medium |
| Post-treatment pneumonia | `ted_sonrasi_pnomoni_sayisi` | number | medium |
| Treatment result | `tedavi_sonucu` | select | high |

## Phase 8: Growth Follow-up Module

Follow-up anthropometry values should be stored as repeated records if possible.

Minimum columns for first version:
- `va_bas`, `boy_bas`, `vki_bas`, `va_z_bas`, `boy_z_bas`, `vki_z_bas`
- `va_izlem`, `boy_izlem`, `vki_izlem`, `va_z_izlem`, `boy_z_izlem`, `vki_z_izlem`
- `va_z_fark`, `boy_z_fark`, `vki_z_fark`

Preferred future structure:
- Table: `anthropometry_measurements`
- Fields: `patient_id`, `measurement_date`, `weight_kg`, `height_cm`, `bmi`, `weight_z`, `height_z`, `bmi_z`, `reference`, `created_at`

## Phase 9: Spirometry / BD Response Module

SolAcik GLI spirometry engine can be reused.

Manual inputs:
- Test date
- Pre-BD FEV1, FVC, FEV1/FVC, FEF25-75/MEF25-75
- Post-BD FEV1, FVC, FEV1/FVC, FEF25-75/MEF25-75
- Test quality/acceptability if available

Computed and saved:
- Predicted values
- Percent predicted
- Z scores
- LLN/ULN status
- BD response percentage
- Obstruction interpretation
- Calculation status, including age/reference warnings

Preferred future structure:
- Table: `spirometry_tests`
- Fields: `patient_id`, `test_date`, `age_years`, `height_cm`, `sex`, observed values, predicted values, z scores, BD response, reference set.

## Excel Formula Notes

`Sayfa2` has 242 columns:
- 221 columns are manual/non-formula in the current workbook.
- 3 columns are entirely formula-based.
- 5 columns are mixed formula/manual values.
- 13 columns are empty in all 23 cases.

Fully formula-based columns:
- `Yas ay`: `DAYS(Tarih, Dogum tarihi) / 30`
- `Tani anindaki yas - gun`: `DAYS(Tani tarihi, Dogum tarihi)`
- `Ilk yakinmadan bronkoskopiye gecen zaman gun`: `DAYS(Bronkoskopi tarihi, Ilk semptom tarihi)`

Mixed formula/manual columns:
- `Steroid Suresi`
- `Tedavi Suresi`
- `yak-tani`
- `Mua-tani`
- `Ilk Muayeneden Bronkoskopiye gecen zaman`

Important correction:
- Current Excel `yak-tani` appears to calculate `BT tarihi - semptom tarihi`.
- Registry should calculate `semptom_tani_gun = tani_tarihi - semptom_baslangic_tarihi` for the user's requested "semptomdan taniya gun".

## Implementation Order

1. Refactor `src/App.jsx` into smaller modules only as much as needed.
2. Add `MED` center and Koc-style color theme.
3. Replace first screen fields with Phase 1 clinical entry.
4. Add date-derived calculations and save computed fields.
5. Port SolAcik CDC growth utility and save baseline z scores.
6. Add perinatal/acute infection module.
7. Add radiology and bronchoscopy modules.
8. Add spirometry module using SolAcik GLI engine.
9. Add raw Excel payload import/migration support.

