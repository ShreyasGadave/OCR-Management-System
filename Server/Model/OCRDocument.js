import mongoose from "mongoose";

const OCRSchema = new mongoose.Schema(
  {
    document_type: { type: String, required: true }, // e.g., Certificate, Invoice, etc.
    data: { type: mongoose.Schema.Types.Mixed, required: true }, 
    // stores the extracted JSON (dynamic structure)
  },
  { timestamps: true }
);

export default mongoose.model("OCRDocument", OCRSchema);
