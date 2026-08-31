"use client";

import { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/api";

const CATEGORY_LABELS = {
  VIDEO_EDITING: "Video Editing",
  MOTION_GRAPHICS: "Motion Graphics",
  CONTENT_CREATION: "Content Creation",
  YOUTUBE: "YouTube",
  BUSINESS: "Business",
};

const BlogSidebar = ({ categoryCounts = [], popularPosts = [] }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await subscribeToNewsletter(email);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <aside className="flex flex-col gap-8">
      {/* Categories */}
      {categoryCounts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Categories
            </span>
          </div>
          <ul className="flex flex-col gap-1 list-none p-0 m-0">
            {categoryCounts.map(({ category, count }) => (
              <li key={category}>
                <Link
                  href={`/blog?category=${category}`}
                  className="flex items-center justify-between py-2 text-sm text-gray-400 hover:text-white no-underline transition-colors"
                >
                  {CATEGORY_LABELS[category] || category}
                  <span className="text-xs text-gray-600">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Popular posts */}
      {popularPosts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Popular Posts
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {popularPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="flex gap-3 no-underline group"
              >
                <div className="w-14 h-14 rounded-lg bg-white/[0.04] border border-white/10 overflow-hidden shrink-0">
                  {post.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-brand-red transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="bg-gradient-to-br from-brand-red/10 to-brand-green/10 border border-white/10 rounded-xl p-6">
        <h4 className="text-sm font-black uppercase text-white mb-2">
          Stay Ahead of the Curve
        </h4>
        <p className="text-gray-400 text-xs leading-relaxed mb-4">
          Get the latest tips, trends and insights delivered to your inbox.
        </p>

        {status === "success" ? (
          <p className="text-brand-green text-xs font-bold">You&apos;re subscribed — thanks!</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 min-w-0 bg-white/[0.06] border border-white/10 text-white text-xs placeholder-gray-500 rounded-l-lg px-3 py-2.5 outline-none focus:border-brand-red transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              aria-label="Subscribe"
              className="bg-brand-red hover:bg-red-600 disabled:opacity-60 text-white rounded-r-lg px-3 flex items-center justify-center transition-colors border-none cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </aside>
  );
};

export default BlogSidebar;
