import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  getDashboard,
  getUsers,
  updateUserRole,
  deleteUser,
  getAllNotes,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyToken, verifyAdmin);

router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.put("/users/role", updateUserRole);
router.delete("/users/:userId", deleteUser);
router.get("/notes", getAllNotes);

export default router;
