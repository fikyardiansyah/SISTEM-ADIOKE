import app from "./app.js";
import { pastikanKoneksiDb } from "./config/db.js";

const PORT = 5000;

async function start() {
  try {
    await pastikanKoneksiDb();
  } catch (err) {
    console.error("❌ Gagal konek ke MySQL. Cek .env (DB_HOST/DB_USER/DB_PASSWORD/DB_NAME).", err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Backend ADI OKE berjalan di http://localhost:${PORT}`);
  });
}

start();