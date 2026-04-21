import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestión de categorías de notas
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Listar categorías del usuario
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get("/", getCategories);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crear categoría
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Matemáticas"
 *               color:
 *                 type: string
 *                 example: "#f59e0b"
 *     responses:
 *       201:
 *         description: Categoría creada
 *       400:
 *         description: Nombre duplicado o datos inválidos
 */
router.post("/", createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Actualizar categoría
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               color: { type: string }
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       404:
 *         description: No encontrada
 */
router.put("/:id", updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Eliminar categoría (solo si no tiene notas)
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       400:
 *         description: Tiene notas asociadas
 *       404:
 *         description: No encontrada
 */
router.delete("/:id", deleteCategory);

export default router;
