import { Router } from "express";
import passport from "passport";
import { register, login, logout, getMe, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

const googleEnabled = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registro, login y gestión de sesión
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *           examples:
 *             registro:
 *               summary: Ejemplo de registro
 *               value:
 *                 name: "Ana García"
 *                 email: "ana@email.com"
 *                 password: "secret123"
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Email ya registrado o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register", authLimiter, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ana@email.com"
 *               password:
 *                 type: string
 *                 example: "secret123"
 *           examples:
 *             login:
 *               summary: Ejemplo de inicio de sesión
 *               value:
 *                 email: "ana@email.com"
 *                 password: "secret123"
 *     responses:
 *       200:
 *         description: Sesión iniciada y cookie HTTP-only seteada
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", authLimiter, login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión (elimina la cookie)
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cookie eliminada
 */
router.post("/logout", logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: No autenticado
 */
router.get("/me", verifyToken, getMe);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

if (googleEnabled) {
  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
      session: false,
    })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect(process.env.CLIENT_URL || "https://share-notas.vercel.app");
    }
  );
}

export default router;
