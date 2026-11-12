import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfoCards from "@/components/contact/ContactInfoCards";
import WorldMapSection from "@/components/contact/WorldMapSection";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { connection } from "next/server";
import { getCompanyInfo, getFaqs, getContactPageContent } from "@/lib/api";

export const metadata = {
  title: "Contact",
  description:
    "Have a project in mind? Get in touch with DesignTouch+ for video editing, motion graphics, and creative content services.",
};

// Approved fallback FAQs in case the database is empty or the API is unreachable
const FALLBACK_GENERAL_FAQS = [
  {
    id: "faq-fb-1",
    question: "How soon can you start my project?",
    answer:
      "We typically start within 1-2 business days of confirming your creative brief and project scope.",
  },
  {
    id: "faq-fb-2",
    question: "Do you sign NDAs for projects?",
    answer:
      "Yes, we are happy to sign an NDA before receiving any sensitive project files or proprietary media.",
  },
  {
    id: "faq-fb-3",
    question: "What assets do you need to begin?",
    answer:
      "Raw video footage, high-resolution logos, brand style guidelines, and a brief summary of your creative vision or reference links.",
  },
  {
    id: "faq-fb-4",
    question: "How do you handle revisions and client feedback?",
    answer:
      "We share timestamped review links where you can add comments directly onto the video frames. Minor revisions are typically delivered within 24 to 48 hours.",
  },
  {
    id: "faq-fb-5",
    question: "How does billing and international payment work?",
    answer:
      "We accept secure international bank transfers, Stripe, and credit card payments with transparent milestone invoices.",
  },
];

export default async function ContactPage() {
  await connection();

  const [contactContent, companyInfo, faqs] = await Promise.all([
    getContactPageContent().catch(() => null),
    getCompanyInfo().catch(() => null),
    getFaqs("GENERAL").catch(() => []),
  ]);

  const displayFaqs =
    Array.isArray(faqs) && faqs.length > 0 ? faqs : FALLBACK_GENERAL_FAQS;

  return (
    <main className="bg-[#0a0a0a]">
      <ContactHero content={contactContent} />

      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-7 xl:col-span-8">
            <ContactForm />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <ContactInfoCards companyInfo={companyInfo} content={contactContent} />
          </div>
        </div>
      </section>

      <WorldMapSection mapEmbedUrl={companyInfo?.mapEmbedUrl} />
      <FaqAccordion faqs={displayFaqs} heading="Frequently Asked Questions" />
    </main>
  );
}
