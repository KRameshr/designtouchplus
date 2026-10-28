import Link from "next/link";
import { Calendar, ArrowRight, BookOpen, Clock } from "lucide-react";

const CATEGORY_LABELS = {
  THUMBNAIL: "Thumbnail",
  VIDEO_EDITING: "Video Editing",
  MOTION_GRAPHICS: "Motion Graphics",
  CONTENT_CREATION: "Content Creation",
  YOUTUBE: "YouTube",
  BUSINESS: "Business",
};

const CATEGORY_STYLES = {
  THUMBNAIL: "text-blue-300 border-blue-500/25 bg-blue-950/40",
  VIDEO_EDITING: "text-red-400 border-red-500/25 bg-red-950/40",
  MOTION_GRAPHICS: "text-purple-300 border-purple-500/25 bg-purple-950/40",
  CONTENT_CREATION: "text-amber-300 border-amber-500/25 bg-amber-950/40",
  YOUTUBE: "text-rose-300 border-rose-500/25 bg-rose-950/40",
  BUSINESS: "text-emerald-300 border-emerald-500/25 bg-emerald-950/40",
};

const BlogGrid = ({ posts = [], activeCategory = "", searchQuery = "" }) => {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 border border-white/[0.08] rounded-none bg-[#0d0d0d] text-center">
        <div className="w-12 h-12 rounded-none bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4">
          <BookOpen className="w-5 h-5 text-neutral-500" />
        </div>
        <h4 className="font-display font-bold text-base text-neutral-200 uppercase tracking-wide mb-1.5">
          No Articles Found
        </h4>
        <p className="text-neutral-400 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
          {searchQuery
            ? `We couldn't find any articles matching "${searchQuery}".`
            : "We couldn't find any articles matching your selected category."}
        </p>
        <Link
          href="/blog"
          scroll={false}
          className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-white bg-brand-red hover:bg-[#dc2626] px-5 py-2.5 rounded-none transition-colors no-underline"
        >
          View All Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="group flex flex-col bg-[#0d0d0d] border border-white/[0.08] hover:border-white/25 rounded-none overflow-hidden transition-all duration-300 hover:bg-[#111111] hover:-translate-y-0.5 h-full"
        >
          <Link
            href={`/blog/${post.slug}`}
            className="flex flex-col flex-1 no-underline text-inherit"
          >
            {/* Thumbnail Image / Fallback Container — Sharp Rectangular Edges */}
            <div className="relative aspect-[16/10] bg-[#141414] overflow-hidden">
              {post.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-white/[0.03] to-transparent">
                  <BookOpen className="w-8 h-8 text-neutral-600 mb-2" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">
                    DesignTouch+
                  </span>
                </div>
              )}

              {/* Category Badge — Sharp Corners */}
              <div className="absolute top-3 left-3 z-10">
                <span
                  className={`inline-block text-[10px] font-mono font-semibold uppercase tracking-[0.16em] px-2.5 py-1 rounded-none border backdrop-blur-md ${
                    CATEGORY_STYLES[post.category] || "text-neutral-300 border-white/10 bg-black/60"
                  }`}
                >
                  {post.categoryName || CATEGORY_LABELS[post.category] || post.category}
                </span>
              </div>

              {/* Reading Time Pill — Sharp Corners */}
              {post.readingTime && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium uppercase tracking-wider text-neutral-300 bg-black/75 backdrop-blur-md border border-white/10 px-2 py-1 rounded-none">
                    <Clock className="w-2.5 h-2.5 text-neutral-400" />
                    {post.readingTime} min
                  </span>
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="flex flex-col flex-1 p-4 sm:p-5">
              {/* Publication Date */}
              <div className="flex items-center gap-2 mb-2.5 text-neutral-400 font-mono text-[11px] uppercase tracking-[0.14em]">
                <Calendar className="w-3 h-3 text-neutral-500 shrink-0" />
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>

              {/* Article Heading */}
              <h3 className="font-display font-bold text-base sm:text-lg text-neutral-100 group-hover:text-brand-red transition-colors duration-200 leading-snug mb-2.5 line-clamp-2">
                {post.title}
              </h3>

              {/* Article Excerpt */}
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                {post.excerpt}
              </p>

              {/* Footer Row / Read Article */}
              <div className="pt-3 border-t border-white/[0.06] mt-auto flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-[0.14em] text-neutral-300 group-hover:text-brand-red transition-colors">
                  Read Article
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
};

export default BlogGrid;
