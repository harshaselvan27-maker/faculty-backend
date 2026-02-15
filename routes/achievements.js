import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import Achievement from "../models/Achievement.js";

const router = express.Router();

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

/* ================= GET FILE ================= */
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
    res.status(500).json({ error: err.message });
  }
});

/* ================= CREATE ================= */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "File required" });

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
    res.status(500).json({ error: err.message });
  }
});

/* ================= UPDATE ================= */
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement)
      return res.status(404).json({ message: "Not found" });

    let fileId = achievement.fileId;
    let filename = achievement.filename;

    if (req.file) {
      const bucket = getBucket();

      await bucket.delete(achievement.fileId);

      const uploadStream = bucket.openUploadStream(
        req.file.originalname,
        { contentType: req.file.mimetype }
      );

      uploadStream.end(req.file.buffer);

      fileId = uploadStream.id;
      filename = req.file.originalname;
    }

    achievement.title = req.body.title;
    achievement.description = req.body.description;
    achievement.date = req.body.date;
    achievement.fileId = fileId;
    achievement.filename = filename;

    await achievement.save();

    res.json({ success: true, achievement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= DELETE ================= */
router.delete("/:id", async (req, res) => {
  try {
    const ach = await Achievement.findById(req.params.id);
    if (!ach) return res.json({ success: true });

    const bucket = getBucket();
    await bucket.delete(ach.fileId);
    await Achievement.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
