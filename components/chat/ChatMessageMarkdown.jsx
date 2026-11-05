"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

/**
 * Custom sanitize schema extending rehype-sanitize defaults:
 * - Allows safe tags and attributes
 * - Restricts link protocols to http, https, mailto, tel, or relative URLs
 * - Blocks any script, iframe, inline event handlers, javascript: or data: URIs
 */
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a || []),
      ["target", "_blank"],
      ["rel", "noopener noreferrer"],
      "className",
    ],
    code: [...(defaultSchema.attributes?.code || []), "className"],
    span: [...(defaultSchema.attributes?.span || []), "className"],
    div: [...(defaultSchema.attributes?.div || []), "className"],
    p: [...(defaultSchema.attributes?.p || []), "className"],
    h1: [...(defaultSchema.attributes?.h1 || []), "className"],
    h2: [...(defaultSchema.attributes?.h2 || []), "className"],
    h3: [...(defaultSchema.attributes?.h3 || []), "className"],
    h4: [...(defaultSchema.attributes?.h4 || []), "className"],
    ul: [...(defaultSchema.attributes?.ul || []), "className"],
    ol: [...(defaultSchema.attributes?.ol || []), "className"],
    li: [...(defaultSchema.attributes?.li || []), "className"],
    blockquote: [...(defaultSchema.attributes?.blockquote || []), "className"],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto", "tel"],
  },
};

/**
 * Pre-cleans raw markdown text from the AI:
 * - Normalizes Windows/Unix line breaks
 * - Collapses 3+ consecutive line breaks into 2
 * - Removes phantom backticks or malformed wrappers
 */
function cleanMarkdown(raw) {
  if (!raw) return "";
  let text = String(raw).replace(/\r\n/g, "\n");
  // Collapse excessive blank lines
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

/**
 * Validates whether an href is safe to link.
 */
function isSafeHref(href) {
  if (!href || typeof href !== "string") return false;
  const trimmed = href.trim().toLowerCase();
  // Relative internal paths (/pricing, /contact, #section)
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  // Explicitly safe schemes
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  );
}

export default function ChatMessageMarkdown({ content, isStreaming = false }) {
  const cleanedContent = useMemo(() => cleanMarkdown(content), [content]);

  if (!cleanedContent) {
    return null;
  }

  return (
    <div className="chat-markdown text-xs text-neutral-200 font-sans leading-relaxed break-words space-y-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={{
          // Paragraphs
          p: ({ node, children, ...props }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-neutral-200 font-normal" {...props}>
              {children}
            </p>
          ),

          // Bold text
          strong: ({ node, children, ...props }) => (
            <strong className="font-bold text-white tracking-wide" {...props}>
              {children}
            </strong>
          ),

          // Italic text
          em: ({ node, children, ...props }) => (
            <em className="italic text-neutral-300" {...props}>
              {children}
            </em>
          ),

          // Headings
          h1: ({ node, children, ...props }) => (
            <h1 className="text-sm font-display font-black uppercase text-white mt-3 mb-1.5 first:mt-0 tracking-tight" {...props}>
              {children}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 className="text-xs font-display font-black uppercase text-white mt-3 mb-1.5 first:mt-0 tracking-tight" {...props}>
              {children}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="text-xs font-bold uppercase text-neutral-100 mt-2.5 mb-1 first:mt-0 tracking-tight" {...props}>
              {children}
            </h3>
          ),
          h4: ({ node, children, ...props }) => (
            <h4 className="text-[11px] font-bold uppercase text-neutral-200 mt-2 mb-1 first:mt-0" {...props}>
              {children}
            </h4>
          ),

          // Unordered list
          ul: ({ node, children, ...props }) => (
            <ul className="mb-2 last:mb-0 space-y-1.5 list-disc list-outside pl-4 text-neutral-200" {...props}>
              {children}
            </ul>
          ),

          // Ordered list
          ol: ({ node, children, ...props }) => (
            <ol className="mb-2 last:mb-0 space-y-1.5 list-decimal list-outside pl-4 text-neutral-200" {...props}>
              {children}
            </ol>
          ),

          // List item
          li: ({ node, children, ...props }) => (
            <li className="leading-relaxed pl-1 marker:text-brand-red text-neutral-200" {...props}>
              {children}
            </li>
          ),

          // Blockquote
          blockquote: ({ node, children, ...props }) => (
            <blockquote
              className="border-l-2 border-brand-red bg-white/[0.02] pl-3 py-1 my-2 text-neutral-300 italic text-[11px]"
              {...props}
            >
              {children}
            </blockquote>
          ),

          // Links
          a: ({ node, href, children, ...props }) => {
            if (!isSafeHref(href)) {
              return <span className="text-neutral-400 underline">{children}</span>;
            }
            const isInternal = href.startsWith("/") || href.startsWith("#");
            return (
              <a
                href={href}
                target={isInternal ? undefined : "_blank"}
                rel={isInternal ? undefined : "noopener noreferrer"}
                className="text-brand-red hover:text-white underline underline-offset-2 decoration-brand-red/50 hover:decoration-white font-medium transition-colors"
                {...props}
              >
                {children}
              </a>
            );
          },

          // Code
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className="bg-[#1a1a1a] text-brand-red font-mono text-[11px] px-1 py-0.5 rounded-none border border-white/10"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-[#111111] border border-white/10 rounded-none p-2.5 my-2 overflow-x-auto text-[11px] font-mono text-neutral-300">
                <code {...props}>{children}</code>
              </pre>
            );
          },

          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="border-t border-white/10 my-3" {...props} />
          ),
        }}
      >
        {cleanedContent}
      </ReactMarkdown>

      {/* Blinking streaming cursor */}
      {isStreaming && (
        <span
          className="inline-block w-1.5 h-3.5 bg-brand-red ml-0.5 align-middle animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

