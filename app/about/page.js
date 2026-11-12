import AboutHero from "@/components/about/AboutHero";
import OurStory from "@/components/about/OurStory";
import ValuesGrid from "@/components/about/ValuesGrid";
import TeamGrid from "@/components/about/TeamGrid";
import { connection } from "next/server";
import { getAboutContent, getStats, getValues, getTeam } from "@/lib/api";

export const metadata = {
  title: "About Us",
  description:
    "We are a team of passionate storytellers, editors and creators who turn ideas into powerful visual experiences.",
};

export default async function AboutPage() {
  await connection();

  const [aboutContent, stats, values, team] = await Promise.all([
    getAboutContent().catch(() => null),
    getStats().catch(() => []),
    getValues().catch(() => []),
    getTeam().catch(() => []),
  ]);

  return (
    <main className="bg-[#080808]">
      <AboutHero aboutContent={aboutContent} stats={stats} />
      <OurStory aboutContent={aboutContent} />
      <ValuesGrid values={values} />
      <TeamGrid team={team} />
    </main>
  );
}
