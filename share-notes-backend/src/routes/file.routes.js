import { Router } from "express";
import { uploadFiles, getFile, getFiles, deleteFile, shareFile } from "../controllers/file.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import path from "path";
import express from "express";

const router = Router();

// Servir archivos estáticos: /api/files/uploads/...
router.use("/uploads", express.static(path.resolve("uploads")));

router.post("/upload", verifyToken, uploadFiles);
router.get("/", verifyToken, getFiles);
router.post("/:id/share", verifyToken, shareFile);
router.delete("/uploads/:filename", verifyToken, deleteFile);
router.get("/uploads/:filename", verifyToken, getFile);

export default router;
