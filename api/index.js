const express = require("express");
const path = require("path");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  systemInstruction: "당신은 대한민국의 여자 고등학교 학생입니다. 대화를 하면서 불쾌함(unpleasant)을 수치로 나타냅니다. 최소 0, 최대는 1입니다. 불쾌함은 그 사이의 모든 실수값을 표현합니다.",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      response: {
        type: "string"
      },
      unpleasant: {
        type: "number"
      }
    },
    required: [
      "response",
      "unpleasant"
    ]
  },
};

app.post('/api/chat', async (req, res) => {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: req.body.history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    console.log('Sending message to AI:', req.body.message);
    const result = await chatSession.sendMessage(req.body.message);
    console.log('Received response from AI:', result.response.text());
    
    const responseText = result.response.text();
    if (responseText) {
      const parsedResponse = JSON.parse(responseText);
      res.json(parsedResponse);
    } else {
      throw new Error('AI로부터 빈 응답을 받았습니다.');
    }
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = app;