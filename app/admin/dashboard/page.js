import Link from "next/link";
import {
  LayoutTemplate,
  Film,
  FileText,
  Sparkles,
  Quote,
  Users,
  Building2,
  ArrowRight,
  Mail,
  Tag,
  MessageSquare,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminUI";

const SECTIONS = [
  { label: "Hero Section", desc: "Homepage headline, CTAs, and hero video", href: "/admin/hero", icon: LayoutTemplate },
  { label: "Portfolio", desc: "Video and thumbnail projects, featured work", href: "/admin/portfolio", icon: Film },
  { label: "Blog", desc: "Articles, categories, and publishing", href: "/admin/blog", icon: FileText },
  { label: "Services", desc: "Service offerings and process steps", href: "/admin/services", icon: Sparkles },
  { label: "Pricing", desc: "Pricing tiers, add-ons, and FAQs", href: "/admin/pricing", icon: Tag },
  { label: "Contact Page", desc: "Direct channels, social media, and map visual", href: "/admin/contact", icon: Mail },
  { label: "Chat Leads", desc: "AI chatbot leads, visitor conversations, and Excel export", href: "/admin/chat-leads", icon: MessageSquare },
  { label: "Testimonials", desc: "Client quotes, ratings, and avatars", href: "/admin/testimonials", icon: Quote },
  { label: "About", desc: "Hero, stats, story, values, process, and team", href: "/admin/about", icon: Users },
  { label: "Clients", desc: "Client logos, active status, and featured brands", href: "/admin/clients", icon: Building2 },
];

export default function AdminDashboardPage() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <AdminPageHeader
        title="Admin Dashboard"
        description="Manage the content displayed on the public website. Select any section below to update live content and settings."
      />

      {/* Sections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.08] border border-white/[0.08]">
        {SECTIONS.map(({ label, desc, href, icon: Icon }, i) => (
          <Link
            key={href}
            href={href}
            className="group bg-[#0d0d0d] hover:bg-[#111] p-5 sm:p-6 no-underline transition-colors flex flex-col min-w-0 rounded-none"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-mono tracking-widest text-brand-red font-semibold">
                [{String(i + 1).padStart(2, "0")}]
              </span>
              <Icon className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider font-display text-white mb-1">
              {label}
            </h2>
            <p className="text-neutral-500 text-xs mb-5 leading-relaxed">
              {desc}
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-neutral-400 group-hover:text-brand-red transition-colors">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
