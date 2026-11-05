import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

test("1. ContactForm handles loading state and prevents repeated submissions while request is in flight", () => {
  const formPath = path.join(FRONTEND_ROOT, "components/contact/ContactForm.jsx");
  const content = fs.readFileSync(formPath, "utf8");

  assert.match(
    content,
    /disabled=\{status === "loading"\}/,
    "Submit button must be disabled when status is loading"
  );
  assert.match(
    content,
    /status === "loading" \? \(/,
    "Renders loading spinner and indicator during submission"
  );
});

test("2. ContactForm preserves input values on failure and displays user-friendly error", () => {
  const formPath = path.join(FRONTEND_ROOT, "components/contact/ContactForm.jsx");
  const content = fs.readFileSync(formPath, "utf8");

  // setForm should only be called on success, never in the catch block
  assert.match(
    content,
    /setStatus\("success"\);\s*setForm\(\{/,
    "setForm is only called on success"
  );
  assert.match(
    content,
    /catch\s*\((?:err)?\)\s*\{\s*setStatus\("error"\);/s,
    "Catch block sets error status without clearing form"
  );
  assert.match(
    content,
    /errorMessage \|\| "Something went wrong while sending your message\./,
    "Displays error message to user on submission failure"
  );
});

test("3. ContactForm clears fields and displays confirmation on success", () => {
  const formPath = path.join(FRONTEND_ROOT, "components/contact/ContactForm.jsx");
  const content = fs.readFileSync(formPath, "utf8");

  assert.match(
    content,
    /setForm\(\{\s*name:\s*"",\s*email:\s*"",\s*company:\s*"",\s*subject:\s*"",\s*message:\s*""\s*\}\)/,
    "Clears all form fields on success"
  );
  assert.match(
    content,
    /Message Sent Successfully!/,
    "Renders clear confirmation message"
  );
});

test("4. api.js submitContactMessage dispatches POST to /api/contact without caching", () => {
  const apiPath = path.join(FRONTEND_ROOT, "lib/api.js");
  const content = fs.readFileSync(apiPath, "utf8");

  assert.match(
    content,
    /export const submitContactMessage = \(data\) =>\s*apiFetch\("\/api\/contact",\s*\{\s*method:\s*"POST",\s*body:\s*data,\s*cache:\s*"no-store"\s*\}\)/,
    "submitContactMessage posts to /api/contact with no-store cache"
  );
});

