import mongoose from "mongoose";

const notebookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [100, "Máximo 100 caracteres"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    color: {
      type: String,
      default: "#6366f1",
    },
    icon: {
      type: String,
      default: "book",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    coverImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

notebookSchema.index({ user: 1 });

export default mongoose.model("Notebook", notebookSchema);