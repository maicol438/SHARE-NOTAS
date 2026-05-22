import { Router } from "express";
import passport from "passport";
import { register, login, logout, getMe, forgotPassword, resetPassword, generateToken, setTokenCookie } from "../controllers/auth.controller.js";
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
    (req, res, next) => {
      const { mode, redirectTo } = req.query;
      const stateObj = {
        mode: mode || null,
        redirectTo: redirectTo || null,
      };
      const state = Buffer.from(JSON.stringify(stateObj)).toString("base64");

      res.cookie("oauth_mode", mode || "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60 * 1000,
        path: "/",
      });

      passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account",
        session: false,
        state,
      })(req, res, next);
    }
  );

  router.get("/google/drive", (req, res, next) => {
    const { redirectTo } = req.query;
    const state = redirectTo ? Buffer.from(redirectTo).toString("base64") : "";

    passport.authenticate("google", {
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/documents",
      ],
      accessType: "offline",
      prompt: "consent",
      state,
      session: false,
    })(req, res, next);
  });

  router.get(
    "/google/callback",
    (req, res, next) => {
      passport.authenticate("google", { session: false }, (err, user, info) => {
        const clientUrl = process.env.CLIENT_URL || "https://share-notas.vercel.app";

        if (err) {
          console.error("Error en google auth:", err);
          return res.redirect(`${clientUrl}/login?error=auth_error`);
        }

        if (!user) {
          const reason = info?.message || "auth_failed";
          if (reason === "account_not_found") {
            return res.redirect(`${clientUrl}/register?error=account_not_found`);
          }
          if (reason === "account_exists") {
            return res.redirect(`${clientUrl}/login?error=account_exists`);
          }
          return res.redirect(`${clientUrl}/login?error=${reason}`);
        }

        try {
          res.clearCookie("oauth_mode", { path: "/" });

          const token = generateToken(user);
          setTokenCookie(res, token);

          // Intentar decodificar el state
          let originalUrl = null;
          if (req.query.state) {
            try {
              const decoded = JSON.parse(Buffer.from(req.query.state, "base64").toString("ascii"));
              originalUrl = decoded.redirectTo;
            } catch (e) {
              // Fallback para compatibilidad con estados que son strings planos
              try {
                const plain = Buffer.from(req.query.state, "base64").toString("ascii");
                if (!plain.startsWith("{")) {
                  originalUrl = plain;
                }
              } catch (errDec) {}
            }
          }

          if (originalUrl) {
            return res.redirect(originalUrl);
          }

          const welcomeParam = req.isNewGoogleUser ? "?welcome=true" : "";
          res.redirect(`${clientUrl}/dashboard${welcomeParam}`);
        } catch (error) {
          console.error("Error en callback de Google:", error);
          res.redirect(`${clientUrl}/login?error=auth_error`);
        }
      })(req, res, next);
    }
  );
}

export default router;
