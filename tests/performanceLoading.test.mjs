import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("shared layout does not block every route on CMS fetches", () => {
  const layout = read("app/layout.js");
  assert.doesNotMatch(layout, /getCompanyInfo|getContactPageContent/);
  assert.match(layout, /<Footer\s*\/>/);
});

test("home hero preserves autoplay while limiting speculative video preload", () => {
  const hero = read("components/home/Hero.jsx");
  assert.match(hero, /autoPlay[\s\S]*?muted[\s\S]*?preload="metadata"/);
});

test("measured hero image LCP candidates are eager, high priority, and responsive", () => {
  for (const file of [
    "components/about/AboutHero.jsx",
    "components/blog/BlogHero.jsx",
    "components/contact/ContactHero.jsx",
  ]) {
    const source = read(file);
    assert.match(source, /cloudinaryResponsiveImageProps\(bannerUrl[\s\S]*?sizes: "100vw"/i, file);
    assert.match(source, /fetchPriority="high"[\s\S]*?loading="eager"|loading="eager"[\s\S]*?fetchPriority="high"/, file);
    assert.doesNotMatch(source, /loading="lazy"/, `${file} must not lazy-load its hero LCP image`);
  }

  const portfolio = read("components/portfolio/PortfolioHero.jsx");
  assert.match(portfolio, /cloudinaryResponsiveImageProps\(activePoster[\s\S]*?loading="eager"[\s\S]*?fetchPriority="high"/);
});

test("portfolio preview videos keep posters and defer video transfer until play", () => {
  const home = read("components/home/FeaturedProjects.jsx");
  const portfolio = read("components/portfolio/PortfolioGrid.jsx");
  assert.match(home, /poster=\{mediaSrc[\s\S]*?preload="none"/);
  assert.match(portfolio, /poster=\{cloudinaryImageUrl\(mediaSrc, 960\) \|\| mediaSrc \|\| undefined\}[\s\S]*?preload="none"/);
  assert.doesNotMatch(home, /<video[\s\S]*?autoPlay/);
  assert.doesNotMatch(portfolio, /<video[\s\S]*?autoPlay/);
});

test("about story video waits until its poster-backed section nears the viewport", () => {
  const story = read("components/about/OurStory.jsx");
  assert.match(story, /new IntersectionObserver/);
  assert.match(story, /rootMargin:\s*"300px 0px"/);
  assert.match(story, /src=\{shouldLoadVideo \? videoSrc : undefined\}/);
  assert.match(story, /poster=\{cloudinaryImageUrl\(posterImage, 1280\) \|\| posterImage\}[\s\S]*?preload=\{shouldLoadVideo \? "metadata" : "none"\}/);
});

test("below-the-fold content images use native lazy loading and async decode", () => {
  for (const file of [
    "components/home/TrustedClients.jsx",
    "components/portfolio/ThumbnailGrid.jsx",
    "components/blog/BlogGrid.jsx",
    "components/blog/RelatedPosts.jsx",
  ]) {
    assert.match(read(file), /loading="lazy"[\s\S]*?decoding="async"/, file);
  }
});

test("public assets have bounded browser caching while hashed Next assets remain immutable", () => {
  const headers = read("public/_headers");
  assert.match(headers, /\/_next\/static\/\*[\s\S]*?max-age=31536000,immutable/);
  assert.match(headers, /\/hero-demo\.mp4[\s\S]*?max-age=86400,stale-while-revalidate=604800/);
  assert.match(headers, /\/assets\/\*[\s\S]*?max-age=86400,stale-while-revalidate=604800/);
});
