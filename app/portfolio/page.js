import PortfolioHero from "@/components/portfolio/PortfolioHero";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import ThumbnailGrid from "@/components/portfolio/ThumbnailGrid";
import PortfolioCta from "@/components/portfolio/PortfolioCta";
import {
  getStats,
  getPortfolio,
  getFeaturedPortfolio,
  getPortfolioPageContent,
  getPortfolioPageTags,
  getPortfolioCategories,
} from "@/lib/api";

export const metadata = {
  title: "Portfolio | DesignTouch+",
  description:
    "Explore our latest video editing, motion graphics, and thumbnail design projects.",
};

export const revalidate = 0;

export default async function PortfolioPage() {
  const [
    introContent,
    tags,
    stats,
    videoItems,
    thumbnailItems,
    featuredItems,
    videoCategories,
    thumbnailCategories,
  ] = await Promise.all([
    getPortfolioPageContent().catch(() => null),
    getPortfolioPageTags().catch(() => []),
    getStats().catch(() => []),
    getPortfolio("VIDEO_EDITING").catch(() => []),
    getPortfolio("THUMBNAIL_DESIGN").catch(() => []),
    getFeaturedPortfolio().catch(() => []),
    getPortfolioCategories("VIDEO_EDITING").catch(() => []),
    getPortfolioCategories("THUMBNAIL_DESIGN").catch(() => []),
  ]);

  // Select the showcase project for the hero split fallback
  const featuredProject = featuredItems?.[0] || videoItems?.[0] || null;

  return (
    <main className="bg-[#080808] min-h-screen text-white">
      <PortfolioHero
        introContent={introContent}
        tags={tags}
        stats={stats}
        featuredProject={featuredProject}
      />
      <PortfolioGrid items={videoItems} categories={videoCategories} />
      <ThumbnailGrid items={thumbnailItems} categories={thumbnailCategories} />
      <PortfolioCta />
    </main>
  );
}
