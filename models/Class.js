const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  className: { type: String, required: true },
  section: { type: String },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Class", ClassSchema);
