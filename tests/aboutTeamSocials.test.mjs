import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const TEAM_GRID_PATH = path.join(FRONTEND_ROOT, "components", "about", "TeamGrid.jsx");
const TEAM_FORM_PATH = path.join(FRONTEND_ROOT, "components", "admin", "TeamMemberForm.jsx");

test("1. isValidSocialUrl and getSafeSocialHref helper logic validates social links safely", async () => {
  const { isValidSocialUrl, getSafeSocialHref } = await import(
    "../lib/socialUtils.js"
  );

  // Valid LinkedIn
  assert.equal(isValidSocialUrl("https://www.linkedin.com/in/rohit-sharma", "linkedin"), true);
  assert.equal(isValidSocialUrl("https://linkedin.com/in/arjun-verma", "linkedin"), true);
  assert.equal(isValidSocialUrl("http://linkedin.com/in/pooja-nair", "linkedin"), true);
  assert.equal(isValidSocialUrl("linkedin.com/in/rohit", "linkedin"), true);

  // Invalid LinkedIn
  assert.equal(isValidSocialUrl("", "linkedin"), false);
  assert.equal(isValidSocialUrl(null, "linkedin"), false);
  assert.equal(isValidSocialUrl("#", "linkedin"), false);
  assert.equal(isValidSocialUrl("javascript:alert('xss')", "linkedin"), false);
  assert.equal(isValidSocialUrl("data:text/html,<script>alert(1)</script>", "linkedin"), false);
  assert.equal(isValidSocialUrl("https://instagram.com/user", "linkedin"), false);

  // Valid Instagram
  assert.equal(isValidSocialUrl("https://www.instagram.com/rohitsharma", "instagram"), true);
  assert.equal(isValidSocialUrl("https://instagram.com/arjunverma", "instagram"), true);
  assert.equal(isValidSocialUrl("instagram.com/poojanair", "instagram"), true);

  // Invalid Instagram
  assert.equal(isValidSocialUrl("", "instagram"), false);
  assert.equal(isValidSocialUrl(null, "instagram"), false);
  assert.equal(isValidSocialUrl("#", "instagram"), false);
  assert.equal(isValidSocialUrl("javascript:void(0)", "instagram"), false);
  assert.equal(isValidSocialUrl("https://linkedin.com/in/user", "instagram"), false);

  // getSafeSocialHref
  assert.equal(getSafeSocialHref("linkedin.com/in/user"), "https://linkedin.com/in/user");
  assert.equal(getSafeSocialHref("https://instagram.com/user"), "https://instagram.com/user");
  assert.equal(getSafeSocialHref(""), "");
});

test("2. TeamGrid implements subtle LinkedIn and Instagram icons with brand hover and accessibility", () => {
  const content = fs.readFileSync(TEAM_GRID_PATH, "utf8");

  // Lucide icons imported
  assert.match(content, /import\s*\{[^}]*Linkedin[^}]*Instagram[^}]*\}\s*from\s*"lucide-react"/);

  // Accessible labels and security attributes
  assert.match(content, /aria-label=.*LinkedIn profile/);
  assert.match(content, /aria-label=.*Instagram profile/);
  assert.match(content, /target="_blank"/);
  assert.match(content, /rel="noopener noreferrer"/);

  // Brand hover colors
  assert.match(content, /hover:text-brand-red/, "LinkedIn should hover to brand-red");
  assert.match(content, /hover:text-brand-green/, "Instagram should hover to brand-green");

  // Social container only rendered when at least one valid URL exists
  assert.match(content, /hasSocialLinks &&/);
  assert.match(content, /hasLinkedIn &&/);
  assert.match(content, /hasInstagram &&/);
});

test("3. TeamMemberForm validates LinkedIn and Instagram URLs and allows independent updates and clearing", () => {
  const content = fs.readFileSync(TEAM_FORM_PATH, "utf8");

  // Form input fields for LinkedIn and Instagram
  assert.match(content, /name="linkedinUrl"/);
  assert.match(content, /name="instagramUrl"/);

  // URL validation check
  assert.match(content, /validateSocialUrl/);
  assert.match(content, /linkedin\.com/);
  assert.match(content, /instagram\.com/);

  // Normalized payload submission supporting clearing
  assert.match(content, /linkedinUrl:\s*rawLinkedin/);
  assert.match(content, /instagramUrl:\s*rawInstagram/);
});
