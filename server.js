import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* ================= CONFIG ================= */
dotenv.config();
const app = express();

/* ================= FIX FOR __dirname (ESM) ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= CORS ================= */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

/* ================= BODY LIMITS ================= */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ================= ENSURE UPLOADS FOLDER ================= */
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/* ================= STATIC FILES ================= */
app.use("/uploads", express.static(uploadPath));

/* ================= DATABASE ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

/* ================= IMPORT ROUTES ================= */
import authRoutes from "./routes/auth.js";
import todoRoutes from "./routes/todo.js";
import leaveRoutes from "./routes/leave.js";
import achievementRoutes from "./routes/achievements.js";
import syllabusRoutes from "./routes/syllabus.js";
import classRoutes from "./routes/class.js";
import notesRoutes from "./routes/notes.js";


/* ================= IMPORT MODELS ================= */
import ClassModel from "./models/Class.js";
import StudentModel from "./models/Student.js";

/* ================= HEALTH ================= */
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Faculty Backend Running 🚀",
  });
});

/* ================= ROUTES ================= */
app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);
app.use("/leave", leaveRoutes);
app.use("/achievements", achievementRoutes);
app.use("/syllabus", syllabusRoutes);
app.use("/class", classRoutes);
app.use("/notes", notesRoutes);

/* ===========================================================
   ================= STUDENT CRUD =============================
   =========================================================== */

/* GET STUDENTS BY CLASS */
app.get("/student/:classId", async (req, res) => {
  try {
    const students = await StudentModel.find({
      classId: req.params.classId,
    });
    res.json(students);
  } catch (err) {
    console.error("GET STUDENTS ERROR:", err.message);
    res.status(500).json([]);
  }
});

/* ADD STUDENT */
app.post("/student", async (req, res) => {
  try {
    const student = await StudentModel.create(req.body);
    res.json(student);
  } catch (err) {
    console.error("ADD STUDENT ERROR:", err.message);
    res.status(500).json({});
  }
});

/* UPDATE STUDENT */
app.put("/student/:id", async (req, res) => {
  try {
    const updated = await StudentModel.findByIdAndUpdate(
      req.params.id,
      { data: req.body },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("UPDATE STUDENT ERROR:", err.message);
    res.status(500).json({});
  }
});

/* DELETE STUDENT */
app.delete("/student/:id", async (req, res) => {
  try {
    await StudentModel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE STUDENT ERROR:", err.message);
    res.status(500).json({ success: false });
  }
});

/* ===========================================================
   ================= EXPORT TO EXCEL ==========================
   =========================================================== */

app.get("/class/:classId/export", async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.classId);
    if (!cls) {
      return res.status(404).json({ error: "Class not found" });
    }

    const students = await StudentModel.find({
      classId: req.params.classId,
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Students");

    sheet.columns = cls.columns.map((col) => ({
      header: col.toUpperCase(),
      key: col,
      width: 20,
    }));

    students.forEach((student) => {
      sheet.addRow(student.data);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=students.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("EXCEL ERROR:", err.message);
    res.status(500).json({ error: "Excel export failed" });
  }
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("🔥 UNHANDLED ERROR:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Server error",
  });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
