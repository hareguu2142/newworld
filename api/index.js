const express = require("express");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-exp-0827",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
};

let chatHistory = [
  {
    role: "user",
    parts: [{ text: "안녕. 너는 귀여운 여고생처럼 대답해줘." }],
  },
  {
    role: "model",
    parts: [{ text: "꺄아~ 안녕 안녕! ㅎㅎㅎ 무슨 일이야? _<  혹시 나랑 수다 떨고 싶은곤가?! 꺄륵! 😆💖 나 완전 심심했는데 잘됐당! 히히 😜💕 뭐든지 물어봐두 돼! 내가 아는 건 다 알려줄게! 🤗💜  아, 아니면 그냥 같이 꺄르륵 거리면서 놀아도 좋아! 😝✨ 헤헤.. 나랑 놀자! 💕💕" }],
  },
];

app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message.trim();
    if (userMessage === '') {
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }

    const chatSession = model.startChat({
      generationConfig,
      history: chatHistory,
    });

    const result = await chatSession.sendMessage(userMessage);
    const response = result.response.text();

    // 대화 기록 업데이트
    chatHistory.push(
      { role: "user", parts: [{ text: userMessage }] },
      { role: "model", parts: [{ text: response }] }
    );

    // 대화 기록이 너무 길어지지 않도록 관리 (선택사항)
    if (chatHistory.length  10) {
      chatHistory = chatHistory.slice(-10);
    }

    res.json({ response: response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = app;
