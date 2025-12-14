const mongoose = require("mongoose");

const AchievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  title: { type: String, required: true },
  description: { type: String },
  date: { type: String, required: true },

  image: { type: String },   // optional image URL for future upload

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Achievement", AchievementSchema);
