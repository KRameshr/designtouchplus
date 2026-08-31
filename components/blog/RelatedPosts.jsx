import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

const RelatedPosts = ({ posts = [] }) => {
  if (posts.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto mt-16 pt-12 border-t border-white/[0.06]">
      <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6">
        You Might Also Like
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col bg-white/[0.03] border border-white/10 hover:border-brand-red/40 rounded-xl overflow-hidden no-underline transition-colors duration-300"
          >
            <div className="relative aspect-video bg-white/[0.04]">
              {post.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white/10" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="text-xs font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-red transition-colors">
                {post.title}
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-brand-red transition-colors">
                Read <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
