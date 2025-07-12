export default async function handler(req, res) {
  const prompt = req.body.prompt;
  const apiKey = process.env.OPENROUTER_API_KEY;

  try {
    const routerRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // or try "mistralai/mixtral-8x7b"
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await routerRes.json();

    res.status(200).json({
      text: data?.choices?.[0]?.message?.content || "🤖 No response from OpenRouter"
    });
  } catch (err) {
    console.error("💥 OpenRouter error:", err);
    res.status(500).json({ error: "OpenRouter request failed." });
  }
}
