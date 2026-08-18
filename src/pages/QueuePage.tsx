import { useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { layananList } from "../data/layanan";
import { useQueue } from "../context/useQueue";

export default function QueuePage() {
  const { id } = useParams();
  const { counts } = useQueue();
  const layanan = layananList.find((l) => l.id === id);

  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!layanan) {
    return (
      <main className="text-center py-20">
        <p>Layanan tidak ditemukan.</p>
        <Link to="/" className="text-blue-600 underline">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  const nomorUrut = counts[layanan.id] ?? 0;
  const nomorAntrian = `${layanan.prefix}${String(nomorUrut).padStart(3, "0")}`;

  const now = new Date();
  const tanggal = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const jam = now.toLocaleTimeString("id-ID", { hour12: false });

  const handleDownloadPng = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
        // Elemen bertanda data-export-ignore (tombol aksi) dilewati saat
        // di-screenshot, supaya PNG hanya berisi tiketnya saja.
        filter: (node) => {
          if (node instanceof HTMLElement) {
            return node.dataset.exportIgnore !== "true";
          }
          return true;
        },
      });

      const link = document.createElement("a");
      link.download = `antrian-${nomorAntrian}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal membuat PNG:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      {/*
        CSS khusus print — hanya area tiket (#ticket-print) yang tampil,
        semua elemen lain (Navbar, Footer, tombol aksi) disembunyikan dan
        margin halaman dinolkan, supaya hasil cetak/"Save as PDF" pas
        1 halaman tanpa nembus ke halaman kedua.
      */}
      <style>{`
        @media print {
          @page { margin: 0; }
          body * { visibility: hidden; }
          #ticket-print, #ticket-print * { visibility: visible; }
          #ticket-print {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            margin: 0;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div
        id="ticket-print"
        ref={ticketRef}
        className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
      >
        {/* Banner brand di dalam kartu */}
        <div className="bg-blue-700 px-8 py-5 text-center text-white">
          <img
            src="/images/logo-adioke.png"
            alt="Adi Oke"
            className="mx-auto h-10 w-auto object-contain"
          />
          <p className="mt-1.5 text-xs text-blue-100">Antrean Digital Online Kuta Selatan</p>
        </div>

        <div className="px-8 py-8 text-center sm:px-10">
          <div className="mb-8 flex items-center justify-between text-sm text-gray-500">
            <span>{tanggal}</span>
            <span>{jam}</span>
          </div>

          <p className="text-sm font-semibold tracking-widest text-gray-500">
            NOMOR ANTRIAN ANDA
          </p>
          <p className="my-4 text-7xl font-extrabold leading-none tracking-tight text-blue-600">
            {nomorAntrian}
          </p>

          <div className="mx-auto max-w-xs rounded-2xl bg-gray-100 py-4">
            <p className="text-xs font-medium tracking-widest text-gray-500">LOKET</p>
            <p className="text-lg font-bold text-gray-900">{layanan.namaLoket}</p>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700">
            <IconUsers className="h-4 w-4 text-gray-500" />
            Jumlah Antrian: <span className="font-bold">{nomorUrut}</span>
          </div>

          {/* QR code — scan untuk lacak nomor yang sedang dilayani dari HP */}
          <div className="mx-auto mt-6 flex max-w-xs flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 py-5">
            <QRCodeSVG
              value={`${window.location.origin}/lacak/${layanan.id}?nomor=${nomorAntrian}`}
              size={128}
              level="M"
            />
            <p className="mt-1 text-xs text-gray-500">
              Scan untuk pantau antrian dari HP Anda
            </p>
          </div>

          <hr className="my-8 border-gray-200" />

          <p className="mb-6 text-gray-600">Terima kasih atas kunjungannya</p>

          {/*
            data-export-ignore: dilewati saat screenshot PNG (html-to-image).
            print:hidden: disembunyikan juga saat print lewat Tailwind,
            sebagai lapisan kedua selain #ticket-print di atas.
          */}
          <div
            data-export-ignore="true"
            className="flex flex-wrap items-center justify-center gap-3 print:hidden"
          >
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <IconDownload className="h-4 w-4" />
              UNDUH PDF
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={downloading}
              className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <IconImage className="h-4 w-4" />
              {downloading ? "MEMPROSES..." : "UNDUH PNG"}
            </button>

            <Link
              to="/"
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
            >
              <IconArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------------------------------------------------------------------- */
/* Icon kecil (outline, currentColor) — tanpa library tambahan            */
/* ---------------------------------------------------------------------- */

function IconUsers({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9.5" r="2.3" />
      <path strokeLinecap="round" d="M15.5 20c.2-2.6 1.9-4.6 4-5.2" />
    </svg>
  );
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function IconImage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 15-5-5L5 21" />
    </svg>
  );
}

function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}