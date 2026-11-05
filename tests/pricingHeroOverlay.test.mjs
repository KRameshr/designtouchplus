import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

test("1. PricingHero renders a full-width background container instead of a split right-side card", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/pricing/PricingHero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Section should have full-width relative overflow-hidden layout with responsive height
  assert.match(
    content,
    /className="relative w-full overflow-hidden bg-\[#080808\][^"]*flex items-center/,
    "PricingHero section should have full-width relative overflow-hidden flex layout"
  );

  // Background container should be absolute inset-0 spanning edge to edge
  assert.match(
    content,
    /data-testid="pricing-hero-banner-container"[\s\S]*?className="absolute inset-0 w-full h-full z-0 overflow-hidden"/,
    "Banner container must be an absolute full-bleed background layer at z-0"
  );

  // Should NOT contain the old split columns
  assert.doesNotMatch(
    content,
    /lg:w-\[40%\]/,
    "Should not contain old split column width lg:w-[40%]"
  );
  assert.doesNotMatch(
    content,
    /lg:w-\[58%\]/,
    "Should not contain old split column width lg:w-[58%]"
  );
  assert.doesNotMatch(
    content,
    /aspect-\[16\/10\]/,
    "Should not contain separate small right-side card aspect ratio"
  );
});

test("2. PricingHero includes dark scrim gradient overlays matching BlogHero reference", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/pricing/PricingHero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Horizontal gradient for desktop/tablet
  assert.match(
    content,
    /linear-gradient\(90deg,\s*rgba\(8,8,8,0\.92\)\s*0%,\s*rgba\(8,8,8,0\.78\)\s*38%/,
    "Desktop horizontal scrim gradient provides strong text contrast on left while showing right-side background"
  );

  // Vertical gradient for mobile stacked layout
  assert.match(
    content,
    /linear-gradient\(180deg,\s*rgba\(8,8,8,0\.92\)\s*0%,\s*rgba\(8,8,8,0\.80\)\s*60%/,
    "Mobile vertical scrim gradient provides readability when text stacks"
  );
});

test("3. PricingHero positions headline, eyebrow, description, and CTAs directly over the image on the left", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/pricing/PricingHero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Foreground content layer at z-10 over the background
  assert.match(
    content,
    /className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8/,
    "Foreground content container must be at z-10 over the z-0 background"
  );

  // Text column constrained to left
  assert.match(
    content,
    /max-w-xl lg:max-w-2xl xl:max-w-\[680px\]/,
    "Text width must be constrained on the left to keep background visible on the right"
  );

  // Eyebrow label PRICING PLANS
  assert.match(
    content,
    /PRICING PLANS/,
    "Eyebrow default PRICING PLANS must be preserved"
  );

  // Both CTAs preserved
  assert.match(
    content,
    /CHOOSE A PLAN/,
    "Primary CTA CHOOSE A PLAN must be preserved"
  );
  assert.match(
    content,
    /BOOK A CALL/,
    "Secondary CTA BOOK A CALL must be preserved"
  );

  // Button styling preserved
  assert.match(
    content,
    /bg-brand-red text-white text-xs font-bold uppercase tracking-\[0\.16em\] font-display px-6 sm:px-7 py-3\.5 sm:py-4 rounded-none/,
    "Primary button must have brand-red background with square corners"
  );
  assert.match(
    content,
    /border border-white\/20 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-\[0\.16em\] font-display px-6 sm:px-7 py-3\.5 sm:py-4 rounded-none/,
    "Secondary button must have subtle white border and hover inversion"
  );
});

test("4. PricingHero preserves multi-banner carousel and fallback functionality", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/pricing/PricingHero.jsx");
  const content = fs.readFileSync(heroPath, "utf8");

  // Track data-testid and sliding transform
  assert.match(
    content,
    /data-testid="pricing-hero-carousel-track"/,
    "Track testid must be preserved for automated testing"
  );
  assert.match(
    content,
    /translate3d\(-\$\{effectiveTrackIndex \* 100\}%,\s*0,\s*0\)/,
    "Horizontal multi-banner sliding transform must be preserved"
  );

  // Pause on hover
  assert.match(
    content,
    /onMouseEnter=\{\(\) => setIsPaused\(true\)\}/,
    "Hover pause must be preserved"
  );

  // Fallback container
  assert.match(
    content,
    /data-testid="pricing-hero-fallback-container"/,
    "Fallback studio motif container must be preserved"
  );

  // Indicators rendered when > 1 active banner
  assert.match(
    content,
    /activeBanners\.length > 1 && \(/,
    "Slide indicators must be rendered when multiple banners exist"
  );
});

test("5. Admin pricing page preview also reflects the full-width background overlay layout", () => {
  const adminPath = path.join(FRONTEND_ROOT, "app/admin/pricing/page.js");
  const content = fs.readFileSync(adminPath, "utf8");

  assert.match(
    content,
    /Live Hero Preview \(Cinematic Full-Width Background Overlay\)/,
    "Admin preview heading reflects the cinematic full-width background overlay"
  );
  assert.match(
    content,
    /className="absolute inset-0 w-full h-full z-0 overflow-hidden"/,
    "Admin preview renders banner at z-0 background"
  );
  assert.match(
    content,
    /className="relative z-10 w-full max-w-xl"/,
    "Admin preview renders text at z-10 foreground"
  );
});
