import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_ROOT = "C:/Users/ramesh/OneDrive/Desktop/designtouchplus/designtouch-frontend";

test("1. ChatbotWidget source exists and implements required launcher and panel UI", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  assert.ok(fs.existsSync(widgetPath), "ChatbotWidget.jsx exists");
  const content = fs.readFileSync(widgetPath, "utf8");

  // Floating launcher
  assert.match(content, /Let's Chat!|Let&apos;s Chat!/, "Renders 'Let's Chat!' launcher label");
  assert.match(content, /fixed bottom-.*right-.*/, "Positioned fixed in bottom-right corner");
  assert.match(content, /bg-brand-red/, "Uses brand red accent color");
  assert.match(content, /MessageSquare/, "Imports and renders MessageSquare icon");

  // Window header and controls
  assert.match(content, /We'll reply as soon as we can|We&apos;ll reply as soon as we can/, "Shows online status text");
  assert.match(content, /bg-brand-green/, "Renders online status indicator");
  assert.match(content, /Minus/, "Provides minimize control");
  assert.match(content, /X/, "Provides close control");
});

test("2. Chatbot enforces strict border-radius 0 (rounded-none) across all elements", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  // Verify rounded-none is used and no other rounded classes exist
  const regex = /rounded(?:-[a-z0-9\[\]]+)?/g;
  let match;
  const violations = [];
  while ((match = regex.exec(content)) !== null) {
    if (match[0] !== "rounded-none") {
      violations.push(match[0]);
    }
  }

  assert.deepEqual(violations, [], `ChatbotWidget should only use rounded-none, found: ${violations.join(", ")}`);
});

test("3. Visitor lead collection form enforces validation, email format check, and duplicate prevention", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  // Welcome prompt
  assert.match(content, /Hey there! Welcome to DesignTouch\+/, "Includes required welcome message");

  // Form inputs
  assert.match(content, /id="chat-lead-name"/, "Provides Full Name input");
  assert.match(content, /id="chat-lead-email"/, "Provides Email Address input");

  // Validation logic
  assert.match(content, /emailRegex|@/, "Validates email address format");
  assert.match(content, /leadError/, "Maintains leadError validation state");
  assert.match(content, /leadSubmitting/, "Prevents duplicate submissions via loading lock");
  assert.match(content, /createChatLead/, "Calls createChatLead API on submission");
});

test("4. AI conversation starts only after lead submission and greets visitor by name", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  // Gate check: Form shown if no session / leadId
  assert.match(content, /!session\?\.leadId/, "Displays visitor form before conversation is active");

  // Initial greeting
  assert.match(content, /Hi \*\*.*lead\.name.*Welcome to DesignTouch\+/, "Formats initial greeting with visitor name");
});

test("5. Chatbot starts fresh conversations and does not persist messages or conversations to localStorage", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  // Messages and session are strictly in-memory (fresh per visit)
  assert.equal(
    /localStorage\.setItem\(["']designtouch_chat_session/.test(content),
    false,
    "Must not persist messages or session to localStorage"
  );
  assert.match(
    content,
    /localStorage\.removeItem\(["']designtouch_chat_session["']\)/,
    "Clears any legacy session key on mount to guarantee fresh start"
  );
  assert.equal(
    /getChatConversation/.test(content),
    false,
    "Must not fetch conversation history from backend"
  );
});

test("6. Chatbot supports sending messages, typing indicator, and handles unconfigured AI safely", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  assert.match(content, /sendChatMessage/, "Calls sendChatMessage API");
  assert.match(content, /sending/, "Maintains sending state");
  assert.match(content, /Typing\.\.\./, "Shows typing indicator while waiting for AI response");
  assert.match(content, /Offline mode|isAiConfigured/, "Handles unconfigured AI offline indicator");
});

test("7. ChatbotWidget is mounted in RootLayout and automatically hides on admin pages", () => {
  const layoutPath = path.join(FRONTEND_ROOT, "app/layout.js");
  const layoutContent = fs.readFileSync(layoutPath, "utf8");
  assert.match(layoutContent, /<ChatbotWidget\s*\/>/, "Mounts ChatbotWidget in root app layout");

  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const widgetContent = fs.readFileSync(widgetPath, "utf8");
  assert.match(widgetContent, /startsWith\(["']\/admin["']\)/, "Excludes chatbot from rendering on admin panel routes");
});

test("8. API client lib exports all 4 chatbot endpoints", async () => {
  const apiPath = path.join(FRONTEND_ROOT, "lib/api.js");
  const content = fs.readFileSync(apiPath, "utf8");

  assert.match(content, /export const createChatLead =/, "Exports createChatLead");
  assert.match(content, /export const createChatConversation =/, "Exports createChatConversation");
  assert.match(content, /export const sendChatMessage =/, "Exports sendChatMessage");
  assert.match(content, /export const getChatConversation =/, "Exports getChatConversation");
});

test("9. Chatbot remembers visitor identity for 24h while keeping AI conversation fresh on every visit", () => {
  const widgetPath = path.join(FRONTEND_ROOT, "components/chat/ChatbotWidget.jsx");
  const content = fs.readFileSync(widgetPath, "utf8");

  // Imports identity helpers
  assert.match(content, /getRememberedVisitor/, "Imports getRememberedVisitor");
  assert.match(content, /saveRememberedVisitor/, "Imports saveRememberedVisitor");

  // Saves identity upon lead capture
  assert.match(
    content,
    /saveRememberedVisitor\(\s*\{[\s\S]*leadId:[\s\S]*name:[\s\S]*email:/,
    "Saves leadId, name, and email to 24-hour visitor identity upon lead form submission"
  );

  // Recovers identity on mount
  assert.match(
    content,
    /const remembered = getRememberedVisitor\(\);/,
    "Checks for remembered visitor identity on mount"
  );

  // Greets returning visitor by name with fresh message
  assert.match(
    content,
    /Welcome back to DesignTouch\+/,
    "Greets returning visitor with fresh welcome back greeting"
  );

  // Ensures NO conversation messages are passed to saveRememberedVisitor
  assert.equal(
    /saveRememberedVisitor\(\s*\{[^}]*messages[^}]*\}\)/.test(content),
    false,
    "Must never pass chat messages to saveRememberedVisitor"
  );
});
