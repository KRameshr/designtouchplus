import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const NAVBAR_PATH = path.join(FRONTEND_ROOT, "components", "layout", "Navbar.jsx");
const WHATSAPP_PATH = path.join(FRONTEND_ROOT, "components", "ui", "WhatsAppButton.jsx");

test("1. WhatsAppButton exports correct navbar WhatsApp URL and pre-filled message", () => {
  assert.ok(fs.existsSync(WHATSAPP_PATH), "WhatsAppButton.jsx must exist");
  const content = fs.readFileSync(WHATSAPP_PATH, "utf8");

  // Phone number checks
  assert.match(content, /export const WHATSAPP_CLEAN_PHONE = ["']918919003200["']/, "Phone must be 918919003200");
  assert.match(
    content,
    /export const WHATSAPP_NAVBAR_MESSAGE =\s*["']Hi DesignTouch\+! I'm interested in your creative services\. I'd like to discuss my project\.["']/,
    "Must match exact pre-filled navbar message"
  );

  // URL format checks
  assert.match(
    content,
    /export const WHATSAPP_NAVBAR_CLICK_TO_CHAT_URL =\s*`https:\/\/wa\.me\/\$\{WHATSAPP_CLEAN_PHONE\}\?text=\$\{encodeURIComponent\(WHATSAPP_NAVBAR_MESSAGE\)\}`/,
    "URL must dynamically construct https://wa.me/918919003200?text= with encoded message"
  );

  // Existing floating button URL remains intact
  assert.match(
    content,
    /export const WHATSAPP_PREFILLED_MESSAGE =\s*["']Hi DesignTouch\+, I'm interested in your services\. Can you help me\?["']/,
    "Existing floating WhatsApp message must remain unchanged"
  );
  assert.match(
    content,
    /https:\/\/wa\.me\/918919003200\?text=Hi%20DesignTouch%2B%2C%20I%27m%20interested%20in%20your%20services\.%20Can%20you%20help%20me%3F/,
    "Existing floating button URL must still be functional"
  );
});

test("2. Navbar imports WHATSAPP_NAVBAR_CLICK_TO_CHAT_URL from WhatsAppButton", () => {
  const content = fs.readFileSync(NAVBAR_PATH, "utf8");
  assert.match(
    content,
    /import\s*\{[^}]*WHATSAPP_NAVBAR_CLICK_TO_CHAT_URL[^}]*\}\s*from\s*["']@\/components\/ui\/WhatsAppButton["']/,
    "Navbar must import WHATSAPP_NAVBAR_CLICK_TO_CHAT_URL"
  );
});

test("3. Desktop LET'S TALK button opens WhatsApp in a new tab with security attributes", () => {
  const content = fs.readFileSync(NAVBAR_PATH, "utf8");

  // Must not link to /contact anymore
  assert.doesNotMatch(
    content,
    /<Link[^>]*href=["']\/contact["'][^>]*>[\s\S]*?<span>Let&apos;s Talk<\/span>/,
    "Desktop Let's Talk button must NOT navigate to /contact"
  );

  // Must use <a> tag pointing to WHATSAPP_NAVBAR_CLICK_TO_CHAT_URL
  assert.match(
    content,
    /<a[^>]*href=\{WHATSAPP_NAVBAR_CLICK_TO_CHAT_URL\}[^>]*target=["']_blank["'][^>]*rel=["']noopener noreferrer["'][^>]*>[\s\S]*?<span>Let&apos;s Talk<\/span>/,
    "Desktop button must open WhatsApp URL with target='_blank' and rel='noopener noreferrer'"
  );

  // Preserves existing styling classes
  assert.match(
    content,
    /bg-brand-red text-white text-xs font-bold uppercase tracking-\[0\.14em\] font-display rounded-none border border-brand-red/,
    "Desktop button must preserve existing styling classes"
  );
});

test("4. Mobile drawer LET'S TALK button also opens WhatsApp in a new tab", () => {
  const content = fs.readFileSync(NAVBAR_PATH, "utf8");

  // Mobile drawer <a> tag
  assert.match(
    content,
    /<a[^>]*href=\{WHATSAPP_NAVBAR_CLICK_TO_CHAT_URL\}[^>]*target=["']_blank["'][^>]*rel=["']noopener noreferrer["'][^>]*onClick=\{[^}]*\}[\s\S]*?<span>Let&apos;s Talk<\/span>/,
    "Mobile button must open WhatsApp URL with target='_blank' and close drawer on click"
  );

  // Preserves existing styling classes
  assert.match(
    content,
    /w-full flex items-center justify-center gap-2\.5 py-3\.5 bg-brand-red text-white text-xs font-bold uppercase tracking-\[0\.16em\] font-display rounded-none border border-brand-red/,
    "Mobile button must preserve existing styling classes"
  );
});

test("5. CONTACT navigation link continues to point to /contact", () => {
  const content = fs.readFileSync(NAVBAR_PATH, "utf8");

  // NAV_LINKS has Contact pointing to /contact
  assert.match(
    content,
    /\{ name:\s*["']Contact["'],\s*path:\s*["']\/contact["'],\s*index:\s*["']07["'] \}/,
    "Contact navigation link must continue pointing to /contact"
  );
});
