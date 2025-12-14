import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  department: String,
  phone: String,
  photo: String, // image URL or base64
});

export default mongoose.model("User", UserSchema);
