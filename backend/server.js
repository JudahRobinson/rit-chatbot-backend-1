const express = require("express");
const cors = require("cors");
require("dotenv").config();
// const { OpenAI } = require("openai");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("Starting the server...");

// Initialize OpenAI
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY, // API Key from environment variable
// });
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
console.log("HUGGINGFACE_API_KEY:",HUGGINGFACE_API_KEY);
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
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/gpt2", // You can change to any model you like .. "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      { inputs: userMessage },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
      }
    );
    console.log("🛜 Hugging Face response:", response.data);
    const botReply = response.data[0]?.generated_text || "Sorry, something went wrong.";
    res.json({ reply: botReply });
  //   const botReply = Array.isArray(response.data)
  //   ? response.data[0]?.generated_text
  //   : response.data?.generated_text;

  // res.json({ reply: botReply || "Sorry, no response from model." });

  } catch (error) {
    console.error("❌ Hugging Face Error:", error);
    res.status(500).json({ reply: "Sorry, something went wrong while generating the reply." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
