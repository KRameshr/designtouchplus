import PricingHero from "@/components/pricing/PricingHero";
import PricingCards from "@/components/pricing/PricingCards";
import AddOnsRow from "@/components/pricing/AddOnsRow";
import ProcessTimeline from "@/components/about/ProcessTimeline";
import FaqAccordion from "@/components/ui/FaqAccordion";
import CtaBanner from "@/components/ui/CtaBanner";
import { getPricingPlans, getAddOns, getProcessSteps, getFaqs } from "@/lib/api";

export const metadata = {
  title: "Pricing | DesignTouch+",
  description:
    "Simple, transparent pricing for video editing, motion graphics, and creative content services.",
};

export default async function PricingPage() {
  const [oneTimePlans, monthlyPlans, addOns, processSteps, faqs] = await Promise.all([
    getPricingPlans("ONE_TIME").catch(() => []),
    getPricingPlans("MONTHLY").catch(() => []),
    getAddOns().catch(() => []),
    getProcessSteps("PRICING").catch(() => []),
    getFaqs("PRICING").catch(() => []),
  ]);

  return (
    <main className="bg-[#0a0a0a]">
      <PricingHero />
      <PricingCards oneTimePlans={oneTimePlans} monthlyPlans={monthlyPlans} />
      <AddOnsRow addOns={addOns} />
      <ProcessTimeline steps={processSteps} />
      <FaqAccordion faqs={faqs} />
      <CtaBanner />
    </main>
  );
}
