"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WHATSAPP_NAVBAR_CLICK_TO_CHAT_URL } from "@/components/ui/WhatsAppButton";
import { FOOTER_SERVICES } from "@/lib/siteNavigation";

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
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const pathname = usePathname();
  const desktopServicesRef = useRef(null);
  const desktopServicesTriggerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileCloseButtonRef = useRef(null);
  const mobileMenuTriggerRef = useRef(null);
  const wasMobileMenuOpenRef = useRef(false);

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

  // Keep keyboard users inside the mobile navigation and provide Escape dismissal.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isOpen) setIsOpen(false);
        if (isServicesOpen) {
          setIsServicesOpen(false);
          desktopServicesTriggerRef.current?.focus();
        }
        return;
      }

      if (e.key === "Tab" && isOpen && mobileMenuRef.current) {
        const focusable = mobileMenuRef.current.querySelectorAll(
          'a[href], button:not([disabled])'
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isServicesOpen]);

  useEffect(() => {
    const handleOutsidePointer = (event) => {
      if (!desktopServicesRef.current?.contains(event.target)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      wasMobileMenuOpenRef.current = true;
      mobileCloseButtonRef.current?.focus();
    } else if (wasMobileMenuOpenRef.current) {
      wasMobileMenuOpenRef.current = false;
      mobileMenuTriggerRef.current?.focus();
    }
  }, [isOpen]);

  // Close when pathname changes
  useEffect(() => {
    setIsOpen(false);
    setIsServicesOpen(false);
    setIsMobileServicesOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 border-y border-white/[0.08] bg-[#080808]">
        <nav
          className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"
          aria-label="Main Navigation"
        >
          {/* Brand Logo Asset — Official DesignTouch+ Brand Logo */}
          <Link
            href="/"
            prefetch={false}
            className="relative flex items-center select-none group py-1"
            aria-label="DesignTouch+ Home"
          >
            <Image
              src="/assets/logos/design-touch-logo.png"
              alt="DesignTouch+"
              width={1315}
              height={599}
              priority
              className="h-10 sm:h-11 w-auto object-contain transition-opacity duration-150 group-hover:opacity-90"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 xl:gap-8 h-full">
            {NAV_LINKS.map(({ name, path }) => {
              const active = isActive(path);
              if (name === "Services") {
                return (
                  <div
                    key={path}
                    ref={desktopServicesRef}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                    onFocus={() => setIsServicesOpen(true)}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) {
                        setIsServicesOpen(false);
                      }
                    }}
                  >
                    <div className="h-full flex items-center">
                      <Link
                        href={path}
                        prefetch={false}
                        className={`relative h-full flex items-center text-xs font-bold uppercase tracking-[0.16em] no-underline font-display transition-colors duration-150 ${
                          active ? "text-white" : "text-neutral-400 hover:text-white"
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
                      <button
                        ref={desktopServicesTriggerRef}
                        type="button"
                        onClick={() => setIsServicesOpen((open) => !open)}
                        aria-label="Toggle Services menu"
                        aria-expanded={isServicesOpen}
                        aria-controls="desktop-services-menu"
                        className="ml-1.5 inline-flex h-10 w-5 items-center justify-center text-neutral-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                      >
                        <svg
                          width="10"
                          height="6"
                          viewBox="0 0 10 6"
                          fill="none"
                          aria-hidden="true"
                          className={`transition-transform duration-150 ${isServicesOpen ? "rotate-180" : ""}`}
                        >
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </button>
                    </div>
                    {isServicesOpen && (
                      <div
                        id="desktop-services-menu"
                        className="absolute left-0 top-full z-50 w-64 border border-white/10 bg-[#0b0b0b] py-2"
                      >
                        {FOOTER_SERVICES.map(({ name: serviceName, path: servicePath }) => (
                          <Link
                            key={servicePath}
                            href={servicePath}
                            prefetch={false}
                            onClick={() => setIsServicesOpen(false)}
                            className={`block px-4 py-3 text-xs font-semibold tracking-wide no-underline transition-colors hover:bg-white/[0.04] hover:text-brand-red focus-visible:bg-white/[0.04] focus-visible:text-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-red ${
                              isActive(servicePath) ? "text-brand-red" : "text-neutral-300"
                            }`}
                          >
                            {serviceName}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={path}
                  href={path}
                  prefetch={false}
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

          {/* Desktop CTA — Connects to WhatsApp Business */}
          <div className="hidden lg:flex items-center border-l border-white/10 pl-4">
            <a
              href={WHATSAPP_NAVBAR_CLICK_TO_CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Let's Talk on WhatsApp"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-brand-red text-white text-xs font-bold uppercase tracking-[0.14em] font-display rounded-none border border-brand-red hover:bg-transparent hover:text-white transition-colors duration-150 no-underline cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
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
                  d="M3 9L9 3M4 3H9V8"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </svg>
            </a>
          </div>

          {/* Mobile Menu Toggle Button (No Lucide, Pure Geometric) */}
          <button
            ref={mobileMenuTriggerRef}
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            className="lg:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5 border border-white/10 bg-[#0d0d0d] text-white rounded-none hover:border-white/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
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
            ref={mobileMenuRef}
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
              className="absolute top-0 right-0 bottom-0 flex w-full flex-col border-l border-white/10 bg-[#080808] p-6 sm:w-[380px] sm:p-8"
            >
              {/* Header inside mobile drawer */}
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                  <Link
                    href="/"
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className="relative flex items-center select-none"
                    aria-label="DesignTouch+ Home"
                  >
                    <Image
                      src="/assets/logos/design-touch-logo.png"
                      alt="DesignTouch+"
                      width={1315}
                      height={599}
                      className="h-9 w-auto object-contain"
                    />
                  </Link>

                  <button
                    ref={mobileCloseButtonRef}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close navigation menu"
                    className="w-10 h-10 flex items-center justify-center border border-white/10 bg-[#0d0d0d] text-white rounded-none hover:border-white/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
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
                <div className="mt-4 min-h-0 flex-1 overflow-y-auto divide-y divide-white/[0.06]">
                  {NAV_LINKS.map(({ name, path, index }) => {
                    const active = isActive(path);
                    if (name === "Services") {
                      return (
                        <div key={path}>
                          <div className="flex items-stretch">
                            <Link
                              href={path}
                              prefetch={false}
                              onClick={() => setIsOpen(false)}
                              className={`flex min-h-12 flex-1 items-center justify-between py-3.5 pr-2 no-underline font-display transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red ${
                                active ? "text-white" : "text-neutral-400 hover:text-white"
                              }`}
                            >
                              <span className="flex items-baseline gap-3.5">
                                <span className="text-[10px] font-mono tracking-wider text-neutral-500">
                                  {index}
                                </span>
                                <span className="text-lg font-bold uppercase tracking-wide">{name}</span>
                              </span>
                              {active && (
                                <span className="mr-2 h-2 w-2 bg-brand-red" aria-hidden="true" />
                              )}
                            </Link>
                            <button
                              type="button"
                              onClick={() => setIsMobileServicesOpen((open) => !open)}
                              aria-label="Toggle Services links"
                              aria-expanded={isMobileServicesOpen}
                              aria-controls="mobile-services-menu"
                              className="flex w-12 shrink-0 items-center justify-center text-neutral-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                            >
                              <svg
                                width="12"
                                height="7"
                                viewBox="0 0 12 7"
                                fill="none"
                                aria-hidden="true"
                                className={`transition-transform duration-150 ${isMobileServicesOpen ? "rotate-180" : ""}`}
                              >
                                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                            </button>
                          </div>
                          {isMobileServicesOpen && (
                            <ul id="mobile-services-menu" className="list-none pb-2 pl-9 pr-2">
                              {FOOTER_SERVICES.map(({ name: serviceName, path: servicePath }) => (
                                <li key={servicePath}>
                                  <Link
                                    href={servicePath}
                                    prefetch={false}
                                    onClick={() => {
                                      setIsMobileServicesOpen(false);
                                      setIsOpen(false);
                                    }}
                                    className={`block py-2.5 text-sm no-underline transition-colors hover:text-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red ${
                                      isActive(servicePath) ? "text-brand-red" : "text-neutral-400"
                                    }`}
                                  >
                                    {serviceName}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={path}
                        href={path}
                        prefetch={false}
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

              {/* Mobile Drawer Bottom Section — Connects to WhatsApp Business */}
              <div className="mt-4 shrink-0 space-y-5 border-t border-white/[0.08] pt-6">
                <a
                  href={WHATSAPP_NAVBAR_CLICK_TO_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  aria-label="Let's Talk on WhatsApp"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-brand-red text-white text-xs font-bold uppercase tracking-[0.16em] font-display rounded-none border border-brand-red hover:bg-transparent hover:text-white transition-colors duration-150 no-underline cursor-pointer"
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
                      d="M3 9L9 3M4 3H9V8"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    />
                  </svg>
                </a>

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
