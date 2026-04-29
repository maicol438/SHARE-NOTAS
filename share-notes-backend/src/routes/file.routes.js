import { Router } from "express";
import { uploadFiles, getFile, getFiles, deleteFile } from "../controllers/file.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import path from "path";
import express from "express";

const router = Router();

// Servir archivos estáticos: /api/files/uploads/...
router.use("/uploads", express.static(path.resolve("uploads")));

router.post("/upload", verifyToken, uploadFiles);
router.get("/", verifyToken, getFiles);
router.delete("/uploads/:filename", verifyToken, deleteFile);
router.get("/uploads/:filename", getFile);

export default router;
