/**
 * Utility functions for parsing, cleaning, and deduplicating Keywords and Tags
 * in the DesignTouch+ CMS.
 */

/**
 * Splits raw input text by commas, newlines, and semicolons into clean tokens.
 * Supports:
 * - Comma-separated values: "tag1, tag2, tag3"
 * - Newline-separated values (\n, \r\n): "tag1\ntag2\ntag3"
 * - Mixed comma and newline values
 * - Leading/trailing whitespace and empty lines/commas ignored
 * - If isTag is true, strips leading '#' characters
 *
 * @param {string} rawText - Raw input text (typed or pasted)
 * @param {boolean} [isTag=false] - Whether this is an article tag (strips leading '#')
 * @returns {string[]} Array of clean, trimmed non-empty tokens
 */
export function parseKeywordOrTagTokens(rawText, isTag = false) {
  if (!rawText || typeof rawText !== "string") {
    return [];
  }

  // Split on any combination of carriage returns, newlines, commas, and semicolons
  const parts = rawText.split(/[\r\n,;]+/);
  const tokens = [];

  for (const part of parts) {
    let trimmed = part.trim();
    if (isTag) {
      trimmed = trimmed.replace(/^#+/, "").trim();
    }
    if (trimmed.length > 0) {
      tokens.push(trimmed);
    }
  }

  return tokens;
}

/**
 * Appends new tokens to an existing list using case-insensitive deduplication,
 * preserving the original display text of the first occurrence.
 *
 * @param {string[]} [existingList=[]] - Existing list of keywords or tags
 * @param {string[]|string} newTokensOrText - New tokens array or raw string to parse
 * @param {boolean} [isTag=false] - Whether this is an article tag
 * @returns {string[]} New array containing existing items plus unique new items
 */
export function addUniqueTokens(existingList = [], newTokensOrText = [], isTag = false) {
  const current = Array.isArray(existingList) ? [...existingList] : [];
  const seenLower = new Set(
    current.map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
  );

  const tokens = Array.isArray(newTokensOrText)
    ? newTokensOrText
    : parseKeywordOrTagTokens(newTokensOrText, isTag);

  for (const token of tokens) {
    let trimmed = typeof token === "string" ? token.trim() : "";
    if (isTag) {
      trimmed = trimmed.replace(/^#+/, "").trim();
    }
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();
    if (!seenLower.has(lower)) {
      seenLower.add(lower);
      current.push(trimmed);
    }
  }

  return current;
}

