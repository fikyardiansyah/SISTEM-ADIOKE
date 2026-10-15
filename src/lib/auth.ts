import { apiFetch } from "./api";

const STORAGE_KEY = "adioke_admin_session";

export interface AdminSession {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    nama: string;
    email: string;
    username: string;
    peran: "Super Admin" | "Admin" | "Petugas";
    loketId: string | null;
  };
}

export interface AdminProfile {
  nama: string;
  email: string;
  username: string;
  peran: AdminSession["user"]["peran"];
  nip: string | null;
  nomorTelepon: string | null;
  fotoProfil: string | null;
}

export interface AdminProfileInput {
  nama: string;
  email: string;
  nip: string;
  nomorTelepon: string;
  fotoProfil: string | null;
}

export const ADMIN_SESSION_UPDATED_EVENT = "adioke:admin-session-updated";

export function getAdminSession(): AdminSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function setAdminSession(session: AdminSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function tokenWajib() {
  const session = getAdminSession();
  if (!session) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
  return session;
}

export function clearAdminSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function ambilProfilAdmin(): Promise<AdminProfile> {
  const session = tokenWajib();
  return apiFetch<AdminProfile>("/auth/profile", {}, session.token);
}

export async function simpanProfilAdmin(profile: AdminProfileInput): Promise<AdminProfile> {
  const session = tokenWajib();
  const updated = await apiFetch<AdminProfile>(
    "/auth/profile",
    { method: "PATCH", body: JSON.stringify(profile) },
    session.token
  );
  setAdminSession({
    ...session,
    user: { ...session.user, nama: updated.nama, email: updated.email },
  });
  window.dispatchEvent(new Event(ADMIN_SESSION_UPDATED_EVENT));
  return updated;
}

export async function gantiPasswordAdmin(passwordSaatIni: string, passwordBaru: string): Promise<void> {
  const session = tokenWajib();
  await apiFetch(
    "/auth/change-password",
    { method: "POST", body: JSON.stringify({ passwordSaatIni, passwordBaru }) },
    session.token
  );
}

/** Login sungguhan ke POST /api/auth/login (proxy ke Supabase Auth di backend) */
export async function loginAdmin(usernameOrEmail: string, password: string): Promise<AdminSession> {
  const session = await apiFetch<AdminSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ usernameOrEmail, password }),
  });
  setAdminSession(session);
  return session;
}