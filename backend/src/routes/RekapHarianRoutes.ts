import { Router } from "express";
import { getRekapHarian } from "../controllers/RekapHarianController.js";
import { requireAuth, requireRole } from "../middleware/AuthMiddleware.js";

const router = Router();

// GET /api/rekap-harian � hanya admin yang bisa lihat data historis
router.get("/", requireAuth, requireRole("Super Admin", "Admin"), getRekapHarian);

export default router;
