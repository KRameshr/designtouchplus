"use client";

import { useState, useEffect } from "react";
import { Send, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitContactMessage } from "@/lib/api";

const ContactForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const serviceParam = params.get("service");
        const projectParam = params.get("project");
        const planParam = params.get("plan");

        if (serviceParam || projectParam || planParam) {
          const serviceLabel = serviceParam
            ? serviceParam === "VIDEO_EDITING"
              ? "Video Editing"
              : serviceParam === "THUMBNAIL_DESIGN"
              ? "Thumbnail Design"
              : serviceParam === "CONTENT_CREATOR"
              ? "Content Creator Packages"
              : serviceParam
            : null;

          const subjectLine =
            serviceLabel && planParam
              ? `${serviceLabel} — ${planParam} Inquiry`
              : planParam
              ? `${planParam} Inquiry`
              : serviceLabel
              ? `${serviceLabel} Project Inquiry`
              : "Project Inquiry";

          const messageText = planParam
            ? `Hello DesignTouch+,\n\nI am interested in getting started with the ${planParam}${
                serviceLabel ? ` under ${serviceLabel}` : ""
              }. Please share onboarding details, requirements, and next steps.`
            : projectParam
            ? `Hello DesignTouch+,\n\nI am interested in ${
                serviceLabel || "creative content services"
              } inspired by your work on "${projectParam}". Let's discuss requirements and timelines.`
            : "";

          setForm((prev) => ({
            ...prev,
            subject: prev.subject || subjectLine,
            message: prev.message || messageText,
          }));
        }
      } catch (_) {}
    }
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      await submitContactMessage(form);
      setStatus("success");
      setForm({ name: "", email: "", company: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err?.message ||
          "Something went wrong while sending your message. Please try again or reach out to us directly."
      );
    }
  };

  const inputClasses =
    "w-full bg-[#141414] hover:bg-[#171717] focus:bg-[#161616] border border-white/10 focus:border-brand-red focus:ring-1 focus:ring-brand-red/30 rounded-[3px] px-4 py-3.5 text-sm text-white placeholder-neutral-500 outline-none transition-all duration-150 font-sans";

  return (
    <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-[6px] p-6 sm:p-8 lg:p-10 h-full flex flex-col justify-between">
      <div>
        {/* Form Section Header (Inspired by reference layout) */}
        <div className="mb-7 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2 h-2 rounded-full bg-brand-red shrink-0"
              aria-hidden="true"
            />
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-neutral-400">
              Send Us a Message
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-[32px] font-extrabold uppercase leading-tight tracking-tight text-white mb-2.5">
            Let&apos;s Create Something{" "}
            <span className="text-brand-red">
              Amazing.
            </span>
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-xl">
            Tell us more about yourself and what you have in mind. We review every project inquiry and reply within 24 hours.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col items-center justify-center text-center py-14 px-4"
            >
              <div className="w-14 h-14 rounded-[6px] border border-brand-green/40 bg-brand-green/[0.08] flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-brand-green" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold uppercase text-white mb-2">
                Message Sent Successfully!
              </h3>
              <p className="text-neutral-400 text-sm max-w-md mb-6 leading-relaxed">
                Thanks for reaching out to DesignTouch+. We&apos;ve received your message and will review it and get back to you within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-brand-red hover:text-white transition-colors cursor-pointer bg-transparent border-none"
              >
                Send Another Message &rarr;
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 sm:gap-6"
            >
              {/* Row 1: Name and Email side by side on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-2"
                  >
                    Your Name <span className="text-brand-red">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    placeholder="e.g. Alex Morgan"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-2"
                  >
                    Your Email <span className="text-brand-red">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    placeholder="alex@company.com"
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Row 2: Company (Optional) and Subject side by side on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label
                    htmlFor="contact-company"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-2"
                  >
                    Your Company{" "}
                    <span className="text-neutral-500 font-normal lowercase">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="contact-company"
                    name="company"
                    type="text"
                    value={form.company}
                    onChange={handleChange}
                    maxLength={150}
                    placeholder="e.g. Acme Studio"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-2"
                  >
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={handleChange}
                    maxLength={250}
                    placeholder="e.g. Video Editing & Motion Graphics"
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Row 3: Project description textarea */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-2"
                >
                  Tell us about your project{" "}
                  <span className="text-brand-red">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell us about your project, timeline, deliverables, or goals..."
                  className={`${inputClasses} resize-y min-h-[130px] sm:min-h-[145px] leading-relaxed`}
                />
              </div>

              {/* Submit Button & Privacy Reassurance */}
              <div className="pt-1 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-[#dc2626] active:bg-[#b91c1c] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-mono font-bold uppercase tracking-[0.14em] py-3.5 sm:py-4 px-6 rounded-[3px] border border-brand-red shadow-[0_2px_12px_rgba(239,68,68,0.2)] transition-colors duration-150 cursor-pointer"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SENDING...</span>
                    </>
                  ) : (
                    <>
                      <span>SEND MESSAGE</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <p className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-sans">
                  <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
                  We respect your privacy. Your information is safe with us.
                </p>

                {status === "error" && (
                  <div className="mt-1 p-3 bg-red-950/40 border border-brand-red/30 rounded-[3px] text-xs text-red-200 text-center leading-relaxed">
                    {errorMessage || "Something went wrong while sending your message. Please try again or reach out to us directly."}
                  </div>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContactForm;
