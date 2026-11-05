import LegalPageLayout from "@/components/legal/LegalPageLayout";
import Link from "next/link";
import { Scale, CheckCircle2, AlertTriangle, FileCode2, Clock, Globe, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "Standard commercial production terms governing creative services, intellectual property rights transfer, milestone payments, and client deliverables at DesignTouch+.",
};

const TOC_ITEMS = [
  { id: "contract-precedence", number: "1", title: "Acceptance & Contract Precedence" },
  { id: "services-offered", number: "2", title: "Creative Production Services" },
  { id: "quotations-payment", number: "3", title: "Quotations, Deposits & Payments" },
  { id: "scope-revisions", number: "4", title: "Project Scope & Revision Policy" },
  { id: "client-obligations", number: "5", title: "Client Responsibilities & Assets" },
  { id: "intellectual-property", number: "6", title: "Intellectual Property & IP Transfer" },
  { id: "stock-licensing", number: "7", title: "Third-Party Assets & Music Licensing" },
  { id: "portfolio-rights", number: "8", title: "Studio Portfolio & Showcase Rights" },
  { id: "platform-disclaimers", number: "9", title: "Platform Algorithms & YouTube Disclaimers" },
  { id: "liability-indemnity", number: "10", title: "Limitation of Liability & Indemnity" },
  { id: "cancellation-suspension", number: "11", title: "Postponement, Inactivity & Cancellation" },
  { id: "governing-law", number: "12", title: "Governing Law & Jurisdiction" },
  { id: "general-terms", number: "13", title: "General Legal Provisions" },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      eyebrow="Studio Terms of Service"
      title="Terms & Conditions"
      subtitle="Standard commercial production terms governing creative services, intellectual property rights, milestone deliverables, and client engagements at DesignTouch+."
      lastUpdated="November 2, 2026"
      effectiveDate="January 1, 2025"
      jurisdiction="Republic of India (Courts of [City, State, India])"
      tableOfContents={TOC_ITEMS}
    >
      {/* 1. Contract Precedence */}
      <section id="contract-precedence" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">01.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Acceptance of Terms &amp; Contractual Precedence
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          These Terms &amp; Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (the &quot;Client&quot;, &quot;you&quot;, or &quot;your&quot;) and <strong>DesignTouch+</strong> (&quot;Studio&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By browsing our website, submitting an inquiry, approving a creative estimate, or commissioning our creative services, you agree to be bound by these Terms.
        </p>

        <div className="p-4 bg-[#111111] border-l-2 border-brand-red rounded-none space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm font-sans">
            <Scale className="w-4 h-4 text-brand-red shrink-0" />
            <span>Rule of Contractual Precedence:</span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed m-0 font-sans">
            Where a specific project proposal, Master Services Agreement (MSA), Statement of Work (SOW), or officially counter-signed written quotation has been executed between DesignTouch+ and the Client, <strong>the specific terms of that executed agreement shall strictly supersede and take precedence over these general website terms</strong> in the event of any direct conflict or inconsistency.
          </p>
        </div>
      </section>

      {/* 2. Services Offered */}
      <section id="services-offered" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">02.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Creative Production Services
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          DesignTouch+ provides end-to-end creative production, post-production, and digital design services, including but not limited to:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-neutral-300 font-sans">
          <div className="p-3 bg-[#111111] border border-white/10 rounded-none flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 bg-brand-red shrink-0"></span>
            <span>Commercial Video Editing &amp; Color Grading</span>
          </div>
          <div className="p-3 bg-[#111111] border border-white/10 rounded-none flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 bg-brand-green shrink-0"></span>
            <span>2D/3D Motion Graphics &amp; Title Animation</span>
          </div>
          <div className="p-3 bg-[#111111] border border-white/10 rounded-none flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 bg-brand-red shrink-0"></span>
            <span>Brand Films &amp; Commercial Advertising Campaigns</span>
          </div>
          <div className="p-3 bg-[#111111] border border-white/10 rounded-none flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 bg-brand-green shrink-0"></span>
            <span>Social Media Short-Form Content (Reels/Shorts/TikTok)</span>
          </div>
          <div className="p-3 bg-[#111111] border border-white/10 rounded-none flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 bg-brand-red shrink-0"></span>
            <span>High-CTR YouTube Thumbnail Design &amp; Packaging</span>
          </div>
          <div className="p-3 bg-[#111111] border border-white/10 rounded-none flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 bg-brand-green shrink-0"></span>
            <span>YouTube Strategy, Upload Packaging &amp; Channel Growth</span>
          </div>
        </div>
      </section>

      {/* 3. Quotations & Payment */}
      <section id="quotations-payment" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">03.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Quotations, Deposits &amp; Payment Milestones
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          All production engagements adhere to structured commercial milestones to guarantee dedicated studio scheduling and production resources:
        </p>

        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-neutral-300 pl-2">
          <li>
            <strong>Quotation Validity:</strong> Formal quotations and price estimates are valid for thirty (30) calendar days from the date of issue, after which they are subject to review or studio schedule reconfirmation.
          </li>
          <li>
            <strong>Commencement Deposit:</strong> Unless otherwise specified in a custom SOW, all new projects require a <strong>non-refundable 50% advance deposit</strong> prior to project onboarding, asset ingestion, or commencement of creative production.
          </li>
          <li>
            <strong>Completion &amp; Final Payment:</strong> The remaining 50% balance (or designated final milestone amount) is invoiced upon delivery of review-watermarked cuts and is due prior to the release of final, unwatermarked master assets.
          </li>
          <li>
            <strong>Applicable Taxes:</strong> Invoices issued to clients located in India are subject to applicable Goods and Services Tax (GST). International clients outside India are invoiced in accordance with applicable export of services provisions (e.g. LUT/reverse-charge mechanisms).
          </li>
          <li>
            <strong>Late Payment Surcharges:</strong> Invoices unpaid after their due date accrue interest at the rate of 1.5% per month (or the maximum statutory limit permitted by law), and DesignTouch+ reserves the right to suspend ongoing production until accounts are settled.
          </li>
        </ul>
      </section>

      {/* 4. Scope & Revisions */}
      <section id="scope-revisions" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">04.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Project Scope &amp; Revision Policy
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          A clear project scope ensures creative alignment, predictable timelines, and transparent costs:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
          <div className="p-4 bg-[#111111] border border-white/10 rounded-none space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-brand-green" />
              <span>Included Creative Revisions</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Standard video editing and motion design packages include up to <strong>two (2) rounds of consolidated creative revisions</strong> within the agreed initial brief (e.g. pacing adjustments, color tweaks, audio balance, title wording). Feedback must be delivered in a single consolidated written batch.
            </p>
          </div>

          <div className="p-4 bg-[#111111] border border-white/10 rounded-none space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Out-of-Scope Change Orders</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Significant script rewrites after voiceover recording, replacement of principal raw footage, fundamental style pivots, or additional revisions beyond the included rounds constitute out-of-scope work. Such requests will be quoted as separate change orders at our prevailing hourly or daily production rates.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Client Obligations */}
      <section id="client-obligations" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">05.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Client Responsibilities &amp; Media Assets
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          Timely and high-quality deliverables require proactive collaboration from the Client:
        </p>

        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-neutral-300 pl-2">
          <li>
            <strong>Asset Delivery:</strong> The Client is responsible for providing all necessary raw footage, audio recordings, scripts, vector logos, brand typography, and creative briefs in compatible high-resolution formats.
          </li>
          <li>
            <strong>Feedback Turnaround Times:</strong> Production timelines and delivery dates are conditioned upon prompt client review. Revisions and sign-offs must be submitted within three (3) to five (5) business days of delivery. Unscheduled client delays inevitably shift the final delivery date.
          </li>
          <li>
            <strong>Warranty of Ownership:</strong> The Client explicitly warrants that all media files, footage, trademarks, music, and materials supplied to DesignTouch+ are either owned by the Client or properly licensed for the intended commercial use, and do not infringe on any third-party intellectual property rights.
          </li>
        </ul>
      </section>

      {/* 6. Intellectual Property */}
      <section id="intellectual-property" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">06.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Intellectual Property &amp; IP Transfer
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          Intellectual property rights are governed by strict commercial agency standards:
        </p>

        <div className="p-4 bg-white/[0.02] border border-white/10 rounded-none space-y-3 text-xs sm:text-sm leading-relaxed">
          <div className="flex items-center gap-2 text-white font-semibold">
            <span className="px-2 py-0.5 bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-mono uppercase">
              Strict Condition Precedent
            </span>
            <span>Final Deliverables Copyright Transfer:</span>
          </div>
          <p className="text-neutral-300 m-0">
            All intellectual property rights and commercial exploitation copyright in the <strong>final approved rendered deliverables</strong> (e.g. exported master videos, finalized thumbnails, exported graphics) transfer to the Client <strong>strictly upon complete, full receipt of all agreed fees in cleared funds</strong>. Prior to full settlement, all deliverables remain the exclusive property of DesignTouch+.
          </p>
        </div>

        <div className="p-4 bg-[#111111] border border-white/10 rounded-none space-y-2 text-xs sm:text-sm leading-relaxed">
          <h3 className="font-display text-sm font-semibold text-white flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-brand-green" />
            <span>Proprietary Project Files &amp; Working Assets:</span>
          </h3>
          <p className="text-neutral-400 m-0">
            Unless explicitly negotiated and agreed upon under a separate written project file buyout fee, <strong>raw working project files</strong> (including Adobe Premiere Pro <code>.prproj</code>, Adobe After Effects <code>.aep</code>, DaVinci Resolve project archives, internal motion graphics presets, and proprietary editing templates) remain the confidential trade secrets and intellectual property of DesignTouch+. Deliverables consist solely of final rendered master media files.
          </p>
        </div>

        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
          Preliminary concept drafts, discarded rough cuts, unused storyboard treatments, and pitch materials remain the exclusive intellectual property of DesignTouch+ and may not be used by the Client without written permission.
        </p>
      </section>

      {/* 7. Third-Party Assets */}
      <section id="stock-licensing" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">07.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Third-Party Assets &amp; Music Licensing
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          When commercial projects incorporate stock footage, sound effects, licensed music, or commercial font packages:
        </p>
        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-neutral-300 pl-2">
          <li>
            <strong>Music &amp; Stock Licenses:</strong> DesignTouch+ procures licenses from reputable commercial stock providers (such as Artlist, Musicbed, or Envato Elements) for web, social media, and digital broadcast distribution as specified in the estimate.
          </li>
          <li>
            <strong>License Scope:</strong> Licenses are granted as sub-licenses for use strictly within the finished creative deliverable. The Client is not permitted to extract, resell, or repurpose isolated audio tracks or stock clips independently.
          </li>
          <li>
            <strong>Broadcast &amp; Theatrical Clearances:</strong> If the Client requires national television, theatrical cinema, or global above-the-line advertising broadcasting rights, the Client is responsible for procuring the appropriate extended enterprise licensing clearances, which will be quoted separately.
          </li>
        </ul>
      </section>

      {/* 8. Portfolio Showcase */}
      <section id="portfolio-rights" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">08.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Studio Portfolio &amp; Showcase Rights
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          As a creative studio, showcasing our work is fundamental to our business:
        </p>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-none space-y-2 text-xs sm:text-sm text-neutral-300">
          <p className="leading-relaxed m-0">
            DesignTouch+ retains the perpetual, worldwide, non-exclusive right to feature completed public deliverables, client project excerpts, case studies, before-and-after breakdowns, and behind-the-scenes editing footage across our portfolio website, showreels, social media channels, and award submissions for self-promotional and educational purposes.
          </p>
          <p className="text-neutral-400 text-xs leading-relaxed m-0 pt-2 border-t border-white/[0.08]">
            <strong>NDA Exception:</strong> Where the Client requires strict confidentiality prior to an unreleased product launch, or enters into a formal Non-Disclosure Agreement (NDA) counter-signed prior to production kickoff, DesignTouch+ will strictly withhold public display until the agreed embargo date or public release.
          </p>
        </div>
      </section>

      {/* 9. Platform Disclaimers */}
      <section id="platform-disclaimers" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">09.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Platform Algorithms &amp; YouTube Disclaimers
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          While DesignTouch+ applies industry-leading visual storytelling craft and thumbnail psychology:
        </p>
        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-neutral-300 pl-2">
          <li>
            <strong>No Guarantee of Algorithmic Outcomes:</strong> Digital platform distribution algorithms (including YouTube, Instagram, TikTok, LinkedIn, and X) are outside our control. We do not guarantee specific viewer counts, viral reach, subscriber additions, sales conversions, or click-through percentages.
          </li>
          <li>
            <strong>Platform Policy Changes &amp; Community Guidelines:</strong> DesignTouch+ is not responsible for policy shifts, automated YouTube Content ID claims resulting from client-supplied assets, demonetization actions, or account status changes imposed by third-party social platforms.
          </li>
        </ul>
      </section>

      {/* 10. Limitation of Liability */}
      <section id="liability-indemnity" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">10.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Limitation of Liability &amp; Indemnity
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          To the maximum extent permitted by applicable Indian and international law:
        </p>

        <div className="space-y-3 text-xs sm:text-sm text-neutral-300">
          <div className="p-4 bg-[#111111] border border-white/10 rounded-none">
            <strong className="text-white block mb-1">Cap on Monetary Liability:</strong>
            <p className="text-neutral-400 m-0 leading-relaxed">
              The total aggregate liability of DesignTouch+, its founders, employees, and subcontractors arising out of or related to any project engagement, whether in contract, tort (including negligence), or otherwise, shall be strictly capped at <strong>the total amount actually paid by the Client to DesignTouch+ for the specific project deliverable giving rise to the claim</strong>.
            </p>
          </div>

          <div className="p-4 bg-[#111111] border border-white/10 rounded-none">
            <strong className="text-white block mb-1">Disclaimer of Consequential Damages:</strong>
            <p className="text-neutral-400 m-0 leading-relaxed">
              In no event shall DesignTouch+ be liable for any indirect, incidental, special, exemplary, or consequential damages, including loss of anticipated profits, commercial goodwill, revenue, business interruption, or data loss.
            </p>
          </div>

          <div className="p-4 bg-[#111111] border border-white/10 rounded-none">
            <strong className="text-white block mb-1">Client Indemnification:</strong>
            <p className="text-neutral-400 m-0 leading-relaxed">
              The Client agrees to defend, indemnify, and hold harmless DesignTouch+ from and against any third-party claims, liabilities, damages, and legal expenses arising out of any client-supplied materials that violate copyright, trademark, privacy, or defamation laws.
            </p>
          </div>
        </div>
      </section>

      {/* 11. Cancellation & Suspension */}
      <section id="cancellation-suspension" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">11.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Postponement, Inactivity &amp; Cancellation
          </h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-neutral-300 pl-2">
          <li>
            <strong>Client Cancellation:</strong> If a project is cancelled by the Client after work or pre-production has commenced, the initial 50% deposit is non-refundable. The Client shall remain liable for any additional hours worked and third-party expenses incurred up to the date of cancellation.
          </li>
          <li>
            <strong>Dormant / Unresponsive Projects:</strong> If a Client becomes unresponsive and fails to provide necessary assets, feedback, or approvals for more than thirty (30) consecutive calendar days, the project will be classified as suspended. Reactivating a suspended project requires studio scheduling approval and may incur a 15% reactivation fee.
          </li>
          <li>
            <strong>Force Majeure:</strong> Neither party shall be liable for delay or failure in performance resulting from causes beyond reasonable control, including acts of God, extreme natural disasters, telecommunications blackouts, or government embargoes.
          </li>
        </ul>
      </section>

      {/* 12. Governing Law */}
      <section id="governing-law" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">12.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Governing Law &amp; Dispute Resolution
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          These Terms and all project agreements shall be governed by and construed in accordance with the substantive laws of the <strong>Republic of India</strong>, without regard to its conflict of law principles.
        </p>

        <div className="border border-white/10 bg-[#111111] rounded-none p-5 sm:p-6 space-y-3 font-mono text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Governing Substantive Law:</span>
            <span className="sm:col-span-2 text-white font-medium">Laws of the Republic of India</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Amicable Resolution Window:</span>
            <span className="sm:col-span-2 text-white font-medium">
              Mandatory thirty (30) calendar days good-faith senior executive negotiation
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Arbitration / Forum:</span>
            <span className="sm:col-span-2 text-white font-medium">
              Arbitration under the Arbitration and Conciliation Act, 1996 in [City, State, India]
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Exclusive Court Jurisdiction:</span>
            <span className="sm:col-span-2 text-brand-red font-medium">
              Competent civil courts situated in [Insert City, State, India, e.g. Bengaluru, Karnataka]
            </span>
          </div>
        </div>
      </section>

      {/* 13. General Provisions */}
      <section id="general-terms" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">13.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            General Legal Provisions &amp; Inquiries
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          If any provision of these Terms is found to be unlawful, void, or unenforceable, that provision shall be deemed severable and shall not affect the validity and enforceability of any remaining provisions.
        </p>
        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
          For any questions regarding these Terms, commercial production agreements, or licensing inquiries, please contact our legal and client management team at <code>hello@designtouchplus.com</code>.
        </p>

        {/* Cross link to Privacy Policy */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-neutral-500 font-mono block">Looking for data protection details?</span>
            <span className="text-sm text-white font-semibold">Review our DPDP Act 2023 compliant Privacy Policy</span>
          </div>
          <Link
            href="/privacy-policy"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-white/[0.05] border border-white/10 text-white text-xs font-sans rounded-none transition-colors"
          >
            <span>Read Privacy Policy</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-red" />
          </Link>
        </div>
      </section>
    </LegalPageLayout>
  );
}

