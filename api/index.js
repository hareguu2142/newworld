const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();

console.log("몽고아틀라스 주소: ", process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("데이터베이스 연결 성공 !!"))
  .catch(e => console.log(`데이터베이스 연결 실패 ${e}`));

// API 라우트
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the API!" });
});

// 다른 모든 요청은 정적 파일 서빙으로 처리
app.use(express.static(path.join(__dirname, '../public')));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = app;