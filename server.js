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
import classRoutes from "./routes/class.js";

// Models
import ClassModel from "./models/Class.js";
import StudentModel from "./models/Student.js";

dotenv.config();
const app = express();

/* ===================== ENSURE UPLOADS FOLDER ===================== */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

/* ===================== CORS ===================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===================== DATABASE ===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
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
app.use("/class", classRoutes);

/* ===================== STUDENT ROUTES ===================== */

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

/* ===================== EXPORT TO EXCEL ===================== */
app.get("/class/:classId/export", async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.classId);
    if (!cls)
      return res.status(404).json({ error: "Class not found" });

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

/* ===================== START SERVER ===================== */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
