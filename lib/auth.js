const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const TOKEN_KEY = "designtouch_admin_token";
const USER_KEY = "designtouch_admin_user";

// NOTE: localStorage is used here for simplicity (client-side admin panel,
// no server-rendered protected pages yet). For a production-hardened setup,
// prefer an httpOnly cookie set by the backend + Next.js middleware — that
// prevents the token from being readable by any injected/malicious JS.
// Fine for now since this is a small internal tool with one admin user.

export async function login(username, password) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    // Network error / CORS rejection / backend down — never surface raw details
    throw new Error("Unable to reach the server. Please check that the backend is running and try again.");
  }

  if (!res.ok) {
    if (res.status === 401) throw new Error("Invalid username or password.");
    if (res.status === 400) throw new Error("Username and password are required.");
    throw new Error("Login failed. Please try again shortly.");
  }

  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify({ username: data.username, role: data.role }));
  return data;
}

export function logout() {
  if (typeof window === "undefined") return;
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
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Reads the `exp` claim (seconds) from the JWT payload. This is only a UX
// convenience so expired sessions are bounced to login immediately — the
// backend still verifies the signature and expiry on every protected call.
function getTokenExpiryMs(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const { exp } = JSON.parse(atob(padded));
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  const expiry = getTokenExpiryMs(token);
  if (expiry === null || expiry <= Date.now()) {
    logout(); // malformed or expired — clear stale credentials
    return false;
  }
  return true;
}

// Authenticated fetch wrapper for admin write operations (POST/PUT/DELETE on
// /api/portfolio, /api/blogs, etc — all protected by SecurityConfig).
export async function adminFetch(path, { method = "GET", body } = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to reach the server. Please check that the backend is running.");
  }

  // Spring Security answers a missing/invalid/expired JWT with 403 (no custom
  // entry point is configured), so treat 403-with-a-token like 401.
  if (res.status === 401 || (res.status === 403 && token)) {
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
