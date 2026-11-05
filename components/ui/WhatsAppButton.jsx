"use client";

import { usePathname } from "next/navigation";

// Official WhatsApp Click to Chat URL with pre-filled message
export const WHATSAPP_PHONE = "+918919003200";
export const WHATSAPP_CLEAN_PHONE = "918919003200";
export const WHATSAPP_PREFILLED_MESSAGE =
  "Hi DesignTouch+, I'm interested in your services. Can you help me?";
export const WHATSAPP_CLICK_TO_CHAT_URL =
  "https://wa.me/918919003200?text=Hi%20DesignTouch%2B%2C%20I%27m%20interested%20in%20your%20services.%20Can%20you%20help%20me%3F";

// Navbar "Let's Talk" WhatsApp destination configuration
export const WHATSAPP_NAVBAR_MESSAGE =
  "Hi DesignTouch+! I'm interested in your creative services. I'd like to discuss my project.";
export const WHATSAPP_NAVBAR_CLICK_TO_CHAT_URL =
  `https://wa.me/${WHATSAPP_CLEAN_PHONE}?text=${encodeURIComponent(WHATSAPP_NAVBAR_MESSAGE)}`;

/**
 * Crisp official WhatsApp vector mark.
 * Uses the official phone handset inside speech bubble contour.
 */
export const WhatsAppIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.275-.1-.476-.15-.676.15-.2.301-.776.978-.952 1.179-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.927-2.233-.244-.587-.492-.507-.677-.517l-.577-.01c-.2 0-.527.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.079 2.909 1.229 3.11.15.2 2.124 3.243 5.145 4.547.719.31 1.28.496 1.718.635.722.23 1.378.197 1.898.12.579-.087 1.78-.727 2.03-1.43.251-.702.251-1.304.176-1.43-.075-.126-.276-.201-.577-.351zM12.04 2C6.516 2 2.022 6.49 2.022 12.013c0 1.912.537 3.731 1.556 5.304L2 22.08l4.908-1.542a9.98 9.98 0 0 0 5.132 1.475h.004c5.52 0 10.015-4.492 10.015-10.014 0-2.673-1.04-5.186-2.932-7.078A9.94 9.94 0 0 0 12.04 2zm0 18.257h-.003a8.31 8.31 0 0 1-4.237-1.16l-.304-.18-2.906.913.927-2.833-.197-.313a8.32 8.32 0 0 1-1.278-4.671c0-4.587 3.735-8.32 8.327-8.32 2.223 0 4.312.866 5.88 2.437a8.27 8.27 0 0 1 2.434 5.883c0 4.588-3.734 8.32-8.327 8.32z" />
  </svg>
);

/**
 * DesignTouch+ Floating WhatsApp Business Contact Button
 *
 * Requirements:
 * - Positioned cleanly above the existing red rectangular chatbot launcher
 *   (bottom-[74px] mobile / bottom-[94px] desktop, right-4 mobile / right-6 desktop)
 * - Official WhatsApp green (#25D366) with clean white icon
 * - Circular button with subtle shadow and border matching DesignTouch+ dark palette
 * - Hover / focus-visible tooltip "Chat on WhatsApp"
 * - Opens https://wa.me/918919003200?text=... in a new tab with target="_blank" rel="noopener noreferrer"
 * - Automatically hidden on /admin routes
 * - Respects prefers-reduced-motion
 */
export default function WhatsAppButton() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return null;
  }

  return (
    <aside
      aria-label="WhatsApp Contact"
      className="fixed bottom-[74px] sm:bottom-[94px] right-4 sm:right-6 floating-action-whatsapp z-[80] select-none font-sans"
    >
      <a
        href={WHATSAPP_CLICK_TO_CHAT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="
          group relative flex items-center justify-center
          w-12 h-12 sm:w-14 sm:h-14
          rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white
          shadow-[0_4px_16px_rgba(0,0,0,0.55),0_0_20px_rgba(37,211,102,0.35)]
          hover:shadow-[0_6px_24px_rgba(0,0,0,0.65),0_0_28px_rgba(37,211,102,0.55)]
          border border-[#25D366]/60 hover:border-white/40
          cursor-pointer
          transition-all duration-200 ease-out
          hover:scale-105 active:scale-95
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black
          motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:transform-none
        "
      >
        <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none motion-reduce:transform-none" />

        {/* Editorial tooltip matching DesignTouch+ styling */}
        <span
          role="tooltip"
          className="
            pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2
            opacity-0 -translate-x-1
            group-hover:opacity-100 group-hover:translate-x-0
            group-focus-visible:opacity-100 group-focus-visible:translate-x-0
            transition-all duration-200 ease-out
            px-3 py-1.5 bg-[#111111] text-white text-xs font-sans font-medium whitespace-nowrap
            border border-white/10 rounded-none shadow-2xl select-none
            motion-reduce:transition-none motion-reduce:transform-none
          "
        >
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
}

