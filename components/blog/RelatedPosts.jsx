import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

const RelatedPosts = ({ posts = [] }) => {
  if (posts.length === 0) return null;

  return (
    <div className="w-full mt-16 pt-12 border-t border-white/[0.08]">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" aria-hidden="true" />
        <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-neutral-300">
          You Might Also Like
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col bg-[#0d0d0d] border border-white/[0.08] hover:border-white/20 rounded-none overflow-hidden no-underline transition-all duration-300 hover:bg-[#121212] hover:-translate-y-0.5"
          >
            <div className="relative aspect-video bg-[#141414] overflow-hidden">
              {post.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                  <BookOpen className="w-6 h-6 text-neutral-600" />
                </div>
              )}
            </div>

            <div className="p-4 flex flex-col flex-1">
              <h4 className="font-display font-semibold text-xs sm:text-sm text-neutral-100 mb-3 line-clamp-2 group-hover:text-brand-red transition-colors leading-snug">
                {post.title}
              </h4>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 group-hover:text-brand-red transition-colors mt-auto pt-2 border-t border-white/[0.04]">
                Read <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
