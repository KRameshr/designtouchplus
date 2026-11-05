import test from "node:test";
import assert from "node:assert/strict";
import {
  VISITOR_IDENTITY_KEY,
  VISITOR_IDENTITY_TTL_MS,
  getRememberedVisitor,
  saveRememberedVisitor,
  clearRememberedVisitor,
} from "../lib/visitorIdentity.js";

class StorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const setupWindowMock = () => {
  const localStorage = new StorageMock();
  global.window = { localStorage };
};

test("1. Fresh visitor: getRememberedVisitor returns null when no identity is saved", () => {
  setupWindowMock();
  assert.equal(getRememberedVisitor(), null);
});

test("2. saveRememberedVisitor stores name, email, leadId and 24h timestamps without messages", () => {
  setupWindowMock();

  saveRememberedVisitor({
    leadId: "lead-1234",
    name: "Alex Morgan",
    email: "alex@example.com",
  });

  const raw = window.localStorage.getItem(VISITOR_IDENTITY_KEY);
  assert.ok(raw, "Record must be written to localStorage");

  const parsed = JSON.parse(raw);
  assert.equal(parsed.leadId, "lead-1234");
  assert.equal(parsed.name, "Alex Morgan");
  assert.equal(parsed.email, "alex@example.com");
  assert.ok(parsed.timestamp > 0);
  assert.equal(parsed.expiresAt, parsed.timestamp + VISITOR_IDENTITY_TTL_MS);

  // Guarantee ZERO message content is stored in identity record
  assert.equal(parsed.messages, undefined);
  assert.equal(parsed.conversationId, undefined);
  assert.equal(parsed.content, undefined);
});

test("3. getRememberedVisitor retrieves identity if within 24 hours", () => {
  setupWindowMock();

  saveRememberedVisitor({
    leadId: "lead-5678",
    name: "Sam Taylor",
    email: "sam@example.com",
  });

  const visitor = getRememberedVisitor();
  assert.deepEqual(visitor, {
    leadId: "lead-5678",
    name: "Sam Taylor",
    email: "sam@example.com",
  });
});

test("4. 24-Hour Expiry: getRememberedVisitor returns null and cleans up expired identity", () => {
  setupWindowMock();

  const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
  window.localStorage.setItem(
    VISITOR_IDENTITY_KEY,
    JSON.stringify({
      leadId: "expired-lead",
      name: "Old Visitor",
      email: "old@example.com",
      timestamp: twentyFiveHoursAgo,
      expiresAt: twentyFiveHoursAgo + VISITOR_IDENTITY_TTL_MS,
    })
  );

  const visitor = getRememberedVisitor();
  assert.equal(visitor, null, "Expired visitor identity must return null");
  assert.equal(
    window.localStorage.getItem(VISITOR_IDENTITY_KEY),
    null,
    "Expired record must be purged from storage"
  );
});

test("5. Malformed storage or invalid email is safely discarded", () => {
  setupWindowMock();

  // Invalid JSON
  window.localStorage.setItem(VISITOR_IDENTITY_KEY, "invalid-json{");
  assert.equal(getRememberedVisitor(), null);

  // Missing email
  window.localStorage.setItem(
    VISITOR_IDENTITY_KEY,
    JSON.stringify({ name: "No Email", email: "" })
  );
  assert.equal(getRememberedVisitor(), null);

  // Missing '@' in email
  window.localStorage.setItem(
    VISITOR_IDENTITY_KEY,
    JSON.stringify({ name: "Bad Email", email: "invalid" })
  );
  assert.equal(getRememberedVisitor(), null);
});

test("6. clearRememberedVisitor removes identity key from localStorage", () => {
  setupWindowMock();

  saveRememberedVisitor({
    name: "To Be Cleared",
    email: "clear@example.com",
  });
  assert.ok(getRememberedVisitor());

  clearRememberedVisitor();
  assert.equal(getRememberedVisitor(), null);
  assert.equal(window.localStorage.getItem(VISITOR_IDENTITY_KEY), null);
});

