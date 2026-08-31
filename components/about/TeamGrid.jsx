"use client";

import { Linkedin, Instagram } from "lucide-react";
import { motion } from "framer-motion";

const TeamGrid = ({ team = [] }) => {
  if (team.length === 0) return null;

  return (
    <section className="bg-[#0a0a0a] text-white px-6 py-16 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Meet The Team
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase mb-10">
          The Creative Minds Behind{" "}
          <span className="text-brand-red">Design</span>
          <span className="text-brand-green">Touch+</span>
        </h2>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5"
        >
          {team.map((member) => (
            <motion.div
              key={member.id}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4 }}
              className="group"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/[0.04] border border-white/10 mb-3">
                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/10">
                    {member.name?.charAt(0)}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-2">
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-black"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.instagramUrl && (
                      <a
                        href={member.instagramUrl}
                        className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-black"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white">{member.name}</h3>
              <p className="text-gray-500 text-xs">{member.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TeamGrid;
