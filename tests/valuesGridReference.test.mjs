import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const VALUES_GRID_PATH = path.join(FRONTEND_ROOT, "components", "about", "ValuesGrid.jsx");

test("ValuesGrid source exists and is readable", () => {
  assert.ok(fs.existsSync(VALUES_GRID_PATH), "ValuesGrid.jsx must exist");
});

test("ValuesGrid renders client reference header with red square accent and OUR VALUES label", () => {
  const content = fs.readFileSync(VALUES_GRID_PATH, "utf8");

  // Section label contains red square and OUR VALUES
  assert.match(content, /bg-brand-red/, "Header must have red accent");
  assert.match(content, /rounded-none/, "Square accent should have sharp square corners");
  assert.match(content, /OUR VALUES/, "Header text must display 'OUR VALUES'");
});

test("ValuesGrid implements compact horizontal card layout with icon left and text right", () => {
  const content = fs.readFileSync(VALUES_GRID_PATH, "utf8");

  // Responsive grid with 4 columns on desktop, 2 on tablet, 1 on mobile
  assert.match(content, /grid-cols-1\s+sm:grid-cols-2\s+lg:grid-cols-4/, "Grid must be 1 col mobile, 2 tablet, 4 desktop");

  // Card flex horizontal layout with icon on left and content on right
  assert.match(content, /flex items-center/, "Card must use horizontal flex alignment");
  assert.match(content, /rounded-\[2px\]/, "Cards must have 2px corner radius matching specification");
  assert.match(content, /bg-\[#0c0c0c\]/, "Cards must have dark agency background #0c0c0c");
  assert.match(content, /border\s+border-white\/\[0\.08\]/, "Cards must have subtle border");
});

test("ValuesGrid has exact Lucide icons and alternating red/green brand colors", () => {
  const content = fs.readFileSync(VALUES_GRID_PATH, "utf8");

  // Lucide icons imported
  assert.match(content, /import\s*\{[^}]*Gem[^}]*Rocket[^}]*Clock[^}]*Users[^}]*\}\s*from\s*"lucide-react"/);

  // Quality First -> Gem -> red
  // Creativity -> Rocket -> green
  // On-Time Delivery -> Clock -> red
  // Client First -> Users -> green
  assert.match(content, /"quality first"[\s\S]*?icon:\s*Gem[\s\S]*?color:\s*"text-brand-red"/);
  assert.match(content, /"creativity"[\s\S]*?icon:\s*Rocket[\s\S]*?color:\s*"text-brand-green"/);
  assert.match(content, /"on-time delivery"[\s\S]*?icon:\s*Clock[\s\S]*?color:\s*"text-brand-red"/);
  assert.match(content, /"client first"[\s\S]*?icon:\s*Users[\s\S]*?color:\s*"text-brand-green"/);
});

test("ValuesGrid preserves exact client-approved value descriptions", () => {
  const content = fs.readFileSync(VALUES_GRID_PATH, "utf8");

  assert.match(
    content,
    /We never compromise on quality\. Every frame we deliver is crafted with perfection\./,
    "Quality First must have exact description"
  );
  assert.match(
    content,
    /Creativity is at the heart of everything we do\. We love to explore, innovate and create\./,
    "Creativity must have exact description"
  );
  assert.match(
    content,
    /Time is valuable\. We respect deadlines and always deliver on time, every time\./,
    "On-Time Delivery must have exact description"
  );
  assert.match(
    content,
    /Our clients' success is our success\. We listen, understand and deliver beyond expectations\./,
    "Client First must have exact description"
  );
});

test("ValuesGrid preserves admin CMS compatibility exports", () => {
  const content = fs.readFileSync(VALUES_GRID_PATH, "utf8");

  assert.match(content, /export const VALUE_ICON_MAP/, "Must export VALUE_ICON_MAP");
  assert.match(content, /export const DEFAULT_VALUES/, "Must export DEFAULT_VALUES");
  assert.match(content, /export const getIcon/, "Must export getIcon");
});

