export default async function handler(req, res) {
  const prompt = req.body.prompt;
  console.log("Incoming prompt:", prompt);

  if (!prompt) {
    return res.status(400).json({ error: "Prompt missing!" });
  }

  try {
    const hfRes = await fetch("https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await hfRes.json();

    console.log("HF API Response:", data);

    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    res.status(200).json({ text: data[0]?.generated_text || "No response 🤖" });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
