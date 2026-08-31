import Link from "next/link";
import { Film, FileText, Sparkles, ArrowRight } from "lucide-react";

const SECTIONS = [
  { label: "Portfolio", desc: "Manage video and thumbnail projects", href: "/admin/portfolio", icon: Film },
  { label: "Blog", desc: "Manage blog posts", href: "/admin/blog", icon: FileText },
  { label: "Services", desc: "Manage service offerings", href: "/admin/services", icon: Sparkles },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-black uppercase mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">
        Manage your DesignTouch+ website content.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SECTIONS.map(({ label, desc, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white/[0.03] border border-white/10 hover:border-brand-red/40 rounded-xl p-5 no-underline transition-colors"
          >
            <Icon className="w-5 h-5 text-brand-red mb-4" />
            <h3 className="text-sm font-bold text-white mb-1">{label}</h3>
            <p className="text-gray-500 text-xs mb-4">{desc}</p>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-brand-red transition-colors">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
