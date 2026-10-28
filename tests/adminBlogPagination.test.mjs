import test from "node:test";
import assert from "node:assert/strict";

const PAGE_SIZE = 10;

// Replicate filtering logic from app/admin/blog/page.js
function filterPosts(posts, statusFilter, searchQuery) {
  return posts.filter((post) => {
    const postStatus =
      post.status || (post.isPublished === false ? "DRAFT" : "PUBLISHED");
    if (statusFilter !== "ALL" && postStatus !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = post.title?.toLowerCase().includes(q);
      const matchSlug = post.slug?.toLowerCase().includes(q);
      const matchExcerpt = post.excerpt?.toLowerCase().includes(q);
      const matchCategory = post.category?.toLowerCase().includes(q);
      const matchTags =
        Array.isArray(post.tags) &&
        post.tags.some((t) => t?.toLowerCase().includes(q));
      const matchFocusKws =
        Array.isArray(post.focusKeywords) &&
        post.focusKeywords.some((k) => k?.toLowerCase().includes(q));
      const matchSeoTitle = post.seoTitle?.toLowerCase().includes(q);
      if (
        !matchTitle &&
        !matchSlug &&
        !matchExcerpt &&
        !matchCategory &&
        !matchTags &&
        !matchFocusKws &&
        !matchSeoTitle
      ) {
        return false;
      }
    }
    return true;
  });
}

// Replicate pagination calculation logic from app/admin/blog/page.js
function getPaginationState(filteredPosts, currentPage) {
  const totalFiltered = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalFiltered);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  const summary =
    totalFiltered === 0
      ? "Showing 0 articles"
      : `Showing ${startIndex + 1}${startIndex + 1 === endIndex ? "" : `–${endIndex}`} of ${totalFiltered} article${totalFiltered === 1 ? "" : "s"}`;

  return {
    totalFiltered,
    totalPages,
    safePage,
    startIndex,
    endIndex,
    paginatedPosts,
    summary,
    canPrev: safePage > 1,
    canNext: safePage < totalPages,
  };
}

// Replicate getPaginationRange from app/admin/blog/page.js
function getPaginationRange(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

// Mock generator for test articles
function generateArticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Article ${i + 1}`,
    slug: `article-${i + 1}`,
    category: i % 2 === 0 ? "VIDEO_EDITING" : "MOTION_GRAPHICS",
    status: i < 8 ? "PUBLISHED" : i < 10 ? "DRAFT" : "SCHEDULED",
    excerpt: `Excerpt for article ${i + 1}`,
    tags: [`tag${(i % 3) + 1}`],
    focusKeywords: [`keyword ${(i % 3) + 1}`],
    publishedAt: new Date().toISOString(),
  }));
}

test("1. Pagination with 11 articles: Page 1 shows 10, Page 2 shows 1", () => {
  const articles = generateArticles(11);
  const filtered = filterPosts(articles, "ALL", "");

  // Page 1
  const page1 = getPaginationState(filtered, 1);
  assert.equal(page1.totalFiltered, 11);
  assert.equal(page1.totalPages, 2);
  assert.equal(page1.paginatedPosts.length, 10);
  assert.equal(page1.paginatedPosts[0].title, "Article 1");
  assert.equal(page1.paginatedPosts[9].title, "Article 10");
  assert.equal(page1.summary, "Showing 1–10 of 11 articles");
  assert.equal(page1.canPrev, false, "Prev disabled on page 1");
  assert.equal(page1.canNext, true, "Next enabled on page 1");

  // Page 2
  const page2 = getPaginationState(filtered, 2);
  assert.equal(page2.paginatedPosts.length, 1);
  assert.equal(page2.paginatedPosts[0].title, "Article 11");
  assert.equal(page2.summary, "Showing 11 of 11 articles");
  assert.equal(page2.canPrev, true, "Prev enabled on page 2");
  assert.equal(page2.canNext, false, "Next disabled on page 2");
});

test("2. Exactly 10 articles results in 1 page and hides pagination controls", () => {
  const articles = generateArticles(10);
  const filtered = filterPosts(articles, "ALL", "");
  const state = getPaginationState(filtered, 1);

  assert.equal(state.totalFiltered, 10);
  assert.equal(state.totalPages, 1);
  assert.equal(state.paginatedPosts.length, 10);
  assert.equal(state.summary, "Showing 1–10 of 10 articles");
  assert.equal(state.totalPages > 1, false, "Controls hidden when totalPages <= 1");
});

test("3. Status filter reduces total and calculates pages from filtered count", () => {
  const articles = generateArticles(11); // 8 PUBLISHED, 2 DRAFT, 1 SCHEDULED

  // Filter PUBLISHED
  const published = filterPosts(articles, "PUBLISHED", "");
  assert.equal(published.length, 8);
  const pubState = getPaginationState(published, 1);
  assert.equal(pubState.totalFiltered, 8);
  assert.equal(pubState.totalPages, 1);
  assert.equal(pubState.summary, "Showing 1–8 of 8 articles");

  // Filter DRAFT
  const drafts = filterPosts(articles, "DRAFT", "");
  assert.equal(drafts.length, 2);
  const draftState = getPaginationState(drafts, 1);
  assert.equal(draftState.totalFiltered, 2);
  assert.equal(draftState.totalPages, 1);
  assert.equal(draftState.summary, "Showing 1–2 of 2 articles");
});

test("4. Search filter accurately matches across fields and paginates results", () => {
  const articles = generateArticles(15);
  // Search for specific slug
  const searchSlug = filterPosts(articles, "ALL", "article-12");
  assert.equal(searchSlug.length, 1);
  assert.equal(searchSlug[0].title, "Article 12");

  // Search by category
  const searchCategory = filterPosts(articles, "ALL", "MOTION_GRAPHICS");
  assert.equal(searchCategory.length, 7);
  const catState = getPaginationState(searchCategory, 1);
  assert.equal(catState.totalFiltered, 7);
  assert.equal(catState.totalPages, 1);

  // Search by tag
  const searchTag = filterPosts(articles, "ALL", "tag1");
  assert.ok(searchTag.length > 0);
  searchTag.forEach((p) => assert.ok(p.tags.includes("tag1")));
});

test("5. Out-of-bounds page is automatically clamped to safe page", () => {
  const articles = generateArticles(11); // 2 pages
  const filtered = filterPosts(articles, "ALL", "");

  // Requesting page 5 when only 2 pages exist
  const state = getPaginationState(filtered, 5);
  assert.equal(state.safePage, 2);
  assert.equal(state.paginatedPosts.length, 1);
  assert.equal(state.summary, "Showing 11 of 11 articles");

  // Requesting page 0 or negative
  const stateLow = getPaginationState(filtered, 0);
  assert.equal(stateLow.safePage, 1);
  assert.equal(stateLow.paginatedPosts.length, 10);
});

test("6. Large page count generates ellipsis windowing properly", () => {
  const totalPages = 10;

  // Near start: Page 2
  const rangeStart = getPaginationRange(2, totalPages);
  assert.deepEqual(rangeStart, [1, 2, 3, 4, 5, "...", 10]);

  // Near end: Page 9
  const rangeEnd = getPaginationRange(9, totalPages);
  assert.deepEqual(rangeEnd, [1, "...", 6, 7, 8, 9, 10]);

  // In middle: Page 5
  const rangeMiddle = getPaginationRange(5, totalPages);
  assert.deepEqual(rangeMiddle, [1, "...", 4, 5, 6, "...", 10]);
});

test("7. Zero matching articles handled cleanly", () => {
  const articles = generateArticles(11);
  const none = filterPosts(articles, "ALL", "nonexistent-query-xyz");
  const state = getPaginationState(none, 1);

  assert.equal(state.totalFiltered, 0);
  assert.equal(state.paginatedPosts.length, 0);
  assert.equal(state.summary, "Showing 0 articles");
  assert.equal(state.canPrev, false);
  assert.equal(state.canNext, false);
});

