import { Router } from "express";
import {
  getComments,
  createComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/notes/:noteId/comments", verifyToken, getComments);
router.post("/notes/:noteId/comments", verifyToken, createComment);
router.delete("/comments/:id", verifyToken, deleteComment);

export default router;