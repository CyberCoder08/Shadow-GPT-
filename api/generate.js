export default async function handler(req, res) {
  const prompt = req.body.prompt;

  const hfRes = await fetch("https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: prompt })
  });

  const data = await hfRes.json();
  res.status(200).json(data);
}
