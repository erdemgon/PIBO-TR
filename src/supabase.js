import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

function missingSupabaseClient() {
  const error = new Error("Supabase ortam değişkenleri eksik: VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY tanımlanmalı.")
  const query = {
    select: () => query,
    order: () => Promise.reject(error),
    eq: () => query,
    delete: () => query,
    upsert: () => query,
    insert: () => query,
    single: () => query,
    then: (_resolve, reject) => reject(error),
  }
  return {
    from: () => query,
  }
}

export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : missingSupabaseClient()
