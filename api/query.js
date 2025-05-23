const { Wit } = require('wit-ai/node-wit');

const client = new Wit({ accessToken: process.env.WIT_AI_TOKEN });

module.exports = async (req, res) => {
  try {
    const text = req.query.text || 'hello';
    const witRes = await client.message(text);
    res.status(200).json(witRes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
