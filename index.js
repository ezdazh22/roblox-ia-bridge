const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

app.post('/ask', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).send("Message manquant");
    }

    try {
        const prompt = `Tu es un assistant. Réponds uniquement par la réponse directe, sans aucune phrase d'introduction, sans politesse, sans retour à la ligne inutile. Question : ${userMessage} Réponse :`;

        const response = await axios.post(GEMINI_URL, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        const aiResponse = response.data.candidates[0].content.parts[0].text;
        res.send(aiResponse);
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).send("Erreur IA");
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
