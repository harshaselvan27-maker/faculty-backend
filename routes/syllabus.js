import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

const router = express.Router();

console.log("✅ syllabus routes loaded");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});


/* ===============================
   GET GRIDFS BUCKET
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
   UPLOAD
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
      {
        contentType: req.file.mimetype,
      }
    );

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.json({
        success: true,
        fileId: uploadStream.id,
        filename: req.file.originalname,
      });
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
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
    res.status(500).json({ success: false });
  }
});

/* ===============================
   VIEW FILE
=============================== */
router.get("/pdf/:id", async (req, res) => {
  try {
    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    res.set("Content-Type", "application/pdf");

    bucket.openDownloadStream(fileId).pipe(res);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ===============================
   DELETE FILE
=============================== */
router.post("/delete/:id", async (req, res) => {
  try {
    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    await bucket.delete(fileId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;
