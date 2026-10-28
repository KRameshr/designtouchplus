import PricingHero from "@/components/pricing/PricingHero";
import PricingCards from "@/components/pricing/PricingCards";
import AddOnsRow from "@/components/pricing/AddOnsRow";
import PricingProcess from "@/components/pricing/PricingProcess";
import PricingFaqs from "@/components/pricing/PricingFaqs";
import PricingCta from "@/components/pricing/PricingCta";
import {
  getPricingPlans,
  getPricingPageContent,
  getPricingHeroBanners,
  getAddOns,
  getProcessSteps,
  getFaqs,
} from "@/lib/api";

export const metadata = {
  title: "Pricing | DesignTouch+",
  description:
    "Simple, transparent pricing for video editing, motion graphics, and creative content services.",
};

export default async function PricingPage() {
  const [heroContent, heroBanners, oneTimePlans, monthlyPlans, addOns, processSteps, faqs] =
    await Promise.all([
      getPricingPageContent().catch(() => null),
      getPricingHeroBanners().catch(() => []),
      getPricingPlans("ONE_TIME").catch(() => []),
      getPricingPlans("MONTHLY").catch(() => []),
      getAddOns().catch(() => []),
      getProcessSteps("PRICING").catch(() => []),
      getFaqs("PRICING").catch(() => []),
    ]);

  return (
    <main className="bg-[#080808] overflow-x-clip">
      <PricingHero content={heroContent} initialBanners={heroBanners} />
      <PricingCards oneTimePlans={oneTimePlans} monthlyPlans={monthlyPlans} />
      <AddOnsRow addOns={addOns} />
      <PricingProcess steps={processSteps} />
      <PricingFaqs faqs={faqs} />
      <PricingCta />
    </main>
  );
}
