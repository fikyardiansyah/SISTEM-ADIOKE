import { Router } from "express";
import { getAktivitas } from "../controllers/AktivitasController.js";
import { requireAuth } from "../middleware/AuthMiddleware.js";

const router = Router();

// GET /api/aktivitas — feed "Aktivitas Terbaru" di dashboard admin, wajib login
router.get("/", requireAuth, getAktivitas);

export default router;