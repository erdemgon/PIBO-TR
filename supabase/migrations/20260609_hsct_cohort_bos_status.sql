-- PTBO branch is modeled as an HSCT cohort; BOS/PTBO positivity is an outcome flag.

alter table public.hastalar
  add column if not exists ptbo_bos_pozitif numeric,
  add column if not exists ptbo_bos_status text;

alter table public.hastalar drop constraint if exists hastalar_ptbo_bos_status_check;
alter table public.hastalar
  add constraint hastalar_ptbo_bos_status_check
  check (ptbo_bos_status is null or ptbo_bos_status in ('no_bos', 'suspected', 'probable', 'confirmed', 'uncertain'));

comment on column public.hastalar.registry_type is 'PIBO or PTBO. PTBO is retained as a legacy-compatible code for the HSCT longitudinal cohort branch.';
comment on column public.hastalar.ptbo_bos_pozitif is 'Within the HSCT cohort, marks suspected/probable/confirmed PTBO-BOS positivity.';
comment on column public.hastalar.ptbo_bos_status is 'Within the HSCT cohort: no_bos, suspected, probable, confirmed, or uncertain.';
