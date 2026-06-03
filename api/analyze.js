export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, summary } = req.body;

  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
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
        max_tokens: 1200,
        messages: [
          {
            role: "user",
            content: `Sen bir pediatrik göğüs hastalıkları uzmanısın. Registry verisi hakkında şu soruyu yanıtla:\n\n"${query}"\n\nVeri özeti: ${JSON.stringify(summary)}\n\nTürkçe yanıt ver. Örneklem küçüklüğünü belirt.`,
          },
        ],
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return res.status(resp.status).json({ error: data.error?.message || "Anthropic API error" });
    }

    const text = data.content?.[0]?.text || "Yanıt alınamadı.";
    return res.status(200).json({ result: text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
