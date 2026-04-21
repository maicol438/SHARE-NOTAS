import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // El token viene de la cookie HTTP-only
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Acceso no autorizado. Token requerido." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Disponible en todos los controladores protegidos
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "La sesión ha expirado. Por favor inicia sesión." });
    }
    return res.status(401).json({ message: "Token inválido." });
  }
};
