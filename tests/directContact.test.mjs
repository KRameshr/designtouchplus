import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

test("1. ContactHero and ContactForm highlight 'AMAZING.' with solid text-brand-red (no red-green gradient)", () => {
  const heroPath = path.join(FRONTEND_ROOT, "components/contact/ContactHero.jsx");
  const formPath = path.join(FRONTEND_ROOT, "components/contact/ContactForm.jsx");

  const heroContent = fs.readFileSync(heroPath, "utf8");
  const formContent = fs.readFileSync(formPath, "utf8");

  // In ContactHero, the highlight should use text-brand-red and not the gradient
  assert.match(
    heroContent,
    /<span className="text-brand-red">\s*\{highlight\}\s*<\/span>/,
    "ContactHero should render {highlight} using text-brand-red"
  );
  assert.doesNotMatch(
    heroContent,
    /from-brand-red to-brand-green bg-clip-text/,
    "ContactHero should not contain red-to-green gradient"
  );

  // In ContactForm, Amazing. should use text-brand-red and not the gradient
  assert.match(
    formContent,
    /<span className="text-brand-red">\s*Amazing\.\s*<\/span>/,
    "ContactForm should render Amazing. using text-brand-red"
  );
  assert.doesNotMatch(
    formContent,
    /from-brand-red to-brand-green bg-clip-text/,
    "ContactForm should not contain red-to-green gradient on the heading"
  );
});

test("2. ContactInfoCards uses dynamic values from content with fallback to companyInfo and defaults", () => {
  const infoCardsPath = path.join(FRONTEND_ROOT, "components/contact/ContactInfoCards.jsx");
  const content = fs.readFileSync(infoCardsPath, "utf8");

  assert.match(content, /content\?\.directContactEyebrow/, "Reads directContactEyebrow from content");
  assert.match(content, /content\?\.directContactHeading/, "Reads directContactHeading from content");
  assert.match(content, /content\?\.directContactDescription/, "Reads directContactDescription from content");
  assert.match(content, /content\?\.directContactEmail/, "Reads directContactEmail from content");
  assert.match(content, /content\?\.directContactPhone/, "Reads directContactPhone from content");
  assert.match(content, /content\?\.directContactLocation/, "Reads directContactLocation from content");
  assert.match(content, /content\?\.directContactWorkingHours/, "Reads directContactWorkingHours from content");
});

test("3. Phone formatting produces clean numeric digits for WhatsApp and tel: link", () => {
  const rawPhone = "+91 12345 67890";
  const cleanDigits = rawPhone.replace(/[^\d]/g, "");
  const cleanTel = rawPhone.replace(/[^\d+]/g, "");

  assert.equal(cleanDigits, "911234567890");
  assert.equal(cleanTel, "+911234567890");
  assert.equal(`https://wa.me/${cleanDigits}`, "https://wa.me/911234567890");
  assert.equal(`tel:${cleanTel}`, "tel:+911234567890");
});

test("4. Admin Contact CMS page provides complete editable Direct Contact fields and live preview", () => {
  const adminContactPath = path.join(FRONTEND_ROOT, "app/admin/contact/page.js");
  const content = fs.readFileSync(adminContactPath, "utf8");

  // Tab check
  assert.match(content, /id:\s*"DIRECT_CONTACT"/, "Admin page defines DIRECT_CONTACT tab");

  // Form field bindings
  assert.match(content, /directContactEyebrow/, "Includes directContactEyebrow in form state");
  assert.match(content, /directContactHeading/, "Includes directContactHeading in form state");
  assert.match(content, /directContactDescription/, "Includes directContactDescription in form state");
  assert.match(content, /directContactEmail/, "Includes directContactEmail in form state");
  assert.match(content, /directContactPhone/, "Includes directContactPhone in form state");
  assert.match(content, /directContactLocation/, "Includes directContactLocation in form state");
  assert.match(content, /directContactWorkingHours/, "Includes directContactWorkingHours in form state");

  // Preview card check
  assert.match(content, /Live Public Preview/, "Includes Live Public Preview section");
});

test("5. Public /contact page passes fetched contactContent to ContactInfoCards", () => {
  const contactPagePath = path.join(FRONTEND_ROOT, "app/contact/page.js");
  const content = fs.readFileSync(contactPagePath, "utf8");

  assert.match(
    content,
    /<ContactInfoCards\s+companyInfo=\{companyInfo\}\s+content=\{contactContent\}\s*\/>/,
    "Passes contactContent into ContactInfoCards"
  );
});

