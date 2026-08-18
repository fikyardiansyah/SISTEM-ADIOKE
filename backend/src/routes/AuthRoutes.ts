import { Router } from "express";
import { login, me } from "../controllers/AuthController.js";
import { requireAuth } from "../middleware/AuthMiddleware.js";

const router = Router();

// POST /api/auth/login — publik, siapa saja boleh coba login
router.post("/login", login);

// GET /api/auth/me — perlu token, dipakai frontend cek sesi saat refresh halaman
router.get("/me", requireAuth, me);

export default router;