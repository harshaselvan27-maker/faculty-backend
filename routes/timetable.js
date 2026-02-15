import express from "express";
import multer from "multer";
import fs from "fs";
import Timetable from "../models/Timetable.js";

const router = express.Router();

/* ================= STORAGE ================= */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ================= UPLOAD ================= */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const timetable = await Timetable.create({
      department: req.body.department,
      year: req.body.year,
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
    });

    res.json({ success: true, timetable });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

/* ================= LIST ================= */
router.get("/list", async (req, res) => {
  const list = await Timetable.find().sort({ createdAt: -1 });
  res.json({ list });
});

/* ================= DELETE ================= */
router.delete("/delete/:id", async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);

    if (!timetable)
      return res.status(404).json({ error: "Not found" });

    fs.unlinkSync("." + timetable.filePath);

    await Timetable.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ================= EDIT ================= */
router.put("/edit/:id", upload.single("file"), async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable)
      return res.status(404).json({ error: "Not found" });

    if (req.file) {
      fs.unlinkSync("." + timetable.filePath);
      timetable.fileName = req.file.filename;
      timetable.filePath = `/uploads/${req.file.filename}`;
    }

    timetable.department = req.body.department;
    timetable.year = req.body.year;

    await timetable.save();

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
});

export default router;
