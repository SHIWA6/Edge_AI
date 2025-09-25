require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Ensure uploads dir exists
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

// 🎤 AUDIO TRANSCRIPTION
app.post("/api/transcribe", upload.single("AudioData"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file provided" });
  }

  const filePath = req.file.path;

  try {
    console.log("Processing transcription for file:", filePath);
    const audioBuffer = await fs.promises.readFile(filePath);
    const audioBase64 = audioBuffer.toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      {
        inlineData: {
          data: audioBase64,
          mimeType: req.file.mimetype,
        },
      },
      "Transcribe this audio file and return only the spoken text.",
    ]);

    const transcription = result.response.text();
    console.log("Transcription success:", transcription);
    res.json({ text: transcription });
  } catch (error) {
    console.error("Error in Transcription:", error);
    res.status(500).json({
      error: "Error in transcription",
      details: error.message,
    });
  } finally {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error while deleting file:", err);
    });
  }
});

// ❤️ HEALTH CHECK
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timeStamp: new Date().toISOString(), // ✅ fixed call
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
    },
    service: "Edge AI Transcription Server",
  });
});

// 🤖 GENERAL QnA
app.post("/api/answer", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("Generating Answer with Gemini for prompt:", prompt);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `Your name is John, a helpful AI assistant. 
Provide accurate and informative responses across all topics and domains. 
Be conversational and natural in your responses.`;

    const fullPrompt = `${systemPrompt}\n\nUser Question: ${prompt}\n\nProvide a direct, natural response.`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text(); // ✅ fixed (not express.response)

    console.log("Raw Gemini response:", responseText);

    if (!responseText || responseText.trim() === "") {
      throw new Error("No response from Gemini API");
    }

    let cleanedResponse = responseText.replace(/\\"/g, '"').trim();
    res.json({ response: cleanedResponse });
  } catch (error) {
    console.log("Details of error:", error);
    res.json({
      response:
        "I apologize for technical issues, but I'm here to assist with your query.",
    });
  }
});



app.post("/api/tts", async(req, res)=> {
  const {text} = req.body;

  if(!text) {
    return res.status(400).json({ message : " No text provided"});

  }

  res.json({
    message: " Text ready for speech synthesis"
    , text: text,
    useBrowserTTS : true,
  })
});


const Health_cheak_Interval = 4*60*1000;



// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
