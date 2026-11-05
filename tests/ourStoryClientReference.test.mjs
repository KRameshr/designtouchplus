import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, "..");

test("1. OurStory is a single unified cinematic full-width video section with overlaid story content", () => {
  const ourStoryPath = path.join(FRONTEND_ROOT, "components/about/OurStory.jsx");
  const ourStory = fs.readFileSync(ourStoryPath, "utf8");

  assert.match(ourStory, /max-w-7xl\s+mx-auto\s+px-6/, "Must use standard container max-w-7xl mx-auto px-6");
  assert.match(ourStory, /bg-\[#080808\]/, "Section must use dark agency background");

  // Verify only one section exists and no separate duplicated section below
  const sectionMatches = ourStory.match(/<section\b/g);
  assert.equal(sectionMatches?.length, 1, "Must contain exactly one section without duplicate content below video");
});

test("2. Text overlay features red square accent, THE JOURNEY label, and green Resonate. heading", () => {
  const ourStoryPath = path.join(FRONTEND_ROOT, "components/about/OurStory.jsx");
  const ourStory = fs.readFileSync(ourStoryPath, "utf8");

  // Red square accent
  assert.match(ourStory, /bg-brand-red[^"]*rounded-none/, "Section label must feature a red square accent");
  assert.match(ourStory, /THE JOURNEY/, "Section label must read THE JOURNEY");

  // Heading structure with green Resonate
  assert.match(ourStory, /Crafting Stories That/, "Heading must contain 'Crafting Stories That'");
  assert.match(ourStory, /text-brand-green/, "Heading must highlight 'Resonate.' in brand green");
});

test("3. Narrative paragraphs and founder credit are rendered in the overlay", () => {
  const ourStoryPath = path.join(FRONTEND_ROOT, "components/about/OurStory.jsx");
  const ourStory = fs.readFileSync(ourStoryPath, "utf8");

  // Boutique storytelling manifesto line
  assert.match(ourStory, /From boutique storytelling to high-impact commercial visuals/, "Must include boutique storytelling manifesto line");

  // Story paragraphs
  assert.match(ourStory, /love for storytelling and a passion for visual creativity/, "Must include paragraph 1");
  assert.match(ourStory, /every brand has a story worth telling/, "Must include paragraph 2");

  // Founder section
  assert.match(ourStory, /founderDesignation/, "Founder designation must render dynamically from CMS");
  assert.match(ourStory, /founderSignatureUrl/, "Must support CMS founder signature image when present");
});

test("4. Hero features fallback poster and rejects missing assets", () => {
  const ourStoryPath = path.join(FRONTEND_ROOT, "components/about/OurStory.jsx");
  const ourStory = fs.readFileSync(ourStoryPath, "utf8");

  // Production shoot fallback image
  assert.match(ourStory, /\/assets\/about\/production-shoot\.jpg/, "Must provide production shoot image asset as fallback");

  // Dynamic CMS image support
  assert.match(ourStory, /aboutContent\.storyImageUrl\s*\|\|\s*aboutContent\.storyVideoThumbnailUrl/, "Must support CMS dynamic story image");

  // Check physical file exists in public/
  const imagePath = path.join(FRONTEND_ROOT, "public/assets/about/production-shoot.jpg");
  assert.ok(fs.existsSync(imagePath), "Production shoot image must physically exist in public/assets/about/");
});

test("5. Video presentation, dark gradient scrim, and accessible mute control", () => {
  const ourStoryPath = path.join(FRONTEND_ROOT, "components/about/OurStory.jsx");
  const ourStory = fs.readFileSync(ourStoryPath, "utf8");

  // Dimensions
  assert.match(ourStory, /min-h-\[680px\]|min-h-\[700px\]|min-h-\[740px\]|min-h-\[800px\]/, "Must enforce responsive min-height");

  // Dark gradient scrim behind text for legibility
  assert.match(ourStory, /bg-gradient-to-r\s+from-black/, "Must use left-to-right dark gradient overlay for text readability");

  // Accessible Mute/Unmute audio control
  assert.match(ourStory, /toggleMute/, "Must provide accessible mute/unmute toggle");
  assert.match(ourStory, /aria-label=\{isMuted\s*\?/, "Must provide accessible label for sound control");
});

test("6. Background video autoplays muted, loops, and covers the hero area", () => {
  const ourStoryPath = path.join(FRONTEND_ROOT, "components/about/OurStory.jsx");
  const ourStory = fs.readFileSync(ourStoryPath, "utf8");

  // Video element and autoplay muted loop
  assert.match(ourStory, /<video\s+ref=\{videoRef\}/, "Must render video with ref");
  assert.match(ourStory, /autoPlay/, "Must autoplay where browser permits");
  assert.match(ourStory, /muted=\{isMuted\}/, "Must default to muted playback");
  assert.match(ourStory, /loop/, "Must loop continuously");
  assert.match(ourStory, /playsInline/, "Must support inline playback");
  assert.match(ourStory, /object-cover/, "Must use object-cover for full-bleed cinematic hero");

  // CMS video source with fallback
  assert.match(ourStory, /aboutContent\?\.storyVideoUrl/, "Must configure video source from CMS");
  assert.match(ourStory, /\/hero-demo\.mp4/, "Must provide clean demo video fallback");

  // Fallback poster
  assert.match(ourStory, /poster=\{posterImage\}/, "Must set poster thumbnail on video before playback");
});

test("7. Founder name and founder designation are dynamic from CMS and not hardcoded", () => {
  const ourStoryPath = path.join(FRONTEND_ROOT, "components/about/OurStory.jsx");
  const ourStory = fs.readFileSync(ourStoryPath, "utf8");

  // Dynamic founder name
  assert.match(ourStory, /aboutContent\?\.founderName/, "Must dynamically read founder name from CMS");
  assert.match(ourStory, /\{founderName\}/, "Must dynamically render founder name");

  // Dynamic founder designation
  assert.match(ourStory, /aboutContent\?\.founderDesignation/, "Must dynamically read founder designation from CMS");
  assert.match(ourStory, /\{founderDesignation\}/, "Must dynamically render founder designation");

  // Does not hardcode Rohit Sharma in signature text without variable
  assert.doesNotMatch(ourStory, /aria-label="Founder Signature: Rohit Sharma"\s*>\s*Rohit Sharma\s*<\/div>/, "Founder name must NOT be hardcoded");
});

test("8. Poppins typography is applied consistently to all three story paragraphs", () => {
  const ourStoryPath = path.join(FRONTEND_ROOT, "components/about/OurStory.jsx");
  const ourStory = fs.readFileSync(ourStoryPath, "utf8");
  const layoutPath = path.join(FRONTEND_ROOT, "app/layout.js");
  const layout = fs.readFileSync(layoutPath, "utf8");
  const tailwindPath = path.join(FRONTEND_ROOT, "tailwind.config.js");
  const tailwind = fs.readFileSync(tailwindPath, "utf8");

  // Font loading in app/layout.js
  assert.match(layout, /import\s*\{[^}]*Poppins[^}]*\}\s*from\s*"next\/font\/google"/, "Must import Poppins from next/font/google");
  assert.match(layout, /variable:\s*"--font-poppins"/, "Must define --font-poppins variable");
  assert.match(layout, /display:\s*"swap"/, "Must use font-display swap to prevent layout shifts");
  assert.match(layout, /\$\{poppins\.variable\}/, "Must apply poppins variable to root html");

  // Tailwind configuration
  assert.match(tailwind, /poppins:\s*\["var\(--font-poppins\)",\s*"Poppins",\s*"sans-serif"\]/, "Must define poppins fontFamily in Tailwind");

  // Poppins applied to all three story paragraphs in OurStory.jsx
  assert.match(ourStory, /font-poppins space-y-3\.5/, "Container must specify font-poppins");
  assert.match(ourStory, /<p className="text-neutral-200 font-medium font-poppins">\s*From boutique storytelling/, "Manifesto paragraph must use font-poppins");
  assert.match(ourStory, /<p className="text-neutral-300 font-poppins">\s*\{paragraph1\}\s*<\/p>/, "Paragraph 1 must use font-poppins");
  assert.match(ourStory, /<p className="text-neutral-300 font-poppins">\s*\{paragraph2\}\s*<\/p>/, "Paragraph 2 must use font-poppins");

  // Heading and signature constraints preserved
  assert.match(ourStory, /<h2 className="font-display font-black/, "Main heading must keep font-display unchanged");
  assert.match(ourStory, /className="font-serif italic/, "Founder signature must keep font-serif unchanged");
  assert.match(ourStory, /text-neutral-400 font-sans tracking-normal font-medium/, "Founder designation must keep font-sans unchanged");
});
