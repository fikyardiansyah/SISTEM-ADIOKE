import { Router } from "express";
import { getPengaturan, updatePengaturan } from "../controllers/PengaturanController.js";
import { requireAuth } from "../middleware/AuthMiddleware.js";

const router = Router();

router.get("/", getPengaturan);
router.put("/", requireAuth, updatePengaturan);

export default router;
