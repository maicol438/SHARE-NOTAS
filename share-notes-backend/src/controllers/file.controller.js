import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { uploadFiles as uploadFilesMiddleware } from '../middlewares/uploadMiddleware.js';
import File from '../models/File.js';
import User from '../models/User.js';
import { sendShareNotificationEmail } from '../config/email.js';

export const uploadFiles = (req, res, next) => {
  uploadFilesMiddleware.array('files', 3)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Error al subir: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No se subieron archivos' });
    }

    try {
      const savedFiles = await Promise.all(
        req.files.map(async (file) => {
          const fileDoc = await File.create({
            user: req.userId,
            originalName: file.originalname,
            filename: file.filename,
            url: file.path,
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

      res.status(201).json({ message: 'Archivos subidos', files: savedFiles });
    } catch (error) {
      next(error);
    }
  });
};

export const getFile = async (req, res) => {
  try {
    const file = await File.findOne({ filename: req.params.filename });
    if (!file) return res.status(404).json({ message: 'Archivo no encontrado' });
    res.redirect(file.url);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener archivo' });
  }
};

export const getFiles = async (req, res, next) => {
  try {
    const docs = await File.find({ user: req.userId }).sort({ createdAt: -1 });
    const files = docs.map((f) => ({
      _id: f._id,
      name: f.originalName,
      filename: f.filename,
      url: f.url,
      type: f.type,
      size: f.size,
      createdAt: f.createdAt,
    }));
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
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (targetUser._id.toString() === req.userId) {
      return res.status(400).json({ message: 'No puedes compartir contigo mismo' });
    }

    const file = await File.findOne({ _id: req.params.id, user: req.userId });
    if (!file) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    const sender = await User.findById(req.userId);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const fileUrl = `${clientUrl}/dashboard/files`;

    await sendShareNotificationEmail({
      to: targetUser.email,
      sharedByName: sender?.name || 'Alguien',
      noteTitle: file.originalName,
      noteUrl: fileUrl,
      type: 'file',
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
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    await cloudinary.uploader.destroy(filename);
    res.json({ message: 'Archivo eliminado' });
  } catch (error) {
    next(error);
  }
};
