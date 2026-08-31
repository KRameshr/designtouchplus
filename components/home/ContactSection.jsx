"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send, Instagram, Youtube, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { submitContactMessage } from "@/lib/api";

const ContactSection = ({ companyInfo }) => {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      // Backend ContactMessage only has name/email/company/subject/message —
      // phone isn't a stored field, so fold it into the message body.
      await submitContactMessage({
        name: form.name,
        email: form.email,
        company: form.company,
        subject: "New inquiry from homepage",
        message: form.phone ? `${form.message}\n\nPhone: ${form.phone}` : form.message,
      });
      setStatus("success");
      setForm({ name: "", email: "", company: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="bg-[#0a0a0a] text-white px-6 py-20 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left — heading + contact info */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl sm:text-3xl font-black uppercase leading-tight mb-4">
            Let&apos;s Create Something{" "}
            <span className="bg-gradient-to-r from-brand-red to-brand-green bg-clip-text text-transparent">
              Amazing
            </span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Have a project in mind? Let&apos;s talk and bring your ideas to life.
          </p>

          <div className="flex flex-col gap-4 mb-8">
            {companyInfo?.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-brand-red shrink-0" />
                {companyInfo.phone}
              </div>
            )}
            {companyInfo?.email && (
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-brand-red shrink-0" />
                {companyInfo.email}
              </div>
            )}
            {companyInfo?.address && (
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-brand-red shrink-0" />
                {companyInfo.address}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {[Instagram, Youtube, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8">
          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-12"
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your Name"
                  className="bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Your Email"
                  className="bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                />
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company / Brand"
                  className="bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Your Phone"
                  className="bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                />
              </div>

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Tell us about your project..."
                className="bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors resize-none"
              />

              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-red-600 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest py-4 rounded-lg transition-colors cursor-pointer border-none"
              >
                {status === "loading" ? "Sending..." : "Send Message"}
                <Send className="w-3.5 h-3.5" />
              </button>

              {status === "error" && (
                <p className="text-xs text-red-400 text-center">
                  Something went wrong — please try again.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
