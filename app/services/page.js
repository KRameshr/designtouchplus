import ServicesHero from "@/components/services/ServicesHero";
import ServicesGrid from "@/components/services/ServicesGrid";
import ProcessTimeline from "@/components/about/ProcessTimeline";
import ToolsRow from "@/components/services/ToolsRow";
import CtaBanner from "@/components/ui/CtaBanner";
import { getServices, getProcessSteps, getTools } from "@/lib/api";

export const metadata = {
  title: "Services | DesignTouch+",
  description:
    "Video editing, motion graphics, social media content, YouTube management, graphic design and branding services.",
};

export default async function ServicesPage() {
  const [services, processSteps, tools] = await Promise.all([
    getServices().catch(() => []),
    getProcessSteps("SERVICES").catch(() => []),
    getTools().catch(() => []),
  ]);

  return (
    <main className="bg-[#0a0a0a]">
      <ServicesHero />
      <ServicesGrid services={services} />
      <ProcessTimeline steps={processSteps} />
      <ToolsRow tools={tools} />
      <CtaBanner />
    </main>
  );
}
