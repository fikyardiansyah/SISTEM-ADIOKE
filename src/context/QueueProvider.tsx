import { useEffect, useState, type ReactNode } from "react";
import type { Layanan } from "../data/layanan";
import { apiFetch } from "../lib/api";
import { getAdminSession } from "../lib/auth";
import {
  QueueContext,
  type LoketStatus,
  type AntrianEvent,
  type TambahLoketInput,
  type AktivitasLog,
  type KategoriLayanan,
  type KategoriIconKey,
  type PengaturanSistem,
  type AkunAdmin,
  type TambahAkunInput,
  type SurveiSubmission,
  type RekapHarian,
} from "./QueueContext";

function buatIdTiket() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Bentuk baris yang dibalas GET /api/layanan (JOIN v_ringkasan_loket + layanan
// di LayananController.ts backend) — snake_case, beda dari tipe `Layanan`
// frontend yang camelCase, jadi perlu di-mapping sebelum masuk ke state.
interface LayananApiRow {
  id: string;
  nama: string;
  nama_loket: string;
  prefix: string;
  icon: string;
  kategori: string | null;
  deskripsi: string | null;
  variant: "biru" | "merah";
  status: LoketStatus;
  total_antrian: number;
  dilayani: number;
  menunggu: number;
}

interface AmbilAntrianResponse {
  id: string;
  loketId: string;
  nomorTiket: string;
  status: "menunggu";
}

interface AntrianApiRow {
  id: string;
  loket_id: string;
  nomor_tiket: string;
  status: "menunggu" | "dilayani";
  waktu_ambil: string;
  waktu_dilayani: string | null;
}

interface AktivitasApiRow {
  id: string;
  pesan: string;
  detail: string | null;
  waktu: string;
}

interface RekapApiRow {
  id: number;
  tanggal: string; // "YYYY-MM-DD"
  loket_id: string;
  total: number;
  dilayani: number;
  menunggu: number;
}

interface SurveiApiRow {
  id: string;
  nama: string | null;
  saran: string | null;
  created_at: string;
  ratings: Record<number, number>;
}

interface PengaturanApiJam {
  hari: string;
  jam_buka: string;
  jam_tutup: string;
  aktif: boolean;
}

interface PengaturanApiResponse extends Omit<PengaturanSistem, "jamOperasional"> {
  jamOperasional: PengaturanApiJam[];
}

function mapPengaturanFromApi(data: PengaturanApiResponse): PengaturanSistem {
  return {
    ...data,
    jamOperasional: data.jamOperasional.map((hari) => ({
      hari: hari.hari,
      buka: hari.jam_buka,
      tutup: hari.jam_tutup,
      aktif: hari.aktif,
    })),
  };
}

function mapPengaturanToApi(data: PengaturanSistem): PengaturanApiResponse {
  return {
    ...data,
    jamOperasional: data.jamOperasional.map((hari) => ({
      hari: hari.hari,
      jam_buka: hari.buka,
      jam_tutup: hari.tutup,
      aktif: hari.aktif,
    })),
  };
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [currentServing, setCurrentServing] = useState<Record<string, number>>({});
  const [loketStatus, setLoketStatus] = useState<Record<string, LoketStatus>>({});
  const [loketError, setLoketError] = useState<string | null>(null);

  // Ambil daftar loket + statistiknya dari backend sekali saat provider ini
  // pertama kali dipasang (root App). Kalau nanti ada aksi yang mengubah
  // data loket di server (tambah loket, dst — belum disambungkan di langkah
  // ini), panggil `muatUlangLayanan()` lagi supaya state di sini ikut sinkron.
  const muatUlangLayanan = () => {
    apiFetch<LayananApiRow[]>("/layanan")
      .then((rows) => {
        setLayananList(
          rows.map<Layanan>((r) => ({
            id: r.id,
            nama: r.nama,
            namaLoket: r.nama_loket,
            prefix: r.prefix,
            jumlahAntrianAwal: 0,
            icon: r.icon,
            kategori: r.kategori ?? undefined,
            deskripsi: r.deskripsi ?? undefined,
            variant: r.variant,
          }))
        );
        setCounts(Object.fromEntries(rows.map((r) => [r.id, r.total_antrian])));
        setCurrentServing(Object.fromEntries(rows.map((r) => [r.id, r.dilayani])));
        setLoketStatus(Object.fromEntries(rows.map((r) => [r.id, r.status])));
        setLoketError(null);
      })
      .catch((err: Error) => {
        console.error("Gagal memuat daftar layanan dari server:", err);
        setLoketError(err.message);
      });
  };

  useEffect(() => {
    muatUlangLayanan();
  }, []);

  // Polling ringan setiap 30 detik — memastikan tampilan counts (jumlah
  // antrean) di QueuePage (pengunjung) dan AdminPortalPage selalu sinkron
  // dengan database setelah reset manual dilakukan oleh admin.
  useEffect(() => {
    const interval = setInterval(() => {
      muatUlangLayanan();
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const [riwayatAntrian, setRiwayatAntrian] = useState<AntrianEvent[]>([]);
  const [aktivitasLog, setAktivitasLog] = useState<AktivitasLog[]>([]);

  // Riwayat antrian & aktivitas butuh login admin (requireAuth di backend),
  // jadi cuma dipanggil kalau ada session. muatUlangLayanan tetap publik.
  const muatUlangRiwayat = () => {
    const session = getAdminSession();
    if (!session) return;
    apiFetch<AntrianApiRow[]>("/antrian", {}, session.token)
      .then((rows) => {
        setRiwayatAntrian(
          rows.map((r) => ({
            id: r.id,
            loketId: r.loket_id,
            nomorTiket: r.nomor_tiket,
            timestamp: new Date(r.waktu_ambil).getTime(),
            status: r.status,
            waktuDilayani: r.waktu_dilayani ? new Date(r.waktu_dilayani).getTime() : undefined,
          }))
        );
      })
      .catch((err: Error) => console.error("Gagal memuat riwayat antrian:", err));
  };

  const muatUlangAktivitas = () => {
    const session = getAdminSession();
    if (!session || session.user.peran === "Petugas") return;
    apiFetch<AktivitasApiRow[]>("/aktivitas", {}, session.token)
      .then((rows) => {
        setAktivitasLog(
          rows.map((r) => ({
            id: r.id,
            pesan: r.pesan,
            detail: r.detail ?? undefined,
            waktu: new Date(r.waktu).getTime(),
          }))
        );
      })
      .catch((err: Error) => console.error("Gagal memuat aktivitas:", err));
  };

  const [rekapHarian, setRekapHarian] = useState<RekapHarian[]>([]);

  /** Data historis (tabel rekap_harian) — TETAP ADA meski tabel antrian
   *  di-reset, karena disalin ke sini sebelum penghapusan (lihat backend
   *  resetSemuaAntrian). Dashboard menggabungkan ini dengan riwayatAntrian
   *  (yang live/belum di-reset) supaya grafik tren tidak "kosong lagi"
   *  setiap kali admin reset antrean. */
  const muatUlangRekapHarian = () => {
    const session = getAdminSession();
    if (!session || session.user.peran === "Petugas") return;
    apiFetch<RekapApiRow[]>("/rekap-harian", {}, session.token)
      .then((rows) => {
        setRekapHarian(
          rows.map((r) => ({
            id: r.id,
            tanggal: r.tanggal,
            loketId: r.loket_id,
            total: r.total,
            dilayani: r.dilayani,
            menunggu: r.menunggu,
          }))
        );
      })
      .catch((err: Error) => console.error("Gagal memuat rekap harian:", err));
  };

  const [surveiList, setSurveiList] = useState<SurveiSubmission[]>([]);

  /** SUDAH TERSAMBUNG KE BACKEND — GET /api/survei (admin only). Dipanggil
   *  lewat refetchAdminData, sama seperti riwayat/aktivitas/rekap harian. */
  const muatUlangSurvei = () => {
    const session = getAdminSession();
    if (!session || session.user.peran === "Petugas") return;
    apiFetch<SurveiApiRow[]>("/survei", {}, session.token)
      .then((rows) => {
        setSurveiList(
          rows.map((r) => ({
            id: r.id,
            nama: r.nama ?? undefined,
            ratings: r.ratings,
            saran: r.saran ?? undefined,
            timestamp: new Date(r.created_at).getTime(),
          }))
        );
      })
      .catch((err: Error) => console.error("Gagal memuat survei:", err));
  };

  const [pengaturan, setPengaturan] = useState<PengaturanSistem>(() => ({
    namaInstansi: "Kecamatan Kuta Selatan",
    alamatLengkap: "Jl. Raya Kampus Unud No.X, Jimbaran, Kec. Kuta Sel., Kabupaten Badung, Bali",
    nomorTelepon: "(0361) 701001",
    emailResmi: "info@kutaselatan.badungkab.go.id",
    logoUrl: "/images/logo-badung.png",
    jamOperasional: [
      { hari: "Senin", buka: "08:00", tutup: "15:00", aktif: true },
      { hari: "Selasa", buka: "08:00", tutup: "15:00", aktif: true },
      { hari: "Rabu", buka: "08:00", tutup: "15:00", aktif: true },
      { hari: "Kamis", buka: "08:00", tutup: "15:00", aktif: true },
      { hari: "Jumat", buka: "08:00", tutup: "15:00", aktif: true },
      { hari: "Sabtu", buka: "08:00", tutup: "12:00", aktif: false },
      { hari: "Minggu", buka: "08:00", tutup: "12:00", aktif: false },
    ],
    notifPanggilanAntrean: true,
    notifPeringatanSistem: true,
    volumeUtama: 80,
  }));

  const muatPengaturan = () => {
    apiFetch<PengaturanApiResponse>("/pengaturan")
      .then((data) => setPengaturan(mapPengaturanFromApi(data)))
      .catch((err: Error) => console.error("Gagal memuat pengaturan sistem:", err));
  };

  /** Dipanggil setelah login berhasil (LoginPage/LoginModal), dan sekali saat
   *  mount kalau ternyata sesi login masih ada (refresh halaman). */
  const refetchAdminData = () => {
    muatUlangRiwayat();
    muatUlangAktivitas();
    muatUlangRekapHarian();
    muatUlangSurvei();
    muatPengaturan();
  };

  useEffect(() => {
    muatPengaturan();
    refetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [kategoriList, setKategoriList] = useState<KategoriLayanan[]>(() => {
    const now = Date.now();
    return [
      { nama: "Umum", icon: "tag", deskripsi: "Layanan umum kecamatan yang tidak masuk kategori khusus lainnya.", updatedAt: now },
      { nama: "Kependudukan", icon: "people", deskripsi: "Layanan administrasi kependudukan seperti pembuatan KTP, KK, Akta Kelahiran, dan surat pindah domisili.", updatedAt: now },
      { nama: "Perizinan", icon: "building", deskripsi: "Pengurusan berbagai izin usaha mikro, surat keterangan domisili usaha, dan izin mendirikan bangunan skala kecil.", updatedAt: now },
    ];
  });

  const [akunList, setAkunList] = useState<AkunAdmin[]>(() => {
    const now = Date.now();
    return [
      {
        id: buatIdTiket(),
        nama: "Budi Santoso",
        email: "budi.s@kutaselatan.go.id",
        username: "budi.santoso",
        peran: "Super Admin",
        status: "Aktif",
        loginTerakhir: now - 2 * 60 * 60 * 1000,
      },
      {
        id: buatIdTiket(),
        nama: "Siti Rahma",
        email: "siti.r@kutaselatan.go.id",
        username: "siti.rahma",
        peran: "Admin",
        status: "Aktif",
        loginTerakhir: now - 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000,
      },
      {
        id: buatIdTiket(),
        nama: "Agus Wijaya",
        email: "agus.w@kutaselatan.go.id",
        username: "agus.wijaya",
        peran: "Petugas",
        status: "Tidak Aktif",
        loginTerakhir: now - 30 * 24 * 60 * 60 * 1000,
      },
    ];
  });

  /** Simpan satu entri aktivitas baru di paling atas, maksimal 30 terbaru disimpan */
  const catatAktivitas = (pesan: string, detail?: string) => {
    setAktivitasLog((prev) =>
      [{ id: buatIdTiket(), pesan, detail, waktu: Date.now() }, ...prev].slice(0, 30)
    );
  };

  // SUDAH TERSAMBUNG KE BACKEND: POST /api/antrian (publik, tidak perlu
  // token — warga belum login). Server yang menghitung nomor tiket
  // berikutnya (transaksional, aman dari race condition), jadi di sini
  // tinggal kirim loketId dan pakai nomorTiket balasannya.
  const ambilAntrian = async (id: string) => {
    const hasil = await apiFetch<AmbilAntrianResponse>("/antrian", {
      method: "POST",
      body: JSON.stringify({ loketId: id }),
    });

    setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    setRiwayatAntrian((prev) => [
      ...prev,
      {
        id: hasil.id,
        loketId: id,
        nomorTiket: hasil.nomorTiket,
        timestamp: Date.now(),
        status: "menunggu",
      },
    ]);
  };

  // ------------------------------------------------------------------
  // Endpoint admin yang butuh Bearer token:
  //   - panggilSelanjutnya -> PATCH /api/antrian/loket/:loketId/panggil-selanjutnya
  //   - tutupLoket/bukaLoket -> PATCH /api/layanan/:id/status
  //   - tambahLoket -> POST /api/layanan
  // ------------------------------------------------------------------

  // SUDAH TERSAMBUNG KE BACKEND — butuh admin login (Bearer token). Setelah
  // aksi berhasil di server, tinggal refetch ulang layanan+riwayat+aktivitas
  // supaya semua angka (jumlah antrian, dilayani, menunggu, status loket,
  // log aktivitas) konsisten dengan database — server yang jadi sumber
  // kebenaran, bukan dihitung manual di sini lagi.
  const panggilSelanjutnya = (id: string) => {
    const session = getAdminSession();
    if (!session) return;
    apiFetch(`/antrian/loket/${id}/panggil-selanjutnya`, { method: "PATCH" }, session.token)
      .then(() => {
        muatUlangLayanan();
        muatUlangRiwayat();
        muatUlangAktivitas();
      })
      .catch((err: Error) => console.error("Gagal memanggil antrean:", err));
  };

  const tutupLoket = (id: string) => {
    const session = getAdminSession();
    if (!session) return;
    apiFetch(
      `/layanan/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status: "tutup" }) },
      session.token
    )
      .then(() => {
        muatUlangLayanan();
        muatUlangAktivitas();
      })
      .catch((err: Error) => console.error("Gagal menutup loket:", err));
  };

  const bukaLoket = (id: string) => {
    const session = getAdminSession();
    if (!session) return;
    apiFetch(
      `/layanan/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status: "buka" }) },
      session.token
    )
      .then(() => {
        muatUlangLayanan();
        muatUlangAktivitas();
      })
      .catch((err: Error) => console.error("Gagal membuka loket:", err));
  };

  const resetSemuaAntrian = () => {
    const session = getAdminSession();
    if (!session) return;
    apiFetch("/antrian/reset", { method: "DELETE" }, session.token)
      .then(() => {
        muatUlangLayanan();
        muatUlangRiwayat();
        muatUlangAktivitas();
        muatUlangRekapHarian();
      })
      .catch((err: Error) => console.error("Gagal reset semua antrian:", err));
  };

  const tambahKategori = (nama: string, extra?: { icon?: KategoriIconKey; deskripsi?: string }) => {
    const trimmed = nama.trim();
    if (!trimmed || kategoriList.some((k) => k.nama === trimmed)) return;
    setKategoriList((prev) => [
      ...prev,
      { nama: trimmed, icon: extra?.icon ?? "tag", deskripsi: extra?.deskripsi, updatedAt: Date.now() },
    ]);
    catatAktivitas(`Kategori baru ditambahkan`, `"${trimmed}"`);
  };

  const hapusKategori = (nama: string) => {
    setKategoriList((prev) => prev.filter((k) => k.nama !== nama));
    catatAktivitas(`Kategori dihapus`, `"${nama}"`);
  };

  const hapusAntrian = (eventId: string) => {
    setRiwayatAntrian((prev) => prev.filter((e) => e.id !== eventId));
  };

  const hapusRiwayatHari = (startOfDayTs: number) => {
    const endOfDayTs = startOfDayTs + 24 * 60 * 60 * 1000;
    setRiwayatAntrian((prev) =>
      prev.filter((e) => e.timestamp < startOfDayTs || e.timestamp >= endOfDayTs)
    );
  };

  const tambahLoket = async (data: TambahLoketInput, statusAwal: LoketStatus = "buka") => {
    const session = getAdminSession();
    if (!session) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");

    await apiFetch(
      "/layanan",
      {
        method: "POST",
        body: JSON.stringify({
          nama: data.nama,
          namaLoket: data.namaLoket,
          prefix: data.prefix,
          jumlahAntrianAwal: data.jumlahAntrianAwal ?? 0,
          icon: data.icon,
          kategori: data.kategori,
          deskripsi: data.deskripsi,
          variant: data.variant ?? "biru",
          statusAwal,
        }),
      },
      session.token
    );

    muatUlangLayanan();
    muatUlangAktivitas();
  };

  const updatePengaturan = async (data: Partial<PengaturanSistem>) => {
    const next = { ...pengaturan, ...data };
    setPengaturan(next);

    const session = getAdminSession();
    try {
      if (session) {
        const saved = await apiFetch<PengaturanApiResponse>(
          "/pengaturan",
          {
            method: "PUT",
            body: JSON.stringify(mapPengaturanToApi(next)),
          },
          session.token
        );
        setPengaturan(mapPengaturanFromApi(saved));
      } else {
        setPengaturan(next);
      }
      catatAktivitas("Pengaturan sistem diperbarui");
    } catch (err) {
      console.error("Gagal menyimpan pengaturan sistem:", err);
      catatAktivitas("Pengaturan sistem gagal disimpan");
      throw err;
    }
  };

  const tambahAkun = (data: TambahAkunInput) => {
    setAkunList((prev) => [
      ...prev,
      { ...data, id: buatIdTiket(), loginTerakhir: null },
    ]);
    catatAktivitas("Akun baru ditambahkan", data.nama);
  };

  const updateAkun = (id: string, patch: Partial<Omit<AkunAdmin, "id">>) => {
    setAkunList((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    const nama = akunList.find((a) => a.id === id)?.nama ?? "Akun";
    catatAktivitas("Akun diperbarui", nama);
  };

  const hapusAkun = (id: string) => {
    const nama = akunList.find((a) => a.id === id)?.nama ?? "Akun";
    setAkunList((prev) => prev.filter((a) => a.id !== id));
    catatAktivitas("Akun dihapus", nama);
  };

  // SUDAH TERSAMBUNG KE BACKEND — POST /api/survei, publik (warga belum
  // login saat mengisi survei). Tidak perlu refetch surveiList di sini
  // karena warga tidak lihat dashboard admin; admin yang login akan lihat
  // respons baru ini lewat refetchAdminData berikutnya.
  const submitSurvei = async (ratings: Record<number, number>, saran?: string, nama?: string) => {
    await apiFetch("/survei", {
      method: "POST",
      body: JSON.stringify({ ratings, saran, nama }),
    });
  };

  const hapusSurvei = (id: string) => {
    const session = getAdminSession();
    if (!session) return;
    apiFetch(`/survei/${id}`, { method: "DELETE" }, session.token)
      .then(() => {
        muatUlangSurvei();
        muatUlangAktivitas();
      })
      .catch((err: Error) => console.error("Gagal menghapus survei:", err));
  };

  return (
    <QueueContext.Provider
      value={{
        layananList,
        counts,
        currentServing,
        loketStatus,
        loketError,
        refetchAdminData,
        riwayatAntrian,
        kategoriList,
        aktivitasLog,
        surveiList,
        rekapHarian,
        ambilAntrian,
        panggilSelanjutnya,
        tutupLoket,
        bukaLoket,
        resetSemuaAntrian,
        tambahKategori,
        hapusKategori,
        hapusAntrian,
        hapusRiwayatHari,
        tambahLoket,
        pengaturan,
        updatePengaturan,
        akunList,
        tambahAkun,
        updateAkun,
        hapusAkun,
        submitSurvei,
        hapusSurvei,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}