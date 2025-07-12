async function sendPrompt() {
  const prompt = document.getElementById("prompt").value;
  const responseBox = document.getElementById("response");
  responseBox.textContent = "🤖 Thinking...";

  try {
    const res = await fetch("https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await res.json();

    if (data.error) {
      responseBox.textContent = "⚠️ API Error: " + data.error;
    } else {
      responseBox.textContent = data[0]?.generated_text || "🤖 No valid response.";
    }
  } catch (err) {
    responseBox.textContent = "❌ Network error: " + err.message;
  }
}
