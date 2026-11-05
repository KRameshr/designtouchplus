import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");

test("1. About hero is a full-width background hero section of ~680-740px desktop height with left-to-right gradient", () => {
  const aboutHeroPath = path.join(FRONTEND_ROOT, "components/about/AboutHero.jsx");
  const aboutHero = fs.readFileSync(aboutHeroPath, "utf8");

  // Hero section is full-width with ~680-740px height
  assert.match(
    aboutHero,
    /min-h-\[560px\][^"]*lg:min-h-\[700px\][^"]*xl:h-\[720px\][^"]*2xl:h-\[740px\]/,
    "Hero section must have refined responsive desktop height around 680-740px"
  );

  // Background image is full viewport width (absolute inset-0)
  assert.match(
    aboutHero,
    /absolute\s+inset-0\s+w-full\s+h-full/,
    "Hero banner image must be positioned absolutely as full-width background"
  );

  // Object-cover and responsive object positioning
  assert.match(
    aboutHero,
    /object-cover/,
    "Banner image must use object-cover"
  );

  // Left-to-right dark gradient overlay (horizontal scrim) on desktop
  assert.match(
    aboutHero,
    /linear-gradient\(90deg,\s*rgba\(8,8,8,0\.94\)/,
    "Hero must have subtle black left-to-right gradient overlay for text readability"
  );
});

test("2. Text content is overlaid on the LEFT with controlled 45-48% width, clamp() typography, and aligned with navbar", () => {
  const aboutHeroPath = path.join(FRONTEND_ROOT, "components/about/AboutHero.jsx");
  const navbarPath = path.join(FRONTEND_ROOT, "components/layout/Navbar.jsx");

  const aboutHero = fs.readFileSync(aboutHeroPath, "utf8");
  const navbar = fs.readFileSync(navbarPath, "utf8");

  // Navbar container check
  assert.match(navbar, /max-w-7xl\s+mx-auto\s+px-6/, "Navbar must use max-w-7xl mx-auto px-6");

  // Text content is inside max-w-7xl mx-auto px-6
  assert.match(
    aboutHero,
    /max-w-7xl\s+mx-auto\s+px-6/,
    "Text overlay must be aligned with navbar container max-w-7xl mx-auto px-6"
  );

  // Controlled left content width of approximately 45-48% on desktop
  assert.match(
    aboutHero,
    /lg:w-\[47%\]|xl:w-\[48%\]/,
    "Text overlay must be controlled to approximately 45-48% width on desktop"
  );

  // Responsive clamp() typography on heading
  assert.match(
    aboutHero,
    /clamp\(/,
    "Heading must use responsive clamp() typography"
  );

  // Description comfortable reading scale reaching 20-22px on desktop with balanced max-width
  assert.match(
    aboutHero,
    /lg:text-\[20px\][^"]*2xl:text-\[22px\]/,
    "Description must scale to 20-22px on desktop for comfortable reading"
  );
  assert.match(
    aboutHero,
    /max-w-\[500px\]|max-w-\[520px\]/,
    "Description must use balanced max-width for optimal line breaks"
  );
});

test("3. Main heading renders deliberate two-line structure with red S in DESIGN and green TOUCH+", () => {
  const aboutHeroPath = path.join(FRONTEND_ROOT, "components/about/AboutHero.jsx");
  const aboutHero = fs.readFileSync(aboutHeroPath, "utf8");

  // Deliberate two-line heading
  assert.match(
    aboutHero,
    /<span className="block text-white">WE ARE<\/span>/,
    "Line 1 must be deliberate block WE ARE"
  );

  // S in DESIGN red
  assert.match(
    aboutHero,
    /DE<span className="text-brand-red">S<\/span>IGN/,
    "Letter S in DESIGN must be styled with text-brand-red"
  );

  // TOUCH+ green
  assert.match(
    aboutHero,
    /<span className="text-brand-green">TOUCH\+<\/span>/,
    "TOUCH+ must be styled with text-brand-green"
  );

  // Eyebrow
  assert.match(
    aboutHero,
    /ABOUT DESIGNTOUCH\+/,
    "Eyebrow must render ABOUT DESIGNTOUCH+"
  );
});

test("4. AboutHero supports CMS hero banner, dynamic CTA, description and fallback image", () => {
  const aboutHeroPath = path.join(FRONTEND_ROOT, "components/about/AboutHero.jsx");
  const aboutHero = fs.readFileSync(aboutHeroPath, "utf8");

  // CMS heroBannerImageUrl support
  assert.match(
    aboutHero,
    /aboutContent\?\.heroBannerImageUrl/,
    "AboutHero must read aboutContent?.heroBannerImageUrl"
  );

  // Fallback image present
  assert.match(
    aboutHero,
    /EXISTING_STUDIO_FALLBACK_IMAGE|fallback/i,
    "AboutHero must define an existing studio fallback image"
  );

  // CTA text and link
  assert.match(
    aboutHero,
    /aboutContent\?\.ctaText/,
    "AboutHero must use dynamic ctaText"
  );
  assert.match(
    aboutHero,
    /aboutContent\?\.ctaLink/,
    "AboutHero must use dynamic ctaLink"
  );
  assert.match(
    aboutHero,
    /LET'S CREATE TOGETHER/i,
    "AboutHero must have fallback CTA LET'S CREATE TOGETHER"
  );
  assert.match(
    aboutHero,
    /contact/i,
    "AboutHero CTA must link to /contact by default"
  );
});

test("5. Statistics section is placed in a separate section immediately below the hero", () => {
  const aboutHeroPath = path.join(FRONTEND_ROOT, "components/about/AboutHero.jsx");
  const aboutHero = fs.readFileSync(aboutHeroPath, "utf8");

  // Separate section below hero
  assert.match(
    aboutHero,
    /<section[^>]*aria-label="About Statistics"/,
    "Statistics must be in a separate section immediately below the hero"
  );

  // Grid for 4 stats
  assert.match(
    aboutHero,
    /grid-cols-2\s+md:grid-cols-4/,
    "Stats must render as a 4-item horizontal strip (2x2 on mobile, 4 cols on desktop)"
  );

  // Subtle separators / borders
  assert.match(
    aboutHero,
    /divide-white\/\[0\.08\]|divide-white\/10/,
    "Stats strip must use subtle hairline dividers"
  );

  // Red and green accents in stats
  assert.match(
    aboutHero,
    /text-brand-red/,
    "Stats must feature brand red accent"
  );
  assert.match(
    aboutHero,
    /text-brand-green/,
    "Stats must feature brand green accent"
  );

  // 4 items fallback covers all required metric labels
  assert.match(aboutHero, /Projects Completed/, "Stats must cover Projects Completed");
  assert.match(aboutHero, /Happy Clients/, "Stats must cover Happy Clients");
  assert.match(aboutHero, /Years Experience/, "Stats must cover Years Experience");
  assert.match(aboutHero, /Countries Served/, "Stats must cover Countries Served");
});

test("6. Statistics section uses professional icons and restrained red/green accents matching client design", () => {
  const aboutHeroPath = path.join(FRONTEND_ROOT, "components/about/AboutHero.jsx");
  const aboutHero = fs.readFileSync(aboutHeroPath, "utf8");

  // Imports Lucide icons
  assert.match(aboutHero, /import\s*\{[^}]*PlayCircle[^}]*\}\s*from\s*"lucide-react"/, "PlayCircle icon must be imported");
  assert.match(aboutHero, /import\s*\{[^}]*Users[^}]*\}\s*from\s*"lucide-react"/, "Users icon must be imported");
  assert.match(aboutHero, /import\s*\{[^}]*Calendar[^}]*\}\s*from\s*"lucide-react"/, "Calendar icon must be imported");
  assert.match(aboutHero, /import\s*\{[^}]*Globe[^}]*\}\s*from\s*"lucide-react"/, "Globe icon must be imported");

  // Icon mapping function exists
  assert.match(aboutHero, /function\s+getStatIcon/, "getStatIcon mapping helper must be defined");

  // Default fallback stats contain 60+, 3+, 10+, 5+
  assert.match(aboutHero, /value:\s*"60"/, "Default stats must contain 60+ Projects Completed");
  assert.match(aboutHero, /value:\s*"3"/, "Default stats must contain 3+ Happy Clients");
  assert.match(aboutHero, /value:\s*"10"/, "Default stats must contain 10+ Years Experience");
  assert.match(aboutHero, /value:\s*"5"/, "Default stats must contain 5+ Countries Served");

  // Icon container has subtle dark background, border, and brand accent
  assert.match(aboutHero, /bg-\[#170c0c\]|bg-brand-red/, "Red icon container must have dark red background styling");
  assert.match(aboutHero, /bg-\[#0b1710\]|bg-brand-green/, "Green icon container must have dark green background styling");
});

test("7. Count-up animation supports smooth progress, reduced motion, and screen reader accessibility", () => {
  const aboutHeroPath = path.join(FRONTEND_ROOT, "components/about/AboutHero.jsx");
  const aboutHero = fs.readFileSync(aboutHeroPath, "utf8");

  // CountUpNumber component
  assert.match(aboutHero, /function\s+CountUpNumber/, "CountUpNumber component must be implemented");
  assert.match(aboutHero, /requestAnimationFrame/, "Count-up must animate with requestAnimationFrame");
  assert.match(aboutHero, /prefers-reduced-motion/, "Animation must detect and respect prefers-reduced-motion");
  assert.match(aboutHero, /sr-only/, "Count-up must include screen-reader accessible full value");
  assert.match(aboutHero, /useInView/, "Stats must use in-view triggering");
});

test("8. Statistics section applies sharp 0-2px border-radius and subtle hover interactions", () => {
  const aboutHeroPath = path.join(FRONTEND_ROOT, "components/about/AboutHero.jsx");
  const aboutHero = fs.readFileSync(aboutHeroPath, "utf8");

  const statsSectionStart = aboutHero.indexOf('aria-label="About Statistics"');
  assert.ok(statsSectionStart > -1, "About Statistics section must exist");
  const statsSection = aboutHero.slice(statsSectionStart);

  // Subtle 0-2px border radius (rounded-[1px] or rounded-[2px] or rounded-none)
  assert.match(
    statsSection,
    /rounded-\[1px\]|rounded-\[2px\]|rounded-none/,
    "Main stats card must use subtle 0-2px corner treatment"
  );

  // No rounded-xl or rounded-lg in statistics section
  assert.doesNotMatch(
    statsSection,
    /rounded-xl|rounded-lg|rounded-2xl|rounded-full/,
    "Statistics section must not have noticeably rounded corners"
  );

  // Hover background interaction
  assert.match(
    statsSection,
    /hover:bg-white\/\[0\.02\]|hover:bg-white\/\[0\.03\]/,
    "Statistic item must have subtle hover background brightening"
  );

  // Smooth 200-300ms transition
  assert.match(
    statsSection,
    /duration-200|duration-250|duration-300/,
    "Hover states must use smooth 200-300ms transition"
  );
});
