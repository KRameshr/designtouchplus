const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const TOKEN_KEY = "designtouch_admin_token";
const USER_KEY = "designtouch_admin_user";

// NOTE: localStorage is used here for simplicity (client-side admin panel,
// no server-rendered protected pages yet). For a production-hardened setup,
// prefer an httpOnly cookie set by the backend + Next.js middleware — that
// prevents the token from being readable by any injected/malicious JS.
// Fine for now since this is a small internal tool with one admin user.

export async function login(username, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error(res.status === 401 ? "Invalid username or password" : "Login failed");
  }

  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify({ username: data.username, role: data.role }));
  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return Boolean(getToken());
}

// Authenticated fetch wrapper for admin write operations (POST/PUT/DELETE on
// /api/portfolio, /api/blogs, etc — all protected by SecurityConfig).
export async function adminFetch(path, { method = "GET", body } = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });

  if (res.status === 401) {
    logout();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Session expired — please log in again.");
  }

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`Request failed (${res.status}): ${message}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
