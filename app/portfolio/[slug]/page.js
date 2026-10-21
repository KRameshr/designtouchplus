import { notFound } from "next/navigation";
import Link from "next/link";
import { getPortfolioItem } from "@/lib/api";
import ShareButton from "@/components/portfolio/ShareButton";
import ProjectEnquiryModal from "@/components/portfolio/ProjectEnquiryModal";
import ThumbnailDownloadButton from "@/components/portfolio/ThumbnailDownloadButton";

export const revalidate = 0;

function getEmbedUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
      if (parsed.pathname.startsWith("/embed/")) return url;
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/")[2];
        if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      }
    }
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const id = parts[parts.length - 1];
      if (id && /^\d+$/.test(id)) {
        return `https://player.vimeo.com/video/${id}`;
      }
    }
  } catch (_) {
    return null;
  }
  return null;
}

function getDetailAspectClass(ratio) {
  if (ratio === "9:16" || ratio === "RATIO_9_16") return "aspect-[9/16] max-w-sm sm:max-w-md mx-auto";
  if (ratio === "1:1" || ratio === "RATIO_1_1") return "aspect-square max-w-xl mx-auto";
  if (ratio === "4:5" || ratio === "RATIO_4_5") return "aspect-[4/5] max-w-lg mx-auto";
  return "aspect-[16/9] w-full";
}

function getFormatDescription(ratio) {
  if (ratio === "9:16" || ratio === "RATIO_9_16") return "9:16 (Vertical Reel / Shorts)";
  if (ratio === "1:1" || ratio === "RATIO_1_1") return "1:1 (Square Social Feed)";
  if (ratio === "4:5" || ratio === "RATIO_4_5") return "4:5 (Portrait Feed Video)";
  if (ratio === "16:9" || ratio === "RATIO_16_9") return "16:9 (Landscape Widescreen)";
  if (ratio === "AUTO") return "Auto Detect / Original Ratio";
  return ratio || "16:9 Standard";
}

export async function generateMetadata({ params }) {
  const project = await getPortfolioItem(params.slug).catch(() => null);
  if (!project) {
    return {
      title: "Project Details | DesignTouch+ Portfolio",
      description: "Explore our curated portfolio of commercial campaigns and visual narratives.",
    };
  }

  return {
    title: `${project.title} | DesignTouch+ Portfolio`,
    description:
      project.description ||
      `Explore ${project.title} by DesignTouch+. High-converting visual narratives and commercial edits.`,
  };
}

export default async function PortfolioDetailPage({ params }) {
  const project = await getPortfolioItem(params.slug).catch(() => null);

  if (!project) {
    notFound();
  }

  const isVideo = project.contentType === "VIDEO_EDITING";
  const embedUrl = !project.videoUrl && project.liveVideoUrl ? getEmbedUrl(project.liveVideoUrl) : null;
  const posterSrc = project.imageUrl || project.thumbnailUrl || null;
  const categoryLabel = project.categoryName || project.subCategory || project.category || (isVideo ? "Video Editing" : "Thumbnail Design");

  return (
    <main className="bg-[#080808] text-white min-h-screen pb-20 selection:bg-brand-red selection:text-white">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="border-b border-white/[0.08] bg-[#0c0c0c]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors no-underline shrink-0 group"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="group-hover:-translate-x-0.5 transition-transform"
            >
              <path d="M10 6H2M2 6L6 2M2 6L6 10" />
            </svg>
            <span>Back to Portfolio</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neutral-500 truncate">
            <span>PORTFOLIO</span>
            <span>//</span>
            <span className="text-neutral-400 truncate">{categoryLabel}</span>
            <span>//</span>
            <span className="text-brand-red truncate">{project.title}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 bg-brand-red inline-block" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              {isVideo ? "4K MASTER ARCHIVE" : "HIGH-CTR PACKAGING"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {/* Project Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-brand-red text-white px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em]">
              <span className="w-1.5 h-1.5 bg-white rounded-none" />
              {isVideo ? "Video Editing" : "Thumbnail Design"}
            </span>
            <span className="inline-flex items-center bg-white/[0.05] border border-white/10 text-neutral-300 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em]">
              {categoryLabel}
            </span>
            {project.duration && (
              <span className="inline-flex items-center bg-white/[0.05] border border-white/10 text-neutral-400 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest">
                RUNTIME: {project.duration}
              </span>
            )}
            {isVideo && project.videoAspectRatio && project.videoAspectRatio !== "AUTO" && (
              <span className="inline-flex items-center bg-white/[0.05] border border-white/10 text-neutral-300 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em]">
                FORMAT: {project.videoAspectRatio}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight font-display text-white mb-4 leading-none">
            {project.title}
          </h1>

          {project.subCategory && project.subCategory !== categoryLabel && (
            <div className="text-xs sm:text-sm font-mono text-neutral-400 uppercase tracking-widest mb-3">
              SPECIFICATION // {project.subCategory}
            </div>
          )}
        </div>

        {/* Media Frame with Dynamic Format Sizing */}
        <div className="mb-8 flex justify-center">
          <div
            className={`relative ${getDetailAspectClass(
              project.videoAspectRatio
            )} bg-black border border-white/15 overflow-hidden shadow-2xl w-full`}
          >
            {project.videoUrl ? (
              <video
                src={project.videoUrl}
                poster={posterSrc || undefined}
                controls
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                title={project.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : posterSrc ? (
              <div className="w-full h-full relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterSrc}
                  alt={project.title}
                  className="w-full h-full object-contain bg-black"
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#111]">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500 mb-2">
                  [PROJECT MEDIA ARCHIVED]
                </span>
                <span className="text-sm font-display uppercase font-bold text-neutral-400">
                  {project.title}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Row — Only render available links, no empty buttons */}
        <div className="p-4 sm:p-6 bg-[#0e0e0e] border border-white/10 rounded-none mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {isVideo ? (
              <>
                {/* WATCH LIVE (Only if liveVideoUrl exists) */}
                {project.liveVideoUrl && (
                  <a
                    href={project.liveVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-[0.16em] border border-brand-red rounded-none transition-colors no-underline select-none"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M3 2L10 6L3 10V2Z" />
                    </svg>
                    <span>Watch Live</span>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9L9 3M9 3H4M9 3V8" />
                    </svg>
                  </a>
                )}

                {/* GOOGLE DRIVE (Only if googleDriveUrl exists) */}
                {project.googleDriveUrl && (
                  <a
                    href={project.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-mono font-bold uppercase tracking-[0.16em] border border-white/20 hover:border-white/40 rounded-none transition-colors no-underline select-none"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Google Drive</span>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9L9 3M9 3H4M9 3V8" />
                    </svg>
                  </a>
                )}

                {/* Commission CTA */}
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent hover:bg-white/[0.04] text-neutral-300 hover:text-white text-xs font-mono font-bold uppercase tracking-[0.16em] border border-white/15 hover:border-white/30 rounded-none transition-colors no-underline select-none"
                >
                  <span>Commission an Edit</span>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                {/* DOWNLOAD IMAGE for Thumbnail Design */}
                <ThumbnailDownloadButton project={project} />

                {/* OPEN GOOGLE DRIVE (Only if googleDriveUrl exists) */}
                {project.googleDriveUrl && (
                  <a
                    href={project.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-mono font-bold uppercase tracking-[0.16em] border border-white/20 hover:border-white/40 rounded-none transition-colors no-underline select-none"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Open Google Drive</span>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9L9 3M9 3H4M9 3V8" />
                    </svg>
                  </a>
                )}

                {/* ORDER THUMBNAILS CTA */}
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent hover:bg-white/[0.04] text-neutral-300 hover:text-white text-xs font-mono font-bold uppercase tracking-[0.16em] border border-white/15 hover:border-white/30 rounded-none transition-colors no-underline select-none"
                >
                  <span>Order Thumbnails</span>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" />
                  </svg>
                </Link>
              </>
            )}
          </div>

          {/* Share Action */}
          <div className="shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
            <ShareButton title={project.title} />
          </div>
        </div>

        {/* Content Layout: 2 Columns (Scope / Narrative + Project Spec Table) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 sm:p-8 bg-[#0c0c0c] border border-white/10 rounded-none">
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-white/[0.08]">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-300">
                  01 // Project Scope &amp; Creative Overview
                </span>
                <span className="text-[10px] font-mono text-neutral-500">SUMMARY</span>
              </div>

              {project.description ? (
                <div className="text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4 font-normal">
                  {project.description.split(/\n+/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm font-mono uppercase tracking-wider">
                  No extended creative brief archived for this release.
                </p>
              )}
            </div>

            {/* Additional Resource Links Section (Only rendered if items exist) */}
            {project.resourceLinks && project.resourceLinks.length > 0 && (
              <div className="p-6 sm:p-8 bg-[#0c0c0c] border border-white/10 rounded-none">
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-white/[0.08]">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-300">
                    02 // Additional Resources &amp; Client Deliverables
                  </span>
                  <span className="text-[10px] font-mono text-brand-red font-bold">
                    {project.resourceLinks.length} {project.resourceLinks.length === 1 ? "LINK" : "LINKS"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.resourceLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-black/60 hover:bg-black/90 border border-white/10 hover:border-brand-red transition-all group no-underline block"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-white group-hover:text-brand-red transition-colors">
                          {link.title}
                        </span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-neutral-500 group-hover:text-brand-red transition-colors shrink-0 mt-0.5"
                        >
                          <path d="M3 9L9 3M9 3H4M9 3V8" />
                        </svg>
                      </div>

                      {link.description && (
                        <p className="text-neutral-400 text-xs leading-normal line-clamp-2 mb-3">
                          {link.description}
                        </p>
                      )}

                      <div className="text-[10px] font-mono text-neutral-500 group-hover:text-neutral-300 truncate">
                        {link.url}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Specifications */}
          <div className="space-y-6">
            <div className="p-6 bg-[#0c0c0c] border border-white/10 rounded-none space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-300">
                  TECHNICAL SPECS
                </span>
                <span className="text-[10px] font-mono text-neutral-500">METRICS</span>
              </div>

              <div className="space-y-3.5 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                  <span className="text-neutral-500 uppercase">Content Type</span>
                  <span className="text-white uppercase font-bold">
                    {isVideo ? "Video Editing" : "Thumbnail Design"}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                  <span className="text-neutral-500 uppercase">Category</span>
                  <span className="text-brand-red uppercase font-bold">
                    {categoryLabel}
                  </span>
                </div>

                {project.subCategory && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                    <span className="text-neutral-500 uppercase">Tag / Sub</span>
                    <span className="text-neutral-300 uppercase">{project.subCategory}</span>
                  </div>
                )}

                {isVideo && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                    <span className="text-neutral-500 uppercase">Duration</span>
                    <span className="text-white">{project.duration || "N/A"}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                  <span className="text-neutral-500 uppercase">Aspect Ratio</span>
                  <span className="text-neutral-200">
                    {isVideo ? getFormatDescription(project.videoAspectRatio) : "16:9 Standard"}
                  </span>
                </div>

                {project.googleDriveUrl && (
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                    <span className="text-neutral-500 uppercase">Google Drive</span>
                    <a
                      href={project.googleDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-brand-red font-bold uppercase inline-flex items-center gap-1 transition-colors no-underline"
                    >
                      <span>Linked</span>
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9L9 3M9 3H4M9 3V8" />
                      </svg>
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 uppercase">Master Archive</span>
                  <span className="text-emerald-400 font-bold uppercase">● Secured</span>
                </div>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="p-6 bg-brand-red/10 border border-brand-red/30 rounded-none space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-brand-red block">
                COMMISSION WORK
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Need edits or packaging calibrated with this exact level of conversion and visual pacing?
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-white hover:underline pt-1 no-underline"
              >
                <span>Inquire With Our Studio</span>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Service Enquiry Popup (appears after ~2s or on scroll; session-dismissible) */}
      <ProjectEnquiryModal project={project} />
    </main>
  );
}

