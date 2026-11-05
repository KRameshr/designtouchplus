"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Linkedin, Instagram } from "lucide-react";
import { isValidSocialUrl, getSafeSocialHref } from "@/lib/socialUtils";

// Re-export for convenience and compatibility
export { isValidSocialUrl, getSafeSocialHref };

// Default DesignTouch+ team members matching canonical CMS database records
export const DEFAULT_TEAM = [
  {
    id: "team-rohit",
    name: "Rohit Sharma",
    role: "Founder & Creative Director",
    photoUrl: "",
    linkedinUrl: "https://www.linkedin.com/in/rohitsharma/",
    instagramUrl: "https://www.instagram.com/rohitsharma/",
    displayOrder: 1,
  },
  {
    id: "team-arjun",
    name: "Arjun Verma",
    role: "Head of Video Production",
    photoUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
    displayOrder: 2,
  },
  {
    id: "team-pooja",
    name: "Pooja Nair",
    role: "Motion Graphics Designer",
    photoUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
    displayOrder: 3,
  },
];

/**
 * Team member item component following the client reference editorial aesthetic:
 * - Square portrait image (1:1 aspect ratio) with clean grayscale styling
 * - Clean neutral fallback avatar if photo is missing or fails to load
 * - Name placed immediately below image in bold white typography
 * - Role placed below name in muted gray
 * - Optional email only if a genuine email address is present in data
 * - Minimal social links row for LinkedIn & Instagram with accessible labels and brand hover accents
 * - Minimal editorial design with no card background wrappers
 */
function TeamMemberItem({ member }) {
  const [imgError, setImgError] = useState(false);
  const rawPhoto = (member?.photoUrl || "").trim();
  const hasPhoto = Boolean(rawPhoto) && !imgError;

  const linkedinUrl = member?.linkedinUrl || member?.linkedin_url || "";
  const instagramUrl = member?.instagramUrl || member?.instagram_url || "";
  const hasLinkedIn = isValidSocialUrl(linkedinUrl, "linkedin");
  const hasInstagram = isValidSocialUrl(instagramUrl, "instagram");
  const hasSocialLinks = hasLinkedIn || hasInstagram;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group flex flex-col text-left select-none"
    >
      {/* 1. Large Consistent Square Portrait Image (1:1 aspect ratio, sharp minimal edges, no card container) */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#121212] border border-white/[0.06] rounded-[1px] transition-colors duration-250 group-hover:border-white/20">
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rawPhoto}
            alt={member.name || "DesignTouch+ Team Member"}
            className="w-full h-full object-cover grayscale contrast-[1.05] transition-all duration-300 group-hover:scale-[1.02] group-hover:contrast-110"
            onError={() => setImgError(true)}
            loading="lazy"
            decoding="async"
          />
        ) : (
          /* Clean neutral fallback when no photo is uploaded, preserving editorial dark minimalism */
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#111111] text-neutral-500 p-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-3 transition-colors duration-250 group-hover:border-white/20">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-400 stroke-[1.5]" />
            </div>
            <span className="text-[11px] sm:text-xs font-mono font-medium tracking-wider text-neutral-400 text-center uppercase truncate max-w-full">
              {member.name || "DesignTouch+ Team"}
            </span>
          </div>
        )}
      </div>

      {/* 2. Text Details Placed Immediately Below Image */}
      <div className="mt-4 sm:mt-4.5 text-left">
        {/* Name: Crisp Bold White */}
        <h3 className="text-base sm:text-lg lg:text-xl font-display font-bold text-white tracking-tight leading-snug">
          {member.name}
        </h3>

        {/* Role: Subtle Muted-Gray */}
        <p className="text-xs sm:text-sm font-sans font-normal text-neutral-400 mt-1 leading-normal">
          {member.role}
        </p>

        {/* Email: Plain text link in muted gray, rendered ONLY if a genuine email address exists in the team data */}
        {member.email && typeof member.email === "string" && member.email.trim() && (
          <a
            href={`mailto:${member.email.trim()}`}
            className="block text-xs sm:text-[13px] font-sans text-neutral-500 hover:text-white transition-colors mt-1 leading-normal"
          >
            {member.email.trim()}
          </a>
        )}

        {/* 3. Social Links Row: Displayed ONLY when at least one valid social URL exists */}
        {hasSocialLinks && (
          <div className="flex items-center gap-3 mt-2.5 pt-0.5">
            {hasLinkedIn && (
              <a
                href={getSafeSocialHref(linkedinUrl)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name}'s LinkedIn profile`}
                className="text-neutral-400 hover:text-brand-red transition-colors duration-200 inline-flex items-center justify-center p-0.5"
              >
                <Linkedin className="w-4 h-4" strokeWidth={1.75} />
              </a>
            )}
            {hasInstagram && (
              <a
                href={getSafeSocialHref(instagramUrl)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name}'s Instagram profile`}
                className="text-neutral-400 hover:text-brand-green transition-colors duration-200 inline-flex items-center justify-center p-0.5"
              >
                <Instagram className="w-4 h-4" strokeWidth={1.75} />
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

const TeamGrid = ({ team = [] }) => {
  const members = Array.isArray(team) && team.length > 0 ? team : DEFAULT_TEAM;

  return (
    <section
      aria-label="Meet The Team"
      className="bg-[#080808] text-white py-16 sm:py-20 lg:py-24 border-b border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Eyebrow Label: Red square accent + "The Team" */}
        <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3">
          <span
            className="w-2.5 h-2.5 bg-brand-red rounded-none shrink-0 inline-block"
            aria-hidden="true"
          />
          <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.24em] text-neutral-300">
            The Team
          </span>
        </div>

        {/* Main Heading: "The Creative Minds Behind DesignTouch+" with Brand Color Accents */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold tracking-tight text-white mb-10 sm:mb-12 lg:mb-14 leading-tight">
          The Creative Minds Behind{" "}
          <span className="text-brand-red">Design</span>
          <span className="text-brand-green">Touch+</span>
        </h2>

        {/* 3-Column Desktop Grid, 2-Column Tablet, 1-Column Mobile with Generous Spacing */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 sm:gap-x-10 lg:gap-x-12 gap-y-12 sm:gap-y-14 lg:gap-y-16"
        >
          {members.map((member) => (
            <TeamMemberItem key={member.id || member.name} member={member} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TeamGrid;
