import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la categoría es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [50, "El nombre no puede superar 50 caracteres"],
    },
    color: {
      type: String,
      default: "#6366f1", // Indigo por defecto
      match: [/^#([A-Fa-f0-9]{6})$/, "Color debe ser un hex válido (ej: #ff5733)"],
    },
    // ── Relación: cada categoría pertenece a un usuario ───────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Un mismo usuario no puede tener dos categorías con el mismo nombre
categorySchema.index({ name: 1, user: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
