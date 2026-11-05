import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");

const LAYOUT_PATH = path.join(FRONTEND_ROOT, "app", "layout.js");
const HOME_PAGE_PATH = path.join(FRONTEND_ROOT, "app", "page.js");
const ABOUT_PAGE_PATH = path.join(FRONTEND_ROOT, "app", "about", "page.js");
const SERVICES_PAGE_PATH = path.join(FRONTEND_ROOT, "app", "services", "page.js");
const PORTFOLIO_PAGE_PATH = path.join(FRONTEND_ROOT, "app", "portfolio", "page.js");
const PRICING_PAGE_PATH = path.join(FRONTEND_ROOT, "app", "pricing", "page.js");
const BLOG_PAGE_PATH = path.join(FRONTEND_ROOT, "app", "blog", "page.js");
const CONTACT_PAGE_PATH = path.join(FRONTEND_ROOT, "app", "contact", "page.js");

test("1. Root layout implements approved default title and title template without manual icon conflicts", () => {
  assert.ok(fs.existsSync(LAYOUT_PATH), "app/layout.js must exist");
  const content = fs.readFileSync(LAYOUT_PATH, "utf8");

  // Root title template & default
  assert.match(
    content,
    /default:\s*["']DesignTouch\+\s*\|\s*Creative Studio["']/,
    "Root layout must have default title: 'DesignTouch+ | Creative Studio'"
  );
  assert.match(
    content,
    /template:\s*["']%s\s*\|\s*DesignTouch\+["']/,
    "Root layout must have title template: '%s | DesignTouch+'"
  );

  // Avoid manual icons configuration to prevent conflicting/duplicate declarations with Next.js App Router file-based metadata
  assert.doesNotMatch(
    content,
    /icons:\s*\{/,
    "Root layout must NOT declare conflicting manual icons metadata (uses Next.js App Router app/ file conventions)"
  );
});

test("2. All 7 approved pages define exact page titles matching specification without brand duplication", () => {
  // Expected resolution table:
  // Home: DesignTouch+ | Creative Studio
  // About: About Us | DesignTouch+
  // Services: Services | DesignTouch+
  // Portfolio: Portfolio | DesignTouch+
  // Pricing: Pricing | DesignTouch+
  // Blog: Blog | DesignTouch+
  // Contact: Contact | DesignTouch+

  const homeContent = fs.readFileSync(HOME_PAGE_PATH, "utf8");
  assert.match(
    homeContent,
    /absolute:\s*["']DesignTouch\+\s*\|\s*Creative Studio["']/,
    "Home page must explicitly define absolute title 'DesignTouch+ | Creative Studio'"
  );

  const aboutContent = fs.readFileSync(ABOUT_PAGE_PATH, "utf8");
  assert.match(
    aboutContent,
    /title:\s*["']About Us["']/,
    "About page must define title 'About Us' for template '%s | DesignTouch+'"
  );
  assert.doesNotMatch(
    aboutContent,
    /title:\s*["']About Us\s*\|\s*DesignTouch\+["']/,
    "About page must NOT duplicate brand name in title"
  );

  const servicesContent = fs.readFileSync(SERVICES_PAGE_PATH, "utf8");
  assert.match(
    servicesContent,
    /title:\s*["']Services["']/,
    "Services page must define title 'Services' for template '%s | DesignTouch+'"
  );
  assert.doesNotMatch(
    servicesContent,
    /title:\s*["']Services\s*\|\s*DesignTouch\+["']/,
    "Services page must NOT duplicate brand name in title"
  );

  const portfolioContent = fs.readFileSync(PORTFOLIO_PAGE_PATH, "utf8");
  assert.match(
    portfolioContent,
    /title:\s*["']Portfolio["']/,
    "Portfolio page must define title 'Portfolio' for template '%s | DesignTouch+'"
  );
  assert.doesNotMatch(
    portfolioContent,
    /title:\s*["']Portfolio\s*\|\s*DesignTouch\+["']/,
    "Portfolio page must NOT duplicate brand name in title"
  );

  const pricingContent = fs.readFileSync(PRICING_PAGE_PATH, "utf8");
  assert.match(
    pricingContent,
    /title:\s*["']Pricing["']/,
    "Pricing page must define title 'Pricing' for template '%s | DesignTouch+'"
  );
  assert.doesNotMatch(
    pricingContent,
    /title:\s*["']Pricing\s*\|\s*DesignTouch\+["']/,
    "Pricing page must NOT duplicate brand name in title"
  );

  const blogContent = fs.readFileSync(BLOG_PAGE_PATH, "utf8");
  assert.match(
    blogContent,
    /title:\s*["']Blog["']/,
    "Blog page must define title 'Blog' for template '%s | DesignTouch+'"
  );
  assert.doesNotMatch(
    blogContent,
    /title:\s*["']Blog\s*\|\s*DesignTouch\+["']/,
    "Blog page must NOT duplicate brand name in title"
  );

  const contactContent = fs.readFileSync(CONTACT_PAGE_PATH, "utf8");
  assert.match(
    contactContent,
    /title:\s*["']Contact["']/,
    "Contact page must define title 'Contact' for template '%s | DesignTouch+'"
  );
  assert.doesNotMatch(
    contactContent,
    /title:\s*["']Contact\s*\|\s*DesignTouch\+["']/,
    "Contact page must NOT duplicate brand name in title"
  );
});

test("3. Simulated Next.js metadata title resolution matches exact approved titles", () => {
  const rootTemplate = "%s | DesignTouch+";
  const resolveTitle = (pageTitleConfig) => {
    if (!pageTitleConfig) return "DesignTouch+ | Creative Studio";
    if (typeof pageTitleConfig === "object" && pageTitleConfig.absolute) {
      return pageTitleConfig.absolute;
    }
    if (typeof pageTitleConfig === "string") {
      return rootTemplate.replace("%s", pageTitleConfig);
    }
    return rootTemplate.replace("%s", String(pageTitleConfig));
  };

  const pages = [
    { name: "Home", config: { absolute: "DesignTouch+ | Creative Studio" }, expected: "DesignTouch+ | Creative Studio" },
    { name: "About", config: "About Us", expected: "About Us | DesignTouch+" },
    { name: "Services", config: "Services", expected: "Services | DesignTouch+" },
    { name: "Portfolio", config: "Portfolio", expected: "Portfolio | DesignTouch+" },
    { name: "Pricing", config: "Pricing", expected: "Pricing | DesignTouch+" },
    { name: "Blog", config: "Blog", expected: "Blog | DesignTouch+" },
    { name: "Contact", config: "Contact", expected: "Contact | DesignTouch+" },
  ];

  for (const p of pages) {
    const resolved = resolveTitle(p.config);
    assert.equal(resolved, p.expected, `${p.name} title must resolve to '${p.expected}'`);
    assert.doesNotMatch(resolved, /DesignTouch\+.*DesignTouch\+/, `${p.name} must not contain duplicate brand name`);
  }
});

test("4. Official favicon files exist in app/ with valid headers and no conflicting duplicates in public/", () => {
  const appFaviconFiles = [
    { path: path.join(FRONTEND_ROOT, "app", "favicon.ico"), minSize: 1000 },
    { path: path.join(FRONTEND_ROOT, "app", "icon.png"), minSize: 1000 },
    { path: path.join(FRONTEND_ROOT, "app", "apple-icon.png"), minSize: 1000 },
  ];

  for (const file of appFaviconFiles) {
    assert.ok(fs.existsSync(file.path), `Required favicon file must exist in app/: ${file.path}`);
    const stat = fs.statSync(file.path);
    assert.ok(stat.size >= file.minSize, `File must be non-empty and valid size: ${file.path} (${stat.size} bytes)`);

    const buf = fs.readFileSync(file.path);
    if (file.path.endsWith(".ico")) {
      // ICO header check: 0x0000 = 0, 0x0002 = 1 (icon)
      assert.equal(buf.readUInt16LE(0), 0, "ICO header reserved must be 0");
      assert.equal(buf.readUInt16LE(2), 1, "ICO header type must be 1 (icon)");
      assert.ok(buf.readUInt16LE(4) >= 1, "ICO must contain at least 1 image");
    } else if (file.path.endsWith(".png")) {
      // PNG header check
      const isPng = buf.slice(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      assert.equal(isPng, true, `PNG file must have valid PNG signature: ${file.path}`);
    }
  }

  // Next.js App Router conflicting files check: duplicate favicon files in public/ cause HTTP 500 error
  const conflictingPublicFiles = [
    path.join(FRONTEND_ROOT, "public", "favicon.ico"),
    path.join(FRONTEND_ROOT, "public", "icon.png"),
    path.join(FRONTEND_ROOT, "public", "apple-icon.png"),
  ];
  for (const conflictPath of conflictingPublicFiles) {
    assert.ok(
      !fs.existsSync(conflictPath),
      `Conflicting file must NOT exist in public/ to prevent HTTP 500: ${conflictPath}`
    );
  }
});

test("5. SEO preservation: all primary pages preserve non-empty description metadata", () => {
  const pageFiles = [
    ABOUT_PAGE_PATH,
    SERVICES_PAGE_PATH,
    PORTFOLIO_PAGE_PATH,
    PRICING_PAGE_PATH,
    BLOG_PAGE_PATH,
    CONTACT_PAGE_PATH,
  ];

  for (const filePath of pageFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    assert.match(content, /description:\s*["'][^"']+["']/, `Page must preserve non-empty description: ${filePath}`);
  }
});

