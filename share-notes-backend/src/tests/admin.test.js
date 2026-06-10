import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import { API, loginAndGetCookie, createAdminUser } from './helpers.js';

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
  await User.deleteMany({});
});

describe('Admin Routes', () => {
  it('GET /api/admin/dashboard - Debe retornar 401 sin autenticación', async () => {
    const res = await request(app).get(`${API}/admin/dashboard`);
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/dashboard - Debe retornar 403 para usuario normal', async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).get(`${API}/admin/dashboard`).set('Cookie', cookie);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/permisos de administrador/i);
  });

  it('GET /api/admin/dashboard - Debe retornar stats para admin', async () => {
    const { cookie } = await createAdminUser();
    const res = await request(app).get(`${API}/admin/dashboard`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.stats).toHaveProperty('totalUsers');
  });

  it('GET /api/admin/users - Debe retornar lista de usuarios para admin', async () => {
    const { cookie } = await createAdminUser();
    const res = await request(app).get(`${API}/admin/users`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.users).toBeInstanceOf(Array);
  });

  it('PUT /api/admin/users/role - Debe cambiar rol para admin', async () => {
    const { cookie: adminCookie } = await createAdminUser();
    const targetUser = await User.create({ name: 'Target', email: 'target@test.com', password: 'pass123' });

    const res = await request(app).put(`${API}/admin/users/role`).set('Cookie', adminCookie).send({
      userId: targetUser._id,
      role: 'admin',
    });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('admin');
  });

  it('PUT /api/admin/users/role - Debe retornar 400 con rol inválido', async () => {
    const { cookie } = await createAdminUser();
    const res = await request(app).put(`${API}/admin/users/role`).set('Cookie', cookie).send({
      userId: new mongoose.Types.ObjectId(),
      role: 'superadmin',
    });
    expect(res.status).toBe(400);
  });

  it('DELETE /api/admin/users/:userId - Debe eliminar usuario como admin', async () => {
    const { cookie: adminCookie } = await createAdminUser();
    const target = await User.create({ name: 'Delete', email: 'delete@test.com', password: 'pass123' });

    const res = await request(app).delete(`${API}/admin/users/${target._id}`).set('Cookie', adminCookie);
    expect(res.status).toBe(200);
  });

  it('DELETE /api/admin/users/:userId - Debe retornar 400 al intentar auto-eliminarse', async () => {
    const { cookie, userId } = await createAdminUser();
    const res = await request(app).delete(`${API}/admin/users/${userId}`).set('Cookie', cookie);
    expect(res.status).toBe(400);
  });

  it('GET /api/admin/notes - Debe retornar todas las notas para admin', async () => {
    const { cookie } = await createAdminUser();
    const res = await request(app).get(`${API}/admin/notes`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.notes).toBeInstanceOf(Array);
  });
});
