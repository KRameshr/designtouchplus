/**
 * DesignTouch+ Visitor Identity Management Utility
 *
 * Remembers visitor Name & Email for 24 hours across page reloads/visits.
 * Stored in localStorage under 'designtouch_visitor_identity'.
 *
 * CRITICAL PRIVACY & FRESH CHAT GUARANTEE:
 * - Stores ONLY: leadId, name, email, timestamp, expiresAt.
 * - NEVER stores chat messages, conversation logs, or transcripts.
 * - Expires strictly after 24 hours (86,400,000 ms).
 * - Safe fallback if browser storage is unavailable or disabled.
 */

export const VISITOR_IDENTITY_KEY = "designtouch_visitor_identity";
export const VISITOR_IDENTITY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Retrieves the remembered visitor identity if still valid (< 24 hours).
 * Returns null if missing, expired, or malformed.
 * @returns {{ leadId: string | null, name: string, email: string } | null}
 */
export function getRememberedVisitor() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(VISITOR_IDENTITY_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      clearRememberedVisitor();
      return null;
    }

    const { leadId, name, email, timestamp, expiresAt } = parsed;

    // Validate required fields
    if (!name || typeof name !== "string" || !email || typeof email !== "string") {
      clearRememberedVisitor();
      return null;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !trimmedEmail.includes("@")) {
      clearRememberedVisitor();
      return null;
    }

    const now = Date.now();
    const effectiveExpiry =
      typeof expiresAt === "number"
        ? expiresAt
        : typeof timestamp === "number"
        ? timestamp + VISITOR_IDENTITY_TTL_MS
        : 0;

    // Check 24-hour expiration
    if (!effectiveExpiry || now > effectiveExpiry) {
      clearRememberedVisitor();
      return null;
    }

    return {
      leadId: leadId || null,
      name: trimmedName,
      email: trimmedEmail,
    };
  } catch {
    // Storage restricted or JSON parse error
    clearRememberedVisitor();
    return null;
  }
}

/**
 * Persists visitor Name & Email for 24 hours.
 * Strictly avoids storing any message content or chat history.
 * @param {{ leadId?: string | null, name: string, email: string }} visitor
 */
export function saveRememberedVisitor({ leadId, name, email }) {
  if (typeof window === "undefined") return;
  if (!name || !email) return;

  const trimmedName = String(name).trim();
  const trimmedEmail = String(email).trim().toLowerCase();
  if (!trimmedName || !trimmedEmail || !trimmedEmail.includes("@")) return;

  try {
    const now = Date.now();
    const record = {
      leadId: leadId || null,
      name: trimmedName,
      email: trimmedEmail,
      timestamp: now,
      expiresAt: now + VISITOR_IDENTITY_TTL_MS,
    };
    window.localStorage.setItem(VISITOR_IDENTITY_KEY, JSON.stringify(record));
  } catch (err) {
    console.warn("Unable to save visitor identity to localStorage:", err);
  }
}

/**
 * Clears remembered visitor identity from localStorage.
 */
export function clearRememberedVisitor() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(VISITOR_IDENTITY_KEY);
    } catch {}
  }
}

