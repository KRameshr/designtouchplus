"use client";

import Link from "next/link";
import {
  Film,
  Sparkles,
  Smartphone,
  Youtube,
  PenTool,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

// Maps the backend Service.icon string to an actual icon component.
const ICON_MAP = {
  video: Film,
  motion: Sparkles,
  social: Smartphone,
  youtube: Youtube,
  graphic: PenTool,
  branding: Rocket,
};

// Maps Service.colorTheme (from the backend) to Tailwind classes — matches
// the per-card icon color used in the Figma "OUR SERVICES" grid (red, green,
// orange, purple, blue, yellow).
const COLOR_MAP = {
  red: {
    icon: "text-brand-red",
    bg: "bg-brand-red/10",
    border: "hover:border-brand-red/40",
    groupHoverText: "group-hover:text-brand-red",
  },
  green: {
    icon: "text-brand-green",
    bg: "bg-brand-green/10",
    border: "hover:border-brand-green/40",
    groupHoverText: "group-hover:text-brand-green",
  },
  orange: {
    icon: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "hover:border-orange-400/40",
    groupHoverText: "group-hover:text-orange-400",
  },
  purple: {
    icon: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "hover:border-purple-400/40",
    groupHoverText: "group-hover:text-purple-400",
  },
  blue: {
    icon: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "hover:border-blue-400/40",
    groupHoverText: "group-hover:text-blue-400",
  },
  yellow: {
    icon: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "hover:border-yellow-400/40",
    groupHoverText: "group-hover:text-yellow-400",
  },
};

const Services = ({ services = [] }) => {
  if (services.length === 0) return null;

  return (
    <section className="bg-[#0a0a0a] text-white px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              What We Do
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase">
            Our{" "}
            <span className="bg-gradient-to-r from-brand-red to-brand-green bg-clip-text text-transparent">
              Services
            </span>
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((service) => {
            const Icon = ICON_MAP[service.icon] || Sparkles;
            const colors = COLOR_MAP[service.colorTheme] || COLOR_MAP.red;

            return (
              <motion.div
                key={service.id}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4 }}
                className={`group bg-white/[0.03] border border-white/10 ${colors.border} rounded-xl p-6 transition-colors duration-300`}
              >
                <div className={`w-11 h-11 rounded-lg ${colors.bg} flex items-center justify-center mb-5 transition-colors duration-300`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {service.description}
                </p>
                <Link
                  href={`/services/${service.slug}`}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-300 ${colors.groupHoverText} no-underline transition-colors`}
                >
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
