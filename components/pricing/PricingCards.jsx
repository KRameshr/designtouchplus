"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Send, Star, Gem, Crown } from "lucide-react";
import { motion } from "framer-motion";

const PLAN_ICONS = { BASIC: Send, STANDARD: Star, PREMIUM: Gem, ENTERPRISE: Crown };

// Receives both ONE_TIME and MONTHLY plans (fetched server-side) and toggles
// between them client-side — avoids a network round-trip on toggle click.
const PricingCards = ({ oneTimePlans = [], monthlyPlans = [] }) => {
  const [activeType, setActiveType] = useState("ONE_TIME");
  const plans = activeType === "ONE_TIME" ? oneTimePlans : monthlyPlans;

  return (
    <section className="bg-[#0a0a0a] text-white px-6 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Toggle */}
        {monthlyPlans.length > 0 && (
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white/[0.04] border border-white/10 rounded-full p-1">
              {[
                { value: "ONE_TIME", label: "One-Time Project" },
                { value: "MONTHLY", label: "Monthly Packages" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setActiveType(value)}
                  className={`text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-colors duration-300 cursor-pointer border-none ${
                    activeType === value
                      ? "bg-brand-red text-white"
                      : "bg-transparent text-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {plans.length === 0 ? (
          <p className="text-center text-gray-600 text-sm py-12">
            No {activeType === "ONE_TIME" ? "one-time" : "monthly"} plans available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan) => {
              const Icon = PLAN_ICONS[plan.planName?.toUpperCase()] || Send;
              const isPopular = plan.isMostPopular;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4 }}
                  className={`relative rounded-2xl p-6 flex flex-col ${
                    isPopular
                      ? "bg-white/[0.04] border-2 border-brand-red"
                      : "bg-white/[0.02] border border-white/10"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-red text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}

                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                    isPopular ? "bg-brand-red/20" : "bg-white/[0.06]"
                  }`}>
                    <Icon className={`w-4.5 h-4.5 ${isPopular ? "text-brand-red" : "text-gray-300"}`} />
                  </div>

                  <h3 className="text-sm font-black uppercase tracking-wide text-white mb-2">
                    {plan.planName}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-5 min-h-[32px]">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    {plan.price != null ? (
                      <p className="text-3xl font-black text-white">
                        {plan.currency}{Number(plan.price).toLocaleString("en-IN")}
                        <span className="text-sm text-gray-500 font-normal">{plan.unit}</span>
                      </p>
                    ) : (
                      <p className="text-3xl font-black text-white">Custom</p>
                    )}
                  </div>

                  {plan.features?.length > 0 && (
                    <ul className="flex flex-col gap-2.5 mb-6 flex-1 list-none p-0 m-0">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs text-gray-400">
                          <Check className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    href="/contact"
                    className={`text-center text-xs font-bold uppercase tracking-widest py-3 rounded-full no-underline transition-colors duration-300 ${
                      isPopular
                        ? "bg-brand-red hover:bg-red-600 text-white"
                        : "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10"
                    }`}
                  >
                    {plan.ctaText || "Get Started"}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingCards;
