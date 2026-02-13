import express from "express";
import mongoose from "mongoose";

const router = express.Router();

/* ================= SCHEMA ================= */
const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const ClassModel = mongoose.model("Class", classSchema);

/* ================= CREATE ================= */
router.post("/create", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.json({ success: false });
    }

    const newClass = new ClassModel({ name });
    await newClass.save();

    res.json({ success: true });
  } catch (err) {
    console.log("CREATE ERROR:", err);
    res.json({ success: false });
  }
});

/* ================= LIST ================= */
router.get("/list", async (req, res) => {
  try {
    const classes = await ClassModel.find().sort({ _id: -1 });
    res.json({ success: true, classes });
  } catch (err) {
    console.log("LIST ERROR:", err);
    res.json({ success: false });
  }
});

export default router;
