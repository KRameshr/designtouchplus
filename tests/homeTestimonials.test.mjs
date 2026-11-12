import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT =
  "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

function readSource(relPath) {
  const filePath = path.join(FRONTEND_ROOT, relPath);
  return fs.readFileSync(filePath, "utf8");
}

test("1. uploadTestimonialAvatar is exported in lib/api.js targeting Cloudinary 'designtouch/testimonials' folder", () => {
  const apiContent = readSource("lib/api.js");
  assert.match(
    apiContent,
    /export const uploadTestimonialAvatar\s*=\s*\(file\)\s*=>\s*uploadPortfolioImage\(file,\s*["']designtouch\/testimonials["']\)/,
    "lib/api.js must export uploadTestimonialAvatar targeting 'designtouch/testimonials' folder",
  );
});

test("2. TestimonialForm implements profile photo upload, file validation, replace, and remove capabilities", () => {
  const formContent = readSource("components/admin/TestimonialForm.jsx");

  // Uses uploadTestimonialAvatar
  assert.match(
    formContent,
    /import\s*\{[^}]*uploadTestimonialAvatar[^}]*\}\s*from\s*["']@\/lib\/api["']/,
    "TestimonialForm must import uploadTestimonialAvatar from @/lib/api",
  );

  // File size validation (5 MB limit)
  assert.match(
    formContent,
    /5\s*\*\s*1024\s*\*\s*1024/,
    "TestimonialForm must check 5 MB file size limit",
  );

  // File type validation (JPG, JPEG, PNG, WebP)
  assert.match(
    formContent,
    /["']jpg["'],\s*["']jpeg["'],\s*["']png["'],\s*["']webp["']/,
    "TestimonialForm must validate jpg, jpeg, png, webp extensions",
  );

  // Profile avatar preview and upload controls
  assert.match(
    formContent,
    /handleAvatarFileSelect/,
    "TestimonialForm must have handleAvatarFileSelect handler",
  );
  assert.match(
    formContent,
    /handleRemoveAvatar/,
    "TestimonialForm must have handleRemoveAvatar handler",
  );

  // Circular preview container
  assert.match(
    formContent,
    /w-16\s+h-16\s+rounded-full/,
    "TestimonialForm must display circular avatar preview",
  );

  // Fallback initial or icon when avatar is empty
  assert.match(
    formContent,
    /form\.authorName\s*\?\s*\(?\s*form\.authorName\.charAt\(0\)/,
    "TestimonialForm must render initial fallback when avatar is empty",
  );

  // Existing fields remain preserved
  assert.match(
    formContent,
    /name="authorName"/,
    "Author name field must exist",
  );
  assert.match(
    formContent,
    /name="authorRole"/,
    "Author role field must exist",
  );
  assert.match(
    formContent,
    /name="authorCompany"/,
    "Author company field must exist",
  );
  assert.match(formContent, /name="quote"/, "Quote field must exist");
  assert.match(formContent, /name="rating"/, "Rating field must exist");
  assert.match(
    formContent,
    /name="displayOrder"/,
    "Display order field must exist",
  );
  assert.match(formContent, /name="isActive"/, "IsActive field must exist");
});

test("3. Admin Testimonials listing displays circular avatar preview, service type badge, and status indicator", () => {
  const pageContent = readSource("app/admin/testimonials/page.js");

  // Circular avatar preview container
  assert.match(
    pageContent,
    /w-12\s+h-12\s+rounded-full/,
    "Admin testimonials page must display circular avatar thumbnail",
  );

  // Avatar image rendering
  assert.match(
    pageContent,
    /src=\{item\.authorAvatarUrl\}/,
    "Admin page must render authorAvatarUrl if present",
  );

  // Service type badge
  assert.match(
    pageContent,
    /item\.serviceType\s*\|\|\s*["']General Feedback["']/,
    "Admin page must render service type badge",
  );

  // Active / Inactive badge
  assert.match(
    pageContent,
    /item\.isActive\s*===\s*false/,
    "Admin page must show status indicator",
  );
});

test("4. Section Header renders small eyebrow, CLIENT in white, TESTIMONIALS in brand red, and right-aligned description", () => {
  const componentContent = readSource("components/home/TrustedClients.jsx");

  // Small eyebrow
  assert.match(
    componentContent,
    /TESTIMONIALS\s*\/\/\s*CLIENT\s*EXPERIENCES/,
    "Eyebrow must render 'TESTIMONIALS // CLIENT EXPERIENCES'",
  );

  // Heading with CLIENT in white and TESTIMONIALS in brand red
  assert.match(
    componentContent,
    /CLIENT\s*<span className=["']text-brand-red["']>TESTIMONIALS<\/span>/,
    "Heading must display CLIENT in white and TESTIMONIALS in brand red",
  );

  // Supporting description on the right
  assert.match(
    componentContent,
    /Real experiences\.\s*Creative partnerships\.\s*Results that speak\./,
    "Supporting description must match: 'Real experiences. Creative partnerships. Results that speak.'",
  );
  assert.match(
    componentContent,
    /md:text-right/,
    "Supporting description must align to the right on desktop",
  );
});

test("5. Testimonials Grid renders 3 columns on desktop, 2 columns on tablet, and 1 column on mobile with consistent spacing", () => {
  const componentContent = readSource("components/home/TrustedClients.jsx");

  // Responsive grid classes
  assert.match(
    componentContent,
    /grid\s+grid-cols-1\s+md:grid-cols-2\s+lg:grid-cols-3\s+gap-6\s+sm:gap-8\s+items-stretch/,
    "Grid must configure 3 columns on desktop (displaying 4th on row 2 left), 2 on tablet, 1 on mobile",
  );
});

test("6. Testimonial Card top section renders 58px circular profile photo, name, designation, and restrained gold 5-star rating", () => {
  const componentContent = readSource("components/home/TrustedClients.jsx");

  // Circular avatar 58px
  assert.match(
    componentContent,
    /w-\[58px\]\s+h-\[58px\]\s+min-w-\[58px\]\s+rounded-full/,
    "Profile photo must be circular and approximately 58px",
  );

  // Restrained gold star rating
  assert.match(
    componentContent,
    /text-\[#e5a93c\]\s+fill-\[#e5a93c\]/,
    "Star rating must use restrained gold color",
  );

  // Name and designation
  assert.match(
    componentContent,
    /authorName/,
    "Must render author name",
  );
  assert.match(
    componentContent,
    /testimonial\.authorRole/,
    "Must render author designation/role",
  );
});

test("7. Testimonial Card middle section renders subtle decorative quotation mark and full testimonial quote", () => {
  const componentContent = readSource("components/home/TrustedClients.jsx");

  // Decorative quotation icon
  assert.match(
    componentContent,
    /Quote\s+className=["'][^"']*text-brand-red[^"']*["']/,
    "Quotation icon must use restrained brand-red accent",
  );

  // Testimonial quote
  assert.match(
    componentContent,
    /testimonial\.quote/,
    "Must render complete testimonial quote",
  );
  assert.match(
    componentContent,
    /leading-relaxed/,
    "Quote must use comfortable relaxed line height",
  );
});

test("8. Testimonial Card bottom section renders thin divider, company name, and small uppercase red service type", () => {
  const componentContent = readSource("components/home/TrustedClients.jsx");

  // Thin divider
  assert.match(
    componentContent,
    /border-t\s+border-white\/\[0\.08\]/,
    "Bottom section must have a thin divider",
  );

  // Company name
  assert.match(
    componentContent,
    /testimonial\.authorCompany/,
    "Bottom section must render company name",
  );

  // Service type in small uppercase red text
  assert.match(
    componentContent,
    /text-\[10px\]\s+sm:text-\[11px\]\s+font-mono\s+font-bold\s+uppercase\s+tracking-\[0\.16em\]\s+text-brand-red/,
    "Service type must render in small uppercase red mono text",
  );
  assert.match(
    componentContent,
    /testimonial\.serviceType\s*\|\|\s*["']General Feedback["']/,
    "Service type must fallback to 'General Feedback'",
  );
});

test("9. Visual Style uses deep black background, charcoal card background, subtle border, 1px radius, and editorial system", () => {
  const componentContent = readSource("components/home/TrustedClients.jsx");

  // Section deep black background
  assert.match(
    componentContent,
    /bg-\[#080808\]/,
    "Section must use deep black background #080808",
  );

  // Card charcoal background and 1px border radius
  assert.match(
    componentContent,
    /bg-\[#0e0e0e\]\s+hover:bg-\[#131313\]\s+border\s+border-white\/\[0\.08\]\s+hover:border-white\/\[0\.20\]\s+rounded-\[1px\]/,
    "Card must use charcoal background, subtle border, and 1px border radius",
  );

  // No green pill or green accent bars
  assert.ok(
    !componentContent.includes("bg-emerald"),
    "Must not contain green accent bars or pills",
  );
});

test("10. Public testimonial and client CMS reads use a bounded five-minute cache", () => {
  const apiContent = readSource("lib/api.js");

  assert.match(
    apiContent,
    /export const getTestimonials\s*=\s*\(\)\s*=>\s*apiFetch\(["']\/api\/testimonials["'],\s*\{\s*revalidate:\s*300\s*\}\)/,
    "getTestimonials must use a bounded 300-second revalidation interval",
  );

  assert.match(
    apiContent,
    /export const getClients\s*=\s*\(\)\s*=>\s*apiFetch\(["']\/api\/clients["'],\s*\{\s*revalidate:\s*300\s*\}\)/,
    "getClients must use a bounded 300-second revalidation interval",
  );
});

test("11. Client Brand Showcase Header is centered with red accent, thin divider, and generous spacing", () => {
  const componentContent = readSource("components/home/TrustedClients.jsx");

  // Conditionally rendered when clients exist
  assert.match(
    componentContent,
    /clients\.length\s*>\s*0/,
    "Must conditionally render client logos when present",
  );

  // Centered header container
  assert.match(
    componentContent,
    /text-center\s+max-w-3xl\s+mx-auto/,
    "Header must be centered with max-w-3xl",
  );

  // Centered heading with red accent
  assert.match(
    componentContent,
    /TRUSTED BY LEADING\s*<span className=["']text-brand-red["']>CREATORS & BRANDS<\/span>/,
    "Must display centered heading 'TRUSTED BY LEADING CREATORS & BRANDS' with red accent",
  );

  // Thin divider below heading
  assert.match(
    componentContent,
    /w-16\s+h-\[2px\]\s+bg-brand-red/,
    "Must render a thin divider below the heading",
  );
});

test("12. Client Logo Grid renders 3 equal cards in one row for 3 clients, up to 5 cols for larger sets, with dark charcoal cards and no washed-out filters", () => {
  const componentContent = readSource("components/home/TrustedClients.jsx");

  // Grid responsiveness: 3 equal cards in 1 row for 3 clients (sm:grid-cols-3 max-w-5xl mx-auto)
  assert.match(
    componentContent,
    /clients\.length\s*===\s*3\s*\?\s*["']grid grid-cols-2 sm:grid-cols-3 max-w-5xl mx-auto gap-4 sm:gap-6["']/,
    "Must render 3 evenly sized cards in one row on desktop/tablet (and 2 on mobile) when 3 clients exist",
  );

  // General grid up to 5 cols
  assert.match(
    componentContent,
    /lg:grid-cols-5/,
    "Must support up to 5 columns on desktop for larger client counts",
  );

  // Equal height and width card
  assert.match(
    componentContent,
    /h-28\s+sm:h-32\s+flex\s+items-center\s+justify-center/,
    "Cards must have consistent equal dimensions and center logos",
  );

  // Charcoal card styling and 1px radius
  assert.match(
    componentContent,
    /bg-\[#0e0e0e\]\s+hover:bg-\[#141414\]\s+border\s+border-white\/\[0\.08\]\s+hover:border-white\/\[0\.22\]\s+rounded-\[1px\]/,
    "Card must use charcoal background #0e0e0e, brighten to #141414 on hover, and 1px radius",
  );

  // Increased logo visibility: no grayscale or opacity-70 washed out filters on logo
  assert.ok(
    !componentContent.includes("grayscale"),
    "Must remove grayscale filter to increase logo visibility",
  );
  assert.ok(
    !componentContent.includes("opacity-70"),
    "Must remove opacity-70 wash to ensure crisp presentation",
  );

  // Logo object-contain and centering
  assert.match(
    componentContent,
    /object-contain/,
    "Logos must preserve aspect ratio with object-contain",
  );

  // Fallback text when logo is missing or fails
  assert.match(
    componentContent,
    /client\.clientName/,
    "Must render clientName as graceful fallback if logo is missing or fails",
  );
});

test("12. TestimonialForm provides required Service Type select dropdown with all specified options", () => {
  const formContent = readSource("components/admin/TestimonialForm.jsx");

  // Check exported SERVICE_TYPES array
  assert.match(
    formContent,
    /export const SERVICE_TYPES\s*=\s*\[/,
    "TestimonialForm must export SERVICE_TYPES list",
  );

  const expectedTypes = [
    "Video Editing",
    "YouTube Thumbnail Design",
    "Motion Graphics",
    "Instagram Reels",
    "Commercial Video Production",
    "Social Media Content",
    "YouTube Management",
    "Branding & Design",
    "Other",
  ];

  for (const type of expectedTypes) {
    assert.ok(
      formContent.includes(`"${type}"`),
      `TestimonialForm must contain option "${type}"`,
    );
  }

  // Check select field in JSX
  assert.match(
    formContent,
    /<select[^>]*name=["']serviceType["'][^>]*required/,
    "TestimonialForm must render a required select dropdown for serviceType",
  );

  // Check payload submission
  assert.match(
    formContent,
    /serviceType:\s*form\.serviceType\s*\?\s*form\.serviceType\.trim\(\)\s*:\s*["']General Feedback["']/,
    "TestimonialForm must include serviceType in submit payload with fallback",
  );
});

test("13. Premium Animations: implements fade-up reveal, stagger delay, hover lift, star transitions, and prefers-reduced-motion", () => {
  const componentContent = readSource("components/home/TrustedClients.jsx");

  // Uses framer-motion motion and useReducedMotion
  assert.match(
    componentContent,
    /import\s*\{[^}]*motion[^}]*useReducedMotion[^}]*\}\s*from\s*["']framer-motion["']/,
    "TrustedClients must import motion and useReducedMotion from framer-motion",
  );

  // Card fade-up reveal and stagger
  assert.match(
    componentContent,
    /cardVariants\s*=/,
    "Must define cardVariants for fade-up reveal",
  );
  assert.match(
    componentContent,
    /whileInView=["']visible["']/,
    "Must trigger reveal when entering viewport",
  );

  // Hover effect with upward movement
  assert.match(
    componentContent,
    /whileHover=\{shouldReduceMotion\s*\?\s*\{\}\s*:\s*\{\s*y:\s*-4\s*\}\}/,
    "Must implement subtle hover lift (y: -4) respecting reduced motion",
  );

  // Star rating transitions
  assert.match(
    componentContent,
    /starVariants\s*=/,
    "Must define starVariants for smooth star appearance",
  );

  // Reduced motion support
  assert.match(
    componentContent,
    /const\s+shouldReduceMotion\s*=\s*useReducedMotion\(\)/,
    "Must query useReducedMotion to respect user motion preferences",
  );
});

test("14. ClientLogoCard renders uploaded logo centered and displays actual dynamic clientName directly below", () => {
  const componentContent = readSource("components/home/TrustedClients.jsx");

  // Logo centered with object-contain
  assert.match(
    componentContent,
    /<img[\s\S]*?\{\.\.\.cloudinaryResponsiveImageProps\(client\.logoUrl,[\s\S]*?\)\}[\s\S]*?object-contain/,
    "Client card must render a responsive logo with object-contain",
  );

  // Client name directly below logo
  assert.match(
    componentContent,
    /<span[^>]*text-white[^>]*>\s*\{client\.clientName\}\s*<\/span>/,
    "Client card must render dynamic clientName directly below logo in bold white typography",
  );

  // Check no hardcoded client names in TrustedClients.jsx
  assert.ok(
    !componentContent.includes('"Groww"') &&
      !componentContent.includes('"boAt"') &&
      !componentContent.includes('"Syska"'),
    "TrustedClients.jsx must not hardcode client names",
  );
});
