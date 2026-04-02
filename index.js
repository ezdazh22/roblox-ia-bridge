const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Lecture de la clé API depuis l'environnement
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("🔑 Clé API lue :", GEMINI_API_KEY ? "✅ Présente (commence par " + GEMINI_API_KEY.substring(0,10) + "...)" : "❌ MANQUANTE");

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// Route de ping pour UptimeRobot
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
