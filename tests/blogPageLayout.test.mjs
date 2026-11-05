import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");

test("1. Navbar, BlogHero, and Blog Listing sections share consistent container max-width and horizontal alignment", () => {
  const navbarPath = path.join(FRONTEND_ROOT, "components/layout/Navbar.jsx");
  const navbar = fs.readFileSync(navbarPath, "utf8");
  const heroPath = path.join(FRONTEND_ROOT, "components/blog/BlogHero.jsx");
  const hero = fs.readFileSync(heroPath, "utf8");
  const blogPagePath = path.join(FRONTEND_ROOT, "app/blog/page.js");
  const blogPage = fs.readFileSync(blogPagePath, "utf8");

  // Navbar container
  assert.match(navbar, /max-w-7xl\s+mx-auto\s+px-6/, "Navbar must use max-w-7xl mx-auto px-6");

  // BlogHero container
  assert.match(hero, /max-w-7xl\s+mx-auto\s+px-6/, "BlogHero must use max-w-7xl mx-auto px-6 matching Navbar");
  assert.doesNotMatch(hero, /lg:px-8/, "BlogHero must not use oversized lg:px-8 padding that misaligns with Navbar");

  // Blog Listing section container
  assert.match(blogPage, /<section[^>]*className="[^"]*px-6[^"]*"/, "Blog section must use px-6 padding matching Navbar");
  assert.match(blogPage, /<div className="max-w-7xl mx-auto/, "Blog listing container must be max-w-7xl mx-auto");
  assert.doesNotMatch(blogPage, /xl:max-w-\[1440px\]/, "Blog listing must not blow out to oversized 1440px");
  assert.doesNotMatch(blogPage, /2xl:max-w-\[1536px\]/, "Blog listing must not blow out to oversized 1536px");
});

test("2. Blog layout maintains three-column desktop article cards with right sidebar", () => {
  const blogPagePath = path.join(FRONTEND_ROOT, "app/blog/page.js");
  const blogPage = fs.readFileSync(blogPagePath, "utf8");
  const gridPath = path.join(FRONTEND_ROOT, "components/blog/BlogGrid.jsx");
  const grid = fs.readFileSync(gridPath, "utf8");

  // Desktop grid layout with 1fr main column and 280px sidebar
  assert.match(blogPage, /xl:grid-cols-\[1fr_280px\]/, "Desktop page grid must use 1fr main column and 280px sidebar");

  // BlogGrid 3 columns on desktop
  assert.match(grid, /xl:grid-cols-3/, "Articles grid must maintain 3-column layout on desktop");

  // Card consistency
  assert.match(grid, /aspect-\[16\/10\]/, "Article images must maintain consistent 16:10 aspect ratio");
  assert.match(grid, /min-w-0/, "Cards must enforce min-w-0 to prevent flex/grid overflow");
  assert.match(grid, /h-full/, "Cards must maintain equal height via h-full");
});

test("3. Responsive layout adapts gracefully across tablet and mobile breakpoints", () => {
  const gridPath = path.join(FRONTEND_ROOT, "components/blog/BlogGrid.jsx");
  const grid = fs.readFileSync(gridPath, "utf8");
  const sidebarPath = path.join(FRONTEND_ROOT, "components/blog/BlogSidebar.jsx");
  const sidebar = fs.readFileSync(sidebarPath, "utf8");

  // Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
  assert.match(grid, /grid-cols-1\s+md:grid-cols-2\s+xl:grid-cols-3/, "Grid must scale: 1-col mobile, 2-col tablet, 3-col desktop");

  // Sidebar adapts: stacked on mobile, 2-column grid on tablet, vertical sticky on desktop
  assert.match(sidebar, /flex\s+flex-col\s+md:grid\s+md:grid-cols-2\s+xl:flex\s+xl:flex-col/, "Sidebar must reposition cleanly across mobile, tablet, and desktop");
  assert.match(sidebar, /xl:sticky\s+xl:top-28/, "Sidebar must be sticky on desktop");
  assert.match(sidebar, /md:col-span-2\s+xl:col-span-1/, "Newsletter must span 2 columns on tablet");
});

