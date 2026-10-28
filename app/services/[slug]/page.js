import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { getServiceBySlug, getServices } from "@/lib/api";
import {
  REFERENCE_SERVICES,
  normalizeServicesList,
} from "@/components/services/ServicesGrid";
import {
  ServiceOutlineIcon,
  resolveServiceIconKey,
  resolveServiceTheme,
} from "@/lib/serviceIcons";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function resolveServiceDetail(slug) {
  const cleanSlug = decodeURIComponent(String(slug || "")).trim().toLowerCase();
  if (!cleanSlug) return null;

  try {
    const direct = await getServiceBySlug(cleanSlug);
    if (direct && direct.isActive !== false) {
      const [normalized] = normalizeServicesList([direct]);
      return normalized;
    }
  } catch {
    // Fallback to full active list or canonical reference list below
  }

  try {
    const all = await getServices();
    const list = normalizeServicesList(all);
    const matched = list.find(
      (s) => String(s.slug || "").toLowerCase() === cleanSlug
    );
    if (matched) return matched;
  } catch {
    // Ignore and check canonical fallback
  }

  return (
    REFERENCE_SERVICES.find(
      (s) => String(s.slug || "").toLowerCase() === cleanSlug
    ) || null
  );
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const service = await resolveServiceDetail(resolvedParams?.slug);
  if (!service) {
    return { title: "Service | DesignTouch+" };
  }
  return {
    title: `${service.title} | Services | DesignTouch+`,
    description: service.description,
  };
}

export default async function ServiceDetailPage({ params }) {
  const resolvedParams = await params;
  const service = await resolveServiceDetail(resolvedParams?.slug);

  if (!service) {
    notFound();
  }

  const theme = resolveServiceTheme(service.colorTheme, 0);
  const iconKey = resolveServiceIconKey(
    service.iconType || service.icon,
    service.slug,
    service.title
  );

  return (
    <main className="bg-[#080808] min-h-screen text-white px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-neutral-400 hover:text-white no-underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to All Services</span>
          </Link>
        </div>

        <article className="relative overflow-hidden bg-[#0b0b0b] border border-white/[0.1] rounded-[16px] p-6 sm:p-10 md:p-12">
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -top-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-br ${theme.ambientGlow} to-transparent blur-3xl opacity-80`}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div className={theme.iconText}>
                <ServiceOutlineIcon
                  iconKey={iconKey}
                  className="w-14 h-14 sm:w-16 sm:h-16"
                />
              </div>
              <span className="font-display text-4xl sm:text-5xl font-extrabold text-white/[0.08] select-none">
                {service.orderNumber || "01"}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${theme.bullet}`} />
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-neutral-400">
                DESIGNTOUCH+ DISCIPLINE // {service.orderNumber || "01"}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-[-0.03em] text-white mb-5">
              {service.title}
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 font-sans leading-relaxed max-w-3xl mb-8">
              {service.fullDescription || service.description}
            </p>

            {Array.isArray(service.features) && service.features.length > 0 && (
              <div className="mb-10 pt-8 border-t border-white/[0.08]">
                <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-neutral-400 mb-5">
                  Included Deliverables & Capabilities
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 list-none p-0 m-0">
                  {service.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 bg-white/[0.025] border border-white/[0.08] rounded-[10px] px-4 py-3 text-sm text-neutral-200"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${theme.iconText}`}
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/[0.08]">
              <Link
                href={`/contact?service=${encodeURIComponent(service.title)}`}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-display font-bold uppercase tracking-[0.14em] rounded-[8px] no-underline transition-colors"
              >
                <span>Start a {service.title} Project</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-neutral-200 hover:text-white text-xs font-display font-bold uppercase tracking-[0.14em] rounded-[8px] no-underline transition-colors"
              >
                <span>View All 8 Services</span>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

