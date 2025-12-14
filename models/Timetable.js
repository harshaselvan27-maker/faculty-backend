const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  fileName: { type: String, required: true },
  filePath: { type: String, required: true },

  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Timetable", TimetableSchema);
