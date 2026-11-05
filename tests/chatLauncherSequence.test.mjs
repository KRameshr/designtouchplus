import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

test("Scenario 1: First-time visitor sees cookie popup (launcher starts hidden)", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  // State 0: Initial state is HIDDEN
  assert.match(content, /useState\(["']HIDDEN["']\)/, "Launcher initial state is HIDDEN");
  assert.match(content, /launcherState !== ["']HIDDEN["']/, "Button does not render while launcherState is HIDDEN");
  assert.match(content, /COOKIE_MODAL_STATE_EVENT/, "Subscribes to cookie modal state event");
});

test("Scenario 2: Visitor accepts cookies and launcher appears after configured 10s delay", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  assert.match(content, /APPEAR_DELAY_MS:\s*10_?000/, "Configures exact 10 second appearance delay");
  assert.match(content, /startAppearanceSequence\(LAUNCHER_CONFIG\.APPEAR_DELAY_MS\)/, "Starts sequence with 10s delay on cookie modal close");
  assert.match(content, /setLauncherState\(["']APPEARING["']\)/, "Transitions to APPEARING state after 10s delay");
});

test("Scenario 3: Visitor rejects optional cookies and launcher still appears after popup closes", () => {
  const footerPath = path.join(FRONTEND_ROOT, "components/layout/Footer.jsx");
  const footerContent = fs.readFileSync(footerPath, "utf8");
  const cookieLibPath = path.join(FRONTEND_ROOT, "lib/cookieConsent.js");
  const cookieLibContent = fs.readFileSync(cookieLibPath, "utf8");

  assert.match(footerContent, /notifyCookieModalState/, "Footer notifies cookie modal state changes");
  assert.match(footerContent, /handleRejectOptional/, "Provides reject optional handler");
  assert.match(cookieLibContent, /COOKIE_MODAL_STATE_EVENT/, "Defines COOKIE_MODAL_STATE_EVENT");
  assert.match(cookieLibContent, /notifyCookieModalState/, "Exports notifyCookieModalState");
});

test("Scenario 4: Returning visitor with saved preferences sees launcher after configured 10s delay", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  assert.match(content, /getStoredCookieConsent\(\)/, "Checks stored cookie consent on load");
  assert.match(content, /isPopupDismissedInSession\(\)/, "Checks session dismissal on load");
  assert.match(content, /if\s*\(isConsentedOrDismissed\)\s*\{[\s\S]*startAppearanceSequence\(LAUNCHER_CONFIG\.APPEAR_DELAY_MS\)/, "Triggers 10s sequence for returning visitors with saved preferences");
});

test("Scenario 5: Attention animation runs once after appearance and settles into resting state", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  assert.match(content, /ATTENTION_DELAY_MS:\s*12_?000/, "Configures 10-15s delay (12s) before attention animation");
  assert.match(content, /ATTENTION_DURATION_MS:\s*1_?200/, "Configures subtle non-intrusive attention duration (1.2s)");
  assert.match(content, /setLauncherState\(["']ATTENTION["']\)/, "Transitions into ATTENTION state");
  assert.match(content, /setLauncherState\(["']RESTING["']\)/, "Settles back into stable RESTING state");
  assert.match(content, /markSessionAnimated\(\)/, "Persists completion in sessionStorage to run only once per session");
});

test("Scenario 6: Final launcher matches client reference design (red, square corners, outline icon, uppercase text, no square mark)", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  // Red background
  assert.match(content, /bg-brand-red/, "Uses brand red rectangular background");

  // Bold white uppercase text
  assert.match(content, /LET&apos;S CHAT!|LET'S CHAT!/, "Displays uppercase 'LET'S CHAT!'");
  assert.match(content, /font-display font-black/, "Uses bold typography");
  assert.match(content, /text-white/, "Uses white text");

  // Small square/box mark is completely removed
  assert.equal(
    /bg-white rounded-none shrink-0/.test(content),
    false,
    "Confirms small square mark is completely removed"
  );

  // White outlined chat icon (speech bubble with small tail)
  assert.match(content, /<MessageSquare[\s\S]*stroke-\[2\.2\]/, "Renders white outlined chat icon with sharp stroke");
  assert.match(content, /fill-none/, "Icon has clean outline without fill");

  // Subtle red glow
  assert.match(content, /shadow-\[0_0_24px_rgba\(239,68,68,0\.5\)\]/, "Applies subtle red ambient glow");

  // Sharp square corners
  assert.match(content, /rounded-none/, "Enforces strict border-radius 0");
});

test("Scenario 7: Clicking launcher opens existing chatbot panel and aborts animations", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  assert.match(content, /handleOpenChat/, "Provides handleOpenChat handler");
  assert.match(content, /clearAllLauncherTimers\(\)/, "Clears any pending animation timers on open");
  assert.match(content, /markSessionAnimated\(\)/, "Marks session as animated on manual open");
  assert.match(content, /setIsOpen\(true\)/, "Opens existing chatbot panel");
});

test("Scenario 8: Opening and closing chatbot returns to stable resting launcher without replaying animations", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  assert.match(content, /handleCloseChat/, "Provides handleCloseChat handler");
  assert.match(content, /setIsOpen\(false\)[\s\S]*setLauncherState\(["']RESTING["']\)/, "Sets launcher directly to RESTING state when closing chat");
  assert.match(content, /hasAnimatedInSession[\s\S]*setLauncherState\(["']RESTING["']\)/, "Restores directly to RESTING if already animated in this session");
});

test("Scenario 9: Admin dashboard and admin pages never show launcher", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  assert.match(content, /const isAdmin = pathname\?\.startsWith\(["']\/admin["']\)/, "Detects admin routes");
  assert.match(content, /if \(isAdmin\) \{?\s*return null;?/, "Guarantees launcher never renders on admin pages");
});

test("Scenario 10: Mobile responsiveness and prefers-reduced-motion accessibility", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  // Reduced motion
  assert.match(content, /prefers-reduced-motion/, "Detects prefers-reduced-motion");
  assert.match(content, /if \(prefersReducedMotion\) \{[\s\S]*setLauncherState\(["']RESTING["']\)/, "Bypasses animations for reduced-motion users");

  // Responsive design
  assert.match(content, /px-4 sm:px-6/, "Responsive horizontal padding");
  assert.match(content, /py-3 sm:py-3\.5/, "Responsive vertical padding");
  assert.match(content, /text-xs sm:text-sm/, "Responsive typography sizing");
  assert.match(content, /bottom-4 sm:bottom-6 right-4 sm:right-6/, "Responsive fixed positioning");
});
