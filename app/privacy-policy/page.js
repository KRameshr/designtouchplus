import LegalPageLayout from "@/components/legal/LegalPageLayout";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, Server, FileText, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Learn how DesignTouch+ collects, manages, and protects your personal data in accordance with India's Digital Personal Data Protection Act, 2023 and global privacy standards.",
};

const TOC_ITEMS = [
  { id: "introduction", number: "1", title: "Introduction & Scope" },
  { id: "data-controller", number: "2", title: "Data Controller & Entity Details" },
  { id: "information-collected", number: "3", title: "Information We Collect" },
  { id: "processing-purposes", number: "4", title: "Purposes & Legal Bases" },
  { id: "data-sharing", number: "5", title: "Data Sharing & Operational Processors" },
  { id: "security-transfers", number: "6", title: "Data Security & International Transfers" },
  { id: "data-retention", number: "7", title: "Retention & Deletion Schedules" },
  { id: "user-rights", number: "8", title: "DPDP Act, 2023 & User Rights" },
  { id: "children-privacy", number: "9", title: "Children's Privacy Protection" },
  { id: "grievance-contact", number: "10", title: "Grievance Officer & Legal Contact" },
  { id: "policy-updates", number: "11", title: "Policy Modifications & Notice" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      eyebrow="Privacy & Data Protection"
      title="Privacy Policy"
      subtitle="At DesignTouch+, we are committed to transparent, lawful, and secure handling of your personal data across our creative production operations and digital platforms."
      lastUpdated="November 2, 2026"
      effectiveDate="January 1, 2025"
      jurisdiction="Republic of India & International Standard"
      tableOfContents={TOC_ITEMS}
    >
      {/* 1. Introduction & Scope */}
      <section id="introduction" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">01.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Introduction &amp; Scope
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          Welcome to <strong>DesignTouch+</strong> (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;, or the &quot;Studio&quot;). DesignTouch+ is a premium creative production studio specializing in visual storytelling, high-impact commercial video editing, brand films, motion graphics, graphic design, thumbnail design, and YouTube channel growth management.
        </p>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          This Privacy Policy explains how we collect, process, disclose, and safeguard personal information when you visit our website (<code>designtouchplus.com</code>), submit creative inquiries via our contact forms, subscribe to our newsletter, engage our creative production services, or otherwise interact with us.
        </p>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-none text-xs sm:text-sm text-neutral-400 leading-relaxed">
          <strong className="text-white block mb-1">Our Core Commitment:</strong>
          We operate on principles of data minimization and transparency. We strictly collect the information necessary to evaluate your creative project, deliver contracted productions, fulfill invoices, and communicate relevant studio insights. <strong>We do not sell, rent, or broker your personal information to third parties.</strong>
        </div>
      </section>

      {/* 2. Data Controller */}
      <section id="data-controller" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">02.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Data Controller &amp; Legal Entity Information
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          For the purposes of applicable data protection legislation—including India&apos;s <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and relevant international data privacy principles (including the EU/UK General Data Protection Regulation where applicable to cross-border engagements)—the Data Fiduciary / Data Controller is:
        </p>

        <div className="border border-white/10 bg-[#111111] rounded-none p-5 sm:p-6 space-y-3 font-mono text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Legal Entity Name:</span>
            <span className="sm:col-span-2 text-white font-medium">
              [Insert Registered Business Name, e.g., DesignTouch+ Creative Studio LLP / Private Limited]
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Trade / Brand Name:</span>
            <span className="sm:col-span-2 text-white font-medium">DesignTouch+</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Registered Office:</span>
            <span className="sm:col-span-2 text-white font-medium">
              [Insert Registered Office Address, City, State, PIN, India]
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Corporate Identity / GSTIN:</span>
            <span className="sm:col-span-2 text-white font-medium">
              [Insert GSTIN / CIN / Udyam Registration Number]
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Official Contact Email:</span>
            <span className="sm:col-span-2 text-brand-red font-medium">
              hello@designtouchplus.com / privacy@designtouchplus.com
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Direct Contact Phone:</span>
            <span className="sm:col-span-2 text-white font-medium">+91 12345 67890</span>
          </div>
        </div>
      </section>

      {/* 3. Information Collected */}
      <section id="information-collected" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">03.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Information We Collect
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          We collect personal and technical information in three primary ways: directly from you, automatically through your interaction with our infrastructure, and through lawful operational integrations.
        </p>

        <div className="space-y-4 mt-4">
          {/* Direct information */}
          <div className="border border-white/[0.08] bg-[#0d0d0d] p-5 rounded-none space-y-2">
            <h3 className="font-display text-base font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-red" />
              <span>A. Information Directly Provided by You</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-neutral-300 pl-2">
              <li>
                <strong>Project Inquiries &amp; Contact Forms:</strong> When submitting an inquiry through our Contact page or scheduling a consultation, you provide your full name, email address, telephone / WhatsApp number, company or brand name, service interests (e.g. video editing, motion graphics, brand films), estimated project budget, and creative brief details.
              </li>
              <li>
                <strong>Newsletter Subscriptions:</strong> When subscribing via our &quot;Stay in the Loop&quot; newsletter module, we collect your email address, opt-in confirmation status, and subscription timestamp.
              </li>
              <li>
                <strong>Client Onboarding &amp; Contract Execution:</strong> When entering into a production agreement, we collect billing contacts, business tax identification (e.g. GSTIN, VAT ID), authorized signatory details, and creative media assets (scripts, raw footage, brand guidelines) necessary to execute the project.
              </li>
            </ul>
          </div>

          {/* Automatic information */}
          <div className="border border-white/[0.08] bg-[#0d0d0d] p-5 rounded-none space-y-2">
            <h3 className="font-display text-base font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-green" />
              <span>B. Automatically Collected Technical Data &amp; Server Logs</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              When you browse our website, our cloud servers automatically log standard network request attributes to maintain site stability, diagnose technical errors, and defend against malicious cyber attacks (such as DDoS and brute-force intrusions):
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-neutral-300 pl-2">
              <li>Internet Protocol (IP) address (pseudonymized where technically feasible)</li>
              <li>Browser user agent, browser version, and device operating system</li>
              <li>Referral URLs and HTTP request headers</li>
              <li>Date, time, and latency of server requests</li>
            </ul>
          </div>

          {/* Third party pixels disclosure */}
          <div className="border border-brand-green/30 bg-brand-green/[0.03] p-5 rounded-none space-y-2">
            <h3 className="font-display text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-green" />
              <span>C. Third-Party Advertising Pixels — Explicit Declaration</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              DesignTouch+ does <strong>NOT</strong> currently deploy invasive third-party cross-site behavioral tracking pixels (such as Meta Pixel, TikTok Pixel, or Google Remarketing beacons) on our website. We do not track your browsing activity across other websites, nor do we construct commercial advertising profiles based on your visits.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Processing Purposes */}
      <section id="processing-purposes" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">04.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Purposes &amp; Legal Bases for Processing
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          Under Indian and international data protection laws, every processing activity must have an identifiable legitimate purpose and lawful ground:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border border-white/10 border-collapse">
            <thead>
              <tr className="bg-[#111111] text-white font-mono text-[11px] sm:text-xs uppercase border-b border-white/10">
                <th className="p-3.5 border-r border-white/10">Processing Purpose</th>
                <th className="p-3.5 border-r border-white/10">Categories of Data</th>
                <th className="p-3.5">Lawful Ground / Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08] text-neutral-300 font-sans">
              <tr>
                <td className="p-3.5 border-r border-white/10 font-medium text-white">
                  Evaluating inquiries &amp; issuing proposals
                </td>
                <td className="p-3.5 border-r border-white/10">
                  Name, email, phone, project scope, budget
                </td>
                <td className="p-3.5 text-neutral-400">
                  Pre-contractual steps requested by you / Legitimate business interest
                </td>
              </tr>
              <tr>
                <td className="p-3.5 border-r border-white/10 font-medium text-white">
                  Executing production contracts &amp; invoicing
                </td>
                <td className="p-3.5 border-r border-white/10">
                  Client contact info, billing address, GSTIN, assets
                </td>
                <td className="p-3.5 text-neutral-400">
                  Contractual fulfillment &amp; statutory tax compliance
                </td>
              </tr>
              <tr>
                <td className="p-3.5 border-r border-white/10 font-medium text-white">
                  Newsletter dispatch (&quot;Stay in the Loop&quot;)
                </td>
                <td className="p-3.5 border-r border-white/10">
                  Email address, subscription timestamp
                </td>
                <td className="p-3.5 text-neutral-400">
                  Explicit affirmative consent (revocable anytime)
                </td>
              </tr>
              <tr>
                <td className="p-3.5 border-r border-white/10 font-medium text-white">
                  Website security &amp; DDoS mitigation
                </td>
                <td className="p-3.5 border-r border-white/10">
                  IP addresses, request logs, user agent
                </td>
                <td className="p-3.5 text-neutral-400">
                  Legitimate interest in cyber defense &amp; network security
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Data Sharing */}
      <section id="data-sharing" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">05.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Data Sharing &amp; Operational Processors
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          We strictly limit external data sharing to trusted third-party service providers who assist us in operating our website, delivering emails, hosting media infrastructure, and fulfilling professional accounting obligations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="p-4 bg-[#111111] border border-white/10 rounded-none">
            <h3 className="font-display text-sm font-bold text-white mb-1.5">Email Delivery Infrastructure (Resend)</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              We utilize Resend to transmit automated confirmation emails, newsletter dispatches, and inquiry acknowledgments. Email addresses are processed strictly on our instruction under strict confidentiality and encryption protocols.
            </p>
          </div>
          <div className="p-4 bg-[#111111] border border-white/10 rounded-none">
            <h3 className="font-display text-sm font-bold text-white mb-1.5">Cloud Hosting &amp; Server Infrastructure</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Our website and database infrastructure are hosted in secure enterprise data center environments equipped with SOC-2 compliance, DDoS shielding, and automated firewall protection.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#111111] border-l-2 border-brand-red rounded-none text-xs sm:text-sm text-neutral-300 space-y-2">
          <strong className="text-white block">Legal &amp; Regulatory Disclosures:</strong>
          <p className="m-0 text-neutral-400 leading-relaxed">
            We will only disclose personal data to law enforcement, statutory bodies, or government regulators if required to do so by a valid court order, summons, or statutory directive under the laws of India or applicable international jurisdictions.
          </p>
        </div>
      </section>

      {/* 6. Security & International Transfers */}
      <section id="security-transfers" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">06.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Data Security &amp; International Transfers
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          We implement rigorous technical and organizational security controls designed to safeguard your data against accidental loss, unauthorized access, destruction, alteration, or unlawful processing:
        </p>
        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-neutral-300 pl-2">
          <li><strong>Transport Layer Encryption:</strong> All communications between your browser and our servers are encrypted in transit using industry-standard TLS 1.3 / HTTPS cryptographic protocols.</li>
          <li><strong>Restricted Administrative Access:</strong> Studio administrative consoles, project databases, and client folders are protected by role-based access control (RBAC) and multi-factor authentication.</li>
          <li><strong>Data Minimization:</strong> We do not retain sensitive financial payment cards on our servers; payments are processed through certified third-party payment gateways.</li>
        </ul>

        <div className="p-4 bg-white/[0.02] border border-white/10 rounded-none text-xs text-neutral-400 leading-relaxed">
          <strong className="text-white block mb-1">Notice on Internet Security:</strong>
          While we implement industry-standard safeguards, no method of transmission over the internet or electronic storage can be warranted as completely impenetrable. We encourage you to transmit sensitive proprietary video files or credentials via secured, encrypted cloud drives.
        </div>
      </section>

      {/* 7. Retention Schedules */}
      <section id="data-retention" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">07.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Retention &amp; Deletion Schedules
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          We retain personal data only for as long as necessary to fulfill the specific purposes outlined in this policy or to satisfy statutory legal, accounting, and reporting obligations:
        </p>
        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-neutral-300 pl-2">
          <li><strong>General Inquiries (Non-Contracted):</strong> If an inquiry does not result in an active production contract, inquiry correspondence is retained for up to twelve (12) months before being securely purged.</li>
          <li><strong>Client Project Records &amp; Tax Invoices:</strong> Project contracts, delivery receipts, invoices, and accounting correspondence are retained for eight (8) years to comply with Indian statutory requirements under the Income Tax Act, 1961 and Companies Act, 2013.</li>
          <li><strong>Newsletter Subscriptions:</strong> Stored until you click &quot;Unsubscribe&quot; or request deletion, at which point your email is moved to a suppression list to honor your opt-out.</li>
          <li><strong>Server Access Logs:</strong> Automatically rotated and purged on a short-term rolling schedule (typically within 30 to 90 days).</li>
        </ul>
      </section>

      {/* 8. User Rights under DPDP Act */}
      <section id="user-rights" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">08.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            DPDP Act, 2023 (India) &amp; Global User Rights
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          Under India&apos;s <strong>Digital Personal Data Protection Act, 2023</strong> (and subject to the progressive notification and enforcement of its implementing Rules by the Government of India) and international privacy frameworks (e.g. GDPR), you possess clear statutory rights as a Data Principal:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <div className="p-4 bg-[#111111] border border-white/10 rounded-none space-y-1.5">
            <span className="text-xs font-mono text-brand-red font-bold uppercase">Right 1</span>
            <h3 className="font-display text-sm font-semibold text-white">Right to Access Information</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              You have the right to request a summary of the personal data we hold about you and the processing activities undertaken with it.
            </p>
          </div>
          <div className="p-4 bg-[#111111] border border-white/10 rounded-none space-y-1.5">
            <span className="text-xs font-mono text-brand-red font-bold uppercase">Right 2</span>
            <h3 className="font-display text-sm font-semibold text-white">Right to Correction &amp; Completion</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              You may request the correction, completion, or updating of inaccurate, outdated, or incomplete personal data.
            </p>
          </div>
          <div className="p-4 bg-[#111111] border border-white/10 rounded-none space-y-1.5">
            <span className="text-xs font-mono text-brand-red font-bold uppercase">Right 3</span>
            <h3 className="font-display text-sm font-semibold text-white">Right to Erasure / Deletion</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              You have the right to request the deletion of your personal data when the processing purpose is fulfilled, unless retention is legally mandated.
            </p>
          </div>
          <div className="p-4 bg-[#111111] border border-white/10 rounded-none space-y-1.5">
            <span className="text-xs font-mono text-brand-red font-bold uppercase">Right 4</span>
            <h3 className="font-display text-sm font-semibold text-white">Right to Grievance Redressal</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              You are entitled to readily accessible grievance redressal mechanisms through our designated Grievance Officer before approaching regulatory bodies.
            </p>
          </div>
          <div className="p-4 bg-[#111111] border border-white/10 rounded-none space-y-1.5 sm:col-span-2">
            <span className="text-xs font-mono text-brand-red font-bold uppercase">Right 5</span>
            <h3 className="font-display text-sm font-semibold text-white">Right to Nominate</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              In accordance with Section 14 of the DPDP Act 2023, you have the right to nominate an individual who shall, in the event of your death or incapacity, exercise your rights as a Data Principal.
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          To exercise any of these rights, please email your written request to our Grievance Officer at <code>privacy@designtouchplus.com</code>. We will verify your identity and respond within thirty (30) business days or within the statutory timelines prescribed under notified DPDP Rules.
        </p>
      </section>

      {/* 9. Children's Privacy */}
      <section id="children-privacy" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">09.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Children&apos;s Privacy Protection
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          DesignTouch+ is a commercial creative studio offering services tailored to corporate enterprises, brands, content creators, and business clients aged eighteen (18) years or older. We do not knowingly market to or solicit personal data from children under the age of 18.
        </p>
        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
          If we become aware that we have inadvertently collected personal data relating to a minor without verified parental consent, we will take immediate steps to purge such information from our records.
        </p>
      </section>

      {/* 10. Grievance Officer */}
      <section id="grievance-contact" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">10.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Grievance Officer &amp; Legal Contact
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          In compliance with the Information Technology Act, 2000, the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and Section 10 of India&apos;s Digital Personal Data Protection Act, 2023, the contact details of our designated Grievance Officer are set forth below:
        </p>

        <div className="border border-white/10 bg-[#111111] rounded-none p-5 sm:p-6 space-y-3 font-mono text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Designated Officer:</span>
            <span className="sm:col-span-2 text-white font-medium">
              [Insert Grievance Officer Name, e.g., Ramesh S. / Legal Counsel]
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Designation:</span>
            <span className="sm:col-span-2 text-white font-medium">
              Grievance Officer &amp; Privacy Compliance Lead
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Direct Privacy Email:</span>
            <span className="sm:col-span-2 text-brand-red font-medium">
              privacy@designtouchplus.com
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Studio Address:</span>
            <span className="sm:col-span-2 text-white font-medium">
              [Insert Registered Office Address, City, State, PIN, India]
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <span className="text-neutral-500">Statutory Resolution Window:</span>
            <span className="sm:col-span-2 text-brand-green font-medium">
              Acknowledgment within 24 hours · Final resolution within 30 days
            </span>
          </div>
        </div>
      </section>

      {/* 11. Amendments */}
      <section id="policy-updates" className="scroll-mt-32 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="font-mono text-sm text-brand-red font-bold">11.</span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Policy Modifications &amp; Notice
          </h2>
        </div>
        <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
          We reserve the right to revise this Privacy Policy periodically to reflect changes in our production processes, statutory legal requirements (including subsequent notifications from the Data Protection Board of India), or technological advancements.
        </p>
        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
          When material changes are made, we will update the &quot;Last Revised&quot; date at the top of this document and, where appropriate, provide a prominent notice on our website or notify existing subscribers via email. Continued engagement with DesignTouch+ following an update constitutes acceptance of the modified terms.
        </p>

        {/* Cross link to Cookie Policy */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-neutral-500 font-mono block">Looking for cookie choices?</span>
            <span className="text-sm text-white font-semibold">Manage your interactive cookie consent preferences</span>
          </div>
          <Link
            href="/cookie-policy"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-white/[0.05] border border-white/10 text-white text-xs font-sans rounded-none transition-colors"
          >
            <span>Visit Cookie Policy</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-red" />
          </Link>
        </div>
      </section>
    </LegalPageLayout>
  );
}

