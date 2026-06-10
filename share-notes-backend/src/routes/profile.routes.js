import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAccount,
} from '../controllers/profile.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { uploadAvatar } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.get('/me', verifyToken, getProfile);
router.put('/me', verifyToken, updateProfile);

router.post('/me/avatar', verifyToken, (req, res, next) => {
  uploadAvatar.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    updateAvatar(req, res, next);
  });
});

router.delete('/me', verifyToken, deleteAccount);

export default router;
