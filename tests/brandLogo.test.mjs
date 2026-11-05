import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const LOGO_FILE = path.join(FRONTEND_ROOT, "public", "assets", "logos", "design-touch-logo.png");
const NAVBAR_FILE = path.join(FRONTEND_ROOT, "components", "layout", "Navbar.jsx");
const FOOTER_FILE = path.join(FRONTEND_ROOT, "components", "layout", "Footer.jsx");

test("1. Official brand logo asset exists at public/assets/logos/design-touch-logo.png with valid PNG format", () => {
  assert.ok(fs.existsSync(LOGO_FILE), "Logo asset must exist at public/assets/logos/design-touch-logo.png");
  const buf = fs.readFileSync(LOGO_FILE);
  assert.ok(buf.length > 1000, "Logo file must not be empty");

  // PNG Magic Header: 89 50 4E 47 0D 0A 1A 0A
  const isPng = buf.slice(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(isPng, true, "Logo file must be a valid PNG");

  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  assert.ok(width > 500, "Cropped logo width must be high resolution");
  assert.ok(height > 200, "Cropped logo height must be high resolution");
  const aspect = width / height;
  assert.ok(aspect > 2.0 && aspect < 2.4, "Cropped logo must preserve ~2.2:1 aspect ratio");
});

test("2. Header Navbar renders official logo image with Next.js Image component and object-contain", () => {
  const content = fs.readFileSync(NAVBAR_FILE, "utf8");

  // Imports next/image
  assert.match(content, /import\s+Image\s+from\s+["']next\/image["']/, "Navbar must import Image from next/image");

  // Main navigation logo
  assert.match(
    content,
    /src=["']\/assets\/logos\/design-touch-logo\.png["']/,
    "Navbar must reference /assets/logos/design-touch-logo.png"
  );
  assert.match(
    content,
    /alt=["']DesignTouch\+["']/,
    "Navbar logo must have alt='DesignTouch+'"
  );
  assert.match(
    content,
    /object-contain/,
    "Navbar logo must enforce object-contain"
  );
  assert.match(
    content,
    /priority/,
    "Navbar logo should include priority loading"
  );
});

test("3. Mobile drawer in Navbar also uses official logo image", () => {
  const content = fs.readFileSync(NAVBAR_FILE, "utf8");

  // Must have at least two occurrences of the logo (main bar + mobile drawer)
  const matches = content.match(/\/assets\/logos\/design-touch-logo\.png/g);
  assert.ok(matches && matches.length >= 2, "Both main header and mobile drawer must render the official logo");
});

test("4. Footer renders official logo image with proper spacing and alt text", () => {
  const content = fs.readFileSync(FOOTER_FILE, "utf8");

  // Imports next/image
  assert.match(content, /import\s+Image\s+from\s+["']next\/image["']/, "Footer must import Image from next/image");

  // Footer logo
  assert.match(
    content,
    /src=["']\/assets\/logos\/design-touch-logo\.png["']/,
    "Footer must reference /assets/logos/design-touch-logo.png"
  );
  assert.match(
    content,
    /alt=["']DesignTouch\+["']/,
    "Footer logo must have alt='DesignTouch+'"
  );
  assert.match(
    content,
    /object-contain/,
    "Footer logo must enforce object-contain"
  );

  // Preserved description and layout
  assert.match(
    content,
    /A creative studio for visual storytelling, brand films, and\s+high-impact content\./,
    "Footer must preserve brand description"
  );
  assert.match(content, /Quick Links/i, "Footer must preserve Quick Links");
  assert.match(content, /Services/i, "Footer must preserve Services");
});

