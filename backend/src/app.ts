import express from "express";
import cors from "cors";
import type { Request, Response, NextFunction } from "express";
import authRoutes from "./routes/AuthRoutes.js";
import layananRoutes from "./routes/LayananRoutes.js";
import antrianRoutes from "./routes/AntrianRoutes.js";
import aktivitasRoutes from "./routes/AktivitasRoutes.js";
import rekapHarianRoutes from "./routes/RekapHarianRoutes.js";
import surveiRoutes from "./routes/SurveiRoutes.js";
import pengaturanRoutes from "./routes/PengaturanRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Backend ADI OKE berjalan!",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/layanan", layananRoutes);
app.use("/api/antrian", antrianRoutes);
app.use("/api/aktivitas", aktivitasRoutes);
app.use("/api/rekap-harian", rekapHarianRoutes);
app.use("/api/survei", surveiRoutes);
app.use("/api/pengaturan", pengaturanRoutes);

// 404 — route tidak dikenal
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." });
});

// Error handler global — HARUS 4 parameter (err, req, res, next) supaya
// Express mengenalinya sebagai error handler, bukan middleware biasa.
// Express 5 (yang dipakai project ini) otomatis menangkap error/reject
// dari handler async manapun (termasuk `throw err` di catch block
// AntrianController.ts) dan meneruskannya ke sini — jadi cukup satu
// handler ini saja, tidak perlu try/catch manual di tiap route.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server.",
  });
});

export default app;