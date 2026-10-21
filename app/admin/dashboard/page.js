import Link from "next/link";
import { LayoutTemplate, Film, FileText, Sparkles, Quote, Users, Building2, ArrowRight } from "lucide-react";

const SECTIONS = [
  { label: "Hero Section", desc: "Homepage headline, CTAs, and hero video", href: "/admin/hero", icon: LayoutTemplate },
  { label: "Portfolio", desc: "Video and thumbnail projects, featured work", href: "/admin/portfolio", icon: Film },
  { label: "Blog", desc: "Articles, categories, and publishing", href: "/admin/blog", icon: FileText },
  { label: "Services", desc: "Service offerings and feature lists", href: "/admin/services", icon: Sparkles },
  { label: "Testimonials", desc: "Client quotes and ratings", href: "/admin/testimonials", icon: Quote },
  { label: "Team", desc: "Team members and roles", href: "/admin/team", icon: Users },
  { label: "Clients", desc: "Client logos and links", href: "/admin/clients", icon: Building2 },
];

export default function AdminDashboardPage() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 bg-brand-red inline-block shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-400">Overview</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black uppercase font-display tracking-tight text-white">
          DesignTouch+ Admin Panel
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-2xl">
          Manage the content shown on the public website. Choose a section below to edit it — changes are
          saved to the database and served by the website API.
        </p>
      </div>

      {/* Sections index */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.08] border border-white/[0.08]">
        {SECTIONS.map(({ label, desc, href, icon: Icon }, i) => (
          <Link
            key={href}
            href={href}
            className="group bg-[#0d0d0d] hover:bg-[#111] p-5 sm:p-6 no-underline transition-colors flex flex-col min-w-0"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-mono tracking-widest text-brand-red font-semibold">
                [{String(i + 1).padStart(2, "0")}]
              </span>
              <Icon className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider font-display text-white mb-1">{label}</h2>
            <p className="text-neutral-500 text-xs mb-5 leading-relaxed">{desc}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-neutral-400 group-hover:text-brand-red transition-colors">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
