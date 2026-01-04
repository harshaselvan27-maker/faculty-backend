import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import ExcelJS from "exceljs";
import fs from "fs";

// Routes
import todoRoutes from "./routes/todo.js";
import authRoutes from "./routes/auth.js";
import leaveRoutes from "./routes/leave.js";
import achievementRoutes from "./routes/achievements.js";
import syllabusRoutes from "./routes/syllabus.js";

// Models
import ClassModel from "./models/Class.js";
import StudentModel from "./models/Student.js";

dotenv.config();

const app = express();

/* ===================== ENSURE UPLOADS FOLDER ===================== */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

/* ===================== MIDDLEWARE ===================== */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* ===================== DATABASE ===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => {
    console.error("MongoDB Error:", err.message);
    process.exit(1);
  });

/* ===================== HEALTH CHECK (IMPORTANT) ===================== */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/* ===================== ROOT ===================== */
app.get("/", (req, res) => {
  res.json({ success: true, message: "Faculty Backend Running 🚀" });
});

/* ===================== ROUTES ===================== */
app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);
app.use("/leave", leaveRoutes);
app.use("/achievements", achievementRoutes);
app.use("/syllabus", syllabusRoutes);

/* ===================== STATIC FILES ===================== */
app.use("/uploads", express.static("uploads"));

/* ===================== STUDENTS ===================== */
app.post("/student", async (req, res) => {
  try {
    const student = await StudentModel.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===================== EXPORT TO EXCEL ===================== */
app.get("/class/:classId/export", async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.classId);
    if (!cls) return res.status(404).json({ error: "Class not found" });

    const students = await StudentModel.find({
      classId: req.params.classId,
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Students");

    sheet.columns = cls.columns.map((c) => ({
      header: c.toUpperCase(),
      key: c,
      width: 20,
    }));

    students.forEach((s) => sheet.addRow(s.data));

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
    console.error("Excel Error:", err.message);
    res.status(500).json({ error: "Excel export failed" });
  }
});

/* ===================== START SERVER (CRITICAL) ===================== */
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
