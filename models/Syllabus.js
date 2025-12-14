const mongoose = require("mongoose");

const SyllabusSchema = new mongoose.Schema({
  userId: String,
  subject: String,
  driveFileId: String,
  driveFileUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Syllabus", SyllabusSchema);


