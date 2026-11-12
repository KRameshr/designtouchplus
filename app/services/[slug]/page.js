import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { getServiceBySlug, getServices } from "@/lib/api";
import {
  REFERENCE_SERVICES,
  normalizeServicesList,
  findServiceBySlug,
} from "@/lib/servicesData";
import {
  ServiceOutlineIcon,
  resolveServiceIconKey,
  resolveServiceTheme,
} from "@/lib/serviceIcons";

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
    if (Array.isArray(all) && all.length > 0) {
      const list = normalizeServicesList(all);
      const matched = findServiceBySlug(list, cleanSlug);
      if (matched) return matched;
    }
  } catch {
    // Ignore and check canonical fallback
  }

  return findServiceBySlug(REFERENCE_SERVICES, cleanSlug);
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const service = await resolveServiceDetail(resolvedParams?.slug);
  if (!service) {
    return { title: "Service" };
  }
  return {
    title: `${service.title} | Services`,
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
        {/* Navigation Breadcrumb / Back Link */}
        <div className="mb-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-neutral-400 hover:text-white no-underline transition-colors group"
          >
            <ArrowLeft
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1"
              aria-hidden="true"
            />
            <span>Back to All Services</span>
          </Link>
        </div>

        {/* Main Service Detail Article Card - Sharp 0px Border-Radius */}
        <article className="relative bg-[#0d0d0d] border border-white/[0.08] rounded-none p-6 sm:p-10 lg:p-14 overflow-hidden">
          {/* Subtle Top Red Indicator Accent */}
          <div
            className="absolute top-0 left-0 w-16 h-[2px] bg-brand-red"
            aria-hidden="true"
          />

          {/* Ambient Theme Glow */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -top-24 -left-24 w-80 h-80 bg-gradient-to-br ${theme.ambientGlow} to-transparent blur-3xl opacity-40`}
          />

          <div className="relative z-10">
            {/* Top Row: Icon Container (Left) + Order Number (Right) */}
            <div className="flex items-start justify-between gap-4 mb-8">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-none bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0 ${theme.iconText}`}
              >
                <ServiceOutlineIcon
                  iconKey={iconKey}
                  className="w-7 h-7 sm:w-8 sm:h-8"
                />
              </div>

              <span className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white/10 select-none tracking-tight">
                {service.orderNumber || "01"}
              </span>
            </div>

            {/* Category / Discipline Eyebrow with Sharp Square Accent */}
            <div className="flex items-center gap-2.5 mb-3.5">
              <span
                className={`w-2 h-2 rounded-none ${theme.bullet} shrink-0 inline-block`}
                aria-hidden="true"
              />
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.24em] text-neutral-400">
                DESIGNTOUCH+ DISCIPLINE // {service.orderNumber || "01"}
              </span>
            </div>

            {/* Main Service Title */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-6 leading-tight break-words">
              {service.title}
            </h1>

            {/* Service Detailed Description */}
            <p className="text-base sm:text-lg text-neutral-300 font-sans font-normal leading-relaxed max-w-3xl mb-10">
              {service.fullDescription || service.description}
            </p>

            {/* Deliverables Section with Clean Rectangular Rows */}
            {Array.isArray(service.features) && service.features.length > 0 && (
              <div className="mb-10 pt-8 border-t border-white/[0.08]">
                <div className="flex items-center gap-2 mb-5">
                  <span
                    className="w-1.5 h-1.5 rounded-none bg-brand-red inline-block shrink-0"
                    aria-hidden="true"
                  />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-[0.22em] text-neutral-400">
                    Included Deliverables & Capabilities
                  </h2>
                </div>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5 list-none p-0 m-0">
                  {service.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3.5 bg-[#121212] border border-white/[0.06] hover:border-white/15 px-4.5 py-3.5 text-xs sm:text-sm font-sans text-neutral-200 rounded-none transition-colors duration-150"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${theme.iconText}`}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-neutral-200">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Primary & Secondary Action Buttons (border-radius: 0) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-8 border-t border-white/[0.08] mt-8">
              <Link
                href={`/contact?service=${encodeURIComponent(service.title)}`}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-display font-bold uppercase tracking-[0.14em] rounded-none no-underline transition-colors duration-150 group shadow-lg shadow-brand-red/10 w-full sm:w-auto"
              >
                <span>Start a {service.title} Project</span>
                <ArrowRight
                  className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-1 shrink-0"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-white/25 text-neutral-300 hover:text-white text-xs font-display font-bold uppercase tracking-[0.14em] rounded-none no-underline transition-colors duration-150 w-full sm:w-auto"
              >
                <span>View All Services</span>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

