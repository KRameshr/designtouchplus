import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const FOOTER_PATH = path.join(FRONTEND_ROOT, "components", "layout", "Footer.jsx");
const NAVBAR_PATH = path.join(FRONTEND_ROOT, "components", "layout", "Navbar.jsx");
const GLOBALS_PATH = path.join(FRONTEND_ROOT, "app", "globals.css");

test("Footer source exists and is readable", () => {
  assert.ok(fs.existsSync(FOOTER_PATH), "Footer.jsx must exist");
});

test("Footer container matches navbar max-width and horizontal alignment with zero rounded corners and no outer border", () => {
  const footerContent = fs.readFileSync(FOOTER_PATH, "utf8");
  const navbarContent = fs.readFileSync(NAVBAR_PATH, "utf8");

  // Navbar uses max-w-7xl mx-auto px-6
  assert.match(navbarContent, /max-w-7xl\s+mx-auto\s+px-6/, "Navbar must use max-w-7xl mx-auto px-6");

  // Footer must match the exact same container convention
  assert.match(footerContent, /max-w-7xl\s+mx-auto\s+px-6/, "Footer content container must use max-w-7xl mx-auto px-6");

  // Footer background is consistent with website dark background
  assert.match(footerContent, /bg-\[#080808\]/, "Footer page background must be #080808");

  // No rounded corners on footer wrapper or card
  assert.doesNotMatch(footerContent, /rounded-2xl\s+sm:rounded-3xl/, "Footer wrapper must NOT have rounded-2xl or rounded-3xl");

  // No outer card border wrapping around footer
  assert.doesNotMatch(footerContent, /bg-\[#0d0d0d\]\s+border\s+border-white\/\[0\.08\]/, "Footer must NOT have a boxed card border wrapping the content");
});

test("Footer branding preserves DesignTouch+ logo, exact description, and sharp square social icons", () => {
  const content = fs.readFileSync(FOOTER_PATH, "utf8");

  // Logo preservation: official brand logo asset
  assert.match(
    content,
    /\/assets\/logos\/design-touch-logo\.png|DE<span className="text-brand-red">S<\/span>IGN/,
    "Must render official DesignTouch+ logo"
  );

  // Exact description text
  assert.match(
    content,
    /A creative studio for visual storytelling, brand films, and\s+high-impact content\./,
    "Must include exact description text"
  );

  // Dynamic social links powered by Contact CMS API
  assert.match(content, /parseSocialLinks/, "Must parse social links from CMS data");
  assert.match(content, /activeSocialLinks/, "Must filter active enabled social links");
  assert.match(content, /getSocialPlatformIcon/, "Must dynamically retrieve platform icons");
  assert.match(content, /validateSocialUrl/, "Must validate social URLs");
  assert.match(content, /DEFAULT_SOCIAL_LINKS/, "Must import canonical DEFAULT_SOCIAL_LINKS");

  // Square social icon containers with border-radius 0px (rounded-none), #111111 bg, thin border
  assert.match(content, /rounded-none/, "Social icon containers must have rounded-none (border-radius 0px)");
  assert.match(content, /bg-\[#111111\]/, "Social icon containers must have subtle dark background #111111");
  assert.match(content, /border\s+border-white\/10/, "Social icon containers must have subtle border");
  assert.match(content, /hover:border-\[#F04444\]/, "Social icons must have restrained red hover accent");
  assert.match(content, /hover:border-brand-green/, "Social icons must have restrained green hover accent");
});

test("Footer Quick Links section has all 7 required navigation links", () => {
  const content = fs.readFileSync(FOOTER_PATH, "utf8");

  const expectedQuickLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Pricing", path: "/pricing" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  for (const link of expectedQuickLinks) {
    assert.ok(
      content.includes(`name: "${link.name}", path: "${link.path}"`),
      `Quick Links must include ${link.name} -> ${link.path}`
    );
  }
});

test("Footer Our Services section has all 6 required service links to valid routes", () => {
  const content = fs.readFileSync(FOOTER_PATH, "utf8");

  const expectedServices = [
    { name: "Video Editing", path: "/services/video-editing" },
    { name: "Motion Graphics", path: "/services/motion-graphics" },
    { name: "Content Creation", path: "/services/social-media-content" },
    { name: "Brand Films", path: "/services/commercial-ads" },
    { name: "Thumbnail Design", path: "/services/thumbnail-design" },
    { name: "YouTube Content", path: "/services/youtube-management" },
  ];

  for (const svc of expectedServices) {
    assert.ok(
      content.includes(`name: "${svc.name}", path: "${svc.path}"`),
      `Our Services must include ${svc.name} -> ${svc.path}`
    );
  }
});

test("Footer Newsletter section implements aligned horizontal form, border-radius 0px, #111111 bg, #F04444 button, and API integration", () => {
  const content = fs.readFileSync(FOOTER_PATH, "utf8");

  // Heading and description
  assert.match(content, /Stay in the Loop/, "Newsletter heading must be 'Stay in the Loop'");
  assert.match(
    content,
    /Get the latest tips, updates, and creative insights from\s+DesignTouch\+\./,
    "Newsletter description must match specification"
  );

  // Aligned horizontal form with border-radius 0px and #111111 background
  assert.match(content, /bg-\[#111111\]/, "Newsletter form must have #111111 subtle dark background");
  assert.match(content, /rounded-none/, "Newsletter form must have rounded-none (border-radius 0px)");
  assert.match(content, /focus-within:border-\[#F04444\]/, "Newsletter form must have clear sharp rectangular focus state");

  // Submit button with #F04444 brand red
  assert.match(content, /bg-\[#F04444\]/, "Submit button must use brand red #F04444");
  assert.match(content, /ArrowRight/, "Submit button must use ArrowRight icon");

  // API integration and feedback states
  assert.match(content, /subscribeToNewsletter/, "Must preserve subscribeToNewsletter API call");
  assert.match(content, /Confirmation email sent/, "Must preserve success confirmation feedback");
  assert.match(content, /Already Subscribed/, "Must preserve duplicate email feedback");
});

test("Autofill styling in globals.css maintains dark theme aesthetics", () => {
  const globalsContent = fs.readFileSync(GLOBALS_PATH, "utf8");
  assert.match(globalsContent, /-webkit-autofill/, "globals.css must have clean -webkit-autofill rule");
  assert.match(globalsContent, /#111111/, "globals.css must set autofill dark background");
});

test("Footer bottom copyright section displays 2025 copyright, legal links, and Cookies Settings modal", () => {
  const content = fs.readFileSync(FOOTER_PATH, "utf8");

  // Copyright text
  assert.match(content, /© 2025 DesignTouch\+\. All rights reserved\./, "Copyright text must match specification");

  // Legal routes
  assert.match(content, /href="\/privacy(-policy)?"/, "Must link to privacy policy");
  assert.match(content, /href="\/terms(-and-conditions)?"/, "Must link to terms of service");

  // Cookies Settings
  assert.match(content, /Cookies Settings/, "Must have Cookies Settings button");
  assert.match(content, /showCookieModal/, "Must have interactive cookies modal state");
  assert.match(content, /role="dialog"/, "Cookies modal must be accessible with role='dialog'");
});

test("Footer desktop layout uses 12-column grid with proper proportions", () => {
  const content = fs.readFileSync(FOOTER_PATH, "utf8");

  // 12-column grid
  assert.match(content, /lg:grid-cols-12/, "Desktop grid must use 12 columns");
  assert.match(content, /lg:col-span-4/, "Branding section must span 4 columns on desktop");
  assert.match(content, /lg:col-span-2/, "Quick Links section must span 2 columns on desktop");
  assert.match(content, /lg:col-span-3/, "Our Services section must span 3 columns on desktop");
});
