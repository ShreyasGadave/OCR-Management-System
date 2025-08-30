import express from "express";
import OCRDocument from "../Model/OCRDocument.js";

const router = express.Router();

router.post("/data", async (req, res) => {
  try {
    const { document_type, data } = req.body;
    if (!document_type || !data) {
      return res.status(400).json({ message: "document_type and data are required" });
    }
    const newDoc = new OCRDocument({ document_type, data });
    await newDoc.save();
    res.status(201).json({ message: "Document saved successfully", document: newDoc });
  } catch (error) {
    console.error("Error saving document:", error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
