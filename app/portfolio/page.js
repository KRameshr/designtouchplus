import PortfolioHero from "@/components/portfolio/PortfolioHero";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import ThumbnailGrid from "@/components/portfolio/ThumbnailGrid";
import CtaBanner from "@/components/ui/CtaBanner";
import { getStats, getPortfolio } from "@/lib/api";

export const metadata = {
  title: "Portfolio | DesignTouch+",
  description:
    "Explore our latest video editing, motion graphics, and thumbnail design projects.",
};

export default async function PortfolioPage() {
  const [stats, videoItems, thumbnailItems] = await Promise.all([
    getStats().catch(() => []),
    getPortfolio("VIDEO_EDITING").catch(() => []),
    getPortfolio("THUMBNAIL_DESIGN").catch(() => []),
  ]);

  return (
    <main className="bg-[#0a0a0a]">
      <PortfolioHero stats={stats} />
      <PortfolioGrid items={videoItems} />
      <ThumbnailGrid items={thumbnailItems} />
      <CtaBanner />
    </main>
  );
}
