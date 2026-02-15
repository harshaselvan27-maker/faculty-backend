import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();

/* ================= ADD CONTACT ================= */
router.post("/add", async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.json({ success: true, contact });
  } catch {
    res.status(500).json({ error: "Add failed" });
  }
});

/* ================= LIST ================= */
router.get("/list", async (req, res) => {
  const list = await Contact.find().sort({ createdAt: -1 });
  res.json({ list });
});

/* ================= DELETE ================= */
router.delete("/delete/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ================= EDIT ================= */
router.put("/edit/:id", async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
});

export default router;
