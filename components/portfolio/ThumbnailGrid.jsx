"use client";

import Link from "next/link";
import { Image as ImageIcon, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Thumbnails are image-based (no video/play button), tagged by subCategory
// instead of the video-editing category enum.
const ThumbnailGrid = ({ items = [] }) => {
  if (items.length === 0) return null;

  return (
    <section className="bg-[#0a0a0a] text-white px-6 py-16 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 shrink-0">
            <ImageIcon className="w-4 h-4 text-brand-red" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white whitespace-nowrap">
              Thumbnail Design
            </h2>
          </div>
          <div className="flex-1 h-px bg-white/[0.08]" />
          <Link
            href="/portfolio"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white no-underline shrink-0 transition-colors"
          >
            View All Thumbnails <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-white/[0.04] border border-white/10 mb-2">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/[0.06] to-transparent" />
                )}
              </div>
              <p className="text-xs font-bold text-white truncate">{item.title}</p>
              {item.subCategory && (
                <p className="text-[10px] text-gray-500">{item.subCategory}</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ThumbnailGrid;
