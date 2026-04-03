const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Clés API
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.get('/ping', (req, res) => res.send('ok'));

app.post('/ask', async (req, res) => {
    const { message, model } = req.body;
    console.log(`Requête reçue pour le modèle: ${model}, message: ${message}`);

    if (!message) {
        return res.status(400).send("Message manquant");
    }

    let responseText = null;
    let errorMsg = null;

    try {
        if (model === 'groq' || !model) {
            if (!GROQ_API_KEY) throw new Error("Clé Groq manquante");
            const resp = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: message }],
                temperature: 0.7,
                max_tokens: 200
            }, {
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }
            });
            responseText = resp.data.choices[0].message.content;
        }
        else if (model === 'gemini_flash' || model === 'gemini_pro') {
            if (!GEMINI_API_KEY) throw new Error("Clé Gemini manquante");
            const geminiModel = (model === 'gemini_flash') ? 'gemini-1.5-flash' : 'gemini-1.5-pro';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`;
            const resp = await axios.post(url, {
                contents: [{ parts: [{ text: `Réponds de manière courte et directe, sans formules de politesse. Question: ${message}` }] }]
            }, { headers: { 'Content-Type': 'application/json' } });
            responseText = resp.data.candidates[0].content.parts[0].text;
        }
        else if (model === 'claude' || model === 'gpt4o' || model === 'chatgpt35') {
            if (!OPENROUTER_API_KEY) throw new Error("Clé OpenRouter manquante");
            let openrouterModel = '';
            if (model === 'claude') openrouterModel = 'anthropic/claude-3-haiku';
            else if (model === 'gpt4o') openrouterModel = 'openai/gpt-4o-mini';
            else openrouterModel = 'openai/gpt-3.5-turbo';
            const resp = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: openrouterModel,
                messages: [{ role: 'user', content: message }],
                temperature: 0.7,
                max_tokens: 200
            }, {
                headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' }
            });
            responseText = resp.data.choices[0].message.content;
        }
        else {
            throw new Error(`Modèle inconnu: ${model}`);
        }

        console.log(`Réponse: ${responseText}`);
        res.send(responseText);
    } catch (error) {
        console.error("Erreur API:", error.response?.data || error.message);
        res.status(500).send(`Erreur technique: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Groq: ${GROQ_API_KEY ? 'OK' : 'MANQUANT'}`);
    console.log(`Gemini: ${GEMINI_API_KEY ? 'OK' : 'MANQUANT'}`);
    console.log(`OpenRouter: ${OPENROUTER_API_KEY ? 'OK' : 'MANQUANT'}`);
});
