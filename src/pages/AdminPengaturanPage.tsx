import { useEffect, useRef, useState, type ChangeEvent, type SVGProps } from "react";
import { useQueue } from "../context/useQueue";
import type { JamOperasionalHari } from "../context/QueueContext";

type IconProps = SVGProps<SVGSVGElement>;
const baseIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconBuilding(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 21v-4h6v4" />
      <path d="M8 7h1M12 7h1M16 7h1M8 11h1M12 11h1M16 11h1" />
    </svg>
  );
}
function IconClock(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function IconVolume(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M17 8a5 5 0 0 1 0 8" />
    </svg>
  );
}
function IconCheck(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function AdminPengaturanPage() {
  const { pengaturan, updatePengaturan } = useQueue();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Draft lokal dulu, baru dikirim ke context saat "Simpan Perubahan" —
  // pola yang sama dipakai di AdminLaporanPage (pending vs diterapkan).
  const [draft, setDraft] = useState(pengaturan);
  const [tersimpan, setTersimpan] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [gagalSimpan, setGagalSimpan] = useState(false);

  useEffect(() => {
    // Draft harus mengikuti hasil GET async dari context.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(pengaturan);
  }, [pengaturan]);

  const handleUbahLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev) => ({ ...prev, logoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleUbahJam = (index: number, patch: Partial<JamOperasionalHari>) => {
    setDraft((prev) => ({
      ...prev,
      jamOperasional: prev.jamOperasional.map((h, i) => (i === index ? { ...h, ...patch } : h)),
    }));
  };

  const handleSimpan = async () => {
    setMenyimpan(true);
    setTersimpan(false);
    setGagalSimpan(false);
    try {
      await updatePengaturan(draft);
      setTersimpan(true);
      setTimeout(() => setTersimpan(false), 2500);
    } catch {
      setGagalSimpan(true);
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola profil instansi, jam operasional, dan preferensi portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {tersimpan && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <IconCheck className="h-4 w-4" />
              Perubahan disimpan
            </span>
          )}
          {gagalSimpan && <span className="text-sm font-medium text-red-600">Gagal menyimpan</span>}
          <button
            type="button"
            onClick={handleSimpan}
            disabled={menyimpan}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {menyimpan ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Kolom kiri: Profil Instansi + Jam Operasional */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Profil Instansi */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <IconBuilding className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-gray-900">Profil Instansi</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
                  <img src={draft.logoUrl} alt="Logo instansi" className="h-full w-full object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Ubah Logo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUbahLogo}
                  className="hidden"
                />
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Nama Instansi</label>
                  <input
                    type="text"
                    value={draft.namaInstansi}
                    onChange={(e) => setDraft((p) => ({ ...p, namaInstansi: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-gray-600">Alamat Lengkap</label>
                  <textarea
                    value={draft.alamatLengkap}
                    onChange={(e) => setDraft((p) => ({ ...p, alamatLengkap: e.target.value }))}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-600">Nomor Telepon</label>
                <input
                  type="text"
                  value={draft.nomorTelepon}
                  onChange={(e) => setDraft((p) => ({ ...p, nomorTelepon: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Email Resmi</label>
                <input
                  type="email"
                  value={draft.emailResmi}
                  onChange={(e) => setDraft((p) => ({ ...p, emailResmi: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Jam Operasional */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <IconClock className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-gray-900">Jam Operasional</h2>
            </div>

            <div className="flex flex-col gap-3">
              {draft.jamOperasional.map((hari, index) => (
                <div
                  key={hari.hari}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 p-3"
                >
                  <span className="w-16 shrink-0 text-sm font-semibold text-gray-800">
                    {hari.hari}
                  </span>

                  {hari.aktif ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <input
                        type="time"
                        value={hari.buka}
                        onChange={(e) => handleUbahJam(index, { buka: e.target.value })}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-500"
                      />
                      <span className="text-gray-400">—</span>
                      <input
                        type="time"
                        value={hari.tutup}
                        onChange={(e) => handleUbahJam(index, { tutup: e.target.value })}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-500"
                      />
                    </div>
                  ) : (
                    <span className="flex-1 text-sm italic text-gray-400">Tutup</span>
                  )}

                  <Toggle
                    checked={hari.aktif}
                    onChange={(v) => handleUbahJam(index, { aktif: v })}
                    label={`Aktifkan ${hari.hari}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom kanan: Notifikasi Suara */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <IconVolume className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold text-gray-900">Notifikasi Suara</h2>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Panggilan Antrean</p>
                <p className="text-xs text-gray-400">Suara saat nomor antrean dipanggil</p>
              </div>
              <Toggle
                checked={draft.notifPanggilanAntrean}
                onChange={(v) => setDraft((p) => ({ ...p, notifPanggilanAntrean: v }))}
                label="Notifikasi panggilan antrean"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Peringatan Sistem</p>
                <p className="text-xs text-gray-400">Bunyi untuk error atau peringatan</p>
              </div>
              <Toggle
                checked={draft.notifPeringatanSistem}
                onChange={(v) => setDraft((p) => ({ ...p, notifPeringatanSistem: v }))}
                label="Notifikasi peringatan sistem"
              />
            </div>

            <div className="pt-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Volume Utama</p>
                <span className="text-sm font-bold text-blue-600">{draft.volumeUtama}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={draft.volumeUtama}
                onChange={(e) => setDraft((p) => ({ ...p, volumeUtama: Number(e.target.value) }))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}