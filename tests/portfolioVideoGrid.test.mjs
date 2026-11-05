import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

test("1. Portfolio video grid uses exactly 3 columns on desktop, 2 on tablets, 1 on mobile with 0 gap", () => {
  const gridPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioGrid.jsx");
  const content = fs.readFileSync(gridPath, "utf8");

  // Video grid container must have test id and responsive column layout
  assert.match(
    content,
    /data-testid="portfolio-video-grid"/,
    "PortfolioGrid must define data-testid='portfolio-video-grid'"
  );

  assert.match(
    content,
    /className="[^"]*grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0[^"]*"/,
    "Video grid must use grid-cols-1 on mobile, md:grid-cols-2 on tablet, lg:grid-cols-3 on desktop, and gap-0 (seamless touching tiles)"
  );

  // Must not be 4 columns on desktop
  assert.doesNotMatch(
    content,
    /lg:grid-cols-4/,
    "Video grid must not use 4 columns on desktop"
  );
});

test("2. Video tiles use true 16:9 aspect ratio, object-fit cover, and sharp square corners (rounded-none)", () => {
  const gridPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioGrid.jsx");
  const content = fs.readFileSync(gridPath, "utf8");

  // Card container must use true 16:9 aspect ratio and rounded-none
  assert.match(
    content,
    /data-testid="portfolio-video-card"[\s\S]*?className="[^"]*aspect-\[16\/9\][^"]*rounded-none/,
    "Video card must use aspect-[16/9] with rounded-none sharp square corners"
  );

  // Video element must use object-cover
  assert.match(
    content,
    /<video[\s\S]*?className="[^"]*object-cover[^"]*"/,
    "Video element must use object-cover and fill width/height"
  );

  // Image fallback must also use object-cover
  assert.match(
    content,
    /<img[\s\S]*?className="[^"]*object-cover[^"]*"/,
    "Image thumbnail must use object-cover"
  );
});

test("3. Increased grid content width allows larger, wider, and taller video cards on desktop using global container system", () => {
  const gridPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioGrid.jsx");
  const content = fs.readFileSync(gridPath, "utf8");

  // Overall portfolio content width is set to max-w-[1440px] and uses global container
  assert.match(
    content,
    /max-w-\[1440px\]/,
    "PortfolioGrid container must use max-w-[1440px] for larger video cards"
  );
  assert.match(
    content,
    /global-container/,
    "PortfolioGrid container must use global-container system"
  );
  assert.match(
    content,
    /w-\[calc\(100%-32px\)\]\s+sm:w-\[calc\(100%-64px\)\]\s+lg:w-\[calc\(100%-120px\)\]/,
    "PortfolioGrid must implement mobile calc(100%-32px), tablet calc(100%-64px), and desktop calc(100%-120px)"
  );
});

test("4. 'OUR PORTFOLIO' heading, eyebrow, and curated description are completely removed", () => {
  const gridPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioGrid.jsx");
  const content = fs.readFileSync(gridPath, "utf8");

  // Heading OUR PORTFOLIO must be removed
  assert.doesNotMatch(
    content,
    /OUR <span[^>]*>PORTFOLIO<\/span>/,
    "OUR PORTFOLIO heading must be completely removed"
  );

  // Eyebrow SELECTED WORK must be removed from PortfolioGrid
  assert.doesNotMatch(
    content,
    /SELECTED WORK/,
    "SELECTED WORK eyebrow must be removed from PortfolioGrid"
  );

  // Description copy must be removed
  assert.doesNotMatch(
    content,
    /A curated collection of our best video editing work/,
    "Curated portfolio description must be completely removed"
  );
});

test("5. Video controls and overlay are hover-only (hidden by default, fade in on hover/focus)", () => {
  const gridPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioGrid.jsx");
  const content = fs.readFileSync(gridPath, "utf8");

  // Overlay has opacity-0 by default and group-hover:opacity-100
  assert.match(
    content,
    /data-testid="video-card-overlay"[\s\S]*?opacity-0 group-hover:opacity-100/,
    "Dark overlay must be hidden by default (opacity-0) and visible on hover (group-hover:opacity-100)"
  );

  // Controls container has opacity-0 by default, group-hover:opacity-100, and pointer-events-none
  assert.match(
    content,
    /data-testid="video-card-hover-controls"[\s\S]*?pointer-events-none opacity-0 group-hover:opacity-100/,
    "Hover controls container must be hidden by default (opacity-0), pointer-events-none, and visible on hover (group-hover:opacity-100)"
  );

  // Keyboard accessibility: group-focus-within:opacity-100
  assert.match(
    content,
    /group-focus-within:opacity-100/,
    "Controls must be accessible for keyboard navigation via group-focus-within:opacity-100"
  );

  // Circular play button inside hover controls
  assert.match(
    content,
    /rounded-full bg-black\/50[^"]*border border-white\/80/,
    "Must render circular translucent play button with white outline"
  );

  // White play icon inside circle
  assert.match(
    content,
    /<polygon points="6 4 20 12 6 20"/,
    "Must render white triangle play icon inside the circular play button"
  );

  // Centered VIEW PROJECT button with sharp corners
  assert.match(
    content,
    /VIEW PROJECT[\s\S]*?rounded-none/,
    "Must render VIEW PROJECT button with sharp square corners (rounded-none)"
  );
});

test("6. All text below cards is completely removed", () => {
  const gridPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioGrid.jsx");
  const content = fs.readFileSync(gridPath, "utf8");

  // Must NOT contain PROJECT // sequential numbering
  assert.doesNotMatch(
    content,
    /PROJECT \/\/ \{String/,
    "Must not render sequential project numbers below cards"
  );

  // Must NOT contain separate Details link text
  assert.doesNotMatch(
    content,
    /<span>Details<\/span>/,
    "Must not render separate Details link below cards"
  );

  // Must NOT render card description below card
  assert.doesNotMatch(
    content,
    /\{project\.description && \(/,
    "Must not render project descriptions underneath thumbnails"
  );
});

test("7. Category filter bar renders reference categories, project count, and sort dropdown", () => {
  const gridPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioGrid.jsx");
  const content = fs.readFileSync(gridPath, "utf8");

  // Reference categories must be present
  assert.match(content, /ALL WORK/, "Filter must contain ALL WORK tab");
  assert.match(content, /NEW BATCH/, "Filter must contain NEW BATCH tab");
  assert.match(content, /CORPORATE/, "Filter must contain CORPORATE tab");
  assert.match(content, /YOUTUBE/, "Filter must contain YOUTUBE tab");
  assert.match(content, /INSTAGRAM REELS/, "Filter must contain INSTAGRAM REELS tab");
  assert.match(content, /COMMERCIAL/, "Filter must contain COMMERCIAL tab");
  assert.match(content, /MOTION GRAPHICS/, "Filter must contain MOTION GRAPHICS tab");
  assert.match(content, /REAL ESTATE/, "Filter must contain REAL ESTATE tab");
  assert.match(content, /DYNAMIC BATCH/, "Filter must contain DYNAMIC BATCH tab");

  // Filter tabs sharp corners
  assert.match(
    content,
    /rounded-none border transition-colors cursor-pointer/,
    "Filter tab buttons must use sharp square corners (rounded-none)"
  );

  // Active tab red background
  assert.match(
    content,
    /bg-brand-red border-brand-red text-white/,
    "Active tab must use solid brand red background"
  );

  // Project count and Sort button
  assert.match(
    content,
    /\{filtered\.length\} \{filtered\.length === 1 \? "PROJECT" : "PROJECTS"\}/,
    "Must display uppercase PROJECT / PROJECTS count"
  );
  assert.match(
    content,
    /SORT: DEFAULT/,
    "Must display SORT: DEFAULT button"
  );
});

test("8. Pagination uses 9 items per page, dynamic range indicator, and sharp-cornered controls", () => {
  const gridPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioGrid.jsx");
  const content = fs.readFileSync(gridPath, "utf8");

  // Page size 9 for 3x3 grid
  assert.match(
    content,
    /const VIDEO_PAGE_SIZE = 9;/,
    "Must use VIDEO_PAGE_SIZE = 9 for 3x3 video grid"
  );

  // Range indicator
  assert.match(
    content,
    /SHOWING \$\{startIndex \+ 1\} - \$\{endIndex\} OF \$\{totalProjects\} PROJECTS/,
    "Must display range indicator in SHOWING 1 - 9 OF 15 PROJECTS format"
  );

  // Prev and Next buttons with < PREV and NEXT >
  assert.match(
    content,
    /&lt; PREV/,
    "Must display < PREV button"
  );
  assert.match(
    content,
    /NEXT &gt;/,
    "Must display NEXT > button"
  );

  // Square corners for pagination buttons
  assert.match(
    content,
    /className="h-9 px-3\.5 border border-white\/20 bg-black text-white[\s\S]*?rounded-none/,
    "Pagination buttons must use rounded-none sharp corners"
  );
});

test("9. Hover-to-play triggers inline muted playback and resets on mouse leave", () => {
  const gridPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioGrid.jsx");
  const content = fs.readFileSync(gridPath, "utf8");

  // Event handlers
  assert.match(
    content,
    /onMouseEnter=\{\(\) => handleMouseEnter\(project\.id\)\}/,
    "Card must handle onMouseEnter"
  );
  assert.match(
    content,
    /onMouseLeave=\{\(\) => handleMouseLeave\(project\.id\)\}/,
    "Card must handle onMouseLeave"
  );
  assert.match(
    content,
    /onFocus=\{\(\) => handleMouseEnter\(project\.id\)\}/,
    "Card must handle onFocus"
  );
  assert.match(
    content,
    /onBlur=\{\(\) => handleMouseLeave\(project\.id\)\}/,
    "Card must handle onBlur"
  );

  // Muted and reset
  assert.match(content, /video\.muted = true;/, "Video must be muted on play");
  assert.match(content, /video\.currentTime = 0;/, "Video must reset on mouse leave");
});

test("10. Global container system establishes consistent alignment across all portfolio sections", () => {
  const cssPath = path.join(FRONTEND_ROOT, "app/globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf8");

  // Global container defined with exact responsive calc widths
  assert.match(
    cssContent,
    /\.global-container\s*\{[\s\S]*?width:\s*calc\(100%\s*-\s*32px\);[\s\S]*?max-width:\s*1440px;[\s\S]*?margin-inline:\s*auto;/,
    "globals.css must define .global-container with calc(100% - 32px) and max-width 1440px"
  );
  assert.match(
    cssContent,
    /@media\s*\(min-width:\s*640px\)[\s\S]*?width:\s*calc\(100%\s*-\s*64px\);/,
    "globals.css must define tablet width calc(100% - 64px)"
  );
  assert.match(
    cssContent,
    /@media\s*\(min-width:\s*1024px\)[\s\S]*?width:\s*calc\(100%\s*-\s*120px\);/,
    "globals.css must define desktop width calc(100% - 120px)"
  );

  // Portfolio sections use global-container
  const heroPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioHero.jsx");
  const gridPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioGrid.jsx");
  const thumbPath = path.join(FRONTEND_ROOT, "components/portfolio/ThumbnailGrid.jsx");
  const ctaPath = path.join(FRONTEND_ROOT, "components/portfolio/PortfolioCta.jsx");

  assert.match(fs.readFileSync(heroPath, "utf8"), /global-container/, "PortfolioHero must use global-container");
  assert.match(fs.readFileSync(gridPath, "utf8"), /global-container/, "PortfolioGrid must use global-container");
  assert.match(fs.readFileSync(thumbPath, "utf8"), /global-container/, "ThumbnailGrid must use global-container");
  assert.match(fs.readFileSync(ctaPath, "utf8"), /global-container/, "PortfolioCta must use global-container");
});
