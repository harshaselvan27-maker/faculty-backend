import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import Achievement from "../models/Achievement.js";

const router = express.Router();

/* ================= MULTER ================= */
const upload = multer({ storage: multer.memoryStorage() });

/* ================= GRIDFS ================= */
const getBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB not connected");
  }

  return new GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
};

/* ================= GET ALL ================= */
router.get("/", async (req, res) => {
  const list = await Achievement.find().sort({ createdAt: -1 });
  res.json(list);
});

/* ================= VIEW FILE ================= */
router.get("/file/:id", async (req, res) => {
  try {
    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on("error", () => {
      return res.status(404).json({ error: "File not found" });
    });

    res.set("Content-Type", "application/pdf");
    downloadStream.pipe(res);

  } catch (err) {
    res.status(500).json({ error: "File load failed" });
  }
});

/* ================= CREATE ================= */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false });
    }

    const bucket = getBucket();

    const uploadStream = bucket.openUploadStream(
      req.file.originalname,
      { contentType: req.file.mimetype }
    );

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", async () => {
      const achievement = await Achievement.create({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        fileId: uploadStream.id,
        filename: req.file.originalname,
      });

      res.json({ success: true, achievement });
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ================= UPDATE ================= */
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const ach = await Achievement.findById(req.params.id);
    if (!ach) return res.json({ success: false });

    let fileId = ach.fileId;
    let filename = ach.filename;

    // If new file uploaded → replace old one
    if (req.file) {
      const bucket = getBucket();

      await bucket.delete(ach.fileId);

      const uploadStream = bucket.openUploadStream(
        req.file.originalname,
        { contentType: req.file.mimetype }
      );

      uploadStream.end(req.file.buffer);

      await new Promise((resolve) => {
        uploadStream.on("finish", resolve);
      });

      fileId = uploadStream.id;
      filename = req.file.originalname;
    }

    const updated = await Achievement.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        fileId,
        filename,
      },
      { new: true }
    );

    res.json({ success: true, achievement: updated });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});
/* ================= VIEW CERTIFICATE ================= */
router.get("/file/:id", async (req, res) => {
  try {
    const bucket = getBucket();

    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on("error", () => {
      res.status(404).json({ error: "File not found" });
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error("FILE VIEW ERROR:", err.message);
    res.status(500).json({ error: "File error" });
  }
});

/* ================= DELETE ================= */
router.delete("/:id", async (req, res) => {
  const ach = await Achievement.findById(req.params.id);
  if (!ach) return res.json({ success: true });

  const bucket = getBucket();
  await bucket.delete(ach.fileId);
  await Achievement.findByIdAndDelete(req.params.id);

  res.json({ success: true });
});

export default router;
