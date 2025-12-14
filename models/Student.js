const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },

  name: { type: String, required: true },
  registerNo: { type: String, required: true },
  phone: { type: String },
  email: { type: String },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Student", StudentSchema);
