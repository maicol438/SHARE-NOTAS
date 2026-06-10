import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Note from '../models/Note.js';
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
  await Note.deleteMany({});
  await Category.deleteMany({});
  await User.deleteMany({});
});

describe('Categories CRUD', () => {
  it('GET /api/categories - Debe retornar 401 sin autenticación', async () => {
    const res = await request(app).get(`${API}/categories`);
    expect(res.status).toBe(401);
  });

  it('GET /api/categories - Debe retornar lista vacía', async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).get(`${API}/categories`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.categories).toEqual([]);
  });

  it('POST /api/categories - Debe crear categoría', async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).post(`${API}/categories`).set('Cookie', cookie).send({
      name: 'Matemáticas',
      color: '#6366f1',
    });
    expect(res.status).toBe(201);
    expect(res.body.category.name).toBe('Matemáticas');
  });

  it('POST /api/categories - Debe retornar 400 si el nombre es muy corto', async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).post(`${API}/categories`).set('Cookie', cookie).send({
      name: 'A',
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/categories - Debe retornar 400 si el nombre se duplica', async () => {
    const { cookie } = await loginAndGetCookie();
    await request(app).post(`${API}/categories`).set('Cookie', cookie).send({ name: 'Única', color: '#6366f1' });
    const res = await request(app).post(`${API}/categories`).set('Cookie', cookie).send({ name: 'Única', color: '#6366f1' });
    expect(res.status).toBe(400);
  });

  it('PUT /api/categories/:id - Debe actualizar categoría', async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const cat = await Category.create({ name: 'Original', color: '#6366f1', user: userId });

    const res = await request(app).put(`${API}/categories/${cat._id}`).set('Cookie', cookie).send({
      name: 'Actualizada',
      color: '#ffffff',
    });
    expect(res.status).toBe(200);
    expect(res.body.category.name).toBe('Actualizada');
  });

  it('PUT /api/categories/:id - Debe retornar 404 si no existe', async () => {
    const { cookie } = await loginAndGetCookie();
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`${API}/categories/${fakeId}`).set('Cookie', cookie).send({
      name: 'Nope',
    });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/categories/:id - Debe eliminar categoría', async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const cat = await Category.create({ name: 'Eliminar', color: '#6366f1', user: userId });

    const res = await request(app).delete(`${API}/categories/${cat._id}`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminada/i);
  });

  it('DELETE /api/categories/:id - Debe retornar 400 si tiene notas asociadas', async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const cat = await Category.create({ name: 'Con Notas', color: '#6366f1', user: userId });
    await Note.create({ title: 'Nota ligada', content: '...', category: cat._id, user: userId });

    const res = await request(app).delete(`${API}/categories/${cat._id}`).set('Cookie', cookie);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/nota/);
  });
});
