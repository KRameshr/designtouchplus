import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");

const FOOTER_PATH = path.join(FRONTEND_ROOT, "components", "layout", "Footer.jsx");
const WHATSAPP_PATH = path.join(FRONTEND_ROOT, "components", "ui", "WhatsAppButton.jsx");
const CHATBOT_PATH = path.join(FRONTEND_ROOT, "components", "chat", "ChatbotWidget.jsx");
const GLOBALS_PATH = path.join(FRONTEND_ROOT, "app", "globals.css");
const LAYOUT_PATH = path.join(FRONTEND_ROOT, "app", "layout.js");

test("1. Layout mounts both WhatsAppButton and ChatbotWidget as global viewport overlays", () => {
  const layout = fs.readFileSync(LAYOUT_PATH, "utf8");
  assert.match(layout, /<WhatsAppButton\s*\/>/, "Layout mounts WhatsAppButton");
  assert.match(layout, /<ChatbotWidget\s*\/>/, "Layout mounts ChatbotWidget");
});

test("2. WhatsApp button uses viewport-fixed positioning and stacks cleanly above chatbot", () => {
  const wa = fs.readFileSync(WHATSAPP_PATH, "utf8");
  assert.match(wa, /fixed/, "WhatsApp must use fixed positioning");
  assert.match(
    wa,
    /bottom-\[74px\]\s+sm:bottom-\[94px\]\s+right-4\s+sm:right-6/,
    "WhatsApp sits at bottom-[74px]/[94px] right-4/right-6"
  );
  assert.match(wa, /z-\[80\]/, "WhatsApp uses z-[80]");
  assert.match(wa, /floating-action-whatsapp/, "WhatsApp applies safe-area utility class");
  assert.match(wa, /https:\/\/wa\.me\/918919003200\?text=/, "WhatsApp uses official Click to Chat URL");
  assert.match(wa, /target=["']_blank["']\s+rel=["']noopener noreferrer["']/, "Opens in new tab securely");
});

test("3. Chatbot launcher uses viewport-fixed positioning below WhatsApp with red rectangular styling", () => {
  const chat = fs.readFileSync(CHATBOT_PATH, "utf8");
  assert.match(chat, /fixed/, "Chatbot must use fixed positioning");
  assert.match(
    chat,
    /bottom-4\s+sm:bottom-6\s+right-4\s+sm:right-6/,
    "Chatbot sits at bottom-4/bottom-6 right-4/right-6"
  );
  assert.match(chat, /z-\[990\]/, "Chatbot uses z-[990]");
  assert.match(chat, /floating-action-chatbot/, "Chatbot applies safe-area utility class");
  assert.match(chat, /bg-brand-red/, "Chatbot uses brand red background");
  assert.match(chat, /rounded-none/, "Chatbot uses sharp corners (rounded-none)");
  assert.match(chat, /LET'S CHAT!|LET&apos;S CHAT!/, "Displays bold uppercase LET'S CHAT!");
});

test("4. Safe-area insets are defined in globals.css for both buttons", () => {
  const css = fs.readFileSync(GLOBALS_PATH, "utf8");
  assert.match(
    css,
    /\.floating-action-chatbot\s*\{[^}]*env\(safe-area-inset-bottom/,
    "Chatbot safe-area bottom rule exists"
  );
  assert.match(
    css,
    /\.floating-action-chatbot\s*\{[^}]*env\(safe-area-inset-right/,
    "Chatbot safe-area right rule exists"
  );
  assert.match(
    css,
    /\.floating-action-whatsapp\s*\{[^}]*env\(safe-area-inset-bottom/,
    "WhatsApp safe-area bottom rule exists"
  );
  assert.match(
    css,
    /\.floating-action-whatsapp\s*\{[^}]*env\(safe-area-inset-right/,
    "WhatsApp safe-area right rule exists"
  );
});

test("5. Footer legal links incorporate clearance to prevent overlap with floating buttons", () => {
  const footer = fs.readFileSync(FOOTER_PATH, "utf8");
  // Check that the legal links container has responsive clearance
  assert.match(
    footer,
    /sm:pr-48|md:pr-52|lg:pr-56/,
    "Footer legal links row must provide right clearance for floating buttons on desktop/tablet"
  );
  assert.match(
    footer,
    /max-w-\[calc\(100%-140px\)\]/,
    "Footer legal links row must reserve right margin on mobile for floating buttons"
  );
  assert.match(footer, /Privacy Policy/, "Footer must preserve Privacy Policy");
  assert.match(footer, /Terms of Service/, "Footer must preserve Terms of Service");
  assert.match(footer, /Cookies Settings/, "Footer must preserve Cookies Settings");
});

test("6. Cookie consent modal maintains top-level z-index and coordinates with chatbot launcher", () => {
  const footer = fs.readFileSync(FOOTER_PATH, "utf8");
  const chat = fs.readFileSync(CHATBOT_PATH, "utf8");

  assert.match(footer, /z-\[100\]/, "Cookie modal uses z-[100] above WhatsApp (z-[80])");
  assert.match(footer, /notifyCookieModalState/, "Footer broadcasts cookie modal state changes");
  assert.match(chat, /COOKIE_MODAL_STATE_EVENT/, "Chatbot listens to cookie modal state event");
  assert.match(chat, /setLauncherState\(["']HIDDEN["']\)/, "Chatbot hides when cookie modal is open");
});

test("7. Both floating buttons hide automatically on /admin routes", () => {
  const wa = fs.readFileSync(WHATSAPP_PATH, "utf8");
  const chat = fs.readFileSync(CHATBOT_PATH, "utf8");

  assert.match(wa, /pathname\?\.startsWith\(["']\/admin["']\)/, "WhatsApp detects admin routes");
  assert.match(wa, /if\s*\(isAdmin\)\s*\{\s*return null;\s*\}/, "WhatsApp returns null on admin routes");
  assert.match(chat, /pathname\?\.startsWith\(["']\/admin["']\)/, "Chatbot detects admin routes");
  assert.match(chat, /if\s*\(isAdmin\)\s*\{\s*return null;\s*\}/, "Chatbot returns null on admin routes");
});

