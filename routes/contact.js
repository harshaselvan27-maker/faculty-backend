const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Contact = require("../models/Contact");

// AUTH
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

// ADD CONTACT
router.post("/add", auth, async (req, res) => {
  const { name, phone, email, description } = req.body;

  try {
    const contact = await Contact.create({
      userId: req.user.id,
      name,
      phone,
      email,
      description,
    });

    res.json({ message: "Contact Added", contact });
  } catch (err) {
    res.json({ error: "Error adding contact" });
  }
});

// LIST CONTACTS
router.get("/list", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user.id }).sort({
      name: 1,
    });
    res.json({ contacts });
  } catch {
    res.json({ error: "Error fetching contacts" });
  }
});

// DELETE CONTACT
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Contact Deleted" });
  } catch {
    res.json({ error: "Error deleting contact" });
  }
});

module.exports = router;
