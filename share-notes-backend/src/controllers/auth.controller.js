import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ── Helper: generar token y setear cookie ─────────────────────────
const sendTokenCookie = (res, user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,           // Inaccesible desde JS del navegador (mitiga XSS)
    secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
    sameSite: "lax",          // Protección básica contra CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
  });

  return token;
};

// ── POST /api/auth/register ───────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const user = await User.create({ name, email, password });
    sendTokenCookie(res, user);

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    // Traemos la contraseña explícitamente (select: false en el modelo)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    sendTokenCookie(res, user);

    res.json({
      message: "Sesión iniciada correctamente",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────
export const logout = (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "Sesión cerrada correctamente" });
};

// ── GET /api/auth/me ──────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/auth/google/callback ────────────────────────────────
export const googleAuthCallback = async (req, res, next) => {
  try {
    sendTokenCookie(res, req.user);
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173/dashboard");
  } catch (error) {
    next(error);
  }
};
