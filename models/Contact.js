const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  description: { type: String },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Contact", ContactSchema);
