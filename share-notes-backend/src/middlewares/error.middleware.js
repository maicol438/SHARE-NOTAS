export const errorHandler = (err, _req, res, _next) => {
  console.error("💥 Error:", err.message);

  // Error de validación de Mongoose
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(". ") });
  }

  // CastError: ID inválido (no es un ObjectId válido)
  if (err.name === "CastError") {
    return res.status(400).json({ message: "ID inválido" });
  }

  // Duplicado (índice único)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `El campo '${field}' ya existe` });
  }

  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
  });
};
