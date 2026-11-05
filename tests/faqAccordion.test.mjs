import test from "node:test";
import assert from "node:assert/strict";

// Helper logic mimicking accordion state toggle behavior
function toggleAccordion(currentOpenId, clickedId) {
  return currentOpenId === clickedId ? null : clickedId;
}

// Helper logic mimicking reordering
function reorderItems(items, index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const reordered = [...items];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(targetIndex, 0, moved);
  return reordered;
}

// Helper validation logic for FAQ forms
function validateFaq(question, answer) {
  if (!question || !question.trim()) return { valid: false, error: "Question cannot be empty" };
  if (!answer || !answer.trim()) return { valid: false, error: "Answer cannot be empty" };
  return { valid: true, error: null };
}

test("1. Clicking an unopened FAQ expands it", () => {
  let openId = null;
  openId = toggleAccordion(openId, "faq-1");
  assert.equal(openId, "faq-1");
});

test("2. Clicking an opened FAQ collapses it", () => {
  let openId = "faq-1";
  openId = toggleAccordion(openId, "faq-1");
  assert.equal(openId, null);
});

test("3. Clicking a different FAQ closes the previous and opens the new one", () => {
  let openId = "faq-1";
  openId = toggleAccordion(openId, "faq-2");
  assert.equal(openId, "faq-2");
});

test("4. Moving an FAQ up shifts its position correctly", () => {
  const list = [
    { id: "1", q: "Q1" },
    { id: "2", q: "Q2" },
    { id: "3", q: "Q3" },
  ];
  const moved = reorderItems(list, 1, -1);
  assert.equal(moved[0].id, "2");
  assert.equal(moved[1].id, "1");
  assert.equal(moved[2].id, "3");
});

test("5. Moving an FAQ down shifts its position correctly", () => {
  const list = [
    { id: "1", q: "Q1" },
    { id: "2", q: "Q2" },
    { id: "3", q: "Q3" },
  ];
  const moved = reorderItems(list, 0, 1);
  assert.equal(moved[0].id, "2");
  assert.equal(moved[1].id, "1");
  assert.equal(moved[2].id, "3");
});

test("6. Moving beyond bounds does not alter the array", () => {
  const list = [{ id: "1" }, { id: "2" }];
  const topExceeded = reorderItems(list, 0, -1);
  assert.deepEqual(topExceeded, list);
  const bottomExceeded = reorderItems(list, 1, 1);
  assert.deepEqual(bottomExceeded, list);
});

test("7. Validating blank question or answer fails validation", () => {
  assert.equal(validateFaq("", "Some answer").valid, false);
  assert.equal(validateFaq("   ", "Some answer").valid, false);
  assert.equal(validateFaq("Valid question?", "").valid, false);
  assert.equal(validateFaq("Valid question?", "   ").valid, false);
  assert.equal(validateFaq("Valid question?", "Valid answer.").valid, true);
});

test("8. Contact page fallback logic supplies default FAQs if API array is empty", () => {
  const FALLBACK_FAQS = [{ id: "fb-1" }, { id: "fb-2" }];
  const emptyApiFaqs = [];
  const displayFaqs1 = Array.isArray(emptyApiFaqs) && emptyApiFaqs.length > 0 ? emptyApiFaqs : FALLBACK_FAQS;
  assert.equal(displayFaqs1.length, 2);

  const populatedApiFaqs = [{ id: "db-1", q: "Database question" }];
  const displayFaqs2 = Array.isArray(populatedApiFaqs) && populatedApiFaqs.length > 0 ? populatedApiFaqs : FALLBACK_FAQS;
  assert.equal(displayFaqs2.length, 1);
  assert.equal(displayFaqs2[0].id, "db-1");
});

