import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Note from "../models/Note.js";
import Category from "../models/Category.js";
import Notebook from "../models/Notebook.js";
import { API, loginAndGetCookie } from "./helpers.js";

beforeAll(async () => {
  const testUri = process.env.MONGO_URI_TEST;
  if (!testUri) throw new Error("MONGO_URI_TEST no está configurada");
  await mongoose.connect(testUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Note.deleteMany({});
  await Category.deleteMany({});
  await Notebook.deleteMany({});
  await User.deleteMany({});
});

const createNoteWithCategory = async (userId, overrides = {}) => {
  const cat = await Category.create({ name: "TestCat", color: "#6366f1", user: userId });
  return Note.create({ title: "Test", content: "...", category: cat._id, user: userId, ...overrides });
};

describe("Search", () => {
  it("GET /api/search - Debe retornar 401 sin autenticación", async () => {
    const res = await request(app).get(`${API}/search`);
    expect(res.status).toBe(401);
  });

  it("GET /api/search - Debe buscar notas por texto", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    await createNoteWithCategory(userId, { title: "Álgebra lineal", content: "Matrices y vectores" });

    const res = await request(app).get(`${API}/search?q=álgebra`).set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.notes.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/search - Debe retornar lista vacía sin coincidencias", async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).get(`${API}/search?q=noexiste`).set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.notes).toEqual([]);
  });
});

describe("Notebooks", () => {
  it("GET /api/notebooks - Debe retornar 401 sin autenticación", async () => {
    const res = await request(app).get(`${API}/notebooks`);
    expect(res.status).toBe(401);
  });

  it("POST /api/notebooks - Debe crear un cuaderno", async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).post(`${API}/notebooks`).set("Cookie", cookie).send({
      name: "Mi Cuaderno",
      description: "Notas de matemáticas",
    });
    expect(res.status).toBe(201);
    expect(res.body.notebook.name).toBe("Mi Cuaderno");
  });

  it("PUT /api/notebooks/:id - Debe actualizar cuaderno", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const nb = await Notebook.create({ name: "Original", user: userId });

    const res = await request(app).put(`${API}/notebooks/${nb._id}`).set("Cookie", cookie).send({
      name: "Actualizado",
    });
    expect(res.status).toBe(200);
    expect(res.body.notebook.name).toBe("Actualizado");
  });

  it("DELETE /api/notebooks/:id - Debe eliminar cuaderno", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const nb = await Notebook.create({ name: "Eliminar", user: userId });

    const res = await request(app).delete(`${API}/notebooks/${nb._id}`).set("Cookie", cookie);
    expect(res.status).toBe(200);
  });

  it("GET /api/stats - Debe retornar estadísticas", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const cat = await Category.create({ name: "StatsCat", color: "#6366f1", user: userId });
    await Note.create({ title: "Note 1", content: "...", category: cat._id, user: userId, tags: ["tag1"] });

    const res = await request(app).get(`${API}/stats`).set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalNotes");
  });

  it("GET /api/tags - Debe retornar tags del usuario", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const cat = await Category.create({ name: "TagsCat", color: "#6366f1", user: userId });
    const note = await Note.create({ title: "Tagged", content: "...", category: cat._id, user: userId, tags: ["importante"] });

    const res = await request(app).get(`${API}/tags`).set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tags)).toBe(true);
  });
});
