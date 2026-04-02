const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
console.log("🔑 Clé Groq :", GROQ_API_KEY ? "✅ Présente" : "❌ MANQUANTE");

app.get('/ping', (req, res) => {
    res.send("ok");
});

app.post('/ask', async (req, res) => {
    const userMessage = req.body.message;
    console.log("📩 Requête reçue :", userMessage);

    if (!userMessage) {
        return res.status(400).send("Message manquant");
    }
    if (!GROQ_API_KEY) {
        console.error("❌ Clé Groq manquante !");
        return res.status(500).send("Erreur serveur : clé API non configurée.");
    }

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: userMessage }],
                temperature: 0.7,
                max_tokens: 200,
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        let aiResponse = response.data.choices[0].message.content;
        aiResponse = aiResponse.trim();
        console.log("🤖 Réponse Groq :", aiResponse);
        res.send(aiResponse);
    } catch (error) {
        console.error("💥 Erreur Groq :", error.response?.data || error.message);
        if (error.response?.status === 429) {
            res.status(429).send("Trop de requêtes, réessaie dans quelques secondes.");
        } else {
            res.status(500).send("Erreur IA : " + (error.response?.data?.error?.message || error.message));
        }
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
