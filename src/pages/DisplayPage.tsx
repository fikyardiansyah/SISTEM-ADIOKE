import { useEffect, useState } from "react";
import { useQueue } from "../context/useQueue";
import "./DisplayPage.css";

const sampleVideoUrl =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

function formatQueueNumber(prefix: string, number: number) {
  return number > 0 ? `${prefix}${String(number).padStart(3, "0")}` : "-";
}

export default function DisplayPage() {
  const {
    layananList,
    currentServing,
    loketStatus,
    loketError,
    pengaturan,
  } = useQueue();
  const [now, setNow] = useState(() => new Date());
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const activeCall = layananList.find(
    (layanan) =>
      (currentServing[layanan.id] ?? 0) > 0 &&
      loketStatus[layanan.id] !== "tutup",
  );
  const call = activeCall ?? layananList.find((layanan) => (currentServing[layanan.id] ?? 0) > 0);
  const callNumber = call
    ? formatQueueNumber(call.prefix, currentServing[call.id] ?? 0)
    : "-";
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
          <img src="/images/logo-adioke.png" alt="" className="display-logo" />
          <div>
            <div className="display-brand-title">
              ADIOKE <span className="online-pill"><i /> ONLINE</span>
            </div>
            <p>Antrean Digital {pengaturan.namaInstansi}</p>
          </div>
        </div>

        <div className="display-office">
          <img src="/images/logo-badung.png" alt="" />
          <span>{pengaturan.namaInstansi} • KAB. BADUNG</span>
        </div>

        <div className="display-clock">
          <div>
            <span>{dateText}</span>
            <small>Zona Waktu: WITA (GMT+8)</small>
          </div>
          <strong><i />{timeText}</strong>
        </div>
      </header>

      <section className="display-main-panels">
        <section className="video-panel" aria-label="Video informasi layanan">
          <div className="video-panel-top">
            <span className="live-tag"><i /> SIARAN INFORMASI LAYANAN</span>
            <span className="quality-tag">HD 1080p</span>
          </div>
          <video
            className="service-video"
            src={sampleVideoUrl}
            poster="/images/kantorcamat.jpg"
            controls
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
            onCanPlay={() => setVideoError(false)}
            aria-label="Video informasi pelayanan"
          />
          <div className="video-caption">
            <strong>PANDUAN LOKET &amp; PELAYANAN CEPAT TERPADU</strong>
            <span>
              {videoError
                ? "Video tidak dapat dimuat. Periksa koneksi internet layar display."
                : `${pengaturan.namaInstansi} mengutamakan pelayanan ramah, transparan, dan akuntabel.`}
            </span>
          </div>
          <div className="video-watermark">KUTA SELATAN TV</div>
        </section>

        <section className="now-serving-panel" aria-label="Antrean saat ini">
          <div className="now-serving-heading">
            <strong>⚑ &nbsp;ANTREAN SAAT INI</strong>
            <span><i /> {call ? "SEDANG DILAYANI" : "MENUNGGU PANGGILAN"}</span>
          </div>
          <div className="now-serving-content">
            {loketError ? (
              <p className="display-error">Gagal memuat layanan: {loketError}</p>
            ) : layananList.length === 0 ? (
              <p className="display-loading">Memuat antrean...</p>
            ) : (
              <>
                <span className="queue-number-label">NOMOR ANTREAN</span>
                <strong className="queue-number">{callNumber}</strong>
                <div className="counter-callout">
                  <small>SILAKAN MENUJU</small>
                  <strong>
                    {call
                      ? `LOKET ${String(layananList.indexOf(call) + 1).padStart(2, "0")} — ${call.nama}`
                      : "MENUNGGU PANGGILAN"}
                  </strong>
                </div>
              </>
            )}
          </div>
          <div className="now-serving-footer">
            <span>◖♪ Panggilan Suara Aktif</span>
            <span>Harap siapkan dokumen administrasi Anda</span>
          </div>
        </section>
      </section>

      <div className="service-status-line">
        <strong>♧ &nbsp;STATUS SELURUH LOKET PELAYANAN TERPADU</strong>
        <span>DATA DIPERBARUI OTOMATIS</span>
      </div>

      {loketError && (
        <p className="display-inline-error">Gagal memuat layanan: {loketError}</p>
      )}
      {!loketError && layananList.length === 0 && (
        <p className="display-inline-error">Memuat daftar layanan...</p>
      )}

      <section className="service-cards" aria-label="Status antrean setiap loket">
        {layananList.map((layanan, index) => {
          const number = currentServing[layanan.id] ?? 0;
          const isOpen = loketStatus[layanan.id] !== "tutup";
          return (
            <article
              className={`service-card${isOpen ? "" : " is-closed"}`}
              key={layanan.id}
            >
              <div className="service-card-heading">
                <strong>{layanan.nama}</strong>
                <span>LOKET {String(index + 1).padStart(2, "0")}</span>
              </div>
              <strong className="service-queue-number">
                {formatQueueNumber(layanan.prefix, number)}
              </strong>
              <span className="service-card-status">
                <i /> {isOpen ? "MELAYANI" : "LOKET TUTUP"}
              </span>
            </article>
          );
        })}
      </section>

      <footer className="display-announcement">
        <strong>⚑ &nbsp;PENGUMUMAN</strong>
        <div className="announcement-track">
          <span>Selamat Datang di Pelayanan Terpadu {pengaturan.namaInstansi}</span>
          <i>•</i>
          <span>Mohon perhatikan panggilan nomor antrean Anda pada layar display</span>
          <i>•</i>
          <span>Jaga selalu ketertiban, kebersihan, dan kenyamanan bersama</span>
        </div>
      </footer>
    </main>
  );
}