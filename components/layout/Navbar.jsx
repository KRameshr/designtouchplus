"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Pricing", path: "/pricing" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/[0.06]"
      >
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo — "DESIGN" / "TOUCH+" stacked, matches the Figma mark */}
          <Link href="/" className="no-underline flex flex-col leading-none group">
            <span className="text-lg font-black tracking-tight text-white">
              DE<span className="text-brand-red">S</span>IGN
            </span>
            <span className="text-lg font-black tracking-tight text-white -mt-1">
              T<span className="text-brand-green">O</span>UCH
              <span className="text-brand-red">+</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(({ name, path }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  href={path}
                  className={`text-xs font-bold uppercase tracking-widest no-underline pb-1 border-b-2 transition-colors duration-200 ${
                    active
                      ? "text-white border-brand-red"
                      : "text-gray-400 border-transparent hover:text-white"
                  }`}
                >
                  {name}
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <Link
            href="/contact"
            className="hidden lg:inline-flex items-center gap-2 border border-brand-red text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full no-underline hover:bg-brand-red transition-colors duration-300"
          >
            Let&apos;s Talk <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[80vw] max-w-[320px] bg-[#0a0a0a] border-l border-white/10 flex flex-col lg:hidden"
            >
              <div className="flex justify-end p-5">
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="w-9 h-9 flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-1 px-5">
                {NAV_LINKS.map(({ name, path }, i) => {
                  const active = isActive(path);
                  return (
                    <motion.div
                      key={path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={path}
                        onClick={() => setIsOpen(false)}
                        className={`block py-3.5 text-sm font-bold uppercase tracking-widest no-underline border-b border-white/[0.06] ${
                          active ? "text-brand-red" : "text-gray-300"
                        }`}
                      >
                        {name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="px-5 pt-6 mt-auto mb-8">
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 bg-brand-red text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-full no-underline"
                >
                  Let&apos;s Talk <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
