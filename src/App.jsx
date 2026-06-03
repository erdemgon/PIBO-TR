import { useState, useEffect } from "react"
import { supabase } from "./supabase.js"
import { calculateCdcGrowth } from "./growth/cdcGrowth.js"
import { calculateImmunologyReferenceFields } from "./immunology/reference.js"

const CENTERS = {
  "ADMIN": { label: "Koordinatör (Admin)", prefix: null, isAdmin: true },
  "KOC":   { label: "Koç Üniversitesi Hastanesi", prefix: "KOC", isAdmin: false },
  "MED":   { label: "Medipol", prefix: "MED", isAdmin: false },
}

const THEME = {
  navy: "#0b1f3a",
  red: "#c8102e",
  redSoft: "#fff1f2",
  redBorder: "#fecdd3",
  ink: "#111827",
  muted: "#6b7280",
  page: "#f7f8fb",
}

const SEED_DATA = [{"hasta_id":"KOC-001","pibo":1,"ptbo":0,"cinsiyet":"e","yabanci":0,"yas_ay":58.1,"dogum_yil":2021,"dogum_ay":6,"tani_yil":2023,"tani_ay":12,"semptom_oncesi_gun":290,"muayene_tani_gun":250,"muayene_bronkoskopi_gun":77,"tani_yas_gun":918,"semptom_bronkoskopi_gun":117,"steroid_suresi_gun":140,"tedavi_suresi_gun":183,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":0,"bt_sag_orta_atelektazi":0,"bt_lingula_atelektazi":1,"bt_diger_atelektazi":1,"bt_bronsektazi":1,"bt_sag_orta_bronsektazi":0,"bt_lingula_bronsektazi":1,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":1.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":2.0,"kumulatif_steroid":58.0,"tedi_sonrasi_atak":2.0,"tedi_sonrasi_pnomoni":0.0,"tedavi_sonucu":1.0,"semptom_devam":0.0,"etken_adenovirus":0,"etken_rinovirus":1,"etken_rsv":0,"etken_cmv":0,"etken_influenza":0,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":0,"etken_varicella":0,"etken_ebv":1,"eko":1.0,"pht":0.0,"pap":0.0,"yatis":1.0,"yuksek_akim_o2":1.0,"bal_ureme":1.0,"bal_coklu_ureme":1.0,"bal_kultur1":"H influenzae","bal_kultur2":"M catarrhalis","bal_kultur3":null,"bal_h_influenza":1.0,"bal_m_catarrhalis":1.0,"bal_lipid_ym":0.0,"bal_hemosiderin_ym":0.0,"rpcr":0.0,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":14.7,"va_z_bas":0.49,"va_bit":15.85,"va_z_bit":0.52,"va_z_fark":0.03,"boy_bas":90.1,"boy_z_bas":-0.67,"boy_bit":95.0,"boy_z_bit":-0.44,"vki_bas":18.11,"vki_z_bas":1.25,"vki_bit":17.56,"vki_z_bit":1.03,"vki_fark":-0.22,"iga":0.48,"igm":1.49,"igg":7.91,"ige":55.4,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":8960.0,"cbc_neu":2900.0,"cbc_lym":5200.0,"cbc_eos":200.0,"cbc_nlr":0.5576923076923077,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":0.0,"astim":1.0,"alerjik_rinit":1.0,"tani_u12ay":0.0,"tani_u18ay":0.0,"tani_u36ay":1.0,"sx_u12ay":0.0,"sx_u18ay":1.0,"sx_u36ay":1.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-002","pibo":1,"ptbo":0,"cinsiyet":"e","yabanci":0,"yas_ay":49.4,"dogum_yil":2022,"dogum_ay":2,"tani_yil":2023,"tani_ay":9,"semptom_oncesi_gun":548,"muayene_tani_gun":302,"muayene_bronkoskopi_gun":322,"tani_yas_gun":565,"semptom_bronkoskopi_gun":568,"steroid_suresi_gun":150,"tedavi_suresi_gun":186,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":1,"bt_sag_orta_atelektazi":1,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":0,"bt_bronsektazi":0,"bt_sag_orta_bronsektazi":0,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":1.0,"kumulatif_steroid":45.0,"tedi_sonrasi_atak":2.0,"tedi_sonrasi_pnomoni":0.0,"tedavi_sonucu":2.0,"semptom_devam":0.0,"etken_adenovirus":0,"etken_rinovirus":1,"etken_rsv":1,"etken_cmv":0,"etken_influenza":0,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":1,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":0.0,"pap":0.0,"yatis":1.0,"yuksek_akim_o2":1.0,"bal_ureme":1.0,"bal_coklu_ureme":1.0,"bal_kultur1":"H influenzae","bal_kultur2":"S pneumonia","bal_kultur3":null,"bal_h_influenza":1.0,"bal_m_catarrhalis":0.0,"bal_lipid_ym":1.0,"bal_hemosiderin_ym":0.0,"rpcr":1.0,"bal_solunum_pcr":"Rhinovirus","bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":9.35,"va_z_bas":-2.05,"va_bit":10.9,"va_z_bit":-1.46,"va_z_fark":0.59,"boy_bas":81.5,"boy_z_bas":-0.96,"boy_bit":89.0,"boy_z_bit":-0.08,"vki_bas":14.08,"vki_z_bas":-2.12,"vki_bit":13.76,"vki_z_bit":-2.11,"vki_fark":0.01,"iga":0.27,"igm":0.6,"igg":0.35,"ige":41.0,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":10980.0,"cbc_neu":3700.0,"cbc_lym":6200.0,"cbc_eos":0.0,"cbc_nlr":0.5967741935483871,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":1.0,"astim":0.0,"alerjik_rinit":0.0,"tani_u12ay":0.0,"tani_u18ay":1.0,"tani_u36ay":1.0,"sx_u12ay":1.0,"sx_u18ay":1.0,"sx_u36ay":1.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-003","pibo":1,"ptbo":0,"cinsiyet":"e","yabanci":1,"yas_ay":161.4,"dogum_yil":2012,"dogum_ay":12,"tani_yil":2013,"tani_ay":12,"semptom_oncesi_gun":0,"muayene_tani_gun":340,"muayene_bronkoskopi_gun":19,"tani_yas_gun":361,"semptom_bronkoskopi_gun":3668,"steroid_suresi_gun":182,"tedavi_suresi_gun":182,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":1,"bt_atelektazi":1,"bt_sag_orta_atelektazi":1,"bt_lingula_atelektazi":1,"bt_diger_atelektazi":0,"bt_bronsektazi":1,"bt_sag_orta_bronsektazi":1,"bt_lingula_bronsektazi":1,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":1.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":0.0,"kumulatif_steroid":165.0,"tedi_sonrasi_atak":5.0,"tedi_sonrasi_pnomoni":3.0,"tedavi_sonucu":2.0,"semptom_devam":1.0,"etken_adenovirus":0,"etken_rinovirus":0,"etken_rsv":0,"etken_cmv":0,"etken_influenza":0,"etken_kizamik":1,"etken_metapneumovirus":0,"etken_covid":1,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":0.0,"pap":15.0,"yatis":1.0,"yuksek_akim_o2":1.0,"bal_ureme":1.0,"bal_coklu_ureme":0.0,"bal_kultur1":"H influenzae","bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":1.0,"bal_m_catarrhalis":0.0,"bal_lipid_ym":null,"bal_hemosiderin_ym":null,"rpcr":0.0,"bal_solunum_pcr":"COVID","bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":55.0,"fvc_bas":71.0,"mef2575_bas":24.0,"fev1_bd_bas":8.0,"mef2575_bd_bas":7.0,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":53.0,"fvc_bit":67.0,"mef2575_bit":77.0,"bd_fev1":2.0,"bd_mef2575":29.0,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":34.15,"va_z_bas":-0.5,"va_bit":16.85,"va_z_bit":-0.23,"va_z_fark":0.27,"boy_bas":144.0,"boy_z_bas":0.05,"boy_bit":144.0,"boy_z_bit":0.05,"vki_bas":16.47,"vki_z_bas":-0.68,"vki_bit":16.47,"vki_z_bit":0.61,"vki_fark":1.29,"iga":2.54,"igm":1.02,"igg":9.24,"ige":15.7,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":0.1,"lenfosit_oran":3.5,"notrofil_oran":12.1,"eozinofil_oran":52.5,"cbc_bk":7820.0,"cbc_neu":6200.0,"cbc_lym":900.0,"cbc_eos":100.0,"cbc_nlr":6.888888888888889,"cd3":49.3,"cd4":14.4,"cd8":43.3,"cd4_cd8":0.33,"imun_yetmezlik":1.0,"astim":1.0,"alerjik_rinit":1.0,"tani_u12ay":1.0,"tani_u18ay":1.0,"tani_u36ay":1.0,"sx_u12ay":1.0,"sx_u18ay":1.0,"sx_u36ay":1.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-004","pibo":1,"ptbo":0,"cinsiyet":"k","yabanci":0,"yas_ay":92.1,"dogum_yil":2018,"dogum_ay":8,"tani_yil":2024,"tani_ay":4,"semptom_oncesi_gun":82,"muayene_tani_gun":44,"muayene_bronkoskopi_gun":90,"tani_yas_gun":2080,"semptom_bronkoskopi_gun":128,"steroid_suresi_gun":156,"tedavi_suresi_gun":213,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":1,"bt_sag_orta_atelektazi":1,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":0,"bt_bronsektazi":1,"bt_sag_orta_bronsektazi":1,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":1,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":1.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":2.0,"kumulatif_steroid":58.0,"tedi_sonrasi_atak":0.0,"tedi_sonrasi_pnomoni":0.0,"tedavi_sonucu":1.0,"semptom_devam":0.0,"etken_adenovirus":0,"etken_rinovirus":0,"etken_rsv":0,"etken_cmv":null,"etken_influenza":1,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":1,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":0.0,"pap":null,"yatis":1.0,"yuksek_akim_o2":1.0,"bal_ureme":1.0,"bal_coklu_ureme":0.0,"bal_kultur1":"M Catarrhalis","bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":0.0,"bal_m_catarrhalis":1.0,"bal_lipid_ym":1.0,"bal_hemosiderin_ym":0.0,"rpcr":0.0,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":94.0,"fvc_bit":83.0,"mef2575_bit":115.0,"bd_fev1":6.0,"bd_mef2575":8.0,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":19.6,"va_z_bas":-0.24,"va_bit":23.1,"va_z_bit":0.41,"va_z_fark":0.65,"boy_bas":114.0,"boy_z_bas":0.06,"boy_bit":118.0,"boy_z_bit":0.03,"vki_bas":14.92,"vki_z_bas":-0.38,"vki_bit":16.59,"vki_z_bit":0.56,"vki_fark":0.94,"iga":0.2,"igm":0.72,"igg":11.7,"ige":76.0,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":0.81,"lenfosit_oran":55.0,"notrofil_oran":41.0,"eozinofil_oran":3.5,"cbc_bk":null,"cbc_neu":null,"cbc_lym":null,"cbc_eos":null,"cbc_nlr":null,"cd3":34.0,"cd4":11.9,"cd8":15.7,"cd4_cd8":0.76,"imun_yetmezlik":0.0,"astim":1.0,"alerjik_rinit":0.0,"tani_u12ay":0.0,"tani_u18ay":0.0,"tani_u36ay":0.0,"sx_u12ay":0.0,"sx_u18ay":0.0,"sx_u36ay":0.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-005","pibo":1,"ptbo":0,"cinsiyet":"e","yabanci":1,"yas_ay":98.7,"dogum_yil":2018,"dogum_ay":1,"tani_yil":2024,"tani_ay":5,"semptom_oncesi_gun":137,"muayene_tani_gun":2,"muayene_bronkoskopi_gun":35,"tani_yas_gun":2285,"semptom_bronkoskopi_gun":174,"steroid_suresi_gun":64,"tedavi_suresi_gun":64,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":1,"bt_sag_orta_atelektazi":1,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":0,"bt_bronsektazi":1,"bt_sag_orta_bronsektazi":1,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":1,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":0.75,"kumulatif_steroid":32.0,"tedi_sonrasi_atak":0.0,"tedi_sonrasi_pnomoni":0.0,"tedavi_sonucu":1.0,"semptom_devam":0.0,"etken_adenovirus":0,"etken_rinovirus":0,"etken_rsv":0,"etken_cmv":null,"etken_influenza":0,"etken_kizamik":1,"etken_metapneumovirus":0,"etken_covid":0,"etken_varicella":0,"etken_ebv":0,"eko":0.0,"pht":null,"pap":null,"yatis":1.0,"yuksek_akim_o2":1.0,"bal_ureme":1.0,"bal_coklu_ureme":0.0,"bal_kultur1":"H influenzae","bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":1.0,"bal_m_catarrhalis":0.0,"bal_lipid_ym":1.0,"bal_hemosiderin_ym":0.0,"rpcr":0.0,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":16.25,"va_z_bas":-2.03,"va_bit":16.0,"va_z_bit":-2.32,"va_z_fark":-0.29,"boy_bas":113.0,"boy_z_bas":-0.94,"boy_bit":115.0,"boy_z_bit":-1.03,"vki_bas":12.84,"vki_z_bas":-2.29,"vki_bit":12.53,"vki_z_bit":-2.67,"vki_fark":-0.38,"iga":1.17,"igm":0.81,"igg":13.6,"ige":2.66,"igg1":9.89,"igg2":0.95,"igg3":0.77,"igg4":0.57,"lokosit":0.17,"lenfosit_oran":3.0,"notrofil_oran":13.6,"eozinofil_oran":2.6,"cbc_bk":12470.0,"cbc_neu":7800.0,"cbc_lym":3800.0,"cbc_eos":100.0,"cbc_nlr":2.0526315789473686,"cd3":68.2,"cd4":21.5,"cd8":28.1,"cd4_cd8":0.77,"imun_yetmezlik":0.0,"astim":1.0,"alerjik_rinit":1.0,"tani_u12ay":0.0,"tani_u18ay":0.0,"tani_u36ay":0.0,"sx_u12ay":0.0,"sx_u18ay":0.0,"sx_u36ay":0.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-006","pibo":1,"ptbo":0,"cinsiyet":"e","yabanci":0,"yas_ay":107.3,"dogum_yil":2017,"dogum_ay":5,"tani_yil":2024,"tani_ay":5,"semptom_oncesi_gun":218,"muayene_tani_gun":195,"muayene_bronkoskopi_gun":929,"tani_yas_gun":2557,"semptom_bronkoskopi_gun":952,"steroid_suresi_gun":116,"tedavi_suresi_gun":190,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":0,"bt_sag_orta_atelektazi":0,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":0,"bt_bronsektazi":0,"bt_sag_orta_bronsektazi":0,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":1,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":1.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":0.0,"bronchomunal":0.0,"ivig":1.0,"o2":1.0,"bipap":1.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":1.3,"kumulatif_steroid":66.0,"tedi_sonrasi_atak":2.0,"tedi_sonrasi_pnomoni":1.0,"tedavi_sonucu":2.0,"semptom_devam":1.0,"etken_adenovirus":0,"etken_rinovirus":1,"etken_rsv":0,"etken_cmv":null,"etken_influenza":1,"etken_kizamik":0,"etken_metapneumovirus":1,"etken_covid":0,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":0.0,"pap":0.0,"yatis":1.0,"yuksek_akim_o2":1.0,"bal_ureme":0.0,"bal_coklu_ureme":0.0,"bal_kultur1":null,"bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":0.0,"bal_m_catarrhalis":0.0,"bal_lipid_ym":0.0,"bal_hemosiderin_ym":0.0,"rpcr":0.0,"bal_solunum_pcr":"Metapneumovirus","bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":77.0,"fvc_bas":68.0,"mef2575_bas":114.0,"fev1_bd_bas":-7.0,"mef2575_bd_bas":-5.0,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":107.0,"fvc_bit":98.0,"mef2575_bit":137.0,"bd_fev1":1.0,"bd_mef2575":28.0,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":28.1,"va_z_bas":1.22,"va_bit":33.8,"va_z_bit":2.04,"va_z_fark":0.82,"boy_bas":122.2,"boy_z_bas":0.15,"boy_bit":125.0,"boy_z_bit":-0.03,"vki_bas":18.82,"vki_z_bas":1.56,"vki_bit":21.63,"vki_z_bit":2.22,"vki_fark":0.66,"iga":1.55,"igm":0.62,"igg":6.06,"ige":33.9,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":0.46,"lenfosit_oran":12.0,"notrofil_oran":21.2,"eozinofil_oran":22.3,"cbc_bk":8370.0,"cbc_neu":3700.0,"cbc_lym":3500.0,"cbc_eos":200.0,"cbc_nlr":1.0571428571428572,"cd3":61.9,"cd4":9.0,"cd8":34.5,"cd4_cd8":0.26,"imun_yetmezlik":1.0,"astim":1.0,"alerjik_rinit":0.0,"tani_u12ay":0.0,"tani_u18ay":0.0,"tani_u36ay":0.0,"sx_u12ay":0.0,"sx_u18ay":0.0,"sx_u36ay":0.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-007","pibo":1,"ptbo":0,"cinsiyet":"k","yabanci":0,"yas_ay":31.3,"dogum_yil":2023,"dogum_ay":8,"tani_yil":2024,"tani_ay":6,"semptom_oncesi_gun":85,"muayene_tani_gun":10,"muayene_bronkoskopi_gun":15,"tani_yas_gun":297,"semptom_bronkoskopi_gun":90,"steroid_suresi_gun":158,"tedavi_suresi_gun":176,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":1,"bt_sag_orta_atelektazi":0,"bt_lingula_atelektazi":1,"bt_diger_atelektazi":0,"bt_bronsektazi":0,"bt_sag_orta_bronsektazi":0,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":0.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":0.9,"kumulatif_steroid":80.0,"tedi_sonrasi_atak":2.0,"tedi_sonrasi_pnomoni":1.0,"tedavi_sonucu":2.0,"semptom_devam":0.0,"etken_adenovirus":0,"etken_rinovirus":0,"etken_rsv":1,"etken_cmv":null,"etken_influenza":1,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":0,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":0.0,"pap":null,"yatis":1.0,"yuksek_akim_o2":1.0,"bal_ureme":1.0,"bal_coklu_ureme":0.0,"bal_kultur1":"M Catarrhalis","bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":1.0,"bal_m_catarrhalis":1.0,"bal_lipid_ym":0.0,"bal_hemosiderin_ym":0.0,"rpcr":0.0,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":8.14,"va_z_bas":-0.35,"va_bit":9.65,"va_z_bit":-0.28,"va_z_fark":0.07,"boy_bas":69.0,"boy_z_bas":-0.65,"boy_bit":78.0,"boy_z_bit":-0.55,"vki_bas":17.1,"vki_z_bas":0.1,"vki_bit":16.53,"vki_z_bit":-0.07,"vki_fark":-0.17,"iga":0.28,"igm":null,"igg":null,"ige":null,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":1.35,"lenfosit_oran":3.4,"notrofil_oran":68.7,"eozinofil_oran":6.1,"cbc_bk":10420.0,"cbc_neu":3500.0,"cbc_lym":5900.0,"cbc_eos":300.0,"cbc_nlr":0.5932203389830508,"cd3":58.6,"cd4":15.5,"cd8":34.1,"cd4_cd8":0.46,"imun_yetmezlik":0.0,"astim":0.0,"alerjik_rinit":0.0,"tani_u12ay":1.0,"tani_u18ay":1.0,"tani_u36ay":1.0,"sx_u12ay":1.0,"sx_u18ay":1.0,"sx_u36ay":1.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-008","pibo":1,"ptbo":0,"cinsiyet":"k","yabanci":0,"yas_ay":39.7,"dogum_yil":2022,"dogum_ay":12,"tani_yil":2024,"tani_ay":8,"semptom_oncesi_gun":393,"muayene_tani_gun":80,"muayene_bronkoskopi_gun":124,"tani_yas_gun":615,"semptom_bronkoskopi_gun":437,"steroid_suresi_gun":181,"tedavi_suresi_gun":16,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":1,"bt_sag_orta_atelektazi":1,"bt_lingula_atelektazi":1,"bt_diger_atelektazi":0,"bt_bronsektazi":0,"bt_sag_orta_bronsektazi":0,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":1.1,"kumulatif_steroid":49.0,"tedi_sonrasi_atak":2.0,"tedi_sonrasi_pnomoni":0.0,"tedavi_sonucu":1.0,"semptom_devam":0.0,"etken_adenovirus":1,"etken_rinovirus":0,"etken_rsv":0,"etken_cmv":null,"etken_influenza":0,"etken_kizamik":1,"etken_metapneumovirus":0,"etken_covid":1,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":0.0,"pap":null,"yatis":1.0,"yuksek_akim_o2":1.0,"bal_ureme":0.0,"bal_coklu_ureme":0.0,"bal_kultur1":null,"bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":0.0,"bal_m_catarrhalis":0.0,"bal_lipid_ym":1.0,"bal_hemosiderin_ym":0.0,"rpcr":0.0,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":11.0,"va_z_bas":0.24,"va_bit":11.3,"va_z_bit":-0.4,"va_z_fark":-0.64,"boy_bas":79.0,"boy_z_bas":-0.73,"boy_bit":84.0,"boy_z_bit":-0.76,"vki_bas":17.63,"vki_z_bas":0.97,"vki_bit":16.01,"vki_z_bit":0.04,"vki_fark":-0.93,"iga":0.72,"igm":null,"igg":null,"ige":null,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":11180.0,"cbc_neu":2600.0,"cbc_lym":7400.0,"cbc_eos":200.0,"cbc_nlr":0.35135135135135137,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":0.0,"astim":1.0,"alerjik_rinit":1.0,"tani_u12ay":0.0,"tani_u18ay":1.0,"tani_u36ay":1.0,"sx_u12ay":0.0,"sx_u18ay":1.0,"sx_u36ay":1.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-009","pibo":1,"ptbo":0,"cinsiyet":"e","yabanci":0,"yas_ay":142.9,"dogum_yil":2014,"dogum_ay":6,"tani_yil":2024,"tani_ay":10,"semptom_oncesi_gun":622,"muayene_tani_gun":598,"muayene_bronkoskopi_gun":602,"tani_yas_gun":3762,"semptom_bronkoskopi_gun":626,"steroid_suresi_gun":199,"tedavi_suresi_gun":0,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":1,"bt_sag_orta_atelektazi":1,"bt_lingula_atelektazi":1,"bt_diger_atelektazi":1,"bt_bronsektazi":1,"bt_sag_orta_bronsektazi":1,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":0.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":1.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":1.3,"kumulatif_steroid":70.0,"tedi_sonrasi_atak":1.0,"tedi_sonrasi_pnomoni":1.0,"tedavi_sonucu":2.0,"semptom_devam":0.0,"etken_adenovirus":1,"etken_rinovirus":1,"etken_rsv":0,"etken_cmv":null,"etken_influenza":0,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":0,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":0.0,"pap":null,"yatis":1.0,"yuksek_akim_o2":1.0,"bal_ureme":0.0,"bal_coklu_ureme":0.0,"bal_kultur1":null,"bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":0.0,"bal_m_catarrhalis":0.0,"bal_lipid_ym":null,"bal_hemosiderin_ym":null,"rpcr":0.0,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":46.0,"fvc_bas":77.0,"mef2575_bas":16.0,"fev1_bd_bas":13.0,"mef2575_bd_bas":5.0,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":51.0,"fvc_bit":81.0,"mef2575_bit":24.0,"bd_fev1":4.0,"bd_mef2575":18.0,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":25.9,"va_z_bas":-1.57,"va_bit":28.55,"va_z_bit":-1.39,"va_z_fark":0.18,"boy_bas":130.6,"boy_z_bas":-1.48,"boy_bit":133.8,"boy_z_bit":-1.44,"vki_bas":15.18,"vki_z_bas":-1.09,"vki_bit":15.95,"vki_z_bit":-0.89,"vki_fark":0.2,"iga":0.32,"igm":2.07,"igg":12.8,"ige":6.86,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":0.63,"lenfosit_oran":2.1,"notrofil_oran":65.0,"eozinofil_oran":8.8,"cbc_bk":6200.0,"cbc_neu":2700.0,"cbc_lym":2900.0,"cbc_eos":100.0,"cbc_nlr":0.9310344827586207,"cd3":58.7,"cd4":12.8,"cd8":33.0,"cd4_cd8":0.39,"imun_yetmezlik":0.0,"astim":1.0,"alerjik_rinit":0.0,"tani_u12ay":0.0,"tani_u18ay":0.0,"tani_u36ay":0.0,"sx_u12ay":0.0,"sx_u18ay":0.0,"sx_u36ay":1.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-010","pibo":1,"ptbo":0,"cinsiyet":"e","yabanci":0,"yas_ay":31.6,"dogum_yil":2023,"dogum_ay":8,"tani_yil":2024,"tani_ay":12,"semptom_oncesi_gun":400,"muayene_tani_gun":352,"muayene_bronkoskopi_gun":358,"tani_yas_gun":493,"semptom_bronkoskopi_gun":406,"steroid_suresi_gun":175,"tedavi_suresi_gun":5,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":1,"bt_sag_orta_atelektazi":1,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":0,"bt_bronsektazi":0,"bt_sag_orta_bronsektazi":0,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":2.0,"kumulatif_steroid":115.0,"tedi_sonrasi_atak":1.0,"tedi_sonrasi_pnomoni":0.0,"tedavi_sonucu":1.0,"semptom_devam":0.0,"etken_adenovirus":0,"etken_rinovirus":0,"etken_rsv":1,"etken_cmv":null,"etken_influenza":0,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":0,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":0.0,"pap":null,"yatis":1.0,"yuksek_akim_o2":1.0,"bal_ureme":1.0,"bal_coklu_ureme":1.0,"bal_kultur1":"H influenzae","bal_kultur2":"S marcescens","bal_kultur3":null,"bal_h_influenza":1.0,"bal_m_catarrhalis":0.0,"bal_lipid_ym":0.0,"bal_hemosiderin_ym":0.0,"rpcr":0.0,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":11.25,"va_z_bas":0.06,"va_bit":12.1,"va_z_bit":-0.17,"va_z_fark":-0.23,"boy_bas":77.0,"boy_z_bas":-1.3,"boy_bit":80.5,"boy_z_bit":-1.64,"vki_bas":18.97,"vki_z_bas":1.32,"vki_bit":18.67,"vki_z_bit":1.35,"vki_fark":0.03,"iga":0.07,"igm":0.37,"igg":4.46,"ige":1.59,"igg1":3.82,"igg2":0.89,"igg3":0.33,"igg4":null,"lokosit":2.12,"lenfosit_oran":2.0,"notrofil_oran":77.1,"eozinofil_oran":7.0,"cbc_bk":10660.0,"cbc_neu":3800.0,"cbc_lym":5800.0,"cbc_eos":200.0,"cbc_nlr":0.6551724137931034,"cd3":78.8,"cd4":45.7,"cd8":null,"cd4_cd8":1.71,"imun_yetmezlik":1.0,"astim":1.0,"alerjik_rinit":0.0,"tani_u12ay":0.0,"tani_u18ay":1.0,"tani_u36ay":1.0,"sx_u12ay":0.0,"sx_u18ay":1.0,"sx_u36ay":1.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-011","pibo":1,"ptbo":0,"cinsiyet":"e","yabanci":0,"yas_ay":72.6,"dogum_yil":2020,"dogum_ay":3,"tani_yil":2023,"tani_ay":8,"semptom_oncesi_gun":283,"muayene_tani_gun":58,"muayene_bronkoskopi_gun":126,"tani_yas_gun":1236,"semptom_bronkoskopi_gun":351,"steroid_suresi_gun":169,"tedavi_suresi_gun":36,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":1,"bt_sag_orta_atelektazi":1,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":0,"bt_bronsektazi":1,"bt_sag_orta_bronsektazi":1,"bt_lingula_bronsektazi":1,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":1.2,"kumulatif_steroid":84.0,"tedi_sonrasi_atak":1.0,"tedi_sonrasi_pnomoni":0.0,"tedavi_sonucu":2.0,"semptom_devam":0.0,"etken_adenovirus":1,"etken_rinovirus":0,"etken_rsv":0,"etken_cmv":null,"etken_influenza":0,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":0,"etken_varicella":0,"etken_ebv":0,"eko":0.0,"pht":null,"pap":null,"yatis":1.0,"yuksek_akim_o2":0.0,"bal_ureme":1.0,"bal_coklu_ureme":0.0,"bal_kultur1":"H influenzae","bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":1.0,"bal_m_catarrhalis":0.0,"bal_lipid_ym":0.0,"bal_hemosiderin_ym":0.0,"rpcr":0.0,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":17.9,"va_z_bas":0.77,"va_bit":20.4,"va_z_bit":1.35,"va_z_fark":0.58,"boy_bas":104.5,"boy_z_bas":0.74,"boy_bit":111.0,"boy_z_bit":1.49,"vki_bas":16.39,"vki_z_bas":0.3,"vki_bit":16.64,"vki_z_bit":0.78,"vki_fark":0.48,"iga":0.9,"igm":1.94,"igg":9.3,"ige":22.0,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":8320.0,"cbc_neu":4400.0,"cbc_lym":2900.0,"cbc_eos":200.0,"cbc_nlr":1.5172413793103448,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":0.0,"astim":1.0,"alerjik_rinit":0.0,"tani_u12ay":0.0,"tani_u18ay":0.0,"tani_u36ay":0.0,"sx_u12ay":1.0,"sx_u18ay":1.0,"sx_u36ay":1.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-012","pibo":1,"ptbo":0,"cinsiyet":"k","yabanci":0,"yas_ay":91.4,"dogum_yil":2018,"dogum_ay":9,"tani_yil":2023,"tani_ay":2,"semptom_oncesi_gun":82,"muayene_tani_gun":28,"muayene_bronkoskopi_gun":28,"tani_yas_gun":1628,"semptom_bronkoskopi_gun":82,"steroid_suresi_gun":210,"tedavi_suresi_gun":0,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":1,"bt_sag_orta_atelektazi":0,"bt_lingula_atelektazi":1,"bt_diger_atelektazi":0,"bt_bronsektazi":0,"bt_sag_orta_bronsektazi":0,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":1.5,"kumulatif_steroid":117.5,"tedi_sonrasi_atak":1.0,"tedi_sonrasi_pnomoni":1.0,"tedavi_sonucu":2.0,"semptom_devam":1.0,"etken_adenovirus":0,"etken_rinovirus":0,"etken_rsv":0,"etken_cmv":null,"etken_influenza":1,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":1,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":0.0,"pap":null,"yatis":1.0,"yuksek_akim_o2":0.0,"bal_ureme":1.0,"bal_coklu_ureme":0.0,"bal_kultur1":null,"bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":0.0,"bal_m_catarrhalis":0.0,"bal_lipid_ym":0.0,"bal_hemosiderin_ym":0.0,"rpcr":0.0,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":63.0,"fvc_bas":72.0,"mef2575_bas":34.0,"fev1_bd_bas":2.0,"mef2575_bd_bas":4.0,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":272.0,"fvc_bit":84.0,"mef2575_bit":39.0,"bd_fev1":4.0,"bd_mef2575":4.0,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":14.75,"va_z_bas":-1.13,"va_bit":15.25,"va_z_bit":-1.4,"va_z_fark":-0.27,"boy_bas":107.1,"boy_z_bas":0.33,"boy_bit":108.7,"boy_z_bit":-0.14,"vki_bas":12.86,"vki_z_bas":-2.31,"vki_bit":12.91,"vki_z_bit":-2.16,"vki_fark":0.15,"iga":0.9,"igm":1.67,"igg":7.39,"ige":0.523,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":11750.0,"cbc_neu":3700.0,"cbc_lym":7200.0,"cbc_eos":300.0,"cbc_nlr":0.5138888888888888,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":0.0,"astim":1.0,"alerjik_rinit":0.0,"tani_u12ay":0.0,"tani_u18ay":0.0,"tani_u36ay":0.0,"sx_u12ay":1.0,"sx_u18ay":1.0,"sx_u36ay":1.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-013","pibo":1,"ptbo":0,"cinsiyet":"k","yabanci":1,"yas_ay":92.2,"dogum_yil":2018,"dogum_ay":8,"tani_yil":2020,"tani_ay":1,"semptom_oncesi_gun":490,"muayene_tani_gun":490,"muayene_bronkoskopi_gun":14,"tani_yas_gun":504,"semptom_bronkoskopi_gun":1083,"steroid_suresi_gun":10,"tedavi_suresi_gun":180,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":1,"bt_atelektazi":1,"bt_sag_orta_atelektazi":1,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":0,"bt_bronsektazi":1,"bt_sag_orta_bronsektazi":1,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":1,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":null,"pulse_steroid":0.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":1.0,"ivig":1.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":null,"kumulatif_steroid":0.0,"tedi_sonrasi_atak":2.0,"tedi_sonrasi_pnomoni":1.0,"tedavi_sonucu":2.0,"semptom_devam":1.0,"etken_adenovirus":0,"etken_rinovirus":0,"etken_rsv":0,"etken_cmv":null,"etken_influenza":0,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":1,"etken_varicella":1,"etken_ebv":0,"eko":1.0,"pht":1.0,"pap":null,"yatis":1.0,"yuksek_akim_o2":1.0,"bal_ureme":null,"bal_coklu_ureme":null,"bal_kultur1":null,"bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":null,"bal_m_catarrhalis":null,"bal_lipid_ym":null,"bal_hemosiderin_ym":null,"rpcr":0.0,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":13.3,"va_z_bas":-1.92,"va_bit":14.7,"va_z_bit":-2.39,"va_z_fark":-0.47,"boy_bas":105.0,"boy_z_bas":-1.35,"boy_bit":106.4,"boy_z_bit":-1.84,"vki_bas":13.39,"vki_z_bas":-1.68,"vki_bit":12.89,"vki_z_bit":-1.97,"vki_fark":-0.29,"iga":0.07,"igm":1.19,"igg":12.4,"ige":192.0,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":8390.0,"cbc_neu":2700.0,"cbc_lym":5000.0,"cbc_eos":200.0,"cbc_nlr":0.54,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":1.0,"astim":1.0,"alerjik_rinit":0.0,"tani_u12ay":0.0,"tani_u18ay":0.0,"tani_u36ay":0.0,"sx_u12ay":0.0,"sx_u18ay":0.0,"sx_u36ay":0.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-014","pibo":1,"ptbo":0,"cinsiyet":"k","yabanci":0,"yas_ay":109.6,"dogum_yil":2017,"dogum_ay":3,"tani_yil":2024,"tani_ay":11,"semptom_oncesi_gun":726,"muayene_tani_gun":481,"muayene_bronkoskopi_gun":0,"tani_yas_gun":2819,"semptom_bronkoskopi_gun":null,"steroid_suresi_gun":0,"tedavi_suresi_gun":0,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":1,"bt_sag_orta_atelektazi":1,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":0,"bt_bronsektazi":1,"bt_sag_orta_bronsektazi":1,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":0.0,"pulse_steroid":0.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":null,"kumulatif_steroid":0.0,"tedi_sonrasi_atak":null,"tedi_sonrasi_pnomoni":null,"tedavi_sonucu":1.0,"semptom_devam":1.0,"etken_adenovirus":0,"etken_rinovirus":0,"etken_rsv":0,"etken_cmv":null,"etken_influenza":0,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":1,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":0.0,"pap":null,"yatis":1.0,"yuksek_akim_o2":0.0,"bal_ureme":null,"bal_coklu_ureme":null,"bal_kultur1":null,"bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":null,"bal_m_catarrhalis":null,"bal_lipid_ym":null,"bal_hemosiderin_ym":null,"rpcr":0.0,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":60.0,"fvc_bas":87.0,"mef2575_bas":30.0,"fev1_bd_bas":3.0,"mef2575_bd_bas":22.0,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":22.95,"va_z_bas":-0.32,"va_bit":null,"va_z_bit":null,"va_z_fark":0.32,"boy_bas":124.7,"boy_z_bas":0.21,"boy_bit":null,"boy_z_bit":null,"vki_bas":14.76,"vki_z_bas":-0.58,"vki_bit":null,"vki_z_bit":null,"vki_fark":0.58,"iga":1.21,"igm":1.23,"igg":9.44,"ige":null,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":null,"cbc_neu":null,"cbc_lym":null,"cbc_eos":null,"cbc_nlr":null,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":1.0,"astim":1.0,"alerjik_rinit":1.0,"tani_u12ay":0.0,"tani_u18ay":0.0,"tani_u36ay":0.0,"sx_u12ay":0.0,"sx_u18ay":0.0,"sx_u36ay":1.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-015","pibo":1,"ptbo":0,"cinsiyet":"e","yabanci":1,"yas_ay":126.4,"dogum_yil":2015,"dogum_ay":10,"tani_yil":2026,"tani_ay":1,"semptom_oncesi_gun":2641,"muayene_tani_gun":1,"muayene_bronkoskopi_gun":7,"tani_yas_gun":3737,"semptom_bronkoskopi_gun":2647,"steroid_suresi_gun":30,"tedavi_suresi_gun":30,"hsct":null,"solid_tx":null,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":null,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":1,"bt_atelektazi":0,"bt_sag_orta_atelektazi":0,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":0,"bt_bronsektazi":1,"bt_sag_orta_bronsektazi":1,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":1,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":1.0,"kumulatif_steroid":null,"tedi_sonrasi_atak":null,"tedi_sonrasi_pnomoni":null,"tedavi_sonucu":null,"semptom_devam":1.0,"etken_adenovirus":null,"etken_rinovirus":0,"etken_rsv":0,"etken_cmv":null,"etken_influenza":0,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":0,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":1.0,"pap":null,"yatis":1.0,"yuksek_akim_o2":1.0,"bal_ureme":1.0,"bal_coklu_ureme":0.0,"bal_kultur1":"s pneumoniae","bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":0.0,"bal_m_catarrhalis":0.0,"bal_lipid_ym":0.0,"bal_hemosiderin_ym":0.0,"rpcr":0.0,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":72.0,"fvc_bas":89.0,"mef2575_bas":38.0,"fev1_bd_bas":7.0,"mef2575_bd_bas":30.0,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":48.0,"va_z_bas":null,"va_bit":null,"va_z_bit":null,"va_z_fark":null,"boy_bas":144.0,"boy_z_bas":null,"boy_bit":null,"boy_z_bit":null,"vki_bas":23.15,"vki_z_bas":1.37,"vki_bit":null,"vki_z_bit":null,"vki_fark":null,"iga":1.48,"igm":0.89,"igg":10.9,"ige":207.0,"igg1":8.68,"igg2":2.03,"igg3":1.07,"igg4":0.21,"lokosit":0.9,"lenfosit_oran":0.9,"notrofil_oran":89.7,"eozinofil_oran":7.3,"cbc_bk":11820.0,"cbc_neu":6600.0,"cbc_lym":3500.0,"cbc_eos":1500.0,"cbc_nlr":null,"cd3":92.1,"cd4":33.0,"cd8":30.7,"cd4_cd8":1.08,"imun_yetmezlik":1.0,"astim":1.0,"alerjik_rinit":0.0,"tani_u12ay":0.0,"tani_u18ay":0.0,"tani_u36ay":0.0,"sx_u12ay":0.0,"sx_u18ay":0.0,"sx_u36ay":1.0,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-016","pibo":1,"ptbo":0,"cinsiyet":"k","yabanci":0,"yas_ay":113.5,"dogum_yil":2016,"dogum_ay":11,"tani_yil":2026,"tani_ay":2,"semptom_oncesi_gun":55,"muayene_tani_gun":10,"muayene_bronkoskopi_gun":11,"tani_yas_gun":3372,"semptom_bronkoskopi_gun":56,"steroid_suresi_gun":3,"tedavi_suresi_gun":30,"hsct":0,"solid_tx":1,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":-416,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":1,"bt_sag_orta_atelektazi":1,"bt_lingula_atelektazi":1,"bt_diger_atelektazi":1,"bt_bronsektazi":0,"bt_sag_orta_bronsektazi":0,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":1.0,"azitromisin":null,"flutikazon":null,"montelukast":null,"bronchomunal":null,"ivig":null,"o2":null,"bipap":null,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":null,"kumulatif_steroid":null,"tedi_sonrasi_atak":null,"tedi_sonrasi_pnomoni":null,"tedavi_sonucu":null,"semptom_devam":null,"etken_adenovirus":0,"etken_rinovirus":1,"etken_rsv":0,"etken_cmv":1,"etken_influenza":0,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":1,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":0.0,"pap":0.0,"yatis":1.0,"yuksek_akim_o2":0.0,"bal_ureme":0.0,"bal_coklu_ureme":0.0,"bal_kultur1":null,"bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":1.0,"bal_m_catarrhalis":null,"bal_lipid_ym":null,"bal_hemosiderin_ym":null,"rpcr":null,"bal_solunum_pcr":"rhino","bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":27.3,"va_z_bas":null,"va_bit":null,"va_z_bit":null,"va_z_fark":null,"boy_bas":126.0,"boy_z_bas":null,"boy_bit":null,"boy_z_bit":null,"vki_bas":null,"vki_z_bas":null,"vki_bit":null,"vki_z_bit":null,"vki_fark":null,"iga":null,"igm":null,"igg":null,"ige":null,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":null,"cbc_neu":null,"cbc_lym":null,"cbc_eos":null,"cbc_nlr":null,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":null,"astim":null,"alerjik_rinit":null,"tani_u12ay":null,"tani_u18ay":null,"tani_u36ay":null,"sx_u12ay":null,"sx_u18ay":null,"sx_u36ay":null,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-017","pibo":1,"ptbo":0,"cinsiyet":"e","yabanci":0,"yas_ay":102.0,"dogum_yil":2017,"dogum_ay":10,"tani_yil":2021,"tani_ay":2,"semptom_oncesi_gun":44,"muayene_tani_gun":638,"muayene_bronkoskopi_gun":621,"tani_yas_gun":1199,"semptom_bronkoskopi_gun":27,"steroid_suresi_gun":57,"tedavi_suresi_gun":135,"hsct":0,"solid_tx":1,"gvhd":null,"gvhd_yeri":null,"tx1_tani_gun":-680,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":null,"bt_atelektazi":null,"bt_sag_orta_atelektazi":null,"bt_lingula_atelektazi":null,"bt_diger_atelektazi":null,"bt_bronsektazi":null,"bt_sag_orta_bronsektazi":null,"bt_lingula_bronsektazi":null,"bt_diger_bronsektazi":null,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":null,"pulse_steroid":null,"azitromisin":null,"flutikazon":null,"montelukast":null,"bronchomunal":null,"ivig":null,"o2":null,"bipap":null,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":null,"kumulatif_steroid":null,"tedi_sonrasi_atak":null,"tedi_sonrasi_pnomoni":null,"tedavi_sonucu":null,"semptom_devam":null,"etken_adenovirus":null,"etken_rinovirus":null,"etken_rsv":null,"etken_cmv":null,"etken_influenza":null,"etken_kizamik":null,"etken_metapneumovirus":null,"etken_covid":null,"etken_varicella":null,"etken_ebv":null,"eko":null,"pht":null,"pap":null,"yatis":null,"yuksek_akim_o2":null,"bal_ureme":null,"bal_coklu_ureme":null,"bal_kultur1":null,"bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":null,"bal_m_catarrhalis":null,"bal_lipid_ym":null,"bal_hemosiderin_ym":null,"rpcr":null,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":null,"va_z_bas":null,"va_bit":null,"va_z_bit":null,"va_z_fark":null,"boy_bas":null,"boy_z_bas":null,"boy_bit":null,"boy_z_bit":null,"vki_bas":null,"vki_z_bas":null,"vki_bit":null,"vki_z_bit":null,"vki_fark":null,"iga":null,"igm":null,"igg":null,"ige":null,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":null,"cbc_neu":null,"cbc_lym":null,"cbc_eos":null,"cbc_nlr":null,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":null,"astim":null,"alerjik_rinit":null,"tani_u12ay":null,"tani_u18ay":null,"tani_u36ay":null,"sx_u12ay":null,"sx_u18ay":null,"sx_u36ay":null,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-018","pibo":1,"ptbo":0,"cinsiyet":"k","yabanci":0,"yas_ay":88.0,"dogum_yil":2018,"dogum_ay":12,"tani_yil":2023,"tani_ay":4,"semptom_oncesi_gun":3,"muayene_tani_gun":2,"muayene_bronkoskopi_gun":18,"tani_yas_gun":1585,"semptom_bronkoskopi_gun":19,"steroid_suresi_gun":85,"tedavi_suresi_gun":null,"hsct":0,"solid_tx":1,"gvhd":1,"gvhd_yeri":"ptld","tx1_tani_gun":-724,"tx2_tani_gun":null,"gvhd_tani_gun":-547,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":1,"bt_sag_orta_atelektazi":1,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":1,"bt_bronsektazi":0,"bt_sag_orta_bronsektazi":0,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":0.0,"pulse_steroid":1.0,"azitromisin":null,"flutikazon":null,"montelukast":null,"bronchomunal":null,"ivig":null,"o2":null,"bipap":null,"imv":null,"ecmo":null,"ex":null,"steroid_baslangic_dozu":null,"kumulatif_steroid":null,"tedi_sonrasi_atak":null,"tedi_sonrasi_pnomoni":null,"tedavi_sonucu":null,"semptom_devam":null,"etken_adenovirus":null,"etken_rinovirus":null,"etken_rsv":null,"etken_cmv":null,"etken_influenza":null,"etken_kizamik":null,"etken_metapneumovirus":null,"etken_covid":null,"etken_varicella":null,"etken_ebv":null,"eko":null,"pht":null,"pap":null,"yatis":null,"yuksek_akim_o2":null,"bal_ureme":null,"bal_coklu_ureme":null,"bal_kultur1":null,"bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":null,"bal_m_catarrhalis":null,"bal_lipid_ym":null,"bal_hemosiderin_ym":null,"rpcr":null,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":22.8,"va_z_bas":null,"va_bit":null,"va_z_bit":null,"va_z_fark":null,"boy_bas":117.5,"boy_z_bas":null,"boy_bit":null,"boy_z_bit":null,"vki_bas":null,"vki_z_bas":null,"vki_bit":null,"vki_z_bit":null,"vki_fark":null,"iga":null,"igm":null,"igg":null,"ige":null,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":null,"cbc_neu":null,"cbc_lym":null,"cbc_eos":null,"cbc_nlr":null,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":null,"astim":null,"alerjik_rinit":null,"tani_u12ay":null,"tani_u18ay":null,"tani_u36ay":null,"sx_u12ay":null,"sx_u18ay":null,"sx_u36ay":null,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-019","pibo":0,"ptbo":1,"cinsiyet":"k","yabanci":0,"yas_ay":125.5,"dogum_yil":2015,"dogum_ay":11,"tani_yil":2025,"tani_ay":5,"semptom_oncesi_gun":90,"muayene_tani_gun":90,"muayene_bronkoskopi_gun":91,"tani_yas_gun":3464,"semptom_bronkoskopi_gun":91,"steroid_suresi_gun":122,"tedavi_suresi_gun":0,"hsct":1,"solid_tx":0,"gvhd":1,"gvhd_yeri":"gis","tx1_tani_gun":-85,"tx2_tani_gun":null,"gvhd_tani_gun":-15,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":null,"bt_atelektazi":null,"bt_sag_orta_atelektazi":null,"bt_lingula_atelektazi":null,"bt_diger_atelektazi":null,"bt_bronsektazi":null,"bt_sag_orta_bronsektazi":null,"bt_lingula_bronsektazi":null,"bt_diger_bronsektazi":null,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":null,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":null,"ivig":null,"o2":null,"bipap":null,"imv":1.0,"ecmo":0.0,"ex":1.0,"steroid_baslangic_dozu":1.3,"kumulatif_steroid":null,"tedi_sonrasi_atak":null,"tedi_sonrasi_pnomoni":null,"tedavi_sonucu":null,"semptom_devam":1.0,"etken_adenovirus":null,"etken_rinovirus":null,"etken_rsv":null,"etken_cmv":1,"etken_influenza":null,"etken_kizamik":null,"etken_metapneumovirus":null,"etken_covid":null,"etken_varicella":null,"etken_ebv":null,"eko":null,"pht":null,"pap":null,"yatis":null,"yuksek_akim_o2":1.0,"bal_ureme":0.0,"bal_coklu_ureme":null,"bal_kultur1":null,"bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":null,"bal_m_catarrhalis":null,"bal_lipid_ym":null,"bal_hemosiderin_ym":null,"rpcr":null,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":null,"va_z_bas":null,"va_bit":null,"va_z_bit":null,"va_z_fark":null,"boy_bas":null,"boy_z_bas":null,"boy_bit":null,"boy_z_bit":null,"vki_bas":null,"vki_z_bas":null,"vki_bit":null,"vki_z_bit":null,"vki_fark":null,"iga":null,"igm":null,"igg":null,"ige":null,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":null,"cbc_neu":null,"cbc_lym":null,"cbc_eos":null,"cbc_nlr":null,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":null,"astim":null,"alerjik_rinit":null,"tani_u12ay":null,"tani_u18ay":null,"tani_u36ay":null,"sx_u12ay":null,"sx_u18ay":0.0,"sx_u36ay":null,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-020","pibo":0,"ptbo":1,"cinsiyet":"k","yabanci":0,"yas_ay":89.3,"dogum_yil":2018,"dogum_ay":11,"tani_yil":2025,"tani_ay":10,"semptom_oncesi_gun":3,"muayene_tani_gun":0,"muayene_bronkoskopi_gun":6,"tani_yas_gun":2525,"semptom_bronkoskopi_gun":9,"steroid_suresi_gun":10,"tedavi_suresi_gun":150,"hsct":1,"solid_tx":0,"gvhd":0,"gvhd_yeri":"0","tx1_tani_gun":-41,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":0,"bt_sag_orta_atelektazi":0,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":0,"bt_bronsektazi":0,"bt_sag_orta_bronsektazi":0,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":0.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":2.0,"kumulatif_steroid":null,"tedi_sonrasi_atak":null,"tedi_sonrasi_pnomoni":null,"tedavi_sonucu":null,"semptom_devam":0.0,"etken_adenovirus":0,"etken_rinovirus":0,"etken_rsv":0,"etken_cmv":0,"etken_influenza":0,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":0,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":0.0,"pap":null,"yatis":1.0,"yuksek_akim_o2":0.0,"bal_ureme":0.0,"bal_coklu_ureme":0.0,"bal_kultur1":null,"bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":0.0,"bal_m_catarrhalis":0.0,"bal_lipid_ym":null,"bal_hemosiderin_ym":0.0,"rpcr":0.0,"bal_solunum_pcr":0.0,"bal_cmv_pcr":0.0,"bal_pjir":0.0,"fev1_bas":111.0,"fvc_bas":97.0,"mef2575_bas":112.0,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":107.0,"rv_bas":367.0,"tlc_bas":167.0,"rv_tlc_bas":256.0,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":18.7,"va_z_bas":null,"va_bit":null,"va_z_bit":null,"va_z_fark":null,"boy_bas":116.0,"boy_z_bas":null,"boy_bit":null,"boy_z_bit":null,"vki_bas":null,"vki_z_bas":null,"vki_bit":null,"vki_z_bit":null,"vki_fark":null,"iga":null,"igm":null,"igg":null,"ige":null,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":null,"cbc_neu":null,"cbc_lym":null,"cbc_eos":null,"cbc_nlr":null,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":null,"astim":null,"alerjik_rinit":null,"tani_u12ay":null,"tani_u18ay":null,"tani_u36ay":null,"sx_u12ay":null,"sx_u18ay":null,"sx_u36ay":null,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-021","pibo":0,"ptbo":1,"cinsiyet":"k","yabanci":0,"yas_ay":235.6,"dogum_yil":2006,"dogum_ay":11,"tani_yil":2026,"tani_ay":3,"semptom_oncesi_gun":0,"muayene_tani_gun":1,"muayene_bronkoskopi_gun":null,"tani_yas_gun":7061,"semptom_bronkoskopi_gun":null,"steroid_suresi_gun":10,"tedavi_suresi_gun":0,"hsct":1,"solid_tx":0,"gvhd":1,"gvhd_yeri":"deri","tx1_tani_gun":-483,"tx2_tani_gun":null,"gvhd_tani_gun":-39,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":0,"bt_atelektazi":0,"bt_sag_orta_atelektazi":0,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":0,"bt_bronsektazi":0,"bt_sag_orta_bronsektazi":0,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":null,"flutikazon":null,"montelukast":null,"bronchomunal":null,"ivig":null,"o2":null,"bipap":null,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":null,"kumulatif_steroid":null,"tedi_sonrasi_atak":null,"tedi_sonrasi_pnomoni":null,"tedavi_sonucu":null,"semptom_devam":null,"etken_adenovirus":null,"etken_rinovirus":null,"etken_rsv":null,"etken_cmv":null,"etken_influenza":null,"etken_kizamik":null,"etken_metapneumovirus":null,"etken_covid":null,"etken_varicella":null,"etken_ebv":null,"eko":null,"pht":null,"pap":null,"yatis":1.0,"yuksek_akim_o2":null,"bal_ureme":null,"bal_coklu_ureme":null,"bal_kultur1":null,"bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":null,"bal_m_catarrhalis":null,"bal_lipid_ym":null,"bal_hemosiderin_ym":null,"rpcr":null,"bal_solunum_pcr":null,"bal_cmv_pcr":null,"bal_pjir":null,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":56.9,"va_z_bas":0.0,"va_bit":null,"va_z_bit":null,"va_z_fark":null,"boy_bas":158.0,"boy_z_bas":null,"boy_bit":null,"boy_z_bit":null,"vki_bas":null,"vki_z_bas":null,"vki_bit":null,"vki_z_bit":null,"vki_fark":null,"iga":null,"igm":null,"igg":null,"ige":null,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":null,"cbc_neu":null,"cbc_lym":null,"cbc_eos":null,"cbc_nlr":null,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":null,"astim":null,"alerjik_rinit":null,"tani_u12ay":null,"tani_u18ay":null,"tani_u36ay":null,"sx_u12ay":null,"sx_u18ay":null,"sx_u36ay":null,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-022","pibo":0,"ptbo":1,"cinsiyet":"e","yabanci":0,"yas_ay":186.2,"dogum_yil":2010,"dogum_ay":11,"tani_yil":2024,"tani_ay":9,"semptom_oncesi_gun":7,"muayene_tani_gun":7,"muayene_bronkoskopi_gun":16,"tani_yas_gun":5051,"semptom_bronkoskopi_gun":16,"steroid_suresi_gun":188,"tedavi_suresi_gun":0,"hsct":1,"solid_tx":0,"gvhd":1,"gvhd_yeri":"tükrükbezi","tx1_tani_gun":-212,"tx2_tani_gun":null,"gvhd_tani_gun":null,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":1,"bt_atelektazi":0,"bt_sag_orta_atelektazi":0,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":0,"bt_bronsektazi":0,"bt_sag_orta_bronsektazi":0,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":0.0,"bipap":0.0,"imv":0.0,"ecmo":0.0,"ex":0.0,"steroid_baslangic_dozu":2.0,"kumulatif_steroid":180.0,"tedi_sonrasi_atak":0.0,"tedi_sonrasi_pnomoni":0.0,"tedavi_sonucu":1.0,"semptom_devam":1.0,"etken_adenovirus":null,"etken_rinovirus":null,"etken_rsv":null,"etken_cmv":null,"etken_influenza":null,"etken_kizamik":null,"etken_metapneumovirus":null,"etken_covid":null,"etken_varicella":null,"etken_ebv":1,"eko":0.0,"pht":null,"pap":null,"yatis":1.0,"yuksek_akim_o2":0.0,"bal_ureme":0.0,"bal_coklu_ureme":0.0,"bal_kultur1":null,"bal_kultur2":null,"bal_kultur3":null,"bal_h_influenza":0.0,"bal_m_catarrhalis":0.0,"bal_lipid_ym":0.0,"bal_hemosiderin_ym":0.0,"rpcr":0.0,"bal_solunum_pcr":"SARSCOV2","bal_cmv_pcr":0.0,"bal_pjir":0.0,"fev1_bas":73.0,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":56.0,"rv_bas":82.0,"tlc_bas":86.0,"rv_tlc_bas":null,"fev1_bit":92.0,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":73.0,"rv_bit":61.0,"tlc_bit":85.0,"rv_tlc_bit":67.0,"va_bas":38.5,"va_z_bas":null,"va_bit":58.0,"va_z_bit":null,"va_z_fark":null,"boy_bas":151.0,"boy_z_bas":null,"boy_bit":156.0,"boy_z_bit":null,"vki_bas":null,"vki_z_bas":null,"vki_bit":null,"vki_z_bit":null,"vki_fark":null,"iga":null,"igm":null,"igg":15.3,"ige":null,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":0.14,"lenfosit_oran":3.2,"notrofil_oran":39.4,"eozinofil_oran":10.2,"cbc_bk":null,"cbc_neu":null,"cbc_lym":null,"cbc_eos":null,"cbc_nlr":null,"cd3":77.8,"cd4":7.7,"cd8":67.6,"cd4_cd8":0.12,"imun_yetmezlik":null,"astim":null,"alerjik_rinit":null,"tani_u12ay":null,"tani_u18ay":null,"tani_u36ay":null,"sx_u12ay":null,"sx_u18ay":null,"sx_u36ay":null,"xu_siddet":null,"merkez":"KOC"},{"hasta_id":"KOC-023","pibo":0,"ptbo":1,"cinsiyet":"e","yabanci":0,"yas_ay":45.4,"dogum_yil":2022,"dogum_ay":6,"tani_yil":2025,"tani_ay":10,"semptom_oncesi_gun":21,"muayene_tani_gun":0,"muayene_bronkoskopi_gun":3,"tani_yas_gun":1215,"semptom_bronkoskopi_gun":24,"steroid_suresi_gun":150,"tedavi_suresi_gun":150,"hsct":1,"solid_tx":0,"gvhd":1,"gvhd_yeri":"deri","tx1_tani_gun":-958,"tx2_tani_gun":-166,"gvhd_tani_gun":-86,"azitro_bitis_tani_gun":null,"bt_infiltrasyon":1,"bt_atelektazi":0,"bt_sag_orta_atelektazi":0,"bt_lingula_atelektazi":0,"bt_diger_atelektazi":0,"bt_bronsektazi":0,"bt_sag_orta_bronsektazi":0,"bt_lingula_bronsektazi":0,"bt_diger_bronsektazi":0,"bhalla_skoru":null,"teper_skoru":null,"webb_skoru":null,"sistemik_steroid":1.0,"pulse_steroid":0.0,"azitromisin":1.0,"flutikazon":1.0,"montelukast":1.0,"bronchomunal":0.0,"ivig":0.0,"o2":1.0,"bipap":1.0,"imv":1.0,"ecmo":1.0,"ex":0.0,"steroid_baslangic_dozu":1.0,"kumulatif_steroid":164.0,"tedi_sonrasi_atak":2.0,"tedi_sonrasi_pnomoni":1.0,"tedavi_sonucu":3.0,"semptom_devam":1.0,"etken_adenovirus":0,"etken_rinovirus":1,"etken_rsv":0,"etken_cmv":1,"etken_influenza":0,"etken_kizamik":0,"etken_metapneumovirus":0,"etken_covid":1,"etken_varicella":0,"etken_ebv":0,"eko":1.0,"pht":0.0,"pap":0.0,"yatis":1.0,"yuksek_akim_o2":1.0,"bal_ureme":1.0,"bal_coklu_ureme":1.0,"bal_kultur1":"P Jirovecii","bal_kultur2":"RSV","bal_kultur3":"CMV","bal_h_influenza":0.0,"bal_m_catarrhalis":0.0,"bal_lipid_ym":0.0,"bal_hemosiderin_ym":0.0,"rpcr":1.0,"bal_solunum_pcr":"CMV","bal_cmv_pcr":1.0,"bal_pjir":1.0,"fev1_bas":null,"fvc_bas":null,"mef2575_bas":null,"fev1_bd_bas":null,"mef2575_bd_bas":null,"x5_bas":null,"r5_bas":null,"ax_bas":null,"dlco_bas":null,"rv_bas":null,"tlc_bas":null,"rv_tlc_bas":null,"fev1_bit":null,"fvc_bit":null,"mef2575_bit":null,"bd_fev1":null,"bd_mef2575":null,"x5_bit":null,"r5_bit":null,"ax_bit":null,"dlco_bit":null,"rv_bit":null,"tlc_bit":null,"rv_tlc_bit":null,"va_bas":14.9,"va_z_bas":null,"va_bit":19.5,"va_z_bit":null,"va_z_fark":null,"boy_bas":98.0,"boy_z_bas":null,"boy_bit":101.0,"boy_z_bit":null,"vki_bas":null,"vki_z_bas":null,"vki_bit":null,"vki_z_bit":null,"vki_fark":null,"iga":null,"igm":null,"igg":null,"ige":null,"igg1":null,"igg2":null,"igg3":null,"igg4":null,"lokosit":null,"lenfosit_oran":null,"notrofil_oran":null,"eozinofil_oran":null,"cbc_bk":null,"cbc_neu":null,"cbc_lym":null,"cbc_eos":null,"cbc_nlr":null,"cd3":null,"cd4":null,"cd8":null,"cd4_cd8":null,"imun_yetmezlik":null,"astim":null,"alerjik_rinit":null,"tani_u12ay":0.0,"tani_u18ay":0.0,"tani_u36ay":1.0,"sx_u12ay":0.0,"sx_u18ay":0.0,"sx_u36ay":1.0,"xu_siddet":null,"merkez":"KOC"}]
const LEGACY_COLUMN_KEYS = new Set(Object.keys(SEED_DATA[0] ?? {}))

function pickRecordColumns(record, allowedColumns) {
  return Object.fromEntries(Object.entries(record).filter(([key]) => allowedColumns.has(key)))
}

function formatSupabaseError(error) {
  return [error?.message, error?.details, error?.hint].filter(Boolean).join(" ")
}

function parseDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function dateToInput(value) {
  const date = parseDate(value)
  if (!date) return ""
  return date.toISOString().slice(0, 10)
}

function daysBetween(later, earlier) {
  const a = parseDate(later)
  const b = parseDate(earlier)
  if (!a || !b) return null
  return Math.round((a.getTime() - b.getTime()) / 86400000)
}

function round(value, digits = 1) {
  if (value == null || !Number.isFinite(value)) return null
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function numberOrNull(value) {
  if (value === "" || value == null) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function sexForGrowth(value) {
  if (value === "e" || value === "male") return "male"
  if (value === "k" || value === "female") return "female"
  return null
}

function calculateGrowthFields(patient, ageMonths, vkiBas) {
  const heightCm = numberOrNull(patient.boy_bas)
  const weightKg = numberOrNull(patient.va_bas)
  const sex = sexForGrowth(patient.cinsiyet)
  const numericAgeMonths = numberOrNull(ageMonths ?? patient.yas_ay)

  if (!sex || !heightCm || !weightKg || numericAgeMonths == null) {
    return {
      ...(vkiBas != null ? { vki_bas: vkiBas } : {}),
      growth_reference_status: "missing_input",
    }
  }

  const results = calculateCdcGrowth({
    ageMonths: numericAgeMonths,
    heightCm,
    sex,
    weightKg,
  })
  const byMetric = Object.fromEntries(results.map((result) => [result.metric, result]))
  const hasCdcScore = results.some((result) => result.zScore != null)

  return {
    vki_bas: vkiBas ?? round(byMetric.bmi?.value, 2),
    ...(byMetric.weight?.zScore != null ? { va_z_bas: round(byMetric.weight.zScore, 2) } : {}),
    ...(byMetric.stature?.zScore != null ? { boy_z_bas: round(byMetric.stature.zScore, 2) } : {}),
    ...(byMetric.bmi?.zScore != null ? { vki_z_bas: round(byMetric.bmi.zScore, 2) } : {}),
    growth_reference_status: hasCdcScore
      ? "cdc_2_20"
      : numericAgeMonths < 24
        ? "under_2_needs_who"
        : "cdc_out_of_range",
  }
}

function calculateTreatmentFields(patient) {
  const sistemikDoz = numberOrNull(patient.sistemik_steroid_mgkg_gun ?? patient.steroid_baslangic_dozu)
  const sistemikGun = numberOrNull(patient.sistemik_steroid_gun ?? patient.steroid_suresi_gun)
  const sistemikPlanGun = numberOrNull(patient.sistemik_steroid_plan_gun)
  const kumulatifSistemik = sistemikDoz != null && sistemikGun != null ? round(sistemikDoz * sistemikGun, 2) : null
  const pulseSteroidDoz = numberOrNull(patient.pulse_steroid_mgkg)

  const neb2AdetGun = numberOrNull(patient.flutikazon_neb_2mg_adet_gun)
  const neb2Gun = numberOrNull(patient.flutikazon_neb_2mg_gun)
  const neb05AdetGun = numberOrNull(patient.flutikazon_neb_05mg_adet_gun)
  const neb05Gun = numberOrNull(patient.flutikazon_neb_05mg_gun)
  const inh125Puff = numberOrNull(patient.flutikazon_inhaler_125_puff_gun)
  const inh125Gun = numberOrNull(patient.flutikazon_inhaler_125_gun)
  const inh50Puff = numberOrNull(patient.flutikazon_inhaler_50_puff_gun)
  const inh50Gun = numberOrNull(patient.flutikazon_inhaler_50_gun)
  const seretide125Puff = numberOrNull(patient.seretide_125_puff_gun)
  const seretide125Gun = numberOrNull(patient.seretide_125_gun)
  const seretide250Puff = numberOrNull(patient.seretide_250_puff_gun)
  const seretide250Gun = numberOrNull(patient.seretide_250_gun)

  const flutikazonNebMcg =
    (neb2AdetGun != null && neb2Gun != null ? neb2AdetGun * neb2Gun * 2000 : 0) +
    (neb05AdetGun != null && neb05Gun != null ? neb05AdetGun * neb05Gun * 500 : 0)
  const flutikazonInhalerMcg =
    (inh125Puff != null && inh125Gun != null ? inh125Puff * inh125Gun * 125 : 0) +
    (inh50Puff != null && inh50Gun != null ? inh50Puff * inh50Gun * 50 : 0)
  const seretideFlutikazonMcg =
    (seretide125Puff != null && seretide125Gun != null ? seretide125Puff * seretide125Gun * 125 : 0) +
    (seretide250Puff != null && seretide250Gun != null ? seretide250Puff * seretide250Gun * 250 : 0)
  const toplamInhaleSteroidMcg = flutikazonNebMcg + flutikazonInhalerMcg + seretideFlutikazonMcg

  const azitromisin = patient.azitromisin == 1 || patient.azitromisin_aldi == 1
  const montelukast = patient.montelukast == 1 || patient.montelukast_aldi == 1
  const inhaleSteroid = toplamInhaleSteroidMcg > 0 || patient.flutikazon == 1 || patient.inhale_steroid_aldi == 1
  const ivig = patient.ivig == 1 || patient.ivig_aldi == 1 || patient.ivig_aliyor == 1

  return {
    ...(sistemikDoz != null ? { sistemik_steroid_mgkg_gun: sistemikDoz, steroid_baslangic_dozu: sistemikDoz } : {}),
    ...(sistemikGun != null ? { sistemik_steroid_gun: sistemikGun, steroid_suresi_gun: sistemikGun } : {}),
    ...(sistemikPlanGun != null ? { sistemik_steroid_plan_gun: sistemikPlanGun } : {}),
    ...(kumulatifSistemik != null ? { kumulatif_sistemik_steroid_mgkg: kumulatifSistemik, kumulatif_steroid: kumulatifSistemik } : {}),
    sistemik_steroid: sistemikDoz != null || sistemikGun != null || kumulatifSistemik != null || patient.sistemik_steroid == 1 ? 1 : 0,
    ...(pulseSteroidDoz != null ? { pulse_steroid_mgkg: pulseSteroidDoz } : {}),
    pulse_steroid: pulseSteroidDoz != null || patient.pulse_steroid == 1 ? 1 : patient.pulse_steroid ?? null,
    ...(neb2AdetGun != null ? { flutikazon_neb_2mg_adet_gun: neb2AdetGun } : {}),
    ...(neb05AdetGun != null ? { flutikazon_neb_05mg_adet_gun: neb05AdetGun } : {}),
    ...(inh125Puff != null ? { flutikazon_inhaler_125_puff_gun: inh125Puff } : {}),
    ...(inh50Puff != null ? { flutikazon_inhaler_50_puff_gun: inh50Puff } : {}),
    ...(seretide125Puff != null ? { seretide_125_puff_gun: seretide125Puff } : {}),
    ...(seretide250Puff != null ? { seretide_250_puff_gun: seretide250Puff } : {}),
    flutikazon_neb_toplam_mcg: flutikazonNebMcg || null,
    flutikazon_inhaler_toplam_mcg: flutikazonInhalerMcg || null,
    seretide_toplam_flutikazon_mcg: seretideFlutikazonMcg || null,
    toplam_inhale_steroid_mcg: toplamInhaleSteroidMcg || null,
    inhale_steroid_aldi: inhaleSteroid ? 1 : 0,
    flutikazon: inhaleSteroid ? 1 : patient.flutikazon ?? null,
    azitromisin: azitromisin ? 1 : patient.azitromisin ?? null,
    azitromisin_aldi: azitromisin ? 1 : 0,
    montelukast: montelukast ? 1 : patient.montelukast ?? null,
    montelukast_aldi: montelukast ? 1 : 0,
    fam_aldi: inhaleSteroid || azitromisin || montelukast ? 1 : 0,
    ivig: ivig ? 1 : patient.ivig ?? null,
    ivig_aldi: ivig ? 1 : 0,
    seretide_aldi: seretideFlutikazonMcg > 0 ? 1 : patient.seretide_aldi ?? null,
    ventolin_aldi: patient.ventolin_aldi ?? null,
  }
}

function calculateDerivedFields(patient) {
  const calculatedTaniYasGun = daysBetween(patient.tani_tarihi, patient.dogum_tarihi)
  const taniYasGun = calculatedTaniYasGun ?? numberOrNull(patient.tani_yas_gun)
  const semptomTaniGun = daysBetween(patient.tani_tarihi, patient.semptom_baslangic_tarihi)
  const muayeneTaniGun = daysBetween(patient.tani_tarihi, patient.ilk_muayene_tarihi)
  const muayeneBronkoskopiGun = daysBetween(patient.bronkoskopi_tarihi, patient.ilk_muayene_tarihi)
  const semptomBronkoskopiGun = daysBetween(patient.bronkoskopi_tarihi, patient.semptom_baslangic_tarihi)
  const weightKg = numberOrNull(patient.va_bas)
  const heightCm = numberOrNull(patient.boy_bas)
  const vkiBas = weightKg && heightCm ? round(weightKg / ((heightCm / 100) ** 2), 2) : null
  const ageMonths = taniYasGun == null ? numberOrNull(patient.yas_ay) : round(taniYasGun / 30.4375, 1)
  const growthFields = calculateGrowthFields(patient, ageMonths, vkiBas)
  const treatmentFields = calculateTreatmentFields(patient)
  const immunologyFields = calculateImmunologyReferenceFields(patient, ageMonths)

  const derived = {
    tani_yas_gun: taniYasGun,
    tani_yas_ay: taniYasGun == null ? null : round(taniYasGun / 30.4375, 1),
    yas_ay: ageMonths,
    semptom_tani_gun: semptomTaniGun,
    semptom_oncesi_gun: semptomTaniGun,
    muayene_tani_gun: muayeneTaniGun,
    muayene_bronkoskopi_gun: muayeneBronkoskopiGun,
    semptom_bronkoskopi_gun: semptomBronkoskopiGun,
    ...growthFields,
    ...treatmentFields,
    ...immunologyFields,
    dogum_yil: parseDate(patient.dogum_tarihi)?.getFullYear() ?? patient.dogum_yil ?? null,
    dogum_ay: parseDate(patient.dogum_tarihi) ? parseDate(patient.dogum_tarihi).getMonth() + 1 : patient.dogum_ay ?? null,
    tani_yil: parseDate(patient.tani_tarihi)?.getFullYear() ?? patient.tani_yil ?? null,
    tani_ay: parseDate(patient.tani_tarihi) ? parseDate(patient.tani_tarihi).getMonth() + 1 : patient.tani_ay ?? null,
  }

  return Object.fromEntries(Object.entries(derived).filter(([, value]) => value != null))
}

function classifyClinicalCourse(visit) {
  if (visit.exitus == 1) return "exitus"
  if (visit.imv == 1 || visit.ecmo == 1 || visit.yeni_oksijen_ihtiyaci == 1) return "kotu_progresif"
  if ((numberOrNull(visit.pnomoni_sayisi) ?? 0) > 0 || (numberOrNull(visit.atak_sayisi) ?? 0) >= 2) return "alevlenmeli"
  if (visit.semptom_devam == 1 || visit.egzersiz_kisitliligi == 1) return "persistan_semptom"
  if (visit.semptom_devam == 0 && visit.o2 == 0 && visit.bipap == 0) return "iyi_stabil"
  return "belirsiz"
}

function clinicalCourseLabel(value) {
  return {
    iyi_stabil: "İyi/stabil",
    persistan_semptom: "Persistan semptomlu",
    alevlenmeli: "Alevlenmeli",
    kotu_progresif: "Kötü/progresif",
    exitus: "Exitus",
    belirsiz: "Belirsiz",
  }[value] || "-"
}

const FOLLOWUP_FIELDS = [
  {key:"visit_date", label:"Muayene tarihi", type:"date", required:true},
  {key:"semptom_devam", label:"Semptom devam", type:"bool"},
  {key:"egzersiz_kisitliligi", label:"Egzersiz kısıtlılığı", type:"bool"},
  {key:"atak_sayisi", label:"Son kontrolden beri atak", type:"num"},
  {key:"pnomoni_sayisi", label:"Son kontrolden beri pnömoni", type:"num"},
  {key:"o2", label:"O2 ihtiyacı", type:"bool"},
  {key:"bipap", label:"BiPAP/NIV", type:"bool"},
  {key:"imv", label:"İnvaziv MV", type:"bool"},
  {key:"ecmo", label:"ECMO", type:"bool"},
  {key:"yeni_oksijen_ihtiyaci", label:"Yeni oksijen ihtiyacı", type:"bool"},
  {key:"sistemik_steroid_mgkg_gun", label:"Steroid dozu (mg/kg/gün)", type:"num"},
  {key:"sistemik_steroid_gun", label:"Steroid günü", type:"num"},
  {key:"sistemik_steroid_plan_gun", label:"Planlanan steroid günü", type:"num"},
  {key:"va", label:"Ağırlık (kg)", type:"num"},
  {key:"boy", label:"Boy (cm)", type:"num"},
  {key:"spo2", label:"SpO2 (%)", type:"num"},
  {key:"fev1", label:"FEV1 (%)", type:"num"},
  {key:"fvc", label:"FVC (%)", type:"num"},
  {key:"mef2575", label:"MEF25-75 (%)", type:"num"},
  {key:"klinik_gidis", label:"Klinik gidiş", type:"select", options:[
    {v:"", l:"Otomatik/boş"},
    {v:"iyi_stabil", l:"İyi/stabil"},
    {v:"persistan_semptom", l:"Persistan semptomlu"},
    {v:"alevlenmeli", l:"Alevlenmeli"},
    {v:"kotu_progresif", l:"Kötü/progresif"},
    {v:"exitus", l:"Exitus"},
  ]},
  {key:"notlar", label:"Not", type:"text"},
]

const PFT_FIELDS = [
  {key:"test_date", label:"Tetkik tarihi", type:"date", required:true},
  {key:"test_type", label:"Tetkik tipi", type:"select", options:[
    {v:"", l:"—"},
    {v:"bazal", l:"Bazal"},
    {v:"izlem", l:"İzlem"},
    {v:"bronkodilatator", l:"BD sonrası"},
  ]},
  {key:"fev1", label:"FEV1 (%)", type:"num"},
  {key:"fev1_z", label:"FEV1 z-skor", type:"num"},
  {key:"fvc", label:"FVC (%)", type:"num"},
  {key:"fvc_z", label:"FVC z-skor", type:"num"},
  {key:"fev1_fvc", label:"FEV1/FVC", type:"num"},
  {key:"fev1_fvc_z", label:"FEV1/FVC z-skor", type:"num"},
  {key:"mef2575", label:"MEF25-75 (%)", type:"num"},
  {key:"mef2575_z", label:"MEF25-75 z-skor", type:"num"},
  {key:"bd_fev1", label:"BD FEV1 değişim (%)", type:"num"},
  {key:"bd_mef2575", label:"BD MEF25-75 değişim (%)", type:"num"},
  {key:"dlco", label:"DLCO (%)", type:"num"},
  {key:"dlco_z", label:"DLCO z-skor", type:"num"},
  {key:"rv", label:"RV (%)", type:"num"},
  {key:"tlc", label:"TLC (%)", type:"num"},
  {key:"rv_tlc", label:"RV/TLC (%)", type:"num"},
  {key:"notlar", label:"Not", type:"text"},
]

const DOSING_FREQUENCY_OPTIONS = [
  {v:"1", l:"1x"},
  {v:"2", l:"2x"},
  {v:"3", l:"3x"},
  {v:"4", l:"4x"},
]

const FIELD_GROUPS = {
  baslangic: {
    label: "Başlangıç", fields: [
      {key:"hasta_id", label:"Hasta ID", type:"text", required:true},
      {key:"pibo", label:"PIBO", type:"bool", required:true},
      {key:"ptbo", label:"PTBO", type:"bool", required:true},
      {key:"cinsiyet", label:"Cinsiyet", type:"select", options:[{v:"e",l:"Erkek"},{v:"k",l:"Kız"}]},
      {key:"yabanci", label:"Yabancı uyruklu", type:"bool"},
      {key:"dogum_tarihi", label:"Doğum tarihi", type:"date", required:true},
      {key:"va_bas", label:"Vücut ağırlığı (kg)", type:"num"},
      {key:"boy_bas", label:"Boy (cm)", type:"num"},
      {key:"spo2_bas", label:"SpO2 (%)", type:"num"},
      {key:"ates_bas", label:"Ateş (°C)", type:"num"},
      {key:"solunum_sayisi_bas", label:"Solunum sayısı (/dk)", type:"num"},
      {key:"kalp_tepe_atimi_bas", label:"Kalp tepe atımı (/dk)", type:"num"},
      {key:"semptom_baslangic_tarihi", label:"Yakınmaların başladığı tarih", type:"date"},
      {key:"ilk_muayene_tarihi", label:"İlk çocuk göğüs muayene tarihi", type:"date"},
      {key:"tani_tarihi", label:"PIBO/PTBO tanı tarihi", type:"date"},
      {key:"bt_tarihi", label:"BT inceleme tarihi", type:"date"},
      {key:"bronkoskopi_tarihi", label:"Bronkoskopi tarihi", type:"date"},
    ]
  },
  zaman: {
    label: "Hesaplanan", fields: [
      {key:"yas_ay", label:"Tanı yaşı (ay)", type:"num", readonly:true},
      {key:"tani_yas_gun", label:"Tanı anındaki yaş (gün)", type:"num", readonly:true},
      {key:"semptom_tani_gun", label:"Semptom → tanı (gün)", type:"num", readonly:true},
      {key:"muayene_tani_gun", label:"İlk muayene → tanı (gün)", type:"num", readonly:true},
      {key:"muayene_bronkoskopi_gun", label:"İlk muayene → bronkoskopi (gün)", type:"num", readonly:true},
      {key:"semptom_bronkoskopi_gun", label:"Semptom → bronkoskopi (gün)", type:"num", readonly:true},
      {key:"vki_bas", label:"VKI başlangıç", type:"num", readonly:true},
      {key:"va_z_bas", label:"Ağırlık z-skor başlangıç", type:"num", readonly:true},
      {key:"boy_z_bas", label:"Boy z-skor başlangıç", type:"num", readonly:true},
      {key:"vki_z_bas", label:"VKI z-skor başlangıç", type:"num", readonly:true},
    ]
  },
  oyku: {
    label: "Öykü & Akut Dönem", fields: [
      {key:"premature", label:"Prematüre doğum", type:"bool"},
      {key:"gestasyon_haftasi", label:"Gestasyon haftası", type:"num"},
      {key:"dogum_agirligi_g", label:"Doğum ağırlığı (g)", type:"num"},
      {key:"yenidogan_yogun_bakim", label:"Yenidoğan yoğun bakım", type:"bool"},
      {key:"neonatal_oksijen", label:"Neonatal oksijen", type:"bool"},
      {key:"bpd_oykusu", label:"BPD öyküsü", type:"bool"},
      {key:"akut_asye_tarihi", label:"İlk akut ASYE/ağır ASYE tarihi", type:"date"},
      {key:"ates_suresi_gun", label:"Ateş süresi (gün)", type:"num"},
      {key:"agir_pnomoni", label:"Ağır pnömoni", type:"bool"},
      {key:"ilk_akut_asye_yatis_gun", label:"İlk akut ASYE yatış süresi (gün)", type:"num"},
      {key:"tekrarlayan_pnomoni", label:"Tekrarlayan pnömoni", type:"bool"},
      {key:"pnomoni_atak_sayisi", label:"Toplam pnömoni atağı", type:"num"},
      {key:"toplam_pnomoni_yatis_gun", label:"Toplam pnömoni yatış süresi (gün)", type:"num"},
      {key:"akut_hipoksemi", label:"Akut hipoksemi", type:"bool"},
      {key:"akut_yatis", label:"Akut hastane yatışı", type:"bool"},
      {key:"cocuk_yogun_bakim", label:"Çocuk yoğun bakım", type:"bool"},
      {key:"akut_oksijen", label:"Akut oksijen", type:"bool"},
      {key:"akut_hfnc", label:"Akut HFNC", type:"bool"},
      {key:"akut_niv", label:"Akut NIV/BiPAP", type:"bool"},
      {key:"akut_imv", label:"Akut invaziv MV", type:"bool"},
      {key:"akut_ivig", label:"Akut IVIG", type:"bool"},
      {key:"akut_glukokortikoid", label:"Akut glukokortikoid", type:"bool"},
    ]
  },
  etiyoloji: {
    label: "Etiyoloji", fields: [
      {key:"etken_adenovirus", label:"Adenovirüs", type:"bool"},
      {key:"etken_mycoplasma", label:"Mycoplasma pneumoniae", type:"bool"},
      {key:"etken_rsv", label:"RSV", type:"bool"},
      {key:"etken_rinovirus", label:"Rinovirus", type:"bool"},
      {key:"etken_pnomokok", label:"Pnömokok", type:"bool"},
      {key:"etken_cmv", label:"CMV", type:"bool"},
      {key:"etken_influenza", label:"İnfluenza", type:"bool"},
      {key:"etken_parainfluenza", label:"Parainfluenza", type:"bool"},
      {key:"etken_kizamik", label:"Kızamık", type:"bool"},
      {key:"etken_metapneumovirus", label:"Metapneumovirus", type:"bool"},
      {key:"etken_covid", label:"COVID-19", type:"bool"},
      {key:"etken_varicella", label:"Varicella", type:"bool"},
      {key:"etken_ebv", label:"EBV", type:"bool"},
      {key:"etken_bakteri", label:"Bakteriyel etken", type:"bool"},
      {key:"koenfeksiyon", label:"Ko-enfeksiyon", type:"bool"},
      {key:"etken_diger", label:"Diğer etken", type:"text"},
      {key:"hsct", label:"HSCT", type:"bool"},
      {key:"solid_tx", label:"Solid Tx", type:"bool"},
      {key:"gvhd", label:"GVHD", type:"bool"},
      {key:"gvhd_yeri", label:"GVHD yeri", type:"text"},
      {key:"tx1_tani_gun", label:"1.Tx → tanı (gün, negatif=önce)", type:"num"},
      {key:"gvhd_tani_gun", label:"GVHD → tanı (gün, negatif=önce)", type:"num"},
    ]
  },
  radyoloji: {
    label: "Radyoloji (BT)", fields: [
      {key:"bt_infiltrasyon", label:"İnfiltrasyon", type:"bool"},
      {key:"bt_mozaik", label:"Mozaik perfüzyon/attenüasyon", type:"bool"},
      {key:"bt_air_trapping", label:"Air trapping", type:"bool"},
      {key:"bt_bronduvar_kalinlasma", label:"Bronş duvar kalınlaşması", type:"bool"},
      {key:"bt_atelektazi", label:"Atelektazi", type:"bool"},
      {key:"bt_sag_orta_atelektazi", label:"Sağ orta lob atelektazi", type:"bool"},
      {key:"bt_lingula_atelektazi", label:"Lingula atelektazi", type:"bool"},
      {key:"bt_diger_atelektazi", label:"Diğer atelektazi", type:"bool"},
      {key:"bt_bronsektazi", label:"Bronşektazi", type:"bool"},
      {key:"bt_sag_orta_bronsektazi", label:"Sağ orta lob bronşektazi", type:"bool"},
      {key:"bt_lingula_bronsektazi", label:"Lingula bronşektazi", type:"bool"},
      {key:"bt_diger_bronsektazi", label:"Diğer bronşektazi", type:"bool"},
      {key:"bt_buyuk_lobar_konsolidasyon", label:"Büyük lobar konsolidasyon", type:"bool"},
      {key:"bt_diffuz_bronsiolit", label:"Diffüz bronşiolit", type:"bool"},
      {key:"bhalla_skoru", label:"Bhalla skoru", type:"num", note:"rad"},
      {key:"teper_skoru", label:"Teper skoru", type:"num", note:"rad"},
      {key:"webb_skoru", label:"WEBB skoru", type:"num", note:"rad"},
    ]
  },
  sft: {
    label: "Solunum Fonksiyon Testleri", fields: [
      {key:"sft_bas_tarihi", label:"Bazal SFT tarihi", type:"date"},
      {key:"fev1_bas", label:"FEV1 başlangıç (%)", type:"num"},
      {key:"fvc_bas", label:"FVC başlangıç (%)", type:"num"},
      {key:"mef2575_bas", label:"MEF25-75 başlangıç (%)", type:"num"},
      {key:"fev1_bd_bas", label:"Bazal BD FEV1 değişim (%)", type:"num"},
      {key:"mef2575_bd_bas", label:"Bazal BD MEF25-75 değişim (%)", type:"num"},
      {key:"dlco_bas", label:"DLCO başlangıç (%)", type:"num"},
      {key:"rv_bas", label:"RV başlangıç (%)", type:"num"},
      {key:"tlc_bas", label:"TLC başlangıç (%)", type:"num"},
      {key:"rv_tlc_bas", label:"RV/TLC başlangıç (%)", type:"num"},
      {key:"sft_bit_tarihi", label:"Son SFT tarihi", type:"date"},
      {key:"fev1_bit", label:"FEV1 bitiş (%)", type:"num"},
      {key:"fvc_bit", label:"FVC bitiş (%)", type:"num"},
      {key:"mef2575_bit", label:"MEF25-75 bitiş (%)", type:"num"},
      {key:"dlco_bit", label:"DLCO bitiş (%)", type:"num"},
      {key:"rv_bit", label:"RV bitiş (%)", type:"num"},
      {key:"tlc_bit", label:"TLC bitiş (%)", type:"num"},
      {key:"rv_tlc_bit", label:"RV/TLC bitiş (%)", type:"num"},
      {key:"xu_siddet", label:"Xu klinik şiddet (1-5)", type:"num", note:"kln"},
    ]
  },
  ptbo_tb: {
    label: "PTBO/TB", fields: [
      {key:"akciger_goruntuleme_yapildi", label:"Akciğer görüntüleme yapıldı", type:"bool"},
      {key:"akciger_goruntuleme_tarihi", label:"Akciğer görüntüleme tarihi", type:"date"},
      {key:"akciger_goruntuleme_yontemi", label:"Görüntüleme yöntemi", type:"select", options:[
        {v:"akciger_grafisi", l:"Akciğer grafisi"},
        {v:"toraks_bt", l:"Toraks BT"},
        {v:"hrct", l:"HRCT"},
        {v:"diger", l:"Diğer"},
      ]},
      {key:"akciger_goruntuleme_bulgu", label:"Görüntüleme bulgusu", type:"text"},
      {key:"ppd_mm", label:"PPD endürasyon (mm)", type:"num"},
      {key:"ppd_sonuc", label:"PPD sonucu", type:"select", options:[
        {v:"negatif", l:"Negatif"},
        {v:"pozitif", l:"Pozitif"},
        {v:"supheli", l:"Şüpheli"},
        {v:"yapilmadi", l:"Yapılmadı"},
      ]},
      {key:"tb_igra_sonuc", label:"TB IGRA sonucu", type:"select", options:[
        {v:"negatif", l:"Negatif"},
        {v:"pozitif", l:"Pozitif"},
        {v:"indeterminate", l:"Belirsiz"},
        {v:"yapilmadi", l:"Yapılmadı"},
      ]},
      {key:"tb_igra_tarihi", label:"TB IGRA tarihi", type:"date"},
      {key:"tb_mikrobiyoloji_pozitif", label:"TB mikrobiyoloji pozitif", type:"bool"},
      {key:"tb_tedavi_baslangic_tarihi", label:"TB tedavi başlangıç tarihi", type:"date"},
      {key:"tb_tedavi_suresi_ay", label:"TB tedavi süresi (ay)", type:"num"},
    ]
  },
  tedavi: {
    label: "Tedavi", fields: [
      {key:"sistemik_steroid", label:"Sistemik steroid aldı", type:"bool", readonly:true},
      {key:"sistemik_steroid_mgkg_gun", label:"Sistemik steroid dozu (mg/kg/gün)", type:"num"},
      {key:"sistemik_steroid_gun", label:"Sistemik steroid aldığı gün", type:"num"},
      {key:"sistemik_steroid_plan_gun", label:"Planlanan sistemik steroid günü", type:"num"},
      {key:"kumulatif_sistemik_steroid_mgkg", label:"Kümülatif sistemik steroid (mg/kg)", type:"num", readonly:true},
      {key:"pulse_steroid", label:"Pulse steroid aldı", type:"bool", readonly:true},
      {key:"pulse_steroid_mgkg", label:"Pulse steroid dozu (mg/kg)", type:"select", options:[
        {v:"10", l:"10 mg/kg"},
        {v:"20", l:"20 mg/kg"},
        {v:"30", l:"30 mg/kg"},
      ]},
      {key:"tanidan_once_antibiyotik", label:"Tanı öncesi antibiyotik", type:"bool"},
      {key:"inhale_steroid_aldi", label:"İnhale steroid aldı", type:"bool", readonly:true},
      {key:"flutikazon_neb_2mg_adet_gun", label:"Flutikazon neb 2 mg sıklık", type:"select", options:DOSING_FREQUENCY_OPTIONS},
      {key:"flutikazon_neb_2mg_gun", label:"Flutikazon neb 2 mg gün", type:"num"},
      {key:"flutikazon_neb_05mg_adet_gun", label:"Flutikazon neb 0.5 mg sıklık", type:"select", options:DOSING_FREQUENCY_OPTIONS},
      {key:"flutikazon_neb_05mg_gun", label:"Flutikazon neb 0.5 mg gün", type:"num"},
      {key:"flutikazon_neb_toplam_mcg", label:"Neb flutikazon toplam (mcg)", type:"num", readonly:true},
      {key:"flutikazon_inhaler_125_puff_gun", label:"Flutikazon 125 mcg sıklık", type:"select", options:DOSING_FREQUENCY_OPTIONS},
      {key:"flutikazon_inhaler_125_gun", label:"Flutikazon 125 mcg gün", type:"num"},
      {key:"flutikazon_inhaler_50_puff_gun", label:"Flutikazon 50 mcg sıklık", type:"select", options:DOSING_FREQUENCY_OPTIONS},
      {key:"flutikazon_inhaler_50_gun", label:"Flutikazon 50 mcg gün", type:"num"},
      {key:"flutikazon_inhaler_toplam_mcg", label:"İnhaler flutikazon toplam (mcg)", type:"num", readonly:true},
      {key:"seretide_125_puff_gun", label:"Seretide 125 sıklık", type:"select", options:DOSING_FREQUENCY_OPTIONS},
      {key:"seretide_125_gun", label:"Seretide 125 gün", type:"num"},
      {key:"seretide_250_puff_gun", label:"Seretide 250 sıklık", type:"select", options:DOSING_FREQUENCY_OPTIONS},
      {key:"seretide_250_gun", label:"Seretide 250 gün", type:"num"},
      {key:"seretide_aldi", label:"Seretide aldı", type:"bool", readonly:true},
      {key:"seretide_toplam_flutikazon_mcg", label:"Seretide flutikazon toplam (mcg)", type:"num", readonly:true},
      {key:"toplam_inhale_steroid_mcg", label:"Toplam inhale steroid (mcg)", type:"num", readonly:true},
      {key:"azitromisin_aldi", label:"Azitromisin", type:"bool"},
      {key:"montelukast_aldi", label:"Montelukast", type:"bool"},
      {key:"fam_aldi", label:"FAM aldı", type:"bool", readonly:true},
      {key:"bronchomunal", label:"Bronchomunal", type:"bool"},
      {key:"ivig_aldi", label:"IVIG verildi", type:"bool"},
      {key:"ivig_aliyor", label:"IVIG halen alıyor", type:"bool"},
      {key:"ventolin_aldi", label:"Ventolin", type:"bool"},
      {key:"o2", label:"O2 desteği", type:"bool"},
      {key:"bipap", label:"BiPAP", type:"bool"},
      {key:"imv", label:"İnvaziv MV", type:"bool"},
      {key:"ecmo", label:"ECMO", type:"bool"},
      {key:"tedavi_suresi_gun", label:"Tedavi süresi (gün)", type:"num"},
    ]
  },
  antropometri: {
    label: "Antropometri & Büyüme", fields: [
      {key:"va_bas", label:"Ağırlık başlangıç (kg)", type:"num"},
      {key:"va_z_bas", label:"Ağırlık z-skor başlangıç", type:"num"},
      {key:"va_bit", label:"Ağırlık bitiş (kg)", type:"num"},
      {key:"va_z_bit", label:"Ağırlık z-skor bitiş", type:"num"},
      {key:"boy_bas", label:"Boy başlangıç (cm)", type:"num"},
      {key:"boy_z_bas", label:"Boy z-skor başlangıç", type:"num"},
      {key:"boy_bit", label:"Boy bitiş (cm)", type:"num"},
      {key:"boy_z_bit", label:"Boy z-skor bitiş", type:"num"},
    ]
  },
  immunoloji: {
    label: "İmmünoloji & Lab", fields: [
      {key:"imun_yetmezlik", label:"İmmün yetmezlik", type:"bool"},
      {key:"imdef", label:"İmmün yetmezlik açıklaması", type:"text"},
      {key:"tani_surecinde_imyetm", label:"Tanı sürecinde immün yetmezlik", type:"bool"},
      {key:"imdefdr", label:"İmmün yetmezlik tedavisi/notu", type:"text"},
      {key:"astim", label:"Astım", type:"bool"},
      {key:"alerjik_rinit", label:"Alerjik rinit", type:"bool"},
      {key:"atopik_dermatit", label:"Atopik dermatit", type:"bool"},
      {key:"kisisel_atopi", label:"Kişisel atopi", type:"bool"},
      {key:"aile_atopi", label:"Aile atopi", type:"bool"},
      {key:"spesifik_ige_pozitif", label:"Spesifik IgE pozitif", type:"bool"},
      {key:"immunology_ig_ref_age_band", label:"Ig referans yaş bandı", type:"text", readonly:true},
      {key:"iga", label:"IgA (g/L)", type:"num"},
      {key:"iga_alt_limit_mgdl", label:"IgA alt limit (mg/dL)", type:"num", readonly:true},
      {key:"iga_dusuk", label:"IgA düşük", type:"bool", readonly:true},
      {key:"igm", label:"IgM (g/L)", type:"num"},
      {key:"igm_alt_limit_mgdl", label:"IgM alt limit (mg/dL)", type:"num", readonly:true},
      {key:"igm_dusuk", label:"IgM düşük", type:"bool", readonly:true},
      {key:"igg", label:"IgG (g/L)", type:"num"},
      {key:"igg_alt_limit_mgdl", label:"IgG alt limit (mg/dL)", type:"num", readonly:true},
      {key:"igg_dusuk", label:"IgG düşük", type:"bool", readonly:true},
      {key:"ige", label:"IgE (IU/mL)", type:"num"},
      {key:"igg1", label:"IgG1", type:"num"},
      {key:"igg1_dusuk", label:"IgG1 düşük", type:"bool", readonly:true},
      {key:"igg2", label:"IgG2", type:"num"},
      {key:"igg2_dusuk", label:"IgG2 düşük", type:"bool", readonly:true},
      {key:"igg3", label:"IgG3", type:"num"},
      {key:"igg3_dusuk", label:"IgG3 düşük", type:"bool", readonly:true},
      {key:"igg4", label:"IgG4", type:"num"},
      {key:"igg4_dusuk", label:"IgG4 düşük", type:"bool", readonly:true},
      {key:"lymphocyte_ref_age_band", label:"Lenfosit subset referans yaş bandı", type:"text", readonly:true},
      {key:"lenfosit_subset_dusuk", label:"Lenfosit subset düşük var", type:"bool", readonly:true},
      {key:"cbc_bk", label:"Lökosit (/mm³)", type:"num"},
      {key:"cbc_neu", label:"Nötrofil (/mm³)", type:"num"},
      {key:"cbc_lym", label:"Lenfosit (/mm³)", type:"num"},
      {key:"lym_abs_alt_limit", label:"Lenfosit alt limit", type:"num", readonly:true},
      {key:"lym_abs_dusuk", label:"Lenfosit düşük", type:"bool", readonly:true},
      {key:"cbc_eos", label:"Eozinofil (/mm³)", type:"num"},
      {key:"cbc_nlr", label:"NLR", type:"num"},
      {key:"cd3", label:"Kan CD3 (%)", type:"num"},
      {key:"cd3_pct_dusuk", label:"CD3 % düşük", type:"bool", readonly:true},
      {key:"cd4", label:"Kan CD4 (%)", type:"num"},
      {key:"cd4_pct_dusuk", label:"CD4 % düşük", type:"bool", readonly:true},
      {key:"cd8", label:"Kan CD8 (%)", type:"num"},
      {key:"cd8_pct_dusuk", label:"CD8 % düşük", type:"bool", readonly:true},
      {key:"cd4_cd8", label:"Kan CD4/CD8", type:"num"},
      {key:"cd19", label:"Kan CD19", type:"num"},
      {key:"cd19_pct_dusuk", label:"CD19 % düşük", type:"bool", readonly:true},
      {key:"cd16_cd56", label:"Kan CD16/CD56", type:"num"},
      {key:"cd16_cd56_pct_dusuk", label:"CD16/56 % düşük", type:"bool", readonly:true},
      {key:"lswbc", label:"Lenfosit subset WBC", type:"num"},
      {key:"lslym_pct", label:"LS lenfosit %", type:"num"},
      {key:"lscd3_pct", label:"LS CD3 %", type:"num"},
      {key:"lscd3_abs", label:"LS CD3 abs", type:"num"},
      {key:"cd3_abs_dusuk", label:"CD3 abs düşük", type:"bool", readonly:true},
      {key:"lscd4_pct", label:"LS CD4 %", type:"num"},
      {key:"lscd4_abs", label:"LS CD4 abs", type:"num"},
      {key:"cd4_abs_dusuk", label:"CD4 abs düşük", type:"bool", readonly:true},
      {key:"lscd8_pct", label:"LS CD8 %", type:"num"},
      {key:"lscd8_abs", label:"LS CD8 abs", type:"num"},
      {key:"cd8_abs_dusuk", label:"CD8 abs düşük", type:"bool", readonly:true},
      {key:"lscd4_cd8", label:"LS CD4/CD8", type:"num"},
      {key:"lscd19", label:"LS CD19", type:"num"},
      {key:"cd19_abs_dusuk", label:"CD19 abs düşük", type:"bool", readonly:true},
      {key:"lscd56", label:"LS CD56", type:"num"},
      {key:"cd16_cd56_abs_dusuk", label:"CD16/56 abs düşük", type:"bool", readonly:true},
    ]
  },
  bal_immunoloji: {
    label: "BAL İmmünoloji", fields: [
      {key:"bal_lenfosit_subset", label:"BAL lenfosit subset yapıldı", type:"bool"},
      {key:"bal_lenfopeni", label:"BAL lenfopeni", type:"bool"},
      {key:"lokosit", label:"BAL lökosit sayısı", type:"num"},
      {key:"lenfosit_oran", label:"BAL lenfosit oranı (%)", type:"num"},
      {key:"notrofil_oran", label:"BAL nötrofil oranı (%)", type:"num"},
      {key:"eozinofil_oran", label:"BAL eozinofil oranı (%)", type:"num"},
      {key:"bal_cd3", label:"BAL CD3", type:"num"},
      {key:"bal_cd4", label:"BAL CD4", type:"num"},
      {key:"bal_cd8", label:"BAL CD8", type:"num"},
      {key:"bal_cd4_cd8", label:"BAL CD4/CD8", type:"num"},
      {key:"bal_cd19", label:"BAL CD19", type:"num"},
      {key:"bal_cd16_cd56", label:"BAL CD16/CD56", type:"num"},
      {key:"bal_cd45", label:"BAL CD45", type:"num"},
      {key:"bal_cd56", label:"BAL CD56", type:"num"},
      {key:"bal_cd22", label:"BAL CD22", type:"num"},
      {key:"bal_cd20", label:"BAL CD20", type:"num"},
      {key:"bal_cd16", label:"BAL CD16", type:"num"},
      {key:"bal_cd3_hladr", label:"BAL CD3+HLA-DR+", type:"num"},
    ]
  },
  sonuc: {
    label: "Kardiyak & Sonuç", fields: [
      {key:"eko", label:"EKO yapıldı", type:"bool"},
      {key:"pht", label:"Pulmoner HT", type:"bool"},
      {key:"pap", label:"PAP (mmHg)", type:"num"},
      {key:"yatis", label:"Hastane yatışı", type:"bool"},
      {key:"tedi_sonrasi_atak", label:"Tedavi sonrası atak sayısı", type:"num"},
      {key:"tedi_sonrasi_pnomoni", label:"Tedavi sonrası pnömoni sayısı", type:"num"},
      {key:"tedavi_sonucu", label:"Tedavi sonucu (1=iyi, 2=orta, 3=kötü)", type:"num"},
      {key:"semptom_devam", label:"Semptom devam ediyor", type:"bool"},
      {key:"ex", label:"Exitus", type:"bool"},
    ]
  }
}

// ─── styles ───────────────────────────────────────────────────────────────────
const s = {
  card: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:"16px 20px" },
  btn: { padding:"7px 16px", borderRadius:8, border:"1px solid #d1d5db", background:"#fff", cursor:"pointer", fontSize:13 },
  btnPrimary: { padding:"8px 20px", borderRadius:8, border:`1px solid ${THEME.red}`, background:THEME.redSoft, color:THEME.red, cursor:"pointer", fontSize:13, fontWeight:500 },
  input: { width:"100%", fontSize:13, padding:"6px 8px", borderRadius:6, border:"1px solid #d1d5db", background:"#f9fafb", boxSizing:"border-box" },
  select: { width:"100%", fontSize:13, padding:"6px 8px", borderRadius:6, border:"1px solid #d1d5db", background:"#f9fafb" },
  label: { display:"block", fontSize:11, color:"#6b7280", marginBottom:3 },
  badge: (color) => ({ fontSize:11, padding:"2px 8px", borderRadius:20, background: color==="blue"?"#eef2ff":color==="amber"?"#fef3c7":"#f3f4f6", color: color==="blue"?THEME.navy:color==="amber"?"#92400e":"#374151" }),
}

// ─── Login ───────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [code, setCode] = useState("")
  const [err, setErr] = useState("")

  function tryLogin() {
    const c = code.trim().toUpperCase()
    if (CENTERS[c]) onLogin(c, CENTERS[c])
    else { setErr("Geçersiz merkez kodu."); setCode("") }
  }

  return (
    <div style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:THEME.page}}>
      <div style={{width:380}}>
        <div style={{textAlign:"center", marginBottom:28}}>
          <div style={{fontSize:22, fontWeight:600, color:THEME.navy}}>PIBO / PTBO Registry</div>
          <div style={{fontSize:13, color:"#6b7280", marginTop:4}}>Pediatrik Bronşiyolitis Obliterans · Çok Merkezli Veri Sistemi</div>
        </div>
        <div style={{...s.card, padding:"24px 28px"}}>
          <label style={s.label}>Merkez kodunuzu girin</label>
          <input
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setErr("") }}
            onKeyDown={e => e.key==="Enter" && tryLogin()}
            placeholder="KOC veya MED"
            autoFocus
            style={{...s.input, fontSize:20, letterSpacing:3, fontWeight:600, marginBottom:4}}
          />
          {err && <div style={{fontSize:12, color:"#dc2626", marginBottom:8}}>{err}</div>}
          <button onClick={tryLogin} style={{...s.btnPrimary, width:"100%", marginTop:10, padding:10}}>
            Giriş yap →
          </button>
        </div>
        <div style={{textAlign:"center", marginTop:14, fontSize:11, color:"#9ca3af"}}>
          Merkez kodunuz için koordinatör merkez ile iletişime geçin
        </div>
      </div>
    </div>
  )
}

// ─── Action Screen ────────────────────────────────────────────────────────────
function ActionScreen({ center, centerInfo, patients, onAction, onLogout }) {
  const my = centerInfo.isAdmin ? patients : patients.filter(p => p.hasta_id.startsWith(centerInfo.prefix + "-"))
  const pibo = my.filter(p => p.pibo == 1)
  const ptbo = my.filter(p => p.ptbo == 1)
  const nextId = centerInfo.isAdmin ? "" : `${centerInfo.prefix}-${String(my.length + 1).padStart(3, "0")}`

  return (
    <div style={{maxWidth:600, margin:"0 auto", padding:"32px 20px"}}>
      <div style={{display:"flex", alignItems:"center", marginBottom:24}}>
        <div>
          <div style={{fontSize:17, fontWeight:600}}>{centerInfo.label}</div>
          <div style={{fontSize:12, color:"#6b7280", marginTop:2}}>
            {my.length} hasta · PIBO: {pibo.length} · PTBO: {ptbo.length}
          </div>
        </div>
        <button onClick={onLogout} style={{...s.btn, marginLeft:"auto", fontSize:12}}>Çıkış</button>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14}}>
        <button onClick={() => onAction("new")} style={{...s.card, textAlign:"left", cursor:"pointer", border:"1px solid #e5e7eb"}}>
          <div style={{fontSize:28, marginBottom:8}}>+</div>
          <div style={{fontSize:15, fontWeight:500}}>Yeni hasta ekle</div>
          <div style={{fontSize:12, color:"#6b7280", marginTop:4}}>
            {centerInfo.isAdmin ? "Herhangi bir merkez için" : `Önerilen ID: ${nextId}`}
          </div>
        </button>
        <button onClick={() => onAction("update")} style={{...s.card, textAlign:"left", cursor:"pointer", border:"1px solid #e5e7eb"}}>
          <div style={{fontSize:28, marginBottom:8}}>✎</div>
          <div style={{fontSize:15, fontWeight:500}}>Mevcut kaydı güncelle</div>
          <div style={{fontSize:12, color:"#6b7280", marginTop:4}}>{my.length} hasta listesinden seç</div>
        </button>
      </div>

      {centerInfo.isAdmin && (
        <button onClick={() => onAction("admin")} style={{...s.card, width:"100%", textAlign:"left", cursor:"pointer", border:`1px solid ${THEME.redBorder}`, background:THEME.redSoft, marginBottom:14}}>
          <div style={{fontSize:14, fontWeight:500, color:THEME.red}}>Admin paneli — tüm merkezler, analiz, istatistik →</div>
        </button>
      )}

      <div style={s.card}>
        <div style={{fontSize:12, fontWeight:500, color:"#6b7280", marginBottom:10}}>Son eklenen hastalar</div>
        {my.slice(-5).reverse().map(p => (
          <div key={p.hasta_id} style={{display:"flex", alignItems:"center", gap:8, padding:"5px 0", borderBottom:"1px solid #f3f4f6"}}>
            <span style={{fontSize:13, fontWeight:500, minWidth:90}}>{p.hasta_id}</span>
            <span style={s.badge(p.pibo ? "blue" : "amber")}>{p.pibo ? "PIBO" : "PTBO"}</span>
            <span style={{fontSize:12, color:"#6b7280"}}>{p.cinsiyet==="e"?"E":"K"} · {p.yas_ay?.toFixed(0)} ay</span>
            <span style={{fontSize:12, color:"#9ca3af"}}>D: {p.dogum_yil}/{String(p.dogum_ay).padStart(2,"0")}</span>
            <span style={{marginLeft:"auto", fontSize:12, color:"#9ca3af"}}>{p.tani_yil}/{p.tani_ay}</span>
          </div>
        ))}
        {my.length === 0 && <div style={{fontSize:13, color:"#9ca3af", textAlign:"center", padding:12}}>Henüz hasta yok</div>}
      </div>
    </div>
  )
}

// ─── Patient Select ───────────────────────────────────────────────────────────
function SelectPatient({ patients, centerInfo, onSelect, onBack }) {
  const [search, setSearch] = useState("")
  const my = centerInfo.isAdmin ? patients : patients.filter(p => p.hasta_id.startsWith(centerInfo.prefix + "-"))
  const filtered = my.filter(p => p.hasta_id.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{maxWidth:600, margin:"0 auto", padding:"20px"}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:16}}>
        <button onClick={onBack} style={s.btn}>← Geri</button>
        <span style={{fontSize:16, fontWeight:500}}>Hasta seç</span>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hasta ID ile ara..." autoFocus style={{...s.input, marginBottom:10}} />
      {filtered.map(p => (
        <button key={p.hasta_id} onClick={() => onSelect(p)} style={{display:"flex", width:"100%", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer", marginBottom:6, textAlign:"left"}}>
          <span style={{fontSize:14, fontWeight:500, minWidth:90}}>{p.hasta_id}</span>
          <span style={s.badge(p.pibo ? "blue" : "amber")}>{p.pibo ? "PIBO" : "PTBO"}</span>
          <span style={{fontSize:12, color:"#6b7280"}}>{p.cinsiyet==="e"?"Erkek":"Kız"} · {p.yas_ay?.toFixed(1)} ay</span>
          <span style={{fontSize:12, color:"#9ca3af"}}>D: {p.dogum_yil}/{String(p.dogum_ay).padStart(2,"0")}</span>
          <span style={{marginLeft:"auto", fontSize:12, color:"#9ca3af"}}>Tanı {p.tani_yil}/{p.tani_ay}</span>
        </button>
      ))}
      {filtered.length === 0 && <div style={{fontSize:13, color:"#9ca3af", textAlign:"center", padding:20}}>Hasta bulunamadı</div>}
    </div>
  )
}

// ─── Patient Form ─────────────────────────────────────────────────────────────
function FollowUpPanel({ patient }) {
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
      const { data, error } = await supabase
        .from("follow_up_visits")
        .select("*")
        .eq("hasta_id", patient.hasta_id)
        .order("visit_date", { ascending: false })
      if (error) setError(formatSupabaseError(error) || "İzlem ziyaretleri yüklenemedi.")
      else setVisits(data || [])
      setLoading(false)
    })()
  }, [patient?.hasta_id])

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
    const otomatikGidis = classifyClinicalCourse(draft)
    const steroidDoz = numberOrNull(draft.sistemik_steroid_mgkg_gun)
    const steroidGun = numberOrNull(draft.sistemik_steroid_gun)
    const kumulatifSteroid = steroidDoz != null && steroidGun != null ? round(steroidDoz * steroidGun, 2) : null
    const record = {
      ...draft,
      hasta_id: patient.hasta_id,
      takip_suresi_gun: takipGun,
      takip_suresi_ay: takipGun == null ? null : round(takipGun / 30.4375, 1),
      klinik_gidis_otomatik: otomatikGidis,
      sistemik_steroid: steroidDoz != null || steroidGun != null ? 1 : null,
      kumulatif_sistemik_steroid_mgkg: kumulatifSteroid,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("follow_up_visits")
      .insert(record)
      .select("*")
      .single()
    if (error) {
      setError(formatSupabaseError(error) || "İzlem ziyareti kaydedilemedi. SQL tablosu oluşturuldu mu?")
      return
    }

    setVisits(prev => [data, ...prev])
    setDraft({ visit_date: new Date().toISOString().slice(0, 10) })
    setMessage("İzlem ziyareti kaydedildi.")
    setTimeout(() => setMessage(""), 2500)
  }

  async function deleteVisit(id) {
    const ok = window.confirm("Bu izlem ziyareti silinsin mi?")
    if (!ok) return
    const { error } = await supabase.from("follow_up_visits").delete().eq("id", id)
    if (error) {
      setError(formatSupabaseError(error) || "İzlem ziyareti silinemedi.")
      return
    }
    setVisits(prev => prev.filter(visit => visit.id !== id))
  }

  function renderVisitField(field) {
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
        {FOLLOWUP_FIELDS.map(field => (
          <div key={field.key}>
            <label style={s.label}>{field.label}</label>
            {renderVisitField(field)}
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

function PftPanel({ patient }) {
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
      const { data, error } = await supabase
        .from("pft_records")
        .select("*")
        .eq("hasta_id", patient.hasta_id)
        .order("test_date", { ascending: false })
      if (error) setError(formatSupabaseError(error) || "SFT kayıtları yüklenemedi.")
      else setRecords(data || [])
      setLoading(false)
    })()
  }, [patient?.hasta_id])

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

    const { data, error } = await supabase
      .from("pft_records")
      .insert(record)
      .select("*")
      .single()
    if (error) {
      setError(formatSupabaseError(error) || "SFT kaydı kaydedilemedi. SQL tablosu oluşturuldu mu?")
      return
    }

    setRecords(prev => [data, ...prev])
    setDraft({ test_date: new Date().toISOString().slice(0, 10), test_type: "izlem" })
    setMessage("SFT kaydı kaydedildi.")
    setTimeout(() => setMessage(""), 2500)
  }

  async function deletePft(id) {
    const ok = window.confirm("Bu SFT kaydı silinsin mi?")
    if (!ok) return
    const { error } = await supabase.from("pft_records").delete().eq("id", id)
    if (error) {
      setError(formatSupabaseError(error) || "SFT kaydı silinemedi.")
      return
    }
    setRecords(prev => prev.filter(record => record.id !== id))
  }

  function renderPftField(field) {
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
        {PFT_FIELDS.map(field => (
          <div key={field.key}>
            <label style={s.label}>{field.label}</label>
            {renderPftField(field)}
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

function PatientForm({ patient, isNew, onSave, onBack }) {
  const [form, setForm] = useState({...patient})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [saveError, setSaveError] = useState("")
  const [activeGroup, setActiveGroup] = useState("baslangic")

  useEffect(() => {
    if (activeGroup === "ptbo_tb" && form.ptbo != 1) setActiveGroup("baslangic")
  }, [activeGroup, form.ptbo])

  function set(key, val) { setForm(f => ({...f, [key]: val})) }

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

  const groups = Object.entries(FIELD_GROUPS).filter(([key]) => key !== "ptbo_tb" || form.ptbo == 1)
  const displayForm = {...form, ...calculateDerivedFields(form)}

  return (
    <div style={{maxWidth:720, margin:"0 auto", padding:"20px"}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:16}}>
        <button onClick={onBack} style={s.btn}>← Geri</button>
        <span style={{fontSize:16, fontWeight:500}}>{isNew ? "Yeni hasta" : form.hasta_id}</span>
        {!isNew && <span style={s.badge(form.pibo ? "blue" : "amber")}>{form.pibo ? "PIBO" : "PTBO"}</span>}
        <button onClick={handleSave} disabled={saving} style={{...s.btnPrimary, marginLeft:"auto", background: saved?"#d1fae5":"#eff6ff", borderColor: saved?"#6ee7b7":"#3b82f6", color: saved?"#065f46":"#1d4ed8"}}>
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
            <button key={k} onClick={() => setActiveGroup(k)} style={{fontSize:12, padding:"4px 12px", borderRadius:20, border:"1px solid", borderColor: activeGroup===k?"#3b82f6":"#e5e7eb", background: activeGroup===k?"#eff6ff":"#fff", color: activeGroup===k?"#1d4ed8":"#6b7280", cursor:"pointer", fontWeight: activeGroup===k?500:400}}>
              {g.label}{missing > 0 ? ` ⚠${missing}` : ""}
            </button>
          )
        })}
        {!isNew && (
          <>
            <button onClick={() => setActiveGroup("izlem")} style={{fontSize:12, padding:"4px 12px", borderRadius:20, border:"1px solid", borderColor: activeGroup==="izlem"?"#3b82f6":"#e5e7eb", background: activeGroup==="izlem"?"#eff6ff":"#fff", color: activeGroup==="izlem"?"#1d4ed8":"#6b7280", cursor:"pointer", fontWeight: activeGroup==="izlem"?500:400}}>
              İzlem ziyaretleri
            </button>
            <button onClick={() => setActiveGroup("sft_kayitlari")} style={{fontSize:12, padding:"4px 12px", borderRadius:20, border:"1px solid", borderColor: activeGroup==="sft_kayitlari"?"#3b82f6":"#e5e7eb", background: activeGroup==="sft_kayitlari"?"#eff6ff":"#fff", color: activeGroup==="sft_kayitlari"?"#1d4ed8":"#6b7280", cursor:"pointer", fontWeight: activeGroup==="sft_kayitlari"?500:400}}>
              SFT kayıtları
            </button>
          </>
        )}
      </div>

      {activeGroup === "izlem" ? <FollowUpPanel patient={displayForm} /> : activeGroup === "sft_kayitlari" ? <PftPanel patient={displayForm} /> : <div style={s.card}>
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
                  <input type="date" value={dateToInput(val)} onChange={e => set(f.key, e.target.value||null)} style={{...s.input, borderColor: f.required&&val==null?"#fca5a5":"#d1d5db"}} />
                ) : (
                  <input type={f.type==="num"?"number":"text"} value={val??""} onChange={e => set(f.key, e.target.value===""?null:(f.type==="num"?Number(e.target.value):e.target.value))} style={{...s.input, borderColor: f.note&&val==null?"#fbbf24":f.required&&val==null?"#fca5a5":"#d1d5db"}} />
                )}
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

// ─── Admin Panel ──────────────────────────────────────────────────────────────
function AdminPanel({ patients, onBack, onDelete, onRecalculateAll }) {
  const [filterGroup, setFilterGroup] = useState("all")
  const [query, setQuery] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [recalcLoading, setRecalcLoading] = useState(false)

  const pibo = patients.filter(p => p.pibo == 1)
  const ptbo = patients.filter(p => p.ptbo == 1)
  const display = filterGroup==="pibo" ? pibo : filterGroup==="ptbo" ? ptbo : patients

  async function runAnalysis() {
    if (!query.trim()) return
    setLoading(true); setResult("")
    try {
      const summary = {
        n_total: patients.length, n_pibo: pibo.length, n_ptbo: ptbo.length,
        pibo_median_yas: pibo.length ? (pibo.reduce((a,p) => a+(p.yas_ay||0),0)/pibo.length).toFixed(1) : null,
        pibo_erkek_pct: pibo.length ? Math.round(pibo.filter(p=>p.cinsiyet==="e").length/pibo.length*100) : null,
        pibo_adv_pct: pibo.length ? Math.round(pibo.filter(p=>p.etken_adenovirus==1).length/pibo.length*100) : null,
        pibo_bronsektazi_pct: pibo.length ? Math.round(pibo.filter(p=>p.bt_bronsektazi==1).length/pibo.length*100) : null,
        merkezler: [...new Set(patients.map(p=>p.hasta_id.split("-")[0]))]
      }
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          messages: [{
            role: "user",
            content: `Sen bir pediatrik göğüs hastalıkları uzmanısın. Registry verisi hakkında şu soruyu yanıtla:

"${query}"

Veri özeti: ${JSON.stringify(summary)}

Türkçe yanıt ver. Örneklem küçüklüğünü belirt.`
          }]
        })
      })
      const data = await resp.json()
      setResult(data.content?.[0]?.text || "Yanıt alınamadı.")
    } catch(e) { setResult("Hata: " + e.message) }
    setLoading(false)
  }

  async function handleDelete(patient) {
    const ok = window.confirm(`${patient.hasta_id} kaydı tümüyle silinsin mi? Bu işlem geri alınamaz.`)
    if (!ok) return

    setDeleteError("")
    setDeleteMessage("")
    try {
      await onDelete(patient.hasta_id)
      setDeleteMessage(`${patient.hasta_id} silindi.`)
      setTimeout(() => setDeleteMessage(""), 2500)
    } catch (error) {
      setDeleteError(error.message || "Silme işlemi başarısız.")
    }
  }

  async function handleRecalculateAll() {
    const ok = window.confirm("Tüm hasta kayıtları yaş, büyüme, tedavi ve immünoloji otomatik alanlarıyla yeniden hesaplansın mı?")
    if (!ok) return

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
        <button onClick={handleRecalculateAll} disabled={recalcLoading} style={{...s.btnPrimary, marginBottom:8}}>
          {recalcLoading ? "Yeniden hesaplanıyor..." : "Tüm otomatik alanları yeniden hesapla"}
        </button>
        <div style={{fontSize:12, color:"#6b7280"}}>
          Eski kayıtların Ig/subset düşük bayraklarını, z-skorlarını ve diğer hesaplanan alanlarını mevcut ölçümlere göre tekrar kaydeder.
        </div>
      </div>

      <div style={{...s.card, marginBottom:14}}>
        <div style={{fontSize:13, fontWeight:500, marginBottom:8}}>Yapay zeka destekli analiz</div>
        <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:8}}>
          {["PIBO grubunu demografik olarak özetle","FEV1 değişimini yorumla","Etken dağılımını analiz et","Tedavi sonuçlarını değerlendir"].map(q => (
            <button key={q} onClick={() => setQuery(q)} style={{...s.btn, fontSize:11, padding:"3px 10px"}}>{q}</button>
          ))}
        </div>
        <textarea value={query} onChange={e => setQuery(e.target.value)} rows={2} placeholder="Sorunuzu yazın..." style={{...s.input, resize:"vertical", marginBottom:8}} />
        <button onClick={runAnalysis} disabled={loading} style={s.btnPrimary}>
          {loading ? "Analiz yapılıyor..." : "Analiz et →"}
        </button>
        {result && <div style={{marginTop:12, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap", borderTop:"1px solid #f3f4f6", paddingTop:12}}>{result}</div>}
      </div>

      <div style={{display:"flex", gap:6, marginBottom:10}}>
        {[["all","Tümü"],["pibo","PIBO"],["ptbo","PTBO"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilterGroup(v)} style={{...s.btn, fontWeight: filterGroup===v?500:400, background: filterGroup===v?"#eff6ff":"#fff", borderColor: filterGroup===v?"#3b82f6":"#e5e7eb", color: filterGroup===v?"#1d4ed8":"#374151"}}>{l}</button>
        ))}
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
          <thead>
            <tr style={{borderBottom:"1px solid #e5e7eb"}}>
              {["ID","Grup","Merkez","Cinsiyet","Yaş (ay)","FEV1 bas","FEV1 bit","Sonuç",""].map(h => (
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
                  <button
                    onClick={() => handleDelete(p)}
                    style={{...s.btn, color:"#b91c1c", borderColor:"#fecaca", background:"#fff", fontSize:11, padding:"4px 8px"}}
                  >
                    Sil
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

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState("action")
  const [editing, setEditing] = useState(null)

  // Supabase'dan yükle, yoksa seed data yükle
  useEffect(() => {
    (async () => {
      setLoading(true)
      const { data, error } = await supabase.from("hastalar").select("*").order("hasta_id")
      if (error) { console.error(error); setLoading(false); return }

      if (data && data.length >= 23) {
        setPatients(data)
      } else {
        // Seed data yükle
        const { error: insertError } = await supabase
          .from("hastalar")
          .upsert(SEED_DATA, { onConflict: "hasta_id" })
        if (insertError) console.error(insertError)
        const { data: fresh } = await supabase.from("hastalar").select("*").order("hasta_id")
        setPatients(fresh || SEED_DATA)
      }
      setLoading(false)
    })()
  }, [])

  async function savePatient(p) {
    const record = { ...p, ...calculateDerivedFields(p), merkez: p.hasta_id.split("-")[0], guncelleme_tarihi: new Date().toISOString() }
    const { error } = await supabase.from("hastalar").upsert(record, { onConflict: "hasta_id" })
    let savedRecord = record
    let warning = ""

    if (error) {
      console.error("Supabase full save failed:", error)
      const fallbackRecord = pickRecordColumns(record, LEGACY_COLUMN_KEYS)
      const fallback = await supabase.from("hastalar").upsert(fallbackRecord, { onConflict: "hasta_id" })

      if (fallback.error) {
        console.error("Supabase fallback save failed:", fallback.error)
        throw new Error(formatSupabaseError(fallback.error) || formatSupabaseError(error) || "Supabase kayıt hatası.")
      }

      savedRecord = fallbackRecord
      warning = "Mevcut kolonlar kaydedildi; doğum tarihi/tarih-vital yeni alanlarının kalıcı kaydı için Supabase SQL migrasyonu çalışmalı."
    }

    // Local state güncelle
    setPatients(prev => {
      const idx = prev.findIndex(x => x.hasta_id === p.hasta_id)
      return idx >= 0 ? prev.map((x,i) => i===idx ? savedRecord : x) : [...prev, savedRecord]
    })
    return { warning }
  }

  async function deletePatient(hastaId) {
    const { error } = await supabase.from("hastalar").delete().eq("hasta_id", hastaId)
    if (error) {
      console.error("Supabase delete failed:", error)
      throw new Error(formatSupabaseError(error) || "Supabase silme hatası.")
    }
    setPatients(prev => prev.filter(patient => patient.hasta_id !== hastaId))
  }

  async function recalculateAllPatients() {
    const recalculated = patients.map(patient => ({
      ...patient,
      ...calculateDerivedFields(patient),
      merkez: patient.hasta_id.split("-")[0],
      guncelleme_tarihi: new Date().toISOString(),
    }))
    const { error } = await supabase.from("hastalar").upsert(recalculated, { onConflict: "hasta_id" })
    if (error) {
      console.error("Supabase recalculation failed:", error)
      throw new Error(formatSupabaseError(error) || "Supabase toplu güncelleme hatası.")
    }

    setPatients(recalculated)
    const immunologyCount = recalculated.filter(patient =>
      [
        patient.iga,
        patient.igm,
        patient.igg,
        patient.igg1,
        patient.igg2,
        patient.igg3,
        patient.igg4,
        patient.cbc_lym,
        patient.cd3,
        patient.cd4,
        patient.cd8,
        patient.cd19,
        patient.cd16_cd56,
        patient.lscd3_abs,
        patient.lscd4_abs,
        patient.lscd8_abs,
        patient.lscd19,
        patient.lscd56,
      ].some(value => value != null)
    ).length
    return { count: recalculated.length, immunologyCount }
  }

  if (loading) return (
    <div style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f9fafb"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:16, color:"#6b7280", marginBottom:8}}>Veriler yükleniyor...</div>
        <div style={{fontSize:12, color:"#9ca3af"}}>Supabase bağlantısı kuruluyor</div>
      </div>
    </div>
  )

  if (!session) return <Login onLogin={(code, info) => { setSession({code, info}); setScreen("action") }} />

  if (screen==="action") return (
    <ActionScreen
      center={session.code}
      centerInfo={session.info}
      patients={patients}
      onAction={a => {
        if (a==="new") {
          const prefix = session.info.isAdmin ? "XXX" : session.info.prefix
          const count = session.info.isAdmin ? patients.length : patients.filter(p=>p.hasta_id.startsWith(prefix+"-")).length
          setEditing({ hasta_id:`${prefix}-${String(count+1).padStart(3,"0")}`, pibo:0, ptbo:0, merkez:prefix })
          setScreen("new")
        } else if (a==="update") {
          setScreen("select")
        } else if (a==="admin") {
          setScreen("admin")
        }
      }}
      onLogout={() => { setSession(null); setScreen("action") }}
    />
  )

  if (screen==="select") return (
    <SelectPatient
      patients={patients}
      centerInfo={session.info}
      onSelect={p => { setEditing({...p}); setScreen("edit") }}
      onBack={() => setScreen("action")}
    />
  )

  if (screen==="new" || screen==="edit") return (
    <PatientForm
      patient={editing}
      isNew={screen==="new"}
      onSave={p => savePatient(p)}
      onBack={() => setScreen("action")}
    />
  )

  if (screen==="admin") return (
    <AdminPanel patients={patients} onBack={() => setScreen("action")} onDelete={deletePatient} onRecalculateAll={recalculateAllPatients} />
  )

  return null
}
