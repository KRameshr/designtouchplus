"use client";

import { useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

// High-quality cinematic production/filming studio photograph fallback
const PRODUCTION_SHOOT_FALLBACK_IMAGE = "/assets/about/production-shoot.jpg";

/**
 * Helper to render heading with "Crafting Stories That" and "Resonate." highlighted
 * in brand green matching the client reference.
 */
function renderStoryHeading(rawHeading) {
  const text = (rawHeading || "").trim();

  // If empty or default "Crafting Stories That Resonate."
  if (!text || /^crafting\s+stories\s+that\s+resonate\.?$/i.test(text)) {
    return (
      <>
        Crafting Stories That <span className="text-brand-green">Resonate.</span>
      </>
    );
  }

  // If customized heading contains "Resonate"
  if (/resonate/i.test(text)) {
    const parts = text.split(/resonate/i);
    return (
      <>
        {parts[0]}
        <span className="text-brand-green">Resonate{parts[1] || "."}</span>
      </>
    );
  }

  // If customized heading contains "Impact"
  if (/impact/i.test(text)) {
    const parts = text.split(/impact/i);
    return (
      <>
        {parts[0]}
        <span className="text-brand-green">Impact{parts[1] || "."}</span>
      </>
    );
  }

  // Fallback text
  return <span className="text-white">{text}</span>;
}

const OurStory = ({ aboutContent }) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // Dynamic image / video poster from CMS with realistic production-shoot fallback
  const posterImage =
    (aboutContent && (aboutContent.storyImageUrl || aboutContent.storyVideoThumbnailUrl)) ||
    PRODUCTION_SHOOT_FALLBACK_IMAGE;

  // Video source: configurable from CMS, with public demo fallback if unconfigured
  const configuredVideo = aboutContent?.storyVideoUrl?.trim() || "";
  const videoSrc = configuredVideo || "/hero-demo.mp4";

  // Default story paragraphs matching client specification
  const defaultParagraph1 =
    "DesignTouch+ was born out of a love for storytelling and a passion for visual creativity.";
  const defaultParagraph2 =
    "We believe every brand has a story worth telling, and our job is to tell it the right way.";

  const paragraph1 = aboutContent?.storyParagraph1?.trim() || defaultParagraph1;
  const paragraph2 = aboutContent?.storyParagraph2?.trim() || defaultParagraph2;

  // Dynamic Founder Details — not hardcoded
  const founderName = aboutContent?.founderName?.trim() || "Rohit Sharma";
  const founderDesignationRaw = aboutContent?.founderDesignation?.trim() || "Founder, DesignTouch+";
  const founderDesignation =
    founderDesignationRaw.startsWith("—") || founderDesignationRaw.startsWith("-")
      ? founderDesignationRaw
      : `— ${founderDesignationRaw}`;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section
      aria-label="Our Story"
      className="relative w-full overflow-hidden bg-[#080808] border-b border-white/[0.08] min-h-[680px] sm:min-h-[740px] lg:min-h-[800px] flex items-center"
    >
      {/* Cinematic Full-Width Background Video (Autoplay muted loop) */}
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterImage}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
        />
      ) : (
        /* High-quality studio photograph fallback */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterImage}
          alt="DesignTouch+ Studio Production Shoot"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
          loading="lazy"
        />
      )}

      {/* Subtle Dark Gradient Overlay: Left-aligned for text readability while keeping the video visible on the right */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 via-45% to-black/20 pointer-events-none z-[1]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none z-[1]"
        aria-hidden="true"
      />

      {/* Left-Aligned Story Content Overlaid Directly on Top of the Video */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 sm:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-xl lg:max-w-2xl flex flex-col items-start text-left"
        >
          {/* Section Label: THE JOURNEY with Red Square Accent */}
          <div className="flex items-center gap-2.5 mb-3.5 sm:mb-4">
            <span
              className="w-2.5 h-2.5 bg-brand-red rounded-none shrink-0 inline-block"
              aria-hidden="true"
            />
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.24em] text-neutral-300">
              THE JOURNEY
            </span>
          </div>

          {/* Main Heading: Crafting Stories That Resonate. */}
          <h2 className="font-display font-black uppercase tracking-[-0.03em] text-white text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[50px] leading-[1.08] mb-6">
            {aboutContent && aboutContent.storyHeading && aboutContent.storyHeading !== "Turning Ideas Into Impact." ? (
              renderStoryHeading(aboutContent.storyHeading)
            ) : (
              <>
                Crafting Stories That <span className="text-brand-green">Resonate.</span>
              </>
            )}
          </h2>

          {/* Story Narrative Paragraphs */}
          <div className="text-neutral-200 text-sm sm:text-base lg:text-[16px] leading-[1.75] font-normal font-poppins space-y-3.5 max-w-xl mb-7">
            <p className="text-neutral-200 font-medium font-poppins">
              From boutique storytelling to high-impact commercial visuals, every frame we produce is driven by purpose, craft, and precision.
            </p>
            <p className="text-neutral-300 font-poppins">
              {paragraph1}
            </p>
            {paragraph2 && (
              <p className="text-neutral-300 font-poppins">
                {paragraph2}
              </p>
            )}
          </div>

          {/* Dynamic Founder Signature & Designation */}
          <div className="flex flex-col items-start pt-3.5 border-t border-white/[0.12] w-full max-w-xs">
            {aboutContent?.founderSignatureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={aboutContent.founderSignatureUrl}
                alt={`Founder Signature - ${founderName}`}
                className="h-8 sm:h-10 w-auto object-contain object-left mb-1.5 brightness-0 invert opacity-90 select-none"
              />
            ) : (
              /* Clean, professional text-based signature fallback */
              <div
                className="font-serif italic text-2xl sm:text-[26px] text-white/90 tracking-wide select-none mb-1 font-light"
                style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
                aria-label={`Founder Signature: ${founderName}`}
              >
                {founderName}
              </div>
            )}
            <p className="text-xs sm:text-[13px] text-neutral-400 font-sans tracking-normal font-medium">
              {founderDesignation}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Accessible Mute/Unmute Video Sound Control */}
      {videoSrc && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute bottom-6 right-6 z-20 flex items-center gap-2 px-3.5 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 hover:border-white/20 text-white text-xs font-mono tracking-wider rounded-[2px] transition-all cursor-pointer shadow-lg select-none"
          aria-label={isMuted ? "Unmute background video" : "Mute background video"}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-brand-red" />
              <span className="hidden sm:inline text-neutral-300">Unmute</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-brand-green" />
              <span className="hidden sm:inline text-neutral-300">Mute</span>
            </>
          )}
        </button>
      )}
    </section>
  );
};

export default OurStory;
