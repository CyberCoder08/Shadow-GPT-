const res = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: userInput })
});
const data = await res.json();
