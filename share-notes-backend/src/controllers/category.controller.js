import Category from "../models/Category.js";
import Note from "../models/Note.js";

// ── GET /api/categories ───────────────────────────────────────────
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.userId }).sort({ name: 1 });
    res.json({ categories, total: categories.length });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/categories ──────────────────────────────────────────
export const createCategory = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    const category = await Category.create({ name, color, user: req.userId });
    res.status(201).json({ message: "Categoría creada correctamente", category });
  } catch (error) {
    // Error de índice único (nombre duplicado para el mismo usuario)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Ya existe una categoría con ese nombre" });
    }
    next(error);
  }
};

// ── PUT /api/categories/:id ───────────────────────────────────────
export const updateCategory = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name, color },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({ message: "Categoría actualizada correctamente", category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Ya existe una categoría con ese nombre" });
    }
    next(error);
  }
};

// ── DELETE /api/categories/:id ────────────────────────────────────
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.userId });
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    // Verificar si existen notas asociadas
    const notesCount = await Note.countDocuments({ category: req.params.id });
    if (notesCount > 0) {
      return res.status(400).json({
        message: `No se puede eliminar. Hay ${notesCount} nota(s) usando esta categoría.`,
      });
    }

    await category.deleteOne();
    res.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};
