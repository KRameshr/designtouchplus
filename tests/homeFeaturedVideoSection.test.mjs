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

test("Featured video gallery keeps six projects in a responsive 3/2/1 column grid", () => {
  const content = getVideoSectionContent();
  assert.match(content, /const PAGE_SIZE = 6;/);
  assert.match(content, /videos\.slice\(0, PAGE_SIZE\)/);
  assert.match(content, /data-testid="featured-video-grid"/);
  assert.match(content, /grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3/);
});

test("Featured video heading and full portfolio CTA follow the approved direction", () => {
  const content = getVideoSectionContent();
  assert.match(content, /Video <\/span><span className="text-brand-red">Portfolio/);
  assert.match(content, /OUR WORK \/\/ VIDEO EDITING/);
  assert.match(content, /A collection of our best video editing work/);
  assert.match(content, /href="\/portfolio#video-editing"/);
  assert.match(content, /VIEW FULL PORTFOLIO &#8599;/);
  assert.match(content, /h-px flex-1 bg-white\/40/);
});

test("Featured previews retain the existing project media URLs, poster sources, and 16:9 frame", () => {
  const content = getVideoSectionContent();
  assert.match(content, /aspect-video overflow-hidden/);
  assert.match(content, /src=\{project\.videoUrl\}/);
  assert.match(content, /project\.thumbnailUrl \|\| project\.imageUrl \|\| getVideoPoster\(project\.videoUrl\)/);
  assert.match(content, /poster=\{mediaSrc && !hasImageError/);
  assert.match(content, /playsInline\s+muted\s+loop\s+preload="none"/);
  assert.doesNotMatch(content, /autoPlay/);
});

test("Preview controls reveal on hover/focus/touch without starting playback automatically", () => {
  const content = getVideoSectionContent();
  assert.match(content, /onMouseEnter=\{\(\) => setHoveredMediaId\(projectId\)\}/);
  assert.match(content, /onTouchStart=\{\(\) => setTouchMediaId\(projectId\)\}/);
  assert.match(content, /onFocus=\{\(\) => setFocusedMediaId\(projectId\)\}/);
  assert.match(content, /controlsVisible = isPlaying \|\| hoveredMediaId === projectId \|\| focusedMediaId === projectId \|\| touchMediaId === projectId/);
  assert.match(content, /controlsVisible \? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"/);
  assert.match(content, /togglePreview\(projectId\)/);
  assert.doesNotMatch(content, /onMouseEnter=\{\(\) => togglePreview/);
});

test("Play/pause toggles are muted, resume in place, and stop other featured videos", () => {
  const content = getVideoSectionContent();
  assert.match(content, /if \(!video\.paused\) \{\s*video\.pause\(\)/);
  assert.match(content, /otherVideo\.pause\(\)/);
  assert.match(content, /video\.muted = true/);
  assert.match(content, /video\.play\(\)/);
  assert.match(content, /aria-label=\{`\$\{isPlaying \? "Pause" : "Play"\} preview of \$\{project\.title\}`\}/);
  assert.doesNotMatch(content, /currentTime\s*=\s*0/);
});

test("Project title and View Project links retain each existing project destination without duration labels", () => {
  const content = getVideoSectionContent();
  assert.match(content, /href=\{`\/portfolio\/\$\{project\.slug \|\| project\.id\}`\}/);
  assert.match(content, /VIEW PROJECT <span aria-hidden="true">&#8599;<\/span>/);
  assert.match(content, /border-l-2 border-brand-red/);
  assert.match(content, /project\.title/);
  assert.match(content, /project\.categoryName \|\| project\.subCategory \|\| project\.category/);
  assert.doesNotMatch(content, /project\.duration/);
});
