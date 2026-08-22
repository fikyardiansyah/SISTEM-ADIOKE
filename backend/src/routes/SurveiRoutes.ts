import { Router } from "express";
import { submitSurvei, getSurvei, hapusSurvei } from "../controllers/SurveiController.js";
import { requireAuth } from "../middleware/AuthMiddleware.js";

const router = Router();

// POST /api/survei — publik: warga kirim jawaban survei, tidak perlu login
router.post("/", submitSurvei);

// Lihat & kelola hasil survei — hanya admin
router.get("/", requireAuth, getSurvei);
router.delete("/:id", requireAuth, hapusSurvei);

export default router;