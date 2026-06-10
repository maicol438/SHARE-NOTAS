import { Router } from 'express';
import {
  advancedSearch,
  getStats,
  getAllTags,
} from '../controllers/search.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/search', verifyToken, advancedSearch);
router.get('/stats', verifyToken, getStats);
router.get('/tags', verifyToken, getAllTags);

export default router;