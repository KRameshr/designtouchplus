import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const BUTTON_PATH = path.join(FRONTEND_ROOT, "components", "ui", "WhatsAppButton.jsx");
const LAYOUT_PATH = path.join(FRONTEND_ROOT, "app", "layout.js");
const CHATBOT_PATH = path.join(FRONTEND_ROOT, "components", "chat", "ChatbotWidget.jsx");

test("1. WhatsAppButton component exists and is mounted in RootLayout", () => {
  assert.ok(fs.existsSync(BUTTON_PATH), "WhatsAppButton.jsx must exist");
  const layoutContent = fs.readFileSync(LAYOUT_PATH, "utf8");
  assert.match(
    layoutContent,
    /import WhatsAppButton from ["']@\/components\/ui\/WhatsAppButton["']/,
    "RootLayout must import WhatsAppButton"
  );
  assert.match(
    layoutContent,
    /<WhatsAppButton\s*\/>/,
    "RootLayout must render WhatsAppButton"
  );
});

test("2. WhatsApp Business number and official wa.me URL format are exact", () => {
  const content = fs.readFileSync(BUTTON_PATH, "utf8");

  // Number checks
  assert.match(content, /918919003200/, "Contains exact WhatsApp Business number 918919003200");
  assert.match(content, /\+918919003200/, "Defines phone format +918919003200");

  // Pre-filled message check
  assert.match(
    content,
    /Hi DesignTouch\+, I'm interested in your services\. Can you help me\?/,
    "Pre-fills exact required inquiry message"
  );

  // Exact URL with encoded query string
  assert.match(
    content,
    /https:\/\/wa\.me\/918919003200\?text=Hi%20DesignTouch%2B%2C%20I%27m%20interested%20in%20your%20services\.%20Can%20you%20help%20me%3F/,
    "Must use the official WhatsApp Click to Chat URL format with encoded text"
  );
});

test("3. Open behavior uses target='_blank' with rel='noopener noreferrer'", () => {
  const content = fs.readFileSync(BUTTON_PATH, "utf8");

  assert.match(content, /target=["']_blank["']/, "Link must open in new tab");
  assert.match(
    content,
    /rel=["']noopener noreferrer["']/,
    "Link must enforce secure noopener noreferrer"
  );
});

test("4. UI design uses official WhatsApp green, circular shape, white vector mark, and tooltip", () => {
  const content = fs.readFileSync(BUTTON_PATH, "utf8");

  // Official green color
  assert.match(content, /bg-\[#25D366\]/, "Uses official WhatsApp green color #25D366");

  // Circular geometry
  assert.match(content, /rounded-full/, "Button must be circular");

  // Subtle shadow and border matching DesignTouch+ dark palette
  assert.match(content, /shadow-\[/, "Button must have subtle shadow");
  assert.match(content, /border-\[#25D366\]/, "Button must have subtle green border");

  // Tooltip with exact text 'Chat on WhatsApp'
  assert.match(content, /role=["']tooltip["']/, "Implements accessible tooltip role");
  assert.match(content, />\s*Chat on WhatsApp\s*<\/span>/, "Tooltip text must be 'Chat on WhatsApp'");

  // White icon
  assert.match(content, /text-white/, "Icon color must be white");
  assert.match(content, /<WhatsAppIcon|<svg/, "Renders vector WhatsApp mark");
});

test("5. Independent positioning cleanly above existing red chatbot launcher without overlap", () => {
  const buttonContent = fs.readFileSync(BUTTON_PATH, "utf8");
  const chatbotContent = fs.readFileSync(CHATBOT_PATH, "utf8");

  // Chatbot launcher is fixed at bottom-4 / bottom-6
  assert.match(chatbotContent, /bottom-4\s+sm:bottom-6\s+right-4\s+sm:right-6/, "Chatbot sits at bottom-4/bottom-6");

  // WhatsApp is fixed above the chatbot launcher at bottom-[74px] / sm:bottom-[94px]
  assert.match(
    buttonContent,
    /bottom-\[74px\]\s+sm:bottom-\[94px\]\s+right-4\s+sm:right-6/,
    "WhatsApp button is positioned cleanly above chatbot launcher with vertical clearance"
  );

  // Both have independent container positioning
  assert.match(buttonContent, /fixed/, "WhatsApp button must be fixed");
});

test("6. Automatically hidden on admin pages matching chatbot behavior", () => {
  const content = fs.readFileSync(BUTTON_PATH, "utf8");

  assert.match(content, /usePathname/, "Inspects pathname using next/navigation");
  assert.match(
    content,
    /pathname\?\.startsWith\(["']\/admin["']\)/,
    "Detects admin routes with startsWith('/admin')"
  );
  assert.match(
    content,
    /if\s*\(isAdmin\)\s*\{\s*return null;\s*\}/,
    "Returns null on admin routes"
  );
});

test("7. Accessibility, focus styling, and reduced-motion preferences", () => {
  const content = fs.readFileSync(BUTTON_PATH, "utf8");

  assert.match(
    content,
    /aria-label=["']Chat on WhatsApp["']/,
    "Link has descriptive aria-label"
  );
  assert.match(
    content,
    /focus-visible:ring-2/,
    "Provides visible keyboard focus ring"
  );
  assert.match(
    content,
    /motion-reduce:/,
    "Supports prefers-reduced-motion preferences"
  );
});

