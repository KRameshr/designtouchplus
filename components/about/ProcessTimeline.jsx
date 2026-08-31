"use client";

import { MessageCircle, Lightbulb, Clapperboard, Edit3, Send } from "lucide-react";
import { motion } from "framer-motion";

const STEP_ICONS = [MessageCircle, Lightbulb, Clapperboard, Edit3, Send];

const ProcessTimeline = ({ steps = [] }) => {
  if (steps.length === 0) return null;

  return (
    <section className="bg-[#0a0a0a] text-white px-6 py-16 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Our Process
          </span>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-5 gap-8 sm:gap-4">
          {/* Connecting line — desktop only */}
          <div className="hidden sm:block absolute top-6 left-[10%] right-[10%] h-px bg-white/10" />

          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i % STEP_ICONS.length];
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative text-center"
              >
                <div className="relative z-10 w-12 h-12 mx-auto rounded-full bg-[#0a0a0a] border border-white/15 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-red" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
