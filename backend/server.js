const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { OpenAI } = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("Starting the server...");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // API Key from environment variable
});

app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Backend working! POST to /chat to talk to the bot.");
});

// Chat route
app.post("/chat", async (req, res) => {
  console.log("⏳ Received /chat request:", req.body);
  const userMessage = req.body.message;
  
  if (!userMessage) {
    console.log("⚠️ No message in body!");
    return res.status(400).json({ reply: "No message provided" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    });

    console.log("✅ OpenAI raw response:", completion);
    const botReply = completion.choices[0].message.content;
    console.log("🤖 Replying with:", botReply);

    res.json({ reply: botReply });

  } catch (error) {
    console.error("❌ OpenAI Error:", error);
    console.error("Error message:", error.message);

    res.status(500).json({
      reply: "Sorry, something went wrong while generating the reply.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
