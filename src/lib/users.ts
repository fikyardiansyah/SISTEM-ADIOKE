import type { AkunAdmin, PeranAkun, StatusAkun } from "../context/QueueContext";
import { apiFetch } from "./api";
import { getAdminSession } from "./auth";

export interface AkunInput {
  nama: string;
  email: string;
  username: string;
  peran: PeranAkun;
  status: StatusAkun;
  loketId?: string | null;
  password?: string;
}

interface AkunApiRow {
  id: string;
  nama: string;
  email: string;
  username: string;
  peran: PeranAkun;
  status: StatusAkun;
  loket_id: string | null;
  login_terakhir: string | null;
  nama_loket: string | null;
}

function tokenWajib() {
  const session = getAdminSession();
  if (!session) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  return session.token;
}

function mapAkun(row: AkunApiRow): AkunAdmin {
  return {
    id: row.id,
    nama: row.nama,
    email: row.email,
    username: row.username,
    peran: row.peran,
    status: row.status,
    loketId: row.loket_id,
    loginTerakhir: row.login_terakhir ? new Date(row.login_terakhir).getTime() : null,
  };
}

export async function ambilAkun(): Promise<AkunAdmin[]> {
  const rows = await apiFetch<AkunApiRow[]>("/users", {}, tokenWajib());
  return rows.map(mapAkun);
}

export async function buatAkun(payload: AkunInput) {
  await apiFetch("/users", { method: "POST", body: JSON.stringify(payload) }, tokenWajib());
}

export async function ubahAkun(id: string, payload: AkunInput) {
  await apiFetch(`/users/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) }, tokenWajib());
}

export async function hapusAkunServer(id: string) {
  await apiFetch(`/users/${encodeURIComponent(id)}`, { method: "DELETE" }, tokenWajib());
}
