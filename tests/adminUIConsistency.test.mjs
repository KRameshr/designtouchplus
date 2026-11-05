import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

function walkFiles(dir, filterExt = [".js", ".jsx"]) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkFiles(fullPath, filterExt));
    } else if (filterExt.some((ext) => file.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

test("1. Admin UI library exports canonical design system components", () => {
  const uiPath = path.join(FRONTEND_ROOT, "components/admin/AdminUI.jsx");
  assert.ok(fs.existsSync(uiPath), "AdminUI.jsx exists");
  const content = fs.readFileSync(uiPath, "utf8");

  const expectedExports = [
    "AdminPageHeader",
    "AdminCard",
    "AdminButton",
    "AdminBadge",
    "AdminTabs",
    "AdminInput",
    "AdminTextarea",
    "AdminSelect",
    "AdminTableWrapper",
    "AdminTable",
    "AdminThead",
    "AdminTh",
    "AdminTbody",
    "AdminTr",
    "AdminTd",
    "AdminModal",
    "AdminAlert",
    "AdminEmptyState",
  ];

  for (const exp of expectedExports) {
    const regex = new RegExp(`export\\s+function\\s+${exp}\\b`);
    assert.match(
      content,
      regex,
      `AdminUI should export ${exp} function component`
    );
  }
});

test("2. Strict Border Radius 0: Zero non-rounded-none classes across all admin pages and components", () => {
  const adminDirs = [
    path.join(FRONTEND_ROOT, "app/admin"),
    path.join(FRONTEND_ROOT, "components/admin"),
  ];

  const files = adminDirs.flatMap((d) => walkFiles(d));
  assert.ok(files.length > 20, "Should inspect at least 20 admin files");

  const violations = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    // Match any rounded variant that is not rounded-none, and not overridden by !rounded-none
    const regex = /rounded(?:-[a-z0-9\[\]]+)?/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const cls = match[0];
      if (cls === "rounded-none") continue;

      // Allow rounded-full only when immediately followed by !rounded-none (required by legacy regex tests)
      const snippet = content.substring(match.index, match.index + 40);
      if (snippet.includes("!rounded-none")) continue;

      const lineNumber = content.substring(0, match.index).split("\n").length;
      violations.push({
        file: path.relative(FRONTEND_ROOT, file),
        line: lineNumber,
        class: cls,
      });
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Found ${violations.length} border-radius violations across admin files:\n` +
      violations.map((v) => `  ${v.file}:${v.line} (${v.class})`).join("\n")
  );
});

test("3. Admin pages adhere to unified dark palette and subtle borders", () => {
  const keyPages = [
    "app/admin/dashboard/page.js",
    "app/admin/clients/page.js",
    "app/admin/testimonials/page.js",
    "app/admin/blog/page.js",
    "app/admin/hero/page.js",
    "app/admin/portfolio/page.js",
    "app/admin/pricing/page.js",
    "app/admin/services/page.js",
    "app/admin/contact/page.js",
    "app/admin/about/page.js",
    "app/admin/chat-leads/page.js",
  ];

  for (const relPath of keyPages) {
    const fullPath = path.join(FRONTEND_ROOT, relPath);
    assert.ok(fs.existsSync(fullPath), `Page exists: ${relPath}`);
    const content = fs.readFileSync(fullPath, "utf8");

    // Must use dark background (#0a0a0a, #0d0d0d, #111, bg-black)
    assert.match(
      content,
      /#0a0a0a|#0d0d0d|#111|#0f0f0f|bg-black/,
      `${relPath} should use standardized dark editorial backgrounds`
    );

    // Must use subtle borders (border-white/10 or border-white/[0.08] or border-white/5)
    assert.match(
      content,
      /border-white\/10|border-white\/\[0\.08\]|border-white\/5|border-white\/15/,
      `${relPath} should use standardized low-contrast borders`
    );

    // Must use uppercase display or mono tracking for headers/labels
    assert.match(
      content,
      /font-display|font-mono|uppercase/,
      `${relPath} should follow editorial typography conventions`
    );
  }
});

test("4. Admin layout sidebar includes all primary admin sections with sharp styling", () => {
  const layoutPath = path.join(FRONTEND_ROOT, "app/admin/layout.js");
  const layoutContent = fs.readFileSync(layoutPath, "utf8");

  // Sidebar items
  const expectedLabels = [
    "Dashboard",
    "Hero Section",
    "Portfolio",
    "Blog",
    "Services",
    "Pricing",
    "Contact Page",
    "Testimonials",
    "About",
    "Clients",
    "Chat Leads",
  ];

  for (const label of expectedLabels) {
    assert.match(
      layoutContent,
      new RegExp(`label:\\s*["']${label}["']`),
      `Sidebar should include ${label}`
    );
  }

  // Active state indicator
  assert.match(
    layoutContent,
    /border-l-2 border-brand-red/,
    "Sidebar active item should use red left accent border"
  );

  // Sharp edges in layout
  assert.match(
    layoutContent,
    /rounded-none/,
    "Admin layout should enforce rounded-none"
  );
});
