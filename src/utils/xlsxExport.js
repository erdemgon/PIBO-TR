function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
}

const TEXT_EXPORT_COLUMNS = [
  /^hasta_id$/,
  /tarih/i,
  /date/i,
  /^bal_/i,
  /(^|_)cd\d/i,
  /cd4_cd8/i,
  /subset/i,
  /lenfosit/i,
  /^ig[agme]?(_|$)/i,
  /immun/i,
  /ppd/i,
  /igra/i,
]

function shouldExportAsText(column) {
  return TEXT_EXPORT_COLUMNS.some(pattern => pattern.test(column))
}

function normalizedExcelValue(value) {
  if (value == null) return ""
  if (Array.isArray(value) || typeof value === "object") return JSON.stringify(value)
  return value
}

function columnLetter(index) {
  let number = index + 1
  let letter = ""
  while (number > 0) {
    const remainder = (number - 1) % 26
    letter = String.fromCharCode(65 + remainder) + letter
    number = Math.floor((number - 1) / 26)
  }
  return letter
}

function excelCell(column, value, columnIndex, rowIndex) {
  const normalized = normalizedExcelValue(value)
  const ref = `${columnLetter(columnIndex)}${rowIndex + 1}`
  if (!shouldExportAsText(column) && typeof normalized === "number" && Number.isFinite(normalized)) {
    return `<c r="${ref}"><v>${normalized}</v></c>`
  }
  if (!shouldExportAsText(column) && typeof normalized === "boolean") {
    return `<c r="${ref}" t="b"><v>${normalized ? 1 : 0}</v></c>`
  }
  return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(normalized)}</t></is></c>`
}

function createCrcTable() {
  return Array.from({ length: 256 }, (_, index) => {
    let crc = index
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
    }
    return crc >>> 0
  })
}

const CRC_TABLE = createCrcTable()

function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function dateToDosParts(date = new Date()) {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  }
}

function uint32(value) {
  const bytes = new Uint8Array(4)
  new DataView(bytes.buffer).setUint32(0, value >>> 0, true)
  return bytes
}

function uint16(value) {
  const bytes = new Uint8Array(2)
  new DataView(bytes.buffer).setUint16(0, value, true)
  return bytes
}

function concatBytes(parts) {
  const length = parts.reduce((sum, part) => sum + part.length, 0)
  const result = new Uint8Array(length)
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }
  return result
}

function createZip(files) {
  const encoder = new TextEncoder()
  const { time, date } = dateToDosParts()
  const localParts = []
  const centralParts = []
  let offset = 0

  for (const file of files) {
    const name = encoder.encode(file.path)
    const data = encoder.encode(file.content)
    const crc = crc32(data)
    const localHeader = concatBytes([
      uint32(0x04034b50), uint16(20), uint16(0x0800), uint16(0), uint16(time), uint16(date),
      uint32(crc), uint32(data.length), uint32(data.length), uint16(name.length), uint16(0), name,
    ])
    const centralHeader = concatBytes([
      uint32(0x02014b50), uint16(20), uint16(20), uint16(0x0800), uint16(0), uint16(time), uint16(date),
      uint32(crc), uint32(data.length), uint32(data.length), uint16(name.length), uint16(0), uint16(0),
      uint16(0), uint16(0), uint32(0), uint32(offset), name,
    ])
    localParts.push(localHeader, data)
    centralParts.push(centralHeader)
    offset += localHeader.length + data.length
  }

  const centralDirectory = concatBytes(centralParts)
  const end = concatBytes([
    uint32(0x06054b50), uint16(0), uint16(0), uint16(files.length), uint16(files.length),
    uint32(centralDirectory.length), uint32(offset), uint16(0),
  ])
  return concatBytes([...localParts, centralDirectory, end])
}

function xlsxFilesFromRows(rows, columns) {
  const sheetRows = [
    columns.map((column, columnIndex) => excelCell(column, column, columnIndex, 0)),
    ...rows.map((row, rowIndex) => columns.map((column, columnIndex) => excelCell(column, row[column], columnIndex, rowIndex + 1))),
  ]
  const cols = columns.map((column, index) => {
    const width = Math.min(Math.max(column.length + 2, 12), 32)
    return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`
  }).join("")
  const sheetData = sheetRows.map((cells, rowIndex) => `<row r="${rowIndex + 1}">${cells.join("")}</row>`).join("")
  const now = new Date().toISOString()

  return [
    {
      path: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
    },
    {
      path: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`,
    },
    {
      path: "docProps/core.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>PIBO-TR Registry Export</dc:title><dc:creator>PIBO-TR Registry</dc:creator><cp:lastModifiedBy>PIBO-TR Registry</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`,
    },
    {
      path: "docProps/app.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>PIBO-TR Registry</Application></Properties>`,
    },
    {
      path: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Hastalar" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      path: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
    },
    {
      path: "xl/worksheets/sheet1.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${cols}</cols><sheetData>${sheetData}</sheetData></worksheet>`,
    },
  ]
}

export function downloadXlsx(filename, rows, columns) {
  if (!rows.length) return
  const xlsxBytes = createZip(xlsxFilesFromRows(rows, columns))
  const blob = new Blob([xlsxBytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
