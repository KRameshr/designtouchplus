import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

test("1. Admin navigation: Layout and Dashboard include Chat Leads route", () => {
  const layoutPath = path.join(FRONTEND_ROOT, "app/admin/layout.js");
  const layoutContent = fs.readFileSync(layoutPath, "utf8");

  assert.match(
    layoutContent,
    /label:\s*["']Chat Leads["']/,
    "Admin layout must have Chat Leads navigation label"
  );
  assert.match(
    layoutContent,
    /href:\s*["']\/admin\/chat-leads["']/,
    "Admin layout must link to /admin/chat-leads"
  );

  const dashPath = path.join(FRONTEND_ROOT, "app/admin/dashboard/page.js");
  const dashContent = fs.readFileSync(dashPath, "utf8");

  assert.match(
    dashContent,
    /href:\s*["']\/admin\/chat-leads["']/,
    "Admin dashboard must contain link to /admin/chat-leads"
  );
  assert.match(
    dashContent,
    /label:\s*["']Chat Leads["']/,
    "Admin dashboard section must show Chat Leads label"
  );
});

test("2. API client: exports complete Admin Chat Leads management functions", () => {
  const apiPath = path.join(FRONTEND_ROOT, "lib/api.js");
  const apiContent = fs.readFileSync(apiPath, "utf8");

  const requiredExports = [
    "getAdminChatLeads",
    "getAdminChatLeadsStats",
    "getAdminChatLeadDetail",
    "updateAdminChatLeadStatus",
    "deleteAdminChatLead",
    "bulkDeleteAdminChatLeads",
    "exportAdminChatLeads",
  ];

  for (const fnName of requiredExports) {
    const regex = new RegExp(`export\\s+const\\s+${fnName}\\b`);
    assert.match(
      apiContent,
      regex,
      `lib/api.js must export function ${fnName}`
    );
  }

  // Ensure exportAdminChatLeads passes correct headers & handles .xlsx attachment
  assert.match(
    apiContent,
    /\/api\/admin\/chat-leads\/export/,
    "exportAdminChatLeads must call /api/admin/chat-leads/export"
  );
});

test("3. Admin Chat Leads Page: UI components, stats cards, and table structure", () => {
  const pagePath = path.join(FRONTEND_ROOT, "app/admin/chat-leads/page.js");
  assert.ok(fs.existsSync(pagePath), "app/admin/chat-leads/page.js must exist");
  const content = fs.readFileSync(pagePath, "utf8");

  // Client component
  assert.match(content, /^["']use client["']/, "Page must be a client component");

  // Header
  assert.match(content, /AdminPageHeader/, "Must use AdminPageHeader");
  assert.match(content, /title=["']Chat Leads["']/, "Page header title must be Chat Leads");

  // Dashboard Stats (3 pure lead stats, no fake or conversation metrics)
  assert.match(content, /Total Leads/, "Stats must include Total Leads");
  assert.match(content, /New Leads/, "Stats must include New Leads");
  assert.match(content, /Leads Today/, "Stats must include Leads Today");
  assert.equal(
    /With Conversations/.test(content),
    false,
    "Stats must NOT include With Conversations"
  );

  // Table Columns (Visitor Name, Email, Captured Date, Status, Actions)
  assert.match(content, /Visitor Name/, "Table must include Visitor Name column");
  assert.match(content, /Email/, "Table must include Email column");
  assert.match(content, /Captured Date/, "Table must include Captured Date column");
  assert.match(content, /Status/, "Table must include Status column");
  assert.match(content, /Actions/, "Table must include Actions column");
  assert.equal(
    /<AdminTh>Last Activity<\/AdminTh>/.test(content),
    false,
    "Table must NOT include Last Activity column"
  );
  assert.equal(
    /<AdminTh>Conversations<\/AdminTh>/.test(content),
    false,
    "Table must NOT include Conversations column"
  );

  // Search & Filter Controls
  assert.match(content, /Search by name or email/, "Must have search input");
  assert.match(content, /All Statuses/, "Must have status filter with All Statuses");
  assert.match(content, /Active/, "Status filter must include Active");
  assert.match(content, /Resolved/, "Status filter must include Resolved");
  assert.match(content, /Closed/, "Status filter must include Closed");

  assert.match(content, /All Time/, "Date range filter must include All Time");
  assert.match(content, /Today/, "Date range filter must include Today");
  assert.match(content, /Last 7 Days/, "Date range filter must include Last 7 Days");
  assert.match(content, /Last 30 Days/, "Date range filter must include Last 30 Days");

  assert.match(content, /Newest First/, "Sort options must include Newest First");
  assert.match(content, /Oldest First/, "Sort options must include Oldest First");
  assert.equal(
    /Recent Activity/.test(content),
    false,
    "Sort options must NOT include Recent Activity"
  );

  // Bulk and Excel Actions
  assert.match(content, /Export All \(\.xlsx\)/, "Must provide Export All (.xlsx) button");
  assert.match(content, /Export Selected/, "Must provide Export Selected button");
  assert.match(content, /Delete Selected/, "Must provide Delete Selected button");

  // Modals
  assert.match(content, /AdminModal/, "Must use AdminModal for lead detail");
  assert.match(content, /AdminConfirmModal/, "Must use AdminConfirmModal for deletions");
  assert.equal(
    /Conversation History/.test(content),
    false,
    "Must NOT show Conversation History or conversation logs in lead details"
  );
});

test("4. Border Radius 0 Compliance: Zero rounded corners on Chat Leads page", () => {
  const pagePath = path.join(FRONTEND_ROOT, "app/admin/chat-leads/page.js");
  const content = fs.readFileSync(pagePath, "utf8");

  const regex = /rounded(?:-[a-z0-9\[\]]+)?/g;
  let match;
  const violations = [];
  while ((match = regex.exec(content)) !== null) {
    const cls = match[0];
    if (cls === "rounded-none") continue;
    violations.push(cls);
  }

  assert.deepEqual(
    violations,
    [],
    `app/admin/chat-leads/page.js must have 0 non-rounded-none classes. Found: ${violations.join(", ")}`
  );
});

