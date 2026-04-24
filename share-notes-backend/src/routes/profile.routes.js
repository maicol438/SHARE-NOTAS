import { Router } from "express";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAccount,
} from "../controllers/profile.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", verifyToken, getProfile);
router.put("/me", verifyToken, updateProfile);
router.put("/me/avatar", verifyToken, updateAvatar);
router.delete("/me", verifyToken, deleteAccount);

export default router;