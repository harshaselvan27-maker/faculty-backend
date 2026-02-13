import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const router = express.Router();

console.log("✅ syllabus routes loaded");

/* ================= STORAGE ================= */
const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* ================= UPLOAD ================= */
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    res.json({
      success: true,
      file: {
        id: req.file.filename,
        filename: req.file.filename,
        uploadDate: new Date(),
      },
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);
    res.status(500).json({ success: false });
  }
});

/* ================= LIST FILES ================= */
router.get("/list", (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir).map((file) => ({
      _id: file,
      filename: file,
      uploadDate: fs.statSync(path.join(uploadDir, file)).mtime,
    }));

    res.json({ success: true, files });
  } catch (err) {
    console.error("LIST ERROR:", err.message);
    res.status(500).json({ success: false });
  }
});

/* ================= VIEW FILE ================= */
router.get("/pdf/:id", (req, res) => {
  const filePath = path.join(uploadDir, req.params.id);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false });
  }

  res.sendFile(path.resolve(filePath));
});

/* ================= DELETE FILE ================= */
router.post("/delete/:id", (req, res) => {
  try {
    const filePath = path.join(uploadDir, req.params.id);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err.message);
    res.status(500).json({ success: false });
  }
});

export default router;
