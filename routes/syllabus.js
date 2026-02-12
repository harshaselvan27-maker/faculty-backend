import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

const router = express.Router();

console.log("✅ syllabus routes loaded");

/* ===============================
   MULTER CONFIG (🔥 FIXED)
=============================== */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});

/* ===============================
   SAFE GRIDFS BUCKET
=============================== */
const getBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB not connected");
  }

  return new GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
};

/* ===============================
   UPLOAD PDF
=============================== */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const bucket = getBucket();

    const uploadStream = bucket.openUploadStream(
      req.file.originalname,
      { contentType: req.file.mimetype }
    );

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.json({
        success: true,
        fileId: uploadStream.id,
        filename: req.file.originalname,
      });
    });

    uploadStream.on("error", (err) => {
      console.error("GridFS Upload Error:", err.message);
      res.status(500).json({ success: false, error: err.message });
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===============================
   LIST FILES
=============================== */
router.get("/list", async (req, res) => {
  try {
    const files = await mongoose.connection.db
      .collection("uploads.files")
      .find({})
      .sort({ uploadDate: -1 })
      .toArray();

    res.json({ success: true, files });
  } catch (err) {
    console.error("LIST ERROR:", err.message);
    res.status(500).json({ success: false });
  }
});

/* ===============================
   VIEW FILE
=============================== */
router.get("/pdf/:id", (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID",
      });
    }

    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    res.setHeader("Content-Type", "application/pdf");
    bucket.openDownloadStream(fileId).pipe(res);

  } catch (err) {
    console.error("VIEW ERROR:", err.message);
    res.status(500).json({ success: false });
  }
});

/* ===============================
   DELETE FILE
=============================== */
router.post("/delete/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID",
      });
    }

    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    await bucket.delete(fileId);

    res.json({ success: true });

  } catch (err) {
    console.error("DELETE ERROR:", err.message);
    res.status(500).json({ success: false });
  }
});

export default router;
