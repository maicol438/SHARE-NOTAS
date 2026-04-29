import Note from "../models/Note.js";
import Category from "../models/Category.js";
import Notebook from "../models/Notebook.js";
import User from "../models/User.js";

const normalizeTags = (tags) => {
  if (!tags) return [];
  const tagArray = Array.isArray(tags) ? tags : tags.split(",");
  return tagArray.map((t) => t.toLowerCase().trim()).filter(Boolean);
};

export const getNotes = async (req, res, next) => {
  try {
    const { search, category, notebook, tags, pinned, type } = req.query;
    const filter = { user: req.userId, deletedAt: null };

    if (category) filter.category = category;
    if (notebook) filter.notebook = notebook;
    if (pinned !== undefined) filter.isPinned = pinned === "true";
    if (type) filter.type = type;
    if (search) filter.$text = { $search: search };
    if (tags) {
      const tagList = tags.split(",").map(t => t.trim().toLowerCase());
      filter.tags = { $in: tagList };
    }

    const notes = await Note.find(filter)
      .populate("category", "name color")
      .populate("notebook", "name color")
      .sort({ isPinned: -1, updatedAt: -1 });

    res.json({ notes, total: notes.length });
  } catch (error) {
    next(error);
  }
};

export const getSharedWithMe = async (req, res, next) => {
  try {
    const notes = await Note.find({
      "sharedWith.user": req.userId,
      deletedAt: null,
      user: { $ne: req.userId },
    })
      .populate("category", "name color")
      .populate("user", "name avatar")
      .sort({ updatedAt: -1 });

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
    const filter = { deletedAt: null, isPublic: true };

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
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [{ user: req.userId }, { "sharedWith.user": req.userId }],
      deletedAt: null,
    })
      .populate("category", "name color")
      .populate("notebook", "name color")
      .populate("user", "name avatar");

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
    const {
      title,
      content,
      contentHTML,
      description,
      category,
      notebook,
      isPinned,
      tags,
      images,
      reminder,
      type,
      dueDate,
      priority,
    } = req.body;

    const categoryExists = await Category.findOne({ _id: category, user: req.userId });
    if (!categoryExists) {
      return res.status(400).json({ message: "Categoría no válida. Selecciona una categoría existente." });
    }

    if (notebook) {
      const notebookExists = await Notebook.findOne({ _id: notebook, user: req.userId });
      if (!notebookExists) {
        return res.status(400).json({ message: "Cuaderno no válido" });
      }
    }

    const note = await Note.create({
      title,
      content: content || "",
      contentHTML: contentHTML || content || "",
      description: description || "",
      category,
      notebook: notebook || null,
      isPinned: isPinned || false,
      user: req.userId,
      tags: normalizeTags(tags),
      images: images || [],
      reminder: reminder || null,
      type: type || "note",
      dueDate: dueDate || null,
      priority: priority || "medium",
    });

    const populated = await note.populate([
      { path: "category", select: "name color" },
      { path: "notebook", select: "name color" },
    ]);
    res.status(201).json({ message: "Nota creada correctamente", note: populated });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const {
      title,
      content,
      contentHTML,
      description,
      category,
      notebook,
      isPinned,
      tags,
      images,
      reminder,
      isPublic,
      dueDate,
      priority,
      isCompleted,
      type,
    } = req.body;

    if (category) {
      const categoryExists = await Category.findOne({ _id: category, user: req.userId });
      if (!categoryExists) {
        return res.status(400).json({ message: "Categoría no válida" });
      }
    }

    const updateData = { title, content, contentHTML, description, category, isPinned, tags: normalizeTags(tags), images, reminder, isPublic, dueDate, priority, isCompleted, type };
    if (notebook !== undefined) updateData.notebook = notebook;
    delete updateData.category;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("category", "name color")
      .populate("notebook", "name color");

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

    res.json({ message: "Nota movida a la papelera" });
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
    )
      .populate("category", "name color")
      .populate("notebook", "name color");

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

export const shareNote = async (req, res, next) => {
  try {
    const { email, permission } = req.body;

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (targetUser._id.toString() === req.userId) {
      return res.status(400).json({ message: "No puedes compartir contigo mismo" });
    }

    const note = await Note.findOne({ _id: req.params.id, user: req.userId });
    if (!note) return res.status(404).json({ message: "Nota no encontrada" });

    const existingShare = note.sharedWith.find(
      (s) => s.user.toString() === targetUser._id.toString()
    );

    if (existingShare) {
      existingShare.permission = permission || "read";
      existingShare.sharedAt = new Date();
    } else {
      note.sharedWith.push({
        user: targetUser._id,
        permission: permission || "read",
        sharedAt: new Date(),
      });
    }

    await note.save();

    res.json({ message: `Nota compartida con ${targetUser.name}` });
  } catch (error) {
    next(error);
  }
};

export const unshareNote = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const note = await Note.findOne({ _id: req.params.id, user: req.userId });
    if (!note) return res.status(404).json({ message: "Nota no encontrada" });

    note.sharedWith = note.sharedWith.filter(
      (s) => s.user.toString() !== userId
    );

    await note.save();

    res.json({ message: "Compartición eliminada" });
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

export const getReminders = async (req, res, next) => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const notes = await Note.find({
      user: req.userId,
      deletedAt: null,
      "reminder.date": { $gte: now, $lte: tomorrow },
      "reminder.isActive": true,
    })
      .populate("category", "name color")
      .sort({ "reminder.date": 1 });

    res.json({ notes, total: notes.length });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const { completed, tags } = req.query;
    const filter = { user: req.userId, deletedAt: null, type: "task" };

    if (completed !== undefined) {
      filter.isCompleted = completed === "true";
    }
    if (tags) {
      const tagList = tags.split(",").map(t => t.trim().toLowerCase());
      filter.tags = { $in: tagList };
    }

    const tasks = await Note.find(filter)
      .populate("category", "name color")
      .populate("assignedTo", "name avatar")
      .sort({ dueDate: 1, priority: -1 });

    res.json({ tasks, total: tasks.length });
  } catch (error) {
    next(error);
  }
};

export const toggleTaskComplete = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.userId, type: "task" });
    if (!note) return res.status(404).json({ message: "Tarea no encontrada" });

    note.isCompleted = !note.isCompleted;
    await note.save();

    res.json({ message: `Tarea ${note.isCompleted ? "completada" : "marcada como pendiente"}`, note });
  } catch (error) {
    next(error);
  }
};