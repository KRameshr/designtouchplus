import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  SUPPORTED_SOCIAL_PLATFORMS,
  DEFAULT_SOCIAL_LINKS,
  parseSocialLinks,
  validateSocialUrl,
  getSocialPlatformIcon,
  isSameSocialPlatform,
} from "../lib/socialPlatforms.js";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

test("1. Social platform utilities support 7 required platforms including X (Twitter) with proper validation", () => {
  // 7 platforms: X (Twitter), Instagram, YouTube, LinkedIn, GitHub, Facebook, Behance
  const platformIds = SUPPORTED_SOCIAL_PLATFORMS.map((p) => p.platform);
  assert.deepEqual(platformIds, [
    "X (Twitter)",
    "Instagram",
    "YouTube",
    "LinkedIn",
    "GitHub",
    "Facebook",
    "Behance",
  ]);

  // Valid URLs
  assert.equal(validateSocialUrl("https://instagram.com/designtouchplus"), true);
  assert.equal(validateSocialUrl("http://youtube.com/@designtouchplus"), true);
  assert.equal(validateSocialUrl("https://www.linkedin.com/company/designtouchplus"), true);
  assert.equal(validateSocialUrl("https://behance.net/designtouchplus"), true);

  // X (Twitter) URL validation
  assert.equal(validateSocialUrl("https://x.com/designtouchplus", "X (Twitter)"), true);
  assert.equal(validateSocialUrl("https://twitter.com/designtouchplus", "X (Twitter)"), true);
  assert.equal(validateSocialUrl("http://www.x.com/user_123", "X (Twitter)"), true);
  assert.equal(validateSocialUrl("https://x.com", "X (Twitter)"), false, "X URL without handle should fail");
  assert.equal(validateSocialUrl("https://x.com/home", "X (Twitter)"), false, "Reserved path /home should fail");
  assert.equal(validateSocialUrl("https://facebook.com/user", "X (Twitter)"), false, "Non-x.com host should fail");

  // Duplicate platform check helper
  assert.equal(isSameSocialPlatform("X (Twitter)", "X"), true);
  assert.equal(isSameSocialPlatform("X", "Twitter"), true);
  assert.equal(isSameSocialPlatform("Twitter", "X (Twitter)"), true);
  assert.equal(isSameSocialPlatform("Instagram", "Instagram"), true);
  assert.equal(isSameSocialPlatform("Instagram", "YouTube"), false);

  // Invalid URLs
  assert.equal(validateSocialUrl(""), false);
  assert.equal(validateSocialUrl("   "), false);
  assert.equal(validateSocialUrl("instagram.com/designtouch"), false);
  assert.equal(validateSocialUrl("ftp://instagram.com"), false);
  assert.equal(validateSocialUrl("javascript:alert(1)"), false);

  // Icon retrieval
  for (const platform of platformIds) {
    const IconComponent = getSocialPlatformIcon(platform);
    assert.ok(IconComponent, `Icon component must be returned for ${platform}`);
    const valid = typeof IconComponent === "function" || typeof IconComponent === "object";
    assert.ok(valid, `Icon component should be a valid React component for ${platform}`);
  }

  // Fallback for unknown platform
  const FallbackIcon = getSocialPlatformIcon("UnknownPlatform");
  assert.ok(FallbackIcon, "Fallback icon must be returned for unknown platform");
});

test("2. parseSocialLinks handles array, JSON string, null/undefined, and malformed input gracefully", () => {
  // Array of links
  const sampleLinks = [
    { id: "1", platform: "Instagram", url: "https://instagram.com/test", enabled: true },
  ];
  assert.deepEqual(parseSocialLinks(sampleLinks), sampleLinks);

  // JSON string
  const jsonString = JSON.stringify(sampleLinks);
  assert.deepEqual(parseSocialLinks(jsonString), sampleLinks);

  // Fallback defaults on null / undefined / empty
  assert.deepEqual(parseSocialLinks(null), DEFAULT_SOCIAL_LINKS);
  assert.deepEqual(parseSocialLinks(undefined), DEFAULT_SOCIAL_LINKS);
  assert.deepEqual(parseSocialLinks(""), DEFAULT_SOCIAL_LINKS);

  // Malformed JSON string
  assert.deepEqual(parseSocialLinks("invalid json"), DEFAULT_SOCIAL_LINKS);
});

test("3. Admin Contact CMS page provides enable/disable toggles and deletion protection for required channels", () => {
  const adminPagePath = path.join(FRONTEND_ROOT, "app/admin/contact/page.js");
  const content = fs.readFileSync(adminPagePath, "utf8");

  // Toggle state variables
  assert.match(content, /directContactEmailEnabled/, "Includes directContactEmailEnabled in form state");
  assert.match(content, /directContactPhoneEnabled/, "Includes directContactPhoneEnabled in form state");
  assert.match(content, /directContactLocationEnabled/, "Includes directContactLocationEnabled in form state");
  assert.match(content, /directContactWorkingHoursEnabled/, "Includes directContactWorkingHoursEnabled in form state");

  // Channel protection: Email, Phone, Location cannot be deleted
  assert.match(content, /Required Channel/, "Renders Required Channel protection label");
  assert.doesNotMatch(
    content,
    /onClick=\{.*deleteEmail/i,
    "Email channel must not have a delete button"
  );
  assert.doesNotMatch(
    content,
    /onClick=\{.*deletePhone/i,
    "Phone channel must not have a delete button"
  );
  assert.doesNotMatch(
    content,
    /onClick=\{.*deleteLocation/i,
    "Location channel must not have a delete button"
  );

  // Working Hours (optional) can be deleted and re-added
  assert.match(content, /handleDeleteWorkingHours/, "Provides handleDeleteWorkingHours handler");
  assert.match(content, /handleAddWorkingHours/, "Provides handleAddWorkingHours handler");
  assert.match(content, /Add Working Hours/, "Provides Add Working Hours action button when removed");
});

test("4. Admin Contact CMS page includes Social Media Management section with Add, Edit, Delete, Toggle and Duplicate Prevention", () => {
  const adminPagePath = path.join(FRONTEND_ROOT, "app/admin/contact/page.js");
  const content = fs.readFileSync(adminPagePath, "utf8");

  // Social media management section
  assert.match(content, /Social Media Profiles/, "Renders Social Media Profiles header");
  assert.match(content, /SocialLinkModal/, "Imports and renders SocialLinkModal");
  assert.match(content, /setSocialModal\(\{\s*open:\s*true/m, "Provides Add Social Link modal opener");
  assert.match(content, /handleDeleteSocialLink/, "Provides Delete Social Link handler");
  assert.match(content, /handleToggleSocialLink/, "Provides Enable/Disable toggle handler for social links");

  // Modal inspection
  const modalPath = path.join(FRONTEND_ROOT, "components/admin/SocialLinkModal.jsx");
  const modalContent = fs.readFileSync(modalPath, "utf8");

  assert.match(modalContent, /SUPPORTED_SOCIAL_PLATFORMS/, "Modal references SUPPORTED_SOCIAL_PLATFORMS");
  assert.match(modalContent, /validateSocialUrl/, "Modal validates URL format with validateSocialUrl");
  assert.match(modalContent, /disabled=\{isAlreadyUsed\}/, "Modal disables already-added platforms to prevent duplicates");
  assert.match(modalContent, /Already Added/, "Modal shows 'Already Added' indicator for duplicate platforms");
});

test("5. Admin Contact CMS Live Preview updates in real-time with enabled channels and social links", () => {
  const adminPagePath = path.join(FRONTEND_ROOT, "app/admin/contact/page.js");
  const content = fs.readFileSync(adminPagePath, "utf8");

  assert.match(content, /Live Public Preview \(Homepage & Contact\)/, "Renders Live Public Preview header");
  assert.match(content, /form\.directContactPhoneEnabled !== false/, "Preview checks phone enabled toggle");
  assert.match(content, /form\.directContactEmailEnabled !== false/, "Preview checks email enabled toggle");
  assert.match(content, /form\.directContactLocationEnabled !== false/, "Preview checks location enabled toggle");
  assert.match(content, /form\.directContactWorkingHoursEnabled !== false/, "Preview checks working hours enabled toggle");
  assert.match(content, /enabledLinks\.map/, "Preview maps enabled social links with icons");
});

test("6. Homepage page.js and ContactSection pass and consume dynamic contactContent with fallbacks", () => {
  const pagePath = path.join(FRONTEND_ROOT, "app/page.js");
  const pageContent = fs.readFileSync(pagePath, "utf8");

  // page.js fetches getContactPageContent and passes contactContent to ContactSection
  assert.match(pageContent, /getContactPageContent\(\)/, "Fetches getContactPageContent in homepage data loader");
  assert.match(
    pageContent,
    /<ContactSection[\s\S]*?companyInfo=\{companyInfo\}[\s\S]*?contactContent=\{contactContent\}[\s\S]*?\/>/,
    "Passes contactContent prop to ContactSection"
  );

  const contactSectionPath = path.join(FRONTEND_ROOT, "components/home/ContactSection.jsx");
  const contactSectionContent = fs.readFileSync(contactSectionPath, "utf8");

  // ContactSection reads enabled flags and falls back appropriately
  assert.match(contactSectionContent, /contactContent\?\.directContactPhoneEnabled !== false/, "Respects phone enabled flag");
  assert.match(contactSectionContent, /contactContent\?\.directContactEmailEnabled !== false/, "Respects email enabled flag");
  assert.match(contactSectionContent, /contactContent\?\.directContactLocationEnabled !== false/, "Respects location enabled flag");
  assert.match(contactSectionContent, /companyInfo\?\.whatsappNumber/, "Falls back to companyInfo whatsappNumber/phone");
  assert.match(contactSectionContent, /companyInfo\?\.email/, "Falls back to companyInfo email");
  assert.match(contactSectionContent, /companyInfo\?\.address/, "Falls back to companyInfo address");
  // Social media icons removed from Homepage ContactSection but preserved in Contact page and Footer
  assert.doesNotMatch(contactSectionContent, /getSocialPlatformIcon/, "Homepage ContactSection removes standalone social icon row");
  assert.doesNotMatch(contactSectionContent, /enabledSocialLinks/, "Homepage ContactSection does not render social links");

  const contactCardsPath = path.join(FRONTEND_ROOT, "components/contact/ContactInfoCards.jsx");
  const contactCardsContent = fs.readFileSync(contactCardsPath, "utf8");
  assert.match(contactCardsContent, /enabledSocialLinks/, "ContactInfoCards retains dynamic enabled social links");

  const footerPath = path.join(FRONTEND_ROOT, "components/layout/Footer.jsx");
  const footerContent = fs.readFileSync(footerPath, "utf8");
  assert.match(footerContent, /activeSocialLinks/, "Footer dynamically renders active social links from CMS");
});
