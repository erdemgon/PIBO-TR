-- Uygulama tarafından gönderilen ama Supabase şemasında eksik olan kolonlar
-- Bu SQL'i Supabase SQL Editor'de çalıştır

alter table public.hastalar
  -- İlaç bayrakları
  add column if not exists azitromisin numeric,
  add column if not exists flutikazon numeric,
  add column if not exists montelukast numeric,
  add column if not exists ivig numeric,

  -- Seretide 25/50 dozu
  add column if not exists seretide_25_50_puff_gun numeric,
  add column if not exists seretide_25_50_gun numeric,

  -- Steroid alanları
  add column if not exists steroid_baslangic_dozu numeric,
  add column if not exists steroid_suresi_gun numeric,
  add column if not exists kumulatif_steroid numeric,
  add column if not exists pulse_steroid numeric,

  -- Tarih yardımcı alanları (hesaplanan)
  add column if not exists dogum_ay numeric,
  add column if not exists dogum_yil numeric,
  add column if not exists tani_ay numeric,
  add column if not exists tani_yil numeric,
  add column if not exists azitro_bitis_tarihi date,
  add column if not exists semptom_oncesi_gun numeric,
  add column if not exists azitro_bitis_tani_gun numeric;
