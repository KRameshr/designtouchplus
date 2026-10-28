import Link from "next/link";
import { X } from "lucide-react";
import BlogHero from "@/components/blog/BlogHero";
import BlogFilterTabs from "@/components/blog/BlogFilterTabs";
import BlogSearchBar from "@/components/blog/BlogSearchBar";
import BlogGrid from "@/components/blog/BlogGrid";
import BlogSidebar from "@/components/blog/BlogSidebar";
import Pagination from "@/components/blog/Pagination";
import {
  getBlogPageContent,
  getBlogPosts,
  searchBlogPosts,
  getBlogCategoryCounts,
  getPopularBlogPosts,
} from "@/lib/api";

export const metadata = {
  title: "Blog | DesignTouch+",
  description:
    "Tips, trends and tutorials on video editing, motion graphics, content creation and growing your brand.",
};

const CATEGORY_LABELS = {
  THUMBNAIL: "Thumbnail",
  VIDEO_EDITING: "Video Editing",
  MOTION_GRAPHICS: "Motion Graphics",
  CONTENT_CREATION: "Content Creation",
  YOUTUBE: "YouTube",
  BUSINESS: "Business",
};

export default async function BlogPage({ searchParams }) {
  const category = searchParams?.category || "";
  const query = searchParams?.q || "";
  const page = Math.max(0, Number(searchParams?.page) || 0);

  const [blogHeroContent, postsPage, categoryCounts, popularPosts, allPublicPosts] = await Promise.all([
    getBlogPageContent().catch(() => null),
    query
      ? searchBlogPosts(query, { category: category || undefined, page, size: 9 }).catch(() => ({ content: [], totalPages: 0, totalElements: 0, number: 0 }))
      : getBlogPosts({ category: category || undefined, page, size: 9 }).catch(() => ({ content: [], totalPages: 0, totalElements: 0, number: 0 })),
    getBlogCategoryCounts().catch(() => []),
    getPopularBlogPosts().catch(() => []),
    getBlogPosts({ size: 50 }).catch(() => ({ content: [] })),
  ]);

  // Combine and deduplicate known public articles for zero-latency instant autocomplete suggestions
  const initialArticles = [
    ...(allPublicPosts?.content || []),
    ...(postsPage?.content || []),
    ...(popularPosts || []),
  ].filter(
    (post, idx, arr) =>
      post?.slug && arr.findIndex((p) => p.slug === post.slug) === idx
  );

  const hasActiveFilter = Boolean(category || query);

  const activeCategoryName =
    categoryCounts?.find(
      (c) =>
        c.category === category ||
        (c.category && c.category.toLowerCase() === category.toLowerCase())
    )?.name ||
    CATEGORY_LABELS[category] ||
    category;

  return (
    <main className="bg-[#080808] min-h-screen text-white overflow-x-hidden">
      {/* Cinematic Full-Width Blog Hero Banner */}
      <BlogHero content={blogHeroContent} />

      {/* Main Blog Articles & Sidebar Section */}
      <section id="articles" className="scroll-mt-24 px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 sm:pb-28">
        <div className="max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1536px] mx-auto space-y-6 sm:space-y-8">
          
          {/* Category Navigation with Left/Right Scroll Arrows & Right-Aligned Article Search Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] 2xl:grid-cols-[1fr_320px] gap-6 lg:gap-8 xl:gap-10 items-center w-full relative z-30">
            {/* Left side: Horizontal Category Navigation with Left/Right Arrows */}
            <div className="min-w-0 w-full">
              <BlogFilterTabs
                activeCategory={category}
                categories={categoryCounts}
                currentQuery={query}
              />
            </div>

            {/* Right side: Article Search Bar with Autocomplete Dropdown */}
            <div className="w-full relative z-40">
              <BlogSearchBar
                defaultValue={query}
                activeCategory={category}
                categoryName={category ? activeCategoryName : ""}
                articles={initialArticles}
              />
            </div>
          </div>

          {/* Active Filter Feedback (if search or category active) */}
          {hasActiveFilter && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:px-4 rounded-none bg-[#0d0d0d] border border-white/[0.08]">
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                <span>Filtered by:</span>
                {category && (
                  <span className="font-mono font-semibold text-white px-2.5 py-1 rounded-none bg-white/[0.05] border border-white/10">
                    Category: {activeCategoryName}
                  </span>
                )}
                {query && (
                  <span className="font-mono font-semibold text-white px-2.5 py-1 rounded-none bg-white/[0.05] border border-white/10">
                    Search: &ldquo;{query}&rdquo;
                  </span>
                )}
                {postsPage?.totalElements != null && (
                  <span className="font-mono text-neutral-500 text-[11px]">
                    ({postsPage.totalElements} {postsPage.totalElements === 1 ? "article" : "articles"})
                  </span>
                )}
              </div>

              <Link
                href="/blog"
                scroll={false}
                className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-400 hover:text-brand-red transition-colors no-underline"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filter
              </Link>
            </div>
          )}

          {/* Row 3: Article Grid and Sidebar Start Below Category & Search Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] 2xl:grid-cols-[1fr_320px] gap-8 lg:gap-8 xl:gap-10 items-start pt-2 relative z-10">
            {/* Main Articles Column */}
            <div className="min-w-0">
              {/* Articles Grid */}
              <BlogGrid
                posts={postsPage.content}
                activeCategory={category}
                searchQuery={query}
              />

              {/* Pagination Controls */}
              <Pagination
                currentPage={postsPage.number ?? page}
                totalPages={postsPage.totalPages ?? 0}
                category={category}
                query={query}
              />
            </div>

            {/* Sidebar (Hide redundant search bar as it now has a dedicated full-width row) */}
            <BlogSidebar
              categoryCounts={categoryCounts}
              popularPosts={popularPosts}
              activeCategory={category}
              defaultQuery={query}
              hideSearch={true}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
