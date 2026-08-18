import { Router } from "express";
import {
  getSemuaLayanan,
  getLayananById,
  tambahLayanan,
  ubahStatusLayanan,
  hapusLayanan,
} from "../controllers/LayananController.js";
import { requireAuth } from "../middleware/AuthMiddleware.js";

const router = Router();

// GET publik — dipakai HomePage/AdminPortalPage warga (tidak perlu login)
router.get("/", getSemuaLayanan);
router.get("/:id", getLayananById);

// Aksi mengubah data — wajib login sebagai admin
router.post("/", requireAuth, tambahLayanan);
router.patch("/:id/status", requireAuth, ubahStatusLayanan);
router.delete("/:id", requireAuth, hapusLayanan);

export default router;