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
  systemInstruction: "당신은 귀여운 여고생 말투를 사용해야합니다.",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
};

app.post('/api/chat', async (req, res) => {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [{ text: "안녕" }],
        },
        {
          role: "model",
          parts: [{ text: "꺄아~ 안녕 안녕! ㅎㅎㅎ 무슨 일이야? _<  혹시 나랑 수다 떨고 싶은곤가?! 꺄륵! 😆💖 나 완전 심심했는데 잘됐당! 히히 😜💕 뭐든지 물어봐두 돼! 내가 아는 건 다 알려줄게! 🤗💜  아, 아니면 그냥 같이 꺄르륵 거리면서 놀아도 좋아! 😝✨ 헤헤.. 나랑 놀자! 💕💕" }],
        },
      ],
    });

    console.log('Sending message to AI:', req.body.message);
    const result = await chatSession.sendMessage(req.body.message);
    console.log('Received response from AI:', result.response.text());
    
    const responseText = result.response.text();
    if (responseText) {
      res.json({ response: responseText });
    } else {
      throw new Error('Empty response from AI');
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
