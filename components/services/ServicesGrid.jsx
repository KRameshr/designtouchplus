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
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

const ICON_MAP = {
  video: Film,
  motion: Sparkles,
  social: Smartphone,
  youtube: Youtube,
  graphic: PenTool,
  branding: Rocket,
};

const COLOR_MAP = {
  red: { icon: "text-brand-red", bg: "bg-brand-red/10", border: "hover:border-brand-red/40", check: "text-brand-red" },
  green: { icon: "text-brand-green", bg: "bg-brand-green/10", border: "hover:border-brand-green/40", check: "text-brand-green" },
  orange: { icon: "text-orange-400", bg: "bg-orange-400/10", border: "hover:border-orange-400/40", check: "text-orange-400" },
  purple: { icon: "text-purple-400", bg: "bg-purple-400/10", border: "hover:border-purple-400/40", check: "text-purple-400" },
  blue: { icon: "text-blue-400", bg: "bg-blue-400/10", border: "hover:border-blue-400/40", check: "text-blue-400" },
  yellow: { icon: "text-yellow-400", bg: "bg-yellow-400/10", border: "hover:border-yellow-400/40", check: "text-yellow-400" },
};

const ServicesGrid = ({ services = [] }) => {
  if (services.length === 0) return null;

  return (
    <section className="bg-[#0a0a0a] text-white px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {services.map((service) => {
            const Icon = ICON_MAP[service.icon] || Sparkles;
            const colors = COLOR_MAP[service.colorTheme] || COLOR_MAP.red;

            return (
              <motion.div
                key={service.id}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4 }}
                className={`relative bg-white/[0.03] border border-white/10 ${colors.border} rounded-xl p-6 transition-colors duration-300`}
              >
                <span className="absolute top-5 right-5 text-xs font-black text-white/10">
                  {service.orderNumber}
                </span>

                <div className={`w-11 h-11 rounded-lg ${colors.bg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>

                <h3 className="text-base font-bold text-white mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {service.description}
                </p>

                {service.features?.length > 0 && (
                  <ul className="flex flex-col gap-1.5 mb-5 list-none p-0 m-0">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs text-gray-500">
                        <Check className={`w-3 h-3 shrink-0 ${colors.check}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href={`/services/${service.slug}`}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${colors.icon} no-underline`}
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

export default ServicesGrid;
