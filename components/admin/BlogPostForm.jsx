"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Trash2,
  RefreshCw,
  Eye,
  Edit3,
  Calendar,
  Clock,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Table as TableIcon,
  AlertCircle,
  CheckCircle2,
  Globe,
  Tag,
  Search,
} from "lucide-react";
import {
  uploadBlogCoverImage,
  uploadBlogContentImage,
  createBlogPost,
  updateBlogPost,
  getBlogPostAdminById,
  getBlogCategories,
} from "@/lib/api";
import { parseKeywordOrTagTokens, addUniqueTokens } from "@/lib/tagUtils";
import BlogContentRenderer from "@/components/blog/BlogContentRenderer";

const CATEGORIES = [
  "VIDEO_EDITING",
  "MOTION_GRAPHICS",
  "CONTENT_CREATION",
  "YOUTUBE",
  "BUSINESS",
];

const STATUS_OPTIONS = [
  { value: "PUBLISHED", label: "Published", desc: "Live immediately on the public website" },
  { value: "SCHEDULED", label: "Scheduled", desc: "Hidden until scheduled date/time arrives" },
  { value: "DRAFT", label: "Draft", desc: "Internal draft, hidden from public" },
  { value: "PRIVATE", label: "Private", desc: "Internal access only" },
];

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  coverImagePublicId: "",
  category: "VIDEO_EDITING",
  categoryId: null,
  readingTime: "",
  status: "PUBLISHED",
  scheduledFor: "",
  publishedAt: "",
  isPublished: true,
  seoTitle: "",
  metaDescription: "",
  tags: [],
  focusKeywords: [],
};

// Auto-generates a URL-safe slug from the title
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

// Converts clipboard HTML from Google Docs, Word, or web pages into clean, safe Markdown
function htmlToMarkdown(html) {
  if (!html || typeof window === "undefined") return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove unsafe or irrelevant elements
  const unsafeSelectors = [
    "script",
    "style",
    "meta",
    "link",
    "iframe",
    "object",
    "embed",
    "applet",
    "noscript",
    "svg",
    "button",
    "input",
    "form",
    "select",
    "textarea",
  ];
  doc.querySelectorAll(unsafeSelectors.join(",")).forEach((el) => el.remove());

  function serializeNode(node) {
    if (!node) return "";
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const tag = node.tagName.toLowerCase();

    // Serialize children
    const childText = Array.from(node.childNodes)
      .map(serializeNode)
      .join("");

    // Anchor: <a href="...">text</a>
    if (tag === "a") {
      const rawHref = (node.getAttribute("href") || "").trim();
      const text = childText.trim();
      const lower = rawHref.toLowerCase();
      // Block unsafe schemes
      if (
        !rawHref ||
        lower.startsWith("javascript:") ||
        lower.startsWith("vbscript:") ||
        lower.startsWith("data:")
      ) {
        return text || "";
      }
      return `[${text || rawHref}](${rawHref})`;
    }

    // Bold
    if (
      tag === "b" ||
      tag === "strong" ||
      node.style?.fontWeight === "bold" ||
      parseInt(node.style?.fontWeight, 10) >= 600
    ) {
      const trimmed = childText.trim();
      return trimmed ? `**${trimmed}**` : "";
    }

    // Italic
    if (tag === "i" || tag === "em" || node.style?.fontStyle === "italic") {
      const trimmed = childText.trim();
      return trimmed ? `*${trimmed}*` : "";
    }

    // Inline code
    if (tag === "code" && node.parentNode?.tagName.toLowerCase() !== "pre") {
      const trimmed = childText.trim();
      return trimmed ? `\`${trimmed}\`` : "";
    }

    // Preformatted code block
    if (tag === "pre") {
      return `\n\n\`\`\`\n${node.textContent.trim()}\n\`\`\`\n\n`;
    }

    // Headings
    if (tag === "h1" || tag === "h2") {
      const trimmed = childText.trim();
      return trimmed ? `\n\n## ${trimmed}\n\n` : "";
    }
    if (tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") {
      const trimmed = childText.trim();
      return trimmed ? `\n\n### ${trimmed}\n\n` : "";
    }

    // Paragraph & Div
    if (tag === "p" || tag === "div") {
      const trimmed = childText.trim();
      return trimmed ? `\n\n${trimmed}\n\n` : "\n";
    }

    // Line break
    if (tag === "br") {
      return "\n";
    }

    // Blockquote
    if (tag === "blockquote") {
      const lines = childText.trim().split("\n");
      return `\n\n${lines.map((l) => `> ${l}`).join("\n")}\n\n`;
    }

    // Lists
    if (tag === "ul") {
      const items = Array.from(node.children)
        .filter((c) => c.tagName.toLowerCase() === "li")
        .map(
          (li) =>
            `- ${Array.from(li.childNodes).map(serializeNode).join("").trim()}`
        )
        .join("\n");
      return `\n\n${items}\n\n`;
    }

    if (tag === "ol") {
      const items = Array.from(node.children)
        .filter((c) => c.tagName.toLowerCase() === "li")
        .map(
          (li, idx) =>
            `${idx + 1}. ${Array.from(li.childNodes).map(serializeNode).join("").trim()}`
        )
        .join("\n");
      return `\n\n${items}\n\n`;
    }

    // Tables
    if (tag === "table") {
      const rows = Array.from(node.querySelectorAll("tr"));
      if (rows.length === 0) return childText;

      const tableData = rows.map((tr) =>
        Array.from(tr.querySelectorAll("th, td")).map((cell) =>
          Array.from(cell.childNodes)
            .map(serializeNode)
            .join("")
            .trim()
            .replace(/\|/g, "\\|")
        )
      );

      if (tableData.length === 0) return "";
      const colCount = Math.max(...tableData.map((r) => r.length));
      if (colCount === 0) return "";

      const headerRow = tableData[0];
      while (headerRow.length < colCount) headerRow.push("");
      const separatorRow = Array(colCount).fill("---");

      const markdownRows = [
        `| ${headerRow.join(" | ")} |`,
        `| ${separatorRow.join(" | ")} |`,
      ];

      for (let r = 1; r < tableData.length; r++) {
        const row = tableData[r];
        while (row.length < colCount) row.push("");
        markdownRows.push(`| ${row.join(" | ")} |`);
      }

      return `\n\n${markdownRows.join("\n")}\n\n`;
    }

    // Images
    if (tag === "img") {
      const src = (node.getAttribute("src") || "").trim();
      const alt = (node.getAttribute("alt") || "").trim();
      const lower = src.toLowerCase();
      if (
        src &&
        !lower.startsWith("javascript:") &&
        !lower.startsWith("vbscript:") &&
        !lower.startsWith("data:")
      ) {
        return `\n\n![${alt || "Article illustration"}](${src})\n\n`;
      }
      return "";
    }

    return childText;
  }

  const result = serializeNode(doc.body);
  return result.replace(/\n{3,}/g, "\n\n").trim();
}

export default function BlogPostForm({ post, onClose, onSaved }) {
  const isEditing = Boolean(post?.id);

  const [form, setForm] = useState(() => {
    if (!post) return EMPTY_FORM;

    // Convert ISO scheduledFor to local format for datetime-local input
    let formattedScheduled = "";
    if (post.scheduledFor) {
      try {
        const d = new Date(post.scheduledFor);
        formattedScheduled = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      } catch {
        formattedScheduled = "";
      }
    }

    return {
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      coverImageUrl: post.coverImageUrl || "",
      coverImagePublicId: post.coverImagePublicId || "",
      category: post.category || "VIDEO_EDITING",
      categoryId: post.categoryId || null,
      readingTime: post.readingTime != null ? String(post.readingTime) : "",
      status: post.status || (post.isPublished === false ? "DRAFT" : "PUBLISHED"),
      scheduledFor: formattedScheduled,
      publishedAt: post.publishedAt || "",
      isPublished: post.isPublished !== false,
      seoTitle: post.seoTitle || "",
      metaDescription: post.metaDescription || "",
      tags: Array.isArray(post.tags) ? post.tags : [],
      focusKeywords: Array.isArray(post.focusKeywords) ? post.focusKeywords : [],
    };
  });

  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [activeTab, setActiveTab] = useState("WRITE"); // "WRITE" | "PREVIEW"
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [uploadingContentImages, setUploadingContentImages] = useState(false);
  const [contentImageProgress, setContentImageProgress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageMessage, setImageMessage] = useState("");
  const [categories, setCategories] = useState([]);

  // Tag & Focus Keyword input states
  const [tagInput, setTagInput] = useState("");
  const [focusKeywordInput, setFocusKeywordInput] = useState("");

  // Insert Link modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkTextInput, setLinkTextInput] = useState("");
  const [linkUrlInput, setLinkUrlInput] = useState("");
  const [linkError, setLinkError] = useState("");

  // Insert Image via URL modal state
  const [showImageUrlModal, setShowImageUrlModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageAltInput, setImageAltInput] = useState("");
  const [imageUrlError, setImageUrlError] = useState("");

  // Editor cursor position tracking
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });

  const coverFileInputRef = useRef(null);
  const contentImageFileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Load active blog categories dynamically
  useEffect(() => {
    let isMounted = true;
    getBlogCategories()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCategories(data);
          // Auto-sync categoryId if form only has the default slug
          setForm((prev) => {
            if (!prev.categoryId) {
              const matched = data.find(
                (c) =>
                  c.slug === prev.category ||
                  (c.slug && prev.category && c.slug.toUpperCase() === prev.category.toUpperCase())
              );
              if (matched) {
                return { ...prev, categoryId: matched.id, category: matched.slug };
              }
            }
            return prev;
          });
        }
      })
      .catch((err) => {
        console.warn("Could not load blog categories:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Keep cursor position synchronized
  const updateCursor = () => {
    if (textareaRef.current) {
      setCursorPosition({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      });
    }
  };

  // If editing and post summary lacked content, fetch full post details
  useEffect(() => {
    if (isEditing && post?.id && (!post.content || post.content.length === 0)) {
      setLoadingDetails(true);
      getBlogPostAdminById(post.id)
        .then((fullPost) => {
          if (fullPost) {
            let formattedScheduled = "";
            if (fullPost.scheduledFor) {
              try {
                const d = new Date(fullPost.scheduledFor);
                formattedScheduled = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 16);
              } catch {
                formattedScheduled = "";
              }
            }

            setForm((prev) => ({
              ...prev,
              content: fullPost.content || prev.content,
              excerpt: fullPost.excerpt || prev.excerpt,
              coverImageUrl: fullPost.coverImageUrl || prev.coverImageUrl,
              coverImagePublicId: fullPost.coverImagePublicId || prev.coverImagePublicId,
              category: fullPost.category || prev.category,
              categoryId: fullPost.categoryId || prev.categoryId,
              status: fullPost.status || prev.status,
              scheduledFor: formattedScheduled || prev.scheduledFor,
              readingTime: fullPost.readingTime != null ? String(fullPost.readingTime) : prev.readingTime,
              seoTitle: fullPost.seoTitle !== undefined ? (fullPost.seoTitle || "") : prev.seoTitle,
              metaDescription: fullPost.metaDescription !== undefined ? (fullPost.metaDescription || "") : prev.metaDescription,
              tags: Array.isArray(fullPost.tags) ? fullPost.tags : (prev.tags || []),
              focusKeywords: Array.isArray(fullPost.focusKeywords) ? fullPost.focusKeywords : (prev.focusKeywords || []),
            }));
          }
        })
        .catch((err) => {
          console.warn("Could not load full post content:", err);
        })
        .finally(() => {
          setLoadingDetails(false);
        });
    }
  }, [isEditing, post?.id, post?.content]);

  // Handle standard text/select inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setForm((prev) => {
      const updated = { ...prev, [name]: val };

      // Keep slug in sync with title only when creating a new post and slug field hasn't been edited
      if (name === "title" && !slugTouched && !isEditing) {
        updated.slug = slugify(value);
      }
      if (name === "slug") {
        setSlugTouched(true);
      }
      if (name === "category") {
        const selectedVal = val;
        const matched = categories.find((c) => c.slug === selectedVal || c.id === selectedVal);
        updated.category = matched ? matched.slug : selectedVal;
        updated.categoryId = matched ? matched.id : prev.categoryId;
      }
      // Sync status with isPublished
      if (name === "status") {
        updated.isPublished = value === "PUBLISHED";
      }

      return updated;
    });
  };

  // Tag management (for Public article display and taxonomy)
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const tokens = parseKeywordOrTagTokens(tagInput, true);
    if (tokens.length > 0) {
      setForm((prev) => ({
        ...prev,
        tags: addUniqueTokens(prev.tags || [], tokens, true),
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove),
    }));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleTagPaste = (e) => {
    const text = e.clipboardData?.getData("text");
    if (!text) return;
    // Intercept multiline or comma-separated pasted content
    if (/[\r\n,]/.test(text)) {
      e.preventDefault();
      const combined = tagInput.trim() ? `${tagInput}\n${text}` : text;
      const tokens = parseKeywordOrTagTokens(combined, true);
      if (tokens.length > 0) {
        setForm((prev) => ({
          ...prev,
          tags: addUniqueTokens(prev.tags || [], tokens, true),
        }));
        setTagInput("");
      }
    }
  };

  const handleTagChange = (e) => {
    const val = e.target.value;
    // Fallback: If value contains newlines (e.g. from drag/drop or non-standard paste)
    if (/[\r\n]/.test(val)) {
      const tokens = parseKeywordOrTagTokens(val, true);
      if (tokens.length > 0) {
        setForm((prev) => ({
          ...prev,
          tags: addUniqueTokens(prev.tags || [], tokens, true),
        }));
        setTagInput("");
        return;
      }
    }
    setTagInput(val);
  };

  // Focus Keywords management (for Editorial planning and target search phrases)
  const handleAddFocusKeyword = () => {
    if (!focusKeywordInput.trim()) return;
    const tokens = parseKeywordOrTagTokens(focusKeywordInput, false);
    if (tokens.length > 0) {
      setForm((prev) => ({
        ...prev,
        focusKeywords: addUniqueTokens(prev.focusKeywords || [], tokens, false),
      }));
      setFocusKeywordInput("");
    }
  };

  const handleRemoveFocusKeyword = (kwToRemove) => {
    setForm((prev) => ({
      ...prev,
      focusKeywords: (prev.focusKeywords || []).filter((k) => k !== kwToRemove),
    }));
  };

  const handleFocusKeywordKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddFocusKeyword();
    }
  };

  const handleFocusKeywordPaste = (e) => {
    const text = e.clipboardData?.getData("text");
    if (!text) return;
    // Intercept multiline or comma-separated pasted content
    if (/[\r\n,]/.test(text)) {
      e.preventDefault();
      const combined = focusKeywordInput.trim()
        ? `${focusKeywordInput}\n${text}`
        : text;
      const tokens = parseKeywordOrTagTokens(combined, false);
      if (tokens.length > 0) {
        setForm((prev) => ({
          ...prev,
          focusKeywords: addUniqueTokens(prev.focusKeywords || [], tokens, false),
        }));
        setFocusKeywordInput("");
      }
    }
  };

  const handleFocusKeywordChange = (e) => {
    const val = e.target.value;
    // Fallback: If value contains newlines (e.g. from drag/drop or non-standard paste)
    if (/[\r\n]/.test(val)) {
      const tokens = parseKeywordOrTagTokens(val, false);
      if (tokens.length > 0) {
        setForm((prev) => ({
          ...prev,
          focusKeywords: addUniqueTokens(prev.focusKeywords || [], tokens, false),
        }));
        setFocusKeywordInput("");
        return;
      }
    }
    setFocusKeywordInput(val);
  };

  // Insert / Edit Link via modal
  const handleOpenLinkModal = () => {
    updateCursor();
    const textarea = textareaRef.current;
    let selectedText = "";
    if (textarea) {
      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;
      selectedText = form.content.substring(start, end).trim();
    }
    setLinkTextInput(selectedText || "");
    setLinkUrlInput("");
    setLinkError("");
    setShowLinkModal(true);
  };

  const handleConfirmInsertLink = (e) => {
    e.preventDefault();
    const url = linkUrlInput.trim();
    if (!url) {
      setLinkError("Please enter a destination URL.");
      return;
    }

    const lower = url.toLowerCase();
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("vbscript:") ||
      lower.startsWith("data:")
    ) {
      setLinkError("Unsafe URL scheme detected. Only http://, https://, or / links are allowed.");
      return;
    }

    if (
      !url.startsWith("http://") &&
      !url.startsWith("https://") &&
      !url.startsWith("/") &&
      !url.startsWith("#") &&
      !url.startsWith("mailto:")
    ) {
      setLinkError("URL must begin with https://, http://, or /");
      return;
    }

    const text = linkTextInput.trim() || url;
    const snippet = `[${text}](${url})`;

    const textarea = textareaRef.current;
    const currentContent = form.content || "";
    const start = cursorPosition.start ?? currentContent.length;
    const end = cursorPosition.end ?? currentContent.length;

    const before = currentContent.substring(0, start);
    const after = currentContent.substring(end);
    const newContent = before + snippet + after;

    setForm((prev) => ({ ...prev, content: newContent }));

    const nextPos = start + snippet.length;
    setCursorPosition({ start: nextPos, end: nextPos });

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(nextPos, nextPos);
      }
    }, 20);

    setShowLinkModal(false);
    setLinkTextInput("");
    setLinkUrlInput("");
    setLinkError("");
  };

  // Intercept paste in markdown editor: preserve links and formatting from Google Docs, Word, web pages
  const handleContentPaste = (e) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const html = clipboardData.getData("text/html");

    // Intercept when clipboard contains rich HTML with links or formatting
    if (
      html &&
      (html.includes("<a ") ||
        html.includes("<p") ||
        html.includes("<h1") ||
        html.includes("<h2") ||
        html.includes("<h3") ||
        html.includes("<table") ||
        html.includes("<ul") ||
        html.includes("<ol") ||
        html.includes("<b") ||
        html.includes("<strong") ||
        html.includes("<i") ||
        html.includes("<em"))
    ) {
      try {
        const markdown = htmlToMarkdown(html);
        if (markdown && markdown.trim()) {
          e.preventDefault();
          const textarea = textareaRef.current;
          const currentContent = form.content || "";
          const start = textarea?.selectionStart ?? currentContent.length;
          const end = textarea?.selectionEnd ?? currentContent.length;

          const before = currentContent.substring(0, start);
          const after = currentContent.substring(end);
          const newContent = before + markdown + after;

          setForm((prev) => ({ ...prev, content: newContent }));

          const nextPos = start + markdown.length;
          setCursorPosition({ start: nextPos, end: nextPos });

          setTimeout(() => {
            if (textarea) {
              textarea.focus();
              textarea.setSelectionRange(nextPos, nextPos);
            }
          }, 10);
          return;
        }
      } catch (err) {
        console.warn("Could not parse rich HTML paste, using default text paste:", err);
      }
    }
  };

  // Cover image file selection & upload to Cloudinary
  const handleCoverImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid image format. Supported formats: JPG, PNG, WebP.");
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setError("Cover image exceeds the 10 MB file size limit.");
      return;
    }

    setUploadingCoverImage(true);
    setError("");
    setImageMessage("");

    try {
      const res = await uploadBlogCoverImage(file);
      const uploadedUrl = res?.url || res?.secureUrl || res?.imageUrl;
      const publicId = res?.publicId || "";

      if (!uploadedUrl) {
        throw new Error("Upload completed but no image URL was returned.");
      }

      setForm((prev) => ({
        ...prev,
        coverImageUrl: uploadedUrl,
        coverImagePublicId: publicId,
      }));

      setImageMessage("Cover image uploaded successfully!");
    } catch (err) {
      setError(err.message || "Failed to upload cover image. Please try again.");
    } finally {
      setUploadingCoverImage(false);
    }
  };

  const handleRemoveCoverImage = () => {
    setForm((prev) => ({
      ...prev,
      coverImageUrl: "",
      coverImagePublicId: "",
    }));
    setImageMessage("Cover image removed.");
  };

  // Insert markdown snippet at the recorded cursor position in content textarea
  const insertAtRecordedCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    const currentContent = form.content || "";
    const start = cursorPosition.start ?? currentContent.length;
    const end = cursorPosition.end ?? currentContent.length;

    const before = currentContent.substring(0, start);
    const after = currentContent.substring(end);

    const needsLeading = before.length > 0 && !before.endsWith("\n\n");
    const leading = needsLeading ? (before.endsWith("\n") ? "\n" : "\n\n") : "";

    const needsTrailing = after.length > 0 && !after.startsWith("\n\n");
    const trailing = needsTrailing ? (after.startsWith("\n") ? "\n" : "\n\n") : "\n\n";

    const snippet = `${leading}${textToInsert}${trailing}`;
    const newContent = before + snippet + after;

    setForm((prev) => ({ ...prev, content: newContent }));

    const nextPos = before.length + snippet.length;
    setCursorPosition({ start: nextPos, end: nextPos });

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(nextPos, nextPos);
      }
    }, 20);
  };

  // Standard inline formatting snippet (bold, italic, headings, lists)
  const insertSnippet = (prefix, suffix = "", defaultText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent =
      form.content.substring(0, start) + replacement + form.content.substring(end);

    setForm((prev) => ({ ...prev, content: newContent }));

    const nextPos = start + prefix.length + selected.length;
    setCursorPosition({ start: nextPos, end: nextPos });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 10);
  };

  // Multiple content images upload from local computer
  const handleContentImageFilesSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    e.target.value = "";

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setError(`"${file.name}" has an unsupported format. Please upload JPG, PNG, or WebP.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" exceeds the 10 MB size limit.`);
        return;
      }
    }

    setUploadingContentImages(true);
    setError("");
    setImageMessage("");

    try {
      const snippets = [];
      for (let idx = 0; idx < files.length; idx++) {
        const file = files[idx];
        setContentImageProgress(
          files.length > 1
            ? `Uploading image ${idx + 1} of ${files.length}...`
            : "Uploading image to Cloudinary..."
        );

        const res = await uploadBlogContentImage(file);
        const url = res?.url || res?.secureUrl || res?.imageUrl;
        if (!url) {
          throw new Error(res?.message || `Failed to upload "${file.name}"`);
        }

        const altText = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim();

        snippets.push(`![${altText || "Article image"}](${url})`);
      }

      insertAtRecordedCursor(snippets.join("\n\n"));
      setImageMessage(
        files.length > 1
          ? `${files.length} images uploaded and inserted into article!`
          : "Image uploaded and inserted into article!"
      );
    } catch (err) {
      setError(err.message || "Failed to upload content image. Please try again.");
    } finally {
      setUploadingContentImages(false);
      setContentImageProgress("");
    }
  };

  // Insert image via URL & Alt Text
  const handleOpenImageUrlModal = () => {
    updateCursor();
    setImageUrlInput("");
    setImageAltInput("");
    setImageUrlError("");
    setShowImageUrlModal(true);
  };

  const handleConfirmInsertImageUrl = (e) => {
    e.preventDefault();
    const url = imageUrlInput.trim();
    if (!url) {
      setImageUrlError("Please enter a valid image URL.");
      return;
    }
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
      setImageUrlError("Image URL must start with http://, https://, or /");
      return;
    }

    const alt = imageAltInput.trim() || "Article illustration";
    insertAtRecordedCursor(`![${alt}](${url})`);
    setShowImageUrlModal(false);
    setImageUrlInput("");
    setImageAltInput("");
    setImageUrlError("");
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Article title is required.");
      return;
    }

    if (!form.slug.trim()) {
      setError("URL slug is required.");
      return;
    }

    if (!form.content.trim()) {
      setError("Article content cannot be empty.");
      return;
    }

    if (form.status === "SCHEDULED" && !form.scheduledFor) {
      setError("Please select a date and time for scheduled publication.");
      return;
    }

    setSaving(true);

    try {
      let isoScheduledFor = null;
      if (form.status === "SCHEDULED" && form.scheduledFor) {
        isoScheduledFor = new Date(form.scheduledFor).toISOString();
      }

      let resolvedCategoryId = form.categoryId || null;
      if (!resolvedCategoryId && categories && categories.length > 0) {
        const matched = categories.find(
          (c) =>
            c.slug === form.category ||
            (c.slug && form.category && c.slug.toUpperCase() === form.category.toUpperCase())
        );
        if (matched) {
          resolvedCategoryId = matched.id;
        }
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        excerpt: form.excerpt?.trim() || null,
        content: form.content,
        coverImageUrl: form.coverImageUrl?.trim() || null,
        coverImagePublicId: form.coverImagePublicId?.trim() || null,
        category: form.category,
        categoryId: resolvedCategoryId,
        readingTime: form.readingTime ? parseInt(form.readingTime, 10) : null,
        status: form.status,
        scheduledFor: isoScheduledFor,
        isPublished: form.status === "PUBLISHED",
        seoTitle: form.seoTitle?.trim() || null,
        metaDescription: form.metaDescription?.trim() || null,
        tags: Array.isArray(form.tags) ? form.tags : [],
        focusKeywords: Array.isArray(form.focusKeywords) ? form.focusKeywords : [],
      };

      if (isEditing) {
        await updateBlogPost(post.id, payload);
      } else {
        await createBlogPost(payload);
      }

      onSaved();
    } catch (err) {
      let displayError = err.message || "Failed to save blog post.";
      try {
        const jsonMatch = displayError.match(/\{.*?\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.message) {
            displayError = parsed.message;
          }
        }
      } catch {
        // use raw displayError
      }
      setError(displayError);
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors w-full";

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-brand-red" />
              <span>{isEditing ? "Edit Blog Article" : "Create New Article"}</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Publish rich content, attach multiple images, configure SEO metadata, and set publication scheduling.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white bg-transparent border-none cursor-pointer p-1 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {loadingDetails ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-400 text-xs font-mono">
            <Loader2 className="w-6 h-6 animate-spin text-brand-red mb-3" />
            Loading complete article content...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-lg text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {imageMessage && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{imageMessage}</span>
              </div>
            )}

            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Article Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 10 Essential Motion Design Tips for 2026"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  URL Slug *
                </label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 10-essential-motion-design-tips-2026"
                  className={inputClasses}
                />
                <p className="text-[10px] text-neutral-500 font-mono mt-1">
                  Public URL: /blog/{form.slug || "..."}
                </p>
              </div>
            </div>

            {/* Category & Reading Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`${inputClasses} cursor-pointer`}
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.id || cat.slug} value={cat.slug} className="bg-[#111] text-white">
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#111] text-white">
                        {cat.replace("_", " ")}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Estimated Reading Time (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  name="readingTime"
                  value={form.readingTime}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Status & Publication / Scheduling Settings */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                <Clock className="w-4 h-4 text-brand-red" />
                <span>Publication Status & Scheduling</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1.5">
                    Post Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={`${inputClasses} cursor-pointer`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#111] text-white">
                        {opt.label} — {opt.desc}
                      </option>
                    ))}
                  </select>
                </div>

                {form.status === "SCHEDULED" ? (
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 mb-1.5 flex items-center gap-1.5 text-amber-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Scheduled Publication Time *</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduledFor"
                      value={form.scheduledFor}
                      onChange={handleChange}
                      required
                      className={`${inputClasses} border-amber-500/40 focus:border-amber-400`}
                    />
                    <p className="text-[10px] text-amber-400/80 font-mono mt-1">
                      Post will automatically go live when this time arrives.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-neutral-400 pt-5">
                    {form.status === "PUBLISHED" && (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Post is immediately visible on the public blog.
                      </span>
                    )}
                    {form.status === "DRAFT" && (
                      <span className="text-neutral-400">
                        Saved internally as a draft. Hidden from the public website.
                      </span>
                    )}
                    {form.status === "PRIVATE" && (
                      <span className="text-purple-400">
                        Private internal article. Only accessible to administrators.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cloudinary Cover Image Section */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-brand-red" />
                  <span>Article Cover Image (Cloudinary)</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  PNG, JPG, WebP · Up to 10MB
                </span>
              </div>

              {form.coverImageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d] aspect-[16/8] max-h-56 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.coverImageUrl}
                    alt="Blog Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      disabled={uploadingCoverImage}
                      className="px-3.5 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-mono font-semibold flex items-center gap-1.5 border-none cursor-pointer backdrop-blur-md"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Replace Cover
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveCoverImage}
                      disabled={uploadingCoverImage}
                      className="px-3.5 py-2 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white text-xs font-mono font-semibold flex items-center gap-1.5 border-none cursor-pointer backdrop-blur-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => coverFileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/15 hover:border-brand-red/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white/[0.01] hover:bg-white/[0.03]"
                >
                  {uploadingCoverImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
                      <span className="text-xs font-mono text-neutral-400">Uploading cover to Cloudinary...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-neutral-400 mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-mono text-neutral-300 font-bold uppercase tracking-wider mb-1">
                        Click to select main cover image
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Uploaded to Cloudinary folder <code className="text-neutral-400">designtouch/blog/covers</code>
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Hidden file input for cover */}
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={handleCoverImageFileSelect}
              />

              <div className="pt-1">
                <input
                  name="coverImageUrl"
                  value={form.coverImageUrl || ""}
                  onChange={handleChange}
                  placeholder="Or paste external Cover Image URL"
                  className={`${inputClasses} text-xs font-mono`}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Article Excerpt (Short summary for grid card)
              </label>
              <textarea
                name="excerpt"
                value={form.excerpt || ""}
                onChange={handleChange}
                rows={2}
                maxLength={500}
                placeholder="A compelling 1-2 sentence preview of this article..."
                className={`${inputClasses} resize-none`}
              />
              <p className="text-[10px] text-neutral-500 font-mono mt-1 text-right">
                {(form.excerpt || "").length} / 500 characters
              </p>
            </div>

            {/* SEO SETTINGS Section */}
            <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-red" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    SEO Settings & Metadata
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">
                  Search engine ranking & snippet controls
                </span>
              </div>

              {/* SEO Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                    SEO Title (Optional)
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      (form.seoTitle || "").length > 60
                        ? "text-amber-400"
                        : (form.seoTitle || "").length >= 50
                        ? "text-emerald-400"
                        : "text-neutral-500"
                    }`}
                  >
                    {(form.seoTitle || "").length} / 60 chars{" "}
                    {(form.seoTitle || "").length >= 50 && (form.seoTitle || "").length <= 60 && "· Optimal"}
                  </span>
                </div>
                <input
                  name="seoTitle"
                  value={form.seoTitle || ""}
                  onChange={handleChange}
                  placeholder={form.title ? `Fallback: ${form.title}` : "e.g. 10 Essential Motion Design Tips for 2026"}
                  maxLength={300}
                  className={inputClasses}
                />
                <p className="text-[10px] text-neutral-500 font-mono mt-1">
                  Recommended length: 50–60 characters. If empty, automatically falls back to the article title.
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                    Meta Description (Optional)
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      (form.metaDescription || "").length > 160
                        ? "text-amber-400"
                        : (form.metaDescription || "").length >= 140
                        ? "text-emerald-400"
                        : "text-neutral-500"
                    }`}
                  >
                    {(form.metaDescription || "").length} / 160 chars{" "}
                    {(form.metaDescription || "").length >= 140 && (form.metaDescription || "").length <= 160 && "· Optimal"}
                  </span>
                </div>
                <textarea
                  name="metaDescription"
                  value={form.metaDescription || ""}
                  onChange={handleChange}
                  rows={3}
                  maxLength={1000}
                  placeholder={form.excerpt ? `Fallback: ${form.excerpt}` : "Summarize the article in 140–160 characters for search engine snippets..."}
                  className={`${inputClasses} resize-none`}
                />
                <p className="text-[10px] text-neutral-500 font-mono mt-1">
                  Recommended length: 140–160 characters. If empty, automatically falls back to the article excerpt.
                </p>
              </div>

              {/* Focus Keywords (Editorial Target Search Phrases) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                    Focus Keywords (Target Search Phrases)
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {(form.focusKeywords || []).length} keywords configured
                  </span>
                </div>

                {/* Focus Keywords Input & Add Button */}
                <div className="flex items-center gap-2 mb-2.5 w-full">
                  <div className="relative flex-1 min-w-0 group">
                    <Search className="w-4 h-4 text-neutral-400 group-focus-within:text-brand-red absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors shrink-0" />
                    <input
                      type="text"
                      value={focusKeywordInput}
                      onChange={handleFocusKeywordChange}
                      onPaste={handleFocusKeywordPaste}
                      onKeyDown={handleFocusKeywordKeyDown}
                      placeholder="Add focus keyword(s) separated by commas (press Enter or comma)..."
                      className={`${inputClasses} !pl-10 pr-3.5 min-w-0 h-10 sm:h-[42px]`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFocusKeyword}
                    disabled={!focusKeywordInput.trim()}
                    className="h-10 sm:h-[42px] px-3.5 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider text-white bg-white/[0.08] hover:bg-brand-red disabled:opacity-40 border border-white/10 rounded-lg cursor-pointer transition-colors shrink-0 whitespace-nowrap flex items-center justify-center"
                  >
                    Add Keyword
                  </button>
                </div>

                {/* Render Focus Keyword Chips */}
                {form.focusKeywords && form.focusKeywords.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-black/40 border border-white/[0.06] mb-1.5">
                    {form.focusKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-neutral-200 bg-amber-500/10 border border-amber-500/25 hover:border-amber-400 transition-colors"
                      >
                        <span className="text-amber-400 text-[10px] font-bold">KEYWORD</span>
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFocusKeyword(kw)}
                          className="text-neutral-400 hover:text-rose-400 p-0.5 rounded-full bg-transparent border-none cursor-pointer transition-colors"
                          aria-label={`Remove focus keyword ${kw}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}

                <p className="text-[10px] text-neutral-500 font-mono mt-1">
                  Target search phrases for editorial planning and content optimization. These are managed internally in the CMS and are distinct from public article tags.
                </p>
              </div>

              {/* Article Tags (Public Topics) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                    Article Tags (Public Topics)
                  </label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {(form.tags || []).length} tags configured
                  </span>
                </div>

                {/* Tags Input & Add Button */}
                <div className="flex items-center gap-2 mb-2.5 w-full">
                  <div className="relative flex-1 min-w-0 group">
                    <Tag className="w-4 h-4 text-neutral-400 group-focus-within:text-brand-red absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors shrink-0" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={handleTagChange}
                      onPaste={handleTagPaste}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="Add tag(s) separated by commas e.g. tutorial, video editing (press Enter)..."
                      className={`${inputClasses} !pl-10 pr-3.5 min-w-0 h-10 sm:h-[42px]`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    className="h-10 sm:h-[42px] px-3.5 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider text-white bg-white/[0.08] hover:bg-brand-red disabled:opacity-40 border border-white/10 rounded-lg cursor-pointer transition-colors shrink-0 whitespace-nowrap flex items-center justify-center"
                  >
                    Add Tag
                  </button>
                </div>

                {/* Render Tags */}
                {form.tags && form.tags.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-black/40 border border-white/[0.06] mb-1.5">
                    {form.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-neutral-200 bg-white/[0.06] border border-white/10 hover:border-brand-red/50 transition-colors"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-neutral-400 hover:text-rose-400 p-0.5 rounded-full bg-transparent border-none cursor-pointer transition-colors"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] font-mono text-neutral-500 italic">
                    No tags added yet. Topics classify your article and display at the bottom of the public article page.
                  </p>
                )}
              </div>

              {/* Google Search Snippet Preview */}
              <div className="pt-2 border-t border-white/[0.08]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-brand-red" />
                    Google Search Snippet Preview
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Simulated SERP display
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#080808] border border-white/10 space-y-1.5">
                  {/* SERP URL */}
                  <div className="flex items-center gap-1.5 text-xs font-sans text-neutral-400 truncate">
                    <span className="text-neutral-500">https://designtouchplus.com</span>
                    <span className="text-neutral-600">›</span>
                    <span className="text-neutral-500">blog</span>
                    <span className="text-neutral-600">›</span>
                    <span className="text-neutral-400 font-mono text-[11px]">{form.slug || "url-slug"}</span>
                  </div>

                  {/* SERP Title */}
                  <h4 className="text-base sm:text-lg font-medium text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1 font-sans">
                    {form.seoTitle?.trim() || form.title?.trim() || "Article Title"} | DesignTouch+
                  </h4>

                  {/* SERP Description */}
                  <p className="text-xs sm:text-sm text-[#bdc1c6] leading-relaxed line-clamp-2 font-sans">
                    {form.metaDescription?.trim() || form.excerpt?.trim() || "Your article meta description or excerpt will appear here in search engine results."}
                  </p>
                </div>

                <p className="text-[10px] font-mono text-neutral-500 mt-2">
                  Note: This is an approximate preview of how search engines may render the result.
                </p>
              </div>
            </div>

            {/* Content Editor with Toolbar & Live Preview Tab */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("WRITE")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                      activeTab === "WRITE"
                        ? "bg-brand-red text-white border-brand-red"
                        : "bg-white/[0.04] text-neutral-400 hover:text-white border-white/10"
                    }`}
                  >
                    Write Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("PREVIEW")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "PREVIEW"
                        ? "bg-brand-red text-white border-brand-red"
                        : "bg-white/[0.04] text-neutral-400 hover:text-white border-white/10"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Public Preview</span>
                  </button>
                </div>

                <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
                  Supports Headings, Multiple Images, Tables & Lists
                </span>
              </div>

              {activeTab === "WRITE" ? (
                <div className="space-y-2">
                  {/* Rich Text Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-white/[0.03] border border-white/10">
                    <button
                      type="button"
                      title="Heading 2 (## Title)"
                      onClick={() => insertSnippet("## ", "\n", "Heading 2")}
                      className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/10 border-none bg-transparent cursor-pointer transition-colors"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Heading 3 (### Subtitle)"
                      onClick={() => insertSnippet("### ", "\n", "Heading 3")}
                      className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/10 border-none bg-transparent cursor-pointer transition-colors"
                    >
                      <Heading3 className="w-4 h-4" />
                    </button>
                    <span className="w-px h-4 bg-white/10 mx-1" />
                    <button
                      type="button"
                      title="Bold (**text**)"
                      onClick={() => insertSnippet("**", "**", "bold text")}
                      className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/10 border-none bg-transparent cursor-pointer transition-colors"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Italic (*text*)"
                      onClick={() => insertSnippet("*", "*", "italic text")}
                      className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/10 border-none bg-transparent cursor-pointer transition-colors"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <span className="w-px h-4 bg-white/10 mx-1" />
                    <button
                      type="button"
                      title="Insert / Edit Hyperlink"
                      onClick={handleOpenLinkModal}
                      className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/10 border-none bg-transparent cursor-pointer transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Bulleted List"
                      onClick={() => insertSnippet("- ", "\n- Second item\n- Third item\n", "First item")}
                      className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/10 border-none bg-transparent cursor-pointer transition-colors"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Numbered List"
                      onClick={() => insertSnippet("1. ", "\n2. Second step\n3. Third step\n", "First step")}
                      className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/10 border-none bg-transparent cursor-pointer transition-colors"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Insert Table"
                      onClick={() =>
                        insertSnippet(
                          "\n| Feature | Starter | Professional |\n| --- | --- | --- |\n| 4K Resolution | Yes | Yes |\n| Unlimited Revisions | No | Yes |\n| Turnaround Time | 48 hrs | 24 hrs |\n\n"
                        )
                      }
                      className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/10 border-none bg-transparent cursor-pointer transition-colors flex items-center gap-1 text-xs font-mono"
                    >
                      <TableIcon className="w-4 h-4" />
                      <span>Table</span>
                    </button>

                    <span className="w-px h-4 bg-white/10 mx-1" />

                    {/* Method A: Upload Image from Computer (Cloudinary) */}
                    <button
                      type="button"
                      title="Upload local image(s) to Cloudinary and insert at cursor"
                      onClick={() => {
                        updateCursor();
                        contentImageFileInputRef.current?.click();
                      }}
                      disabled={uploadingContentImages}
                      className="px-2.5 py-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/10 border border-white/10 bg-white/[0.04] cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-mono font-medium disabled:opacity-60"
                    >
                      {uploadingContentImages ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-red" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-brand-red" />
                      )}
                      <span>{uploadingContentImages ? "Uploading..." : "Upload Image"}</span>
                    </button>

                    {/* Method B: Insert Image using URL */}
                    <button
                      type="button"
                      title="Insert image by URL with Alt Text"
                      onClick={handleOpenImageUrlModal}
                      className="px-2.5 py-1.5 rounded text-neutral-300 hover:text-white hover:bg-white/10 border border-white/10 bg-white/[0.04] cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-mono font-medium"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-brand-red" />
                      <span>Image URL</span>
                    </button>

                    {/* Hidden multi-image file input for content images */}
                    <input
                      ref={contentImageFileInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      onChange={handleContentImageFilesSelect}
                    />
                  </div>

                  {/* Upload Progress Banner */}
                  {uploadingContentImages && (
                    <div className="flex items-center gap-2.5 p-3 bg-brand-red/10 border border-brand-red/30 rounded-lg text-xs font-mono text-brand-red animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>{contentImageProgress || "Uploading images to Cloudinary..."}</span>
                    </div>
                  )}

                  {/* Textarea with rich-paste support */}
                  <textarea
                    ref={textareaRef}
                    name="content"
                    value={form.content}
                    onChange={(e) => {
                      handleChange(e);
                      updateCursor();
                    }}
                    onPaste={handleContentPaste}
                    onSelect={updateCursor}
                    onClick={updateCursor}
                    onKeyUp={updateCursor}
                    onFocus={updateCursor}
                    required
                    rows={16}
                    placeholder="Write article in markdown format. Use the toolbar above to insert headings, bullet points, tables, and images at the exact cursor position. Pasting from Google Docs, Word, or web pages preserves hyperlinks and formatting automatically."
                    className={`${inputClasses} font-mono text-[13px] leading-relaxed resize-y min-h-[300px]`}
                  />
                </div>
              ) : (
                /* Live Public Preview */
                <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8 min-h-[360px] max-h-[550px] overflow-y-auto">
                  <div className="max-w-3xl mx-auto space-y-6">
                    {form.coverImageUrl && (
                      <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-white/10 bg-white/[0.03] shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.coverImageUrl}
                          alt={form.title || "Preview"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black uppercase text-white leading-tight">
                      {form.title || "Untitled Article"}
                    </h1>
                    {form.excerpt && (
                      <p className="text-neutral-300 text-base leading-relaxed border-l-2 border-brand-red pl-4 italic">
                        {form.excerpt}
                      </p>
                    )}
                    <BlogContentRenderer content={form.content || "*No content written yet.*"} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploadingCoverImage || uploadingContentImages}
                className="px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-brand-red hover:bg-[#dc2626] disabled:opacity-60 border-none rounded-lg cursor-pointer transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.3)] flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <span>{isEditing ? "Update Article" : "Save & Publish"}</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Modal: Insert / Edit Hyperlink */}
        {showLinkModal && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111111] border border-white/15 w-full max-w-md p-6 rounded-xl shadow-2xl relative">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white bg-transparent border-none cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold uppercase tracking-tight text-white">
                    Insert / Edit Hyperlink
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Add or modify a clickable web link in your article
                  </p>
                </div>
              </div>

              {linkError && (
                <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/25 rounded-lg text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{linkError}</span>
                </div>
              )}

              <form onSubmit={handleConfirmInsertLink} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                    Link Text / Anchor Text *
                  </label>
                  <input
                    type="text"
                    value={linkTextInput}
                    onChange={(e) => setLinkTextInput(e.target.value)}
                    placeholder="e.g. Video Editing Guide or Portfolio"
                    required
                    className={inputClasses}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                    Destination URL *
                  </label>
                  <input
                    type="text"
                    value={linkUrlInput}
                    onChange={(e) => setLinkUrlInput(e.target.value)}
                    placeholder="https://example.com/guide or /portfolio"
                    required
                    className={inputClasses}
                  />
                  <p className="text-[10px] text-neutral-500 font-mono mt-1">
                    Supports https://, http://, and internal relative paths (e.g. /portfolio, /blog).
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="px-4 py-2 text-xs font-mono text-neutral-400 hover:text-white bg-white/[0.04] border border-white/10 rounded-lg cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white bg-brand-red hover:bg-[#dc2626] border-none rounded-lg cursor-pointer transition-colors"
                  >
                    Insert Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Insert Image via URL */}
        {showImageUrlModal && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111111] border border-white/15 w-full max-w-md p-6 rounded-xl shadow-2xl relative">
              <button
                type="button"
                onClick={() => setShowImageUrlModal(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white bg-transparent border-none cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold uppercase tracking-tight text-white">
                    Insert Image via URL
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Insert an image with accessible alt text at the cursor position
                  </p>
                </div>
              </div>

              {imageUrlError && (
                <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/25 rounded-lg text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{imageUrlError}</span>
                </div>
              )}

              <form onSubmit={handleConfirmInsertImageUrl} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    required
                    className={inputClasses}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1.5">
                    Alt Text (for Accessibility & SEO)
                  </label>
                  <input
                    type="text"
                    value={imageAltInput}
                    onChange={(e) => setImageAltInput(e.target.value)}
                    placeholder="e.g. 4K timeline color grading interface in DaVinci Resolve"
                    className={inputClasses}
                  />
                </div>

                {imageUrlInput.trim().startsWith("http") && (
                  <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40 aspect-[16/9] max-h-36 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrlInput.trim()}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowImageUrlModal(false)}
                    className="px-4 py-2 text-xs font-mono text-neutral-400 hover:text-white bg-white/[0.04] border border-white/10 rounded-lg cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white bg-brand-red hover:bg-[#dc2626] border-none rounded-lg cursor-pointer transition-colors"
                  >
                    Insert Image
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
