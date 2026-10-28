"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/api";

const CATEGORY_LABELS = {
  THUMBNAIL: "Thumbnail",
  VIDEO_EDITING: "Video Editing",
  MOTION_GRAPHICS: "Motion Graphics",
  CONTENT_CREATION: "Content Creation",
  YOUTUBE: "YouTube",
  BUSINESS: "Business",
};

const BlogSidebar = ({
  categoryCounts = [],
  popularPosts = [],
  activeCategory = "",
  defaultQuery = "",
  hideSearch = false,
}) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | already_subscribed | invalid_email | error
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (status !== "idle" && status !== "loading") {
      setStatus("idle");
      setFeedbackMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading") return;

    const trimmed = (email || "").trim();

    if (!trimmed) {
      setStatus("invalid_email");
      setFeedbackMessage("Please enter your email address.");
      return;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setStatus("invalid_email");
      setFeedbackMessage("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    setStatus("loading");
    setFeedbackMessage("");

    try {
      const result = await subscribeToNewsletter(trimmed);
      if (result?.emailSent) {
        setStatus("confirmation_sent");
        setFeedbackMessage("Confirmation email sent! Please check your inbox (and spam folder).");
      } else {
        setStatus("unconfirmed");
        setFeedbackMessage(
          result?.message ||
            "You're subscribed! Note: Confirmation email delivery was skipped by email provider."
        );
      }
      setEmail("");
    } catch (err) {
      if (err.status === 409) {
        setStatus("already_subscribed");
        setFeedbackMessage(
          err.message || "This email is already subscribed to our newsletter! We've got you covered."
        );
      } else if (err.status === 400) {
        setStatus("invalid_email");
        setFeedbackMessage(err.message || "Please enter a valid email address.");
      } else if (err.status === 429) {
        setStatus("error");
        setFeedbackMessage("Too many subscription attempts. Please wait a minute before trying again.");
      } else {
        setStatus("error");
        setFeedbackMessage(err.message || "Failed to subscribe. Please try again.");
      }
    }
  };

  return (
    <aside className="flex flex-col gap-8 sm:gap-10 lg:sticky lg:top-28">
      {/* 1. Article Search Bar (Top of Sidebar, Above Categories) */}
      {!hideSearch && (
        <section aria-label="Search articles">
          <form action="/blog" method="GET" className="w-full">
            {activeCategory ? (
              <input type="hidden" name="category" value={activeCategory} />
            ) : null}
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-brand-red transition-colors" />
              <input
                type="text"
                name="q"
                defaultValue={defaultQuery}
                placeholder="Search articles..."
                className="w-full bg-[#0d0d0d] hover:bg-[#111111] focus:bg-[#111111] border border-white/10 hover:border-white/20 focus:border-brand-red rounded-none pl-10 pr-4 py-3 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 outline-none transition-all font-sans"
              />
            </div>
          </form>
        </section>
      )}

      {/* 2. Categories */}
      {categoryCounts.length > 0 && (
        <section aria-label="Blog categories">
          <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-none bg-brand-red shrink-0" aria-hidden="true" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-neutral-300">
              Categories
            </h3>
          </div>
          <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
            {categoryCounts.map(({ category, name, count }) => {
              const isActive = activeCategory === category;
              const displayName = name || CATEGORY_LABELS[category] || category;
              return (
                <li key={category}>
                  <Link
                    href={`/blog?category=${category}`}
                    scroll={false}
                    className={`group flex items-center justify-between py-2 px-3 rounded-none text-xs font-medium no-underline transition-all duration-200 ${
                      isActive
                        ? "bg-brand-red/10 border border-brand-red/30 text-white font-semibold"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06]"
                    }`}
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {displayName}
                    </span>
                    <span
                      className={`font-mono text-[11px] px-2 py-0.5 rounded-none border transition-colors ${
                        isActive
                          ? "bg-brand-red/20 text-brand-red border-brand-red/30 font-bold"
                          : "text-neutral-500 group-hover:text-neutral-300 bg-white/[0.03] border-white/[0.05]"
                      }`}
                    >
                      {count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Popular Posts */}
      {popularPosts.length > 0 && (
        <section aria-label="Popular articles">
          <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-none bg-brand-red shrink-0" aria-hidden="true" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-neutral-300">
              Popular Posts
            </h3>
          </div>
          <div className="flex flex-col divide-y divide-white/[0.06]">
            {popularPosts.map((post, idx) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex gap-3.5 py-3.5 first:pt-0 last:pb-0 no-underline text-inherit"
              >
                {/* Thumbnail / Index — Sharp Square */}
                <div className="w-16 h-16 rounded-none bg-[#141414] border border-white/[0.08] overflow-hidden shrink-0 relative">
                  {post.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono font-bold text-xs text-neutral-600 bg-white/[0.02]">
                      0{idx + 1}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <h4 className="font-display font-semibold text-xs sm:text-sm text-neutral-200 group-hover:text-brand-red transition-colors leading-snug line-clamp-2 mb-1.5">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    {post.readingTime && (
                      <>
                        <span>•</span>
                        <span>{post.readingTime} min</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Editorial Newsletter Box — Sharp Minimal Edges */}
      <section
        aria-label="Newsletter subscription"
        className="relative bg-[#0d0d0d] border border-white/[0.08] rounded-none p-6 overflow-hidden"
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-red via-brand-red/40 to-transparent"
          aria-hidden="true"
        />

        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-red mb-2 block">
          Newsletter
        </span>
        <h4 className="font-display font-bold text-base sm:text-lg text-white mb-2 leading-snug">
          Stay Ahead of the Curve
        </h4>
        <p className="text-neutral-400 text-xs leading-relaxed mb-5">
          Get the latest video editing tips, motion trends, and creative strategies delivered to your inbox.
        </p>

        {status === "confirmation_sent" ? (
          <div
            role="status"
            aria-live="polite"
            className="bg-emerald-950/40 border border-emerald-500/40 rounded-none p-4 flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
            <div>
              <p className="text-brand-green text-xs font-mono font-bold uppercase tracking-wider">
                Confirmation Email Sent
              </p>
              <p className="text-neutral-300 text-xs font-sans mt-1 leading-relaxed">
                {feedbackMessage || "We've dispatched a confirmation email to your inbox. Please check your inbox and spam folder."}
              </p>
            </div>
          </div>
        ) : status === "unconfirmed" ? (
          <div
            role="status"
            aria-live="polite"
            className="bg-amber-500/10 border border-amber-500/30 rounded-none p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                Subscription Registered (Email Pending)
              </p>
              <p className="text-neutral-300 text-xs font-sans mt-1 leading-relaxed">
                {feedbackMessage || "You're subscribed! Note: Confirmation email delivery could not be completed by email provider."}
              </p>
            </div>
          </div>
        ) : status === "success" ? (
          <div
            role="status"
            aria-live="polite"
            className="bg-emerald-950/40 border border-emerald-500/30 rounded-none p-4 flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
            <div>
              <p className="text-brand-green text-xs font-mono font-bold uppercase tracking-wider">
                Subscribed Successfully
              </p>
              <p className="text-neutral-300 text-xs font-sans mt-1 leading-relaxed">
                {feedbackMessage || "You're subscribed — thank you! We'll keep you posted with our latest video editing insights."}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2.5">
            {status === "already_subscribed" && (
              <div
                role="status"
                aria-live="polite"
                className="bg-amber-500/10 border border-amber-500/30 rounded-none p-3.5 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                    Already Subscribed
                  </p>
                  <p className="text-neutral-300 text-xs font-sans mt-1 leading-relaxed">
                    {feedbackMessage || "This email is already registered on our list. You don't need to subscribe again — you're all set to receive upcoming updates!"}
                  </p>
                </div>
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                required
                disabled={status === "loading"}
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email address"
                aria-label="Email address for newsletter"
                aria-invalid={status === "invalid_email" ? "true" : "false"}
                className={`w-full bg-black/60 border ${
                  status === "invalid_email"
                    ? "border-rose-500/80 focus:border-rose-500"
                    : "border-white/10 focus:border-brand-red"
                } text-white text-xs placeholder-neutral-500 rounded-none px-3.5 py-2.5 outline-none transition-all font-sans disabled:opacity-50`}
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              aria-label="Subscribe to newsletter"
              className="w-full bg-brand-red hover:bg-[#dc2626] disabled:opacity-50 text-white font-mono text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-none flex items-center justify-center gap-2 transition-colors cursor-pointer border-none"
            >
              {status === "loading" ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <>
                  Subscribe Now <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {(status === "error" || status === "invalid_email") && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-center gap-1.5 text-xs text-rose-400 font-mono mt-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{feedbackMessage || "Subscription failed. Please try again."}</span>
              </div>
            )}

            <p className="text-[10px] text-neutral-500 text-center font-sans mt-1">
              Zero spam. Unsubscribe at any time.
            </p>
          </form>
        )}
      </section>
    </aside>
  );
};

export default BlogSidebar;
