import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import passport from "passport";
import { swaggerDocs } from "./config/swagger.js";
import { initializeGoogleAuth } from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import noteRoutes from "./routes/note.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import searchRoutes from "./routes/search.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import notebookRoutes from "./routes/notebook.routes.js";
import fileRoutes from "./routes/file.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

initializeGoogleAuth();

const app = express();

// ── Middlewares globales ──────────────────────────────────
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(morgan("dev"));

// ── Favicon ────────────────────────────────────────────────
app.get("/favicon.ico", (_req, res) => res.status(204).end());

// ── Swagger ───────────────────────────────────────────────
swaggerDocs(app);

// ── Rutas API ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", commentRoutes);
app.use("/api", searchRoutes);
app.use("/api/users", profileRoutes);
app.use("/api/notebooks", notebookRoutes);
app.use("/api/files", fileRoutes);

// ── Health Check ──────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", message: "Share Notes API is running 🚀" });
});

// ── Manejador global de errores ───────────────────────────
app.use(errorHandler);

export default app;
