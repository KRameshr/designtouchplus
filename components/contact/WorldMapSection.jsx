import Link from "next/link";
import { Globe2, ArrowRight } from "lucide-react";

const WorldMapSection = ({ mapEmbedUrl }) => {
  return (
    <section className="px-6 py-16">
      <div className="max-w-7xl mx-auto bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
          <div className="p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mb-3">
              We Work{" "}
              <span className="bg-gradient-to-r from-brand-red to-brand-green bg-clip-text text-transparent">
                Globally
              </span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              No matter where you are, we&apos;re here to bring your ideas to life.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-brand-red hover:bg-brand-red text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-full no-underline transition-colors duration-300"
            >
              Let&apos;s Start a Project <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative aspect-video lg:aspect-auto lg:h-full min-h-[240px] bg-gradient-to-br from-white/[0.04] to-transparent flex items-center justify-center border-t lg:border-t-0 lg:border-l border-white/[0.06]">
            {mapEmbedUrl ? (
              <iframe
                title="Our locations"
                src={mapEmbedUrl}
                className="w-full h-full border-none"
              />
            ) : (
              <Globe2 className="w-16 h-16 text-white/10" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorldMapSection;
