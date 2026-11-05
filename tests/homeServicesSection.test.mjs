import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

function getServicesContent() {
  const filePath = path.join(FRONTEND_ROOT, "components/home/Services.jsx");
  return fs.readFileSync(filePath, "utf8");
}

function getServiceCardContent() {
  const filePath = path.join(FRONTEND_ROOT, "components/services/ServicesGrid.jsx");
  return fs.readFileSync(filePath, "utf8");
}

function getServiceDataContent() {
  const filePath = path.join(FRONTEND_ROOT, "lib/servicesData.js");
  return fs.readFileSync(filePath, "utf8");
}

test("1. Heading highlights 'SERVICES' with solid text-brand-red and keeps 'OUR' in white without gradient", () => {
  const content = getServicesContent();

  // Heading must contain OUR in white and SERVICES in brand red
  assert.match(
    content,
    /<h2[^>]*>\s*OUR\s*<span className="text-brand-red">\s*SERVICES\s*<\/span>\s*<\/h2>/,
    "Heading must render 'OUR <span className=\"text-brand-red\">SERVICES</span>'"
  );

  // Red-to-green gradient must be removed
  assert.doesNotMatch(
    content,
    /from-brand-red to-brand-green bg-clip-text/,
    "Multicolor red-to-green gradient must be removed from the heading"
  );
  assert.doesNotMatch(
    content,
    /text-transparent/,
    "text-transparent gradient utility must be removed"
  );
});

test("2. VIEW ALL SERVICES button uses brand-red background, white text, 0px border radius, no border, and darker hover state", () => {
  const content = getServicesContent();

  // Find the View All Services Link button
  const buttonMatch = content.match(/<Link\s+href="\/services"[\s\S]*?<\/Link>/);
  assert.ok(buttonMatch, "View All Services button must exist with href='/services'");
  const buttonHtml = buttonMatch[0];

  // Brand-red background & darker hover state
  assert.match(
    buttonHtml,
    /bg-brand-red hover:bg-\[#dc2626\]/,
    "Button must use brand-red background and darker hover state"
  );

  // White text
  assert.match(
    buttonHtml,
    /text-white/,
    "Button text must be white"
  );

  // Border none / border-0
  assert.match(
    buttonHtml,
    /border-0/,
    "Button must have border-0 (no border)"
  );
  assert.doesNotMatch(
    buttonHtml,
    /border-white\/15/,
    "Old white border must be removed"
  );

  // 0px border radius (sharp corners)
  assert.match(
    buttonHtml,
    /rounded-none/,
    "Button must have 0px border radius (rounded-none)"
  );
  assert.doesNotMatch(
    buttonHtml,
    /rounded-\[8px\]/,
    "Old 8px rounded corners must be removed"
  );

  // Preserves existing arrow icon
  assert.match(
    buttonHtml,
    /<ArrowRight className="w-4 h-4" aria-hidden="true" \/>/,
    "Button must preserve ArrowRight icon"
  );

  // Preserves padding & uppercase typography
  assert.match(
    buttonHtml,
    /px-5 py-3/,
    "Button must maintain px-5 py-3 sizing and padding"
  );
  assert.match(
    buttonHtml,
    /font-display font-bold uppercase tracking-\[0\.12em\]/,
    "Button must maintain uppercase tracking-[0.12em] font-display styling"
  );
});

test("3. Service card shape has sharp rectangular corners with 1px-2px border-radius and removes 12px corners", () => {
  const cardContent = getServiceCardContent();

  // Maximum 1px–2px border radius
  assert.match(
    cardContent,
    /rounded-\[2px\]/,
    "Service card must use sharp rectangular border radius (rounded-[2px])"
  );
  assert.doesNotMatch(
    cardContent,
    /rounded-\[12px\]/,
    "Noticeably rounded 12px corners must be completely removed"
  );
  assert.doesNotMatch(
    cardContent,
    /rounded-\[16px\]|rounded-xl|rounded-2xl/,
    "Large rounded corner classes must not be present"
  );
});

test("4. Service card styling uses dark background, 1px dark-grey border, restrained brand red hover accent, and no blur glows", () => {
  const cardContent = getServiceCardContent();

  // Dark background
  assert.match(cardContent, /bg-\[#0c0c0c\]/, "Card must use dark #0c0c0c background");
  assert.match(cardContent, /hover:bg-\[#111111\]/, "Card must use subtle #111111 hover background");

  // Subtle 1px dark-grey border
  assert.match(cardContent, /border-white\/\[0\.08\]/, "Card must use subtle 1px border-white/[0.08]");

  // Restrained red accent on hover/focus
  assert.match(cardContent, /hover:border-brand-red\/50/, "Hover state must brighten border with brand red");
  assert.match(cardContent, /focus-within:border-brand-red\/60/, "Focus state must highlight with brand red");

  // No excessive shadows, gradients, or glass effects
  assert.doesNotMatch(
    cardContent,
    /ambientGlow|blur-2xl/,
    "Top-left blur glow radial gradient must be removed"
  );
  assert.doesNotMatch(
    cardContent,
    /shadow-\[0_14px_36px/,
    "Old colored drop shadows must be removed"
  );
});

test("5. Service card layout aligns icons, numbering, titles, descriptions, feature lists and Learn More links", () => {
  const cardContent = getServiceCardContent();
  const homeContent = getServicesContent();

  // 4 columns desktop, 2 columns tablet, 1 column mobile with items-stretch
  assert.match(
    homeContent,
    /grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch/,
    "Grid must use 1 col mobile, 2 col tablet, 4 col desktop with items-stretch"
  );

  // Top row icon & numbering
  assert.match(cardContent, /ServiceOutlineIcon/, "Renders ServiceOutlineIcon");
  assert.match(cardContent, /\{displayNumber\}/, "Renders {displayNumber}");

  // Title & description with min-height
  assert.match(cardContent, /\{service\.title\}/, "Renders {service.title}");
  assert.match(cardContent, /sm:min-h-\[44px\]/, "Description has minimum height for row balance");

  // Feature list with sharp red indicator
  assert.match(
    cardContent,
    /w-1\.5 h-1\.5 rounded-none bg-brand-red/,
    "Feature bullets use sharp rectangular red indicator (no rounded pill shapes)"
  );

  // Bottom pinned Learn More link
  assert.match(
    cardContent,
    /border-t border-white\/\[0\.06\][\s\S]*?mt-auto|mt-auto[\s\S]*?border-t border-white\/\[0\.06\]/,
    "Learn More link is anchored to the bottom with subtle top divider"
  );
  assert.match(cardContent, /LEARN MORE/, "Includes LEARN MORE ctaLabel");
});

test("6. Hover interactions are smooth and restrained without unnecessary translation movement or scale animations", () => {
  const cardContent = getServiceCardContent();

  // Smooth transition
  assert.match(cardContent, /transition-colors duration-200/, "Uses smooth 200ms transition");

  // No bounce movement or icon scale on hover
  assert.doesNotMatch(
    cardContent,
    /hover:-translate-y-1/,
    "hover:-translate-y-1 on card must be removed"
  );
  assert.doesNotMatch(
    cardContent,
    /group-hover:scale-\[1\.06\]/,
    "group-hover:scale scale animation on icon must be removed"
  );
});

test("7. Service names, descriptions, icons, numbering and routes remain completely intact", () => {
  const cardContent = getServiceCardContent();
  const dataContent = getServiceDataContent();

  assert.match(cardContent, /REFERENCE_SERVICES/, "REFERENCE_SERVICES catalogue remains intact");
  assert.match(cardContent, /detailHref/, "detailHref route resolution intact");
  assert.match(dataContent, /Video Editing/, "Video Editing service intact");
  assert.match(dataContent, /Motion Graphics/, "Motion Graphics service intact");
  assert.match(dataContent, /Social Media Content/, "Social Media Content service intact");
  assert.match(dataContent, /YouTube Management/, "YouTube Management service intact");
});
