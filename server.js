const bodyParser = require("body-parser");
const express = require("express");
require("dotenv").config();
const cors = require("cors");

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));


const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

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


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


app.post("/api/transcribe", upload.single("audioData"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file provided." });
  }

  const filePath = req.file.path;

  try {
    console.log("Processing transcription for file:", filePath);

    const audioBuffer = await fs.promises.readFile(filePath);
    const audioBase64 = audioBuffer.toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: audioBase64,
          mimeType: req.file.mimetype,
        },
      },
      "Please transcribe this audio file and return only the spoken text.",
    ]);

                  const transcription = result.response.text();
    console.log("Transcription successful:", transcription);

    res.json({ text: transcription });
  } catch (error) {
                      console.error("Error in transcription:", error);
    res.status(500).json({
      error: "Error in transcription",
      details: error.message,
    });
  }          finally {
  
                      fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });
  }
});


            app.post("/api/answer", async (req, res) => {
                    try {
                   const { prompt } = req.body;
                        if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ response: "Prompt is required" });
          }

    console.log("Generating answer with Gemini for prompt:", prompt);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `Your name is Eragon, a helpful AI assistant. 
    Provide accurate, informative responses to user questions across all topics and domains. Be conversational and natural in your responses.
    don't use **. return structured text if possible, use integer instead of * for listing. `;

    const fullPrompt = `${systemPrompt}\n\nUser Question: ${prompt}\n\nProvide a direct, natural response.`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    console.log("Raw Gemini response:", responseText);

    const cleanedResponse = responseText?.trim() || "No response available";

    res.json({ answer: cleanedResponse });
  } 
            catch (error) {
                 console.error("Error in answer generation:", error);
           res.json({
               answer:
                    "I apologize for the technical difficulty. I'm here to discuss my qualifications.",
    });
  }
});


app.post("/api/tts", async (req, res) => {
              const { text } = req.body;
  if (!text)    {
            return res.status(400).json({ message: "No text provided" });
  }
            res.json({
     message: "Text ready for speech synthesis",
           text: text,
         useBrowserTTS: true,
  });
});

          app.get("/health", (req, res) => {
  res.status(200).json({
                 status: "healthy",
              timeStamp: new Date().toISOString(),
         uptime: process.uptime(),
           memory: {
               used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
       total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
    },
    service: "Edge AI Transcription Server",
  });
});


                app.listen(port, () => {
                                 console.log(`Server running on http://localhost:${port}`); });
