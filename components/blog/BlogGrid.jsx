import Link from "next/link";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";

const CATEGORY_LABELS = {
  VIDEO_EDITING: "Video Editing",
  MOTION_GRAPHICS: "Motion Graphics",
  CONTENT_CREATION: "Content Creation",
  YOUTUBE: "YouTube",
  BUSINESS: "Business",
};

const CATEGORY_COLORS = {
  VIDEO_EDITING: "text-brand-red",
  MOTION_GRAPHICS: "text-purple-400",
  CONTENT_CREATION: "text-orange-400",
  YOUTUBE: "text-red-400",
  BUSINESS: "text-brand-green",
};

const BlogGrid = ({ posts = [] }) => {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-white/10 rounded-2xl bg-white/[0.02]">
        <BookOpen className="w-8 h-8 text-gray-700 mb-3" />
        <p className="text-gray-500 text-sm">No articles found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="group flex flex-col bg-white/[0.03] border border-white/10 hover:border-brand-red/40 rounded-xl overflow-hidden no-underline transition-colors duration-300"
        >
          <div className="relative aspect-[16/10] bg-white/[0.04] overflow-hidden">
            {post.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white/10" />
              </div>
            )}
            <span
              className={`absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest bg-black/70 px-2.5 py-1 rounded ${
                CATEGORY_COLORS[post.category] || "text-gray-300"
              }`}
            >
              {CATEGORY_LABELS[post.category] || post.category}
            </span>
          </div>

          <div className="flex flex-col flex-1 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-3 h-3 text-gray-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mb-2 group-hover:text-brand-red transition-colors">
              {post.title}
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-1 line-clamp-3">
              {post.excerpt}
            </p>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-300 group-hover:text-brand-red transition-colors">
              Read More <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default BlogGrid;
