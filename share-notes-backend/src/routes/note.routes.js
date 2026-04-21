import { Router } from "express";
import {
  getNotes,
  getAllPublicNotes,
  getPublicNoteById,
  getNoteById,
  getTrash,
  createNote,
  updateNote,
  softDeleteNote,
  restoreNote,
  deleteNote,
  permanentDeleteNote,
  togglePin,
  toggleFavorite,
  downloadNote,
  rateNote,
} from "../controllers/note.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/public", getAllPublicNotes);
router.get("/public/:id", getPublicNoteById);
router.post("/public/:id/download", downloadNote);
router.post("/public/:id/rate", rateNote);

router.get("/trash", verifyToken, getTrash);
router.patch("/:id/restore", verifyToken, restoreNote);
router.delete("/:id/permanent", verifyToken, permanentDeleteNote);
router.get("/", verifyToken, getNotes);
router.post("/", verifyToken, createNote);
router.get("/:id", verifyToken, getNoteById);
router.put("/:id", verifyToken, updateNote);
router.delete("/:id", verifyToken, softDeleteNote);
router.patch("/:id/pin", verifyToken, togglePin);
router.patch("/:id/favorite", verifyToken, toggleFavorite);
router.post("/:id/download", verifyToken, downloadNote);
router.post("/:id/rate", verifyToken, rateNote);

export default router;