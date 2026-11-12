import Hero from "@/components/home/Hero";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import Services from "@/components/home/Services";
import TrustedClients from "@/components/home/TrustedClients";
import ContactSection from "@/components/home/ContactSection";
import { connection } from "next/server";
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

export const metadata = {
  title: {
    absolute: "DesignTouch+ | Creative Studio",
  },
};

export default async function HomePage() {
  // Render per request, while allowing explicitly revalidated public API fetches
  // to use the OpenNext incremental cache when a persistent cache provider exists.
  await connection();

  // These independent content reads are started together so the response does
  // not serialize their backend round trips.
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
