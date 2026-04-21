import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

favoriteSchema.index({ note: 1, user: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);