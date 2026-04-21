import Note from "../models/Note.js";
import Category from "../models/Category.js";
import User from "../models/User.js";

export const getNotes = async (req, res, next) => {
  try {
    const { search, category, pinned } = req.query;
    const filter = { user: req.userId, deletedAt: null };

    if (category) filter.category = category;
    if (pinned !== undefined) filter.isPinned = pinned === "true";
    if (search) filter.$text = { $search: search };

    const notes = await Note.find(filter)
      .populate("category", "name color")
      .sort({ isPinned: -1, updatedAt: -1 });

    res.json({ notes, total: notes.length });
  } catch (error) {
    next(error);
  }
};

export const getTrash = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.userId, deletedAt: { $ne: null } })
      .populate("category", "name color")
      .sort({ deletedAt: -1 });

    res.json({ notes, total: notes.length });
  } catch (error) {
    next(error);
  }
};

export const getAllPublicNotes = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    const filter = { deletedAt: null };

    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    let sortOption = { rating: -1, ratingCount: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    if (sort === "downloads") sortOption = { downloads: -1 };

    const notes = await Note.find(filter)
      .populate("user", "name avatar")
      .populate("category", "name color")
      .sort(sortOption)
      .limit(50);

    res.json({ notes, total: notes.length });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.userId, deletedAt: null }).populate(
      "category",
      "name color"
    );

    if (!note) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    res.json({ note });
  } catch (error) {
    next(error);
  }
};

export const getPublicNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, deletedAt: null })
      .populate("user", "name avatar")
      .populate("category", "name color");

    if (!note) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    note.views += 1;
    await note.save();

    res.json({ note });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const { title, content, description, category, isPinned } = req.body;

    const categoryExists = await Category.findOne({
      _id: category,
      user: req.userId,
    });
    if (!categoryExists) {
      return res.status(400).json({ message: "Categoría no válida" });
    }

    const note = await Note.create({
      title,
      content,
      description: description || "",
      category,
      isPinned: isPinned || false,
      user: req.userId,
    });

    const populated = await note.populate("category", "name color");
    res.status(201).json({ message: "Nota creada correctamente", note: populated });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { title, content, description, category, isPinned } = req.body;

    if (category) {
      const categoryExists = await Category.findOne({ _id: category, user: req.userId });
      if (!categoryExists) {
        return res.status(400).json({ message: "Categoría no válida" });
      }
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, content, description, category, isPinned },
      { new: true, runValidators: true }
    ).populate("category", "name color");

    if (!note) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    res.json({ message: "Nota actualizada correctamente", note });
  } catch (error) {
    next(error);
  }
};

export const softDeleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    res.json({ message: "Nota movable a papelera" });
  } catch (error) {
    next(error);
  }
};

export const restoreNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { deletedAt: null },
      { new: true }
    ).populate("category", "name color");

    if (!note) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    res.json({ message: "Nota restaurada correctamente", note });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });

    if (!note) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    res.json({ message: "Nota eliminada permanentemente" });
  } catch (error) {
    next(error);
  }
};

export const permanentDeleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
      deletedAt: { $ne: null },
    });

    if (!note) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    res.json({ message: "Nota eliminada permanentemente" });
  } catch (error) {
    next(error);
  }
};

export const togglePin = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.userId });
    if (!note) return res.status(404).json({ message: "Nota no encontrada" });

    note.isPinned = !note.isPinned;
    await note.save();

    res.json({ message: `Nota ${note.isPinned ? "fijada" : "desfijada"}`, note });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.userId });
    if (!note) return res.status(404).json({ message: "Nota no encontrada" });

    note.isFavorite = !note.isFavorite;
    await note.save();

    res.json({ message: `Nota ${note.isFavorite ? "marcada" : "desmarcada"} como favorita`, note });
  } catch (error) {
    next(error);
  }
};

export const downloadNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, deletedAt: null });
    if (!note) return res.status(404).json({ message: "Nota no encontrada" });

    note.downloads += 1;
    await note.save();

    res.json({
      message: "Descarga registrada",
      note,
      downloadUrl: `/api/notes/${note._id}/download`,
    });
  } catch (error) {
    next(error);
  }
};

export const rateNote = async (req, res, next) => {
  try {
    const { rating } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating debe estar entre 1 y 5" });
    }

    const note = await Note.findOne({ _id: req.params.id, deletedAt: null });
    if (!note) return res.status(404).json({ message: "Nota no encontrada" });

    const newCount = note.ratingCount + 1;
    const newRating = (note.rating * note.ratingCount + rating) / newCount;

    note.rating = Math.round(newRating * 10) / 10;
    note.ratingCount = newCount;
    await note.save();

    res.json({ message: "Rating actualizado", rating: note.rating, ratingCount: note.ratingCount });
  } catch (error) {
    next(error);
  }
};