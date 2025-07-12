// script.js
async function sendPrompt() {
  const prompt = document.getElementById("prompt").value;
  const responseBox = document.getElementById("response");

  responseBox.textContent = "Thinking... 🤔";

  const res = await fetch("https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B", {
    method: "POST",
    headers: {
      "Authorization": "Bearer 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",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt
    })
  });

  const data = await res.json();
  const text = data[0]?.generated_text || "No response 😓";
  responseBox.textContent = text;
}
