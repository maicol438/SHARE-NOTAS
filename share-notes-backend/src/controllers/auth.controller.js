import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

const clearTokenCookie = (res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.json({
      message: "Sesión iniciada correctamente",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Sesión cerrada correctamente" });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado o eliminado" });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const googleAuthCallback = async (req, res, next) => {
  try {
    const token = generateToken(req.user);
    setTokenCookie(res, token);
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`);
  } catch (error) {
    next(error);
  }
};
