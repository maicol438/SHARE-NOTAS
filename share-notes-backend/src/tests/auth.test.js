import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import { API, registerUser, loginAndGetCookie } from './helpers.js';

beforeAll(async () => {
  const testUri = process.env.MONGO_URI_TEST;
  if (!testUri) {
    throw new Error('MONGO_URI_TEST no está configurada');
  }
  await mongoose.connect(testUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/auth/register', () => {
  it('Debe registrar un usuario y devolver 201 sin cookie', async () => {
    const res = await request(app).post(`${API}/auth/register`).send({
      name: 'Ana García',
      email: 'ana@test.com',
      password: 'secret123',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('ana@test.com');
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('Debe retornar 400 si el email ya está registrado', async () => {
    await request(app).post(`${API}/auth/register`).send({
      name: 'Usuario 1',
      email: 'duplicado@test.com',
      password: 'pass123',
    });
    const res = await request(app).post(`${API}/auth/register`).send({
      name: 'Usuario 2',
      email: 'duplicado@test.com',
      password: 'pass456',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/registrado/i);
  });

  it('Debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app).post(`${API}/auth/register`).send({
      name: 'Incompleto',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('Debe iniciar sesión y devolver 200 con cookie', async () => {
    await registerUser({ email: 'login@test.com' });
    const res = await request(app).post(`${API}/auth/login`).send({
      email: 'login@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).not.toHaveProperty('token');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('Debe retornar 401 con contraseña incorrecta', async () => {
    await registerUser({ email: 'wrong@test.com' });
    const res = await request(app).post(`${API}/auth/login`).send({
      email: 'wrong@test.com',
      password: 'wrongpass',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/credenciales/i);
  });

  it('Debe retornar 401 con email no registrado', async () => {
    const res = await request(app).post(`${API}/auth/login`).send({
      email: 'noexiste@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });

  it('Debe retornar 400 si faltan email o password', async () => {
    const res = await request(app).post(`${API}/auth/login`).send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/logout', () => {
  it('Debe cerrar sesión y limpiar la cookie', async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).post(`${API}/auth/logout`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/sesión cerrada/i);
  });
});

describe('GET /api/auth/me', () => {
  it('Debe retornar 401 sin cookie de autenticación', async () => {
    const res = await request(app).get(`${API}/auth/me`);
    expect(res.status).toBe(401);
  });

  it('Debe retornar el perfil del usuario autenticado', async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).get(`${API}/auth/me`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('logintest@test.com');
  });

  it('Debe retornar 401 con token inválido', async () => {
    const res = await request(app).get(`${API}/auth/me`).set('Cookie', ['token=invalidtoken123']);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('Debe enviar enlace para email registrado', async () => {
    await registerUser({ email: 'reset@test.com' });
    const res = await request(app).post(`${API}/auth/forgot-password`).send({
      email: 'reset@test.com',
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/enlace/i);
  });

  it('Debe devolver 400 si no se proporciona email', async () => {
    const res = await request(app).post(`${API}/auth/forgot-password`).send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/reset-password/:token', () => {
  it('Debe retornar 400 con token inválido', async () => {
    const res = await request(app).post(`${API}/auth/reset-password/invalidtoken123`).send({
      password: 'newpassword123',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/token/i);
  });

  it('Debe retornar 400 si la contraseña es muy corta', async () => {
    const res = await request(app).post(`${API}/auth/reset-password/sometoken`).send({
      password: '123',
    });
    expect(res.status).toBe(400);
  });
});
