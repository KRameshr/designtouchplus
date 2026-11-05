"use client";

import { useState, useEffect } from "react";
import { Check, ShieldAlert, Sliders, CheckCircle2 } from "lucide-react";
import {
  getStoredCookieConsent,
  saveCookieConsent,
  acceptAllCookies,
  rejectOptionalCookies,
  subscribeToCookieConsent,
} from "@/lib/cookieConsent";

export default function CookiePreferencesPanel() {
  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [savedTimestamp, setSavedTimestamp] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Load stored preferences on mount and subscribe to updates
  useEffect(() => {
    const consent = getStoredCookieConsent();
    setAnalytics(consent.analytics);
    setFunctional(consent.functional);
    setSavedTimestamp(consent.timestamp);
    setIsConfigured(consent.isConfigured);

    const unsubscribe = subscribeToCookieConsent((updated) => {
      setAnalytics(updated.analytics);
      setFunctional(updated.functional);
      setSavedTimestamp(updated.timestamp);
      setIsConfigured(updated.isConfigured);
    });

    return unsubscribe;
  }, []);

  const triggerFeedback = (message) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, 3500);
  };

  const handleSave = () => {
    const updated = saveCookieConsent({ analytics, functional });
    setSavedTimestamp(updated.timestamp);
    setIsConfigured(true);
    triggerFeedback("Your cookie preferences have been saved.");
  };

  const handleAcceptAll = () => {
    const updated = acceptAllCookies();
    setAnalytics(true);
    setFunctional(true);
    setSavedTimestamp(updated.timestamp);
    setIsConfigured(true);
    triggerFeedback("All optional cookies accepted.");
  };

  const handleRejectOptional = () => {
    const updated = rejectOptionalCookies();
    setAnalytics(false);
    setFunctional(false);
    setSavedTimestamp(updated.timestamp);
    setIsConfigured(true);
    triggerFeedback("Optional cookies rejected. Only essential cookies remain active.");
  };

  return (
    <div
      id="cookie-settings-panel"
      className="border border-white/10 bg-[#111111] rounded-none p-6 sm:p-8 my-8 shadow-xl relative"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-red mb-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Cookie Preference Center</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white m-0">
            Manage Your Consent Preferences
          </h2>
        </div>

        {/* Status indicator */}
        <div className="text-right shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-mono border ${
              isConfigured
                ? "bg-brand-green/10 border-brand-green/30 text-brand-green"
                : "bg-amber-400/10 border-amber-400/30 text-amber-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 ${
                isConfigured ? "bg-brand-green" : "bg-amber-400"
              }`}
            ></span>
            {isConfigured ? "Custom Consent Saved" : "Default (Strict Privacy)"}
          </span>
          {savedTimestamp && (
            <p className="text-[10px] text-neutral-500 font-mono mt-1">
              Recorded: {new Date(savedTimestamp).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <p className="text-neutral-400 text-xs sm:text-sm mt-4 mb-6 leading-relaxed font-sans">
        You can customize which optional cookies and browser storage items you permit DesignTouch+ to use.
        Under the Digital Personal Data Protection Act, 2023 (India) and international privacy laws, non-essential
        cookies are inactive by default until you grant affirmative consent.
      </p>

      {/* Cookie categories list */}
      <div className="space-y-4">
        {/* 1. Essential */}
        <div className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.08] rounded-none flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-white font-sans m-0">
                1. Strictly Essential Cookies &amp; Storage
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-none uppercase">
                Required
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
              Strictly necessary for core website security, contact form anti-forgery tokens, DDoS mitigation, and remembering your privacy choices. These cannot be switched off without impairing site operations.
            </p>
          </div>
          <span className="text-xs font-mono text-brand-green uppercase tracking-wider shrink-0 font-bold self-start sm:self-center">
            Always Active
          </span>
        </div>

        {/* 2. Analytics */}
        <div className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.08] rounded-none flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-white font-sans m-0">
                2. Analytics &amp; Performance Metrics
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-800 text-neutral-400 border border-white/10 rounded-none uppercase">
                Optional
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
              Collects anonymous, aggregated usage statistics (such as page visit counts, load durations, and error logs) to help us measure and improve website performance. No personally identifiable tracking profiles are created.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <span
              className={`text-[11px] font-mono font-bold tracking-wider uppercase select-none ${
                analytics ? "text-brand-green" : "text-neutral-500"
              }`}
            >
              {analytics ? "ON" : "OFF"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={analytics}
              aria-label="Toggle Analytics and Performance cookies"
              onClick={() => setAnalytics(!analytics)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setAnalytics(!analytics);
                }
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-red ${
                analytics
                  ? "bg-brand-red border-brand-red"
                  : "bg-neutral-800 border-white/20"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-none bg-white shadow-sm transition-transform duration-150 mt-[3px] ${
                  analytics ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3. Functional */}
        <div className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.08] rounded-none flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-white font-sans m-0">
                3. Functional &amp; Experience Preferences
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-800 text-neutral-400 border border-white/10 rounded-none uppercase">
                Optional
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
              Enables enhanced interactivity and personalized display settings, such as remembering your volume or playback state on showreel video players and saving layout preferences.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <span
              className={`text-[11px] font-mono font-bold tracking-wider uppercase select-none ${
                functional ? "text-brand-green" : "text-neutral-500"
              }`}
            >
              {functional ? "ON" : "OFF"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={functional}
              aria-label="Toggle Functional and Experience cookies"
              onClick={() => setFunctional(!functional)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFunctional(!functional);
                }
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-red ${
                functional
                  ? "bg-brand-red border-brand-red"
                  : "bg-neutral-800 border-white/20"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-none bg-white shadow-sm transition-transform duration-150 mt-[3px] ${
                  functional ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 4. Advertising */}
        <div className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.08] rounded-none flex flex-col sm:flex-row sm:items-start justify-between gap-4 opacity-75">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-white font-sans m-0">
                4. Advertising &amp; Marketing Trackers
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-800 text-neutral-400 border border-white/10 rounded-none uppercase">
                Not Used
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans">
              Third-party advertising trackers, cross-site profiling pixels (such as Meta Pixel or TikTok tracking), and commercial retargeting cookies are <strong>not loaded</strong> on DesignTouch+.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider shrink-0 font-bold self-start sm:self-center">
            Inactive
          </span>
        </div>
      </div>

      {/* Success feedback toast */}
      {showFeedback && (
        <div className="mt-5 p-3.5 bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-none text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Button Controls */}
      <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-end gap-3 font-sans">
        <button
          type="button"
          onClick={handleRejectOptional}
          className="text-xs sm:text-sm text-neutral-300 hover:text-white px-4 py-2.5 rounded-none border border-white/15 bg-transparent hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          Reject Optional
        </button>
        <button
          type="button"
          onClick={handleAcceptAll}
          className="text-xs sm:text-sm text-white px-4 py-2.5 rounded-none border border-white/20 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          Accept All
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="text-xs sm:text-sm bg-[#F04444] hover:bg-[#F04444]/90 text-white font-medium px-5 py-2.5 rounded-none transition-colors cursor-pointer border-0 shadow-md"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}

