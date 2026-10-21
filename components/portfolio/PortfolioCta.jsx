import Link from "next/link";

export default function PortfolioCta() {
  return (
    <section className="bg-[#0a0a0a] text-white px-4 sm:px-6 py-16 sm:py-20 border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#0d0d0d] border border-white/10 border-t-2 border-t-brand-red p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row lg:items-center justify-between gap-8 rounded-none">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                HAVE A PROJECT IN MIND?
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-tight mb-3">
              Let&apos;s Create Something <br className="hidden sm:inline" />
              <span className="text-white">Amazing Together.</span>
            </h2>

            <p className="text-neutral-400 text-xs sm:text-sm font-normal leading-relaxed max-w-lg">
              Partner with our post-production team to craft broadcast-grade edits, viral reels, and high-CTR thumbnails.
            </p>
          </div>

          {/* Action Link */}
          <div className="shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2.5 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-[0.16em] px-8 py-4 rounded-none border border-brand-red transition-colors no-underline cursor-pointer group"
            >
              <span>Start a Project</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              >
                <path
                  d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="square"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

