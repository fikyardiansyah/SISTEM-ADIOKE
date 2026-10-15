import { Router } from "express";
import { createUser, deleteUser, getUsers, resetAccountPassword, updateUser } from "../controllers/UsersController.js";
import { requireAuth, requireRole } from "../middleware/AuthMiddleware.js";

const router = Router();
const superAdmin = [requireAuth, requireRole("Super Admin")];

router.get("/", ...superAdmin, getUsers);
router.post("/", ...superAdmin, createUser);
router.post("/:id/reset-password", ...superAdmin, resetAccountPassword);
router.patch("/:id", ...superAdmin, updateUser);
router.delete("/:id", ...superAdmin, deleteUser);

export default router;