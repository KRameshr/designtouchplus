"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminTeamRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/about?tab=team");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-neutral-400 gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-brand-red" />
      <p className="text-xs font-mono uppercase tracking-wider">
        Redirecting to About Page CMS...
      </p>
    </div>
  );
}
