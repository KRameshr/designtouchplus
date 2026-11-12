import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("Blog and Contact hero components use the server-provided CMS content", () => {
  const blogHero = read("components/blog/BlogHero.jsx");
  const contactHero = read("components/contact/ContactHero.jsx");

  assert.doesNotMatch(blogHero, /getBlogPageContent/);
  assert.doesNotMatch(contactHero, /getContactPageContent/);
  assert.match(blogHero, /useState\(initialContent \|\| DEFAULT_CONTENT\)/);
  assert.match(contactHero, /useState\(initialContent \|\| DEFAULT_CONTENT\)/);
});

test("Blog initial suggestions reuse page and popular results instead of fetching 50 posts", () => {
  const page = read("app/blog/page.js");
  const searchBar = read("components/blog/BlogSearchBar.jsx");

  assert.doesNotMatch(page, /getBlogPosts\(\{\s*size:\s*50\s*\}\)/);
  assert.match(page, /postsPage\?\.content/);
  assert.match(page, /popularPosts/);
  assert.match(searchBar, /searchBlogPosts\(trimmed/);
  assert.match(searchBar, /size:\s*8/);
});

test("primary page routes expose branded loading boundaries", () => {
  for (const file of [
    "app/loading.js",
    "app/about/loading.js",
    "app/portfolio/loading.js",
    "app/blog/loading.js",
    "app/contact/loading.js",
  ]) {
    assert.match(read(file), /RouteLoading/);
  }

  const loading = read("components/ui/RouteLoading.js");
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /role="status"/);
  assert.match(loading, /bg-\[#080808\]/);
});

test("primary navigation does not eagerly prefetch all dynamic pages", () => {
  const navbar = read("components/layout/Navbar.jsx");
  assert.equal((navbar.match(/prefetch=\{false\}/g) || []).length, 4);

  for (const file of [
    "components/blog/BlogGrid.jsx",
    "components/blog/BlogSidebar.jsx",
    "components/blog/RelatedPosts.jsx",
    "components/blog/BlogSearchBar.jsx",
  ]) {
    assert.match(read(file), /href=\{`\/blog\/\$\{post\.slug\}`\}[\s\S]*?prefetch=\{false\}/, file);
  }
});

test("public CMS reads use bounded revalidation without caching sensitive reads", () => {
  const api = read("lib/api.js");

  for (const expression of [
    /getTeam\s*=.*revalidate:\s*300/s,
    /getClients\s*=.*revalidate:\s*300/s,
    /getTestimonials\s*=.*revalidate:\s*300/s,
    /getFeaturedPortfolio[\s\S]*?revalidate:\s*60/,
    /getPortfolioPageContent[\s\S]*?revalidate:\s*60/,
    /getHeroContent[\s\S]*?revalidate:\s*60/,
    /getBlogPageContent[\s\S]*?revalidate:\s*60/,
    /getContactPageContent[\s\S]*?revalidate:\s*60/,
  ]) {
    assert.match(api, expression);
  }

  assert.match(api, /getBlogPostBySlug[\s\S]*?cache:\s*"no-store"/);
  assert.match(api, /submitContactMessage[\s\S]*?cache:\s*"no-store"/);
  assert.match(api, /subscribeToNewsletter[\s\S]*?cache:\s*"no-store"/);
  assert.match(api, /all\s*\?\s*\{\s*cache:\s*"no-store"\s*\}/);
});

test("CMS pages stay request-rendered while individual public fetches can revalidate", () => {
  for (const file of [
    "app/page.js",
    "app/about/page.js",
    "app/portfolio/page.js",
    "app/contact/page.js",
  ]) {
    const page = read(file);
    assert.match(page, /await connection\(\)/, file);
    assert.doesNotMatch(page, /export const (dynamic|fetchCache|revalidate)\s*=/, file);
  }
});
