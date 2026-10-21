"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { name: "Home", path: "/", index: "01" },
  { name: "About", path: "/about", index: "02" },
  { name: "Services", path: "/services", index: "03" },
  { name: "Portfolio", path: "/portfolio", index: "04" },
  { name: "Pricing", path: "/pricing", index: "05" },
  { name: "Blog", path: "/blog", index: "06" },
  { name: "Contact", path: "/contact", index: "07" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Active route matching
  const isActive = (path) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#080808] border-b border-white/[0.08]">
        <nav
          className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"
          aria-label="Main Navigation"
        >
          {/* Brand Logo Asset — Stacked mark matching Figma specification */}
          <Link
            href="/"
            className="no-underline flex flex-col leading-none group select-none font-display py-1"
            aria-label="DesignTouch+ Home"
          >
            <span className="text-xl font-extrabold tracking-[-0.04em] uppercase text-white">
              DE<span className="text-brand-red">S</span>IGN
            </span>
            <span className="text-xl font-extrabold tracking-[-0.04em] uppercase text-white -mt-1">
              T<span className="text-brand-green">O</span>UCH
              <span className="text-brand-red ml-[1px]">+</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 xl:gap-8 h-full">
            {NAV_LINKS.map(({ name, path }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  href={path}
                  className={`relative h-full flex items-center text-xs font-bold uppercase tracking-[0.16em] no-underline font-display transition-colors duration-150 ${
                    active
                      ? "text-white"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>{name}</span>
                  {active && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-red"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-brand-red text-white text-xs font-bold uppercase tracking-[0.14em] font-display rounded-none border border-brand-red hover:bg-transparent hover:text-white transition-colors duration-150 no-underline"
            >
              <span>Let&apos;s Talk</span>
              <svg
                width="11"
                height="11"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="translate-y-[-0.5px]"
                aria-hidden="true"
              >
                <path
                  d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </svg>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button (No Lucide, Pure Geometric) */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            className="lg:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5 border border-white/10 bg-[#0d0d0d] text-white rounded-none hover:border-white/30 transition-colors"
          >
            <span
              className={`w-5 h-[1.5px] bg-white transition-transform duration-200 origin-center ${
                isOpen ? "rotate-45 translate-y-[3.5px]" : ""
              }`}
            />
            <span
              className={`w-5 h-[1.5px] bg-white transition-transform duration-200 origin-center ${
                isOpen ? "-rotate-45 -translate-y-[4px]" : ""
              }`}
            />
          </button>
        </nav>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="fixed inset-0 z-[70] lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80"
              aria-hidden="true"
            />

            {/* Menu Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 right-0 bottom-0 w-full sm:w-[380px] bg-[#080808] border-l border-white/10 flex flex-col justify-between p-6 sm:p-8"
            >
              {/* Header inside mobile drawer */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="no-underline flex flex-col leading-none font-display"
                    aria-label="DesignTouch+ Home"
                  >
                    <span className="text-lg font-extrabold tracking-[-0.04em] uppercase text-white">
                      DE<span className="text-brand-red">S</span>IGN
                    </span>
                    <span className="text-lg font-extrabold tracking-[-0.04em] uppercase text-white -mt-1">
                      T<span className="text-brand-green">O</span>UCH
                      <span className="text-brand-red ml-[1px]">+</span>
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close navigation menu"
                    className="w-10 h-10 flex items-center justify-center border border-white/10 bg-[#0d0d0d] text-white rounded-none hover:border-white/30 transition-colors"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 1L11 11M1 11L11 1"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="square"
                      />
                    </svg>
                  </button>
                </div>

                {/* Navigation Links List */}
                <div className="flex flex-col divide-y divide-white/[0.06] mt-4">
                  {NAV_LINKS.map(({ name, path, index }) => {
                    const active = isActive(path);
                    return (
                      <Link
                        key={path}
                        href={path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between py-3.5 no-underline font-display transition-colors duration-150 ${
                          active
                            ? "text-white"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-baseline gap-3.5">
                          <span className="text-[10px] font-mono tracking-wider text-neutral-500">
                            {index}
                          </span>
                          <span className="text-lg font-bold uppercase tracking-wide">
                            {name}
                          </span>
                        </div>
                        {active && (
                          <span
                            className="w-2 h-2 bg-brand-red rounded-none"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Drawer Bottom Section */}
              <div className="pt-6 border-t border-white/[0.08] space-y-5">
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-brand-red text-white text-xs font-bold uppercase tracking-[0.16em] font-display rounded-none border border-brand-red hover:bg-transparent hover:text-white transition-colors duration-150 no-underline"
                >
                  <span>Let&apos;s Talk</span>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="translate-y-[-0.5px]"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    />
                  </svg>
                </Link>

                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-neutral-500 pt-1">
                  <span>Creative Production</span>
                  <span className="flex items-center gap-2 text-neutral-300">
                    <span
                      className="w-1.5 h-1.5 bg-brand-green rounded-none inline-block"
                      aria-hidden="true"
                    />
                    Available
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
