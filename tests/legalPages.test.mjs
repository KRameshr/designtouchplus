import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");

const PRIVACY_PAGE_PATH = path.join(FRONTEND_ROOT, "app", "privacy-policy", "page.js");
const TERMS_PAGE_PATH = path.join(FRONTEND_ROOT, "app", "terms-and-conditions", "page.js");
const COOKIE_PAGE_PATH = path.join(FRONTEND_ROOT, "app", "cookie-policy", "page.js");
const PRIVACY_REDIRECT_PATH = path.join(FRONTEND_ROOT, "app", "privacy", "page.js");
const TERMS_REDIRECT_PATH = path.join(FRONTEND_ROOT, "app", "terms", "page.js");
const COOKIE_UTIL_PATH = path.join(FRONTEND_ROOT, "lib", "cookieConsent.js");
const LEGAL_LAYOUT_PATH = path.join(FRONTEND_ROOT, "components", "legal", "LegalPageLayout.jsx");
const COOKIE_PANEL_PATH = path.join(FRONTEND_ROOT, "components", "legal", "CookiePreferencesPanel.jsx");
const FOOTER_PATH = path.join(FRONTEND_ROOT, "components", "layout", "Footer.jsx");

test("1. Legal page routes, utilities, and components exist and are readable", () => {
  assert.ok(fs.existsSync(PRIVACY_PAGE_PATH), "Privacy Policy page must exist at app/privacy-policy/page.js");
  assert.ok(fs.existsSync(TERMS_PAGE_PATH), "Terms & Conditions page must exist at app/terms-and-conditions/page.js");
  assert.ok(fs.existsSync(COOKIE_PAGE_PATH), "Cookie Policy page must exist at app/cookie-policy/page.js");
  assert.ok(fs.existsSync(PRIVACY_REDIRECT_PATH), "Privacy fallback redirect must exist at app/privacy/page.js");
  assert.ok(fs.existsSync(TERMS_REDIRECT_PATH), "Terms fallback redirect must exist at app/terms/page.js");
  assert.ok(fs.existsSync(COOKIE_UTIL_PATH), "Cookie consent utility must exist at lib/cookieConsent.js");
  assert.ok(fs.existsSync(LEGAL_LAYOUT_PATH), "LegalPageLayout component must exist at components/legal/LegalPageLayout.jsx");
  assert.ok(fs.existsSync(COOKIE_PANEL_PATH), "CookiePreferencesPanel must exist at components/legal/CookiePreferencesPanel.jsx");
});

test("2. Privacy Policy page complies with DPDP Act 2023, creative agency data flows, and transparent disclosures", () => {
  const content = fs.readFileSync(PRIVACY_PAGE_PATH, "utf8");

  // DPDP Act 2023 compliance
  assert.match(content, /Digital Personal Data Protection Act,\s*2023/i, "Must cite India's DPDP Act, 2023");
  assert.match(content, /Data Fiduciary/i, "Must specify Data Fiduciary role");

  // Collected data categories
  assert.match(content, /Project Inquiries/i, "Must detail project inquiries");
  assert.match(content, /Stay in the Loop/i, "Must cover newsletter subscriptions");
  assert.match(content, /Resend/i, "Must disclose Resend email infrastructure");
  assert.match(content, /Server Logs/i, "Must disclose server and network security logs");
  assert.match(content, /DDoS/i, "Must mention DDoS and security defense");

  // Explicit tracking pixels statement
  assert.match(content, /Meta Pixel/i, "Must mention Meta Pixel disclosure");
  assert.match(content, /TikTok Pixel/i, "Must mention TikTok Pixel disclosure");
  assert.match(
    content,
    /do(es)?\s*(<strong>)?NOT(<\/strong>)?\s*currently\s*deploy/i,
    "Must explicitly state third-party ad tracking pixels are not deployed"
  );
  assert.match(content, /do not sell/i, "Must guarantee data is not sold or brokered");

  // DPDP statutory rights
  assert.match(content, /Right to Access/i, "Must list right to access");
  assert.match(content, /Right to Correction/i, "Must list right to correction");
  assert.match(content, /Right to Erasure/i, "Must list right to erasure");
  assert.match(content, /Right to Grievance Redressal/i, "Must list right to grievance redressal");
  assert.match(content, /Right to Nominate/i, "Must list right to nominate (Section 14 DPDP)");

  // Children's privacy
  assert.match(content, /Children/i, "Must have dedicated children's privacy section");
  assert.match(content, /18/i, "Must specify 18+ business audience");

  // Grievance Officer and contact placeholders
  assert.match(content, /Grievance Officer/i, "Must designate Grievance Officer");
  assert.match(content, /privacy@designtouchplus\.com/i, "Must list privacy contact email");
  assert.match(content, /\[Insert Registered Business Name/i, "Must have business name placeholder");
  assert.match(content, /\[Insert Registered Office Address/i, "Must have registered address placeholder");
  assert.match(content, /\[Insert GSTIN/i, "Must have GSTIN/tax ID placeholder");
  assert.match(content, /\[Insert Grievance Officer Name/i, "Must have Grievance Officer placeholder");
});

test("3. Terms & Conditions page enforces commercial creative agency standards and legal precedence", () => {
  const content = fs.readFileSync(TERMS_PAGE_PATH, "utf8");

  // Contract precedence rule
  assert.match(content, /Rule of Contractual Precedence/i, "Must include contractual precedence rule");
  assert.match(
    content,
    /Master Services Agreement|Statement of Work|counter-signed written quotation/i,
    "Must mention MSAs, SOWs, or counter-signed estimates taking precedence"
  );

  // Creative production services
  assert.match(content, /Video Editing/i, "Must cover video editing");
  assert.match(content, /Motion Graphics/i, "Must cover motion graphics");
  assert.match(content, /Brand Films/i, "Must cover brand films");
  assert.match(content, /Thumbnail Design/i, "Must cover thumbnail design");
  assert.match(content, /YouTube/i, "Must cover YouTube services");

  // Commercial milestones & deposit
  assert.match(content, /50%\s+advance deposit/i, "Must specify 50% commencement deposit");
  assert.match(content, /non-refundable/i, "Must state deposit is non-refundable once production commences");
  assert.match(content, /thirty \(30\) calendar days/i, "Must specify quotation validity");

  // Scope & revisions
  assert.match(content, /two \(2\) rounds/i, "Must define 2 rounds of included revisions");
  assert.match(content, /Out-of-Scope/i, "Must define out-of-scope change orders");

  // Intellectual property transfer condition
  assert.match(
    content,
    /strictly upon complete,\s*full receipt of all agreed fees in cleared funds/i,
    "Copyright transfer must be strictly conditioned upon full payment"
  );
  assert.match(content, /\.prproj/i, "Must protect Premiere Pro project files as proprietary trade secrets");
  assert.match(content, /\.aep/i, "Must protect After Effects project files as proprietary trade secrets");

  // Stock licensing & portfolio showcase rights
  assert.match(content, /Artlist|Musicbed|Envato/i, "Must reference commercial music and stock providers");
  assert.match(content, /perpetual,\s*worldwide,\s*non-exclusive right/i, "Must reserve portfolio showcase rights");
  assert.match(content, /Non-Disclosure Agreement|NDA/i, "Must honor NDA exceptions");

  // Platform and algorithm disclaimers
  assert.match(content, /No Guarantee of Algorithmic Outcomes/i, "Must disclaim algorithm / viral guarantees");
  assert.match(content, /Content ID/i, "Must disclaim YouTube Content ID and platform policy liability");

  // Limitation of liability and Indian governing law
  assert.match(content, /Limitation of Liability/i, "Must include limitation of liability");
  assert.match(
    content,
    /total amount actually paid by the Client to DesignTouch\+/i,
    "Liability must be capped at fees paid for the deliverable"
  );
  assert.match(content, /Republic of India/i, "Governing law must be Republic of India");
  assert.match(content, /\[Insert City, State, India/i, "Must have court jurisdiction placeholder");
});

test("4. Cookie Policy page includes interactive preference center, storage inventory, and zero tracker disclosure", () => {
  const content = fs.readFileSync(COOKIE_PAGE_PATH, "utf8");

  // Explanations
  assert.match(content, /What Are Cookies/i, "Must explain cookies");
  assert.match(content, /Local Storage/i, "Must explain HTML5 local storage");

  // Mounts interactive component
  assert.match(content, /<CookiePreferencesPanel \/>/i, "Must embed CookiePreferencesPanel");

  // Categories
  assert.match(content, /Strictly Essential Cookies/i, "Must define Strictly Essential Cookies");
  assert.match(content, /Analytics\s*(&amp;|&)\s*Performance Cookies/i, "Must define Analytics & Performance Cookies");
  assert.match(content, /Functional\s*(&amp;|&)\s*Experience Preferences/i, "Must define Functional Preferences");
  assert.match(content, /Third-Party Advertising\s*(&amp;|&)\s*Tracking Pixels/i, "Must define Advertising Pixels");

  // Detailed storage inventory table
  assert.match(content, /designtouch_cookie_consent/i, "Must document designtouch_cookie_consent in inventory");
  assert.match(content, /dt_session_csrf/i, "Must document CSRF token in inventory");

  // Browser controls
  assert.match(content, /Google Chrome/i, "Must guide Chrome settings");
  assert.match(content, /Apple Safari/i, "Must guide Safari settings");
  assert.match(content, /Mozilla Firefox/i, "Must guide Firefox settings");
  assert.match(content, /Microsoft Edge/i, "Must guide Edge settings");
});

test("5. Cookie consent management utility (lib/cookieConsent.js) implements key standards and reactive synchronization", () => {
  const content = fs.readFileSync(COOKIE_UTIL_PATH, "utf8");

  assert.match(content, /COOKIE_CONSENT_KEY\s*=\s*"designtouch_cookie_consent"/, "Must define canonical storage key");
  assert.match(content, /COOKIE_CONSENT_EVENT\s*=\s*"designtouch_cookie_consent_updated"/, "Must define custom event");
  assert.match(content, /essential:\s*true/, "Essential cookies must default to true");
  assert.match(content, /analytics:\s*false/, "Analytics cookies must default to false (strict privacy)");
  assert.match(content, /isConfigured:\s*parsed\?\.isConfigured\s*===\s*true/, "Only explicit isConfigured: true counts as saved consent");
  assert.match(content, /getStoredCookieConsent/, "Must export getStoredCookieConsent()");
  assert.match(content, /saveCookieConsent/, "Must export saveCookieConsent()");
  assert.match(content, /acceptAllCookies/, "Must export acceptAllCookies()");
  assert.match(content, /rejectOptionalCookies/, "Must export rejectOptionalCookies()");
  assert.match(content, /subscribeToCookieConsent/, "Must export subscribeToCookieConsent()");
  assert.match(content, /resetCookieConsent/, "Must export resetCookieConsent() for DevTools and testing");
});

test("6. Legal UI components strictly adhere to sharp rectangular design (border-radius: 0px / rounded-none)", () => {
  const layoutContent = fs.readFileSync(LEGAL_LAYOUT_PATH, "utf8");
  const panelContent = fs.readFileSync(COOKIE_PANEL_PATH, "utf8");

  // No rounded cards or pills
  assert.doesNotMatch(layoutContent, /rounded-(sm|md|lg|xl|2xl|3xl|full)/, "LegalPageLayout must not use rounded corners");
  assert.doesNotMatch(panelContent, /rounded-(sm|md|lg|xl|2xl|3xl|full)/, "CookiePreferencesPanel must not use rounded corners");

  // Must enforce rounded-none
  assert.match(layoutContent, /rounded-none/, "LegalPageLayout must use rounded-none");
  assert.match(panelContent, /rounded-none/, "CookiePreferencesPanel must use rounded-none");

  // Container alignment with Navbar and Footer
  assert.match(layoutContent, /max-w-7xl\s+mx-auto\s+px-6/, "LegalPageLayout container must match max-w-7xl mx-auto px-6");
  assert.match(layoutContent, /bg-\[#080808\]/, "Base background must be #080808");
});

test("7. Fallback redirect pages seamlessly route /privacy and /terms to canonical legal URLs", () => {
  const privacyRedirect = fs.readFileSync(PRIVACY_REDIRECT_PATH, "utf8");
  const termsRedirect = fs.readFileSync(TERMS_REDIRECT_PATH, "utf8");

  assert.match(privacyRedirect, /redirect\(\"\/privacy-policy\"\)/, "app/privacy/page.js must redirect to /privacy-policy");
  assert.match(termsRedirect, /redirect\(\"\/terms-and-conditions\"\)/, "app/terms/page.js must redirect to /terms-and-conditions");
});

test("8. Footer links route directly to canonical /privacy-policy and /terms-and-conditions with synchronized cookie modal", () => {
  const footerContent = fs.readFileSync(FOOTER_PATH, "utf8");

  assert.match(footerContent, /href="\/privacy-policy"/, "Footer must link to /privacy-policy");
  assert.match(footerContent, /href="\/terms-and-conditions"/, "Footer must link to /terms-and-conditions");
  assert.match(footerContent, /getStoredCookieConsent/, "Footer must import getStoredCookieConsent");
  assert.match(footerContent, /saveCookieConsent/, "Footer must call saveCookieConsent on modal save");
  assert.match(footerContent, /acceptAllCookies/, "Footer must call acceptAllCookies on modal accept");
  assert.match(footerContent, /rejectOptionalCookies/, "Footer must call rejectOptionalCookies on modal reject");
  assert.match(footerContent, /href="\/cookie-policy"/, "Footer modal must link to detailed /cookie-policy");
});

test("9. Analytics toggle enforces accessible switch semantics and clear ON/OFF visual communication", () => {
  const footerContent = fs.readFileSync(FOOTER_PATH, "utf8");
  const panelContent = fs.readFileSync(COOKIE_PANEL_PATH, "utf8");

  // Essential cookies permanently active and non-editable
  assert.match(footerContent, /Essential Cookies/, "Footer must display Essential Cookies");
  assert.match(footerContent, /Always Active/, "Essential cookies must be Always Active");
  assert.match(footerContent, /Non-editable|Strictly required/i, "Essential cookies must be non-editable");

  // Accessible ON/OFF toggle switch in Footer popup
  assert.match(footerContent, /role="switch"/, "Analytics toggle must implement role='switch'");
  assert.match(footerContent, /aria-checked=\{analyticsEnabled\}/, "Toggle must bind aria-checked");
  assert.match(footerContent, /aria-label="Toggle Analytics and Performance cookies"/, "Toggle must have accessible aria-label");
  assert.match(footerContent, /analyticsEnabled \? "ON" : "OFF"/, "Toggle must explicitly communicate ON/OFF state");
  assert.match(footerContent, /text-brand-green/, "ON state must use brand green accent");

  // Accessible ON/OFF toggle switch in CookiePreferencesPanel
  assert.match(panelContent, /role="switch"/, "Preference panel toggle must implement role='switch'");
  assert.match(panelContent, /aria-checked=\{analytics\}/, "Preference panel must bind aria-checked");
  assert.match(panelContent, /analytics \? "ON" : "OFF"/, "Preference panel must communicate ON/OFF state");
});

test("10. Homepage 30% scroll trigger displays popup once per visitor and cleans up scroll listeners", () => {
  const footerContent = fs.readFileSync(FOOTER_PATH, "utf8");

  // Only triggers on homepage (pathname === "/")
  assert.match(footerContent, /usePathname/, "Footer must inspect route pathname");
  assert.match(footerContent, /pathname !== "\/"\)\s*return/, "Must only target homepage and ignore other routes");

  // Checks stored consent and session dismissal before attaching scroll listener
  assert.match(footerContent, /isPopupDismissedInSession/, "Must check session dismissal");
  assert.match(footerContent, /consent\.isConfigured/, "Must check if consent was already configured");

  // Scroll calculation (~30% down the page) using robust scrolling element
  assert.match(footerContent, /document\.scrollingElement/, "Must support document.scrollingElement");
  assert.match(footerContent, /scrollTop\s*\/\s*totalScrollable/, "Must calculate scroll percentage");
  assert.match(footerContent, />=\s*0\.3/, "Must trigger at approximately 30% scroll depth");

  // Removes listener once triggered and on cleanup
  assert.match(footerContent, /window\.removeEventListener\("scroll",\s*handleScroll\)/, "Must clean up scroll listener");

  // Top-level modal z-index to avoid stacking issues with navbar
  assert.match(footerContent, /z-\[100\]/, "Modal must use top-level z-[100] stacking");

  // Re-opening from footer
  assert.match(footerContent, /Cookies Settings/, "Must maintain Cookies Settings button");
  assert.match(footerContent, /setShowCookieModal\(true\)/, "Cookies Settings must reopen preferences modal");
});

test("11. Popup provides Accept All, Reject Optional, Save Preferences, and non-consent dismissal", () => {
  const footerContent = fs.readFileSync(FOOTER_PATH, "utf8");

  // Action buttons
  assert.match(footerContent, /Reject Optional/, "Must provide Reject Optional button");
  assert.match(footerContent, /Accept All/, "Must provide Accept All button");
  assert.match(footerContent, /Save Preferences/, "Must provide Save Preferences button");

  // Close button dismisses without treating as consent
  assert.match(footerContent, /dismissPopupSession/, "Close button must record session dismissal without marking consent");
});

