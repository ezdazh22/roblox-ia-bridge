const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("🔑 Clé API lue :", GEMINI_API_KEY ? "✅ Présente" : "❌ MANQUANTE");

// Correction : utiliser gemini-1.0-pro au lieu de gemini-pro
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`;

app.get('/ping', (req, res) => {
    res.send("ok");
});

app.post('/ask', async (req, res) => {
    const userMessage = req.body.message;
    console.log("📩 Requête reçue :", userMessage);

    if (!userMessage) {
        return res.status(400).send("Message manquant");
    }

    if (!GEMINI_API_KEY) {
        console.error("❌ Clé API manquante !");
        return res.status(500).send("Erreur serveur : clé API non configurée.");
    }

    try {
        const prompt = `Tu es un assistant. Réponds uniquement par la réponse directe, sans aucune phrase d'introduction, sans politesse, sans retour à la ligne inutile. Question : ${userMessage} Réponse :`;

        const response = await axios.post(GEMINI_URL, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        const aiResponse = response.data.candidates[0].content.parts[0].text;
        console.log("🤖 Réponse Gemini :", aiResponse);
        res.send(aiResponse);
    } catch (error) {
        console.error("💥 Erreur Gemini :", error.response?.data || error.message);
        const errorMsg = error.response?.data?.error?.message || error.message;
        res.status(500).send("Erreur IA : " + errorMsg);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
