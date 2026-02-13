import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  columns: {
    type: [String],
    default: ["registerNo", "name"],
  },
});

const ClassModel =
  mongoose.models.Class ||
  mongoose.model("Class", classSchema);

export default ClassModel;
