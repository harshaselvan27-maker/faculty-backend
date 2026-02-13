import express from "express";
import ClassModel from "../models/Class.js";

const router = express.Router();

/* CREATE CLASS */
router.post("/create", async (req, res) => {
  try {
    const { name } = req.body;

    const newClass = await ClassModel.create({
      name,
      columns: ["registerNo", "name"], // default excel columns
    });

    res.json({ success: true, data: newClass });
  } catch (err) {
    res.json({ success: false });
  }
});

/* GET ALL CLASSES */
router.get("/list", async (req, res) => {
  const classes = await ClassModel.find().sort({ _id: -1 });
  res.json({ success: true, classes });
});

/* GET SINGLE CLASS */
router.get("/:id", async (req, res) => {
  const cls = await ClassModel.findById(req.params.id);
  res.json(cls);
});

/* UPDATE CLASS NAME */
router.put("/:id", async (req, res) => {
  try {
    const updated = await ClassModel.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({});
  }
});

/* DELETE CLASS */
router.delete("/:id", async (req, res) => {
  try {
    await ClassModel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* UPDATE COLUMNS */
router.put("/:id/columns", async (req, res) => {
  try {
    const updated = await ClassModel.findByIdAndUpdate(
      req.params.id,
      { columns: req.body.columns },
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({});
  }
});

export default router;
