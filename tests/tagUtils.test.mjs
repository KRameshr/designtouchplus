import test from "node:test";
import assert from "node:assert/strict";
import { parseKeywordOrTagTokens, addUniqueTokens } from "../lib/tagUtils.js";

test("1. Comma-separated input parses into trimmed separate tokens", () => {
  const input = "thumbnail typography, thumbnail color theory, YouTube thumbnail design";
  const tokens = parseKeywordOrTagTokens(input);
  assert.deepEqual(tokens, [
    "thumbnail typography",
    "thumbnail color theory",
    "YouTube thumbnail design",
  ]);
});

test("2. Newline-separated input (LF) parses correctly", () => {
  const input = `thumbnail typography
thumbnail color theory
YouTube thumbnail design
best fonts for YouTube thumbnails
thumbnail text design
color combinations for thumbnails`;

  const tokens = parseKeywordOrTagTokens(input);
  assert.deepEqual(tokens, [
    "thumbnail typography",
    "thumbnail color theory",
    "YouTube thumbnail design",
    "best fonts for YouTube thumbnails",
    "thumbnail text design",
    "color combinations for thumbnails",
  ]);
});

test("3. Windows CRLF (\\r\\n) line endings parse correctly without stray \\r", () => {
  const input = "thumbnail typography\r\nthumbnail color theory\r\nYouTube thumbnail design\r\ncolor combinations for thumbnails";
  const tokens = parseKeywordOrTagTokens(input);
  assert.deepEqual(tokens, [
    "thumbnail typography",
    "thumbnail color theory",
    "YouTube thumbnail design",
    "color combinations for thumbnails",
  ]);
  tokens.forEach((t) => assert.ok(!t.includes("\r")));
});

test("4. Mixed comma and newline input parses correctly", () => {
  const input = `thumbnail typography, thumbnail color theory
YouTube thumbnail design
best fonts for YouTube thumbnails, thumbnail text design
color combinations for thumbnails`;

  const tokens = parseKeywordOrTagTokens(input);
  assert.deepEqual(tokens, [
    "thumbnail typography",
    "thumbnail color theory",
    "YouTube thumbnail design",
    "best fonts for YouTube thumbnails",
    "thumbnail text design",
    "color combinations for thumbnails",
  ]);
});

test("5. Leading/trailing whitespace, blank lines, and redundant commas are ignored", () => {
  const input = `   
  
  thumbnail typography   ,   ,  

  color combinations for thumbnails  ,,,  
  \r\n\r\n   `;

  const tokens = parseKeywordOrTagTokens(input);
  assert.deepEqual(tokens, [
    "thumbnail typography",
    "color combinations for thumbnails",
  ]);
});

test("6. Duplicate entries with different capitalization are deduplicated preserving first occurrence display text", () => {
  const existing = ["Thumbnail Typography"];
  const newTokens = [
    "thumbnail typography",
    "THUMBNAIL TYPOGRAPHY",
    "Color Theory",
    "color theory",
    "YouTube Thumbnail Design",
  ];

  const result = addUniqueTokens(existing, newTokens, false);
  assert.deepEqual(result, [
    "Thumbnail Typography",
    "Color Theory",
    "YouTube Thumbnail Design",
  ]);
});

test("7. Article Tags strip leading '#' prefix while Focus Keywords preserve content", () => {
  const tagInput = "#tutorial, ##video-editing, #YouTube Design";
  const tagTokens = parseKeywordOrTagTokens(tagInput, true);
  assert.deepEqual(tagTokens, [
    "tutorial",
    "video-editing",
    "YouTube Design",
  ]);

  const kwInput = "thumbnail typography, #1 ranking strategies";
  const kwTokens = parseKeywordOrTagTokens(kwInput, false);
  assert.deepEqual(kwTokens, [
    "thumbnail typography",
    "#1 ranking strategies",
  ]);
});

test("8. addUniqueTokens handles raw multiline string directly", () => {
  const existing = ["Alpha"];
  const rawPasted = `alpha\r\nBeta, gamma\nDELTA\r\nbeta`;
  const result = addUniqueTokens(existing, rawPasted, false);
  assert.deepEqual(result, [
    "Alpha",
    "Beta",
    "gamma",
    "DELTA",
  ]);
});

test("9. Handles empty/null/undefined gracefully", () => {
  assert.deepEqual(parseKeywordOrTagTokens(null), []);
  assert.deepEqual(parseKeywordOrTagTokens(undefined), []);
  assert.deepEqual(parseKeywordOrTagTokens(""), []);
  assert.deepEqual(parseKeywordOrTagTokens("   \n\n ,,, "), []);
  assert.deepEqual(addUniqueTokens(null, null), []);
  assert.deepEqual(addUniqueTokens([], []), []);
});

