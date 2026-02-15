const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  title: { type: String, required: true },
  description: { type: String },

  date: { type: String, required: true },
  time: { type: String, required: true },

  location: { type: String },   // Room / Hall / Online Link

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Meeting", MeetingSchema);

