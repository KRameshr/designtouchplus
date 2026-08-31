"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, Film, FileText, Sparkles, Quote, Users, Building2 } from "lucide-react";
import { isAuthenticated, logout, getCurrentUser } from "@/lib/auth";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Portfolio", href: "/admin/portfolio", icon: Film },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Services", href: "/admin/services", icon: Sparkles },
  { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Clients", href: "/admin/clients", icon: Building2 },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage && !isAuthenticated()) {
      router.replace("/admin/login");
      return;
    }
    setChecked(true);
  }, [isLoginPage, router]);

  // Login page renders standalone — no sidebar/nav chrome
  if (isLoginPage) return children;

  // Avoids a flash of protected content before the redirect kicks in
  if (!checked) return null;

  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <aside className="w-60 shrink-0 border-r border-white/[0.06] flex flex-col p-5">
        <div className="mb-8">
          <span className="text-sm font-black tracking-tight">
            DE<span className="text-brand-red">S</span>IGN
            T<span className="text-brand-green">O</span>UCH<span className="text-brand-red">+</span>
          </span>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide no-underline transition-colors ${
                  active ? "bg-brand-red/10 text-brand-red" : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/[0.06]">
          {user?.username && (
            <p className="text-[10px] text-gray-500 mb-3 truncate">Signed in as {user.username}</p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400 hover:text-red-400 bg-transparent border-none cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
