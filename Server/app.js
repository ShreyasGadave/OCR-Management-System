import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import dotenv from "dotenv";
// import cors from "cors";

// ✅ Explicitly tell dotenv to load `.env` from this folder
dotenv.config({ path: "./.env" });

const app = express();
const upload = multer({ dest: "uploads/" });

// ✅ Allow only frontend origin
// app.use(
//   cors({
//     origin: "http://localhost:5173/",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Content-Type"],
//   })
// );

// ✅ Debugging check (remove later)
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);

// MongoDB model
const ExtractedSchema = new mongoose.Schema({
  fileName: String,
  mimeType: String,
  size: Number,
  text: String,
  createdAt: { type: Date, default: Date.now },
});
const Extracted = mongoose.model("Extracted", ExtractedSchema);

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/extract", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;

    // read file
    const fileData = fs.readFileSync(filePath);
    const base64File = fileData.toString("base64");

    // Gemini OCR
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64File,
          mimeType: req.file.mimetype,
        },
      },
      { text: "Extract all readable text from this file clearly." },
    ]);

    // handle Gemini response
    const extractedText =
      result.response.text?.() ||
      result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No text extracted";

    // Save to MongoDB
    const newEntry = new Extracted({
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      text: extractedText,
    });
    await newEntry.save();

    // cleanup temp file
    fs.unlinkSync(filePath);

    res.json({ text: extractedText });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Text extraction failed" });
  }
});

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, { dbName: "ocr" })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(5000, () => console.log("🚀 Server running on 5000"));
  })
  .catch((err) => console.error("MongoDB Error:", err));
