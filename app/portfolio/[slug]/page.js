import { notFound } from "next/navigation";
import Link from "next/link";
import { getPortfolio, getPortfolioItem } from "@/lib/api";
import ShareButton from "@/components/portfolio/ShareButton";
import ProjectEnquiryModal from "@/components/portfolio/ProjectEnquiryModal";
import ThumbnailDownloadButton from "@/components/portfolio/ThumbnailDownloadButton";

export const revalidate = 0;

function getEmbedUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).at(-1);
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).at(-1);
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

function formatRatio(ratio) {
  return ({ RATIO_9_16: "9:16", RATIO_1_1: "1:1", RATIO_4_5: "4:5", RATIO_16_9: "16:9", AUTO: "Original" })[ratio] || ratio || "Not specified";
}

function formatDate(date) {
  if (!date) return "Not specified";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "Not specified" : new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(parsed);
}

function projectPath(project) {
  return `/portfolio/${project.slug || project.id}`;
}

function ProjectCard({ project }) {
  const image = project.thumbnailUrl || project.imageUrl;
  return (
    <Link href={projectPath(project)} className="group min-w-0 overflow-hidden border border-white/10 bg-[#101010] transition-colors hover:border-brand-red">
      <div className="aspect-video overflow-hidden bg-black">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-neutral-600">Project preview</div>
        )}
      </div>
      <div className="p-4">
        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.16em] text-brand-red">{project.categoryName || project.subCategory || "DesignTouch+ Project"}</p>
        <h3 className="line-clamp-2 text-base font-bold text-white transition-colors group-hover:text-brand-red">{project.title}</h3>
      </div>
    </Link>
  );
}

export async function generateMetadata({ params }) {
  const project = await getPortfolioItem(params.slug).catch(() => null);
  return {
    title: project ? `${project.title} | Portfolio` : "Project Details | Portfolio",
    description: project?.description || "Explore our portfolio of video editing and visual design projects.",
  };
}

export default async function PortfolioDetailPage({ params }) {
  const project = await getPortfolioItem(params.slug).catch(() => null);
  if (!project) notFound();

  const isVideo = project.contentType === "VIDEO_EDITING";
  const contentType = project.contentType || "VIDEO_EDITING";
  const [sameTypeItems, videoItems, thumbnailItems] = await Promise.all([
    getPortfolio(contentType).catch(() => []),
    getPortfolio("VIDEO_EDITING").catch(() => []),
    getPortfolio("THUMBNAIL_DESIGN").catch(() => []),
  ]);
  const currentItems = (sameTypeItems || []).length ? sameTypeItems : [project];
  const currentIndex = currentItems.findIndex((item) => item.id === project.id || item.slug === project.slug);
  const nextProject = currentIndex >= 0 && currentItems.length > 1 ? currentItems[(currentIndex + 1) % currentItems.length] : null;
  const previousProject = currentIndex > 0 ? currentItems[currentIndex - 1] : null;
  const relatedProjects = [...(videoItems || []), ...(thumbnailItems || [])]
    .filter((item, index, items) => (item.id !== project.id && item.slug !== project.slug) && items.findIndex((candidate) => candidate.id === item.id) === index)
    .sort((a, b) => {
      const aMatch = a.categoryId && a.categoryId === project.categoryId ? 1 : 0;
      const bMatch = b.categoryId && b.categoryId === project.categoryId ? 1 : 0;
      return bMatch - aMatch || (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    })
    .slice(0, 3);
  const posterSrc = project.thumbnailUrl || project.imageUrl || null;
  const embedUrl = !project.videoUrl && project.liveVideoUrl ? getEmbedUrl(project.liveVideoUrl) : null;
  const category = project.categoryName || project.subCategory || project.category || (isVideo ? "Video Editing" : "Thumbnail Design");
  const services = [...new Set([isVideo ? "Video Editing" : "Thumbnail Design", project.categoryName, project.subCategory].filter(Boolean))];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080808] pb-20 text-white selection:bg-brand-red selection:text-white">
      <div className="global-container pt-5 sm:pt-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <Link href="/portfolio" className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 transition-colors hover:text-white">← Back to Portfolio</Link>
          <div className="hidden min-w-0 truncate text-[10px] font-mono uppercase tracking-widest text-neutral-500 sm:block">Portfolio <span className="px-2 text-neutral-700">/</span>{category}<span className="px-2 text-neutral-700">/</span><span className="text-brand-red">{project.title}</span></div>
          <ShareButton title={project.title} />
        </div>

        <section className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)] lg:gap-12 xl:gap-16">
          <div className="min-w-0">
            <div className="relative aspect-video w-full overflow-hidden border border-white/10 bg-black shadow-2xl">
              {project.videoUrl ? (
                <video src={project.videoUrl} poster={posterSrc || undefined} controls playsInline preload="metadata" className="h-full w-full bg-black object-contain" aria-label={`${project.title} video`} />
              ) : embedUrl ? (
                <iframe src={embedUrl} title={project.title} className="h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
              ) : posterSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={posterSrc} alt={project.title} className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-mono uppercase tracking-widest text-neutral-500">Project media unavailable</div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500">
              <span>{isVideo ? "Project film" : "Project artwork"}</span>
              <span>{formatRatio(project.videoAspectRatio)}</span>
            </div>
          </div>

          <div className="flex min-w-0 flex-col lg:pt-1">
            <span className="mb-4 inline-flex w-fit items-center gap-2 bg-brand-red px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.16em]">{category}</span>
            <h1 className="mb-5 break-words font-display text-3xl font-extrabold uppercase leading-[0.98] tracking-tight sm:text-4xl xl:text-5xl">{project.title}</h1>
            {project.description && <p className="mb-7 whitespace-pre-line text-sm leading-relaxed text-neutral-300 sm:text-base">{project.description}</p>}

            <dl className="mb-7 grid grid-cols-2 gap-x-5 border-y border-white/10 py-5">
              <div className="border-b border-white/[0.06] py-3"><dt className="mb-1 text-[10px] font-mono uppercase tracking-widest text-neutral-500">Duration</dt><dd className="text-sm text-white">{project.duration || "Not specified"}</dd></div>
              <div className="border-b border-white/[0.06] py-3"><dt className="mb-1 text-[10px] font-mono uppercase tracking-widest text-neutral-500">Aspect ratio</dt><dd className="text-sm text-white">{formatRatio(project.videoAspectRatio)}</dd></div>
              <div className="py-3"><dt className="mb-1 text-[10px] font-mono uppercase tracking-widest text-neutral-500">Published</dt><dd className="text-sm text-white">{formatDate(project.createdAt)}</dd></div>
              <div className="py-3"><dt className="mb-1 text-[10px] font-mono uppercase tracking-widest text-neutral-500">Project type</dt><dd className="text-sm text-white">{isVideo ? "Video Editing" : "Thumbnail Design"}</dd></div>
            </dl>

            {nextProject ? (
              <Link href={projectPath(nextProject)} className="inline-flex min-h-12 items-center justify-between gap-4 bg-brand-red px-5 py-4 text-xs font-mono font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-600">View Next Project <span aria-hidden="true">↗</span></Link>
            ) : (
              <Link href="/portfolio" className="inline-flex min-h-12 items-center justify-between gap-4 bg-brand-red px-5 py-4 text-xs font-mono font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-red-600">View All Projects <span aria-hidden="true">↗</span></Link>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {previousProject && <Link href={projectPath(previousProject)} className="border border-white/15 px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:border-white/40 hover:text-white">← Previous project</Link>}
              {project.liveVideoUrl && <a href={project.liveVideoUrl} target="_blank" rel="noopener noreferrer" className="border border-white/15 px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:border-white/40 hover:text-white">Watch live ↗</a>}
              {!isVideo && <ThumbnailDownloadButton project={project} />}
              {project.googleDriveUrl && <a href={project.googleDriveUrl} target="_blank" rel="noopener noreferrer" className="border border-white/15 px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:border-white/40 hover:text-white">Project files ↗</a>}
            </div>
          </div>
        </section>

        <section className="mt-16 grid min-w-0 grid-cols-1 gap-8 border-t border-white/10 pt-10 md:grid-cols-[minmax(0,1.5fr)_minmax(240px,0.7fr)] lg:mt-24 lg:gap-16">
          <div className="min-w-0">
            <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-brand-red">Project overview</p>
            <h2 className="mb-5 font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">The creative brief</h2>
            {project.description ? <p className="whitespace-pre-line text-sm leading-7 text-neutral-300 sm:text-base">{project.description}</p> : <p className="text-sm leading-7 text-neutral-500">No additional project description is available.</p>}
            {project.resourceLinks?.length > 0 && <div className="mt-6 flex flex-wrap gap-3">{project.resourceLinks.map((resource, index) => <a key={`${resource.url}-${index}`} href={resource.url} target="_blank" rel="noopener noreferrer" className="border border-white/15 px-4 py-3 text-xs text-neutral-300 transition-colors hover:border-brand-red hover:text-white">{resource.title || "Project resource"} ↗</a>)}</div>}
          </div>
          <aside className="min-w-0 border-t border-white/10 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">Services used</p>
            <h2 className="mb-5 font-display text-xl font-bold uppercase">Project services</h2>
            <ul className="space-y-3">{services.map((service) => <li key={service} className="flex items-center gap-3 border-b border-white/[0.07] pb-3 text-sm text-neutral-200"><span className="h-1.5 w-1.5 shrink-0 bg-brand-red" />{service}</li>)}</ul>
          </aside>
        </section>

        <section className="mt-16 border-t border-white/10 pt-10 lg:mt-24">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div><p className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-brand-red">Selected work</p><h2 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">More projects</h2></div>
            <Link href="/portfolio" className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:text-brand-red">View all projects ↗</Link>
          </div>
          {relatedProjects.length ? <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">{relatedProjects.map((item) => <ProjectCard key={item.id || item.slug} project={item} />)}</div> : <p className="text-sm text-neutral-500">More projects will appear here as they are published.</p>}
        </section>
      </div>
      <ProjectEnquiryModal project={project} />
    </main>
  );
}
