async function sendPrompt() {
  const prompt = document.getElementById("prompt").value;
  const responseBox = document.getElementById("response");
  responseBox.textContent = "🤖 Thinking...";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    if (data.error) {
      responseBox.textContent = "⚠️ Error: " + data.error;
    } else {
      responseBox.textContent = data.text;
    }
  } catch (err) {
    responseBox.textContent = "❌ Network error: " + err.message;
    console.error("Fetch error:", err);
  }
}
