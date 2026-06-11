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

describe('Auth Middleware', () => {
  it('Debe retornar 401 sin token', async () => {
    const res = await request(app).get(`${API}/auth/me`);
    expect(res.status).toBe(401);
  });

  it('Debe retornar 401 con token inválido', async () => {
    const res = await request(app).get(`${API}/auth/me`).set('Cookie', ['token=invalid']);
    expect(res.status).toBe(401);
  });

  it('Debe retornar 401 con token vacío', async () => {
    const res = await request(app).get(`${API}/auth/me`).set('Cookie', ['token=']);
    expect(res.status).toBe(401);
  });

  it('Debe retornar 401 con Authorization header inválido', async () => {
    const res = await request(app).get(`${API}/auth/me`).set('Authorization', 'InvalidFormat');
    expect(res.status).toBe(401);
  });

  it('Debe aceptar token en Authorization header Bearer', async () => {
    const { cookie } = await loginAndGetCookie();
    const token = cookie[0].split('=')[1].split(';')[0];

    const res = await request(app).get(`${API}/auth/me`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('Debe retornar 401 con token expirado', async () => {
    const jwt = await import('jsonwebtoken');
    const expiredToken = jwt.default.sign({ id: new mongoose.Types.ObjectId().toString() }, process.env.JWT_SECRET, { expiresIn: '0s' });
    await new Promise(r => setTimeout(r, 100));
    const res = await request(app).get(`${API}/auth/me`).set('Cookie', [`token=${expiredToken}`]);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/expirado|inválido/i);
  });
});

describe('Admin Middleware', () => {
  it('Debe retornar 403 para usuario no admin', async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).get(`${API}/admin/dashboard`).set('Cookie', cookie);
    expect(res.status).toBe(403);
  });

  it('Debe permitir acceso a admin', async () => {
    const { cookie } = await createAdminUser();
    const res = await request(app).get(`${API}/admin/dashboard`).set('Cookie', cookie);
    expect(res.status).toBe(200);
  });

  it('Debe retornar 500 si User.findById falla por ID inválido', async () => {
    const jwt = await import('jsonwebtoken');
    const invalidToken = jwt.default.sign({ id: 'invalid-id-format' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).get(`${API}/admin/dashboard`).set('Cookie', [`token=${invalidToken}`]);
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/error al verificar permisos/i);
  });
});

describe('Error Handler', () => {
  it('Debe retornar 404 para rutas inexistentes', async () => {
    const res = await request(app).get(`${API}/ruta-inexistente`);
    expect(res.status).toBe(404);
  });

  it('Debe retornar 400 para IDs inválidos', async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).get(`${API}/notes/invalid-id-format`).set('Cookie', cookie);
    expect(res.status).toBe(400);
  });
});

describe('Health Endpoint', () => {
  it('GET /api/health - Debe retornar status OK', async () => {
    const res = await request(app).get(`${API}/health`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('GET / - Debe retornar mensaje del servidor', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/servidor funcionando/i);
  });
});
