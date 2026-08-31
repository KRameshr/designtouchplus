"use client";

import { Gem, Rocket, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

// Maps common value titles to an icon — backend doesn't store an icon key
// for CompanyValue, so we infer from the title text.
const getIcon = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("quality")) return Gem;
  if (t.includes("creativ")) return Rocket;
  if (t.includes("time")) return Clock;
  return Users;
};

const ValuesGrid = ({ values = [] }) => {
  if (values.length === 0) return null;

  return (
    <section className="bg-[#0a0a0a] text-white px-6 py-16 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Our Values
          </span>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {values.map((value) => {
            const Icon = getIcon(value.title);
            return (
              <motion.div
                key={value.id}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4 }}
                className="bg-white/[0.03] border border-white/10 rounded-xl p-6"
              >
                <div className="w-11 h-11 rounded-lg bg-brand-red/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-red" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{value.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ValuesGrid;
