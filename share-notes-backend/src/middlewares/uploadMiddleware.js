import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'share-notes/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});

const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'share-notes/files',
    allowed_formats: [
      'jpg', 'jpeg', 'png', 'gif', 'webp',
      'pdf', 'doc', 'docx', 'txt', 'zip', 'rar',
    ],
    resource_type: 'auto',
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadFiles = multer({
  storage: fileStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});
