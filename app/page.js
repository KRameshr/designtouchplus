import Hero from "@/components/home/Hero";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import Services from "@/components/home/Services";
import TrustedClients from "@/components/home/TrustedClients";
import ContactSection from "@/components/home/ContactSection";
import {
  getFeaturedPortfolio,
  getServices,
  getClients,
  getTestimonials,
  getCompanyInfo,
} from "@/lib/api";

export default async function HomePage() {
  // Fetched in parallel — they're independent, no reason to wait for one
  // before starting the other. getCompanyInfo() is also called in
  // app/layout.js for the Footer — Next.js automatically dedupes identical
  // fetch() calls within the same request, so this doesn't double the
  // network cost.
  const [featuredProjects, services, clients, testimonials, companyInfo] = await Promise.all([
    getFeaturedPortfolio().catch(() => []),
    getServices().catch(() => []),
    getClients().catch(() => []),
    getTestimonials().catch(() => []),
    getCompanyInfo().catch(() => null),
  ]);

  return (
    <main className="bg-[#0a0a0a]">
      <Hero />
      <FeaturedProjects projects={featuredProjects} />
      <Services services={services} />
      <TrustedClients clients={clients} testimonials={testimonials} />
      <ContactSection companyInfo={companyInfo} />
    </main>
  );
}
