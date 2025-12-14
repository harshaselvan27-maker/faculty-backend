const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Note = require("../models/Note");
const PDFDocument = require("pdfkit");
const fs = require("fs");

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
// ADD NEW NOTE
// ===============================
router.post("/add", auth, async (req, res) => {
  const { title, content } = req.body;

  try {
    const note = await Note.create({
      userId: req.user.id,
      title,
      content,
    });

    res.json({ message: "Note Saved", note });
  } catch (err) {
    res.json({ error: "Error saving note" });
  }
});

//
// ===============================
// LIST ALL NOTES
// ===============================
router.get("/list", auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ notes });
  } catch {
    res.json({ error: "Error fetching notes" });
  }
});

//
// ===============================
// DELETE NOTE
// ===============================
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note Deleted" });
  } catch {
    res.json({ error: "Error deleting note" });
  }
});

//
// ===============================
// GENERATE PDF FROM NOTE CONTENT
// ===============================
router.post("/pdf", auth, async (req, res) => {
  const { title, content } = req.body;

  // Temporary file path
  const filename = `note_${Date.now()}.pdf`;
  const filepath = `./pdfs/${filename}`;

  // Ensure pdf folder exists
  if (!fs.existsSync("./pdfs")) fs.mkdirSync("./pdfs");

  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filepath);

  doc.pipe(stream);

  doc.fontSize(20).text(title, { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(content);

  doc.end();

  stream.on("finish", () => {
    res.download(filepath, filename, () => {
      fs.unlinkSync(filepath); // delete after sending
    });
  });
});

module.exports = router;
