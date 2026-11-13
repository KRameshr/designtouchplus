"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { cloudinaryImageUrl, cloudinaryResponsiveImageProps } from "@/lib/cloudinaryImages.mjs";

/* =========================================================================
   SECTION A: FEATURED VIDEO EDITING (CINEMATIC 3 × 2 GALLERY)
   ========================================================================= */
const PAGE_SIZE = 6;

function getVideoPoster(videoUrl) {
  if (!videoUrl?.includes("res.cloudinary.com") || !videoUrl.includes("/video/upload/")) {
    return undefined;
  }

  return videoUrl
    .replace("/video/upload/", "/video/upload/so_0/")
    .replace(/\.(mp4|mov|webm)(\?.*)?$/i, ".jpg$2");
}

function FeaturedVideoSection({ videos = [] }) {
  const [activeMediaId, setActiveMediaId] = useState(null);
  const [hoveredMediaId, setHoveredMediaId] = useState(null);
  const [focusedMediaId, setFocusedMediaId] = useState(null);
  const [touchMediaId, setTouchMediaId] = useState(null);
  const [videoErrors, setVideoErrors] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const videoRefs = useRef({});

  if (!videos.length) return null;

  const featuredVideos = videos.slice(0, PAGE_SIZE);

  const togglePreview = (projectId) => {
    const video = videoRefs.current[projectId];
    if (!video || videoErrors[projectId]) return;

    if (!video.paused) {
      video.pause();
      setActiveMediaId((current) => (current === projectId ? null : current));
      return;
    }

    Object.entries(videoRefs.current).forEach(([otherId, otherVideo]) => {
      if (otherId !== String(projectId) && otherVideo && !otherVideo.paused) {
        otherVideo.pause();
      }
    });

    video.muted = true;
    setActiveMediaId(projectId);
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        setActiveMediaId((current) => (current === projectId ? null : current));
      });
    }
  };

  return (
    <section
      id="featured-videos"
      aria-labelledby="featured-videos-heading"
      className="relative overflow-hidden border-b border-white/[0.08] bg-[#080808] py-14 text-white sm:py-16 lg:py-20"
    >
      <div className="global-container">
        <div className="mb-7 grid grid-cols-1 items-end gap-5 sm:mb-9 lg:grid-cols-2 lg:gap-10">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2.5 text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-neutral-300 sm:text-[11px]">
              <span className="h-2.5 w-2.5 shrink-0 border-2 border-brand-red" aria-hidden="true" />
              <span>OUR WORK // VIDEO EDITING</span>
            </div>
            <h2 id="featured-videos-heading" className="font-display text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl md:text-5xl">
              <span className="text-white">Video </span><span className="text-brand-red">Portfolio</span>
            </h2>
            <span className="mt-3 block h-[2px] w-10 bg-brand-red" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 items-end lg:justify-end lg:border-l lg:border-white/20 lg:py-1 lg:pl-6">
            <p className="max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base lg:max-w-lg">
              A collection of our best video editing work &mdash; commercial edits, brand reels, YouTube content, and cinematic visual stories.
            </p>
          </div>
        </div>

        <div
          data-testid="featured-video-grid"
          className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {featuredVideos.map((project, index) => {
            const projectId = project.id || project.slug || `featured-video-${index}`;
            const hasVideo = Boolean(project.videoUrl);
            const mediaSrc = project.thumbnailUrl || project.imageUrl || getVideoPoster(project.videoUrl);
            const hasVideoError = Boolean(videoErrors[projectId]);
            const hasImageError = Boolean(imageErrors[projectId]);

            const displayCategory = project.categoryName || project.subCategory || project.category || "";
            const isPlaying = activeMediaId === projectId;
            const controlsVisible = isPlaying || hoveredMediaId === projectId || focusedMediaId === projectId || touchMediaId === projectId;

            return (
                <article
                  key={projectId}
                  data-testid="featured-video-card"
                  data-playing={isPlaying}
                  className="featured-video-card group min-w-0 overflow-hidden border border-white/10 bg-[#0b0b0b] transition-colors hover:border-white/25 focus-within:border-brand-red"
                  onMouseEnter={() => setHoveredMediaId(projectId)}
                  onMouseLeave={() => setHoveredMediaId((current) => (current === projectId ? null : current))}
                  onTouchStart={() => setTouchMediaId(projectId)}
                  onFocus={() => setFocusedMediaId(projectId)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setFocusedMediaId((current) => (current === projectId ? null : current));
                    }
                  }}
                >
                  <div
                    data-testid="video-card-thumbnail-container"
                    className="relative aspect-video overflow-hidden bg-[#111]"
                  >
                    {hasVideo && !hasVideoError ? (
                      <video
                        ref={(element) => {
                          if (element) videoRefs.current[projectId] = element;
                          else delete videoRefs.current[projectId];
                        }}
                        src={project.videoUrl}
                        poster={mediaSrc && !hasImageError ? (cloudinaryImageUrl(mediaSrc, 960) || mediaSrc) : undefined}
                        playsInline
                        muted
                        loop
                        preload="none"
                        onPlay={() => setActiveMediaId(projectId)}
                        onPause={() => setActiveMediaId((current) => (current === projectId ? null : current))}
                        onError={() => setVideoErrors((current) => ({ ...current, [projectId]: true }))}
                        className="featured-video-video pointer-events-none h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                        aria-label={`Preview of ${project.title}`}
                      />
                    ) : mediaSrc && !hasImageError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        {...cloudinaryResponsiveImageProps(mediaSrc, { widths: [320, 480, 640, 960], sizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw", fallbackWidth: 640 })}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        onError={() => setImageErrors((current) => ({ ...current, [projectId]: true }))}
                        className="featured-video-image h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-5 text-center text-sm font-semibold text-neutral-300">
                        {project.title}
                      </div>
                    )}

                    <div
                      data-testid="featured-video-overlay"
                      className={`pointer-events-none absolute inset-0 bg-black/35 transition-opacity duration-200 motion-reduce:transition-none ${controlsVisible ? "opacity-100" : "opacity-0"}`}
                      aria-hidden="true"
                    />
                    <div
                      data-testid="featured-video-controls"
                      className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-200 motion-reduce:transition-none ${controlsVisible ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
                    >
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          togglePreview(projectId);
                        }}
                        disabled={!hasVideo || hasVideoError}
                        aria-label={`${isPlaying ? "Pause" : "Play"} preview of ${project.title}`}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-black/60 text-white backdrop-blur-sm transition-colors hover:border-brand-red hover:bg-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-14 sm:w-14"
                      >
                        {isPlaying ? (
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                            <path d="M7 5h4v14H7zM15 5h4v14h-4z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true">
                            <path d="M6 4.7a1 1 0 0 1 1.5-.86l12 7.3a1 1 0 0 1 0 1.72l-12 7.3A1 1 0 0 1 6 19.3z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex min-h-[100px] items-center justify-between gap-3 p-4 sm:p-5">
                    <div className="min-w-0 border-l-2 border-brand-red pl-3">
                      <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-white sm:text-base">
                        <Link href={`/portfolio/${project.slug || project.id}`} className="text-white no-underline transition-colors hover:text-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                          {project.title}
                        </Link>
                      </h3>
                      {displayCategory && (
                        <p className="mt-1.5 truncate text-[10px] font-mono uppercase tracking-[0.12em] text-neutral-400 sm:text-[11px]">
                          {displayCategory}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/portfolio/${project.slug || project.id}`}
                      className="inline-flex min-h-9 shrink-0 items-center gap-1.5 border border-brand-red bg-brand-red px-3 py-2 text-[9px] font-mono font-bold uppercase tracking-[0.08em] text-white no-underline transition-colors hover:bg-[#dc2626] sm:min-h-10 sm:px-3.5 sm:text-[10px] sm:tracking-[0.1em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      VIEW PROJECT <span aria-hidden="true">&#8599;</span>
                    </Link>
                  </div>
                </article>
            );
          })}
        </div>

        <div className="mt-9 flex items-center gap-4 sm:mt-12 sm:gap-6">
          <span className="h-px flex-1 bg-white/40" aria-hidden="true" />
          <Link
            href="/portfolio#video-editing"
            className="inline-flex min-h-12 -skew-x-6 items-center justify-center bg-brand-red px-7 py-3 text-xs font-mono font-bold uppercase tracking-[0.14em] text-white no-underline transition-colors hover:bg-[#dc2626] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:min-h-14 sm:px-10 sm:text-sm"
          >
            <span className="skew-x-6">VIEW FULL PORTFOLIO &#8599;</span>
          </Link>
          <span className="h-px flex-1 bg-white/40" aria-hidden="true" />
        </div>
      </div>

    </section>
  );
}
/* =========================================================================
   SECTION B: FEATURED THUMBNAIL DESIGN (3 × 2 GRID WITH PAGINATION)
   ========================================================================= */
function FeaturedThumbnailSection({ thumbnails = [] }) {
  const [imageErrors, setImageErrors] = useState({});
  const featuredThumbnails = thumbnails.slice(0, PAGE_SIZE);

  if (featuredThumbnails.length === 0) return null;

  return (
    <section
      id="featured-thumbnails"
      aria-label="Featured Thumbnail Design"
      className="bg-[#0a0a0a] text-white py-16 sm:py-20 lg:py-24 border-b border-white/[0.08]"
    >
      <div className="global-container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 sm:mb-3.5">
              <span className="w-2 h-2 bg-brand-red inline-block shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                PACKAGING // HIGH-CTR VISUALS
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase leading-[1.05] tracking-tight text-white">
              <span className="block">FEATURED</span>
              <span className="block text-[#F04444]">THUMBNAIL DESIGN</span>
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm mt-3 font-normal leading-relaxed max-w-xl">
              High-conversion YouTube packaging, bespoke typography, and high-impact visual hooks engineered to maximize click-through rate.
            </p>
          </div>
          <Link
            href="/portfolio#thumbnails"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.16em] text-neutral-300 hover:text-white transition-colors no-underline py-2"
          >
            <span>View All Thumbnails</span>
            <span aria-hidden="true">?</span>
          </Link>
        </div>

        <div
          data-testid="featured-thumbnail-grid"
          style={{ gap: "0.5%" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-stretch"
        >
          {featuredThumbnails.map((item, idx) => {
            const mediaSrc = item.thumbnailUrl || item.imageUrl;
            const key = item.id || item.slug || idx;
            const href = "/portfolio/" + (item.slug || item.id);
            const hasImageError = Boolean(imageErrors[key]);

            return (
              <article
                key={key}
                data-testid="featured-thumbnail-card"
                className="group relative min-w-0 overflow-hidden bg-[#0c0c0c]"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#111]">
                  {mediaSrc && !hasImageError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      {...cloudinaryResponsiveImageProps(mediaSrc, { widths: [320, 480, 640, 960], sizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw", fallbackWidth: 640 })}
                      alt={item.title || "Featured thumbnail design"}
                      loading="lazy"
                      decoding="async"
                      onError={() => setImageErrors((prev) => ({ ...prev, [key]: true }))}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#111] px-5 text-center">
                      <span className="font-display text-xl sm:text-2xl font-black uppercase text-white">
                        {item.title}
                      </span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" aria-hidden="true" />
                  <h3 className="pointer-events-none absolute inset-x-4 bottom-4 z-10 font-display text-lg sm:text-xl font-black uppercase tracking-wide text-white drop-shadow-md">
                    {item.title}
                  </h3>
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                    <Link
                      href={href}
                      aria-label={"View packaging for " + item.title}
                      className="rounded-sm border border-brand-red bg-brand-red px-4 py-3 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-white no-underline transition-colors hover:bg-[#dc2626] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      VIEW PACKAGING <span aria-hidden="true">?</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   MAIN EXPORT: FEATURED PROJECTS (SEPARATES VIDEO AND THUMBNAIL PROJECTS)
   ========================================================================= */
export default function FeaturedProjects({ projects, videoProjects, thumbnailProjects }) {
  // Support either explicitly partitioned props or single array partitioned by contentType
  const finalVideos = useMemo(() => {
    if (Array.isArray(videoProjects) && videoProjects.length > 0) return videoProjects;
    if (Array.isArray(projects)) {
      return projects.filter((p) => p && p.contentType === "VIDEO_EDITING");
    }
    return [];
  }, [videoProjects, projects]);

  const finalThumbnails = useMemo(() => {
    if (Array.isArray(thumbnailProjects) && thumbnailProjects.length > 0) return thumbnailProjects;
    if (Array.isArray(projects)) {
      return projects.filter((p) => p && p.contentType === "THUMBNAIL_DESIGN");
    }
    return [];
  }, [thumbnailProjects, projects]);

  if (finalVideos.length === 0 && finalThumbnails.length === 0) {
    return null;
  }

  return (
    <>
      {finalVideos.length > 0 && <FeaturedVideoSection videos={finalVideos} />}
      {finalThumbnails.length > 0 && <FeaturedThumbnailSection thumbnails={finalThumbnails} />}
    </>
  );
}
