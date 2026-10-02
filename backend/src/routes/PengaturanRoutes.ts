import { Router } from "express";
import { getPengaturan, updatePengaturan } from "../controllers/PengaturanController.js";
import { requireAuth, requireRole } from "../middleware/AuthMiddleware.js";

const router = Router();

router.get("/", getPengaturan);
router.put("/", requireAuth, requireRole("Super Admin"), updatePengaturan);

export default router;
