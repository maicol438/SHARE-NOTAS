import Note from "../models/Note.js";
import Category from "../models/Category.js";
import Notebook from "../models/Notebook.js";

export const advancedSearch = async (req, res, next) => {
  try {
    const {
      q,
      category,
      notebook,
      tags,
      dateFrom,
      dateTo,
      pinned,
      hasReminder,
      type,
      completed,
    } = req.query;

    const filter = { user: req.userId, deletedAt: null };

    if (q) {
      filter.$text = { $search: q };
    }

    if (category) filter.category = category;
    if (notebook) filter.notebook = notebook;
    if (pinned !== undefined) filter.isPinned = pinned === "true";
    if (type) filter.type = type;

    if (completed !== undefined) {
      filter.isCompleted = completed === "true";
    }

    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim().toLowerCase());
      filter.tags = { $all: tagList };
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        const d = new Date(dateFrom);
        if (isNaN(d.getTime())) return res.status(400).json({ message: "Fecha inválida" });
        filter.createdAt.$gte = d;
      }
      if (dateTo) {
        const d = new Date(dateTo);
        if (isNaN(d.getTime())) return res.status(400).json({ message: "Fecha inválida" });
        filter.createdAt.$lte = d;
      }
    }

    if (hasReminder === "true") {
      filter["reminder.date"] = { $gte: new Date() };
      filter["reminder.isActive"] = true;
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

export const getNotebooks = async (req, res, next) => {
  try {
    const notebooks = await Notebook.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ notebooks });
  } catch (error) {
    next(error);
  }
};

export const getNotebookById = async (req, res, next) => {
  try {
    const notebook = await Notebook.findOne({ _id: req.params.id, user: req.userId });
    if (!notebook) return res.status(404).json({ message: "Cuaderno no encontrado" });

    const notes = await Note.find({
      notebook: notebook._id,
      user: req.userId,
      deletedAt: null,
    })
      .populate("category", "name color")
      .sort({ isPinned: -1, updatedAt: -1 });

    res.json({ notebook, notes });
  } catch (error) {
    next(error);
  }
};

export const createNotebook = async (req, res, next) => {
  try {
    const { name, description, color, icon } = req.body;

    const notebook = await Notebook.create({
      name,
      description: description || "",
      color: color || "#6366f1",
      icon: icon || "book",
      user: req.userId,
    });

    res.status(201).json({ message: "Cuaderno creado", notebook });
  } catch (error) {
    next(error);
  }
};

export const updateNotebook = async (req, res, next) => {
  try {
    const { name, description, color, icon } = req.body;

    const notebook = await Notebook.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name, description, color, icon },
      { new: true, runValidators: true }
    );

    if (!notebook) return res.status(404).json({ message: "Cuaderno no encontrado" });

    res.json({ message: "Cuaderno actualizado", notebook });
  } catch (error) {
    next(error);
  }
};

export const deleteNotebook = async (req, res, next) => {
  try {
    const notebook = await Notebook.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!notebook) return res.status(404).json({ message: "Cuaderno no encontrado" });

    await Note.updateMany({ notebook: notebook._id }, { notebook: null });

    res.json({ message: "Cuaderno eliminado" });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const eightWeeksAgo = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000);

    const [facetResults, categories, notebooksData] = await Promise.all([
      Note.aggregate([
        { $match: { user: req.userId, deletedAt: null } },
        {
          $facet: {
            totalNotes: [{ $count: "count" }],
            byCategory: [
              { $group: { _id: "$category", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],
            byNotebook: [
              { $match: { notebook: { $ne: null } } },
              { $group: { _id: "$notebook", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            byWeek: [
              { $match: { createdAt: { $gte: eightWeeksAgo } } },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-W%V", date: "$createdAt" } },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
            topTags: [
              { $match: { tags: { $ne: [] } } },
              { $unwind: "$tags" },
              { $group: { _id: "$tags", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],
            tasksTotal: [
              { $match: { type: "task" } },
              { $count: "count" },
            ],
            tasksCompleted: [
              { $match: { type: "task", isCompleted: true } },
              { $count: "count" },
            ],
          },
        },
      ]),
      Category.find({ user: req.userId }),
      Notebook.find({ user: req.userId }),
    ]);

    const data = facetResults[0];

    const totalNotes = data.totalNotes[0]?.count ?? 0;
    const tasksTotal = data.tasksTotal[0]?.count ?? 0;
    const tasksCompleted = data.tasksCompleted[0]?.count ?? 0;

    const categoryStats = data.byCategory.map((s) => ({
      category: categories.find((c) => c._id.toString() === s._id?.toString()) || null,
      count: s.count,
    }));

    const notebookStats = data.byNotebook.map((s) => ({
      notebook: notebooksData.find((n) => n._id.toString() === s._id?.toString()) || null,
      count: s.count,
    }));

    res.json({
      totalNotes,
      byCategory: categoryStats,
      byNotebook: notebookStats,
      byWeek: data.byWeek,
      topTags: data.topTags,
      tasks: { total: tasksTotal, completed: tasksCompleted, pending: tasksTotal - tasksCompleted },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTags = async (req, res, next) => {
  try {
    const tags = await Note.aggregate([
      { $match: { user: req.userId, deletedAt: null, tags: { $ne: [] } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ tags });
  } catch (error) {
    next(error);
  }
};