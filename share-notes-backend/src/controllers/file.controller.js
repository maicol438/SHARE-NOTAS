import multer from "multer";
import path from "path";
import fs from "fs";

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
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
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
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Error al subir: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No se subieron archivos" });
    }

    try {
      const files = req.files.map((file) => ({
        name: file.originalname,
        filename: file.filename,
        url: `${req.protocol}://${req.get("host")}/api/files/uploads/${file.filename}`,
        type: file.mimetype,
        size: file.size,
      }));

      res.status(201).json({ message: "Archivos subidos", files });
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
