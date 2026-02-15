import express from "express";
import jwt from "jsonwebtoken";
import Meeting from "../models/Meeting.js";

const router = express.Router();

/* ================= AUTH ================= */
const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

/* ================= ADD ================= */
router.post("/add", auth, async (req, res) => {
  try {
    const { title, description, date, time, location } = req.body;

    const meeting = await Meeting.create({
      userId: req.user.id,
      title,
      description,
      date,
      time,
      location,
    });

    res.json({ message: "Meeting Scheduled", meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error scheduling meeting" });
  }
});

/* ================= LIST ================= */
router.get("/list", auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      userId: req.user.id,
    }).sort({ date: 1, time: 1 });

    res.json({ meetings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching meetings" });
  }
});

/* ================= DELETE ================= */
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    await Meeting.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    res.json({ message: "Meeting Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting meeting" });
  }
});

export default router;
