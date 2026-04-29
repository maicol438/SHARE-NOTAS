import multer from "multer";
import path from "path";
import fs from "fs";
import File from "../models/File.js";

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
  const filePath = path.resolve(uploadDir, req.params.filename);
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
