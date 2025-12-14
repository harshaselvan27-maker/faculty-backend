const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Achievement = require("../models/Achievement");

// Middleware to check token
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
// =========================
// ADD ACHIEVEMENT
// =========================
router.post("/add", auth, async (req, res) => {
  const { title, description, date, image } = req.body;

  try {
    const achieve = await Achievement.create({
      userId: req.user.id,
      title,
      description,
      date,
      image,
    });

    res.json({ message: "Achievement Added", achievement: achieve });
  } catch (err) {
    res.json({ error: "Error adding achievement" });
  }
});

//
// =========================
// LIST MY ACHIEVEMENTS
// =========================
router.get("/list", auth, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.id }).sort({
      date: -1,
    });
    res.json({ achievements });
  } catch (err) {
    res.json({ error: "Error fetching achievements" });
  }
});

//
// =========================
// DELETE ACHIEVEMENT
// =========================
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ message: "Achievement Deleted" });
  } catch (err) {
    res.json({ error: "Error deleting achievement" });
  }
});

module.exports = router;
