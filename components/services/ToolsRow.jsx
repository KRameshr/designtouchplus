"use client";

import { motion } from "framer-motion";

const ToolsRow = ({ tools = [] }) => {
  if (tools.length === 0) return null;

  return (
    <section className="bg-[#0a0a0a] text-white px-6 py-16 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Tools We Use
          </span>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="flex flex-wrap gap-3"
        >
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-full px-4 py-2.5"
            >
              <span className="text-xs font-bold text-gray-300">{tool.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ToolsRow;
