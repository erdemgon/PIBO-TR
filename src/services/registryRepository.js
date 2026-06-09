import { supabase } from "../supabase.js"

export async function listPatients() {
  const { data, error } = await supabase.from("hastalar").select("*").order("hasta_id")
  if (error) throw error
  return data || []
}

export async function upsertPatients(records) {
  const payload = Array.isArray(records) ? records : [records]
  const { error } = await supabase.from("hastalar").upsert(payload, { onConflict: "hasta_id" })
  if (error) throw error
}

export async function deletePatientById(hastaId) {
  const { error } = await supabase.from("hastalar").delete().eq("hasta_id", hastaId)
  if (error) throw error
}

export async function listFollowUpVisits(hastaId) {
  const { data, error } = await supabase
    .from("follow_up_visits")
    .select("*")
    .eq("hasta_id", hastaId)
    .order("visit_date", { ascending: false })
  if (error) throw error
  return data || []
}

export async function createFollowUpVisit(record) {
  const { data, error } = await supabase
    .from("follow_up_visits")
    .insert(record)
    .select("*")
    .single()
  if (error) throw error
  return data
}

export async function deleteFollowUpVisit(id) {
  const { error } = await supabase.from("follow_up_visits").delete().eq("id", id)
  if (error) throw error
}

export async function listPftRecords(hastaId) {
  const { data, error } = await supabase
    .from("pft_records")
    .select("*")
    .eq("hasta_id", hastaId)
    .order("test_date", { ascending: false })
  if (error) throw error
  return data || []
}

export async function createPftRecord(record) {
  const { data, error } = await supabase
    .from("pft_records")
    .insert(record)
    .select("*")
    .single()
  if (error) throw error
  return data
}

export async function deletePftRecord(id) {
  const { error } = await supabase.from("pft_records").delete().eq("id", id)
  if (error) throw error
}
