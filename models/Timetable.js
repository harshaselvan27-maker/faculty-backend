import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    department: String,
    year: String,
    fileName: String,
    filePath: String,
  },
  { timestamps: true }
);

export default mongoose.model("Timetable", timetableSchema);
