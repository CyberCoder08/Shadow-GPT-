require('dotenv').config();
const express = require('express');
const { Wit } = require('node-wit');

const app = express();
app.use(express.json());

const client = new Wit({ accessToken: process.env.WIT_AI_TOKEN });

app.get('/query', async (req, res) => {
  try {
    const text = req.query.text || 'hello';
    const response = await client.message(text);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Wit.ai error' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Shadow GPT running' });
});

app.listen(process.env.PORT || 3000, () => console.log('Server started'));
