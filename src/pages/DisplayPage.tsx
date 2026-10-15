import { useEffect, useState } from "react";
import { useQueue } from "../context/useQueue";
import "./DisplayPage.css";

function formatQueueNumber(prefix: string, number: number) {
  return number > 0 ? `${prefix}${String(number).padStart(3, "0")}` : "----";
}

export default function DisplayPage() {
  const { layananList, currentServing, loketError, pengaturan, refetchLayanan } = useQueue();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") refetchLayanan();
    };

    refreshIfVisible();
    const interval = window.setInterval(refreshIfVisible, 2000);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [refetchLayanan]);

  const dateText = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Makassar",
  }).format(now);
  const timeText = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Makassar",
  }).format(now);

  return (
    <main className="queue-display">
      <header className="display-header">
        <div className="display-brand">
          <img src="/images/logo-badung.png" alt="Logo Kabupaten Badung" />
          <img src="/images/logo-adioke.png" alt="ADI OKE" />
        </div>
        <div className="display-clock" aria-live="off">
          <strong>{timeText}</strong>
          <span>{dateText}</span>
          <small>WITA · GMT+8</small>
        </div>
      </header>

      {loketError && <p className="display-error">Gagal memuat layanan: {loketError}</p>}

      <section className="service-cards" aria-label="Nomor antrean tiap layanan">
        {layananList.length > 0 ? layananList.map((layanan) => (
          <article className="service-card" key={layanan.id}>
            <span className="service-card-kicker">LOKET</span>
            <h2>
              <span>Layanan</span>
              <strong>{layanan.nama}</strong>
            </h2>
            <strong className="service-queue-number">
              {formatQueueNumber(layanan.prefix, currentServing[layanan.id] ?? 0)}
            </strong>
          </article>
        )) : (
          <p className="display-empty">
            {loketError ? "Daftar layanan tidak dapat dimuat." : "Memuat daftar layanan..."}
          </p>
        )}
      </section>

      <footer className="display-announcement">
        <strong>⚑ &nbsp;PENGUMUMAN</strong>
        <div className="announcement-track">
          <span>SELAMAT DATANG DI KECAMATAN KUTA SELATAN</span>
          <i>•</i>
          <span>Mohon perhatikan panggilan nomor antrean Anda pada layar display</span>
          <i>•</i>
          <span>Jaga selalu ketertiban, kebersihan, dan kenyamanan bersama</span>
          <i>•</i>
          <span>{pengaturan.namaInstansi} · Pelayanan Terpadu</span>
        </div>
      </footer>
    </main>
  );
}
