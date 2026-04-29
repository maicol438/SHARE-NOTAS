import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // Buscar token en cookie o en header Authorization
    const authHeader = req.headers.authorization;
    const token = req.cookies?.token || 
                   (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
      return res.status(401).json({ message: "Acceso no autorizado. Token requerido." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "La sesión ha expirado. Por favor inicia sesión." });
    }
    return res.status(401).json({ message: "Token inválido." });
  }
};
