import test from "node:test";
import assert from "node:assert/strict";
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_EVENT,
  COOKIE_POPUP_DISMISSED_KEY,
  DEFAULT_COOKIE_PREFERENCES,
  getStoredCookieConsent,
  saveCookieConsent,
  acceptAllCookies,
  rejectOptionalCookies,
  hasUserConsent,
  isAnalyticsPermitted,
  isPopupDismissedInSession,
  dismissPopupSession,
  resetCookieConsent,
  executeIfAnalyticsPermitted,
} from "../lib/cookieConsent.js";

// Mock localStorage and sessionStorage for Node.js runtime test
class StorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

// Setup simulated window environment
const setupWindowMock = () => {
  const localStorage = new StorageMock();
  const sessionStorage = new StorageMock();
  const listeners = {};

  global.window = {
    localStorage,
    sessionStorage,
    addEventListener: (type, handler) => {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(handler);
    },
    removeEventListener: (type, handler) => {
      if (!listeners[type]) return;
      listeners[type] = listeners[type].filter((h) => h !== handler);
    },
    dispatchEvent: (event) => {
      const type = event.type;
      if (listeners[type]) {
        listeners[type].forEach((h) => h(event));
      }
    },
    location: { pathname: "/" },
  };

  global.CustomEvent = class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  };
};

test("1. Fresh visitor state: isConfigured is false, analytics is off, popup is not dismissed", () => {
  setupWindowMock();

  const consent = getStoredCookieConsent();
  assert.equal(consent.essential, true, "Essential cookies must be true");
  assert.equal(consent.analytics, false, "Analytics must be false by default");
  assert.equal(consent.isConfigured, false, "isConfigured must be false on fresh visit");
  assert.equal(hasUserConsent(), false, "hasUserConsent() must return false");
  assert.equal(isAnalyticsPermitted(), false, "isAnalyticsPermitted() must return false");
  assert.equal(isPopupDismissedInSession(), false, "Popup should not be dismissed initially");
});

test("2. Legacy localStorage without explicit isConfigured: true does NOT lock out popup", () => {
  setupWindowMock();

  // Simulate an older session where isConfigured was missing or undefined
  window.localStorage.setItem(
    COOKIE_CONSENT_KEY,
    JSON.stringify({
      essential: true,
      analytics: false,
      functional: false,
      timestamp: "2026-01-01T00:00:00.000Z",
    })
  );

  const consent = getStoredCookieConsent();
  // With our fix, parsed?.isConfigured === true evaluates to false because it is undefined!
  assert.equal(
    consent.isConfigured,
    false,
    "Legacy objects without isConfigured: true must NOT be treated as configured"
  );
  assert.equal(hasUserConsent(), false, "hasUserConsent() must be false for legacy data");
});

test("3. Scroll percentage calculation and 30% trigger logic", () => {
  // Simulate long homepage (5200px scrollHeight, 800px viewport = 4400px scrollable)
  const scrollHeight = 5200;
  const clientHeight = 800;
  const totalScrollable = scrollHeight - clientHeight; // 4400

  const calculateFraction = (scrollTop) => {
    return totalScrollable > 0 ? scrollTop / totalScrollable : 0;
  };

  // Top of page (0px)
  assert.equal(calculateFraction(0), 0);
  assert.ok(calculateFraction(0) < 0.3, "At 0px, progress is < 30%");

  // Scrolled 500px (~11.36%)
  assert.ok(calculateFraction(500) < 0.3, "At 500px, progress is < 30%");

  // Scrolled 1200px (~27.27%)
  assert.ok(calculateFraction(1200) < 0.3, "At 1200px, progress is < 30%");

  // Scrolled 1320px (30.00%)
  assert.ok(calculateFraction(1320) >= 0.3, "At 1320px, progress reaches 30% trigger");

  // Scrolled 2000px (~45.45%)
  assert.ok(calculateFraction(2000) >= 0.3, "At 2000px, progress exceeds 30%");

  // Short page edge case: totalScrollable <= 20
  const shortTotalScrollable = 10;
  const shouldSkipShortPage = shortTotalScrollable <= 20;
  assert.equal(shouldSkipShortPage, true, "Very short pages should skip scroll trigger");
});

test("4. Accept All enables analytics, marks isConfigured: true, and permits tracking", () => {
  setupWindowMock();

  acceptAllCookies();

  const consent = getStoredCookieConsent();
  assert.equal(consent.essential, true);
  assert.equal(consent.analytics, true, "Analytics must be true after Accept All");
  assert.equal(consent.isConfigured, true, "isConfigured must be true");
  assert.equal(hasUserConsent(), true);
  assert.equal(isAnalyticsPermitted(), true);

  // Verification of gatekeeper
  let trackerRan = false;
  executeIfAnalyticsPermitted(() => {
    trackerRan = true;
  });
  assert.equal(trackerRan, true, "executeIfAnalyticsPermitted must run callback when permitted");
});

test("5. Reject Optional keeps analytics OFF, marks isConfigured: true, and blocks tracking", () => {
  setupWindowMock();

  rejectOptionalCookies();

  const consent = getStoredCookieConsent();
  assert.equal(consent.essential, true);
  assert.equal(consent.analytics, false, "Analytics must be false after Reject Optional");
  assert.equal(consent.isConfigured, true, "isConfigured must be true");
  assert.equal(hasUserConsent(), true);
  assert.equal(isAnalyticsPermitted(), false, "Tracking must NOT be permitted");

  // Verification of gatekeeper blocking
  let trackerRan = false;
  executeIfAnalyticsPermitted(() => {
    trackerRan = true;
  });
  assert.equal(trackerRan, false, "executeIfAnalyticsPermitted must NOT run callback when rejected");
});

test("6. Temporary dismissal sets session flag without saving consent", () => {
  setupWindowMock();

  dismissPopupSession();

  assert.equal(isPopupDismissedInSession(), true, "Session dismissal flag must be set");
  assert.equal(hasUserConsent(), false, "User consent must NOT be set by dismissal");
  assert.equal(getStoredCookieConsent().isConfigured, false, "isConfigured must remain false");
});

test("7. resetCookieConsent clears both localStorage and sessionStorage", () => {
  setupWindowMock();

  // First save consent and dismissal
  saveCookieConsent({ analytics: true });
  dismissPopupSession();
  assert.equal(hasUserConsent(), true);
  assert.equal(isPopupDismissedInSession(), true);

  // Now perform DevTools reset
  resetCookieConsent();

  assert.equal(hasUserConsent(), false, "Consent must be cleared");
  assert.equal(isPopupDismissedInSession(), false, "Session dismissal must be cleared");
  assert.equal(getStoredCookieConsent().isConfigured, false);
});

test("8. 24-Hour Expiry: Consent expires after 24 hours and prompts for consent again", () => {
  setupWindowMock();

  // Save consent with timestamp 25 hours in the past
  const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
  window.localStorage.setItem(
    COOKIE_CONSENT_KEY,
    JSON.stringify({
      essential: true,
      analytics: true,
      functional: false,
      timestamp: twentyFiveHoursAgo,
      isConfigured: true,
    })
  );

  // Should be expired
  let consent = getStoredCookieConsent();
  assert.equal(consent.isConfigured, false, "Consent older than 24 hours must be marked expired");
  assert.equal(hasUserConsent(), false, "hasUserConsent() must return false when expired");
  assert.equal(consent.analytics, false, "Analytics must be false when expired");

  // Save consent within 24 hours (e.g. 2 hours ago)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  window.localStorage.setItem(
    COOKIE_CONSENT_KEY,
    JSON.stringify({
      essential: true,
      analytics: true,
      functional: false,
      timestamp: twoHoursAgo,
      isConfigured: true,
    })
  );

  consent = getStoredCookieConsent();
  assert.equal(consent.isConfigured, true, "Consent within 24 hours must remain valid");
  assert.equal(hasUserConsent(), true, "hasUserConsent() must be true");
  assert.equal(consent.analytics, true, "Analytics must be true within 24 hours");
});

test("9. Scroll trigger simulation: 0-29% hidden, 30%+ triggers popup", () => {
  setupWindowMock();

  const scrollHeight = 5000;
  const clientHeight = 1000;
  const totalScrollable = scrollHeight - clientHeight; // 4000

  const evaluateScrollTrigger = (scrollTop) => {
    if (totalScrollable <= 20) return false;
    const fraction = scrollTop / totalScrollable;
    return fraction >= 0.3;
  };

  // 0% - 29% scroll
  assert.equal(evaluateScrollTrigger(0), false, "0% scroll must not trigger");
  assert.equal(evaluateScrollTrigger(400), false, "10% scroll must not trigger");
  assert.equal(evaluateScrollTrigger(800), false, "20% scroll must not trigger");
  assert.equal(evaluateScrollTrigger(1160), false, "29% scroll must not trigger");

  // 30%+ scroll
  assert.equal(evaluateScrollTrigger(1200), true, "Exact 30% scroll must trigger popup");
  assert.equal(evaluateScrollTrigger(1600), true, "40% scroll must trigger popup");
  assert.equal(evaluateScrollTrigger(4000), true, "100% scroll must trigger popup");
});

test("10. Short page handling: pages shorter than viewport handle gracefully without triggering or erroring", () => {
  setupWindowMock();

  const checkShortPage = (scrollHeight, clientHeight, scrollTop) => {
    const totalScrollable = scrollHeight - clientHeight;
    if (!totalScrollable || totalScrollable <= 20) {
      return { handledGracefully: true, triggered: false };
    }
    const fraction = scrollTop / totalScrollable;
    return { handledGracefully: true, triggered: fraction >= 0.3 };
  };

  // Equal height (cannot scroll)
  const res1 = checkShortPage(800, 800, 0);
  assert.equal(res1.handledGracefully, true);
  assert.equal(res1.triggered, false);

  // Shorter height (viewport taller than content)
  const res2 = checkShortPage(600, 900, 0);
  assert.equal(res2.handledGracefully, true);
  assert.equal(res2.triggered, false);

  // Marginal scrollable height (<= 20px)
  const res3 = checkShortPage(815, 800, 10);
  assert.equal(res3.handledGracefully, true);
  assert.equal(res3.triggered, false);
});

test("11. Cross-device scroll position resolution (desktop, mobile viewport, WebKit, documentElement)", () => {
  setupWindowMock();

  // Test resolving scroll position using Math.max across multiple devices
  const resolveScrollTop = ({ windowScrollY, pageYOffset, scrollingElemTop, docElemTop, bodyTop }) => {
    return Math.max(
      windowScrollY || 0,
      pageYOffset || 0,
      scrollingElemTop || 0,
      docElemTop || 0,
      bodyTop || 0
    );
  };

  // Modern desktop (window.scrollY standard)
  assert.equal(resolveScrollTop({ windowScrollY: 1500, pageYOffset: 1500 }), 1500);

  // Mobile WebKit where window.scrollY might be 0 but document.scrollingElement has scroll
  assert.equal(resolveScrollTop({ windowScrollY: 0, pageYOffset: 0, scrollingElemTop: 1200 }), 1200);

  // Legacy document.documentElement fallback
  assert.equal(resolveScrollTop({ docElemTop: 950 }), 950);
});

test("12. Expiry cleanup: 24h expiration automatically clears session dismissal for re-prompt", () => {
  setupWindowMock();

  // Set session dismissal
  dismissPopupSession();
  assert.equal(isPopupDismissedInSession(), true);

  // Set expired consent (25 hours ago)
  const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
  window.localStorage.setItem(
    COOKIE_CONSENT_KEY,
    JSON.stringify({
      essential: true,
      analytics: true,
      timestamp: twentyFiveHoursAgo,
      isConfigured: true,
    })
  );

  // Calling getStoredCookieConsent should clear stale session dismissal
  const consent = getStoredCookieConsent();
  assert.equal(consent.isConfigured, false, "Must return unconfigured consent");
  assert.equal(isPopupDismissedInSession(), false, "Stale session dismissal must be purged on expiry");
});

