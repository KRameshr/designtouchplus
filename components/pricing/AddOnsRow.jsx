"use client";

import { Clock, Image, Captions, Zap, PenLine } from "lucide-react";
import { motion } from "framer-motion";

const ADDON_ICONS = {
  "Additional Minute": Clock,
  "Thumbnail Design": Image,
  "Subtitles (Per Video)": Captions,
  "Rush Delivery": Zap,
  "Script Writing (Per Video)": PenLine,
};

const AddOnsRow = ({ addOns = [] }) => {
  if (addOns.length === 0) return null;

  return (
    <section className="bg-[#0a0a0a] text-white px-6 pb-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Add-Ons
          </span>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="flex flex-wrap gap-4"
        >
          {addOns.map((addOn) => {
            const Icon = ADDON_ICONS[addOn.name] || Zap;
            return (
              <motion.div
                key={addOn.id}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3"
              >
                <Icon className="w-4 h-4 text-brand-red shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">{addOn.name}</p>
                  <p className="text-[11px] text-brand-green">{addOn.priceLabel}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default AddOnsRow;
