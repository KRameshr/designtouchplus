"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, ArrowUpRight, ArrowRight } from "lucide-react";
import { searchBlogPosts } from "@/lib/api";

const CATEGORY_LABELS = {
  THUMBNAIL: "Thumbnail",
  VIDEO_EDITING: "Video Editing",
  MOTION_GRAPHICS: "Motion Graphics",
  CONTENT_CREATION: "Content Creation",
  YOUTUBE: "YouTube",
  BUSINESS: "Business",
};

/**
 * Escapes regex special characters and highlights matching query tokens with red accent.
 */
function highlightMatch(text, query) {
  if (!query || !text) return text;
  const trimmed = query.trim();
  if (!trimmed) return text;

  try {
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span
          key={i}
          className="text-brand-red font-bold underline decoration-brand-red/40 underline-offset-2"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  } catch {
    return text;
  }
}

/**
 * Client-side search algorithm scoring articles by relevance across searchable fields:
 * title, seoTitle, categoryName, category, tags, focusKeywords, and excerpt.
 */
function scoreArticles(articles, query, max = 8) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);

  return articles
    .map((article) => {
      let score = 0;
      const title = (article.title || "").toLowerCase();
      const seoTitle = (article.seoTitle || "").toLowerCase();
      const category = (article.categoryName || article.category || "").toLowerCase();
      const excerpt = (article.excerpt || "").toLowerCase();
      const tags = Array.isArray(article.tags) ? article.tags.map((t) => t.toLowerCase()) : [];
      const keywords = Array.isArray(article.focusKeywords)
        ? article.focusKeywords.map((k) => k.toLowerCase())
        : [];
      const allText = [title, seoTitle, category, excerpt, ...tags, ...keywords].join(" ");

      // 1. Title matches (highest priority)
      if (title.startsWith(q)) score += 140;
      else if (title.includes(q)) score += 80;

      // 2. SEO Title matches
      if (seoTitle.startsWith(q)) score += 100;
      else if (seoTitle.includes(q)) score += 60;

      // 3. Category match
      if (category.startsWith(q)) score += 50;
      else if (category.includes(q)) score += 30;

      // 4. Tags & Focus Keywords
      if (tags.some((t) => t.startsWith(q))) score += 45;
      else if (tags.some((t) => t.includes(q))) score += 30;

      if (keywords.some((k) => k.includes(q))) score += 35;

      // 5. Excerpt match
      if (excerpt.includes(q)) score += 20;

      // 6. Multi-word match: all words present
      if (words.length > 1 && words.every((w) => allText.includes(w))) {
        score += 50;
      }

      return { article, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((item) => item.article);
}

export default function BlogSearchBar({
  defaultValue = "",
  activeCategory = "",
  categoryName = "",
  articles = [],
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dynamicResults, setDynamicResults] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  // Client-side instant suggestions (0ms latency)
  const clientSuggestions = useMemo(() => {
    return scoreArticles(articles, query, 8);
  }, [articles, query]);

  // Debounced API search to fetch any additional articles from backend
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setDynamicResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await searchBlogPosts(trimmed, {
          category: activeCategory || undefined,
          size: 8,
        });
        if (res && Array.isArray(res.content)) {
          setDynamicResults(res.content);
        }
      } catch {
        // Silent fallback to client suggestions
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, activeCategory]);

  // Merged and deduplicated suggestions list (max 8)
  const suggestions = useMemo(() => {
    const merged = [...clientSuggestions];
    for (const item of dynamicResults) {
      if (!merged.some((m) => m.slug === item.slug || m.id === item.id)) {
        merged.push(item);
      }
    }
    return merged.slice(0, 8);
  }, [clientSuggestions, dynamicResults]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlight index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // Scroll highlighted item into view within the dropdown
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.querySelector(
        `#suggestion-item-${highlightedIndex}`
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex]);

  // Form submit for grid filtering (when pressing Enter without an item highlighted)
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    setIsOpen(false);
    setHighlightedIndex(-1);

    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (trimmed) params.set("q", trimmed);
    const qs = params.toString();
    router.push(`/blog${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  // Clear query button
  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (defaultValue) {
      const params = new URLSearchParams();
      if (activeCategory) params.set("category", activeCategory);
      const qs = params.toString();
      router.push(`/blog${qs ? `?${qs}` : ""}`, { scroll: false });
    }
    if (inputRef.current) inputRef.current.focus();
  };

  // Direct selection of an article suggestion
  const handleSelectArticle = (post) => {
    if (!post?.slug) return;
    setIsOpen(false);
    setHighlightedIndex(-1);
    router.push(`/blog/${post.slug}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || !query.trim()) {
      if (e.key === "ArrowDown" && query.trim()) {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectArticle(suggestions[highlightedIndex]);
      }
      // If highlightedIndex is -1, allow default form submit to filter grid
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const placeholderText = categoryName
    ? `Search ${categoryName}...`
    : "Search articles...";

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className="w-full relative">
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="Search articles"
        className="w-full relative"
      >
        {activeCategory ? (
          <input type="hidden" name="category" value={activeCategory} />
        ) : null}

        <div className="relative group w-full">
          {/* Left Search Icon */}
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-brand-red transition-colors pointer-events-none" />

          {/* Search Input — Sharp Square Edges */}
          <input
            ref={inputRef}
            type="text"
            name="q"
            value={query}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls="search-suggestions-dropdown"
            aria-activedescendant={
              highlightedIndex >= 0 ? `suggestion-item-${highlightedIndex}` : undefined
            }
            onFocus={() => {
              if (query.trim().length > 0) setIsOpen(true);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="w-full h-10 sm:h-[42px] bg-[#0d0d0d] hover:bg-[#101010] focus:bg-[#111111] border border-white/10 hover:border-white/20 focus:border-brand-red rounded-none pl-10 pr-9 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-all font-sans"
          />

          {/* Clear Search Action */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-none flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {showDropdown && (
        <div
          id="search-suggestions-dropdown"
          role="listbox"
          aria-label="Article suggestions"
          className="absolute left-0 right-0 top-full mt-1.5 bg-[#0d0d0d] border border-white/15 shadow-2xl shadow-black/95 rounded-none z-50 overflow-hidden"
        >
          {suggestions.length > 0 ? (
            <>
              <ul
                ref={listRef}
                className="max-h-[360px] sm:max-h-[400px] overflow-y-auto divide-y divide-white/[0.06] list-none p-0 m-0 focus:outline-none"
              >
                {suggestions.map((post, index) => {
                  const isHighlighted = highlightedIndex === index;
                  const categoryDisplay =
                    post.categoryName ||
                    CATEGORY_LABELS[post.category] ||
                    post.category;

                  return (
                    <li
                      key={post.id || post.slug}
                      id={`suggestion-item-${index}`}
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`relative flex items-center justify-between gap-3 px-3.5 py-3 transition-colors duration-150 cursor-pointer select-none ${
                        isHighlighted
                          ? "bg-white/[0.08] text-white"
                          : "bg-transparent text-neutral-300 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      {/* Left vertical red accent bar when highlighted */}
                      {isHighlighted && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-red"
                          aria-hidden="true"
                        />
                      )}

                      <Link
                        href={`/blog/${post.slug}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectArticle(post);
                        }}
                        className="flex items-center gap-3 min-w-0 flex-1 no-underline text-inherit"
                      >
                        {/* Search Icon */}
                        <Search
                          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                            isHighlighted ? "text-brand-red" : "text-neutral-500"
                          }`}
                        />

                        {/* Title and Excerpt */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-sans text-xs sm:text-[13px] font-medium leading-snug truncate">
                            {highlightMatch(post.title, query)}
                          </span>
                          {post.excerpt && (
                            <span className="text-[11px] font-sans text-neutral-500 truncate mt-0.5">
                              {post.excerpt}
                            </span>
                          )}
                        </div>

                        {/* Category Badge & Open Arrow on Right */}
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {categoryDisplay && (
                            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.14em] text-neutral-400 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded-none whitespace-nowrap hidden sm:inline-block">
                              {categoryDisplay}
                            </span>
                          )}
                          <ArrowUpRight
                            className={`w-3.5 h-3.5 transition-colors ${
                              isHighlighted ? "text-brand-red" : "text-neutral-600"
                            }`}
                          />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Bottom Footer: Press Enter to see all results in article grid */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full px-3.5 py-2.5 bg-white/[0.02] hover:bg-white/[0.05] border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer select-none border-none text-left"
              >
                <span className="flex items-center gap-2 truncate">
                  <Search className="w-3 h-3 text-neutral-500" />
                  <span>
                    See all results for &ldquo;
                    <strong className="text-white">{query}</strong>&rdquo;
                  </span>
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider shrink-0 ml-2">
                  Press Enter ↵
                </span>
              </button>
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs font-mono font-semibold text-neutral-300 mb-1">
                No articles found
              </p>
              <p className="text-[11px] text-neutral-500 font-sans mb-3">
                We couldn&apos;t find any articles matching &ldquo;{query}&rdquo;
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-red hover:text-white transition-colors cursor-pointer border-none bg-transparent"
              >
                <span>Search all results for &ldquo;{query}&rdquo;</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
