import Note from '../models/Note.js';
import User from '../models/User.js';
import { createGoogleDoc } from '../services/googleDocs.service.js';

const findNote = async (noteId, userId) => {
  return await Note.findOne({
    _id: noteId,
    $or: [
      { user: userId },
      { 'sharedWith': { $elemMatch: { user: userId, permission: 'edit' } } },
    ],
  });
};

const createDoc = async (note, type, userId) => {
  const collaborators = [];

  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw new Error('Usuario no encontrado');
  }
  if (!currentUser.googleAccessToken) {
    const err = new Error(
      'insufficient_scopes: Debes conectar tu cuenta de Google con los permisos requeridos antes de exportar a Google Docs.'
    );
    err.status = 403;
    throw err;
  }

  const userAccessToken = currentUser.googleAccessToken;
  const userRefreshToken = currentUser.googleRefreshToken;

  const owner = await User.findById(note.user);
  if (owner?.email) collaborators.push(owner.email);

  for (const share of note.sharedWith || []) {
    const targetUser = await User.findById(share.user);
    if (targetUser?.email && !collaborators.includes(targetUser.email)) {
      collaborators.push(targetUser.email);
    }
  }

  const title = type === 'task' ? `[Tarea] ${note.title}` : note.title;
  const content = type === 'task'
    ? (note.description ? `${note.description}\n\n${note.content || ''}` : note.content || 'Tarea sin descripción')
    : note.content;

  return await createGoogleDoc(title, content, collaborators, userAccessToken, userRefreshToken);
};

export const createDocFromNote = async (req, res, _next) => {
  try {
    const note = await findNote(req.params.id, req.userId);
    if (!note) {
      return res.status(404).json({ message: 'Nota no encontrada o no tienes permiso de edición' });
    }

    if (!note.content && !note.title) {
      return res.status(400).json({ message: 'La nota está vacía. Escribe algo antes de exportar.' });
    }

    const force = req.query.force === 'true';

    if (note.googleDocId && !force) {
      return res.json({
        message: 'El documento ya existe',
        googleDocUrl: `https://docs.google.com/document/d/${note.googleDocId}/edit`,
        googleDocId: note.googleDocId,
      });
    }

    const result = await createDoc(note, 'note', req.userId);

    note.googleDocId = result.documentId;
    await note.save();

    res.json({
      message: 'Documento de Google creado',
      googleDocUrl: result.url,
      googleDocId: result.documentId,
    });
  } catch (error) {
    const googleError = error?.response?.data?.error?.message || error.message;
    console.error('Error en createDocFromNote:', googleError);

    const errorCode = error?.response?.status || error?.status || error?.code;
    const isInsufficientScope = errorCode === 403 || 
                                 googleError.toLowerCase().includes('insufficient') || 
                                 googleError.toLowerCase().includes('scope') || 
                                 googleError.toLowerCase().includes('permission') ||
                                 googleError.toLowerCase().includes('caller does not have permission');

    if (isInsufficientScope) {
      return res.status(403).json({
        message: 'Se requieren permisos de Google Drive',
        detail: 'insufficient_scopes: ' + googleError,
      });
    }

    return res.status(500).json({
      message: 'Error al crear documento en Google Docs',
      detail: googleError,
    });
  }
};

export const createDocFromTask = async (req, res, _next) => {
  try {
    const note = await findNote(req.params.id, req.userId);
    if (!note || note.type !== 'task') {
      return res.status(404).json({ message: 'Tarea no encontrada o no tienes permiso de edición' });
    }

    const force = req.query.force === 'true';

    if (note.googleDocId && !force) {
      return res.json({
        message: 'El documento ya existe',
        googleDocUrl: `https://docs.google.com/document/d/${note.googleDocId}/edit`,
        googleDocId: note.googleDocId,
      });
    }

    const result = await createDoc(note, 'task', req.userId);

    note.googleDocId = result.documentId;
    await note.save();

    res.json({
      message: 'Documento de Google creado para la tarea',
      googleDocUrl: result.url,
      googleDocId: result.documentId,
    });
  } catch (error) {
    const googleError = error?.response?.data?.error?.message || error.message;
    console.error('Error en createDocFromTask:', googleError);

    const errorCode = error?.response?.status || error?.status || error?.code;
    const isInsufficientScope = errorCode === 403 || 
                                 googleError.toLowerCase().includes('insufficient') || 
                                 googleError.toLowerCase().includes('scope') || 
                                 googleError.toLowerCase().includes('permission') ||
                                 googleError.toLowerCase().includes('caller does not have permission');

    if (isInsufficientScope) {
      return res.status(403).json({
        message: 'Se requieren permisos de Google Drive',
        detail: 'insufficient_scopes: ' + googleError,
      });
    }

    return res.status(500).json({
      message: 'Error al crear documento en Google Docs',
      detail: googleError,
    });
  }
};
