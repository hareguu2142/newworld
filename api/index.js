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

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  safetySettings,
  systemInstruction: "user는 아래 npc와 대화를 합니다.\n\nnpc\n1. 이름: 김승현\n2. 나이: 14살\n3. 국적: 한국\n4. 성격: 친절합니다.\n5. 성별: 남성\n\nsetting\nsetting값을 줄 수 있습니다. 화면 밝기는 기본적으로 1이지만, 어둡게 만들 수 있습니다. 어두울때는 0이고, 밝기는 1과 0사이를 왔다갔다 합니다.\n\n예를 들어 화면 밝기와 관련된 요청이 들어오면 대화 뒤에 밝기:(0과 1사이 숫자)라고 아래에 적습니다.\n평소에는 적지 않습니다.",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

app.post('/api/chat', async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    const chatSession = model.startChat({
      generationConfig,
      history: chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    console.log('Received response from AI:', responseText);

    res.json({ response: responseText });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = app;