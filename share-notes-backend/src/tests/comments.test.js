import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Note from '../models/Note.js';
import Comment from '../models/Comment.js';
import Category from '../models/Category.js';
import { API, loginAndGetCookie } from './helpers.js';

beforeAll(async () => {
  const testUri = process.env.MONGO_URI_TEST;
  if (!testUri) throw new Error('MONGO_URI_TEST no está configurada');
  await mongoose.connect(testUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Comment.deleteMany({});
  await Note.deleteMany({});
  await Category.deleteMany({});
  await User.deleteMany({});
});

const createNoteWithCategory = async (userId, overrides = {}) => {
  const cat = await Category.create({ name: 'TestCat', color: '#6366f1', user: userId });
  return Note.create({ title: 'Test', content: '...', category: cat._id, user: userId, ...overrides });
};

describe('Comments', () => {
  it('GET /api/notes/:noteId/comments - Debe retornar 401 sin autenticación', async () => {
    const res = await request(app).get(`${API}/notes/123/comments`);
    expect(res.status).toBe(401);
  });

  it('GET /api/notes/:noteId/comments - Debe retornar lista vacía', async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const note = await createNoteWithCategory(userId);

    const res = await request(app).get(`${API}/notes/${note._id}/comments`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.comments).toEqual([]);
  });

  it('POST /api/notes/:noteId/comments - Debe crear un comentario', async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const note = await createNoteWithCategory(userId);

    const res = await request(app).post(`${API}/notes/${note._id}/comments`).set('Cookie', cookie).send({
      content: 'Excelente nota!',
    });
    expect(res.status).toBe(201);
    expect(res.body.comment.content).toBe('Excelente nota!');
  });

  it('POST /api/notes/:noteId/comments - Debe retornar 403 si no tiene acceso', async () => {
    const { userId: ownerId } = await loginAndGetCookie({ email: 'owner@test.com' });
    const note = await createNoteWithCategory(ownerId, { isPublic: false });

    const { cookie: otherCookie } = await loginAndGetCookie({ email: 'intruder@test.com' });
    const res = await request(app).post(`${API}/notes/${note._id}/comments`).set('Cookie', otherCookie).send({
      content: 'No debería poder comentar',
    });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/permiso/i);
  });

  it('POST /api/notes/:noteId/comments - Debe permitir comentar en nota pública', async () => {
    const { userId: ownerId } = await loginAndGetCookie({ email: 'publicowner@test.com' });
    const note = await createNoteWithCategory(ownerId, { isPublic: true });

    const { cookie } = await loginAndGetCookie({ email: 'commenter@test.com' });
    const res = await request(app).post(`${API}/notes/${note._id}/comments`).set('Cookie', cookie).send({
      content: 'Comentario en nota pública',
    });
    expect(res.status).toBe(201);
  });

  it('DELETE /api/comments/:id - Debe eliminar propio comentario', async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const note = await createNoteWithCategory(userId);
    const comment = await Comment.create({ content: 'Mi comentario', note: note._id, user: userId });

    const res = await request(app).delete(`${API}/comments/${comment._id}`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });

  it('DELETE /api/comments/:id - Debe retornar 404 si no es su comentario', async () => {
    const { userId: ownerId } = await loginAndGetCookie({ email: 'noteowner@test.com' });
    const note = await createNoteWithCategory(ownerId);
    const { userId: otherUserId } = await loginAndGetCookie({ email: 'otheruser@test.com' });
    const comment = await Comment.create({ content: 'Otro comentario', note: note._id, user: otherUserId });

    const { cookie: thirdUser } = await loginAndGetCookie({ email: 'third@test.com' });
    const res = await request(app).delete(`${API}/comments/${comment._id}`).set('Cookie', thirdUser);
    expect(res.status).toBe(404);
  });
});
