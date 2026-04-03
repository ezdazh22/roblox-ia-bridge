const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.get('/ping', (req, res) => {
    res.send('ok');
});

app.post('/ask', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).send('Message manquant');
    }

    try {
        const response = await axios.post(GROQ_URL, {
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: userMessage }],
            temperature: 0.7,
            max_tokens: 200
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiResponse = response.data.choices[0].message.content;
        res.send(aiResponse);
    } catch (error) {
        console.error('Erreur Groq:', error.response?.data || error.message);
        res.status(500).send('Erreur technique');
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
