import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfoCards from "@/components/contact/ContactInfoCards";
import WorldMapSection from "@/components/contact/WorldMapSection";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { getCompanyInfo, getFaqs } from "@/lib/api";

export const metadata = {
  title: "Contact | DesignTouch+",
  description:
    "Have a project in mind? Get in touch with DesignTouch+ for video editing, motion graphics, and creative content services.",
};

export default async function ContactPage() {
  const [companyInfo, faqs] = await Promise.all([
    getCompanyInfo().catch(() => null),
    getFaqs("GENERAL").catch(() => []),
  ]);

  return (
    <main className="bg-[#0a0a0a]">
      <ContactHero />

      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          <ContactInfoCards companyInfo={companyInfo} />
        </div>
      </section>

      <WorldMapSection mapEmbedUrl={companyInfo?.mapEmbedUrl} />
      <FaqAccordion faqs={faqs} heading="Frequently Asked Questions" />
    </main>
  );
}
