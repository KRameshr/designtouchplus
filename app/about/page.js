import AboutHero from "@/components/about/AboutHero";
import OurStory from "@/components/about/OurStory";
import ValuesGrid from "@/components/about/ValuesGrid";
import ProcessTimeline from "@/components/about/ProcessTimeline";
import TeamGrid from "@/components/about/TeamGrid";
import { getAboutContent, getStats, getValues, getProcessSteps, getTeam } from "@/lib/api";

export const metadata = {
  title: "About Us | DesignTouch+",
  description:
    "We are a team of passionate storytellers, editors and creators who turn ideas into powerful visual experiences.",
};

export default async function AboutPage() {
  const [aboutContent, stats, values, processSteps, team] = await Promise.all([
    getAboutContent().catch(() => null),
    getStats().catch(() => []),
    getValues().catch(() => []),
    getProcessSteps("ABOUT").catch(() => []),
    getTeam().catch(() => []),
  ]);

  return (
    <main className="bg-[#0a0a0a]">
      <AboutHero aboutContent={aboutContent} stats={stats} />
      <OurStory aboutContent={aboutContent} />
      <ValuesGrid values={values} />
      <ProcessTimeline steps={processSteps} />
      <TeamGrid team={team} />
    </main>
  );
}
