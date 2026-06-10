import { Router } from 'express';
import {
  exportNoteAsDocx,
  exportTaskAsDocx,
} from '../controllers/docxExport.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/notes/:id/export-docx', verifyToken, exportNoteAsDocx);
router.post('/tasks/:id/export-docx', verifyToken, exportTaskAsDocx);

export default router;
