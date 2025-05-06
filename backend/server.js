const { exec } = require("child_process");
const path = require("path");

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("Starting the server...");

const HF_KEY = process.env.HUGGINGFACE_API_KEY;
console.log("HUGGINGFACE_API_KEY:.....", HF_KEY);

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
    return "📌 Admissions at RIT usually begin in June. Visit https://www.ritchennai.org for updates.";
  }
  if (text.includes("hostel")) {
    return "🏠 RIT provides separate hostels for boys and girls with mess, Wi‑Fi and 24/7 security.";
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
    return "📚 The library is open 8 AM–8 PM on weekdays with digital resources & study spaces.";
  }
  if (text.includes("bus") || text.includes("transport")) {
    return "🚌 RIT runs buses across Chennai. See routes at https://www.ritchennai.org/transport/";
  }
  if (text.includes("location") || text.includes("area")) {
    return "📍 RIT is located in Thandalam (off Poonamallee–Chengalpattu Highway), Chennai.";
  }
  if (/(hi|hello|hey)/.test(text)) {
    return "👋 Hi there! How can I assist you regarding RIT?";
  }
  if (text.includes("academic")) {
    return "📖 Academic materials are provided by faculty and also available on the student portal";
  }
  return null;
}

app.post("/chat", async (req, res) => {
  const userMessage = (req.body.message || "").trim();
  console.log("userMessage",userMessage)
  if (!userMessage) {
    return res.json({ reply: "🤖 Please say something." });
  }

  // 2a. Try a static reply first
  const staticReply = getCustomReply(userMessage);
  console.log("staticReply",staticReply)
  if (staticReply) {
    return res.json({ reply: staticReply });
  }

  // 2b. Otherwise, call your local Python DialoGPT script
  const script = path.join(__dirname, "local-model", "chatbot_local.py");
  const safeMsg = userMessage.replace(/"/g, '\\"');
  const cmd = `python3 "${script}" "${safeMsg}"`;

  exec(cmd, (err, stdout, stderr) => {
    console.log("🐍 python err:", err);
    console.log("🐍 python stderr:", stderr);
    console.log("🐍 python stdout:", stdout);
    if (!err && stdout) {
      // strip off newlines, return the model’s output
      return res.json({ reply: stdout.trim() });
    }

    console.error("❌ Local Python failed:", err || stderr);

    // 2c. (Optional) Fallback to Hugging Face Inference API
    if (HF_KEY) {
      return axios
        .post(
          "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
          { inputs: userMessage },
          { headers: { Authorization: `Bearer ${HF_KEY}` } }
        )
        .then((hf) => {
          const reply =
            hf.data?.generated_text ||
            hf.data?.[0]?.generated_text ||
            "🤖 No reply from cloud model.";
          res.json({ reply });
        })
        .catch((e) => {
          console.error("🔥 HF fallback failed:", e.message);
          res.json({
            reply:
              "⚠️ Sorry, I'm having trouble right now. Please try again later.",
          });
        });
    }

    // 2d. If all else fails:
    res.json({
      reply:
        "😓 Oops, something went wrong on my end. Please try again or ask something else.",
    });
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
