import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

function getVideoSectionContent() {
  const filePath = path.join(FRONTEND_ROOT, "components/home/FeaturedProjects.jsx");
  const fullContent = fs.readFileSync(filePath, "utf8");
  const match = fullContent.match(
    /\/\* =+[\s\S]*?SECTION A: FEATURED VIDEO EDITING[\s\S]*?\/\* =+[\s\S]*?SECTION B/
  );
  return match ? match[0] : fullContent;
}

test("1. Featured Video section establishes a 3x2 grid layout (6 videos: 3 cols desktop, 2 cols tablet, 1 col mobile)", () => {
  const content = getVideoSectionContent();

  // Grid container must define featured-video-grid testid
  assert.match(
    content,
    /data-testid="featured-video-grid"/,
    "Must define featured-video-grid testid"
  );

  // Responsive grid classes: 3 columns desktop, 2 columns tablet, 1 column mobile with 12px-16px compact gaps
  assert.match(
    content,
    /grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3\.5 sm:gap-4/,
    "Must use responsive 3-col desktop, 2-col tablet, 1-col mobile grid with compact 12px-16px gaps (gap-3.5 sm:gap-4)"
  );

  // Page size must be 6
  assert.match(
    content,
    /const PAGE_SIZE = 6;/,
    "PAGE_SIZE must be exactly 6"
  );

  // Slices videos by 6 items
  assert.match(
    content,
    /videos\.slice\(startIndex,\s*endIndex\)/,
    "Must slice videos using startIndex and endIndex"
  );
});

test("2. Pagination controls provide functional Previous/Next navigation and '01–06 / 09' page indicator", () => {
  const content = getVideoSectionContent();

  // Page indicator testid
  assert.match(
    content,
    /data-testid="featured-videos-page-indicator"/,
    "Must define featured-videos-page-indicator testid"
  );

  // Format: startStr–endStr / totalStr
  assert.match(
    content,
    /\{startStr\}–\{endStr\}[\s\S]*?\{totalStr\}/,
    "Page indicator must format as e.g. '01–06 / 09'"
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

  // Accessible button aria labels
  assert.match(
    content,
    /aria-label="Previous page of videos"/,
    "Must include accessible aria-label for previous button"
  );
  assert.match(
    content,
    /aria-label="Next page of videos"/,
    "Must include accessible aria-label for next button"
  );
});

test("3. Video Thumbnail Design is clean with 16:9 ratio, object-cover, and completely removed thumbnail overlays", () => {
  const content = getVideoSectionContent();

  // Consistent 16:9 aspect ratio
  assert.match(
    content,
    /aspect-\[16\/9\]/,
    "Thumbnail frame must use true 16:9 aspect ratio"
  );

  // object-cover without stretching or black bars
  assert.match(
    content,
    /<video[\s\S]*?className="[^"]*object-cover/,
    "Video element must use object-cover"
  );
  assert.match(
    content,
    /<img[\s\S]*?className="[^"]*object-cover/,
    "Fallback thumbnail image must use object-cover"
  );
  assert.doesNotMatch(
    content,
    /<video[\s\S]*?className="[^"]*object-contain/,
    "Video element must not use letterboxed object-contain"
  );

  // Thumbnail container must NOT contain category badge or duration overlay badge
  const thumbnailContainerMatch = content.match(
    /<div[^>]*data-testid="video-card-thumbnail-container"[\s\S]*?<\/div>\s*<\/div>/
  );
  const thumbHtml = thumbnailContainerMatch ? thumbnailContainerMatch[0] : "";
  assert.doesNotMatch(
    thumbHtml,
    /Category Badge — Top Left/,
    "Category badge overlay on thumbnail must be completely removed"
  );
  assert.doesNotMatch(
    thumbHtml,
    /Duration or Aspect Ratio Badge — Top Right/,
    "Duration/aspect-ratio badge overlay on thumbnail must be completely removed"
  );
});

test("4. Hover Interaction plays preview muted and resets on mouse leave without permanent PLAY REEL overlay", () => {
  const content = getVideoSectionContent();

  // Event handlers on thumbnail container
  assert.match(
    content,
    /onMouseEnter=\{\(\) => handleMouseEnter\(project\.id\)\}/,
    "Must trigger handleMouseEnter on mouse enter"
  );
  assert.match(
    content,
    /onMouseLeave=\{\(\) => handleMouseLeave\(project\.id\)\}/,
    "Must trigger handleMouseLeave on mouse leave"
  );

  // Muted preview and play/pause behavior
  assert.match(
    content,
    /video\.muted\s*=\s*true/,
    "Video preview must be strictly muted"
  );
  assert.match(
    content,
    /video\.pause\(\)/,
    "Video must pause on mouse leave"
  );
  assert.match(
    content,
    /video\.currentTime\s*=\s*0/,
    "Video playback time must reset to 0 on mouse leave"
  );

  // No permanent PLAY REEL button
  assert.doesNotMatch(
    content,
    /<span>Play Reel<\/span>/,
    "Permanent 'Play Reel' button overlay must be removed"
  );
});

test("5. Red Details Button (VIEW DETAILS →) with brand-red background, white text, and sharp 0px corners", () => {
  const content = getVideoSectionContent();

  // Button text VIEW DETAILS →
  assert.match(
    content,
    /<span>VIEW DETAILS<\/span>\s*<span aria-hidden="true">→<\/span>/,
    "Button must display 'VIEW DETAILS →'"
  );

  // Button styling: bg-brand-red, hover:bg-[#dc2626], text-white, rounded-none
  assert.match(
    content,
    /bg-brand-red\s+hover:bg-\[#dc2626\]\s+text-white[^"]*rounded-none/,
    "Button must use brand-red background, darker hover, white text, and sharp corners (rounded-none)"
  );

  // Card metadata below thumbnail
  assert.match(
    content,
    /PROJECT \/\/\s*\{String\(startIndex \+ idx \+ 1\)\.padStart\(2,\s*"0"\)\}/,
    "Must display PROJECT // 01 numbering relative to current page"
  );
  assert.match(
    content,
    /text-brand-red font-semibold/,
    "Category in card content must use brand-red font-semibold"
  );

  // Title with line-clamp-2
  assert.match(
    content,
    /line-clamp-2 leading-snug/,
    "Project title must use line-clamp-2 for clean 2-line truncation"
  );
});

test("6. Section Header formats 'FEATURED' in white and 'VIDEO EDITING' in red on second line, and preserves View All Videos link", () => {
  const content = getVideoSectionContent();

  // Heading displays FEATURED in white and VIDEO EDITING in red (#F04444) on second line
  assert.match(
    content,
    /<span className="block text-white">\s*FEATURED\s*<\/span>\s*<span className="block text-brand-red text-\[#F04444\][^"]*">\s*VIDEO EDITING\s*<\/span>/,
    "Header must display 'FEATURED' in white and 'VIDEO EDITING' in red (#F04444) on second line"
  );

  // View All Videos navigation links to portfolio
  assert.match(
    content,
    /href="\/portfolio#video-editing"/,
    "'View All Videos' link must navigate to portfolio video editing section"
  );
  assert.match(
    content,
    /<span>View All Videos<\/span>/,
    "Must display 'View All Videos' text"
  );
});

test("7. Video card and grid dimensions align with navbar container (max-w-7xl mx-auto px-6, compact 12px-16px gaps, compact card padding, equal row heights)", () => {
  const content = getVideoSectionContent();

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
