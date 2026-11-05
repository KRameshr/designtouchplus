import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

function getThumbnailSectionContent() {
  const filePath = path.join(FRONTEND_ROOT, "components/home/FeaturedProjects.jsx");
  const fullContent = fs.readFileSync(filePath, "utf8");
  const match = fullContent.match(
    /\/\* =+[\s\S]*?SECTION B: FEATURED THUMBNAIL DESIGN[\s\S]*?\/\* =+[\s\S]*?MAIN EXPORT/
  );
  return match ? match[0] : fullContent;
}

test("1. Headline is formatted on exactly two lines: FEATURED in white and THUMBNAIL DESIGN in red (#F04444) on one desktop line", () => {
  const content = getThumbnailSectionContent();

  // Heading contains block spans for FEATURED and THUMBNAIL DESIGN in red (#F04444) with desktop nowrap
  assert.match(
    content,
    /<span className="block text-white">\s*FEATURED\s*<\/span>\s*<span className="block text-brand-red text-\[#F04444\][^"]*">\s*THUMBNAIL DESIGN\s*<\/span>/,
    "Heading must display 'FEATURED' on the first line and 'THUMBNAIL DESIGN' in red (#F04444) on the second line"
  );
  assert.match(
    content,
    /<span className="block text-brand-red text-\[#F04444\][^"]*lg:whitespace-nowrap[^"]*">\s*THUMBNAIL DESIGN\s*<\/span>/,
    "THUMBNAIL DESIGN must appear together on ONE single line on desktop without breaking"
  );
});

test("2. Featured Thumbnail section establishes a 3x2 grid layout (up to 6 thumbnails: 3 cols desktop, 2 cols tablet, 1 col mobile)", () => {
  const content = getThumbnailSectionContent();

  // Grid container must define featured-thumbnail-grid testid
  assert.match(
    content,
    /data-testid="featured-thumbnail-grid"/,
    "Must define featured-thumbnail-grid testid"
  );

  // Responsive grid classes: 3 columns desktop, 2 columns tablet, 1 column mobile with 12px-16px compact gaps
  assert.match(
    content,
    /grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3\.5 sm:gap-4/,
    "Must use responsive 3-col desktop, 2-col tablet, 1-col mobile grid with compact 12px-16px gaps (gap-3.5 sm:gap-4)"
  );

  // Slices thumbnails by PAGE_SIZE
  assert.match(
    content,
    /thumbnails\.slice\(startIndex,\s*endIndex\)/,
    "Must slice thumbnails using startIndex and endIndex"
  );

  // Card container must define featured-thumbnail-card testid
  assert.match(
    content,
    /data-testid="featured-thumbnail-card"/,
    "Must define featured-thumbnail-card testid"
  );
});

test("3. Thumbnail overlays (category badge, 16:9 CTR badge) are completely removed from the image", () => {
  const content = getThumbnailSectionContent();

  // The 16:9 thumbnail Link frame must not contain category badge or 16:9 CTR overlay
  const thumbnailLinkMatch = content.match(/aria-label=\{`View thumbnail details for \$\{item\.title\}`\}[\s\S]*?<\/Link>/);
  assert.ok(thumbnailLinkMatch, "Thumbnail Link frame must exist");
  const thumbnailLink = thumbnailLinkMatch[0];

  assert.doesNotMatch(
    thumbnailLink,
    /absolute top-2\.5 left-2\.5/,
    "Thumbnail image must not contain top-left category badge overlay"
  );
  assert.doesNotMatch(
    thumbnailLink,
    /16:9 CTR/,
    "Thumbnail image must not contain top-right 16:9 CTR badge overlay"
  );
});

test("4. Card metadata below thumbnail preserves category, project number, and title", () => {
  const content = getThumbnailSectionContent();

  // Preserved below thumbnail
  assert.match(
    content,
    /PACKAGING \/\/ \{String\(startIndex \+ idx \+ 1\)\.padStart\(2, "0"\)\}/,
    "Must display packaging project index below thumbnail"
  );
  assert.match(
    content,
    /\{categoryLabel\}/,
    "Must display preserved category label in metadata below thumbnail"
  );
});

test("5. Red CTA Button replaces text link with 'VIEW PACKAGING →' and dynamic project href", () => {
  const content = getThumbnailSectionContent();

  // Brand-red solid button styling
  assert.match(
    content,
    /bg-brand-red hover:bg-\[#dc2626\] text-white/,
    "Must use brand-red background with darker hover effect"
  );

  // 0px border radius (rounded-none, no pill)
  assert.match(
    content,
    /rounded-none/,
    "Button must have 0px border radius (rounded-none, no pill)"
  );

  // Correct button label
  assert.match(
    content,
    /<span>VIEW PACKAGING<\/span>\s*<span aria-hidden="true">→<\/span>/,
    "Button label must be 'VIEW PACKAGING →'"
  );

  // Dynamic portfolio destination preserved
  assert.match(
    content,
    /href=\{`\/portfolio\/\$\{item\.slug \|\| item\.id\}`\}/,
    "Must dynamically link to project destination /portfolio/${item.slug || item.id}"
  );
});

test("6. Card styling applies ~1px subtle corners and dark editorial aesthetic", () => {
  const content = getThumbnailSectionContent();

  // ~1px corners
  assert.match(
    content,
    /rounded-\[1px\]/,
    "Cards must use subtle ~1px border radius"
  );

  // Dark border and dark background
  assert.match(
    content,
    /bg-\[#0c0c0c\] border border-white\/\[0\.08\]/,
    "Cards must use deep black background with thin dark border"
  );

  // 16:9 aspect ratio and object-cover
  assert.match(
    content,
    /aspect-\[16\/9\]/,
    "Thumbnail frame must maintain 16:9 aspect ratio"
  );
  assert.match(
    content,
    /object-cover/,
    "Image must fill frame with object-cover"
  );
});

test("7. Pagination controls provide functional Previous/Next navigation and dynamic page indicator", () => {
  const content = getThumbnailSectionContent();

  // Page indicator testid
  assert.match(
    content,
    /data-testid="featured-thumbnails-page-indicator"/,
    "Must define featured-thumbnails-page-indicator testid"
  );

  // Format: startStr–endStr / totalStr
  assert.match(
    content,
    /\{startStr\}–\{endStr\}[\s\S]*?\{totalStr\}/,
    "Page indicator must format as e.g. '01–06 / 12'"
  );

  // Previous button disabled on page 1
  assert.match(
    content,
    /disabled=\{currentPage <= 1\}/,
    "Previous button must be disabled when on page 1"
  );

  // Next button disabled on last page
  assert.match(
    content,
    /disabled=\{currentPage >= totalPages\}/,
    "Next button must be disabled when on the last page"
  );
});

test("8. Navigation links route to /portfolio#thumbnails", () => {
  const content = getThumbnailSectionContent();

  // Desktop header link and mobile bottom link
  assert.match(
    content,
    /href="\/portfolio#thumbnails"/,
    "Must include navigation links pointing to /portfolio#thumbnails"
  );
  assert.match(
    content,
    /View All Thumbnails/,
    "Must include 'View All Thumbnails' label"
  );
});

test("9. Thumbnail section aligns with navbar container (max-w-7xl mx-auto px-6), compact 12px-16px gaps, compact card padding, and equal row heights", () => {
  const content = getThumbnailSectionContent();

  // Container width and gutters align with navbar: max-w-7xl mx-auto px-6
  assert.match(
    content,
    /max-w-7xl mx-auto px-6/,
    "Container must use navbar's shared container max-w-7xl mx-auto px-6"
  );

  // Compact 12px-16px horizontal and vertical gaps
  assert.match(
    content,
    /gap-3\.5 sm:gap-4/,
    "Must use compact 12px-16px gaps (gap-3.5 sm:gap-4)"
  );

  // Content area uses compact vertical padding to reduce unnecessary card height
  assert.match(
    content,
    /p-4 sm:p-5 flex flex-col flex-1 justify-between/,
    "Card content area must use compact padding p-4 sm:p-5"
  );

  // Equal heights in row
  assert.match(
    content,
    /items-stretch/,
    "Grid must stretch items for equal card heights in row"
  );
  assert.match(
    content,
    /flex flex-col h-full/,
    "Cards must be full height"
  );
});
