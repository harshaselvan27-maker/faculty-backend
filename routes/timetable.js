const express = require("express");
const router = express.Router();
const Timetable = require("../models/Timetable");

// UPLOAD timetable (PDF or Image URL)
router.post("/", async (req, res) => {
  try {
    const tt = new Timetable(req.body);
    await tt.save();
    res.json(tt);
  } catch (err) {
    res.status(500).json({ error: "Failed to upload timetable" });
  }
});

// GET timetable
router.get("/", async (req, res) => {
  try {
    const tt = await Timetable.find();
    res.json(tt);
  } catch (err) {
    res.status(500).json({ error: "Error fetching timetable" });
  }
});

// DELETE timetable
router.delete("/:id", async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Timetable deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting timetable" });
  }
});

module.exports = router;
