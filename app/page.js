import Hero from "@/components/home/Hero";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import Services from "@/components/home/Services";
import TrustedClients from "@/components/home/TrustedClients";
import ContactSection from "@/components/home/ContactSection";
import {
  getHeroContent,
  getFeaturedPortfolio,
  getPortfolio,
  getServices,
  getClients,
  getTestimonials,
  getCompanyInfo,
  getContactPageContent,
} from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: {
    absolute: "DesignTouch+ | Creative Studio",
  },
};

export default async function HomePage() {
  // Fetched in parallel — they're independent, no reason to wait for one
  // before starting the other. getCompanyInfo() is also called in
  // app/layout.js for the Footer — Next.js automatically dedupes identical
  // fetch() calls within the same request, so this doesn't double the
  // network cost.
  const [
    heroContent,
    featuredVideos,
    featuredThumbnails,
    allThumbnails,
    services,
    clients,
    testimonials,
    companyInfo,
    contactContent,
  ] = await Promise.all([
    getHeroContent().catch((err) => {
      console.error("[HomePage] Failed to fetch hero content:", err?.message || err);
      return null;
    }),
    getFeaturedPortfolio("VIDEO_EDITING").catch(() => []),
    getFeaturedPortfolio("THUMBNAIL_DESIGN").catch(() => []),
    getPortfolio("THUMBNAIL_DESIGN").catch(() => []),
    getServices().catch(() => []),
    getClients().catch(() => []),
    getTestimonials().catch(() => []),
    getCompanyInfo().catch(() => null),
    getContactPageContent().catch(() => null),
  ]);

  return (
    <main className="bg-[#080808]">
      <Hero hero={heroContent} />
      <FeaturedProjects
        videoProjects={featuredVideos}
        thumbnailProjects={[
          ...new Map(
            [...(featuredThumbnails || []), ...(allThumbnails || [])]
              .filter((item) => item && (item.id || item.slug))
              .map((item) => [item.id || item.slug, item]),
          ).values(),
        ].slice(0, 6)}
      />
      <Services services={services} />
      <TrustedClients clients={clients} testimonials={testimonials} />
      <ContactSection
        companyInfo={companyInfo}
        contactContent={contactContent}
      />
    </main>
  );
}
