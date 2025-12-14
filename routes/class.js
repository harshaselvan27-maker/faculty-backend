const express = require("express");
const router = express.Router();
const Class = require("../models/Class");
const Student = require("../models/Student");

// CREATE CLASS
router.post("/", async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.json(newClass);
  } catch (err) {
    res.status(500).json({ error: "Failed to create class" });
  }
});

// GET ALL CLASSES
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// ADD STUDENT TO CLASS
router.post("/:classId/student", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();

    await Class.findByIdAndUpdate(req.params.classId, {
      $push: { students: student._id }
    });

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "Failed to add student" });
  }
});

module.exports = router;
