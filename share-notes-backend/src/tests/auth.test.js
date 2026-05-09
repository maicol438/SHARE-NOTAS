import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Category from "../models/Category.js";

const API = "/api";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany({});
  await Category.deleteMany({});
});

const registerUser = async () => {
  const res = await request(app).post(`${API}/auth/register`).send({
    name: "Test User",
    email: "test@test.com",
    password: "password123",
  });
  return { userId: res.body.user._id };
};

const loginAndGetCookie = async () => {
  await request(app).post(`${API}/auth/register`).send({
    name: "Test User",
    email: "logintest@test.com",
    password: "password123",
  });
  const res = await request(app).post(`${API}/auth/login`).send({
    email: "logintest@test.com",
    password: "password123",
  });
  const cookie = res.headers["set-cookie"];
  return { cookie, userId: res.body.user._id };
};

describe("Auth Routes", () => {
  describe("POST /api/auth/register", () => {
    it("Debe registrar un usuario y devolver 201 sin cookie", async () => {
      const res = await request(app).post(`${API}/auth/register`).send({
        name: "Ana García",
        email: "ana@test.com",
        password: "secret123",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe("ana@test.com");
      expect(res.body.user).not.toHaveProperty("password");
      expect(res.body).not.toHaveProperty("token");
      expect(res.headers["set-cookie"]).toBeUndefined();
    });

    it("Debe retornar 400 si el email ya está registrado", async () => {
      await request(app).post(`${API}/auth/register`).send({
        name: "Usuario 1",
        email: "duplicado@test.com",
        password: "pass123",
      });

      const res = await request(app).post(`${API}/auth/register`).send({
        name: "Usuario 2",
        email: "duplicado@test.com",
        password: "pass456",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/registrado/i);
    });
  });

  describe("POST /api/auth/login", () => {
    it("Debe iniciar sesión con credenciales correctas y devolver 200 con cookie", async () => {
      await request(app).post(`${API}/auth/register`).send({
        name: "Test User",
        email: "login@test.com",
        password: "mypassword",
      });

      const res = await request(app).post(`${API}/auth/login`).send({
        email: "login@test.com",
        password: "mypassword",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body).not.toHaveProperty("token");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("Debe retornar 401 con contraseña incorrecta", async () => {
      await request(app).post(`${API}/auth/register`).send({
        name: "Test",
        email: "wrong@test.com",
        password: "correctpass",
      });

      const res = await request(app).post(`${API}/auth/login`).send({
        email: "wrong@test.com",
        password: "wrongpass",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/credenciales/i);
    });
  });

  describe("GET /api/auth/me", () => {
    it("Debe retornar 401 sin cookie de autenticación", async () => {
      const res = await request(app).get(`${API}/auth/me`);
      expect(res.status).toBe(401);
    });

    it("Debe retornar el perfil del usuario autenticado", async () => {
      const { cookie } = await loginAndGetCookie();

      const res = await request(app)
        .get(`${API}/auth/me`)
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("logintest@test.com");
    });
  });
});

describe("Notes Routes", () => {
  it("Debe retornar 401 al intentar acceder a notas sin autenticación", async () => {
    const res = await request(app).get(`${API}/notes`);
    expect(res.status).toBe(401);
  });

  it("Debe retornar lista vacía de notas para un nuevo usuario", async () => {
    const { cookie } = await loginAndGetCookie();

    const res = await request(app)
      .get(`${API}/notes`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.notes).toBeInstanceOf(Array);
    expect(res.body.notes.length).toBe(0);
  });

  it("Debe crear una nota y retornar 201", async () => {
    const { cookie, userId } = await loginAndGetCookie();

    const category = await Category.create({
      name: "Matemáticas",
      color: "#6366f1",
      user: userId,
    });

    const res = await request(app)
      .post(`${API}/notes`)
      .set("Cookie", cookie)
      .send({
        title: "Apuntes de Álgebra",
        content: "Las matrices son...",
        category: category._id,
      });

    expect(res.status).toBe(201);
    expect(res.body.note.title).toBe("Apuntes de Álgebra");
    expect(res.body.note.category.name).toBe("Matemáticas");
  });
});
