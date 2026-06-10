import { Router } from 'express';
import { createDocFromNote, createDocFromTask } from '../controllers/googleDocs.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/notes/:id/google-doc', verifyToken, createDocFromNote);
router.post('/tasks/:id/google-doc', verifyToken, createDocFromTask);

export default router;