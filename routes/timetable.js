import express from "express";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res) => {
  try {
    res.json({
      success: true,
      message: "Timetable uploaded",
      file: req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
