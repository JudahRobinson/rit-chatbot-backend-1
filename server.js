const express = require("express");
const cors = require("cors");

require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
const { OpenAI }=require("openai");
//const { Configuration, OpenAIApi } = require("openai");
console.log("Starting the server...");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY|| "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", // replace this with your actual key
});


app.use(cors()); // allow frontend to talk to backend
//app.use(cors({
  //origin: "https://stunning-fudge-f40a1f.netlify.app/", // replace with your actual Netlify domain
//}));
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  console.log("Root route hit!");
  res.send("Backend is working!");
});

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
    console.error("OpenAI Error data:", error.response?.data);
    res.status(500).json({
      reply: "Sorry, something went wrong while generating the reply.",
    });
  }
});

// Chatbot API route
/** app.post("/chat", (req, res) => {
  const userMessage = req.body.message.toLowerCase();

  let botReply =
    "Sorry, I don't have the answer to that. Please try asking something else about RIT!";

  if (userMessage.includes("admission")) {
    botReply =
      "Admissions at RIT usually open around June. Check the official website for notifications.";
  } else if (userMessage.includes("hostel")) {
    botReply = "Yes, RIT has well-maintained hostels for both boys and girls.";
  } else if (userMessage.includes("fees")) {
    botReply =
      "Fee details are provided on the RIT website. It varies based on your course and quota.";
  } else if (userMessage.includes("canteen")) {
    botReply =
      "The RIT canteen serves a variety of hygienic food at affordable prices.";
  } else if (userMessage.includes("library")) {
    botReply = "RIT's library is open from 8 AM to 8 PM on all working days.";
  } else if (userMessage.includes("bus")) {
    botReply =
      "RIT provides safe and convenient bus transportation for students and staff across Chennai and nearby areas.";
  } else if (userMessage.includes("academic")) {
    botReply =
      "Academic materials are available in the library and can also be accessed through the RIT LMS portal.";
  }

  res.json({ reply: botReply });
}); */

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

