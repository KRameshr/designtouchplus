import LegalPageLayout from "@/components/legal/LegalPageLayout";
import CookiePreferencesPanel from "@/components/legal/CookiePreferencesPanel";
import Link from "next/link";
import { Cookie, ShieldCheck, Database, Sliders, ExternalLink, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Cookie Policy & Cookie Settings",
  description:
    "Understand how DesignTouch+ uses cookies and browser storage, and manage your interactive cookie preferences in accordance with the DPDP Act 2023.",
};

const TOC_ITEMS = [
  { id: "what-are-cookies", number: "1", title: "What Are Cookies & Storage?" },
  { id: "how-we-use-cookies", number: "2", title: "How DesignTouch+ Uses Cookies" },
  { id: "cookie-settings-panel", number: "3", title: "Interactive Preference Center" },
  { id: "cookie-categories", number: "4", title: "Categories of Cookies" },
  { id: "cookie-inventory", number: "5", title: "Detailed Cookie Inventory" },
  { id: "browser-controls", number: "6", title: "Browser-Level Controls" },
  { id: "updates-contact", number: "7", title: "Policy Updates & Legal Inquiries" },
];

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      eyebrow="Cookie &amp; Tracking Policy"
      title="Cookie Policy"
      subtitle="Transparency regarding our use of cookies, browser local storage, and your interactive controls to customize consent preferences at any time."
      lastUpdated="November 2, 2026"
      effectiveDate="January 1, 2025"
      jurisdiction="Republic of India &amp; International Standards"
      tableOfContents={TOC_ITEMS}
    >
      {/* 1. What Are Cookies */}
      <section id="what-are-cookies" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">01.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            What Are Cookies &amp; Browser Storage Technologies?
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          Cookies are small text data files placed on your device (computer, smartphone, or tablet) by websites you visit. They are widely used to ensure websites function securely, recall your preferences across sessions, and provide anonymous performance metrics.
        </p>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          In addition to standard HTTP cookies, modern web applications may utilize browser <strong>Local Storage</strong> and <strong>Session Storage</strong> (HTML5 web storage). These allow data to be stored locally within your browser without being transmitted to servers on every single page request.
        </p>
      </section>

      {/* 2. How DesignTouch+ Uses Cookies */}
      <section id="how-we-use-cookies" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">02.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            How DesignTouch+ Uses Cookies
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          At DesignTouch+, we respect your digital privacy. We use storage technologies conservatively:
        </p>
        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-neutral-300 pl-2">
          <li>
            <strong>Core Security &amp; Navigation:</strong> Ensuring form inputs, session verification, and anti-forgery protections function reliably.
          </li>
          <li>
            <strong>Remembering Your Privacy Choices:</strong> Storing whether you have accepted or rejected optional performance categories so you aren&apos;t repeatedly prompted.
          </li>
          <li>
            <strong>Performance Diagnostics:</strong> Collecting aggregated, non-personally identifiable telemetry to identify page latency, broken links, or mobile rendering bugs.
          </li>
        </ul>

        <div className="p-4 bg-[#111111] border-l-2 border-brand-green rounded-none text-xs sm:text-sm text-neutral-300 space-y-1.5">
          <strong className="text-white block font-sans">Zero Invasive Advertising Trackers:</strong>
          <p className="m-0 text-neutral-400 leading-relaxed font-sans">
            We do <strong>not</strong> use third-party advertising pixels, behavioral remarketing cookies (such as Meta Pixel, TikTok tracking, or Google Ads remarketing beacons), or cross-site fingerprinting scripts.
          </p>
        </div>
      </section>

      {/* 3. Interactive Preference Center */}
      <section id="cookie-settings-panel" className="scroll-mt-32">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-2">
          <span className="font-mono text-sm text-brand-red font-bold">03.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Interactive Preference Center
          </h2>
        </div>
        {/* Mount interactive preferences component */}
        <CookiePreferencesPanel />
      </section>

      {/* 4. Categories of Cookies */}
      <section id="cookie-categories" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">04.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Categories of Cookies Explained
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          Our website classifies cookies and local storage items into distinct operational tiers:
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-[#111111] border border-white/10 rounded-none space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-white font-sans m-0">
                1. Strictly Essential Cookies
              </h3>
              <span className="text-[10px] font-mono text-brand-green uppercase font-bold">
                Always Active
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Strictly necessary for the website to function. They support secure form submissions, CSRF token validation, session management, and storing your consent preferences. Without these, core portions of the site would fail to operate.
            </p>
          </div>

          <div className="p-4 bg-[#111111] border border-white/10 rounded-none space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-white font-sans m-0">
                2. Analytics &amp; Performance Cookies
              </h3>
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                Opt-in Required
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Help us understand how visitors discover and navigate our website by measuring page load times, error rates, and popular portfolio pages. All data is aggregated and anonymized. In compliance with DPDP Act 2023, these are inactive until you affirmatively grant consent.
            </p>
          </div>

          <div className="p-4 bg-[#111111] border border-white/10 rounded-none space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-white font-sans m-0">
                3. Functional &amp; Experience Preferences
              </h3>
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                Opt-in Required
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Enables personalized convenience features such as remembering your muted/unmuted state on showreel video players or preserving collapsed layout sidebars across visits.
            </p>
          </div>

          <div className="p-4 bg-[#111111] border border-white/10 rounded-none space-y-1.5 opacity-75">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-white font-sans m-0">
                4. Third-Party Advertising &amp; Tracking Pixels
              </h3>
              <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold">
                Not Used / Inactive
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              DesignTouch+ does not deploy commercial retargeting cookies or advertising tracking pixels. We do not participate in cross-site data broker exchanges.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Detailed Cookie Inventory */}
      <section id="cookie-inventory" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">05.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Detailed Storage &amp; Cookie Inventory
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          Below is a detailed inventory of cookies and local storage keys utilized by the DesignTouch+ platform:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border border-white/10 border-collapse">
            <thead>
              <tr className="bg-[#111111] text-white font-mono text-[11px] sm:text-xs uppercase border-b border-white/10">
                <th className="p-3.5 border-r border-white/10">Storage Key / Name</th>
                <th className="p-3.5 border-r border-white/10">Type &amp; Domain</th>
                <th className="p-3.5 border-r border-white/10">Category</th>
                <th className="p-3.5 border-r border-white/10">Lifespan</th>
                <th className="p-3.5">Specific Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08] text-neutral-300 font-sans">
              <tr>
                <td className="p-3.5 border-r border-white/10 font-mono text-brand-red font-medium">
                  designtouch_cookie_consent
                </td>
                <td className="p-3.5 border-r border-white/10 text-neutral-400">
                  LocalStorage (First-Party)
                </td>
                <td className="p-3.5 border-r border-white/10 text-brand-green font-medium">
                  Essential
                </td>
                <td className="p-3.5 border-r border-white/10 text-neutral-400">
                  Persistent (Until Cleared)
                </td>
                <td className="p-3.5 text-neutral-400">
                  Stores your explicit cookie consent choices and timestamp.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 border-r border-white/10 font-mono text-brand-red font-medium">
                  dt_session_csrf
                </td>
                <td className="p-3.5 border-r border-white/10 text-neutral-400">
                  HTTP Cookie (First-Party)
                </td>
                <td className="p-3.5 border-r border-white/10 text-brand-green font-medium">
                  Essential
                </td>
                <td className="p-3.5 border-r border-white/10 text-neutral-400">
                  Session
                </td>
                <td className="p-3.5 text-neutral-400">
                  Prevents Cross-Site Request Forgery (CSRF) on contact form submissions.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 border-r border-white/10 font-mono text-white font-medium">
                  dt_video_prefs
                </td>
                <td className="p-3.5 border-r border-white/10 text-neutral-400">
                  LocalStorage (First-Party)
                </td>
                <td className="p-3.5 border-r border-white/10 text-neutral-300">
                  Functional
                </td>
                <td className="p-3.5 border-r border-white/10 text-neutral-400">
                  365 Days
                </td>
                <td className="p-3.5 text-neutral-400">
                  Remembers video player volume and autoplay preferences on portfolio showreels.
                </td>
              </tr>
              <tr>
                <td className="p-3.5 border-r border-white/10 font-mono text-white font-medium">
                  dt_analytics_id
                </td>
                <td className="p-3.5 border-r border-white/10 text-neutral-400">
                  Cookie / Storage (First-Party)
                </td>
                <td className="p-3.5 border-r border-white/10 text-neutral-300">
                  Analytics
                </td>
                <td className="p-3.5 border-r border-white/10 text-neutral-400">
                  90 Days
                </td>
                <td className="p-3.5 text-neutral-400">
                  Anonymized unique session identifier for traffic analytics (only enabled upon consent).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Browser Controls */}
      <section id="browser-controls" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">06.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Browser-Level Cookie Management
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          In addition to our in-page preference center above, all major web browsers permit you to block, filter, or erase cookies through their privacy settings:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-sans">
          <div className="p-3.5 bg-[#111111] border border-white/10 rounded-none space-y-1">
            <strong className="text-white block">Google Chrome:</strong>
            <p className="text-neutral-400 text-xs m-0">
              Settings &gt; Privacy and Security &gt; Third-party cookies &gt; Block all third-party cookies.
            </p>
          </div>
          <div className="p-3.5 bg-[#111111] border border-white/10 rounded-none space-y-1">
            <strong className="text-white block">Apple Safari:</strong>
            <p className="text-neutral-400 text-xs m-0">
              Preferences &gt; Privacy &gt; Prevent cross-site tracking &amp; Block all cookies.
            </p>
          </div>
          <div className="p-3.5 bg-[#111111] border border-white/10 rounded-none space-y-1">
            <strong className="text-white block">Mozilla Firefox:</strong>
            <p className="text-neutral-400 text-xs m-0">
              Settings &gt; Privacy &amp; Security &gt; Enhanced Tracking Protection &gt; Strict.
            </p>
          </div>
          <div className="p-3.5 bg-[#111111] border border-white/10 rounded-none space-y-1">
            <strong className="text-white block">Microsoft Edge:</strong>
            <p className="text-neutral-400 text-xs m-0">
              Settings &gt; Cookies and site permissions &gt; Manage and delete cookies and site data.
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed">
          Please note that disabling strictly essential cookies through browser-level settings may cause parts of the website, interactive contact forms, and security safeguards to fail.
        </p>
      </section>

      {/* 7. Updates & Contact */}
      <section id="updates-contact" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">07.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Policy Updates &amp; Legal Inquiries
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          We may update this Cookie Policy from time to time to accommodate new features, performance tools, or regulatory guidelines under the Digital Personal Data Protection Act, 2023.
        </p>
        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
          If you have questions regarding our cookie practices, please contact our Grievance Officer at <code>privacy@designtouchplus.com</code>.
        </p>

        {/* Cross link to Terms and Privacy */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-neutral-500 font-mono block">Related Policies</span>
            <span className="text-sm text-white font-semibold">Review our Terms &amp; Conditions and Privacy Policy</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/privacy-policy"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#111111] hover:bg-white/[0.05] border border-white/10 text-white text-xs font-sans rounded-none transition-colors"
            >
              <span>Privacy Policy</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-red" />
            </Link>
            <Link
              href="/terms-and-conditions"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#111111] hover:bg-white/[0.05] border border-white/10 text-white text-xs font-sans rounded-none transition-colors"
            >
              <span>Terms &amp; Conditions</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-red" />
            </Link>
          </div>
        </div>
      </section>
    </LegalPageLayout>
  );
}

