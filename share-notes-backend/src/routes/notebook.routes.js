import { Router } from "express";
import {
  getNotebooks,
  getNotebookById,
  createNotebook,
  updateNotebook,
  deleteNotebook,
} from "../controllers/search.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyToken);

router.get("/", getNotebooks);
router.get("/:id", getNotebookById);
router.post("/", createNotebook);
router.put("/:id", updateNotebook);
router.delete("/:id", deleteNotebook);

export default router;