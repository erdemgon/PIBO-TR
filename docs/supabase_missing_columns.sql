-- Uygulama tarafından gönderilen ama Supabase şemasında eksik olan kolonlar
-- Bu SQL'i Supabase SQL Editor'de çalıştır

alter table public.hastalar
  -- İlaç bayrakları (hesaplanan, _aldi versiyonlarının yanı sıra)
  add column if not exists azitromisin numeric,
  add column if not exists flutikazon numeric,
  add column if not exists montelukast numeric,

  -- Seretide 25/50 dozu (expansion SQL'de 125 ve 250 var ama 25/50 eksikti)
  add column if not exists seretide_25_50_puff_gun numeric,
  add column if not exists seretide_25_50_gun numeric,

  -- Steroid alanları
  add column if not exists steroid_baslangic_dozu numeric,
  add column if not exists steroid_suresi_gun numeric,
  add column if not exists kumulatif_steroid numeric,
  add column if not exists pulse_steroid numeric;
