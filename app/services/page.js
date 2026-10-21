import ServicesHero from "@/components/services/ServicesHero";
import ServicesGrid from "@/components/services/ServicesGrid";
import ServicesProcess from "@/components/services/ServicesProcess";
import ToolsRow from "@/components/services/ToolsRow";
import ServicesCta from "@/components/services/ServicesCta";
import {
  getServices,
  getProcessSteps,
  getTools,
  getServicesPageContent,
} from "@/lib/api";

export const metadata = {
  title: "Services | DesignTouch+",
  description:
    "Video editing, motion graphics, social media content, YouTube management, graphic design, thumbnail design, and commercial video services.",
};

export default async function ServicesPage() {
  const [content, services, processSteps, tools] = await Promise.all([
    getServicesPageContent().catch(() => null),
    getServices().catch(() => []),
    getProcessSteps("SERVICES").catch(() => []),
    getTools().catch(() => []),
  ]);

  return (
    <main className="bg-[#080808] min-h-screen text-white">
      <ServicesHero content={content} />
      <ServicesGrid services={services} content={content} />
      <ServicesProcess steps={processSteps} content={content} />
      <ToolsRow tools={tools} content={content} />
      <ServicesCta content={content} />
    </main>
  );
}
