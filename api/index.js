const express = require("express");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-exp-0827",
  systemInstruction: "당신은 웹사이트 관리자입니다.", // "홈페이지 관리자" -> "웹사이트 관리자"로 변경
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
};

app.post('/api/chat', async (req, res) => { // = -> => 로 변경
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: req.body.history.map(msg => ({ // = -> => 로 변경
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    console.log('Sending message to AI:', req.body.message);
    const result = await chatSession.sendMessage(req.body.message);
    console.log('Received response from AI:', result.response.text());
    
    const responseText = result.response.text();
    if (responseText) {
      res.json({ response: responseText });
    } else {
      throw new Error('AI로부터 빈 응답을 받았습니다.'); // "Empty response from AI" -> "AI로부터 빈 응답을 받았습니다."로 변경
    }
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.get("*", (req, res) => { // = -> => 로 변경
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = app;