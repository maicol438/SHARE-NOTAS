import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';

export const API = '/api';

export const registerUser = async (overrides = {}) => {
  const data = {
    name: 'Test User',
    email: 'test@test.com',
    password: 'password123',
    ...overrides,
  };
  const res = await request(app).post(`${API}/auth/register`).send(data);
  return { userId: res.body.user?._id };
};

export const loginAndGetCookie = async (overrides = {}) => {
  const email = overrides.email || 'logintest@test.com';
  const password = overrides.password || 'password123';

  await request(app).post(`${API}/auth/register`).send({
    name: 'Test User',
    email,
    password,
  });

  const res = await request(app).post(`${API}/auth/login`).send({ email, password });
  return { cookie: res.headers['set-cookie'], userId: res.body.user?._id };
};

export const createAdminUser = async () => {
  const { cookie, userId } = await loginAndGetCookie({ email: 'admin@test.com' });
  await User.findByIdAndUpdate(userId, { role: 'admin' });
  return { cookie, userId };
};
