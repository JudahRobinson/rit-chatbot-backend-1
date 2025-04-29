const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("Starting the server...");

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
console.log("HUGGINGFACE_API_KEY:", HUGGINGFACE_API_KEY);

app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Backend working! POST to /chat to talk to the bot.");
});

// Chat route
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message?.toLowerCase() || "";

  // ✅ Use Hugging Face fallback
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      { inputs: userMessage },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
      }
    );

    const botReply = Array.isArray(response.data)
      ? response.data[0]?.generated_text
      : response.data?.generated_text;

    res.json({ reply: botReply || "Sorry, no response from model." });
  } catch (error) {
    console.error("❌ Hugging Face Error:", error.message);
    res.status(500).json({
      reply: "Sorry, something went wrong while generating the reply.",
    });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
