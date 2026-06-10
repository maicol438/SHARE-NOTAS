import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
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
  await User.deleteMany({});
});

describe('Profile', () => {
  it('GET /api/users/me - Debe retornar 401 sin autenticación', async () => {
    const res = await request(app).get(`${API}/users/me`);
    expect(res.status).toBe(401);
  });

  it('GET /api/users/me - Debe retornar perfil del usuario', async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).get(`${API}/users/me`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('name');
    expect(res.body).toHaveProperty('stats');
  });

  it('PUT /api/users/me - Debe actualizar nombre', async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).put(`${API}/users/me`).set('Cookie', cookie).send({
      name: 'Nuevo Nombre',
    });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Nuevo Nombre');
  });

  it('PUT /api/users/me - Debe retornar 400 al cambiar password sin contraseña actual', async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).put(`${API}/users/me`).set('Cookie', cookie).send({
      newPassword: 'newpass123',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/contraseña actual/i);
  });

  it('DELETE /api/users/me - Debe retornar 401 sin autenticación', async () => {
    const res = await request(app).delete(`${API}/users/me`);
    expect(res.status).toBe(401);
  });

  it('DELETE /api/users/me - Debe retornar 401 con contraseña incorrecta', async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).delete(`${API}/users/me`).set('Cookie', cookie).send({
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/users/me - Debe eliminar cuenta con contraseña correcta', async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).delete(`${API}/users/me`).set('Cookie', cookie).send({
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminada/i);
  });

  it('PUT /api/users/me - Debe retornar 400 si el email ya está en uso', async () => {
    const { cookie } = await loginAndGetCookie();
    await request(app).post(`${API}/auth/register`).send({
      name: 'Other', email: 'existing@test.com', password: 'password123',
    });
    const res = await request(app).put(`${API}/users/me`).set('Cookie', cookie).send({
      email: 'existing@test.com',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email ya está en uso/i);
  });
});
