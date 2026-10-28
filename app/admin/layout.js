"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  LayoutDashboard,
  LayoutTemplate,
  Film,
  FileText,
  Sparkles,
  Quote,
  Users,
  Building2,
  Tag,
  Menu,
  X,
} from "lucide-react";
import { isAuthenticated, logout, getCurrentUser } from "@/lib/auth";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Hero Section", href: "/admin/hero", icon: LayoutTemplate },
  { label: "Portfolio", href: "/admin/portfolio", icon: Film },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Services", href: "/admin/services", icon: Sparkles },
  { label: "Pricing", href: "/admin/pricing", icon: Tag },
  { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Clients", href: "/admin/clients", icon: Building2 },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  // Re-validate on EVERY admin route change (not just first mount): the layout
  // stays mounted across /admin/* navigations, so a one-time check would let a
  // logged-out user Back-navigate into a protected page.
  useEffect(() => {
    const ok = isAuthenticated();
    if (isLoginPage) {
      setAuthorized(false);
      if (ok) router.replace("/admin/dashboard");
      return;
    }
    if (!ok) {
      setAuthorized(false);
      router.replace("/admin/login");
      return;
    }
    setAuthorized(true);
  }, [pathname, isLoginPage, router]);

  // Re-check when a page is restored from the browser back/forward cache, and
  // when another tab logs out (localStorage "storage" event).
  useEffect(() => {
    const recheck = () => {
      if (!isLoginPage && !isAuthenticated()) {
        setAuthorized(false);
        router.replace("/admin/login");
      }
    };
    const onPageShow = (e) => e.persisted && recheck();
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("storage", recheck);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("storage", recheck);
    };
  }, [isLoginPage, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Login page renders standalone — no sidebar/nav chrome
  if (isLoginPage) return children;

  // Avoids a flash of protected content before the redirect kicks in
  if (!authorized) return null;

  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    setAuthorized(false);
    // replace (not push) so the protected page is not left as the previous
    // history entry; the guard above also blocks it if reached via Back.
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3.5 border-b border-white/[0.08] bg-[#0d0d0d]">
        <div className="flex items-center gap-2 select-none">
          <span className="text-sm font-black tracking-tight font-display">
            DE<span className="text-brand-red">S</span>IGN{" "}
            T<span className="text-brand-green">O</span>UCH
            <span className="text-brand-red">+</span>
          </span>
          <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest px-1.5 py-0.5 bg-white/[0.05] border border-white/10">
            ADMIN
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="w-9 h-9 flex items-center justify-center bg-white/[0.04] border border-white/10 text-white rounded-none hover:bg-white/[0.08] transition-colors cursor-pointer"
          aria-label={mobileMenuOpen ? "Close admin navigation" : "Open admin navigation"}
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[55] md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop Fixed / Mobile Slide-over Drawer) */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-[60] md:z-auto
          w-64 md:w-60 shrink-0 bg-[#0d0d0d] md:bg-[#0a0a0a] border-r border-white/[0.06]
          flex flex-col p-5 transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="hidden md:block mb-8 select-none">
          <span className="text-sm font-black tracking-tight font-display">
            DE<span className="text-brand-red">S</span>IGN{" "}
            T<span className="text-brand-green">O</span>UCH
            <span className="text-brand-red">+</span>
          </span>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-mono">
            Admin Panel
          </p>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-none text-xs font-bold uppercase tracking-wide no-underline transition-colors ${
                  active
                    ? "bg-brand-red/10 text-brand-red border-l-2 border-brand-red"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/[0.06] mt-4">
          {user?.username && (
            <p className="text-[10px] text-gray-500 mb-3 truncate font-mono">
              USER: {user.username}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400 hover:text-red-400 bg-transparent border-none cursor-pointer transition-colors p-0"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto min-w-0 max-w-full">
        {children}
      </main>
    </div>
  );
}
