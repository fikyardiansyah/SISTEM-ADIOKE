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
  };
}

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

export function clearAdminSession() {
  localStorage.removeItem(STORAGE_KEY);
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