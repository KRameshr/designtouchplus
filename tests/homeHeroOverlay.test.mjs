import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

test("1. Home Hero expands video to a full-width container directly beneath navbar and removes split card", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/home/Hero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Video container spans the full website width
  assert.match(
    content,
    /data-testid="home-hero-video-container"/,
    "Home Hero must define a dedicated full-width video container testid"
  );
  assert.match(
    content,
    /className="[^"]*relative w-full overflow-hidden bg-\[#0a0a0a\][^"]*flex items-center/,
    "Video container must be 100% width, overflow-hidden, and vertically centered flex"
  );

  // Height must be responsive and approx 780–850px on desktop via clamp(780px, 85vh, 850px)
  assert.match(
    content,
    /clamp\(780px,\s*85vh,\s*850px\)/,
    "Hero height must use responsive clamp(780px, 85vh, 850px) targeting approximately 780-850px min-height"
  );

  // No rigid fixed height clamping container
  assert.doesNotMatch(
    content,
    /lg:h-\[clamp\(460px/,
    "Old rigid height clamp restricting hero container must be removed"
  );

  // Generous padding preventing button clipping
  assert.match(
    content,
    /py-16 sm:py-20 lg:py-24/,
    "Hero content container must use generous padding py-16 sm:py-20 lg:py-24"
  );

  // Video media canvas at z-0
  assert.match(
    content,
    /data-testid="home-hero-media-canvas"/,
    "Must define home-hero-media-canvas layer at z-0"
  );

  // Old split two-column layout removed
  assert.doesNotMatch(
    content,
    /lg:col-span-5/,
    "Old left-side 5-column grid constraint must be removed"
  );
  assert.doesNotMatch(
    content,
    /lg:col-span-7/,
    "Old right-side 7-column video constraint must be removed"
  );
  assert.doesNotMatch(
    content,
    /aspect-\[16\/10\].*bg-\[#0c0c0c\].*border border-white\/10/,
    "Old bordered video card and 16:10 box constraint must be removed"
  );
});

test("2. Home Hero displays heading, description, and CTA buttons directly over the video on the left", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/home/Hero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Text container aligned with navbar inner max-w-7xl
  assert.match(
    content,
    /className="relative z-10 w-full max-w-7xl mx-auto px-6/,
    "Text overlay must be in relative z-10 foreground aligned with navbar inner container"
  );

  // Left-aligned constrained width for optimal readability
  assert.match(
    content,
    /max-w-xl lg:max-w-2xl xl:max-w-\[680px\]/,
    "Copy block must be constrained to left area (max-w-xl to max-w-[680px])"
  );

  // Headline lines and red brand highlight on 'brands.'
  assert.match(
    content,
    /headlineLine1 && <span className="block">\{headlineLine1\}<\/span>/,
    "Headline line 1 must be rendered as a block"
  );
  assert.match(
    content,
    /headlineLine2 && <span className="block">\{headlineLine2\}<\/span>/,
    "Headline line 2 must be rendered as a block"
  );
  assert.match(
    content,
    /<span className="text-brand-red">\{headlineHighlight\}<\/span>/,
    "Headline highlight must carry the brand red accent"
  );

  // Subheading copy
  assert.match(
    content,
    /subheading && \(\s*<p className="text-neutral-300/,
    "Supporting subheading must be rendered in high-contrast neutral-300 text"
  );

  // CTA buttons
  assert.match(
    content,
    /primaryCtaText && \(\s*<Link\s+href=\{primaryCtaLink \|\| "\/portfolio"\}/,
    "Primary CTA button must link to portfolio by default"
  );
  assert.match(
    content,
    /secondaryCtaText && \(\s*<Link\s+href=\{secondaryCtaLink \|\| "\/contact"\}/,
    "Secondary CTA button must link to contact by default"
  );
  assert.match(
    content,
    /bg-brand-red text-white.*border border-brand-red/,
    "Primary CTA button must retain solid brand red styling"
  );
});

test("3. Home Hero includes dark scrim gradient overlays for crisp readability", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/home/Hero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Horizontal gradient for desktop/tablet: darkest behind text on left, fading to right
  assert.match(
    content,
    /data-testid="home-hero-scrim-horizontal"/,
    "Must include horizontal scrim testid"
  );
  assert.match(
    content,
    /linear-gradient\(90deg,\s*rgba\(8,8,8,0\.94\)\s*0%,\s*rgba\(8,8,8,0\.82\)\s*38%/,
    "Desktop horizontal scrim must be darkest behind text on left"
  );

  // Vertical gradient for mobile stacked layout
  assert.match(
    content,
    /data-testid="home-hero-scrim-vertical"/,
    "Must include vertical scrim testid"
  );
  assert.match(
    content,
    /linear-gradient\(180deg,\s*rgba\(8,8,8,0\.92\)\s*0%,\s*rgba\(8,8,8,0\.80\)\s*65%/,
    "Mobile vertical scrim must provide contrast for stacked mobile layout"
  );
});

test("4. Home Hero maintains video playback attributes and responsive cover fit", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/home/Hero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Autoplay, muted, loop, playsInline, object-cover
  assert.match(content, /\bautoPlay\b/, "Video element must have autoPlay attribute");
  assert.match(content, /\bmuted\b/, "Video element must have muted attribute");
  assert.match(content, /\bloop\b/, "Video element must have loop attribute");
  assert.match(content, /\bplaysInline\b/, "Video element must have playsInline attribute");
  assert.match(content, /object-cover/, "Video element must use object-cover");
  assert.match(
    content,
    /style=\{\{\s*objectPosition:\s*"center 35%"\s*\}\}/,
    "Video element must set an optimized focal point"
  );
});

test("5. Home Hero preserves the Credentials strip below the video canvas", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/home/Hero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  assert.match(
    content,
    /CREDENTIALS\.map/,
    "Credentials strip mapping must be preserved"
  );
  assert.match(
    content,
    /grid-cols-1 sm:grid-cols-2 lg:grid-cols-4/,
    "Credentials strip must maintain 4-column desktop layout"
  );
  assert.match(
    content,
    /Fast Delivery/,
    "Fast Delivery credential item must be preserved"
  );
  assert.match(
    content,
    /Cinema Quality/,
    "Cinema Quality credential item must be preserved"
  );
});

