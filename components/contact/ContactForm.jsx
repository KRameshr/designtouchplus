"use client";

import { useState, useEffect } from "react";
import { Send, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitContactMessage } from "@/lib/api";

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", company: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const serviceParam = params.get("service");
        const projectParam = params.get("project");
        if (serviceParam || projectParam) {
          setForm((prev) => ({
            ...prev,
            subject: prev.subject || (serviceParam ? `${serviceParam} Project Inquiry` : "Project Inquiry"),
            message:
              prev.message ||
              (projectParam
                ? `Hello DesignTouch+,\n\nI am interested in ${serviceParam || "content creation services"} inspired by your work on "${projectParam}". Let's discuss requirements and timelines.`
                : ""),
          }));
        }
      } catch (_) {}
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitContactMessage(form);
      setStatus("success");
      setForm({ name: "", email: "", company: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors w-full";

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
          Send Us a Message
        </span>
      </div>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center py-14"
          >
            <div className="w-14 h-14 rounded-full bg-brand-green/10 flex items-center justify-center mb-4">
              <Send className="w-6 h-6 text-brand-green" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Message Sent!</h3>
            <p className="text-gray-400 text-sm mb-6">
              Thanks for reaching out — we&apos;ll get back to you within 24 hours.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="text-xs font-bold uppercase tracking-widest text-brand-red cursor-pointer bg-transparent border-none"
            >
              Send Another Message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your Name"
                className={inputClasses}
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Your Email"
                className={inputClasses}
              />
            </div>

            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Your Company (Optional)"
              className={inputClasses}
            />

            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Subject"
              className={inputClasses}
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Tell us about your project..."
              className={`${inputClasses} resize-none`}
            />

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-green hover:opacity-90 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest py-4 rounded-lg transition-opacity cursor-pointer border-none"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
              <Send className="w-3.5 h-3.5" />
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-600">
              <Lock className="w-3 h-3" /> We respect your privacy. Your information is safe with us.
            </p>

            {status === "error" && (
              <p className="text-xs text-red-400 text-center">
                Something went wrong — please try again.
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactForm;
