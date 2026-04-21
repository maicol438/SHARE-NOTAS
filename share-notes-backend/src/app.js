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
import { errorHandler } from "./middlewares/error.middleware.js";

initializeGoogleAuth();

const app = express();

// ── Middlewares globales ──────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Permite envío de cookies entre dominios
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(morgan("dev"));

// ── Swagger ───────────────────────────────────────────────────────
swaggerDocs(app);

// ── Rutas ─────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", commentRoutes);

// ── Health Check ──────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", message: "Share Notes API is running 🚀" });
});

// ── Manejador global de errores ───────────────────────────────────
app.use(errorHandler);

export default app;
