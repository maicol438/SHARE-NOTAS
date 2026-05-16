import User from "../models/User.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
    }
    req.userRole = user.role;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error al verificar permisos" });
  }
};
