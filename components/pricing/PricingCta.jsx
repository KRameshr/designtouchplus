import Link from "next/link";
import { Rocket, ArrowRight } from "lucide-react";

const PricingCta = () => {
  return (
    <section className="bg-[#080808] text-white px-4 sm:px-6 pb-14 sm:pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[12px] border border-white/[0.12] bg-[#0b0b0b] px-5 sm:px-8 py-7 sm:py-8">
          {/* Subtle red (left) and green (right) edge accents */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-brand-red/[0.14] to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-px bg-brand-red/70"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-brand-green/[0.12] to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-px bg-brand-green/60"
          />

          <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            <span className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full border border-brand-red/70 bg-brand-red/[0.06] flex items-center justify-center shrink-0">
              <Rocket className="w-7 h-7 text-white" strokeWidth={1.6} aria-hidden="true" />
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-neutral-300 mb-2">
                Have a custom project?
              </p>
              <h2 className="font-display text-xl sm:text-2xl md:text-[1.75rem] font-extrabold uppercase tracking-[-0.01em] leading-tight mb-2">
                Let&apos;s create something{" "}
                <span className="bg-gradient-to-r from-brand-red via-orange-400 to-brand-green bg-clip-text text-transparent">
                  amazing
                </span>{" "}
                together.
              </h2>
              <p className="text-sm text-neutral-400">
                Get in touch with us and let&apos;s discuss your ideas.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2.5 self-start md:self-center shrink-0 px-6 py-3.5 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-semibold uppercase tracking-[0.1em] rounded-[6px] no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b]"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingCta;

