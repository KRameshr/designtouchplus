import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

test("1. Homepage ContactSection removes all duplicate form elements and submission handlers", () => {
  const contactSectionPath = path.join(FRONTEND_ROOT, "components/home/ContactSection.jsx");
  const content = fs.readFileSync(contactSectionPath, "utf8");

  // Must not have a <form> element
  assert.doesNotMatch(content, /<form[\s>]/, "ContactSection should not contain a <form> tag");

  // Must not have input fields or textarea
  assert.doesNotMatch(content, /<input[\s>]/, "ContactSection should not contain <input> elements");
  assert.doesNotMatch(content, /<textarea[\s>]/, "ContactSection should not contain <textarea> elements");

  // Must not have "Send Message" submit button or submitContactMessage handler
  assert.doesNotMatch(content, /Send Message/i, "ContactSection should not contain a 'Send Message' button");
  assert.doesNotMatch(content, /submitContactMessage/, "ContactSection should not invoke submitContactMessage");

  // Must not have form state management
  assert.doesNotMatch(content, /useState\({\s*name:/, "ContactSection should not contain form state");
});

test("2. Homepage ContactSection Left Column renders heading, description, contact details and social links", () => {
  const contactSectionPath = path.join(FRONTEND_ROOT, "components/home/ContactSection.jsx");
  const content = fs.readFileSync(contactSectionPath, "utf8");

  // Main heading with solid brand red accent on AMAZING
  assert.match(
    content,
    /LET(?:'|&apos;)S CREATE SOMETHING(?:\s*\{" "\}\s*|\s+)<span className="text-brand-red">\s*AMAZING\s*<\/span>/,
    "Heading should display 'LET'S CREATE SOMETHING AMAZING' with 'AMAZING' in text-brand-red"
  );
  assert.doesNotMatch(
    content,
    /from-brand-red to-brand-green bg-clip-text/,
    "Heading must not use multi-color red-to-green gradient"
  );

  // Description
  assert.match(
    content,
    /Have a project in mind\? Let(?:'|&apos;)s talk and bring your ideas to life\./,
    "Description should match the required copy"
  );

  // Contact items: Phone, Email, Location
  assert.match(content, /Phone className=/, "Renders Phone icon");
  assert.match(content, /Mail className=/, "Renders Mail icon");
  assert.match(content, /MapPin className=/, "Renders MapPin icon");
  assert.match(content, /India · Remote Worldwide/, "Renders 'India · Remote Worldwide' location fallback");

  // Standalone social media icon row is removed from Homepage ContactSection only
  assert.doesNotMatch(content, /getSocialPlatformIcon/, "Social icons row must be removed from Homepage");
  assert.doesNotMatch(content, /enabledSocialLinks/, "Social links rendering must be removed from Homepage");
});

test("3. Homepage ContactSection Right Column renders dark charcoal CTA card with 'START A PROJECT →' button", () => {
  const contactSectionPath = path.join(FRONTEND_ROOT, "components/home/ContactSection.jsx");
  const content = fs.readFileSync(contactSectionPath, "utf8");

  // Dark charcoal background and subtle border
  assert.match(content, /bg-\[#0e0e0e\]/, "CTA card must use dark charcoal background");
  assert.match(content, /border-white\/\[0\.08\]/, "CTA card must have subtle border");

  // Heading
  assert.match(content, /HAVE A PROJECT IN MIND\?/, "Card heading must be 'HAVE A PROJECT IN MIND?'");

  // Supporting copy
  assert.match(
    content,
    /Tell us what you(?:'|&apos;)re planning\. Let(?:'|&apos;)s turn your vision into something exceptional\./,
    "Card supporting text must match required copy"
  );

  // Start a project link button to /contact with sharp corners
  assert.match(
    content,
    /<Link[\s\S]*?href="\/contact"[\s\S]*?>[\s\S]*?START A PROJECT →[\s\S]*?<\/Link>/,
    "CTA button must link to /contact with text 'START A PROJECT →'"
  );
  assert.match(
    content,
    /rounded-none/,
    "CTA button and cards must use sharp rectangular corners (rounded-none)"
  );
});

test("4. Homepage ContactSection layout aligns with the navbar container and uses 2-column responsive grid", () => {
  const contactSectionPath = path.join(FRONTEND_ROOT, "components/home/ContactSection.jsx");
  const content = fs.readFileSync(contactSectionPath, "utf8");

  // Container alignment
  assert.match(
    content,
    /max-w-7xl mx-auto px-6/,
    "Section container must use max-w-7xl mx-auto px-6 to align with navbar and other sections"
  );

  // Responsive two-column grid
  assert.match(
    content,
    /grid-cols-1 lg:grid-cols-2/,
    "Layout must use 1 column on mobile/tablet and 2 columns on desktop"
  );
});

test("5. Standalone Contact page and its form components remain completely intact and untouched", () => {
  const contactFormPath = path.join(FRONTEND_ROOT, "components/contact/ContactForm.jsx");
  const formContent = fs.readFileSync(contactFormPath, "utf8");

  assert.match(formContent, /<(?:motion\.)?form[\s\S]*?onSubmit=\{handleSubmit\}/, "ContactForm on /contact page still has form");
  assert.match(formContent, /submitContactMessage/, "ContactForm still dispatches contact messages");
  assert.match(formContent, /disabled=\{status === "loading"\}/, "ContactForm still handles submission status");
});
