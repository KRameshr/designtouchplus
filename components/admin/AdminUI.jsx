"use client";

import React from "react";
import { X } from "lucide-react";

/**
 * DesignTouch+ Admin Design System Components
 * Standardized across all Admin Panel routes for consistent visual hierarchy,
 * premium dark editorial aesthetic, and strict border-radius: 0 (rounded-none).
 */

export function AdminPageHeader({
  title,
  description,
  action,
  children,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 ${className}`}
    >
      <div>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-display">
          {title}
        </h1>
        {description && (
          <p className="text-neutral-400 text-xs sm:text-sm mt-1 font-sans">
            {description}
          </p>
        )}
      </div>
      {(action || children) && (
        <div className="flex items-center gap-3 shrink-0">
          {action}
          {children}
        </div>
      )}
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
  padding = "p-5",
  title,
  action,
}) {
  return (
    <div
      className={`bg-[#0d0d0d] border border-white/10 rounded-none ${padding} ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
          {title && (
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              {title}
            </h2>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function AdminButton({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  onClick,
  disabled = false,
  className = "",
  title,
  "aria-label": ariaLabel,
  ...props
}) {
  const variantClasses = {
    primary:
      "bg-brand-red text-white hover:bg-red-600 border border-brand-red",
    secondary:
      "bg-white/[0.04] text-neutral-300 hover:text-white border border-white/10 hover:bg-white/[0.08]",
    danger:
      "bg-red-500/10 text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/20",
    ghost:
      "bg-transparent text-neutral-400 hover:text-white hover:bg-white/[0.05] border border-transparent",
    outline:
      "bg-transparent text-neutral-300 hover:text-white border border-white/15 hover:border-white/30",
  }[variant] || "";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-[11px]",
    md: "px-4 py-2.5 text-xs",
    lg: "px-5 py-3 text-xs",
    icon: "w-8 h-8 p-0 flex items-center justify-center text-xs",
  }[size] || "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-2 rounded-none font-bold uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminBadge({
  children,
  variant = "neutral",
  className = "",
  onClick,
  title,
  type = "span",
}) {
  const variantClasses = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    inactive: "bg-white/[0.04] text-neutral-400 border-white/10",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    brand: "bg-brand-red/15 text-brand-red border-brand-red/30",
    featured: "bg-brand-red/15 text-brand-red border-brand-red/30",
    neutral: "bg-white/[0.04] text-neutral-400 border-white/10",
  }[variant] || "bg-white/[0.04] text-neutral-400 border-white/10";

  const Comp = onClick ? "button" : type;

  return (
    <Comp
      onClick={onClick}
      title={title}
      type={onClick ? "button" : undefined}
      className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-none border transition-colors ${
        onClick ? "cursor-pointer hover:bg-white/[0.08]" : ""
      } ${variantClasses} ${className}`}
    >
      {children}
    </Comp>
  );
}

export function AdminTabs({ tabs, activeTab, onChange, className = "" }) {
  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-px mb-6 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-none border transition-colors cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-brand-red text-white border-brand-red"
                : "bg-white/[0.03] text-neutral-400 hover:text-white border-white/10 hover:bg-white/[0.06]"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-none font-mono ${
                  isActive
                    ? "bg-black/30 text-white"
                    : "bg-white/10 text-neutral-300"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function AdminInput({ className = "", ...props }) {
  return (
    <input
      className={`w-full bg-[#0a0a0a] border border-white/10 focus:border-brand-red text-white placeholder-neutral-500 text-xs sm:text-sm px-3.5 py-2.5 rounded-none outline-none transition-colors font-sans ${className}`}
      {...props}
    />
  );
}

export function AdminTextarea({ className = "", rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full bg-[#0a0a0a] border border-white/10 focus:border-brand-red text-white placeholder-neutral-500 text-xs sm:text-sm p-3.5 rounded-none outline-none transition-colors font-sans leading-relaxed resize-y ${className}`}
      {...props}
    />
  );
}

export function AdminSelect({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full bg-[#0a0a0a] border border-white/10 focus:border-brand-red text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-none outline-none transition-colors font-sans cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function AdminTableWrapper({ children, className = "" }) {
  return (
    <div
      className={`border border-white/10 rounded-none bg-[#0d0d0d] overflow-x-auto ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminTable({ children, className = "" }) {
  return (
    <table className={`w-full text-left text-xs border-collapse ${className}`}>
      {children}
    </table>
  );
}

export function AdminThead({ children, className = "" }) {
  return (
    <thead
      className={`bg-white/[0.03] border-b border-white/10 text-[10px] uppercase font-mono tracking-wider text-neutral-400 ${className}`}
    >
      {children}
    </thead>
  );
}

export function AdminTbody({ children, className = "" }) {
  return (
    <tbody className={`divide-y divide-white/[0.06] ${className}`}>
      {children}
    </tbody>
  );
}

export function AdminTr({ children, className = "" }) {
  return (
    <tr className={`hover:bg-white/[0.02] transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function AdminTh({ children, className = "" }) {
  return <th className={`px-4 py-3.5 font-semibold ${className}`}>{children}</th>;
}

export function AdminTd({ children, className = "" }) {
  return <td className={`px-4 py-3.5 text-neutral-300 ${className}`}>{children}</td>;
}

export function AdminModal({
  isOpen = true,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-md",
  className = "",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6 backdrop-blur-none">
      <div
        className={`bg-[#111111] border border-white/10 rounded-none w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden shadow-2xl ${className}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <h2 className="text-sm font-black uppercase text-white tracking-wider font-display">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10 bg-white/[0.02] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminAlert({
  children,
  variant = "error",
  className = "",
  icon: Icon,
}) {
  const variantClasses = {
    error: "text-red-400 bg-red-500/10 border-red-500/20",
    success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    info: "text-neutral-300 bg-white/[0.04] border-white/10",
    warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  }[variant] || "";

  return (
    <div
      className={`flex items-center gap-2.5 text-xs border rounded-none p-3.5 mb-4 ${variantClasses} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function AdminEmptyState({
  title = "No items yet",
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 border border-white/[0.08] rounded-none bg-[#0d0d0d] text-center p-6 ${className}`}
    >
      <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">
        {title}
      </p>
      {description && (
        <p className="text-xs text-neutral-400 max-w-sm mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

