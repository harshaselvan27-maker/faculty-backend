import express from "express";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import mongoose from "mongoose";

const router = express.Router();

const mongoURI = "mongodb://localhost:27017/facultyDB";

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      filename: file.originalname,
      bucketName: "pdfs",
    };
  },
});

const upload = multer({ storage });

// ---------------------------
// Upload PDF
// ---------------------------
router.post("/upload", upload.single("file"), (req, res) => {
  console.log("Uploaded:", req.file);

  res.json({
    success: true,
    fileId: req.file.id,
    message: "PDF uploaded successfully",
  });
});

// ---------------------------
// View All Uploaded PDFs
// ---------------------------
router.get("/list", async (req, res) => {
  const cursor = mongoose.connection.db.collection("pdfs.files").find({});
  const files = await cursor.toArray();
  res.json(files);
});

export default router;
