import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("File", FileSchema);
