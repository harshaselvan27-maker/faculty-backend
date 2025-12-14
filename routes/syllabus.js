import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

const router = express.Router();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Mongo connection
const conn = mongoose.connection;
let bucket;

conn.once("open", () => {
  bucket = new GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
});

// --------------------
// UPLOAD PDF
// --------------------
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.json({
        success: true,
        fileId: uploadStream.id,
        filename: req.file.originalname,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// --------------------
// LIST PDFs
// --------------------
router.get("/list", async (req, res) => {
  try {
    const files = await conn.db
      .collection("uploads.files")
      .find()
      .sort({ uploadDate: -1 })
      .toArray();

    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// --------------------
// VIEW PDF (PHONE PDF VIEWER)
// --------------------
router.get("/pdf/:id", (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = bucket.openDownloadStream(fileId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    downloadStream.pipe(res);
  } catch (err) {
    res.status(400).json({ success: false });
  }
});

// --------------------
// DELETE PDF
// --------------------
router.delete("/delete/:id", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    await bucket.delete(fileId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;
