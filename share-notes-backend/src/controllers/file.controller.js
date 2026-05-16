import multer from "multer";
import path from "path";
import fs from "fs";
import File from "../models/File.js";
import User from "../models/User.js";
import { sendShareNotificationEmail } from "../config/email.js";

// Crear directorio de subidas si no existe
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "file-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const isValid = allowed.test(path.extname(file.originalname).toLowerCase());
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido"));
    }
  },
}).array("files", 3);

export const uploadFiles = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Error al subir: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No se subieron archivos" });
    }

    try {
      const savedFiles = await Promise.all(
        req.files.map(async (file) => {
          const fileDoc = await File.create({
            user: req.userId,
            originalName: file.originalname,
            filename: file.filename,
            url: `/api/files/uploads/${file.filename}`,
            type: file.mimetype,
            size: file.size,
          });
          return {
            _id: fileDoc._id,
            name: fileDoc.originalName,
            filename: fileDoc.filename,
            url: fileDoc.url,
            type: fileDoc.type,
            size: fileDoc.size,
            createdAt: fileDoc.createdAt,
          };
        })
      );

      res.status(201).json({ message: "Archivos subidos", files: savedFiles });
    } catch (error) {
      next(error);
    }
  });
};

export const getFile = (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(uploadDir, filename);

  if (filename !== req.params.filename || filePath.indexOf(uploadDir) !== 0) {
    return res.status(400).json({ message: "Nombre de archivo inválido" });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Archivo no encontrado" });
  }
  res.sendFile(filePath);
};

export const getFiles = async (req, res, next) => {
  try {
    const files = await File.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ files });
  } catch (error) {
    next(error);
  }
};

export const shareFile = async (req, res, next) => {
  try {
    const { email } = req.body;

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (targetUser._id.toString() === req.userId) {
      return res.status(400).json({ message: "No puedes compartir contigo mismo" });
    }

    const file = await File.findOne({ _id: req.params.id, user: req.userId });
    if (!file) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    const sender = await User.findById(req.userId);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const fileUrl = `${clientUrl}/dashboard/files`;

    await sendShareNotificationEmail({
      to: targetUser.email,
      sharedByName: sender?.name || "Alguien",
      noteTitle: file.originalName,
      noteUrl: fileUrl,
      type: "file",
    });

    res.json({ message: `Archivo compartido con ${targetUser.name}` });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const file = await File.findOneAndDelete({ filename, user: req.userId });
    if (!file) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }
    const filePath = path.resolve(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ message: "Archivo eliminado" });
  } catch (error) {
    next(error);
  }
};
