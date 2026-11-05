"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  X,
  Minus,
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  createChatLead,
  createChatConversation,
  sendChatMessage,
  sendChatMessageStream,
} from "@/lib/api";
import {
  getStoredCookieConsent,
  isPopupDismissedInSession,
  subscribeToCookieConsent,
  COOKIE_MODAL_STATE_EVENT,
} from "@/lib/cookieConsent";
import {
  getRememberedVisitor,
  saveRememberedVisitor,
} from "@/lib/visitorIdentity";
import ChatMessageMarkdown from "./ChatMessageMarkdown";

export const LAUNCHER_CONFIG = {
  APPEAR_DELAY_MS: 10_000,      // 10s wait after cookie consent or load
  ATTENTION_DELAY_MS: 12_000,   // 12s wait after initial appearance
  ATTENTION_DURATION_MS: 1_200, // 1.2s attention pulse duration
  SESSION_KEY: "designtouch_chat_launcher_animated",
};

const QUICK_SUGGESTIONS = [
  "What video editing services do you offer?",
  "How do YouTube thumbnails work?",
  "Can you help with motion graphics?",
  "Tell me about YouTube channel management",
  "How do I get a custom quote?",
];

export default function ChatbotWidget() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Lead & session state
  const [session, setSession] = useState(null);
  const [leadForm, setLeadForm] = useState({ name: "", email: "" });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState("");

  // Conversation state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [isAiConfigured, setIsAiConfigured] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Launcher state machine: "HIDDEN" (State 0) | "APPEARING" (State 1) | "ATTENTION" (State 2) | "RESTING" (State 3)
  const [launcherState, setLauncherState] = useState("HIDDEN");
  const appearTimerRef = useRef(null);
  const attentionTimerRef = useRef(null);
  const attentionEndTimerRef = useRef(null);
  const sequenceStartedRef = useRef(false);

  const clearAllLauncherTimers = () => {
    if (appearTimerRef.current) clearTimeout(appearTimerRef.current);
    if (attentionTimerRef.current) clearTimeout(attentionTimerRef.current);
    if (attentionEndTimerRef.current) clearTimeout(attentionEndTimerRef.current);
  };

  const markSessionAnimated = () => {
    try {
      window.sessionStorage.setItem(LAUNCHER_CONFIG.SESSION_KEY, "true");
    } catch {}
  };

  const startAppearanceSequence = (delay = LAUNCHER_CONFIG.APPEAR_DELAY_MS) => {
    if (sequenceStartedRef.current) return;
    sequenceStartedRef.current = true;
    clearAllLauncherTimers();

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    appearTimerRef.current = setTimeout(() => {
      if (prefersReducedMotion) {
        setLauncherState("RESTING");
        markSessionAnimated();
        return;
      }

      // State 1: Initial Appearance (smooth fade and upward slide)
      setLauncherState("APPEARING");

      setTimeout(() => {
        setLauncherState("RESTING");
      }, 300);

      // State 2: Attention animation after configured delay (10-15s)
      attentionTimerRef.current = setTimeout(() => {
        setLauncherState("ATTENTION");

        // State 3: Final resting state after attention pulse (1.2s)
        attentionEndTimerRef.current = setTimeout(() => {
          setLauncherState("RESTING");
          markSessionAnimated();
        }, LAUNCHER_CONFIG.ATTENTION_DURATION_MS);
      }, LAUNCHER_CONFIG.ATTENTION_DELAY_MS);
    }, delay);
  };

  // Timed Animation Sequence Lifecycle (triggered relative to cookie consent interaction)
  useEffect(() => {
    if (isAdmin || typeof window === "undefined") return;

    let hasAnimatedInSession = false;
    try {
      hasAnimatedInSession =
        window.sessionStorage.getItem(LAUNCHER_CONFIG.SESSION_KEY) === "true";
    } catch {}

    if (hasAnimatedInSession) {
      setLauncherState("RESTING");
      return;
    }

    const consent = getStoredCookieConsent();
    const isDismissed = isPopupDismissedInSession();
    const isConsentedOrDismissed = consent.isConfigured || isDismissed;

    // If visitor already consented/dismissed earlier:
    // Run the page-load trigger with 10-second delay
    if (isConsentedOrDismissed) {
      startAppearanceSequence(LAUNCHER_CONFIG.APPEAR_DELAY_MS);
      return;
    }

    // If on an inner page where homepage scroll popup is NOT auto-rendered:
    if (pathname !== "/") {
      startAppearanceSequence(LAUNCHER_CONFIG.APPEAR_DELAY_MS);
      return;
    }

    // State 0: On homepage without consent, keep launcher hidden until cookie popup closes
    setLauncherState("HIDDEN");

    const handleModalState = (e) => {
      const isModalOpen = Boolean(e?.detail?.isOpen);
      if (isModalOpen) {
        clearAllLauncherTimers();
        sequenceStartedRef.current = false;
        setLauncherState("HIDDEN");
      } else {
        // Modal closed (accepted, rejected, saved, or dismissed):
        // Wait 10 seconds before revealing launcher
        startAppearanceSequence(LAUNCHER_CONFIG.APPEAR_DELAY_MS);
      }
    };

    const unsubscribeConsent = subscribeToCookieConsent(() => {
      startAppearanceSequence(LAUNCHER_CONFIG.APPEAR_DELAY_MS);
    });

    window.addEventListener(COOKIE_MODAL_STATE_EVENT, handleModalState);

    return () => {
      clearAllLauncherTimers();
      window.removeEventListener(COOKIE_MODAL_STATE_EVENT, handleModalState);
      unsubscribeConsent();
    };
  }, [pathname, isAdmin]);

  // On mount: check for remembered visitor identity (valid for 24 hours).
  // Fresh chat guarantee: starts with a single initial greeting and never restores old messages.
  useEffect(() => {
    try {
      localStorage.removeItem("designtouch_chat_session");
    } catch {}

    const remembered = getRememberedVisitor();
    if (remembered?.name && remembered?.email) {
      setSession({
        leadId: remembered.leadId,
        visitorName: remembered.name,
        visitorEmail: remembered.email,
      });
      setLeadForm({
        name: remembered.name,
        email: remembered.email,
      });
      // Start with a single fresh greeting for this new visit
      setMessages([
        {
          id: "initial-greeting",
          senderType: "ASSISTANT",
          content: `Hi **${remembered.name}**! Welcome back to DesignTouch+. What can we help you create today?`,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  // Scroll to bottom on new messages (smooth when complete, instant auto while streaming)
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const isStreamingActive = messages.some((m) => m.isStreaming);
      messagesEndRef.current?.scrollIntoView({
        behavior: isStreamingActive ? "auto" : "smooth",
      });
    }
  }, [messages, sending, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && session?.leadId) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized, session]);

  if (isAdmin) {
    return null;
  }

  // Handle visitor lead form submission
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (leadSubmitting) return;

    const trimmedName = leadForm.name.trim();
    const trimmedEmail = leadForm.email.trim();

    // Validation
    if (!trimmedName) {
      setLeadError("Please provide your full name.");
      return;
    }
    if (!trimmedEmail) {
      setLeadError("Please provide your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setLeadError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    setLeadError("");
    setLeadSubmitting(true);

    try {
      // 1. Create or retrieve lead (Visitor Name & Email are stored in PostgreSQL)
      const lead = await createChatLead({
        name: trimmedName,
        email: trimmedEmail,
      });

      // 2. Remember visitor identity for 24 hours (strictly Name & Email, NO conversation messages)
      saveRememberedVisitor({
        leadId: lead.id,
        name: lead.name,
        email: lead.email,
      });

      const initialGreeting = {
        id: "initial-greeting",
        senderType: "ASSISTANT",
        content: `Hi **${lead.name}**! Welcome to DesignTouch+. What can we help you create today?`,
        createdAt: new Date().toISOString(),
      };

      // In-memory tab session only: conversation is never persisted
      const newSession = {
        leadId: lead.id,
        visitorName: lead.name,
        visitorEmail: lead.email,
      };

      setSession(newSession);
      setMessages([initialGreeting]);
      setLeadSubmitting(false);
    } catch (err) {
      setLeadError(
        err.message || "Failed to initialize chat session. Please try again."
      );
      setLeadSubmitting(false);
    }
  };

  // Handle sending a chat message (streams progressively, falls back safely to synchronous if needed)
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || sending || !session?.leadId) return;

    setInputMessage("");
    setChatError("");
    setSending(true);

    const tempUserId = `client-${Date.now()}`;
    const tempUserMsg = {
      id: tempUserId,
      senderType: "VISITOR",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    const tempAiId = `streaming-${Date.now()}`;
    let streamedContent = "";
    let receivedAnyTokens = false;

    try {
      await sendChatMessageStream(session.leadId, text, {
        onInit: (event) => {
          if (typeof event.isAiConfigured === "boolean") {
            setIsAiConfigured(event.isAiConfigured);
          }
          if (event.userMessage?.id) {
            setMessages((prev) =>
              prev.map((m) => (m.id === tempUserId ? event.userMessage : m))
            );
          }
        },
        onToken: (token) => {
          if (!receivedAnyTokens) {
            receivedAnyTokens = true;
            streamedContent = token;
            setMessages((prev) => [
              ...prev,
              {
                id: tempAiId,
                senderType: "ASSISTANT",
                content: streamedContent,
                createdAt: new Date().toISOString(),
                isStreaming: true,
              },
            ]);
          } else {
            streamedContent += token;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAiId ? { ...m, content: streamedContent } : m
              )
            );
          }
        },
        onComplete: (event) => {
          if (typeof event.isAiConfigured === "boolean") {
            setIsAiConfigured(event.isAiConfigured);
          }
          if (event.aiMessage) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAiId
                  ? { ...event.aiMessage, isStreaming: false }
                  : m
              )
            );
          }
        },
        onError: (err) => {
          if (receivedAnyTokens) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tempAiId ? { ...m, isStreaming: false } : m
              )
            );
          }
          throw err;
        },
      });
    } catch (streamErr) {
      // If streaming failed before any token arrived, transparently fall back to standard endpoint
      if (!receivedAnyTokens) {
        try {
          const response = await sendChatMessage(session.leadId, text);
          if (response?.aiMessage) {
            setMessages((prev) => [
              ...prev.filter((m) => m.id !== tempUserId && m.id !== tempAiId),
              response.userMessage || tempUserMsg,
              response.aiMessage,
            ]);
            if (typeof response.isAiConfigured === "boolean") {
              setIsAiConfigured(response.isAiConfigured);
            }
          }
        } catch (fallbackErr) {
          setChatError(
            fallbackErr.message ||
              "Message could not be sent. Please check your connection."
          );
        }
      } else {
        setChatError(
          streamErr.message ||
            "Connection was interrupted. Please retry if your question was cut short."
        );
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenChat = () => {
    clearAllLauncherTimers();
    markSessionAnimated();
    setLauncherState("RESTING");
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setLauncherState("RESTING");
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 floating-action-chatbot z-[990] select-none font-sans">
      {/* 1. Floating Launcher Button (Client Reference Design - Image 1) */}
      {!isOpen && launcherState !== "HIDDEN" && (
        <button
          type="button"
          onClick={handleOpenChat}
          className={`
            relative flex items-center gap-2.5 sm:gap-3
            px-4 sm:px-6 py-3 sm:py-3.5
            bg-brand-red hover:bg-[#dc2626] text-white
            rounded-none border border-red-500/80 hover:border-white/30
            cursor-pointer select-none font-sans
            active:scale-95 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black
            transition-all duration-300 ease-out
            ${
              launcherState === "ATTENTION"
                ? "shadow-[0_0_36px_rgba(239,68,68,0.95)] scale-[1.03] border-white/60"
                : "shadow-[0_0_24px_rgba(239,68,68,0.5)] hover:shadow-[0_0_36px_rgba(239,68,68,0.75)] scale-100"
            }
            ${
              launcherState === "APPEARING"
                ? "opacity-100 translate-y-0"
                : "opacity-100 translate-y-0"
            }
          `}
          aria-label="Open Let's Chat support window"
        >
          {/* Clean white outline chat/message bubble icon */}
          <MessageSquare
            className={`w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.2] shrink-0 fill-none transition-transform duration-300 ${
              launcherState === "ATTENTION"
                ? "-translate-y-0.5 scale-110"
                : "group-hover:scale-110"
            }`}
            aria-hidden="true"
          />

          {/* Bold white uppercase LET'S CHAT! typography */}
          <span className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-white whitespace-nowrap">
            LET&apos;S CHAT!
          </span>
        </button>
      )}

      {/* 2. Chatbot Window Panel */}
      {isOpen && (
        <div
          className={`
            w-[calc(100vw-2rem)] sm:w-[420px] max-w-[440px]
            bg-[#0a0a0a] border border-white/15 rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.9)]
            flex flex-col transition-all duration-200 ease-out overflow-hidden
            ${isMinimized ? "h-[54px]" : "h-[580px] max-h-[calc(100vh-6rem)]"}
          `}
          role="dialog"
          aria-label="DesignTouch+ Support Chat"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 bg-brand-green inline-block shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-display font-black uppercase tracking-tight text-white truncate">
                    Let&apos;s Chat!
                  </h3>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-red px-1 py-0.2 bg-brand-red/10 border border-brand-red/20 shrink-0">
                    AI
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-400 truncate">
                  We&apos;ll reply as soon as we can
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Minimize / Expand */}
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.06] rounded-none border border-transparent hover:border-white/10 transition-colors cursor-pointer"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              {/* Close */}
              <button
                type="button"
                onClick={handleCloseChat}
                className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.06] rounded-none border border-transparent hover:border-white/10 transition-colors cursor-pointer"
                aria-label="Close chat"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Body (hidden when minimized) */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#080808]">
              {/* STATE A: Visitor Information Collection Form */}
              {!session?.leadId ? (
                <div className="flex-1 p-5 sm:p-6 overflow-y-auto flex flex-col justify-center">
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-brand-red/10 border border-brand-red/20 mb-3 text-[10px] font-mono uppercase tracking-widest text-brand-red">
                      <Sparkles className="w-3 h-3" />
                      DesignTouch+ Creative AI
                    </div>
                    <h4 className="text-base sm:text-lg font-display font-black uppercase text-white tracking-tight leading-snug">
                      Hey there! Welcome to DesignTouch+.
                    </h4>
                    <p className="text-xs font-sans text-neutral-400 mt-2 leading-relaxed">
                      Please share your details so we can assist you with your project, explore video services, or answer any questions.
                    </p>
                  </div>

                  {leadError && (
                    <div className="flex items-start gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-sans rounded-none">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{leadError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLeadSubmit} noValidate className="space-y-4">
                    <div>
                      <label
                        htmlFor="chat-lead-name"
                        className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                      >
                        Full Name <span className="text-brand-red">*</span>
                      </label>
                      <input
                        id="chat-lead-name"
                        type="text"
                        value={leadForm.name}
                        onChange={(e) =>
                          setLeadForm({ ...leadForm, name: e.target.value })
                        }
                        placeholder="e.g. Alex Morgan"
                        disabled={leadSubmitting}
                        className="w-full bg-[#111] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="chat-lead-email"
                        className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                      >
                        Email Address <span className="text-brand-red">*</span>
                      </label>
                      <input
                        id="chat-lead-email"
                        type="email"
                        value={leadForm.email}
                        onChange={(e) =>
                          setLeadForm({ ...leadForm, email: e.target.value })
                        }
                        placeholder="name@example.com"
                        disabled={leadSubmitting}
                        className="w-full bg-[#111] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={leadSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-none border border-brand-red transition-colors cursor-pointer disabled:opacity-50 mt-2"
                    >
                      {leadSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <span>Start Chat</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* STATE B: Active Conversation View */
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                    {messages.map((m) => {
                      const isUser = m.senderType === "VISITOR";
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${
                            isUser ? "items-end" : "items-start"
                          }`}
                        >
                          {!isUser && (
                            <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 mb-1 pl-1">
                              DesignTouch+ AI
                            </span>
                          )}
                          <div
                            className={`
                              p-3 text-xs leading-relaxed rounded-none border
                              ${
                                isUser
                                  ? "max-w-[85%] bg-[#181818] border-white/15 text-white"
                                  : "max-w-[92%] sm:max-w-[88%] bg-[#0f0f0f] border-white/10 text-neutral-200"
                              }
                            `}
                          >
                            {isUser ? (
                              <p className="whitespace-pre-wrap break-words">
                                {m.content}
                              </p>
                            ) : (
                              <ChatMessageMarkdown
                                content={m.content}
                                isStreaming={m.isStreaming}
                              />
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-neutral-500 mt-1 px-1">
                            {new Date(m.createdAt || Date.now()).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        </div>
                      );
                    })}

                    {/* Typing Indicator */}
                    {sending && !messages.some((m) => m.isStreaming) && (
                      <div className="flex flex-col items-start">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 mb-1 pl-1">
                          DesignTouch+ AI
                        </span>
                        <div className="bg-[#0f0f0f] border border-white/10 rounded-none px-3.5 py-2.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-brand-red animate-pulse" />
                          <span className="w-1.5 h-1.5 bg-brand-red animate-pulse delay-150" />
                          <span className="w-1.5 h-1.5 bg-brand-red animate-pulse delay-300" />
                          <span className="text-[10px] font-mono text-neutral-400 ml-1.5">
                            Typing...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Chat Error Notification */}
                    {chatError && (
                      <div className="flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-sans rounded-none">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{chatError}</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Suggestion Chips (when only initial message present) */}
                  {messages.length <= 1 && (
                    <div className="px-4 py-2 border-t border-white/5 bg-[#0b0b0b] shrink-0">
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1.5">
                        Suggested questions:
                      </p>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {QUICK_SUGGESTIONS.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => handleSendMessage(q)}
                            disabled={sending}
                            className="text-[10px] font-mono text-neutral-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 px-2.5 py-1 rounded-none transition-colors text-left cursor-pointer"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Form */}
                  <div className="p-3 bg-[#0d0d0d] border-t border-white/10 shrink-0">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        disabled={sending}
                        className="flex-1 bg-[#141414] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || sending}
                        className="px-3.5 py-2.5 bg-brand-red hover:bg-[#dc2626] disabled:opacity-40 text-white rounded-none border border-brand-red transition-colors cursor-pointer shrink-0"
                        aria-label="Send message"
                      >
                        {sending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </form>
                    <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 mt-1.5 px-0.5">
                      <span>Enter to send • Shift+Enter for newline</span>
                      {!isAiConfigured && (
                        <span className="text-amber-400">Offline mode</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

