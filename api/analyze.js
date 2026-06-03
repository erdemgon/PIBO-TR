export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { query, patients } = req.body
  if (!query) return res.status(400).json({ error: "query is required" })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" })

  const pibo = (patients || []).filter(p => p.pibo == 1)
  const ptbo = (patients || []).filter(p => p.ptbo == 1)

  function pct(arr, fn) {
    const valid = arr.filter(p => fn(p) != null)
    if (!valid.length) return null
    return Math.round(valid.filter(fn).length / valid.length * 100)
  }
  function median(arr) {
    if (!arr.length) return null
    const s = [...arr].sort((a, b) => a - b)
    const m = Math.floor(s.length / 2)
    return s.length % 2 ? s[m] : +((s[m - 1] + s[m]) / 2).toFixed(1)
  }
  function mean(arr) {
    if (!arr.length) return null
    return +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
  }
  function vals(arr, key) {
    return arr.map(p => p[key]).filter(v => v != null && !isNaN(v)).map(Number)
  }

  const stats = {
    genel: {
      n_total: (patients || []).length,
      n_pibo: pibo.length,
      n_ptbo: ptbo.length,
    },
    pibo: {
      n: pibo.length,
      erkek_pct: pct(pibo, p => p.cinsiyet === "e"),
      yabanci_pct: pct(pibo, p => p.yabanci == 1),
      yas_ay_median: median(vals(pibo, "yas_ay")),
      yas_ay_mean: mean(vals(pibo, "yas_ay")),
      // Tanı zamanlaması
      tani_yas_gun_median: median(vals(pibo, "tani_yas_gun")),
      semptom_tani_gun_median: median(vals(pibo, "muayene_tani_gun")),
      // Etkenler
      etken_adenovirus_pct: pct(pibo, p => p.etken_adenovirus == 1),
      etken_rinovirus_pct: pct(pibo, p => p.etken_rinovirus == 1),
      etken_rsv_pct: pct(pibo, p => p.etken_rsv == 1),
      etken_covid_pct: pct(pibo, p => p.etken_covid == 1),
      etken_kizamik_pct: pct(pibo, p => p.etken_kizamik == 1),
      etken_ebv_pct: pct(pibo, p => p.etken_ebv == 1),
      etken_influenza_pct: pct(pibo, p => p.etken_influenza == 1),
      etken_metapneumovirus_pct: pct(pibo, p => p.etken_metapneumovirus == 1),
      // BT bulguları
      bt_bronsektazi_pct: pct(pibo, p => p.bt_bronsektazi == 1),
      bt_atelektazi_pct: pct(pibo, p => p.bt_atelektazi == 1),
      bt_infiltrasyon_pct: pct(pibo, p => p.bt_infiltrasyon == 1),
      // Tedavi
      sistemik_steroid_pct: pct(pibo, p => p.sistemik_steroid == 1),
      azitromisin_pct: pct(pibo, p => p.azitromisin == 1),
      kumulatif_steroid_median: median(vals(pibo, "kumulatif_steroid")),
      steroid_suresi_median: median(vals(pibo, "steroid_suresi_gun")),
      // Tedavi sonuçları
      tedavi_iyi_pct: pct(pibo, p => p.tedavi_sonucu == 1),
      tedavi_orta_pct: pct(pibo, p => p.tedavi_sonucu == 2),
      tedavi_kotu_pct: pct(pibo, p => p.tedavi_sonucu == 3),
      semptom_devam_pct: pct(pibo, p => p.semptom_devam == 1),
      // Solunum fonksiyonları (mevcut olanlar)
      fev1_bas_mean: mean(vals(pibo, "fev1_bas")),
      fev1_bit_mean: mean(vals(pibo, "fev1_bit")),
      fvc_bas_mean: mean(vals(pibo, "fvc_bas")),
      // İmmünoloji
      imun_yetmezlik_pct: pct(pibo, p => p.imun_yetmezlik == 1),
      astim_pct: pct(pibo, p => p.astim == 1),
      igg_mean: mean(vals(pibo, "igg")),
    },
    ptbo: {
      n: ptbo.length,
      erkek_pct: pct(ptbo, p => p.cinsiyet === "e"),
      hsct_pct: pct(ptbo, p => p.hsct == 1),
      solid_tx_pct: pct(ptbo, p => p.solid_tx == 1),
      gvhd_pct: pct(ptbo, p => p.gvhd == 1),
      yas_ay_median: median(vals(ptbo, "yas_ay")),
      ex_pct: pct(ptbo, p => p.ex == 1),
      fev1_bas_mean: mean(vals(ptbo, "fev1_bas")),
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
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `Sen bir pediatrik göğüs hastalıkları uzmanı ve biyoistatistikçisin. PIBO/PTBO registry verilerini analiz ediyorsun.

SORU: "${query}"

HESAPLANMIŞ İSTATİSTİKLER:
${JSON.stringify(stats, null, 2)}

Lütfen:
1. Soruyu tam ve klinik olarak anlamlı biçimde yanıtla
2. Yüzdeleri ve medyanları tablolar veya madde madde sun
3. Klinik yorumu ekle
4. Örneklem küçüklüğünü belirt
5. Türkçe yanıt ver`
        }]
      }),
    })

    const data = await resp.json()
    if (!resp.ok) return res.status(resp.status).json({ error: data.error?.message || "Anthropic API error" })
    return res.status(200).json({ result: data.content?.[0]?.text || "Yanıt alınamadı.", stats })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
