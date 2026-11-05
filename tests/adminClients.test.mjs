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

test("1. uploadClientLogo is exported in lib/api.js targeting Cloudinary 'designtouch/clients' folder", () => {
  const apiContent = readSource("lib/api.js");
  assert.match(
    apiContent,
    /export const uploadClientLogo\s*=\s*\(file\)\s*=>\s*uploadPortfolioImage\(file,\s*["']designtouch\/clients["']\)/,
    "lib/api.js must export uploadClientLogo targeting 'designtouch/clients' folder",
  );
});

test("2. toggleClientActive and toggleClientFeatured are exported in lib/api.js", () => {
  const apiContent = readSource("lib/api.js");
  assert.match(
    apiContent,
    /export const toggleClientActive\s*=\s*\(id\)\s*=>\s*adminFetch\(`\/api\/clients\/\$\{id\}\/toggle-active`,\s*\{\s*method:\s*["']PATCH["']\s*\}\)/,
    "lib/api.js must export toggleClientActive",
  );
  assert.match(
    apiContent,
    /export const toggleClientFeatured\s*=\s*\(id\)\s*=>\s*adminFetch\(`\/api\/clients\/\$\{id\}\/toggle-featured`,\s*\{\s*method:\s*["']PATCH["']\s*\}\)/,
    "lib/api.js must export toggleClientFeatured",
  );
});

test("3. ClientForm imports uploadClientLogo and validates file size up to 10 MB", () => {
  const formContent = readSource("components/admin/ClientForm.jsx");

  assert.match(
    formContent,
    /import\s*\{[^}]*uploadClientLogo[^}]*\}\s*from\s*["']@\/lib\/api["']/,
    "ClientForm must import uploadClientLogo from @/lib/api",
  );

  assert.match(
    formContent,
    /10\s*\*\s*1024\s*\*\s*1024/,
    "ClientForm must check 10 MB file size limit",
  );
});

test("4. ClientForm validates supported image formats (JPG, JPEG, PNG, WebP, SVG)", () => {
  const formContent = readSource("components/admin/ClientForm.jsx");

  const requiredExts = ["jpg", "jpeg", "png", "webp", "svg"];
  for (const ext of requiredExts) {
    assert.ok(
      formContent.includes(`"${ext}"`),
      `ClientForm must support format: ${ext}`,
    );
  }
});

test("5. ClientForm provides logo preview, Replace Logo, and Remove Logo capabilities", () => {
  const formContent = readSource("components/admin/ClientForm.jsx");

  // Logo file upload handler
  assert.match(
    formContent,
    /handleLogoFileSelect/,
    "ClientForm must have handleLogoFileSelect handler",
  );

  // Remove logo handler
  assert.match(
    formContent,
    /handleRemoveLogo/,
    "ClientForm must have handleRemoveLogo handler",
  );

  // Logo preview image
  assert.match(
    formContent,
    /<img[\s\S]*?src=\{form\.logoUrl\}[\s\S]*?object-contain/,
    "ClientForm must display image preview with object-contain",
  );

  // Replace and remove action buttons
  assert.match(formContent, /Replace Logo/, "Must have Replace Logo button");
  assert.match(formContent, /Remove/, "Must have Remove button");
});

test("6. ClientForm includes Featured Client and Active toggles with clear labels", () => {
  const formContent = readSource("components/admin/ClientForm.jsx");

  // Featured Client checkbox
  assert.match(
    formContent,
    /name=["']isFeatured["']/,
    "Must have isFeatured checkbox",
  );
  assert.match(formContent, /Featured Client/, "Must have 'Featured Client' label text");

  // Active checkbox
  assert.match(
    formContent,
    /name=["']isActive["']/,
    "Must have isActive checkbox",
  );
  assert.match(formContent, /Active/, "Must have 'Active' status label");
});

test("7. ClientForm ensures edit operations preserve logoUrl and submits clean payload", () => {
  const formContent = readSource("components/admin/ClientForm.jsx");

  assert.match(
    formContent,
    /clientName:\s*form\.clientName\.trim\(\)/,
    "Payload must trim clientName",
  );
  assert.match(
    formContent,
    /logoUrl:\s*form\.logoUrl\.trim\(\)/,
    "Payload must send logoUrl",
  );
  assert.match(
    formContent,
    /isFeatured:\s*Boolean\(form\.isFeatured\)/,
    "Payload must include isFeatured boolean",
  );
  assert.match(
    formContent,
    /isActive:\s*Boolean\(form\.isActive\)/,
    "Payload must include isActive boolean",
  );
});

test("8. AdminClientsPage renders dedicated logo box with object-contain replacing grey placeholder look", () => {
  const pageContent = readSource("app/admin/clients/page.js");

  assert.match(
    pageContent,
    /<img[\s\S]*?src=\{item\.logoUrl\}[\s\S]*?object-contain/,
    "Admin card must render logo with object-contain",
  );
  assert.match(
    pageContent,
    /item\.clientName/,
    "Admin card must provide fallback clientName if image fails",
  );
});

test("9. AdminClientsPage renders Featured and Active indicators with toggle handlers", () => {
  const pageContent = readSource("app/admin/clients/page.js");

  assert.match(
    pageContent,
    /handleToggleFeatured/,
    "Must have handleToggleFeatured handler",
  );
  assert.match(
    pageContent,
    /handleToggleActive/,
    "Must have handleToggleActive handler",
  );
  assert.match(
    pageContent,
    /item\.isFeatured\s*\?\s*["']Featured["']\s*:\s*["']Standard["']/,
    "Must display Featured vs Standard badge",
  );
  assert.match(
    pageContent,
    /item\.isActive\s*!==\s*false\s*\?\s*["']Active["']\s*:\s*["']Inactive["']/,
    "Must display Active vs Inactive badge",
  );
});

test("10. TrustedClients homepage component filters to show only active and featured clients", () => {
  const homeClients = readSource("components/home/TrustedClients.jsx");

  assert.match(
    homeClients,
    /const\s+clients\s*=\s*rawClients\.filter\(\s*\(c\)\s*=>\s*c\s*&&\s*c\.isActive\s*!==\s*false\s*&&\s*c\.isFeatured\s*!==\s*false\s*\)/,
    "TrustedClients must filter rawClients for isActive !== false && isFeatured !== false",
  );
  assert.match(
    homeClients,
    /clients\.length\s*===\s*3/,
    "Must format layout based on clients count",
  );
  assert.match(
    homeClients,
    /clients\.map\(/,
    "Must map over clients",
  );
});
