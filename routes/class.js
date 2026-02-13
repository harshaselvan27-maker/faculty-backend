import express from "express";
import ClassModel from "../models/Class.js";

const router = express.Router();

/* ================= CREATE CLASS ================= */
router.post("/create", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.json({
        success: false,
        message: "Class name required",
      });
    }

    const newClass = new ClassModel({
      name: name.trim(),
      columns: ["registerNo", "name"], // force default
    });

    await newClass.save();

    res.json({
      success: true,
      data: newClass,
    });

  } catch (err) {
    console.error("CREATE CLASS ERROR:", err.message);
    res.json({
      success: false,
      message: err.message,
    });
  }
});

/* ================= LIST CLASSES ================= */
router.get("/list", async (req, res) => {
  try {
    const classes = await ClassModel.find().sort({ _id: -1 });
    res.json({
      success: true,
      classes,
    });
  } catch (err) {
    console.error("LIST ERROR:", err.message);
    res.json({ success: false });
  }
});
/* ================= GET SINGLE CLASS ================= */
router.get("/:id", async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.id);
    res.json(cls);
  } catch (err) {
    console.log("GET CLASS ERROR:", err);
    res.status(500).json({});
  }
});


export default router;
