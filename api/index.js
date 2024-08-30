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
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
};

app.post('/api/chat', async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    // 전체 대화 내용을 하나의 문자열로 만듭니다.
    const fullConversation = chatHistory
      .map(msg => `${msg.sender === 'user' ? '사용자' : 'AI'}: ${msg.content}`)
      .join('\n');

    // 시스템 지시사항과 전체 대화 내용을 포함하여 AI에 요청을 보냅니다.
    const prompt = `당신은 대한민국의 여자 고등학교 학생입니다. 대화를 하면서 불쾌함(unpleasant)을 수치로 나타냅니다. 최소 0, 최대는 1입니다. 불쾌함은 그 사이의 모든 실수값을 표현합니다. 두개의 중괄호를 씁니다. 첫번째 중괄호는 대화의 내용을 씁니다. 두번째 중괄호는 불쾌감을 표현합니다. 예시: {그게 무슨 말이죠?}{0.2}

다음은 지금까지의 대화 내용입니다:

${fullConversation}

사용자: ${message}

이제 다음 응답을 해주세요. 응답 형식을 꼭 지켜주세요.`;

    console.log('Sending message to AI:', prompt);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log('Received response from AI:', responseText);

    if (responseText) {
      const matches = responseText.match(/\{([^}]+)\}\{([^}]+)\}/);
      if (matches && matches.length === 3) {
        const response = matches[1].trim();
        const unpleasant = parseFloat(matches[2]);

        res.json({ response, unpleasant });
      } else {
        throw new Error('응답 형식이 올바르지 않습니다.');
      }
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