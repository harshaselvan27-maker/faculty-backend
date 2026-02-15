import express from "express";
import jwt from "jsonwebtoken";
import Note from "../models/Note.js";
import { Document, Packer, Paragraph, TextRun } from "docx";


const router = express.Router();

/* ================= AUTH MIDDLEWARE ================= */
const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
router.post("/word", auth, async (req, res) => {
  try {
    const { title, content } = req.body;

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: content,
                  break: 1,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${title}.docx`
    );

    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Word generation failed" });
  }
});
/* ================= ADD NOTE ================= */
router.post("/add", auth, async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.create({
      userId: req.user.id,
      title,
      content,
    });

    res.json({ message: "Note Saved", note });
  } catch (err) {
    res.status(500).json({ error: "Error saving note" });
  }
});

/* ================= LIST NOTES ================= */
router.get("/list", auth, async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({ notes });
  } catch {
    res.status(500).json({ error: "Error fetching notes" });
  }
});

/* ================= DELETE NOTE ================= */
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note Deleted" });
  } catch {
    res.status(500).json({ error: "Error deleting note" });
  }
});

export default router;
