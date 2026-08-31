import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import RelatedPosts from "@/components/blog/RelatedPosts";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/api";

const CATEGORY_LABELS = {
  VIDEO_EDITING: "Video Editing",
  MOTION_GRAPHICS: "Motion Graphics",
  CONTENT_CREATION: "Content Creation",
  YOUTUBE: "YouTube",
  BUSINESS: "Business",
};

export async function generateMetadata({ params }) {
  const post = await getBlogPostBySlug(params.slug).catch(() => null);
  if (!post) return { title: "Blog Post | DesignTouch+" };

  return {
    title: `${post.title} | DesignTouch+`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({ params }) {
  const post = await getBlogPostBySlug(params.slug).catch(() => null);
  if (!post) notFound();

  // Related posts: same category, excluding the current post, capped at 3
  const relatedPage = await getBlogPosts({ category: post.category, size: 4 }).catch(() => ({ content: [] }));
  const relatedPosts = (relatedPage.content || [])
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const paragraphs = post.content.split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen">
      <ReadingProgressBar />

      <article className="px-6 pt-16 pb-20">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white no-underline mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
          </Link>

          {post.coverImageUrl && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-red">
              {CATEGORY_LABELS[post.category] || post.category}
            </span>
            <span className="text-gray-700">·</span>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            {post.readingTime && (
              <>
                <span className="text-gray-700">·</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {post.readingTime} min read
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase leading-tight mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-gray-400 text-base leading-relaxed border-l-2 border-brand-red/50 pl-4 mb-10">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-col gap-5">
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-gray-300 text-[15px] leading-[1.9] whitespace-pre-wrap"
              >
                {para}
              </p>
            ))}
          </div>

          {post.authorName && (
            <div className="flex items-center gap-3 mt-10 pt-8 border-t border-white/[0.06]">
              <div className="w-10 h-10 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red font-bold text-sm">
                {post.authorName.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-gray-500">Written by</p>
                <p className="text-sm font-bold text-white">{post.authorName}</p>
              </div>
            </div>
          )}

          <RelatedPosts posts={relatedPosts} />
        </div>
      </article>
    </main>
  );
}
