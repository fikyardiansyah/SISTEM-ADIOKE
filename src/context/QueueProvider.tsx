import { useState, type ReactNode } from "react";
import { layananList as layananAwal } from "../data/layanan";
import type { Layanan } from "../data/layanan";
import {
  QueueContext,
  type LoketStatus,
  type AntrianEvent,
  type TambahLoketInput,
} from "./QueueContext";

function buatIdTiket() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Ubah nama loket jadi slug id, mis. "Legalisir Dokumen" -> "legalisir-dokumen" */
function buatIdLoketDariNama(nama: string) {
  return nama
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [layananList, setLayananList] = useState<Layanan[]>(layananAwal);

  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    layananAwal.forEach((l) => (initial[l.id] = l.jumlahAntrianAwal));
    return initial;
  });

  const [currentServing, setCurrentServing] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    layananAwal.forEach((l) => (initial[l.id] = 0));
    return initial;
  });

  const [loketStatus, setLoketStatus] = useState<Record<string, LoketStatus>>(() => {
    const initial: Record<string, LoketStatus> = {};
    layananAwal.forEach((l) => (initial[l.id] = "buka"));
    return initial;
  });

  const [riwayatAntrian, setRiwayatAntrian] = useState<AntrianEvent[]>([]);
  const [kategoriList, setKategoriList] = useState<string[]>(["Umum", "Kependudukan", "Perizinan"]);

  const ambilAntrian = (id: string) => {
    setCounts((prev) => {
      const nextCount = (prev[id] ?? 0) + 1;
      const layanan = layananList.find((l) => l.id === id);
      const nomorTiket = `${layanan?.prefix ?? "X"}${String(nextCount).padStart(3, "0")}`;

      setRiwayatAntrian((prevRiwayat) => [
        ...prevRiwayat,
        {
          id: buatIdTiket(),
          loketId: id,
          nomorTiket,
          timestamp: Date.now(),
          status: "menunggu",
        },
      ]);

      return { ...prev, [id]: nextCount };
    });
  };

  const panggilSelanjutnya = (id: string) => {
    setCurrentServing((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

    // Tandai tiket paling lama yang masih "menunggu" di loket ini jadi "dilayani"
    setRiwayatAntrian((prev) => {
      const idx = prev.findIndex((e) => e.loketId === id && e.status === "menunggu");
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], status: "dilayani" };
      return updated;
    });
  };

  const tutupLoket = (id: string) => {
    setLoketStatus((prev) => ({ ...prev, [id]: "tutup" }));
  };

  const bukaLoket = (id: string) => {
    setLoketStatus((prev) => ({ ...prev, [id]: "buka" }));
  };

  const resetSemuaAntrian = () => {
    const resetCounts: Record<string, number> = {};
    const resetServing: Record<string, number> = {};
    const resetStatus: Record<string, LoketStatus> = {};
    layananList.forEach((l) => {
      resetCounts[l.id] = 0;
      resetServing[l.id] = 0;
      resetStatus[l.id] = "buka";
    });
    setCounts(resetCounts);
    setCurrentServing(resetServing);
    setLoketStatus(resetStatus);
    setRiwayatAntrian([]);
  };

  const tambahKategori = (nama: string) => {
    const trimmed = nama.trim();
    if (!trimmed) return;
    setKategoriList((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
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

  // Admin menambah loket baru lewat form "Tambah Layanan Loket".
  // id dibuat otomatis dari nama; kalau bentrok, ditambah angka di belakang.
  const tambahLoket = (data: TambahLoketInput) => {
    let id = buatIdLoketDariNama(data.nama);
    let counter = 2;
    while (layananList.some((l) => l.id === id)) {
      id = `${buatIdLoketDariNama(data.nama)}-${counter}`;
      counter += 1;
    }

    const loketBaru = { ...data, id } as Layanan;

    setLayananList((prev) => [...prev, loketBaru]);
    setCounts((prev) => ({ ...prev, [id]: loketBaru.jumlahAntrianAwal ?? 0 }));
    setCurrentServing((prev) => ({ ...prev, [id]: 0 }));
    setLoketStatus((prev) => ({ ...prev, [id]: "buka" }));

    // Kalau kategori loket baru belum ada di daftar kategori, otomatis ditambahkan juga
    const kategoriLoketBaru = (data as { kategori?: string }).kategori;
    if (kategoriLoketBaru) tambahKategori(kategoriLoketBaru);
  };

  return (
    <QueueContext.Provider
      value={{
        layananList,
        counts,
        currentServing,
        loketStatus,
        riwayatAntrian,
        kategoriList,
        ambilAntrian,
        panggilSelanjutnya,
        tutupLoket,
        bukaLoket,
        resetSemuaAntrian,
        tambahKategori,
        hapusAntrian,
        hapusRiwayatHari,
        tambahLoket,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}