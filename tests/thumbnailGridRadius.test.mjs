import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

test("1. ThumbnailGrid card container applies subtle 0-1px radius with overflow-hidden", () => {
  const compPath = path.join(FRONTEND_ROOT, "components/portfolio/ThumbnailGrid.jsx");
  const content = fs.readFileSync(compPath, "utf8");

  // Card container must use rounded-[1px] overflow-hidden
  assert.match(
    content,
    /data-testid="thumbnail-card"[\s\S]*?className="[^"]*rounded-\[1px\] overflow-hidden[^"]*"/,
    "Thumbnail card must use rounded-[1px] and overflow-hidden for sharp clean clipping"
  );

  // Must not have rounded cards with large radius
  assert.doesNotMatch(
    content,
    /className="[^"]*rounded-(?:md|lg|xl|2xl|3xl|full)[^"]*"/,
    "ThumbnailGrid must not use rounded cards with large radius"
  );
});

test("2. Thumbnail image wrapper and img apply matching rounded-t-[1px] radius", () => {
  const compPath = path.join(FRONTEND_ROOT, "components/portfolio/ThumbnailGrid.jsx");
  const content = fs.readFileSync(compPath, "utf8");

  // Thumbnail frame link wrapper
  assert.match(
    content,
    /className="relative aspect-\[16\/9\] w-full overflow-hidden bg-\[#141414\] border-b border-white\/\[0\.08\] select-none block rounded-t-\[1px\]"/,
    "Image wrapper must use rounded-t-[1px] with overflow-hidden"
  );

  // Thumbnail img
  assert.match(
    content,
    /<img[\s\S]*?className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-\[1px\]"/,
    "Thumbnail img must use rounded-t-[1px] matching its container"
  );
});

test("3. ThumbnailGrid preserves 3-column desktop layout and 16:9 aspect ratio", () => {
  const compPath = path.join(FRONTEND_ROOT, "components/portfolio/ThumbnailGrid.jsx");
  const content = fs.readFileSync(compPath, "utf8");

  // 3-column desktop layout
  assert.match(
    content,
    /className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch"/,
    "Must preserve 3 columns on desktop, 2 on tablet, and 1 on mobile"
  );

  // 16:9 aspect ratio
  assert.match(
    content,
    /aspect-\[16\/9\]/,
    "Must preserve 16:9 aspect ratio for thumbnails"
  );
});

