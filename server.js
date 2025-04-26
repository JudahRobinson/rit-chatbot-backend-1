const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { OpenAI } = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // ✅ KEY SAFE
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ reply: "No message provided" });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    });
    const botReply = completion.choices[0].message.content;
    res.json({ reply: botReply });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});
