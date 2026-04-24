import { Router } from "express";
import {
  advancedSearch,
  getNotebooks,
  getNotebookById,
  createNotebook,
  updateNotebook,
  deleteNotebook,
  getStats,
  getAllTags,
} from "../controllers/search.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/search", verifyToken, advancedSearch);
router.get("/stats", verifyToken, getStats);
router.get("/tags", verifyToken, getAllTags);

router.get("/notebooks", verifyToken, getNotebooks);
router.get("/notebooks/:id", verifyToken, getNotebookById);
router.post("/notebooks", verifyToken, createNotebook);
router.put("/notebooks/:id", verifyToken, updateNotebook);
router.delete("/notebooks/:id", verifyToken, deleteNotebook);

export default router;