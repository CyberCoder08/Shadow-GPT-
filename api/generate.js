
export default async function handler(req, res) {
  const userPrompt = req.body.prompt;

  const testRes = await fetch("https://jsonplaceholder.typicode.com/posts/1");
  const data = await testRes.json();

  res.status(200).json({
    text: `Pretend GPT says: ${data.title}`
  });
}
