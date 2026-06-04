import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";
import Note from "../models/Note.js";
import Category from "../models/Category.js";
import { API, loginAndGetCookie, registerUser } from "./helpers.js";

let categoryId;

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
  await User.deleteMany({});
});

describe("Notes CRUD", () => {
  it("GET /api/notes - Debe retornar 401 sin autenticación", async () => {
    const res = await request(app).get(`${API}/notes`);
    expect(res.status).toBe(401);
  });

  it("GET /api/notes - Debe retornar lista vacía para nuevo usuario", async () => {
    const { cookie } = await loginAndGetCookie();
    const res = await request(app).get(`${API}/notes`).set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.notes).toEqual([]);
  });

  it("POST /api/notes - Debe crear una nota y retornar 201", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const category = await Category.create({ name: "Matemáticas", color: "#6366f1", user: userId });
    categoryId = category._id;

    const res = await request(app).post(`${API}/notes`).set("Cookie", cookie).send({
      title: "Apuntes de Álgebra",
      content: "Las matrices son...",
      category: categoryId,
    });

    expect(res.status).toBe(201);
    expect(res.body.note.title).toBe("Apuntes de Álgebra");
    expect(res.body.note.category.name).toBe("Matemáticas");
  });

  it("POST /api/notes - Debe retornar 400 con categoría inválida", async () => {
    const { cookie } = await loginAndGetCookie();
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).post(`${API}/notes`).set("Cookie", cookie).send({
      title: "Nota sin categoría válida",
      content: "Contenido",
      category: fakeId,
    });
    expect(res.status).toBe(400);
  });

  it("GET /api/notes/:id - Debe retornar una nota por ID", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const category = await Category.create({ name: "Ciencia", color: "#6366f1", user: userId });
    const note = await Note.create({ title: "Nota Test", content: "Contenido", category: category._id, user: userId });

    const res = await request(app).get(`${API}/notes/${note._id}`).set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.note.title).toBe("Nota Test");
  });

  it("GET /api/notes/:id - Debe retornar 404 si la nota no pertenece al usuario", async () => {
    const { cookie } = await loginAndGetCookie();
    const otherId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`${API}/notes/${otherId}`).set("Cookie", cookie);
    expect(res.status).toBe(404);
  });

  it("PUT /api/notes/:id - Debe actualizar una nota", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const category = await Category.create({ name: "Física", color: "#6366f1", user: userId });
    const note = await Note.create({ title: "Original", content: "Original", category: category._id, user: userId });

    const res = await request(app).put(`${API}/notes/${note._id}`).set("Cookie", cookie).send({
      title: "Actualizado",
    });
    expect(res.status).toBe(200);
    expect(res.body.note.title).toBe("Actualizado");
  });

  it("PUT /api/notes/:id - Debe retornar 404 si no existe", async () => {
    const { cookie } = await loginAndGetCookie();
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`${API}/notes/${fakeId}`).set("Cookie", cookie).send({
      title: "Nope",
    });
    expect(res.status).toBe(404);
  });

  it("DELETE /api/notes/:id - Debe mover a papelera (soft delete)", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const category = await Category.create({ name: "Soft", color: "#6366f1", user: userId });
    const note = await Note.create({ title: "Para eliminar", content: "...", category: category._id, user: userId });

    const res = await request(app).delete(`${API}/notes/${note._id}`).set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/papelera/i);

    const deleted = await Note.findById(note._id);
    expect(deleted.deletedAt).not.toBeNull();
  });

  it("PATCH /api/notes/:id/pin - Debe alternar el pin", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const category = await Category.create({ name: "Pin", color: "#6366f1", user: userId });
    const note = await Note.create({ title: "Pin test", content: "...", category: category._id, user: userId });

    const res = await request(app).patch(`${API}/notes/${note._id}/pin`).set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/fijada/i);
  });

  it("PATCH /api/notes/:id/favorite - Debe alternar favorito", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const category = await Category.create({ name: "Fav", color: "#6366f1", user: userId });
    const note = await Note.create({ title: "Fav test", content: "...", category: category._id, user: userId });

    const res = await request(app).patch(`${API}/notes/${note._id}/favorite`).set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/favorita/i);
  });
});

describe("Tasks", () => {
  let taskCategory;

  const createTaskCategory = async (userId) => {
    if (!taskCategory) {
      taskCategory = await Category.create({ name: "Tareas", color: "#6366f1", user: userId });
    }
    return taskCategory;
  };

  it("GET /api/notes/tasks - Debe retornar tareas", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const cat = await createTaskCategory(userId);
    await Note.create({ title: "Tarea 1", type: "task", user: userId, category: cat._id });

    const res = await request(app).get(`${API}/notes/tasks`).set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThanOrEqual(1);
  });

  it("PATCH /api/notes/tasks/:id/complete - Debe alternar completado", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const cat = await createTaskCategory(userId);
    const task = await Note.create({ title: "Completar", type: "task", user: userId, category: cat._id });

    const res = await request(app).patch(`${API}/notes/tasks/${task._id}/complete`).set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.note.isCompleted).toBe(true);
  });

  it("PATCH /api/notes/tasks/:id/complete - Debe retornar 404 si no es tarea", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const cat = await createTaskCategory(userId);
    const note = await Note.create({ title: "No task", type: "note", user: userId, category: cat._id });

    const res = await request(app).patch(`${API}/notes/tasks/${note._id}/complete`).set("Cookie", cookie);
    expect(res.status).toBe(404);
  });
});

describe("Public Notes", () => {
  it("GET /api/notes/public - Debe retornar notas públicas", async () => {
    const { userId } = await loginAndGetCookie();
    const cat = await Category.create({ name: "Pub", color: "#6366f1", user: userId });
    await Note.create({ title: "Pública", content: "...", isPublic: true, user: userId, category: cat._id });

    const res = await request(app).get(`${API}/notes/public`);
    expect(res.status).toBe(200);
    expect(res.body.notes.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/notes/public/:id - Debe retornar nota pública por ID", async () => {
    const { userId } = await loginAndGetCookie();
    const cat = await Category.create({ name: "Pub2", color: "#6366f1", user: userId });
    const note = await Note.create({ title: "Pública ID", content: "...", isPublic: true, user: userId, category: cat._id });

    const res = await request(app).get(`${API}/notes/public/${note._id}`);
    expect(res.status).toBe(200);
    expect(res.body.note.title).toBe("Pública ID");
  });
});

describe("Share", () => {
  it("POST /api/notes/:id/share - Debe compartir nota con otro usuario", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const otherUser = await User.create({ name: "Other", email: "other@test.com", password: "pass123" });
    const category = await Category.create({ name: "Share", color: "#6366f1", user: userId });
    const note = await Note.create({ title: "Shared", content: "...", category: category._id, user: userId });

    const res = await request(app).post(`${API}/notes/${note._id}/share`).set("Cookie", cookie).send({
      email: "other@test.com",
      permission: "read",
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/compartida/i);
  });

  it("POST /api/notes/:id/share - Debe retornar 404 si el email no existe", async () => {
    const { cookie, userId } = await loginAndGetCookie();
    const category = await Category.create({ name: "Share2", color: "#6366f1", user: userId });
    const note = await Note.create({ title: "No share", content: "...", category: category._id, user: userId });

    const res = await request(app).post(`${API}/notes/${note._id}/share`).set("Cookie", cookie).send({
      email: "noexiste@test.com",
    });
    expect(res.status).toBe(404);
  });
});
