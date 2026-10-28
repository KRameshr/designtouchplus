import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, BookOpen, Clock, Tag } from "lucide-react";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import RelatedPosts from "@/components/blog/RelatedPosts";
import BlogContentRenderer from "@/components/blog/BlogContentRenderer";
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
  if (!post) {
    return {
      title: "Blog Post | DesignTouch+",
      description: "Creative insights and tutorials by DesignTouch+",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://designtouchplus.com";
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const ogImages = post.coverImageUrl ? [{ url: post.coverImageUrl, alt: post.title }] : [];

  const effectiveTitle = (post.seoTitle && post.seoTitle.trim()) ? post.seoTitle.trim() : post.title;
  const effectiveDescription = (post.metaDescription && post.metaDescription.trim())
    ? post.metaDescription.trim()
    : (post.excerpt || `Read ${post.title} on the DesignTouch+ blog.`);

  return {
    title: `${effectiveTitle} | DesignTouch+`,
    description: effectiveDescription,
    keywords: Array.isArray(post.tags) && post.tags.length > 0 ? post.tags : undefined,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: `${effectiveTitle} | DesignTouch+`,
      description: effectiveDescription,
      url: postUrl,
      type: "article",
      publishedTime: post.publishedAt,
      tags: Array.isArray(post.tags) && post.tags.length > 0 ? post.tags : undefined,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${effectiveTitle} | DesignTouch+`,
      description: effectiveDescription,
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const post = await getBlogPostBySlug(params.slug).catch(() => null);
  if (!post) notFound();

  // Related posts: same category first, excluding current post, capped at 3
  const relatedPage = await getBlogPosts({ category: post.category, size: 6 }).catch(() => ({ content: [] }));
  let relatedPosts = (relatedPage.content || [])
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  // If category has fewer than 3 related posts, backfill with other published posts
  if (relatedPosts.length < 3) {
    const generalPage = await getBlogPosts({ size: 6 }).catch(() => ({ content: [] }));
    const backfill = (generalPage.content || []).filter(
      (p) => p.slug !== post.slug && !relatedPosts.some((r) => r.slug === p.slug)
    );
    relatedPosts = [...relatedPosts, ...backfill].slice(0, 3);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://designtouchplus.com";

  // Structured Data (JSON-LD) for SEO
  const effectiveTitle = (post.seoTitle && post.seoTitle.trim()) ? post.seoTitle.trim() : post.title;
  const effectiveDescription = (post.metaDescription && post.metaDescription.trim())
    ? post.metaDescription.trim()
    : (post.excerpt || "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: effectiveTitle,
    description: effectiveDescription,
    keywords: Array.isArray(post.tags) && post.tags.length > 0 ? post.tags.join(", ") : undefined,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
    author: {
      "@type": "Person",
      name: post.authorName || "DesignTouch+",
    },
    publisher: {
      "@type": "Organization",
      name: "DesignTouch+",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
  };

  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ReadingProgressBar />

      {/* Main Article Container */}
      <article className="px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 sm:pb-24">
        <div className="max-w-[780px] mx-auto">
          {/* Back Navigation */}
          <div className="mb-6 sm:mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-400 hover:text-white no-underline transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back to All Articles</span>
            </Link>
          </div>

          {/* Cover Image / Editorial Fallback Banner */}
          {post.coverImageUrl ? (
            <div className="relative aspect-[16/9] md:aspect-[21/10] max-h-[520px] rounded-none overflow-hidden border border-white/10 bg-[#0d0d0d] mb-8 sm:mb-12 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="relative aspect-[21/9] sm:aspect-[24/9] max-h-[300px] rounded-none overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.04] via-[#0d0d0d] to-black mb-8 sm:mb-12 flex items-center justify-center p-8 shadow-2xl">
              <div className="flex items-center gap-3 text-neutral-600 font-mono text-xs uppercase tracking-widest">
                <BookOpen className="w-5 h-5 text-neutral-500" />
                <span>DesignTouch+ Editorial</span>
              </div>
            </div>
          )}

          {/* Meta Header */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 mb-4 sm:mb-5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-brand-red bg-brand-red/10 border border-brand-red/25 px-2.5 py-0.5 rounded-none">
              <Tag className="w-3 h-3 text-brand-red" />
              <span>{CATEGORY_LABELS[post.category] || post.category}</span>
            </span>

            <span className="text-neutral-700 hidden sm:inline" aria-hidden="true">·</span>

            <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium uppercase tracking-wider text-neutral-400">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {post.readingTime && (
              <>
                <span className="text-neutral-700 hidden sm:inline" aria-hidden="true">·</span>
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium uppercase tracking-wider text-neutral-400">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{post.readingTime} min read</span>
                </div>
              </>
            )}
          </div>

          {/* Article Title (H1) - Balanced Responsive Clamp Typography */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-display font-extrabold uppercase tracking-tight text-white leading-[1.18] sm:leading-[1.2] mb-6 [text-wrap:balance]">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-neutral-300 text-base sm:text-lg leading-[1.7] border-l-2 border-brand-red pl-5 py-1.5 mb-8 sm:mb-10 font-normal italic bg-white/[0.015]">
              {post.excerpt}
            </p>
          )}

          {/* Visual Separator between Introduction and Main Content */}
          <div className="pt-2 border-t border-white/[0.08] mb-6" />

          {/* Full Rich Text Article Content (Headings, Multiple Images, Tables, Lists, Quotes, Accordion FAQs) */}
          <BlogContentRenderer content={post.content} className="text-neutral-300" />

          {/* Article Tags / Focus Keywords */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-12 pt-6 border-t border-white/[0.08]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 mr-1">
                <Tag className="w-3.5 h-3.5 text-brand-red" /> Tags:
              </span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-xs font-mono text-neutral-300 bg-white/[0.04] border border-white/10 px-3 py-1 rounded-none hover:border-brand-red/40 hover:text-white transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Byline */}
          {post.authorName && (
            <div className="flex items-center gap-4 mt-12 pt-8 border-t border-white/[0.08]">
              <div className="w-12 h-12 rounded-full bg-brand-red/20 border border-brand-red/30 flex items-center justify-center text-brand-red font-display font-black text-base shadow-lg">
                {post.authorName.charAt(0)}
              </div>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Written by</p>
                <p className="text-base font-display font-bold text-white">{post.authorName}</p>
              </div>
            </div>
          )}

          {/* Related Posts Section */}
          <RelatedPosts posts={relatedPosts} />
        </div>
      </article>
    </main>
  );
}
