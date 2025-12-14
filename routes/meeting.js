const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Meeting = require("../models/Meeting");

// AUTH MIDDLEWARE
const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.json({ error: "Invalid token" });
  }
};

//
// ===============================
// ADD MEETING
// ===============================
router.post("/add", auth, async (req, res) => {
  const { title, description, date, time, location } = req.body;

  try {
    const meeting = await Meeting.create({
      userId: req.user.id,
      title,
      description,
      date,
      time,
      location,
    });

    res.json({ message: "Meeting Scheduled", meeting });
  } catch {
    res.json({ error: "Error scheduling meeting" });
  }
});

//
// ===============================
// LIST MEETINGS
// ===============================
router.get("/list", auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({ userId: req.user.id }).sort({
      date: 1,
      time: 1,
    });

    res.json({ meetings });
  } catch {
    res.json({ error: "Error fetching meetings" });
  }
});

//
// ===============================
// DELETE MEETING
// ===============================
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ message: "Meeting Deleted" });
  } catch {
    res.json({ error: "Error deleting meeting" });
  }
});

module.exports = router;
