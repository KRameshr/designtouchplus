import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";
const BACKEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-backend";

test("1. Admin sidebar navigation renames TEAM to ABOUT and handles active state", () => {
  const layoutContent = fs.readFileSync(
    path.join(FRONTEND_ROOT, "app/admin/layout.js"),
    "utf8"
  );

  // Checks NAV_ITEMS has About
  assert.match(
    layoutContent,
    /\{\s*label:\s*"About",\s*href:\s*"\/admin\/about"/,
    "Sidebar item must be renamed to 'About' linking to /admin/about"
  );

  // Checks active state covers /admin/about and /admin/team
  assert.match(
    layoutContent,
    /pathname === "\/admin\/team" \|\|\s*pathname\.startsWith\("\/admin\/about"\) \|\|\s*pathname\.startsWith\("\/admin\/team"\)/,
    "Active state must highlight 'About' on both /admin/about and /admin/team"
  );
});

test("2. /admin/team cleanly redirects to /admin/about?tab=team", () => {
  const teamPageContent = fs.readFileSync(
    path.join(FRONTEND_ROOT, "app/admin/team/page.js"),
    "utf8"
  );

  assert.match(
    teamPageContent,
    /router\.replace\("\/admin\/about\?tab=team"\)/,
    "/admin/team route must redirect to /admin/about?tab=team"
  );
});

test("3. About CMS Dashboard implements all 6 required sections with tabs", () => {
  const aboutPageContent = fs.readFileSync(
    path.join(FRONTEND_ROOT, "app/admin/about/page.js"),
    "utf8"
  );

  // Tabs
  assert.match(aboutPageContent, /id:\s*"HERO",\s*label:\s*"Hero Section"/);
  assert.match(aboutPageContent, /id:\s*"STATS",\s*label:\s*"Statistics"/);
  assert.match(aboutPageContent, /id:\s*"STORY",\s*label:\s*"Our Story"/);
  assert.match(aboutPageContent, /id:\s*"VALUES",\s*label:\s*"Our Values"/);
  assert.match(aboutPageContent, /id:\s*"PROCESS",\s*label:\s*"Our Process"/);
  assert.match(aboutPageContent, /id:\s*"TEAM",\s*label:\s*"Team Members"/);

  // Hero Section fields and banner requirements
  assert.match(aboutPageContent, /Recommended:\s*1920\s*×\s*800\s*px/);
  assert.match(aboutPageContent, /Replace Banner/);
  assert.match(aboutPageContent, /Remove Banner/);
  assert.match(aboutPageContent, /deleteAboutHeroBanner/);
  assert.match(aboutPageContent, /uploadAboutHeroImage/);

  // Story Section fields
  assert.match(aboutPageContent, /storyHeading/);
  assert.match(aboutPageContent, /storyParagraph1/);
  assert.match(aboutPageContent, /storyParagraph2/);
  assert.match(aboutPageContent, /uploadAboutStoryImage/);

  // Preserves Team CRUD
  assert.match(aboutPageContent, /TeamMemberForm/);
  assert.match(aboutPageContent, /deleteTeamMember/);
  assert.match(aboutPageContent, /getTeamAdmin/);
});

test("4. Public About components support dynamic hero banner, CTA, story heading & image", () => {
  const aboutHeroContent = fs.readFileSync(
    path.join(FRONTEND_ROOT, "components/about/AboutHero.jsx"),
    "utf8"
  );
  const ourStoryContent = fs.readFileSync(
    path.join(FRONTEND_ROOT, "components/about/OurStory.jsx"),
    "utf8"
  );
  const valuesGridContent = fs.readFileSync(
    path.join(FRONTEND_ROOT, "components/about/ValuesGrid.jsx"),
    "utf8"
  );

  // AboutHero supports hero banner and CTA
  assert.match(
    aboutHeroContent,
    /aboutContent\?\.heroBannerImageUrl/,
    "AboutHero must check for heroBannerImageUrl"
  );
  assert.match(
    aboutHeroContent,
    /aboutContent\?\.ctaText/,
    "AboutHero must use dynamic ctaText"
  );
  assert.match(
    aboutHeroContent,
    /aboutContent\?\.ctaLink/,
    "AboutHero must use dynamic ctaLink"
  );

  // OurStory supports dynamic heading and image
  assert.match(
    ourStoryContent,
    /aboutContent\.storyHeading/,
    "OurStory must check for storyHeading"
  );
  assert.match(
    ourStoryContent,
    /aboutContent\.storyImageUrl\s*\|\|\s*aboutContent\.storyVideoThumbnailUrl/,
    "OurStory must render storyImageUrl"
  );

  // ValuesGrid supports icon system
  assert.match(
    valuesGridContent,
    /VALUE_ICON_MAP/,
    "ValuesGrid must export VALUE_ICON_MAP"
  );
});

test("5. Backend About Content API and Flyway migration are properly configured", () => {
  const migrationContent = fs.readFileSync(
    path.join(
      BACKEND_ROOT,
      "src/main/resources/db/migration/V37__add_about_hero_banner_and_story_fields.sql"
    ),
    "utf8"
  );
  const controllerContent = fs.readFileSync(
    path.join(
      BACKEND_ROOT,
      "src/main/java/com/designtouch/backend/controller/AboutContentController.java"
    ),
    "utf8"
  );
  const valueControllerContent = fs.readFileSync(
    path.join(
      BACKEND_ROOT,
      "src/main/java/com/designtouch/backend/controller/CompanyValueController.java"
    ),
    "utf8"
  );

  // Migration defines hero banner, CTA, and story fields
  assert.match(migrationContent, /hero_banner_image_url/);
  assert.match(migrationContent, /cta_text/);
  assert.match(migrationContent, /story_heading/);

  // AboutContentController supports PUT and DELETE /hero-banner
  assert.match(controllerContent, /@PutMapping/);
  assert.match(controllerContent, /@DeleteMapping\("\/hero-banner"\)/);

  // CompanyValueController supports POST, PUT, DELETE
  assert.match(valueControllerContent, /@PostMapping/);
  assert.match(valueControllerContent, /@PutMapping\("\/\{id\}"\)/);
  assert.match(valueControllerContent, /@DeleteMapping\("\/\{id\}"\)/);
});

test("6. About CMS Story tab supports video upload, direct video URL, preview and dynamic founder details", () => {
  const aboutPageContent = fs.readFileSync(
    path.join(FRONTEND_ROOT, "app/admin/about/page.js"),
    "utf8"
  );
  const apiContent = fs.readFileSync(
    path.join(FRONTEND_ROOT, "lib/api.js"),
    "utf8"
  );
  const v38Migration = fs.readFileSync(
    path.join(
      BACKEND_ROOT,
      "src/main/resources/db/migration/V38__add_founder_designation_to_about_content.sql"
    ),
    "utf8"
  );

  // API includes uploadAboutVideo
  assert.match(apiContent, /uploadAboutVideo/, "lib/api.js must export uploadAboutVideo");
  assert.match(apiContent, /designtouch\/about\/videos/, "uploadAboutVideo must target designtouch/about/videos folder");

  // V38 migration adds founder_designation
  assert.match(v38Migration, /founder_designation/, "V38 migration must add founder_designation");

  // Admin page supports founderName and founderDesignation
  assert.match(aboutPageContent, /founderName/, "Admin page must manage founderName");
  assert.match(aboutPageContent, /founderDesignation/, "Admin page must manage founderDesignation");

  // Admin page supports video upload & URL management
  assert.match(aboutPageContent, /storyVideoUrl/, "Admin page must manage storyVideoUrl");
  assert.match(aboutPageContent, /uploadAboutVideo/, "Admin page must invoke uploadAboutVideo");
  assert.match(aboutPageContent, /handleStoryVideoUpload/, "Admin page must handle video file selection");
  assert.match(aboutPageContent, /handleRemoveStoryVideo/, "Admin page must handle removing video");
  assert.match(aboutPageContent, /<video\s+src=\{form\.storyVideoUrl\}/, "Admin page must provide preview video player");
});

