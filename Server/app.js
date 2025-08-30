import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import router from "./Controller/Data.js";

dotenv.config({ path: "./.env" });

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: false
}));

app.use(express.json());

app.use("/api", router);

mongoose
  .connect(process.env.MONGO_URI, { dbName: "ocr" })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(3006, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));
