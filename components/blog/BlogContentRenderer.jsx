"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

function isSafeUrl(url) {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("data:")
  ) {
    return false;
  }
  return true;
}

function isExternalUrl(url) {
  if (!url) return false;
  if (
    url.startsWith("/") ||
    url.startsWith("#") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:")
  ) {
    return false;
  }
  try {
    const parsed = new URL(url, "https://designtouchplus.com");
    return (
      parsed.hostname !== "designtouchplus.com" &&
      parsed.hostname !== "localhost" &&
      !parsed.hostname.endsWith(".designtouchplus.com")
    );
  } catch {
    return url.startsWith("http://") || url.startsWith("https://");
  }
}

/**
 * Parses inline markdown and safe HTML hyperlinks:
 * - Images: ![alt](url)
 * - Markdown Links: [text](url)
 * - HTML Links: <a href="url">text</a>
 * - Bold: **text**
 * - Italic: *text*
 * - Inline code: `code`
 */
function parseInline(text) {
  if (!text) return null;

  const pattern =
    /(`[^`]+`|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|<a\s+[^>]*href=["'][^"']*["'][^>]*>[\s\S]*?<\/a>|\*\*[^*]+\*\*|\*[^*]+\*)/gi;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline Code
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={index}
          className="bg-white/10 text-brand-red px-1.5 py-0.5 rounded-none text-[13px] font-mono border border-white/10"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Inline Image: ![alt](url)
    if (part.startsWith("![") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (match) {
        const [, alt, url] = match;
        if (!isSafeUrl(url)) return null;
        return (
          <span
            key={index}
            className="block my-7 rounded-none overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={alt || "Article illustration"}
              className="w-full h-auto max-h-[650px] object-contain sm:object-cover mx-auto block"
              loading="lazy"
            />
            {alt && (
              <span className="block p-3 text-center text-xs font-mono text-neutral-400 bg-white/[0.02] border-t border-white/[0.06]">
                {alt}
              </span>
            )}
          </span>
        );
      }
    }

    // Markdown Hyperlink: [label](url)
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (match) {
        const [, label, url] = match;
        const cleanUrl = url.trim();
        if (!isSafeUrl(cleanUrl)) {
          return label;
        }
        const external = isExternalUrl(cleanUrl);
        return (
          <a
            key={index}
            href={cleanUrl}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="text-brand-red hover:text-red-400 underline underline-offset-4 font-medium transition-colors break-words [overflow-wrap:anywhere]"
          >
            {label}
          </a>
        );
      }
    }

    // HTML Hyperlink: <a ... href="..." ...>label</a>
    if (/^<a\s+/i.test(part) && /<\/a>$/i.test(part)) {
      const hrefMatch = part.match(/href=["']([^"']*)["']/i);
      const textMatch = part.match(/>([\s\S]*?)<\/a>/i);
      const rawHref = hrefMatch ? hrefMatch[1].trim() : "";
      const rawLabel = textMatch ? textMatch[1] : rawHref;

      if (!isSafeUrl(rawHref)) {
        return rawLabel;
      }

      const external = isExternalUrl(rawHref);
      return (
        <a
          key={index}
          href={rawHref}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="text-brand-red hover:text-red-400 underline underline-offset-4 font-medium transition-colors break-words [overflow-wrap:anywhere]"
        >
          {rawLabel}
        </a>
      );
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={index} className="text-neutral-200 italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
}

/**
 * Parses markdown table lines:
 * | Header 1 | Header 2 |
 * | --- | --- |
 * | Cell 1 | Cell 2 |
 */
function renderTable(tableLines, key) {
  if (tableLines.length < 2) return null;

  const parseRow = (line) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  const headerCells = parseRow(tableLines[0]);
  const hasSeparator = /^\|?[\s-:]+\|[\s-:|]+$/.test(tableLines[1].trim());
  const bodyStartIndex = hasSeparator ? 2 : 1;
  const bodyRows = tableLines.slice(bodyStartIndex).map(parseRow);

  return (
    <div key={key} className="my-8 w-full">
      <div className="overflow-x-auto rounded-none border border-white/10 bg-[#0d0d0d] shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <table className="w-full min-w-[500px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04]">
              {headerCells.map((header, idx) => (
                <th
                  key={idx}
                  className="px-5 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-300"
                >
                  {parseInline(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="px-5 py-3.5 text-neutral-300 text-[14px] leading-relaxed"
                  >
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] font-mono text-neutral-500 mt-2 text-right sm:hidden">
        Scroll horizontally to view table →
      </p>
    </div>
  );
}

/**
 * FaqAccordion Component
 * Renders each FAQ item as a premium, sharp-cornered interactive accordion card.
 * Accessible with semantic button, aria-expanded, aria-controls, keyboard interaction, and smooth CSS Grid transitions.
 */
function FaqAccordion({ items = [] }) {
  // Allow multiple open FAQs or single open. Initially, all answers are collapsed.
  const [openIndices, setOpenIndices] = useState(() => new Set());

  const toggle = (idx) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3 my-6 w-full" role="region" aria-label="Frequently Asked Questions">
      {items.map((item, idx) => {
        const isOpen = openIndices.has(idx);
        const buttonId = `faq-btn-${idx}`;
        const panelId = `faq-panel-${idx}`;

        return (
          <div
            key={idx}
            className={`w-full rounded-none border transition-all duration-200 ${
              isOpen
                ? "bg-[#0f0f0f] border-white/20 shadow-md"
                : "bg-[#0a0a0a] border-white/[0.08] hover:border-white/15 hover:bg-[#0c0c0c]"
            }`}
          >
            <button
              type="button"
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(idx)}
              className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-red select-none group"
            >
              <span
                className={`text-[15px] sm:text-base font-display font-bold tracking-tight transition-colors leading-snug pr-2 ${
                  isOpen ? "text-white" : "text-neutral-200 group-hover:text-white"
                }`}
              >
                {parseInline(item.question)}
              </span>
              <span
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-none border flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isOpen
                    ? "bg-brand-red/10 border-brand-red/40 text-brand-red"
                    : "bg-white/[0.02] border-white/10 text-neutral-400 group-hover:text-white group-hover:border-white/20"
                }`}
                aria-hidden="true"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ease-out ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-[14px] sm:text-[15px] text-neutral-300 font-sans leading-[1.78] border-t border-white/[0.06] mt-1 pt-3.5 space-y-2.5">
                  {Array.isArray(item.answers) && item.answers.length > 0 ? (
                    item.answers.map((ans, aIdx) => (
                      <p key={aIdx} className="m-0">
                        {parseInline(ans)}
                      </p>
                    ))
                  ) : (
                    <p className="m-0">{parseInline(item.answer)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * BlogContentRenderer
 * Renders rich text with headings (h2, h3), interactive FAQ accordion cards,
 * multiple images, tables, lists, quotes, links, and bold/italic text.
 */
export default function BlogContentRenderer({ content = "", className = "" }) {
  if (!content) return null;

  const lines = content.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Empty lines
    if (!line) {
      i++;
      continue;
    }

    // 2. Headings & FAQ Section Detection
    if (line.startsWith("## ")) {
      const headingText = line.slice(3).trim();
      const isFaqHeading = /^(frequently asked questions|faq|f\.a\.q\.|questions\s*(&|and)\s*answers|common questions)$/i.test(headingText);

      if (isFaqHeading) {
        i++;
        const faqItems = [];
        const introLines = [];
        let currentQuestion = null;
        let currentAnswerLines = [];

        while (i < lines.length) {
          const rawFaqLine = lines[i];
          const faqLine = rawFaqLine.trim();

          if (!faqLine) {
            i++;
            continue;
          }

          // If a new top-level section (## or #) is encountered, exit FAQ section
          if (faqLine.startsWith("## ") || (faqLine.startsWith("# ") && !faqLine.startsWith("### "))) {
            break;
          }

          // Check if this line is a question (### Question or **Question?**)
          const isH3Question = faqLine.startsWith("### ");
          const isBoldQuestion = /^\*\*.*?\?\*\*$/.test(faqLine);

          if (isH3Question || isBoldQuestion) {
            if (currentQuestion) {
              faqItems.push({
                question: currentQuestion,
                answer: currentAnswerLines.join(" "),
                answers: [...currentAnswerLines],
              });
            }

            const qText = isH3Question
              ? faqLine.slice(4).trim()
              : faqLine.slice(2, -2).trim();

            currentQuestion = qText;
            currentAnswerLines = [];
            i++;
            continue;
          }

          // Answer line (or intro before first question)
          if (currentQuestion) {
            currentAnswerLines.push(faqLine);
          } else {
            introLines.push(faqLine);
          }
          i++;
        }

        // Save last question
        if (currentQuestion) {
          faqItems.push({
            question: currentQuestion,
            answer: currentAnswerLines.join(" "),
            answers: [...currentAnswerLines],
          });
        }

        blocks.push({
          type: "faqSection",
          title: headingText,
          intro: introLines.join(" "),
          items: faqItems,
        });
        continue;
      }

      blocks.push({
        type: "h2",
        text: headingText,
      });
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({
        type: "h2",
        text: line.slice(2).trim(),
      });
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({
        type: "h3",
        text: line.slice(4).trim(),
      });
      i++;
      continue;
    }

    // 3. Standalone Image: ![alt](url)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      blocks.push({
        type: "image",
        alt: imgMatch[1],
        url: imgMatch[2],
      });
      i++;
      continue;
    }

    // 4. Table: Line starts and ends with |
    if (line.startsWith("|") && line.endsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      blocks.push({
        type: "table",
        lines: tableLines,
      });
      continue;
    }

    // 5. Blockquote: Line starts with >
    if (line.startsWith(">")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      blocks.push({
        type: "quote",
        text: quoteLines.join(" "),
      });
      continue;
    }

    // 6. Bullet List: Line starts with - or *
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
      ) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({
        type: "bulletList",
        items: listItems,
      });
      continue;
    }

    // 7. Numbered List: Line starts with digits + dot
    if (/^\d+\.\s+/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({
        type: "numberedList",
        items: listItems,
      });
      continue;
    }

    // 8. Paragraph: Collect contiguous lines that don't match other block types
    const paraLines = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("- ") &&
      !lines[i].trim().startsWith("* ") &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !(lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) &&
      !lines[i].trim().match(/^!\[(.*?)\]\((.*?)\)$/)
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    blocks.push({
      type: "paragraph",
      text: paraLines.join(" "),
    });
  }

  return (
    <div className={`article-prose ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={idx}
                className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-10 sm:mt-12 mb-4 pt-6 border-t border-white/[0.08] flex items-center gap-2.5"
              >
                <span className="w-1.5 h-1.5 bg-brand-red shrink-0" aria-hidden="true" />
                <span>{parseInline(block.text)}</span>
              </h2>
            );

          case "h3":
            return (
              <h3
                key={idx}
                className="text-base sm:text-[17px] font-display font-semibold text-neutral-100 tracking-normal mt-6 sm:mt-7 mb-2.5"
              >
                {parseInline(block.text)}
              </h3>
            );

          case "paragraph":
            return (
              <p
                key={idx}
                className="text-neutral-300 text-[15px] sm:text-[16px] leading-[1.78] font-sans font-normal mb-5 last:mb-0"
              >
                {parseInline(block.text)}
              </p>
            );

          case "faqSection":
            return (
              <section key={idx} className="mt-12 sm:mt-14 mb-8 pt-8 border-t border-white/[0.08]" aria-label={block.title}>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-1.5 h-1.5 bg-brand-red shrink-0" aria-hidden="true" />
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight m-0">
                    {parseInline(block.title)}
                  </h2>
                </div>
                {block.intro && (
                  <p className="text-neutral-400 text-sm sm:text-[15px] leading-relaxed mb-5 mt-2">
                    {parseInline(block.intro)}
                  </p>
                )}
                <FaqAccordion items={block.items} />
              </section>
            );

          case "bulletList":
            return (
              <ul key={idx} className="space-y-2.5 my-5 pl-5 sm:pl-6">
                {block.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="relative text-neutral-300 text-[15px] sm:text-[16px] leading-[1.75] list-disc marker:text-brand-red marker:text-sm"
                  >
                    {parseInline(item)}
                  </li>
                ))}
              </ul>
            );

          case "numberedList":
            return (
              <ol key={idx} className="space-y-2.5 my-5 pl-5 sm:pl-6 list-decimal marker:text-neutral-500 marker:font-mono text-sm">
                {block.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="text-neutral-300 text-[15px] sm:text-[16px] leading-[1.75]"
                  >
                    {parseInline(item)}
                  </li>
                ))}
              </ol>
            );

          case "quote":
            return (
              <blockquote
                key={idx}
                className="border-l-2 border-brand-red pl-5 py-3.5 my-6 sm:my-7 bg-[#0d0d0d] border border-white/[0.06] text-neutral-200 italic text-[15px] sm:text-[16px] leading-[1.75] rounded-none"
              >
                {parseInline(block.text)}
              </blockquote>
            );

          case "table":
            return renderTable(block.lines, idx);

          case "image":
            return (
              <figure key={idx} className="my-7 sm:my-8 rounded-none overflow-hidden border border-white/[0.08] bg-[#0d0d0d] shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.url}
                  alt={block.alt || "Article illustration"}
                  className="w-full h-auto max-h-[650px] object-contain sm:object-cover mx-auto block"
                  loading="lazy"
                />
                {block.alt && (
                  <figcaption className="p-3 sm:p-3.5 text-center text-xs font-mono text-neutral-400 bg-white/[0.02] border-t border-white/[0.06]">
                    {block.alt}
                  </figcaption>
                )}
              </figure>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
