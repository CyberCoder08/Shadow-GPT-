
const res = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: "Test prompt" })
});
const data = await res.json();
console.log(data.text);
