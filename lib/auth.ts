// Lightweight client-side email "login" for the demo — no password, no backend,
// no DB. The email just personalizes the session and gates the app. Persisted in
// localStorage so the session survives refresh until the user signs out.

export interface SessionUser {
  email: string;
  name?: string;
  since: number; // epoch ms
}

const KEY = "nwad.user";

export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export function getUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as SessionUser;
    return u && typeof u.email === "string" ? u : null;
  } catch {
    return null;
  }
}

export function setUser(email: string, name?: string): SessionUser {
  const u: SessionUser = { email: email.trim(), name: name?.trim() || undefined, since: Date.now() };
  window.localStorage.setItem(KEY, JSON.stringify(u));
  return u;
}

export function signOut(): void {
  window.localStorage.removeItem(KEY);
}

export function initials(u: SessionUser): string {
  const base = u.name || u.email;
  const parts = base.replace(/@.*/, "").split(/[.\s_-]+/).filter(Boolean);
  const chars = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  return (chars || base[0] || "?").toUpperCase();
}
