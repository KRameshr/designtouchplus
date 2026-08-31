"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Splits FAQs into two columns (matches the Figma layout) and lets one
// question be open at a time per column.
const FaqAccordion = ({ faqs = [], heading = "Frequently Asked Questions" }) => {
  const [openId, setOpenId] = useState(null);

  if (faqs.length === 0) return null;

  const mid = Math.ceil(faqs.length / 2);
  const columns = [faqs.slice(0, mid), faqs.slice(mid)];

  const toggle = (id) => setOpenId((current) => (current === id ? null : id));

  return (
    <section className="bg-[#0a0a0a] text-white px-6 py-16 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
            {heading}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-3">
              {column.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggle(faq.id)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-transparent border-none cursor-pointer"
                    >
                      <span className="text-sm font-bold text-white">{faq.question}</span>
                      <Plus
                        className={`w-4 h-4 text-brand-red shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;
