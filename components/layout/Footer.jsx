"use client";

import { useState } from "react";
import Link from "next/link";
import { Instagram, Youtube, Linkedin, Send } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/api";

const QUICK_LINKS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Pricing", path: "/pricing" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

const SERVICES = [
  "Video Editing",
  "Motion Graphics",
  "Social Media Content",
  "YouTube Management",
  "Graphic Design",
  "Thumbnail Design",
  "Branding",
];

// companyInfo is fetched server-side in app/layout.js and passed down as a
// prop — avoids a second client-side fetch for data we already have.
const Footer = ({ companyInfo }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      await subscribeToNewsletter(email);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/[0.06] pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
          {/* Brand + social */}
          <div className="lg:col-span-2">
            <div className="flex flex-col leading-none mb-4">
              <span className="text-lg font-black tracking-tight text-white">
                DE<span className="text-brand-red">S</span>IGN
              </span>
              <span className="text-lg font-black tracking-tight text-white -mt-1">
                T<span className="text-brand-green">O</span>UCH
                <span className="text-brand-red">+</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-5">
              We create videos that tell stories, build brands and drive
              results.
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-brand-red transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-4">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              {QUICK_LINKS.map(({ name, path }) => (
                <li key={path}>
                  <Link
                    href={path}
                    className="text-gray-400 hover:text-white text-sm no-underline transition-colors duration-200"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-4">
              Services
            </h4>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              {SERVICES.map((service) => (
                <li key={service} className="text-gray-400 text-sm">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info + newsletter */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-4">
              Contact Info
            </h4>
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0 mb-6 text-sm text-gray-400">
              {companyInfo?.phone && <li>{companyInfo.phone}</li>}
              {companyInfo?.email && <li>{companyInfo.email}</li>}
              {companyInfo?.address && <li>{companyInfo.address}</li>}
            </ul>

            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-3">
              Newsletter
            </h4>
            <p className="text-gray-500 text-xs mb-3">
              Get updates on our latest projects and creative tips.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-brand-red transition-colors duration-200"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                aria-label="Subscribe"
                className="w-10 h-10 flex-shrink-0 rounded-lg bg-brand-red text-white flex items-center justify-center disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            {status === "success" && (
              <p className="text-brand-green text-xs mt-2">Subscribed — thank you!</p>
            )}
            {status === "error" && (
              <p className="text-brand-red text-xs mt-2">Something went wrong. Try again.</p>
            )}
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs m-0">
            © {new Date().getFullYear()} DesignTouch+. All Rights Reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-gray-500 hover:text-white text-xs no-underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-white text-xs no-underline">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
