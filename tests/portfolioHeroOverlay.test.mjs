import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

test("1. PortfolioHero expands video to a full navbar-aligned container and eliminates the small right-side card", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioHero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Video container spans the navbar-aligned container width
  assert.match(
    content,
    /data-testid="portfolio-hero-video-container"/,
    "PortfolioHero must define a dedicated full-width video container"
  );
  assert.match(
    content,
    /className="[^"]*relative w-full overflow-hidden bg-\[#0a0a0a\][^"]*flex items-center/,
    "Video container must be full width, overflow-hidden, and vertically centered flex"
  );

  // Height must be approximately 600-700px on desktop
  assert.match(
    content,
    /(?:min-h-\[600px\]|lg:h-\[640px\]|xl:h-\[680px\])/,
    "Desktop hero height must be in the 600-700px range"
  );

  // Must remove old split grid and right-side card constraints
  assert.doesNotMatch(
    content,
    /<div[^>]*data-testid="portfolio-hero-video-container"[^>]*className="[^"]*\bborder\b[^"]*"/,
    "Video hero container must not have an outer border"
  );
  assert.doesNotMatch(
    content,
    /lg:col-span-5/,
    "Old right-side 5-column video card constraint must be removed"
  );
  assert.doesNotMatch(
    content,
    /lg:col-span-7/,
    "Old left-side 7-column text constraint must be removed"
  );
  assert.doesNotMatch(
    content,
    /border border-white\/15 p-2 sm:p-2\.5/,
    "Old outer video card borders and padding must be removed"
  );
  assert.doesNotMatch(
    content,
    /SHOWCASE REEL[\s\S]*?4K PRORES/,
    "Old small card badges must be removed"
  );
});

test("2. PortfolioHero overlays heading, description, and capability tags directly over the video on the left", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioHero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Foreground text overlay must be at z-10
  assert.match(
    content,
    /className="relative z-10 w-full p-6 sm:p-10/,
    "Text overlay must be in relative z-10 foreground with comfortable padding"
  );

  // Headline with red "Louder." accent
  assert.match(
    content,
    /introContent\?\.headlineLine1\s*\|\|\s*"Our Work"/,
    "Headline line 1 should default to 'Our Work'"
  );
  assert.match(
    content,
    /introContent\?\.headlineHighlight\s*\|\|\s*"Louder\."/,
    "Headline highlight should default to 'Louder.'"
  );
  assert.match(
    content,
    /<span className="text-brand-red">\s*\{introContent\?\.headlineHighlight \|\| "Louder\."\}\s*<\/span>/,
    "Headline highlight must carry the brand red accent color"
  );

  // Supporting copy and capability tags
  assert.match(
    content,
    /introContent\?\.description/,
    "Supporting description must be rendered"
  );
  assert.match(
    content,
    /renderedTags\.map/,
    "Category tags must be rendered over the video"
  );
});

test("3. PortfolioHero includes dark scrim gradient overlays for high contrast and readability", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioHero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Horizontal gradient for desktop/tablet: darkest behind text on left, lighter on right
  assert.match(
    content,
    /data-testid="portfolio-hero-scrim-horizontal"/,
    "Must include horizontal scrim testid"
  );
  assert.match(
    content,
    /linear-gradient\(90deg,\s*rgba\(8,8,8,0\.94\)\s*0%,\s*rgba\(8,8,8,0\.82\)\s*36%/,
    "Desktop horizontal scrim must be darkest on the left and fade toward the right"
  );

  // Vertical gradient for mobile stacked layout
  assert.match(
    content,
    /data-testid="portfolio-hero-scrim-vertical"/,
    "Must include vertical scrim testid"
  );
  assert.match(
    content,
    /linear-gradient\(180deg,\s*rgba\(8,8,8,0\.92\)\s*0%,\s*rgba\(8,8,8,0\.80\)\s*65%/,
    "Mobile vertical scrim must provide contrast for stacked mobile layout"
  );
});

test("4. PortfolioHero maintains video autoplay, loop, mute, inline playback, and fallback handling", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioHero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Essential video playback attributes
  assert.match(content, /\bautoPlay\b/, "Video element must have autoPlay attribute");
  assert.match(content, /\bmuted\b/, "Video element must have muted attribute");
  assert.match(content, /\bloop\b/, "Video element must have loop attribute");
  assert.match(content, /\bplaysInline\b/, "Video element must have playsInline attribute");
  assert.match(content, /object-cover/, "Video element must use object-cover");

  // CMS/database media priority preserved: introContent introVideoUrl takes precedence over featuredProject videoUrl
  assert.match(
    content,
    /const activeVideoUrl = introContent\?\.introVideoUrl \|\| featuredProject\?\.videoUrl \|\| null;/,
    "Active video URL must prioritize introContent introVideoUrl over featuredProject videoUrl"
  );

  // Poster and error fallback preserved
  assert.match(
    content,
    /poster=\{cloudinaryImageUrl\(activePoster, 1440\) \|\| activePoster \|\| undefined\}/,
    "Video should use activePoster as fallback poster image"
  );
  assert.match(
    content,
    /onError=\{.*setVideoError\(true\).*\}/,
    "Video must include onError handler to trigger graceful fallback"
  );
});

test("5. PortfolioHero preserves the statistics row beneath the hero video container", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioHero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  assert.match(
    content,
    /stats\.length > 0 && \(/,
    "Stats row must be rendered when stats array is non-empty"
  );
  assert.match(
    content,
    /grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white\/\[0\.08\]/,
    "Stats row must retain the existing 2/4-column border-separated grid layout"
  );
});

