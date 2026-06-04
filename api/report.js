export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { patients } = req.body
  if (!patients?.length) return res.status(400).json({ error: "patients required" })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" })

  const pibo = patients.filter(p => p.pibo == 1)
  const ptbo = patients.filter(p => p.ptbo == 1)

  function pct(arr, fn) {
    const valid = arr.filter(p => fn(p) != null && fn(p) !== undefined)
    if (!valid.length) return "—"
    const n = valid.filter(fn).length
    return `${n}/${valid.length} (%${Math.round(n / valid.length * 100)})`
  }
  function median(arr) {
    if (!arr.length) return "—"
    const s = [...arr].sort((a, b) => a - b)
    const m = Math.floor(s.length / 2)
    return s.length % 2 ? s[m] : +((s[m - 1] + s[m]) / 2).toFixed(1)
  }
  function mean(arr, dec = 1) {
    if (!arr.length) return "—"
    return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(dec)
  }
  function vals(arr, key) {
    return arr.map(p => p[key]).filter(v => v != null && !isNaN(v)).map(Number)
  }

  const today = new Date().toLocaleDateString("tr-TR")

  const promptData = {
    tarih: today,
    n_total: patients.length,
    n_pibo: pibo.length,
    n_ptbo: ptbo.length,
    merkezler: [...new Set(patients.map(p => (p.hasta_id || "").split("-")[0]))].join(", "),
    pibo: {
      n: pibo.length,
      erkek: pct(pibo, p => p.cinsiyet === "e"),
      yabanci: pct(pibo, p => p.yabanci == 1),
      yas_ay_median: median(vals(pibo, "yas_ay")),
      tani_yas_gun_median: median(vals(pibo, "tani_yas_gun")),
      semptom_tani_gun_median: median(vals(pibo, "semptom_tani_gun")),
      adenovirus: pct(pibo, p => p.etken_adenovirus == 1),
      rinovirus: pct(pibo, p => p.etken_rinovirus == 1),
      rsv: pct(pibo, p => p.etken_rsv == 1),
      covid: pct(pibo, p => p.etken_covid == 1),
      kizamik: pct(pibo, p => p.etken_kizamik == 1),
      ebv: pct(pibo, p => p.etken_ebv == 1),
      influenza: pct(pibo, p => p.etken_influenza == 1),
      metapneumovirus: pct(pibo, p => p.etken_metapneumovirus == 1),
      bt_bronsektazi: pct(pibo, p => p.bt_bronsektazi == 1),
      bt_atelektazi: pct(pibo, p => p.bt_atelektazi == 1),
      bt_infiltrasyon: pct(pibo, p => p.bt_infiltrasyon == 1),
      sistemik_steroid: pct(pibo, p => p.sistemik_steroid == 1),
      pulse_steroid: pct(pibo, p => p.pulse_steroid == 1),
      azitromisin: pct(pibo, p => p.azitromisin == 1),
      flutikazon: pct(pibo, p => p.flutikazon == 1),
      ivig: pct(pibo, p => p.ivig == 1),
      kumulatif_steroid_median: median(vals(pibo, "kumulatif_steroid")),
      steroid_sure_median: median(vals(pibo, "steroid_suresi_gun")),
      tedavi_iyi: pct(pibo, p => p.tedavi_sonucu == 1),
      tedavi_orta: pct(pibo, p => p.tedavi_sonucu == 2),
      tedavi_kotu: pct(pibo, p => p.tedavi_sonucu == 3),
      semptom_devam: pct(pibo, p => p.semptom_devam == 1),
      fev1_bas: mean(vals(pibo, "fev1_bas")),
      fev1_bit: mean(vals(pibo, "fev1_bit")),
      fvc_bas: mean(vals(pibo, "fvc_bas")),
      fvc_bit: mean(vals(pibo, "fvc_bit")),
      mef2575_bas: mean(vals(pibo, "mef2575_bas")),
      imun_yetmezlik: pct(pibo, p => p.imun_yetmezlik == 1),
      astim: pct(pibo, p => p.astim == 1),
      igg_mean: mean(vals(pibo, "igg")),
      ige_mean: mean(vals(pibo, "ige")),
      o2: pct(pibo, p => p.o2 == 1),
      bipap: pct(pibo, p => p.bipap == 1),
      imv: pct(pibo, p => p.imv == 1),
    },
    ptbo: {
      n: ptbo.length,
      erkek: pct(ptbo, p => p.cinsiyet === "e"),
      yas_ay_median: median(vals(ptbo, "yas_ay")),
      hsct: pct(ptbo, p => p.hsct == 1),
      solid_tx: pct(ptbo, p => p.solid_tx == 1),
      gvhd: pct(ptbo, p => p.gvhd == 1),
      ex: pct(ptbo, p => p.ex == 1),
      imv: pct(ptbo, p => p.imv == 1),
      fev1_bas: mean(vals(ptbo, "fev1_bas")),
      fev1_bit: mean(vals(ptbo, "fev1_bit")),
    }
  }

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `Sen bir pediatrik göğüs hastalıkları uzmanı ve klinisyen-araştırmacısın. Aşağıdaki registry verilerinden profesyonel bir descriptive istatistik raporu oluştur.

VERİ: ${JSON.stringify(promptData, null, 2)}

Lütfen şu bölümleri içeren tam bir Türkçe klinik rapor yaz:

1. YÖNETİCİ ÖZETİ (3-4 cümle)
2. GENEL KOHORTün ÖZELLİKLERİ (tablo formatında)
3. PIBO GRUBU - Demografik Özellikler (tablo)
4. PIBO GRUBU - Tetikleyici Etkenler (tablo, en sık ilk)
5. PIBO GRUBU - BT Bulguları (tablo)
6. PIBO GRUBU - Tedavi (tablo)
7. PIBO GRUBU - Solunum Fonksiyon Testleri (mevcut verilerle)
8. PIBO GRUBU - Tedavi Sonuçları (tablo)
9. PTBO GRUBU - Özet (tablo)
10. KLİNİK YORUM VE ÇIKARIMLAR (5-7 madde)

Format: Markdown kullan. Tablolar için | başlık | değer | formatını kullan.
Örneklem küçüklüğünü her tabloda belirt.
Eksik veri oranı yüksek değişkenler için not ekle.`
        }]
      }),
    })

    const data = await resp.json()
    if (!resp.ok) return res.status(resp.status).json({ error: data.error?.message || "Anthropic API error" })

    const markdown = data.content?.[0]?.text || ""

    // Markdown'ı HTML'e dönüştür (basit)
    const htmlContent = markdown
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/^\| (.+) \|$/gm, (match) => {
        const cells = match.split("|").filter(c => c.trim())
        return "<tr>" + cells.map(c => `<td>${c.trim()}</td>`).join("") + "</tr>"
      })
      .replace(/(<tr>.*<\/tr>\n)+/gs, (match) => `<table>${match}</table>`)
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>\n)+/gs, (match) => `<ul>${match}</ul>`)
      .replace(/\n\n/g, "<br><br>")

    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>PIBO Registry - Descriptive Rapor ${today}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
  h1 { color: #c8102e; border-bottom: 2px solid #c8102e; padding-bottom: 8px; }
  h2 { color: #0b1f3a; border-bottom: 1px solid #fecdd3; padding-bottom: 4px; margin-top: 32px; }
  h3 { color: #374151; margin-top: 20px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 14px; }
  td, th { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
  tr:first-child td { background: #fff1f2; font-weight: bold; }
  tr:nth-child(even) { background: #f9fafb; }
  ul { margin: 8px 0; padding-left: 24px; }
  li { margin: 4px 0; }
  .header { background: #0b1f3a; color: white; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-top: 4px solid #c8102e; }
  .header h1 { color: white; border: none; margin: 0; }
  .header p { margin: 4px 0; opacity: 0.85; font-size: 14px; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
<div class="header">
  <h1>🫁 PIBO / PTBO Registry</h1>
  <p>Tanımlayıcı İstatistik Raporu</p>
  <p>Rapor tarihi: ${today} &nbsp;|&nbsp; Toplam hasta: ${patients.length} (PIBO: ${pibo.length}, PTBO: ${ptbo.length})</p>
</div>
${htmlContent}
</body>
</html>`

    return res.status(200).json({ html, markdown })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
