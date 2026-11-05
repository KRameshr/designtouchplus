/**
 * DesignTouch+ Cookie Consent Management Utility
 *
 * Provides a unified source of truth for cookie preferences:
 * - Persistent storage in localStorage under 'designtouch_cookie_consent'
 * - Session-level dismissal tracking under 'designtouch_cookie_popup_dismissed'
 * - Event dispatching ('designtouch_cookie_consent_updated') for real-time cross-component sync
 * - Safe SSR fallbacks
 * - Strict gating ensuring optional analytics only execute after affirmative consent
 * - Developer & tester DevTools reset function: window.resetCookieConsent()
 */

export const COOKIE_CONSENT_KEY = "designtouch_cookie_consent";
export const COOKIE_CONSENT_EVENT = "designtouch_cookie_consent_updated";
export const COOKIE_POPUP_DISMISSED_KEY = "designtouch_cookie_popup_dismissed";
export const COOKIE_MODAL_STATE_EVENT = "designtouch_cookie_modal_state";
export const COOKIE_CONSENT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours validity

/**
 * Dispatches an event when the cookie modal opens or closes.
 * @param {boolean} isOpen
 */
export function notifyCookieModalState(isOpen) {
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent(COOKIE_MODAL_STATE_EVENT, { detail: { isOpen: Boolean(isOpen) } })
      );
    } catch {}
  }
}

export const DEFAULT_COOKIE_PREFERENCES = Object.freeze({
  essential: true, // Always active, required for security & core navigation
  analytics: false, // Disabled by default until explicit opt-in (DPDP/GDPR compliant)
  functional: false, // UI preferences and conveniences
  timestamp: null,
  isConfigured: false,
});

/**
 * Reads stored cookie preferences from localStorage.
 * Automatically expires after 24 hours, returning default unconfigured preferences.
 * Returns default preferences if not yet configured or running on the server.
 */
export function getStoredCookieConsent() {
  if (typeof window === "undefined") {
    return { ...DEFAULT_COOKIE_PREFERENCES };
  }

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) {
      return { ...DEFAULT_COOKIE_PREFERENCES };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_COOKIE_PREFERENCES };
    }

    // 24-Hour Expiry Check: If consent is older than 24 hours (or missing timestamp), treat as expired
    const savedTime = parsed.timestamp ? new Date(parsed.timestamp).getTime() : 0;
    const isExpired = !savedTime || Date.now() - savedTime > COOKIE_CONSENT_TTL_MS;

    if (isExpired) {
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.removeItem(COOKIE_POPUP_DISMISSED_KEY);
        } catch {}
      }
      return { ...DEFAULT_COOKIE_PREFERENCES };
    }

    return {
      essential: true, // Essential is always true
      analytics: Boolean(parsed.analytics),
      functional: Boolean(parsed.functional),
      timestamp: parsed.timestamp || null,
      isConfigured: parsed?.isConfigured === true,
    };
  } catch (err) {
    console.warn("Unable to parse stored cookie consent:", err);
    return { ...DEFAULT_COOKIE_PREFERENCES };
  }
}

/**
 * Checks whether the visitor has already saved a cookie consent preference.
 * @returns {boolean}
 */
export function hasUserConsent() {
  return getStoredCookieConsent().isConfigured;
}

/**
 * Checks whether analytics tracking is affirmatively permitted.
 * Strictly returns false if user has not yet configured preferences or opted out.
 * @returns {boolean}
 */
export function isAnalyticsPermitted() {
  const consent = getStoredCookieConsent();
  return Boolean(consent.isConfigured && consent.analytics);
}

/**
 * Checks if the popup was temporarily dismissed in the current session.
 * @returns {boolean}
 */
export function isPopupDismissedInSession() {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(COOKIE_POPUP_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Marks the popup as temporarily dismissed for the current session without saving consent.
 */
export function dismissPopupSession() {
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(COOKIE_POPUP_DISMISSED_KEY, "true");
      notifyCookieModalState(false);
    } catch {}
  }
}

/**
 * Resets cookie consent preferences and session dismissal.
 * Can be called from code or directly in browser DevTools: window.resetCookieConsent()
 */
export function resetCookieConsent() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(COOKIE_CONSENT_KEY);
      window.sessionStorage.removeItem(COOKIE_POPUP_DISMISSED_KEY);
      window.dispatchEvent(
        new CustomEvent(COOKIE_CONSENT_EVENT, { detail: { ...DEFAULT_COOKIE_PREFERENCES } })
      );
      if (typeof console !== "undefined") {
        console.log(
          "%c[DesignTouch+] Cookie consent & session dismissal reset. Ready for testing.",
          "color: #22c55e; font-weight: bold;"
        );
      }
    } catch (e) {
      console.warn("Failed to reset cookie consent:", e);
    }
  }
}

// Expose reset helpers on global window object for developer and tester convenience
if (typeof window !== "undefined") {
  window.resetDesignTouchCookies = resetCookieConsent;
  window.resetCookieConsent = resetCookieConsent;
}

/**
 * Persists cookie consent preferences and notifies all listeners in the window.
 * @param {Object} preferences
 * @param {boolean} [preferences.analytics]
 * @param {boolean} [preferences.functional]
 * @returns {Object} The updated consent object
 */
export function saveCookieConsent({ analytics = false, functional = false }) {
  const consent = {
    essential: true,
    analytics: Boolean(analytics),
    functional: Boolean(functional),
    timestamp: new Date().toISOString(),
    isConfigured: true,
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
      window.dispatchEvent(
        new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consent })
      );
    } catch (err) {
      console.warn("Unable to save cookie consent to localStorage:", err);
    }
  }

  return consent;
}

/**
 * Accepts all optional cookie categories.
 */
export function acceptAllCookies() {
  return saveCookieConsent({ analytics: true, functional: true });
}

/**
 * Rejects all optional cookie categories (retaining essential only).
 */
export function rejectOptionalCookies() {
  return saveCookieConsent({ analytics: false, functional: false });
}

/**
 * Subscribes to cookie consent updates across components.
 * @param {Function} callback
 * @returns {Function} cleanup unsubscribe function
 */
export function subscribeToCookieConsent(callback) {
  if (typeof window === "undefined" || typeof callback !== "function") {
    return () => {};
  }

  const handler = (event) => {
    callback(event.detail || getStoredCookieConsent());
  };

  window.addEventListener(COOKIE_CONSENT_EVENT, handler);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, handler);
  };
}

/**
 * Safe gatekeeper for executing optional analytics tracking logic.
 * Ensures tracking code ONLY runs if affirmative user consent is granted.
 * @param {Function} trackingCallback
 */
export function executeIfAnalyticsPermitted(trackingCallback) {
  if (typeof window === "undefined" || typeof trackingCallback !== "function") {
    return;
  }

  if (isAnalyticsPermitted()) {
    try {
      trackingCallback();
    } catch (err) {
      console.warn("Analytics execution error:", err);
    }
    return;
  }

  // If not yet consented, subscribe once for future consent in this session
  const unsubscribe = subscribeToCookieConsent((consent) => {
    if (consent.isConfigured && consent.analytics) {
      try {
        trackingCallback();
      } catch (err) {
        console.warn("Analytics execution error on consent:", err);
      }
      unsubscribe();
    }
  });
}
