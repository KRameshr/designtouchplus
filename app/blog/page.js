import BlogHero from "@/components/blog/BlogHero";
import BlogFilterTabs from "@/components/blog/BlogFilterTabs";
import BlogGrid from "@/components/blog/BlogGrid";
import BlogSidebar from "@/components/blog/BlogSidebar";
import Pagination from "@/components/blog/Pagination";
import { getBlogPosts, searchBlogPosts, getBlogCategoryCounts, getPopularBlogPosts } from "@/lib/api";

export const metadata = {
  title: "Blog | DesignTouch+",
  description:
    "Tips, trends and tutorials on video editing, motion graphics, content creation and growing your brand.",
};

export default async function BlogPage({ searchParams }) {
  const category = searchParams?.category || "";
  const query = searchParams?.q || "";
  const page = Number(searchParams?.page) || 0;

  const [postsPage, categoryCounts, popularPosts] = await Promise.all([
    query
      ? searchBlogPosts(query, { page }).catch(() => ({ content: [], totalPages: 0 }))
      : getBlogPosts({ category: category || undefined, page }).catch(() => ({ content: [], totalPages: 0 })),
    getBlogCategoryCounts().catch(() => []),
    getPopularBlogPosts().catch(() => []),
  ]);

  return (
    <main className="bg-[#0a0a0a]">
      <BlogHero defaultQuery={query} />

      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
          <div>
            <BlogFilterTabs activeCategory={category} />
            <BlogGrid posts={postsPage.content} />
            <Pagination
              currentPage={postsPage.number ?? page}
              totalPages={postsPage.totalPages ?? 0}
              category={category}
              query={query}
            />
          </div>

          <BlogSidebar categoryCounts={categoryCounts} popularPosts={popularPosts} />
        </div>
      </section>
    </main>
  );
}
