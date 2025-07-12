
export default async function handler(req, res) {
  const prompt = req.body.prompt;
  const apiKey = process.env.BLACKBOX_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing Blackbox API key." });
  }

  try {
    const bbRes = await fetch("https://www.blackbox.ai/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo"
      })
    });

    const data = await bbRes.json();

    // Adjust based on Blackbox response format
    const reply = data?.response || "🤖 No reply from Blackbox";

    res.status(200).json({ text: reply });

  } catch (err) {
    console.error("Blackbox API error:", err);
    res.status(500).json({ error: "Blackbox request failed" });
  }
}
