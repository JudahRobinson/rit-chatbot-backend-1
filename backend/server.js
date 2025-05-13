const { exec } = require("child_process");
const path = require("path");

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("Starting the server...");

const OPENAI_KEY = process.env.OPENAI_KEY;
console.log("OPENAI_KEY...", OPENAI_KEY);

app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Backend working! POST to /chat to talk to the bot.");
});

// 1️⃣ Static keyword-based replies
function getCustomReply(msg) {
  const text = msg.toLowerCase();
  if (text.includes("admission")) {
    return `📌 Admissions at RIT usually begin in June. 

    📘 Admission Details:

    For B.E./B.Tech, candidates must pass Class 12 with at least 50%.
    
    Admission is through TNEA counselling.
    
    Fill preferences and submit documents after seat allotment.
    
    Visit: https://www.ritchennai.org for official updates.`;
  }

  if (text.includes("hostel")) {
    return `🏨 Hostel Facilities:\n

    Separate hostels for boys and girls.\n
    
    Modern amenities, study halls, WiFi, 24/7 medical support.\n
    
    Final year & PG students get single rooms.\n
    
    Fee: ₹60,000–₹80,000/year (excluding mess).`;
  }

  if (text.includes("fees") || text.includes("fee")) {
    return "💰 Fee structure varies by course. See https://www.ritchennai.org/admissions/fee-structure/";
  }
  if (text.includes("canteen")) {
    return `🍽️ RIT Canteen Menu (Short View):

      🥐 BAKERY
      - Veg Puffs - ₹15
      - Egg Puffs - ₹20
      - Brownie Cake - ₹35
      - Bread Packet - ₹45
      - Birthday Cake (½kg) - ₹350

      🍹 JUICES
      - Lemon Juice - ₹20
      - Watermelon Juice - ₹30
      - Apple Milk Shake - ₹50
      - Buttermilk - ₹10

      🍦 ICE CREAM
      - Cone Ice Cream - ₹40
      - Mango Stick - ₹30
      - Chocobar - ₹30

      🌐 For full menu vist, visit: https://trialtrialfood.ccbp.tech/`;
  }
  if (text.includes("library")) {
    return `📚 The library is open to the students and staff members from 8.00 a.m. to 5.00 p.m. on all working days and on Saturdays from 10.00 a.m. to 2.00 p.m
   
    The library has a rich collection of 18328 volumes of textbooks and reference books in all branches of Engineering, Science, Technology, Management and General studies and the collection is ever increasing.
    
    The books are classified according to the Dewey decimal classification system.`;
  }

  if (text.includes("where is library")) {
    return "The library of RIT College is inside of RSB Business school 2nd floor last class (Latest update)";
  }

  if (text.includes("bus") || text.includes("transport")) {
    return `🚌 RIT Bus Details:\n Multiple routes across Chennai are available for student convenience.
    \n Track routes here: https://www.rittransport.com/routeDetails.php`;
  }
  
  if (text.includes("location") || text.includes("area")) {
    return "📍 RIT is located in Thandalam (off Poonamallee–Chengalpattu Highway), Chennai.";
  }

  if (
    text.includes("acre") ||
    text.includes("how much acre") ||
    text.includes("how much area")
  ) {
    return "📏 RIT spans an area of approximately 15 acres.";
  }

  if (/(hi|hello|hey)/.test(text)) {
    return "👋 Hi there! How can I assist you regarding RIT?";
  }
  if (text.includes("academic")) {
    return `📖 Academic Materials:\n
     Available at RIT Library and LMS (IMS Portal).\n 
     RIT also supports Moodle: http://182.74.17.142/moodle/login/index.php`;
  }
  return null;
}

app.post("/chat", async (req, res) => {
  const userMessage = (req.body.message || "").trim();
  console.log("userMessage", userMessage);
  if (!userMessage) {
    return res.json({ reply: "🤖 Please say something." });
  }

  // 2a. Try a static reply first
  const staticReply = getCustomReply(userMessage);
  console.log("staticReply", staticReply);
  if (staticReply) {
    return res.json({ reply: staticReply });
  }

  // Dynamic fallback using OpenAI
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.7,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiReply = response.data.choices[0].message.content.trim();
    return res.json({ reply: aiReply });
  } catch (err) {
    console.error("❌ OpenAI API error:", err.message);
    return res.json({
      reply: "⚠️ Sorry, I'm having trouble right now. Please try again later.",
    });
  }

  // 2d. If all else fails:
  // res.json({
  //   reply:
  //     "😓 Oops, something went wrong on my end. Please try again or ask something else.",
  // });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
