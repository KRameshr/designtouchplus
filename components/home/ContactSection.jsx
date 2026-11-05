"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const ContactSection = ({ companyInfo, contactContent }) => {
  // Enabled flags from CMS
  const isPhoneEnabled = contactContent?.directContactPhoneEnabled !== false;
  const isEmailEnabled = contactContent?.directContactEmailEnabled !== false;
  const isLocationEnabled = contactContent?.directContactLocationEnabled !== false;

  // Contact details: dynamic from contactContent, fallback to companyInfo, then fallback defaults
  const phone =
    contactContent?.directContactPhone ||
    companyInfo?.whatsappNumber ||
    companyInfo?.phone ||
    "+91 12345 67890";
  const phoneLabel =
    contactContent?.directContactPhoneLabel || "Phone / WhatsApp";

  const email =
    contactContent?.directContactEmail ||
    companyInfo?.email ||
    "hello@designtouchplus.com";
  const emailLabel =
    contactContent?.directContactEmailLabel || "Email Address";

  const location =
    contactContent?.directContactLocation ||
    companyInfo?.address ||
    "India · Remote Worldwide";
  const locationLabel =
    contactContent?.directContactLocationLabel || "Location";

  const cleanPhoneTel = phone ? phone.replace(/[^\d+]/g, "") : "";

  return (
    <section
      id="contact"
      aria-label="Contact and Project Inquiry"
      className="bg-[#080808] text-white py-16 sm:py-20 lg:py-24 border-t border-white/[0.08] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-stretch">
          {/* Left Column: Heading, description, contact details & social links */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span
                  className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                  LET&apos;S CONNECT // START A PROJECT
                </span>
              </div>

              {/* Main Heading */}
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-[1.05] tracking-tight text-white mb-4 sm:mb-5">
                LET&apos;S CREATE SOMETHING{" "}
                <span className="text-brand-red">AMAZING</span>
              </h2>

              {/* Description */}
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
                Have a project in mind? Let&apos;s talk and bring your ideas to life.
              </p>

              {/* Contact Info Items */}
              <div className="flex flex-col gap-4 mb-8 sm:mb-10">
                {/* Phone (if enabled) */}
                {isPhoneEnabled && (
                  <a
                    href={cleanPhoneTel ? `tel:${cleanPhoneTel}` : `tel:${phone}`}
                    className="flex items-center gap-3.5 text-sm sm:text-base text-neutral-300 hover:text-white transition-colors duration-200 group no-underline"
                    aria-label={`Call or WhatsApp: ${phone}`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-white/[0.04] border border-white/[0.08] group-hover:border-brand-red/60 transition-colors duration-200 rounded-none shrink-0">
                      <Phone className="w-4 h-4 text-brand-red shrink-0" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                        {phoneLabel}
                      </span>
                      <span className="font-mono text-sm sm:text-base font-medium text-neutral-200 group-hover:text-white transition-colors duration-200">
                        {phone}
                      </span>
                    </div>
                  </a>
                )}

                {/* Email (if enabled) */}
                {isEmailEnabled && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3.5 text-sm sm:text-base text-neutral-300 hover:text-white transition-colors duration-200 group no-underline"
                    aria-label={`Email: ${email}`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-white/[0.04] border border-white/[0.08] group-hover:border-brand-red/60 transition-colors duration-200 rounded-none shrink-0">
                      <Mail className="w-4 h-4 text-brand-red shrink-0" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                        {emailLabel}
                      </span>
                      <span className="font-mono text-sm sm:text-base font-medium text-neutral-200 group-hover:text-white transition-colors duration-200">
                        {email}
                      </span>
                    </div>
                  </a>
                )}

                {/* Location (if enabled) */}
                {isLocationEnabled && (
                  <div className="flex items-center gap-3.5 text-sm sm:text-base text-neutral-300">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/[0.04] border border-white/[0.08] rounded-none shrink-0">
                      <MapPin className="w-4 h-4 text-brand-red shrink-0" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                        {locationLabel}
                      </span>
                      <span className="text-sm sm:text-base font-medium text-neutral-200">
                        {location}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Project CTA panel / card */}
          <div className="bg-[#0e0e0e] border border-white/[0.08] p-8 sm:p-10 lg:p-12 rounded-none relative flex flex-col justify-between">
            {/* Subtle red indicator at top */}
            <div
              className="absolute top-0 left-0 w-12 h-[2px] bg-brand-red"
              aria-hidden="true"
            />

            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 mb-6 rounded-none">
                <span
                  className="w-1.5 h-1.5 bg-brand-red inline-block shrink-0"
                  aria-hidden="true"
                />
                Direct Collaboration
              </div>

              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white mb-4">
                HAVE A PROJECT IN MIND?
              </h3>

              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                Tell us what you&apos;re planning. Let&apos;s turn your vision into something exceptional.
              </p>
            </div>

            <div className="space-y-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-5 bg-brand-red hover:bg-red-600 text-white font-display font-bold uppercase tracking-widest text-xs sm:text-sm rounded-none transition-colors duration-200 no-underline group shadow-lg shadow-brand-red/10 w-full sm:w-auto"
              >
                <span>START A PROJECT →</span>
              </Link>

              <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                <span>Average response time</span>
                <span className="text-neutral-300 font-semibold">&lt; 24 Hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
