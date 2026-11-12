import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) =>
  fs.readFileSync(path.join(FRONTEND_ROOT, relativePath), "utf8");

test("Services routes do not force dynamic rendering or disable public fetch caching", () => {
  for (const route of ["app/services/page.js", "app/services/[slug]/page.js"]) {
    const source = read(route);
    assert.doesNotMatch(source, /export const dynamic\s*=\s*["']force-dynamic["']/);
    assert.doesNotMatch(source, /export const revalidate\s*=\s*0\s*;/);
    assert.doesNotMatch(source, /export const fetchCache\s*=\s*["']force-no-store["']/);
  }
});

test("public Services API fetches retain their designated TTLs", () => {
  const api = read("lib/api.js");
  assert.match(api, /getServices\s*=\s*\(\)\s*=>\s*apiFetch\(["']\/api\/services["'],\s*\{\s*revalidate:\s*300\s*\}\)/);
  assert.match(api, /getServiceBySlug\s*=\s*\(slug\)\s*=>\s*apiFetch\(`\/api\/services\/\$\{encodeURIComponent\(slug\)\}`,[\s\S]*?revalidate:\s*300/);
  assert.match(api, /getServicesPageContent\s*=\s*\(\)\s*=>\s*apiFetch\(["']\/api\/services-page["'],\s*\{\s*revalidate:\s*60\s*\}\)/);
  assert.match(api, /getServicesHeroBanners\s*=\s*\(\)\s*=>\s*apiFetch\(["']\/api\/services-page\/banners["'],\s*\{\s*revalidate:\s*60\s*\}\)/);
  assert.match(api, /getProcessSteps\s*=\s*\(pageType\)\s*=>\s*apiFetch\(`\/api\/process-steps\?pageType=\$\{pageType\}`\)/);
  assert.match(api, /getTools\s*=\s*\(\)\s*=>\s*apiFetch\(["']\/api\/tools["']\)/);
});

test("ServicesHero keeps its client-side initial, focus, and visibility refresh", () => {
  const hero = read("components/services/ServicesHero.jsx");
  assert.match(hero, /fetchLatest\(\);/);
  assert.match(hero, /window\.addEventListener\(["']focus["'],\s*fetchLatest\)/);
  assert.match(hero, /document\.addEventListener\(["']visibilitychange["']/);
});

test("admin and write requests remain uncached", () => {
  const auth = read("lib/auth.js");
  assert.match(auth, /export async function adminFetch[\s\S]*?cache:\s*["']no-store["']/);

  const api = read("lib/api.js");
  for (const request of [
    /submitContactMessage[\s\S]*?cache:\s*["']no-store["']/,
    /subscribeToNewsletter[\s\S]*?cache:\s*["']no-store["']/,
    /createChatLead[\s\S]*?cache:\s*["']no-store["']/,
    /createChatConversation[\s\S]*?cache:\s*["']no-store["']/,
    /sendChatMessage[\s\S]*?cache:\s*["']no-store["']/,
    /sendChatMessageStream[\s\S]*?cache:\s*["']no-store["']/,
  ]) {
    assert.match(api, request);
  }
});
