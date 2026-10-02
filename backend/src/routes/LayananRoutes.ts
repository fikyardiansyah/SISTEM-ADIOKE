import { Router } from "express";
import {
  getSemuaLayanan,
  getLayananById,
  tambahLayanan,
  ubahStatusLayanan,
  hapusLayanan,
} from "../controllers/LayananController.js";
import { requireAuth, requireRole } from "../middleware/AuthMiddleware.js";

const router = Router();

// GET publik — dipakai HomePage/AdminPortalPage warga (tidak perlu login)
router.get("/", getSemuaLayanan);
router.get("/:id", getLayananById);

// Aksi mengubah data — wajib login sebagai admin
router.post("/", requireAuth, requireRole("Super Admin", "Admin"), tambahLayanan);
router.patch("/:id/status", requireAuth, requireRole("Super Admin", "Admin"), ubahStatusLayanan);
router.delete("/:id", requireAuth, requireRole("Super Admin"), hapusLayanan);

export default router;