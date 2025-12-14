const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: String,
  email: String,
  phone: String,
  department: String,
  role: String,
  image: String
});

module.exports = mongoose.model("Profile", ProfileSchema);
