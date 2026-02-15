import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    designation: String,
    department: String,
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
