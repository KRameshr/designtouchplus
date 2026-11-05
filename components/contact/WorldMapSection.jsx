import Link from "next/link";
import { ArrowRight, Compass, Zap } from "lucide-react";
import WorldMapVisual from "./WorldMapVisual";

const WorldMapSection = () => {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
      <div className="max-w-7xl mx-auto bg-[#0d0d0d] border border-white/[0.08] rounded-[6px] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Heading, Description, Information Items, and CTA */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.08]">
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className="w-2 h-2 rounded-full bg-brand-red shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-neutral-400">
                  Global Presence
                </span>
              </div>

              {/* Main Heading */}
              <h2 className="font-display text-2xl sm:text-3xl lg:text-[32px] font-extrabold uppercase leading-tight tracking-tight text-white mb-3">
                We Work <span className="text-brand-red">Globally</span>
              </h2>

              {/* Description */}
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-lg mb-6">
                From India to clients worldwide, we deliver creative projects with reliable communication, streamlined reviews, and flexible collaboration across time zones.
              </p>

              {/* Information Items */}
              <div className="space-y-4 mb-7 pt-5 border-t border-white/[0.06]">
                <div className="flex items-start gap-3">
                  <Compass
                    className="w-4 h-4 text-brand-green shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      INDIA-BASED CREATIVE TEAM
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                      Based in India (IST), working seamlessly with clients across the US, UK, and APAC.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap
                    className="w-4 h-4 text-brand-red shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      GLOBAL PROJECT DELIVERY
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                      Clear project milestones, collaborative reviews, and reliable revision cycles from start to finish.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button — Solid Red matching Pricing CTA style */}
            <div className="pt-1">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-brand-red hover:bg-[#dc2626] active:bg-[#b91c1c] text-white text-xs font-mono font-bold uppercase tracking-[0.14em] rounded-[3px] border border-brand-red transition-colors duration-150 no-underline shadow-[0_2px_12px_rgba(239,68,68,0.22)] group"
              >
                <span>LET&apos;S START A PROJECT</span>
                <ArrowRight
                  className="w-3.5 h-3.5 text-white transition-transform duration-150 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          {/* Right Column: World Map Visual (Preserved) */}
          <div className="lg:col-span-7 relative bg-[#070707] flex items-center justify-center min-h-[320px] sm:min-h-[400px] lg:min-h-[480px]">
            <WorldMapVisual />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorldMapSection;
