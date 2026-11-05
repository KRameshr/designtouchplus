"use client";

import { Gem, Rocket, Clock, Users, Shield, Target, Zap, Award, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const VALUE_ICON_MAP = {
  gem: Gem,
  diamond: Gem,
  rocket: Rocket,
  clock: Clock,
  users: Users,
  shield: Shield,
  target: Target,
  zap: Zap,
  award: Award,
  heart: Heart,
  sparkles: Sparkles,
};

// Default canonical values matching client reference specification
export const DEFAULT_VALUES = [
  {
    id: "val-quality",
    icon: "gem",
    title: "Quality First",
    description: "We never compromise on quality. Every frame we deliver is crafted with perfection.",
  },
  {
    id: "val-creativity",
    icon: "rocket",
    title: "Creativity",
    description: "Creativity is at the heart of everything we do. We love to explore, innovate and create.",
  },
  {
    id: "val-ontime",
    icon: "clock",
    title: "On-Time Delivery",
    description: "Time is valuable. We respect deadlines and always deliver on time, every time.",
  },
  {
    id: "val-client",
    icon: "users",
    title: "Client First",
    description: "Our clients' success is our success. We listen, understand and deliver beyond expectations.",
  },
];

const CANONICAL_MAP = {
  "quality first": {
    icon: Gem,
    color: "text-brand-red",
    containerBg: "bg-brand-red/5",
    containerBorder: "border-brand-red/15 group-hover:border-brand-red/30",
    description: "We never compromise on quality. Every frame we deliver is crafted with perfection.",
  },
  "creativity": {
    icon: Rocket,
    color: "text-brand-green",
    containerBg: "bg-brand-green/5",
    containerBorder: "border-brand-green/15 group-hover:border-brand-green/30",
    description: "Creativity is at the heart of everything we do. We love to explore, innovate and create.",
  },
  "on-time delivery": {
    icon: Clock,
    color: "text-brand-red",
    containerBg: "bg-brand-red/5",
    containerBorder: "border-brand-red/15 group-hover:border-brand-red/30",
    description: "Time is valuable. We respect deadlines and always deliver on time, every time.",
  },
  "client first": {
    icon: Users,
    color: "text-brand-green",
    containerBg: "bg-brand-green/5",
    containerBorder: "border-brand-green/15 group-hover:border-brand-green/30",
    description: "Our clients' success is our success. We listen, understand and deliver beyond expectations.",
  },
};

export const getIcon = (icon = "", title = "") => {
  const k = (icon || "").toLowerCase().trim();
  if (VALUE_ICON_MAP[k]) return VALUE_ICON_MAP[k];

  const t = (title || "").toLowerCase().trim();
  if (CANONICAL_MAP[t]) return CANONICAL_MAP[t].icon;

  if (t.includes("quality") || t.includes("gem") || t.includes("diamond")) return Gem;
  if (t.includes("creativ") || t.includes("rocket")) return Rocket;
  if (t.includes("time") || t.includes("delivery") || t.includes("clock")) return Clock;
  if (t.includes("client") || t.includes("user") || t.includes("people")) return Users;
  return Gem;
};

export const getIconColor = (title = "", index = 0) => {
  const t = (title || "").toLowerCase().trim();
  if (CANONICAL_MAP[t]) return CANONICAL_MAP[t].color;

  if (t.includes("creativ") || t.includes("client")) return "text-brand-green";
  if (t.includes("quality") || t.includes("time") || t.includes("delivery")) return "text-brand-red";

  // Alternating red/green matching client design
  return index % 2 === 0 ? "text-brand-red" : "text-brand-green";
};

export const getIconContainerStyle = (title = "", index = 0) => {
  const t = (title || "").toLowerCase().trim();
  if (CANONICAL_MAP[t]) {
    return `${CANONICAL_MAP[t].containerBg} ${CANONICAL_MAP[t].containerBorder}`;
  }
  return index % 2 === 0
    ? "bg-brand-red/5 border-brand-red/15 group-hover:border-brand-red/30"
    : "bg-brand-green/5 border-brand-green/15 group-hover:border-brand-green/30";
};

export const getCanonicalDescription = (title = "", rawDescription = "") => {
  const t = (title || "").toLowerCase().trim();
  if (CANONICAL_MAP[t]) return CANONICAL_MAP[t].description;
  return rawDescription;
};

const ValuesGrid = ({ values = [] }) => {
  const items = Array.isArray(values) && values.length > 0 ? values : DEFAULT_VALUES;

  return (
    <section
      aria-label="Our Values"
      className="bg-[#080808] text-white py-14 sm:py-16 lg:py-20 border-b border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Label: Red Square Accent + OUR VALUES */}
        <div className="flex items-center gap-2.5 mb-6 sm:mb-8">
          <span
            className="w-2.5 h-2.5 bg-brand-red rounded-none shrink-0 inline-block"
            aria-hidden="true"
          />
          <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.24em] text-neutral-300">
            OUR VALUES
          </span>
        </div>

        {/* Four Compact Horizontal Cards (One Row on Desktop, 2-Col on Tablet, Vertical on Mobile) */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-3.5 xl:gap-4"
        >
          {items.map((value, idx) => {
            const Icon = getIcon(value.icon, value.title);
            const colorClass = getIconColor(value.title, idx);
            const containerStyle = getIconContainerStyle(value.title, idx);
            const description = getCanonicalDescription(value.title, value.description);

            return (
              <motion.div
                key={value.id || `value-${idx}`}
                variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex items-center gap-3.5 sm:gap-4 p-4 sm:p-4.5 bg-[#0c0c0c] border border-white/[0.08] hover:border-white/20 rounded-[2px] transition-all duration-200 hover:-translate-y-0.5 group select-none"
              >
                {/* Icon on Left: Subtle dark container with restrained red or green accent */}
                <div
                  className={`w-11 h-11 sm:w-11 sm:h-11 rounded-[2px] border flex items-center justify-center shrink-0 transition-colors ${containerStyle}`}
                  aria-hidden="true"
                >
                  <Icon className={`w-5 h-5 sm:w-5 sm:h-5 ${colorClass} transition-transform duration-200 group-hover:scale-105`} />
                </div>

                {/* Content on Right: Title on Top, Description Below, Vertically Centered */}
                <div className="flex flex-col text-left min-w-0 flex-1">
                  <h3 className="text-sm font-display font-bold text-white tracking-tight leading-tight mb-1">
                    {value.title}
                  </h3>
                  <p className="text-neutral-400 text-xs sm:text-[11px] lg:text-[11.5px] xl:text-xs leading-[1.45] font-sans font-normal">
                    {description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ValuesGrid;
