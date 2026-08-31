"use client";

import { Play } from "lucide-react";
import { motion } from "framer-motion";

const OurStory = ({ aboutContent }) => {
  if (!aboutContent) return null;

  return (
    <section className="bg-[#0a0a0a] text-white px-6 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Our Story
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-6">
            Turning Ideas Into{" "}
            <span className="bg-gradient-to-r from-brand-red to-brand-green bg-clip-text text-transparent">
              Impact.
            </span>
          </h2>

          {aboutContent.storyParagraph1 && (
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {aboutContent.storyParagraph1}
            </p>
          )}
          {aboutContent.storyParagraph2 && (
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {aboutContent.storyParagraph2}
            </p>
          )}

          {aboutContent.founderName && (
            <p className="text-white text-sm font-bold italic">
              — {aboutContent.founderName}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent"
        >
          {aboutContent.storyVideoThumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={aboutContent.storyVideoThumbnailUrl}
              alt="Our journey"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <button
              type="button"
              className="flex items-center gap-3 bg-white/95 hover:bg-white text-black rounded-full pl-3 pr-5 py-3 cursor-pointer border-none transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
              </span>
              <span className="text-left">
                <span className="block text-xs font-bold">Our Journey</span>
                <span className="block text-[10px] text-gray-600">
                  Watch our story in 60 seconds
                </span>
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OurStory;
