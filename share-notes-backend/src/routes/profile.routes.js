import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAccount,
} from "../controllers/profile.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

const avatarDir = path.resolve("uploads/avatars");
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "avatar-" + uniqueSuffix + ext);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const isValid = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(null, isValid);
  },
}).single("file");

router.get("/me", verifyToken, getProfile);
router.put("/me", verifyToken, updateProfile);

router.post("/me/avatar", verifyToken, (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    updateAvatar(req, res, next);
  });
});

router.delete("/me", verifyToken, deleteAccount);

export default router;
