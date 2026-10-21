import Hero from "@/components/home/Hero";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import Services from "@/components/home/Services";
import TrustedClients from "@/components/home/TrustedClients";
import ContactSection from "@/components/home/ContactSection";
import {
  getHeroContent,
  getFeaturedPortfolio,
  getServices,
  getClients,
  getTestimonials,
  getCompanyInfo,
} from "@/lib/api";

export const revalidate = 0;

export default async function HomePage() {
  // Fetched in parallel — they're independent, no reason to wait for one
  // before starting the other. getCompanyInfo() is also called in
  // app/layout.js for the Footer — Next.js automatically dedupes identical
  // fetch() calls within the same request, so this doesn't double the
  // network cost.
  const [heroContent, featuredVideos, featuredThumbnails, services, clients, testimonials, companyInfo] = await Promise.all([
    getHeroContent().catch((err) => {
      console.error("[HomePage] Failed to fetch hero content:", err?.message || err);
      return null;
    }),
    getFeaturedPortfolio("VIDEO_EDITING").catch(() => []),
    getFeaturedPortfolio("THUMBNAIL_DESIGN").catch(() => []),
    getServices().catch(() => []),
    getClients().catch(() => []),
    getTestimonials().catch(() => []),
    getCompanyInfo().catch(() => null),
  ]);

  return (
    <main className="bg-[#080808]">
      <Hero hero={heroContent} />
      <FeaturedProjects
        videoProjects={featuredVideos}
        thumbnailProjects={featuredThumbnails}
      />
      <Services services={services} />
      <TrustedClients clients={clients} testimonials={testimonials} />
      <ContactSection companyInfo={companyInfo} />
    </main>
  );
}
