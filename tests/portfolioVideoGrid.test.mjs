import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

function getGrid() {
  return fs.readFileSync(path.join(FRONTEND_ROOT, "components/portfolio/PortfolioGrid.jsx"), "utf8");
}

test("Portfolio video cards use larger 16:9 previews in a responsive one/two/three column grid", () => {
  const content = getGrid();
  assert.match(content, /data-testid="portfolio-video-grid"/);
  assert.match(content, /grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3/);
  assert.match(content, /data-testid="portfolio-video-preview"[\s\S]*?aspect-video/);
  assert.match(content, /max-w-\[1440px\]/);
  assert.match(content, /w-\[calc\(100%-32px\)\]\s+sm:w-\[calc\(100%-64px\)\]\s+lg:w-\[calc\(100%-120px\)\]/);
});

test("Video Portfolio heading, description, and category filters stay in the existing section", () => {
  const content = getGrid();
  assert.match(content, /Video <\/span><span className="text-brand-red">Portfolio/);
  assert.match(content, /OUR WORK/);
  assert.match(content, /A collection of our best video editing work/);
  for (const category of ["All Work", "Brand Films", "Commercials", "YouTube", "Reels & Shorts", "Motion Graphics"]) {
    assert.ok(content.includes(`label: "${category}"`), `Reference category filter ${category} must be present`);
  }
  assert.match(content, /categories\.forEach\(\(cat\) =>/);
  assert.match(content, /tabs\.push\(/);
  assert.match(content, /aliases: \["brand-film"\]/);
  assert.match(content, /aliases: \["reels-shorts", "shorts"\]/);
  assert.match(content, /onClick=\{\(\) => handleCategoryChange\(value\)\}/);
  assert.match(content, /aria-pressed=\{active\}/);
  assert.match(content, /rounded-full/);
  assert.match(content, /overflow-x-auto/);
  assert.match(content, /bg-brand-red border-brand-red text-white/);
});

test("Existing portfolio video and thumbnail URLs remain the preview sources", () => {
  const content = getGrid();
  assert.match(content, /src=\{project\.videoUrl\}/);
  assert.match(content, /poster=\{cloudinaryImageUrl\(mediaSrc, 960\) \|\| mediaSrc \|\| undefined\}/);
  assert.match(content, /project\.thumbnailUrl \|\| project\.imageUrl/);
  assert.match(content, /preload="none"/);
  assert.doesNotMatch(content, /autoPlay/);
});

test("Video hover reveals controls without auto-playing and touch reveals the controls", () => {
  const content = getGrid();
  assert.match(content, /onMouseEnter=\{\(\) => setHoveredMediaId\(projectId\)\}/);
  assert.match(content, /onTouchStart=\{\(\) => setTouchMediaId\(projectId\)\}/);
  assert.match(content, /onFocus=\{\(\) => setFocusedMediaId\(projectId\)\}/);
  assert.match(content, /controlsVisible \? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"/);
  assert.match(content, /data-testid="video-card-overlay"/);
  assert.match(content, /data-testid="video-card-hover-controls"/);
  assert.doesNotMatch(content, /onMouseEnter=\{\(\) => togglePlayback/);
});

test("Play, pause, resume, and one-video-at-a-time behavior are wired to the play control", () => {
  const content = getGrid();
  assert.match(content, /const togglePlayback = \(projectId\)/);
  assert.match(content, /if \(!video\.paused\) \{\s*video\.pause\(\)/);
  assert.match(content, /otherVideo\.pause\(\)/);
  assert.match(content, /video\.muted = true/);
  assert.match(content, /video\.play\(\)/);
  assert.match(content, /aria-label=\{`\$\{isPlaying \? "Pause" : "Play"\} \$\{project\.title\}`\}/);
  assert.doesNotMatch(content, /currentTime\s*=\s*0/);
});

test("Project titles, categories, and View Project buttons keep their existing destinations without timestamps", () => {
  const content = getGrid();
  assert.match(content, /project\.categoryName \|\| project\.subCategory \|\| project\.category/);
  assert.match(content, /border-l-2 border-brand-red/);
  assert.match(content, /href=\{`\/portfolio\/\$\{project\.slug \|\| project\.id\}`\}/);
  assert.match(content, /VIEW PROJECT <span aria-hidden="true">&#8599;<\/span>/);
  assert.doesNotMatch(content, /project\.duration/);
});

test("Portfolio pagination and shared portfolio container remain available", () => {
  const content = getGrid();
  assert.match(content, /const VIDEO_PAGE_SIZE = 9/);
  assert.match(content, /SHOWING \$\{startIndex \+ 1\} - \$\{endIndex\} OF \$\{totalProjects\} PROJECTS/);
  assert.match(content, /&lt; PREV/);
  assert.match(content, /NEXT &gt;/);

  const cssPath = path.join(FRONTEND_ROOT, "app/globals.css");
  assert.match(fs.readFileSync(cssPath, "utf8"), /\.global-container\s*\{/);
});
