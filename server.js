// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import { GridFSBucket } from "mongodb";

// ROUTES
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import leaveRoutes from "./routes/leave.js";
import syllabusRoutes from "./routes/syllabus.js";

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   MONGODB CONNECTION (ATLAS)
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => console.error("MongoDB Error:", err));

const conn = mongoose.connection;

let bucket;
conn.once("open", () => {
  bucket = new GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  console.log("GridFS Bucket Ready ✔");
});

/* =========================
   MULTER (PDF MEMORY STORAGE)
========================= */
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* =========================
   BASIC TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Faculty Backend Running 🚀");
});

/* =========================
   AUTH ROUTES
========================= */
app.use("/auth", authRoutes);

/* =========================
   PROFILE ROUTES
========================= */
app.use("/profile", profileRoutes);

/* =========================
   LEAVE ROUTES
========================= */
app.use("/leave", leaveRoutes);

/* =========================
   SYLLABUS ROUTES (PDF)
========================= */

// UPLOAD PDF
app.post("/syllabus/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: "application/pdf",
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.json({
        success: true,
        message: "PDF uploaded successfully",
        fileId: uploadStream.id,
      });
    });

    uploadStream.on("error", () => {
      res.status(500).json({ success: false, message: "Upload failed" });
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LIST PDFs
app.get("/syllabus/list", async (req, res) => {
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

// OPEN PDF (PHONE PDF VIEWER)
app.get("/syllabus/pdf/:id", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    const file = await conn.db
      .collection("uploads.files")
      .findOne({ _id: fileId });

    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid file ID" });
  }
});

// DELETE PDF
app.delete("/syllabus/delete/:id", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    await bucket.delete(fileId);

    res.json({ success: true, message: "PDF deleted" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================
   START SERVER (RENDER SAFE)
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
