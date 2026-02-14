import express from "express";
import ClassModel from "../models/Class.js";
import StudentModel from "../models/Student.js";

const router = express.Router();

/* CREATE CLASS */
router.post("/create", async (req, res) => {
  const { name } = req.body;

  const newClass = await ClassModel.create({
    name,
    columns: ["registerNo", "name"],
  });

  res.json({ success: true, class: newClass });
});

/* GET CLASSES */
router.get("/list", async (req, res) => {
  const classes = await ClassModel.find();
  res.json({ success: true, classes });
});

/* GET SINGLE CLASS */
router.get("/:id", async (req, res) => {
  const cls = await ClassModel.findById(req.params.id);
  res.json(cls);
});

/* UPDATE COLUMNS */
router.put("/:id/columns", async (req, res) => {
  const { columns } = req.body;
  await ClassModel.findByIdAndUpdate(req.params.id, { columns });
  res.json({ success: true });
});

/* DELETE CLASS */
router.delete("/:id", async (req, res) => {
  await StudentModel.deleteMany({ classId: req.params.id });
  await ClassModel.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ================= STUDENTS ================= */

/* ADD STUDENT */
router.post("/:id/student", async (req, res) => {
  const student = await StudentModel.create({
    classId: req.params.id,
    data: req.body,
  });
  res.json(student);
});

/* GET STUDENTS */
router.get("/:id/students", async (req, res) => {
  const students = await StudentModel.find({
    classId: req.params.id,
  });
  res.json(students);
});

/* UPDATE STUDENT */
router.put("/student/:id", async (req, res) => {
  await StudentModel.findByIdAndUpdate(req.params.id, {
    data: req.body,
  });
  res.json({ success: true });
});

/* DELETE STUDENT */
router.delete("/student/:id", async (req, res) => {
  await StudentModel.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
