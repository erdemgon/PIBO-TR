import { readFileSync } from "node:fs"

const app = readFileSync("src/App.jsx", "utf8")
const sqlFiles = [
  "docs/supabase_phase1_columns.sql",
  "docs/supabase_registry_expansion.sql",
  "docs/supabase_missing_columns.sql",
]

function extractArray(name) {
  const start = app.indexOf(`const ${name} = [`)
  if (start < 0) throw new Error(`${name} bulunamadı.`)
  const open = app.indexOf("[", start)
  let depth = 0
  for (let i = open; i < app.length; i += 1) {
    if (app[i] === "[") depth += 1
    if (app[i] === "]") depth -= 1
    if (depth === 0) return app.slice(open, i + 1)
  }
  throw new Error(`${name} kapanış parantezi bulunamadı.`)
}

function extractObject(name) {
  const start = app.indexOf(`const ${name} = {`)
  if (start < 0) throw new Error(`${name} bulunamadı.`)
  const open = app.indexOf("{", start)
  let depth = 0
  for (let i = open; i < app.length; i += 1) {
    if (app[i] === "{") depth += 1
    if (app[i] === "}") depth -= 1
    if (depth === 0) return app.slice(open, i + 1)
  }
  throw new Error(`${name} kapanış parantezi bulunamadı.`)
}

function quotedKeys(text) {
  return [...text.matchAll(/"([a-zA-Z0-9_]+)"/g)].map(match => match[1])
}

const originalColumns = quotedKeys(extractArray("ORIGINAL_HASTALAR_COLUMNS"))
const derivedColumns = quotedKeys(extractArray("DERIVED_PATIENT_COLUMNS"))
const formKeys = [...extractObject("FIELD_GROUPS").matchAll(/key:\s*"([a-zA-Z0-9_]+)"/g)].map(match => match[1])
const sqlColumns = sqlFiles.flatMap(file => {
  const sql = readFileSync(file, "utf8")
  return [...sql.matchAll(/add column if not exists\s+([a-zA-Z0-9_]+)/gi)].map(match => match[1])
})
const declaredColumns = new Set([...originalColumns, ...derivedColumns, ...sqlColumns])
const missing = [...new Set(formKeys.filter(key => !declaredColumns.has(key)))].sort()

if (!app.includes("...formFieldKeys(FIELD_GROUPS)")) {
  throw new Error("DB_COLUMN_KEYS formFieldKeys(FIELD_GROUPS) ile üretilmiyor.")
}

if (missing.length) {
  throw new Error(`Form alanları için kalıcı DB kolonu eksik: ${missing.join(", ")}`)
}

console.log(`Persistence audit OK: ${new Set(formKeys).size} form alanı DB kolon kapsamına giriyor.`)
