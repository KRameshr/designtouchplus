import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");

test("1. Root layout loads Inter and Syne as primary fonts and makes Poppins available as auxiliary variable", () => {
  const layoutPath = path.join(FRONTEND_ROOT, "app/layout.js");
  const layout = fs.readFileSync(layoutPath, "utf8");

  // Inter and Syne imports
  assert.match(layout, /import\s*\{[^}]*Inter[^}]*Syne[^}]*\}\s*from\s*"next\/font\/google"/, "Must import Inter and Syne from next/font/google");

  // Primary font variables
  assert.match(layout, /variable:\s*"--font-inter"/, "Must define --font-inter variable");
  assert.match(layout, /variable:\s*"--font-syne"/, "Must define --font-syne variable");

  // Applied to root html tag
  assert.match(layout, /<html[^>]*className=\{`[^`]*\$\{inter\.variable\}[^`]*\$\{syne\.variable\}[^`]*`\}/, "Root html must include inter and syne variables");

  // Body tag uses font-sans (which resolves to Inter)
  assert.match(layout, /<body[^>]*className="[^"]*font-sans/, "Body tag must specify font-sans");
});

test("2. Tailwind configuration restores Inter as the default sans family and Syne as display", () => {
  const tailwindPath = path.join(FRONTEND_ROOT, "tailwind.config.js");
  const tailwind = fs.readFileSync(tailwindPath, "utf8");

  // fontFamily.sans must use var(--font-inter)
  assert.match(
    tailwind,
    /sans:\s*\["var\(--font-inter\)",\s*"sans-serif"\]/,
    "fontFamily.sans must resolve to Inter so all body and font-sans text uses Inter"
  );

  // fontFamily.display must remain Syne
  assert.match(
    tailwind,
    /display:\s*\["var\(--font-syne\)",\s*"sans-serif"\]/,
    "fontFamily.display must preserve Syne for website headings"
  );

  // fontFamily.poppins and inter are defined as auxiliary utilities
  assert.match(
    tailwind,
    /poppins:\s*\["var\(--font-poppins\)",\s*"Poppins",\s*"sans-serif"\]/,
    "fontFamily.poppins must be defined for specific section usage"
  );
  assert.match(
    tailwind,
    /inter:\s*\["var\(--font-inter\)",\s*"sans-serif"\]/,
    "fontFamily.inter must be defined"
  );
});

test("3. Global CSS contains no blanket font-family overrides on body, h1-h6, or p", () => {
  const cssPath = path.join(FRONTEND_ROOT, "app/globals.css");
  const css = fs.readFileSync(cssPath, "utf8");

  // Must NOT override body font-family in CSS
  assert.doesNotMatch(css, /body\s*\{[^}]*font-family:/, "Global CSS must not force font-family on body");

  // Must NOT override heading elements in CSS
  assert.doesNotMatch(css, /h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*\{[^}]*font-family:/, "Global CSS must not force font-family on headings");

  // Must NOT override paragraph elements in CSS
  assert.doesNotMatch(css, /p,\s*article[^}]*\{[^}]*font-family:/, "Global CSS must not force font-family on paragraphs");

  // Dark input autofill rules preserved
  assert.match(css, /input:-webkit-autofill/, "Must preserve input autofill styles");

  // Avoid unnecessary !important
  assert.doesNotMatch(css, /!important/, "Global typography must avoid unnecessary !important declarations");
});

test("4. Existing special typography (signature, decorative mono, nav links) is preserved", () => {
  const ourStoryPath = path.join(FRONTEND_ROOT, "components/about/OurStory.jsx");
  const ourStory = fs.readFileSync(ourStoryPath, "utf8");
  const navbarPath = path.join(FRONTEND_ROOT, "components/layout/Navbar.jsx");
  const navbar = fs.readFileSync(navbarPath, "utf8");

  // Founder signature preserved as font-serif
  assert.match(ourStory, /className="font-serif italic/, "Founder signature must keep font-serif unchanged");

  // Decorative labels preserved as font-mono
  assert.match(ourStory, /font-mono font-bold uppercase/, "Eyebrow label must keep font-mono");

  // Navbar navigation links preserved as font-display
  assert.match(navbar, /font-display/, "Navbar links must keep font-display");
});
