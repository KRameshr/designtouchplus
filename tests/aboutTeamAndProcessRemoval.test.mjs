import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const ABOUT_PAGE_PATH = path.join(FRONTEND_ROOT, "app", "about", "page.js");
const TEAM_GRID_PATH = path.join(FRONTEND_ROOT, "components", "about", "TeamGrid.jsx");

test("1. Our Process section is completely removed from public About page", () => {
  assert.ok(fs.existsSync(ABOUT_PAGE_PATH), "About page must exist");
  const aboutPageContent = fs.readFileSync(ABOUT_PAGE_PATH, "utf8");

  // No ProcessTimeline import or component rendering
  assert.doesNotMatch(aboutPageContent, /ProcessTimeline/, "About page must NOT import or render ProcessTimeline");
  assert.doesNotMatch(aboutPageContent, /getProcessSteps/, "About page must NOT fetch processSteps");

  // Flow transitions directly from ValuesGrid to TeamGrid without empty gaps
  assert.match(aboutPageContent, /<ValuesGrid[\s\S]*?<TeamGrid/, "ValuesGrid must flow directly into TeamGrid");
});

test("2. TeamGrid renders 'The Team' eyebrow label and 'The Creative Minds Behind DesignTouch+' heading", () => {
  assert.ok(fs.existsSync(TEAM_GRID_PATH), "TeamGrid.jsx must exist");
  const teamContent = fs.readFileSync(TEAM_GRID_PATH, "utf8");

  // Eyebrow label: "The Team" with red accent
  assert.match(teamContent, /The Team/, "Must display 'The Team' eyebrow label");
  assert.match(teamContent, /bg-brand-red/, "Eyebrow must feature red accent");

  // Main heading: "The Creative Minds Behind DesignTouch+"
  assert.match(
    teamContent,
    /The Creative Minds Behind[\s\S]*?Design[\s\S]*?Touch\+/,
    "Heading must be 'The Creative Minds Behind DesignTouch+'"
  );
});

test("3. TeamGrid implements clean 3-column desktop layout with generous spacing and deep black background", () => {
  const teamContent = fs.readFileSync(TEAM_GRID_PATH, "utf8");

  // 3-column desktop, 2-column tablet, 1-column mobile
  assert.match(
    teamContent,
    /grid-cols-1\s+sm:grid-cols-2\s+lg:grid-cols-3/,
    "Must be 1 col on mobile, 2 col on tablet, 3 col on desktop"
  );

  // Generous spacing
  assert.match(teamContent, /gap(?:-x)?-8\s+sm:gap(?:-x)?-10\s+lg:gap(?:-x)?-12/, "Must use generous column/row gap");

  // Deep black background
  assert.match(teamContent, /bg-\[#080808\]/, "Must have deep black background #080808");
});

test("4. TeamGrid uses large square portrait images with grayscale styling and clean neutral fallback", () => {
  const teamContent = fs.readFileSync(TEAM_GRID_PATH, "utf8");

  // Square aspect ratio
  assert.match(teamContent, /aspect-square/, "Images must have 1:1 square aspect ratio");

  // Grayscale styling matching client reference
  assert.match(teamContent, /grayscale/, "Images must apply grayscale styling");

  // Clean neutral fallback avatar (User icon / avatar placeholder)
  assert.match(teamContent, /<User/, "Must render neutral avatar fallback when photo is missing");
  assert.match(teamContent, /onError/, "Must support graceful error fallback for broken image URLs");
});

test("5. Team details are placed immediately below image with name, role, and conditional email", () => {
  const teamContent = fs.readFileSync(TEAM_GRID_PATH, "utf8");

  // Name and role below image
  assert.match(teamContent, /member\.name/, "Must render member name below image");
  assert.match(teamContent, /member\.role/, "Must render member role below name");

  // Email rendered ONLY if genuine email exists
  assert.match(
    teamContent,
    /member\.email/,
    "Email must be evaluated before rendering"
  );
});

test("6. TeamGrid preserves actual DesignTouch+ team members as canonical fallback", () => {
  const teamContent = fs.readFileSync(TEAM_GRID_PATH, "utf8");

  // Actual DesignTouch+ team records
  assert.match(teamContent, /Rohit Sharma/, "Must contain Rohit Sharma");
  assert.match(teamContent, /Founder & Creative Director/, "Must contain Rohit Sharma's designation");
  assert.match(teamContent, /Arjun Verma/, "Must contain Arjun Verma");
  assert.match(teamContent, /Head of Video Production/, "Must contain Arjun Verma's designation");
  assert.match(teamContent, /Pooja Nair/, "Must contain Pooja Nair");
  assert.match(teamContent, /Motion Graphics Designer/, "Must contain Pooja Nair's designation");

  // Does NOT contain client sample placeholder names
  assert.doesNotMatch(teamContent, /Catherine Moore/, "Must NOT copy placeholder names");
  assert.doesNotMatch(teamContent, /Curtis Webb/, "Must NOT copy placeholder names");
  assert.doesNotMatch(teamContent, /Nick Ferguson/, "Must NOT copy placeholder names");
});

