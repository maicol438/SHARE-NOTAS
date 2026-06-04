import Comment from "../models/Comment.js";
import Note from "../models/Note.js";
import User from "../models/User.js";
import { emitToUser } from "../services/socket.js";

export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ note: req.params.noteId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { noteId } = req.params;

    const note = await Note.findOne({ _id: noteId, deletedAt: null });
    if (!note) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    const hasAccess =
      note.user.toString() === req.userId ||
      note.sharedWith.some((s) => s.user.toString() === req.userId) ||
      note.isPublic === true;

    if (!hasAccess) {
      return res.status(403).json({ message: "No tienes permiso para comentar en esta nota" });
    }

    const comment = await Comment.create({
      content,
      note: noteId,
      user: req.userId,
    });

    const populated = await comment.populate("user", "name avatar");

    const commenter = await User.findById(req.userId);
    emitToUser(note.user.toString(), "comment:new", {
      noteId,
      noteTitle: note.title,
      comment: populated,
      by: commenter?.name || "Alguien",
    });

    res.status(201).json({ message: "Comentario creado", comment: populated });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    res.json({ message: "Comentario eliminado" });
  } catch (error) {
    next(error);
  }
};