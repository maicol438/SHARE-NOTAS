import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      maxlength: [120, "El título no puede superar 120 caracteres"],
    },
    content: {
      type: String,
      default: "",
    },
    contentHTML: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "La categoría es obligatoria"],
    },
    notebook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notebook",
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    images: [{
      type: String,
    }],
    reminder: {
      date: Date,
      note: { type: String, default: "" },
      isActive: { type: Boolean, default: true },
    },
    sharedWith: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      permission: { type: String, enum: ["read", "edit"], default: "read" },
      sharedAt: { type: Date, default: Date.now },
    }],
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["note", "task"],
      default: "note",
    },
  },
  { timestamps: true }
);

noteSchema.index({ title: "text", content: "text", contentHTML: "text" });
noteSchema.index({ tags: 1 });
noteSchema.index({ "reminder.date": 1 });

export default mongoose.model("Note", noteSchema);