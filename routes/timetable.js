import express from "express";
import multer from "multer";
import fs from "fs";

const router = express.Router();

/* ================= STORAGE ================= */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ================= IN-MEMORY LIST (TEMP) ================= */
let timetableFiles = [];

/* ================= UPLOAD ================= */
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    const fileData = {
      id: Date.now().toString(),
      filename: req.file.filename,
    };

    timetableFiles.push(fileData);

    res.json({
      success: true,
      message: "Timetable uploaded",
      file: fileData,
    });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

/* ================= LIST ================= */
router.get("/list", (req, res) => {
  res.json({ list: timetableFiles });
});

/* ================= DELETE ================= */
router.delete("/delete/:id", (req, res) => {
  try {
    const file = timetableFiles.find(
      (f) => f.id === req.params.id
    );

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // delete file from uploads folder
    fs.unlinkSync(`uploads/${file.filename}`);

    timetableFiles = timetableFiles.filter(
      (f) => f.id !== req.params.id
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
