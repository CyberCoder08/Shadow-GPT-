const { Wit } = require('node-wit');

const client = new Wit({ accessToken: process.env.WIT_AI_TOKEN });

module.exports = async (req, res) => {
  try {
    const text = req.query.text || 'hello';
    const data = await client.message(text);
    res.status(200).json({ wit: data });
  } catch (err) {
    res.status(500).json({ error: 'Wit.ai error', details: err.message });
  }
};
