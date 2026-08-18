import { Router } from "express";
import { ambilAntrian, panggilSelanjutnya, getAntrian, resetSemuaAntrian } from "../controllers/AntrianController.js";
import { requireAuth, requireRole } from "../middleware/AuthMiddleware.js";

const router = Router();

// POST /api/antrian — publik: warga ambil nomor tiket, tidak perlu login
router.post("/", ambilAntrian);

// Sisanya untuk kebutuhan admin (panggil antrean, lihat riwayat/laporan)   
router.patch("/loket/:loketId/panggil-selanjutnya", requireAuth, panggilSelanjutnya);
router.get("/", requireAuth, getAntrian);

// Operasi destruktif (hapus semua tiket) — cuma Super Admin yang boleh
router.delete("/reset", requireAuth, requireRole("Super Admin"), resetSemuaAntrian);

export default router;