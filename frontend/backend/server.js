const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors()); // allow frontend to talk to backend
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// Chatbot API route
app.post("/chat", (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

