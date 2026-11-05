import { Mail, Phone, MapPin, Clock } from "lucide-react";
import {
  parseSocialLinks,
  getSocialPlatformIcon,
  validateSocialUrl,
} from "@/lib/socialPlatforms";

const DEFAULT_DIRECT_CONTACT = {
  eyebrow: "GET IN TOUCH",
  heading: "DIRECT CONTACT",
  description:
    "Prefer direct communication? Reach out to our team via email, phone, or WhatsApp.",
  emailLabel: "EMAIL US",
  email: "hello@designtouchplus.com",
  emailSub: "We'll reply within 24 hours",
  phoneLabel: "CALL / WHATSAPP",
  phone: "+91 12345 67890",
  phoneSub: "Mon - Sat: 10:00 AM - 7:00 PM",
  locationLabel: "OUR LOCATION",
  location: "India · Remote Worldwide",
  locationSub: "We work with clients globally",
  workingHoursLabel: "WORKING HOURS",
  workingHours: "Monday - Saturday, 10:00 AM - 7:00 PM (IST)",
  workingHoursSub: "",
};

const ContactInfoCards = ({ companyInfo, content }) => {
  const eyebrow = content?.directContactEyebrow || DEFAULT_DIRECT_CONTACT.eyebrow;
  const heading = content?.directContactHeading || DEFAULT_DIRECT_CONTACT.heading;
  const description =
    content?.directContactDescription || DEFAULT_DIRECT_CONTACT.description;

  const email =
    content?.directContactEmail ||
    companyInfo?.email ||
    DEFAULT_DIRECT_CONTACT.email;
  const emailLabel =
    content?.directContactEmailLabel || DEFAULT_DIRECT_CONTACT.emailLabel;
  const emailSub =
    content?.directContactEmailSub !== undefined &&
    content?.directContactEmailSub !== null
      ? content?.directContactEmailSub
      : DEFAULT_DIRECT_CONTACT.emailSub;

  const phone =
    content?.directContactPhone ||
    companyInfo?.whatsappNumber ||
    companyInfo?.phone ||
    DEFAULT_DIRECT_CONTACT.phone;
  const phoneLabel =
    content?.directContactPhoneLabel || DEFAULT_DIRECT_CONTACT.phoneLabel;
  const phoneSub =
    content?.directContactPhoneSub !== undefined &&
    content?.directContactPhoneSub !== null
      ? content?.directContactPhoneSub
      : DEFAULT_DIRECT_CONTACT.phoneSub;

  const location =
    content?.directContactLocation ||
    companyInfo?.address ||
    DEFAULT_DIRECT_CONTACT.location;
  const locationLabel =
    content?.directContactLocationLabel || DEFAULT_DIRECT_CONTACT.locationLabel;
  const locationSub =
    content?.directContactLocationSub !== undefined &&
    content?.directContactLocationSub !== null
      ? content?.directContactLocationSub
      : DEFAULT_DIRECT_CONTACT.locationSub;

  const workingHours =
    content?.directContactWorkingHours ||
    companyInfo?.workingHours ||
    DEFAULT_DIRECT_CONTACT.workingHours;
  const workingHoursLabel =
    content?.directContactWorkingHoursLabel ||
    DEFAULT_DIRECT_CONTACT.workingHoursLabel;
  const workingHoursSub =
    content?.directContactWorkingHoursSub || DEFAULT_DIRECT_CONTACT.workingHoursSub;

  const cleanPhoneDigits = phone ? phone.replace(/[^\d]/g, "") : "";
  const cleanPhoneTel = phone ? phone.replace(/[^\d+]/g, "") : "";

  const isEmailEnabled = content?.directContactEmailEnabled !== false;
  const isPhoneEnabled = content?.directContactPhoneEnabled !== false;
  const isLocationEnabled = content?.directContactLocationEnabled !== false;
  const isWorkingHoursEnabled =
    content?.directContactWorkingHoursEnabled !== false;

  const cards = [
    {
      id: "email",
      icon: Mail,
      label: emailLabel,
      value: email,
      sub: emailSub,
      href: email ? `mailto:${email}` : null,
      whatsappHref: null,
      enabled: isEmailEnabled,
    },
    {
      id: "phone",
      icon: Phone,
      label: phoneLabel,
      value: phone,
      sub: phoneSub,
      href: cleanPhoneTel ? `tel:${cleanPhoneTel}` : null,
      whatsappHref: cleanPhoneDigits ? `https://wa.me/${cleanPhoneDigits}` : null,
      enabled: isPhoneEnabled,
    },
    {
      id: "location",
      icon: MapPin,
      label: locationLabel,
      value: location,
      sub: locationSub,
      href: null,
      whatsappHref: null,
      enabled: isLocationEnabled,
    },
    {
      id: "hours",
      icon: Clock,
      label: workingHoursLabel,
      value: workingHours,
      sub: workingHoursSub,
      href: null,
      whatsappHref: null,
      enabled: isWorkingHoursEnabled,
    },
  ].filter((card) => card.enabled && card.value);

  const allSocialLinks = parseSocialLinks(content?.socialLinks);
  const enabledSocialLinks = allSocialLinks.filter(
    (link) =>
      link.enabled !== false &&
      Boolean(link.url && link.url.trim()) &&
      validateSocialUrl(link.url, link.platform)
  );

  return (
    <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-[6px] p-6 sm:p-8 lg:p-10 h-full flex flex-col justify-between">
      <div>
        <div className="mb-7 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2 h-2 rounded-full bg-brand-red shrink-0"
              aria-hidden="true"
            />
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-neutral-400">
              {eyebrow}
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-[32px] font-extrabold uppercase leading-tight tracking-tight text-white mb-2.5">
            {heading}
          </h2>
          {description && (
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="divide-y divide-white/[0.06]">
          {cards.map(({ id, icon: Icon, label, value, sub, href, whatsappHref }) => (
            <div
              key={id}
              className="py-4 sm:py-5 first:pt-0 last:pb-0 flex items-start gap-4"
            >
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-[3px] border border-brand-red/35 bg-brand-red/[0.06] flex items-center justify-center shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <Icon className="w-4 h-4 text-brand-red" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  {label}
                </p>
                {href ? (
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <a
                      href={href}
                      className="text-sm font-semibold text-white hover:text-brand-red transition-colors block break-words"
                    >
                      {value}
                    </a>
                    {whatsappHref && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-brand-green hover:underline cursor-pointer"
                        title="Chat on WhatsApp"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" aria-hidden="true" />
                        WhatsApp &rarr;
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-white break-words">
                    {value}
                  </p>
                )}
                {sub && (
                  <p className="text-xs text-neutral-500 mt-1 leading-normal">
                    {sub}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {enabledSocialLinks.length > 0 && (
        <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center gap-2.5 flex-wrap">
          {enabledSocialLinks.map((link) => {
            const Icon = getSocialPlatformIcon(link.platform);
            return (
              <a
                key={link.id || `${link.platform}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
                title={link.platform}
                className="w-8 h-8 rounded-[3px] bg-white/[0.04] border border-white/[0.08] hover:border-brand-red flex items-center justify-center text-neutral-400 hover:text-white transition-colors duration-200 no-underline"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactInfoCards;
