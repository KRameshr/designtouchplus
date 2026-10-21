"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

// /admin is only an entry point. The auth state lives in localStorage (see
// lib/auth.js), so the decision has to happen on the client:
//   logged out → /admin/login, logged in → /admin/dashboard.
// The parent admin layout also guards this route, so unauthenticated users
// are redirected even before this effect runs.
export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthenticated() ? "/admin/dashboard" : "/admin/login");
  }, [router]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500">
      Redirecting…
    </div>
  );
}

