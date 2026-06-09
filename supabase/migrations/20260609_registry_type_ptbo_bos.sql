alter table public.hastalar
  add column if not exists registry_type text,
  add column if not exists ptbo_altta_yatan_hastalik text,
  add column if not exists ptbo_malignite_endikasyonu numeric,
  add column if not exists ptbo_hsct_tarihi date,
  add column if not exists ptbo_donor_tipi text,
  add column if not exists ptbo_kok_hucre_kaynagi text,
  add column if not exists ptbo_kosullandirma_yogunlugu text,
  add column if not exists ptbo_onceki_akciger_hastaligi numeric,
  add column if not exists ptbo_torasik_radyoterapi numeric,
  add column if not exists ptbo_kemo_akciger_toksisite numeric,
  add column if not exists ptbo_akut_gvhd numeric,
  add column if not exists ptbo_cgvhd numeric,
  add column if not exists ptbo_extrapulmoner_cgvhd numeric,
  add column if not exists ptbo_cgvhd_organlari text,
  add column if not exists ptbo_sistemik_immunsupresyon numeric,
  add column if not exists ptbo_immunsupresyon_ajanlari text,
  add column if not exists ptbo_pre_hsct_sft_var numeric,
  add column if not exists ptbo_pre_hsct_fev1_pct numeric,
  add column if not exists ptbo_pre_hsct_fev1_z numeric,
  add column if not exists ptbo_pre_hsct_fvc_pct numeric,
  add column if not exists ptbo_pre_hsct_fvc_z numeric,
  add column if not exists ptbo_pre_hsct_fev1_vc numeric,
  add column if not exists ptbo_pre_hsct_fef2575_pct numeric,
  add column if not exists ptbo_pre_hsct_tlc numeric,
  add column if not exists ptbo_pre_hsct_rv numeric,
  add column if not exists ptbo_pre_hsct_rv_tlc numeric,
  add column if not exists ptbo_pre_hsct_dlco numeric,
  add column if not exists ptbo_pre_hsct_lci numeric,
  add column if not exists ptbo_pre_hsct_ct_var numeric,
  add column if not exists ptbo_pre_hsct_ct_bulgu text,
  add column if not exists ptbo_survey_3ay_tarihi date,
  add column if not exists ptbo_survey_6ay_tarihi date,
  add column if not exists ptbo_survey_9ay_tarihi date,
  add column if not exists ptbo_survey_12ay_tarihi date,
  add column if not exists ptbo_gercek_pft_tarihleri text,
  add column if not exists ptbo_survey_tamamlik numeric,
  add column if not exists ptbo_survey_uyumlu numeric,
  add column if not exists ptbo_spirometri_yapabilir numeric,
  add column if not exists ptbo_mbw_lci_var numeric,
  add column if not exists ptbo_klinik_adjudikasyon_bos numeric,
  add column if not exists ptbo_bos_suphe_tarihi date,
  add column if not exists ptbo_bos_tani_tarihi date,
  add column if not exists ptbo_yeni_solunum_semptomu numeric,
  add column if not exists ptbo_oksuruk numeric,
  add column if not exists ptbo_dispne numeric,
  add column if not exists ptbo_wheezing numeric,
  add column if not exists ptbo_hipoksemi numeric,
  add column if not exists ptbo_egzersiz_intoleransi numeric,
  add column if not exists ptbo_asemptomatik_pft_dusus numeric,
  add column if not exists ptbo_bos_fev1_pct numeric,
  add column if not exists ptbo_fev1_dusus_iki_test numeric,
  add column if not exists ptbo_fev1_vc_lln_altinda numeric,
  add column if not exists ptbo_obstruktif_patern numeric,
  add column if not exists ptbo_prism_patern numeric,
  add column if not exists ptbo_rv_veya_rvtlc_uln_ustu numeric,
  add column if not exists ptbo_lci numeric,
  add column if not exists ptbo_ct_air_trapping numeric,
  add column if not exists ptbo_ct_mozaik numeric,
  add column if not exists ptbo_ct_bronsektazi numeric,
  add column if not exists ptbo_ct_duvar_kalinlasma numeric,
  add column if not exists ptbo_ct_infiltrat_enfeksiyon numeric,
  add column if not exists ptbo_bal_yapildi numeric,
  add column if not exists ptbo_bal_kultur text,
  add column if not exists ptbo_bal_viral_pcr text,
  add column if not exists ptbo_bal_fungal_bakteriyel_tbc text,
  add column if not exists ptbo_enfeksiyon_saptandi numeric,
  add column if not exists ptbo_enfeksiyon_tedavi_duzeldi numeric,
  add column if not exists ptbo_enfeksiyon_sonrasi_suphe_devam numeric,
  add column if not exists ptbo_biyopsi_yapildi numeric,
  add column if not exists ptbo_biyopsi_endikasyon text,
  add column if not exists ptbo_biyopsi_sonuc text,
  add column if not exists ptbo_biyopsi_bo numeric,
  add column if not exists ptbo_klinisyen_son_tani text,
  add column if not exists ptbo_suspicion_flag numeric,
  add column if not exists ptbo_criteria_summary text,
  add column if not exists ptbo_diagnostic_category text,
  add column if not exists ptbo_supporting_features_count numeric,
  add column if not exists ptbo_missing_required_fields text,
  add column if not exists ptbo_recommended_next_step text,
  add column if not exists ptbo_ics numeric,
  add column if not exists ptbo_bronkodilator_laba numeric,
  add column if not exists ptbo_azitromisin numeric,
  add column if not exists ptbo_montelukast numeric,
  add column if not exists ptbo_fam_baslandi numeric,
  add column if not exists ptbo_fam_baslama_tarihi date,
  add column if not exists ptbo_sistemik_steroid_mgkg_gun numeric,
  add column if not exists ptbo_sistemik_steroid_gun numeric,
  add column if not exists ptbo_pulse_steroid numeric,
  add column if not exists ptbo_ruxolitinib numeric,
  add column if not exists ptbo_belumosudil numeric,
  add column if not exists ptbo_abatacept numeric,
  add column if not exists ptbo_axatilimab numeric,
  add column if not exists ptbo_ecp numeric,
  add column if not exists ptbo_diger_immunsupresif text,
  add column if not exists ptbo_pulmoner_rehabilitasyon numeric,
  add column if not exists ptbo_gerd_degerlendirme_tedavi numeric,
  add column if not exists ptbo_antimikrobiyal_profilaksi numeric,
  add column if not exists ptbo_oksijen_destegi numeric,
  add column if not exists ptbo_niv_destegi numeric,
  add column if not exists ptbo_imv_destegi numeric,
  add column if not exists ptbo_akciger_tx_dusunuldu numeric,
  add column if not exists ptbo_akciger_tx_listelendi numeric,
  add column if not exists ptbo_akciger_tx_yapildi numeric,
  add column if not exists ptbo_4hf_pft_tarihi date,
  add column if not exists ptbo_tedavi_yanit text;

update public.hastalar
set registry_type = case when coalesce(ptbo, 0) = 1 then 'PTBO' else 'PIBO' end
where registry_type is null;

update public.hastalar
set pibo = case when registry_type = 'PIBO' then 1 else 0 end,
    ptbo = case when registry_type = 'PTBO' then 1 else 0 end
where registry_type in ('PIBO', 'PTBO');

alter table public.hastalar alter column registry_type set default 'PIBO';
alter table public.hastalar drop constraint if exists hastalar_registry_type_check;
alter table public.hastalar add constraint hastalar_registry_type_check check (registry_type in ('PIBO', 'PTBO'));
alter table public.hastalar alter column registry_type set not null;

create or replace function public.hastalar_registry_type_sync()
returns trigger
language plpgsql
as $$
begin
  if new.registry_type is null then
    new.registry_type := case when coalesce(new.ptbo, 0) = 1 then 'PTBO' else 'PIBO' end;
  end if;
  if new.registry_type = 'PTBO' then
    new.ptbo := 1;
    new.pibo := 0;
  else
    new.registry_type := 'PIBO';
    new.pibo := 1;
    new.ptbo := 0;
  end if;
  return new;
end;
$$;

drop trigger if exists hastalar_registry_type_sync_trigger on public.hastalar;
create trigger hastalar_registry_type_sync_trigger
before insert or update on public.hastalar
for each row execute function public.hastalar_registry_type_sync();

create or replace view public.pibo_registry_view as
select * from public.hastalar where registry_type = 'PIBO';

create or replace view public.ptbo_registry_view as
select * from public.hastalar where registry_type = 'PTBO';

create or replace view public.combined_registry_view as
select * from public.hastalar where registry_type in ('PIBO', 'PTBO');
