import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  REFERENCE_SERVICES,
  normalizeServicesList,
  findServiceBySlug,
} from "../lib/servicesData.js";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

test("1. lib/servicesData.js is a server-safe module without 'use client'", () => {
  const filePath = path.join(FRONTEND_ROOT, "lib/servicesData.js");
  const content = fs.readFileSync(filePath, "utf8");

  assert.doesNotMatch(
    content,
    /["']use client["']/,
    "lib/servicesData.js must NOT have 'use client' boundary"
  );
  assert.ok(Array.isArray(REFERENCE_SERVICES), "REFERENCE_SERVICES must be an array");
  assert.equal(REFERENCE_SERVICES.length, 8, "Must contain all 8 canonical reference services");
});

test("2. app/services/[slug]/page.js remains a Server Component and imports from server-safe servicesData", () => {
  const pagePath = path.join(FRONTEND_ROOT, "app/services/[slug]/page.js");
  const content = fs.readFileSync(pagePath, "utf8");

  assert.doesNotMatch(
    content,
    /["']use client["']/,
    "app/services/[slug]/page.js must remain a Server Component"
  );
  assert.match(
    content,
    /from ["']@\/lib\/servicesData["']/,
    "Must import from @/lib/servicesData, avoiding client boundary proxies"
  );
  assert.doesNotMatch(
    content,
    /from ["']@\/components\/services\/ServicesGrid["']/,
    "Must NOT import services data from client-boundary ServicesGrid"
  );
  assert.match(
    content,
    /findServiceBySlug/,
    "Uses findServiceBySlug helper"
  );
  assert.match(
    content,
    /notFound\(\)/,
    "Preserves 404 notFound() invocation for unresolvable service slugs"
  );
  assert.match(
    content,
    /export async function generateMetadata/,
    "Preserves SEO generateMetadata export"
  );
});

test("3. All six Footer service routes resolve to valid service records with complete content", () => {
  const footerServices = [
    { label: "Video Editing", slug: "video-editing", expectedTitle: "Video Editing" },
    { label: "Motion Graphics", slug: "motion-graphics", expectedTitle: "Motion Graphics" },
    { label: "Content Creation", slug: "social-media-content", expectedTitle: "Social Media Content" },
    { label: "Brand Films", slug: "commercial-ads", expectedTitle: "Commercial & Ads" },
    { label: "Thumbnail Design", slug: "thumbnail-design", expectedTitle: "Thumbnail Design" },
    { label: "YouTube Content", slug: "youtube-management", expectedTitle: "YouTube Management" },
  ];

  for (const item of footerServices) {
    const service = findServiceBySlug(REFERENCE_SERVICES, item.slug);
    assert.ok(service, `Service '${item.label}' (${item.slug}) must resolve`);
    assert.equal(service.title, item.expectedTitle, `Title must match expected for ${item.slug}`);
    assert.ok(service.description, `Must have description for ${item.slug}`);
    assert.ok(service.fullDescription, `Must have fullDescription for ${item.slug}`);
    assert.ok(Array.isArray(service.features) && service.features.length >= 4, `Must have features list for ${item.slug}`);
    assert.ok(service.iconType, `Must have iconType for ${item.slug}`);
    assert.ok(service.colorTheme, `Must have colorTheme for ${item.slug}`);
    assert.ok(service.orderNumber, `Must have orderNumber for ${item.slug}`);
  }
});

test("4. Service slug resolution supports aliases, case-insensitivity, and URL-decoded slugs", () => {
  // Alias resolution for marketing/footer terminology variants
  const contentCreation = findServiceBySlug(REFERENCE_SERVICES, "content-creation");
  assert.ok(contentCreation, "content-creation alias must resolve");
  assert.equal(contentCreation.title, "Social Media Content");

  const brandFilms = findServiceBySlug(REFERENCE_SERVICES, "brand-films");
  assert.ok(brandFilms, "brand-films alias must resolve");
  assert.equal(brandFilms.title, "Commercial & Ads");

  const youtubeContent = findServiceBySlug(REFERENCE_SERVICES, "youtube-content");
  assert.ok(youtubeContent, "youtube-content alias must resolve");
  assert.equal(youtubeContent.title, "YouTube Management");

  // Case-insensitivity
  assert.equal(findServiceBySlug(REFERENCE_SERVICES, "VIDEO-EDITING")?.title, "Video Editing");
  assert.equal(findServiceBySlug(REFERENCE_SERVICES, "Motion-Graphics")?.title, "Motion Graphics");
  assert.equal(findServiceBySlug(REFERENCE_SERVICES, "  thumbnail-design  ")?.title, "Thumbnail Design");

  // Encoded slugs
  assert.equal(findServiceBySlug(REFERENCE_SERVICES, "video%2Dediting")?.title, "Video Editing");
});

test("5. Invalid and empty slugs safely return null", () => {
  assert.equal(findServiceBySlug(REFERENCE_SERVICES, "invalid-slug-12345"), null);
  assert.equal(findServiceBySlug(REFERENCE_SERVICES, "unknown-service"), null);
  assert.equal(findServiceBySlug(REFERENCE_SERVICES, ""), null);
  assert.equal(findServiceBySlug(REFERENCE_SERVICES, "   "), null);
  assert.equal(findServiceBySlug(REFERENCE_SERVICES, null), null);
  assert.equal(findServiceBySlug(REFERENCE_SERVICES, undefined), null);
  assert.equal(findServiceBySlug([], "video-editing"), null);
  assert.equal(findServiceBySlug(null, "video-editing"), null);
});

test("6. normalizeServicesList formats custom backend services into serializable objects", () => {
  const custom = [
    {
      id: "srv-custom-1",
      title: "Drone Videography",
      description: "Aerial 4K cinematic video capture.",
      features: ["4K Drone", "FPV Drone", "Permits & Licenses"],
      colorTheme: "cyan",
      isActive: true,
    },
    {
      id: "srv-custom-2",
      title: "Inactive Service",
      description: "Should be filtered out.",
      isActive: false,
    },
  ];

  const normalized = normalizeServicesList(custom);
  assert.equal(normalized.length, 1, "Only active services should be kept");
  assert.equal(normalized[0].title, "Drone Videography");
  assert.equal(normalized[0].slug, "drone-videography");
  assert.equal(normalized[0].ctaUrl, "/services/drone-videography");

  // Finding from custom normalized list
  const found = findServiceBySlug(normalized, "drone-videography");
  assert.ok(found, "Custom normalized service must be findable");
  assert.equal(found.title, "Drone Videography");
});

test("7. Footer.jsx service links point to valid registered routes", () => {
  const footerPath = path.join(FRONTEND_ROOT, "components/layout/Footer.jsx");
  const content = fs.readFileSync(footerPath, "utf8");

  const requiredRoutes = [
    "/services/video-editing",
    "/services/motion-graphics",
    "/services/social-media-content",
    "/services/commercial-ads",
    "/services/thumbnail-design",
    "/services/youtube-management",
  ];

  for (const route of requiredRoutes) {
    assert.match(content, new RegExp(route), `Footer must link to ${route}`);
  }
});

test("8. Service Detail page enforces sharp 0px border-radius and refined visual hierarchy", () => {
  const pagePath = path.join(FRONTEND_ROOT, "app/services/[slug]/page.js");
  const content = fs.readFileSync(pagePath, "utf8");

  // No rounded corners on container, deliverables, or buttons
  assert.doesNotMatch(content, /rounded-\[16px\]/, "Main article container must NOT have rounded-[16px]");
  assert.doesNotMatch(content, /rounded-\[10px\]/, "Deliverables list items must NOT have rounded-[10px]");
  assert.doesNotMatch(content, /rounded-\[8px\]/, "Action buttons must NOT have rounded-[8px]");

  // Sharp rectangular styling (rounded-none)
  assert.match(content, /article[^>]*rounded-none/, "Main article container uses rounded-none");
  assert.match(content, /border-t-brand-red|bg-brand-red/, "Contains brand red accent indicators");
  assert.match(content, /grid-cols-1\s+md:grid-cols-2/, "Deliverables grid uses clean 2-column desktop layout");
  assert.match(content, /border-white\/\[0\.08\]/, "Uses subtle low-contrast separators");
  assert.match(content, /flex-col\s+sm:flex-row/, "Action buttons are responsive and stacked on mobile");
  assert.match(content, /bg-brand-red[\s\S]*?rounded-none/, "Primary CTA button uses rounded-none");
});

