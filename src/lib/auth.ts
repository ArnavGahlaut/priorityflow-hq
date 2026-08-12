export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "OPERATOR" | "TRIAGE_LEAD" | "ADMIN";
}

const isBrowser = typeof window !== "undefined";

export function getToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem("token");
}

export function getUser(): AuthUser | null {
  if (!isBrowser) return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout() {
  if (!isBrowser) return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function roleHomePath(role: AuthUser["role"]): string {
  if (role === "ADMIN") return "/admin";
  if (role === "OPERATOR" || role === "TRIAGE_LEAD") return "/ops";
  return "/app";
}
