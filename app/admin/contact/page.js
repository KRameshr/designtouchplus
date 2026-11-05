"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Save,
  RotateCcw,
  Upload,
  Trash2,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  ImageIcon,
  HelpCircle,
  Plus,
  Pencil,
  ArrowUp,
  ArrowDown,
  Mail,
  Phone,
  MapPin,
  Clock,
  Share2,
  ExternalLink,
} from "lucide-react";
import {
  getContactPageContent,
  updateContactPageContent,
  deleteContactHeroBanner,
  uploadContactHeroImage,
  getFaqsAdmin,
  toggleFaqActive,
  reorderFaqs,
  deleteFaq,
} from "@/lib/api";
import FaqModal from "@/components/admin/FaqModal";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import SocialLinkModal from "@/components/admin/SocialLinkModal";
import {
  SUPPORTED_SOCIAL_PLATFORMS,
  DEFAULT_SOCIAL_LINKS,
  parseSocialLinks,
  getSocialPlatformIcon,
  validateSocialUrl,
  isSameSocialPlatform,
} from "@/lib/socialPlatforms";

const DEFAULT_CONTENT = {
  heroEyebrow: "Contact Us",
  heroHeadlineLine1: "Let's Create Something",
  heroHeadlineHighlight: "Amazing.",
  heroDescription:
    "Have a project in mind? We'd love to hear about it. Fill out the form or reach out to us directly.",
  badge1Title: "Fast Response",
  badge1Subtitle: "We reply within 24 hours",
  badge2Title: "Project Focused",
  badge2Subtitle: "Solutions tailored for you",
  heroBannerImageUrl: "",
  heroBannerImagePublicId: "",
  heroBannerImageAlt: "DesignTouch+ Creative Workstation",
  heroBannerObjectPosition: "center",

  // Direct Contact Information
  directContactEyebrow: "GET IN TOUCH",
  directContactHeading: "DIRECT CONTACT",
  directContactDescription:
    "Prefer direct communication? Reach out to our team via email, phone, or WhatsApp.",
  directContactEmailLabel: "EMAIL US",
  directContactEmail: "hello@designtouchplus.com",
  directContactEmailSub: "We'll reply within 24 hours",
  directContactPhoneLabel: "CALL / WHATSAPP",
  directContactPhone: "+91 12345 67890",
  directContactPhoneSub: "Mon - Sat: 10:00 AM - 7:00 PM",
  directContactLocationLabel: "OUR LOCATION",
  directContactLocation: "India · Remote Worldwide",
  directContactLocationSub: "We work with clients globally",
  directContactWorkingHoursLabel: "WORKING HOURS",
  directContactWorkingHours: "Monday - Saturday, 10:00 AM - 7:00 PM (IST)",
  directContactWorkingHoursSub: "",
  directContactEmailEnabled: true,
  directContactPhoneEnabled: true,
  directContactLocationEnabled: true,
  directContactWorkingHoursEnabled: true,
  socialLinks: DEFAULT_SOCIAL_LINKS,
};

const POSITION_OPTIONS = [
  { value: "center", label: "Center" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "center right", label: "Center Right" },
  { value: "center left", label: "Center Left" },
];

const TABS = [
  { id: "HERO", label: "Hero Banner", icon: Sparkles },
  { id: "DIRECT_CONTACT", label: "Direct Contact", icon: Phone },
  { id: "FAQS", label: "Contact FAQs", icon: HelpCircle },
];

export default function AdminContactPage() {
  const [activeTab, setActiveTab] = useState("HERO");

  // Hero content state
  const [form, setForm] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSaved, setLastSaved] = useState("");

  // FAQs state
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [faqModal, setFaqModal] = useState({ open: false, faq: null });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    loading: false,
    onConfirm: null,
  });

  // Direct Contact optional items & Social Links management state
  const [isWorkingHoursDeleted, setIsWorkingHoursDeleted] = useState(false);
  const [socialModal, setSocialModal] = useState({ open: false, link: null });

  const fileInputRef = useRef(null);

  // Load hero and direct contact content
  const loadContent = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getContactPageContent();
      if (data) {
        setForm({
          heroEyebrow: data.heroEyebrow || DEFAULT_CONTENT.heroEyebrow,
          heroHeadlineLine1:
            data.heroHeadlineLine1 || DEFAULT_CONTENT.heroHeadlineLine1,
          heroHeadlineHighlight:
            data.heroHeadlineHighlight !== undefined &&
            data.heroHeadlineHighlight !== null
              ? data.heroHeadlineHighlight
              : DEFAULT_CONTENT.heroHeadlineHighlight,
          heroDescription:
            data.heroDescription || DEFAULT_CONTENT.heroDescription,
          badge1Title: data.badge1Title || DEFAULT_CONTENT.badge1Title,
          badge1Subtitle: data.badge1Subtitle || DEFAULT_CONTENT.badge1Subtitle,
          badge2Title: data.badge2Title || DEFAULT_CONTENT.badge2Title,
          badge2Subtitle: data.badge2Subtitle || DEFAULT_CONTENT.badge2Subtitle,
          heroBannerImageUrl: data.heroBannerImageUrl || "",
          heroBannerImagePublicId: data.heroBannerImagePublicId || "",
          heroBannerImageAlt:
            data.heroBannerImageAlt || DEFAULT_CONTENT.heroBannerImageAlt,
          heroBannerObjectPosition:
            data.heroBannerObjectPosition ||
            DEFAULT_CONTENT.heroBannerObjectPosition,
          directContactEyebrow:
            data.directContactEyebrow || DEFAULT_CONTENT.directContactEyebrow,
          directContactHeading:
            data.directContactHeading || DEFAULT_CONTENT.directContactHeading,
          directContactDescription:
            data.directContactDescription !== undefined &&
            data.directContactDescription !== null
              ? data.directContactDescription
              : DEFAULT_CONTENT.directContactDescription,
          directContactEmailLabel:
            data.directContactEmailLabel ||
            DEFAULT_CONTENT.directContactEmailLabel,
          directContactEmail:
            data.directContactEmail || DEFAULT_CONTENT.directContactEmail,
          directContactEmailSub:
            data.directContactEmailSub !== undefined &&
            data.directContactEmailSub !== null
              ? data.directContactEmailSub
              : DEFAULT_CONTENT.directContactEmailSub,
          directContactPhoneLabel:
            data.directContactPhoneLabel ||
            DEFAULT_CONTENT.directContactPhoneLabel,
          directContactPhone:
            data.directContactPhone || DEFAULT_CONTENT.directContactPhone,
          directContactPhoneSub:
            data.directContactPhoneSub !== undefined &&
            data.directContactPhoneSub !== null
              ? data.directContactPhoneSub
              : DEFAULT_CONTENT.directContactPhoneSub,
          directContactLocationLabel:
            data.directContactLocationLabel ||
            DEFAULT_CONTENT.directContactLocationLabel,
          directContactLocation:
            data.directContactLocation || DEFAULT_CONTENT.directContactLocation,
          directContactLocationSub:
            data.directContactLocationSub !== undefined &&
            data.directContactLocationSub !== null
              ? data.directContactLocationSub
              : DEFAULT_CONTENT.directContactLocationSub,
          directContactWorkingHoursLabel:
            data.directContactWorkingHoursLabel ||
            DEFAULT_CONTENT.directContactWorkingHoursLabel,
          directContactWorkingHours:
            data.directContactWorkingHours ||
            DEFAULT_CONTENT.directContactWorkingHours,
          directContactWorkingHoursSub:
            data.directContactWorkingHoursSub !== undefined &&
            data.directContactWorkingHoursSub !== null
              ? data.directContactWorkingHoursSub
              : DEFAULT_CONTENT.directContactWorkingHoursSub,
          directContactEmailEnabled:
            data.directContactEmailEnabled !== undefined
              ? Boolean(data.directContactEmailEnabled)
              : true,
          directContactPhoneEnabled:
            data.directContactPhoneEnabled !== undefined
              ? Boolean(data.directContactPhoneEnabled)
              : true,
          directContactLocationEnabled:
            data.directContactLocationEnabled !== undefined
              ? Boolean(data.directContactLocationEnabled)
              : true,
          directContactWorkingHoursEnabled:
            data.directContactWorkingHoursEnabled !== undefined
              ? Boolean(data.directContactWorkingHoursEnabled)
              : true,
          socialLinks: parseSocialLinks(data.socialLinks),
        });

        setIsWorkingHoursDeleted(
          data?.directContactWorkingHours === "" &&
            data?.directContactWorkingHoursEnabled === false
        );
      }
    } catch (err) {
      setError(
        "Failed to load contact settings: " + (err.message || "Unknown error"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load General / Contact FAQs
  const loadFaqs = useCallback(async () => {
    setLoadingFaqs(true);
    try {
      const data = await getFaqsAdmin("GENERAL");
      setFaqs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load Contact FAQs:", err);
    } finally {
      setLoadingFaqs(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
    loadFaqs();
  }, [loadContent, loadFaqs]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Image Upload Handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      setError(
        "Invalid file type. Please upload a PNG, JPG, JPEG, WebP, or SVG image.",
      );
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setError("Image size exceeds the 10 MB limit.");
      return;
    }

    setUploadingImage(true);
    setError("");
    setSuccess("");

    try {
      const res = await uploadContactHeroImage(file);
      const uploadedUrl = res?.url || res?.secureUrl || res?.imageUrl;
      const publicId = res?.publicId || "";

      if (!uploadedUrl) {
        throw new Error(
          res?.message || "Upload completed but no image URL was returned.",
        );
      }

      setForm((prev) => ({
        ...prev,
        heroBannerImageUrl: uploadedUrl,
        heroBannerImagePublicId: publicId,
      }));

      setSuccess(
        "Workstation image uploaded successfully! Click 'Save Changes' to publish.",
      );
    } catch (err) {
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete Image Handler
  const handleDeleteImage = async () => {
    if (
      !confirm(
        "Remove the custom workstation image and revert to the default gradient placeholder?",
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (form.heroBannerImagePublicId) {
        await deleteContactHeroBanner(form.heroBannerImagePublicId).catch(
          () => {},
        );
      }

      setForm((prev) => ({
        ...prev,
        heroBannerImageUrl: "",
        heroBannerImagePublicId: "",
      }));

      setSuccess(
        "Workstation image removed. Click 'Save Changes' to update the public site.",
      );
    } catch (err) {
      setError(err.message || "Failed to remove workstation image.");
    } finally {
      setSaving(false);
    }
  };

  // Contact Channels handlers
  const handleToggleContactChannel = (channelKey) => {
    setForm((prev) => ({
      ...prev,
      [channelKey]: !prev[channelKey],
    }));
  };

  const handleDeleteWorkingHours = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Working Hours Channel?",
      message:
        "Are you sure you want to delete the optional Working Hours channel? It will be removed from your public pages until re-added.",
      loading: false,
      onConfirm: () => {
        setIsWorkingHoursDeleted(true);
        setForm((prev) => ({
          ...prev,
          directContactWorkingHours: "",
          directContactWorkingHoursEnabled: false,
        }));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleAddWorkingHours = () => {
    setIsWorkingHoursDeleted(false);
    setForm((prev) => ({
      ...prev,
      directContactWorkingHours:
        DEFAULT_CONTENT.directContactWorkingHours,
      directContactWorkingHoursLabel:
        prev.directContactWorkingHoursLabel ||
        DEFAULT_CONTENT.directContactWorkingHoursLabel,
      directContactWorkingHoursEnabled: true,
    }));
  };

  // Social Media handlers
  const handleToggleSocialLink = (id) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    }));
  };

  const handleDeleteSocialLink = (id) => {
    const target = (form.socialLinks || []).find((l) => l.id === id);
    setConfirmModal({
      isOpen: true,
      title: `Delete ${target?.platform || "Social"} Link?`,
      message: `Are you sure you want to delete the ${target?.platform || "social"} link? This will remove it from the footer and contact page.`,
      loading: false,
      onConfirm: () => {
        setForm((prev) => ({
          ...prev,
          socialLinks: (prev.socialLinks || []).filter((item) => item.id !== id),
        }));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSaveSocialLink = (savedLink) => {
    setForm((prev) => {
      const links = Array.isArray(prev.socialLinks) ? [...prev.socialLinks] : [];
      const existingIndex = links.findIndex((l) => l.id === savedLink.id);
      if (existingIndex >= 0) {
        links[existingIndex] = savedLink;
      } else {
        links.push(savedLink);
      }
      return { ...prev, socialLinks: links };
    });
  };

  // Save Contact Page Content Form (Hero & Direct Contact)
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Required channel validation
    if (
      form.directContactEmailEnabled &&
      (!form.directContactEmail || !form.directContactEmail.trim())
    ) {
      setError("Please provide an email address for Direct Contact.");
      return;
    }
    if (
      form.directContactEmail &&
      !/\S+@\S+\.\S+/.test(form.directContactEmail.trim())
    ) {
      setError("Please provide a valid email address for Direct Contact.");
      return;
    }
    if (
      form.directContactPhoneEnabled &&
      (!form.directContactPhone || !form.directContactPhone.trim())
    ) {
      setError("Please provide a phone number for Direct Contact.");
      return;
    }
    if (
      form.directContactLocationEnabled &&
      (!form.directContactLocation || !form.directContactLocation.trim())
    ) {
      setError("Please provide a location / region for Direct Contact.");
      return;
    }

    // Social media links validation
    if (Array.isArray(form.socialLinks)) {
      const seenPlatforms = [];
      for (const link of form.socialLinks) {
        if (!link.url || !link.url.trim()) {
          setError(`Please provide a valid URL for ${link.platform}.`);
          return;
        }
        if (!validateSocialUrl(link.url.trim(), link.platform)) {
          if (isSameSocialPlatform(link.platform, "x")) {
            setError(
              `Invalid URL for ${link.platform}. Must be a valid profile URL, e.g. https://x.com/username or https://twitter.com/username`
            );
          } else {
            setError(
              `Invalid URL for ${link.platform}. Must start with http:// or https://`
            );
          }
          return;
        }
        if (seenPlatforms.some((p) => isSameSocialPlatform(p, link.platform))) {
          setError(
            `Duplicate entry for ${link.platform}. Each platform can only be added once.`
          );
          return;
        }
        seenPlatforms.push(link.platform);
      }
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        heroEyebrow: form.heroEyebrow.trim(),
        heroHeadlineLine1: form.heroHeadlineLine1.trim(),
        heroHeadlineHighlight: form.heroHeadlineHighlight.trim(),
        heroDescription: form.heroDescription.trim(),
        badge1Title: form.badge1Title.trim(),
        badge1Subtitle: form.badge1Subtitle.trim(),
        badge2Title: form.badge2Title.trim(),
        badge2Subtitle: form.badge2Subtitle.trim(),
        heroBannerImageUrl: form.heroBannerImageUrl || "",
        heroBannerImagePublicId: form.heroBannerImagePublicId || "",
        heroBannerImageAlt:
          form.heroBannerImageAlt.trim() || DEFAULT_CONTENT.heroBannerImageAlt,
        heroBannerObjectPosition: form.heroBannerObjectPosition || "center",

        directContactEyebrow:
          form.directContactEyebrow.trim() ||
          DEFAULT_CONTENT.directContactEyebrow,
        directContactHeading:
          form.directContactHeading.trim() ||
          DEFAULT_CONTENT.directContactHeading,
        directContactDescription: form.directContactDescription.trim(),
        directContactEmailLabel:
          form.directContactEmailLabel.trim() ||
          DEFAULT_CONTENT.directContactEmailLabel,
        directContactEmail: form.directContactEmail.trim(),
        directContactEmailSub: form.directContactEmailSub.trim(),
        directContactPhoneLabel:
          form.directContactPhoneLabel.trim() ||
          DEFAULT_CONTENT.directContactPhoneLabel,
        directContactPhone: form.directContactPhone.trim(),
        directContactPhoneSub: form.directContactPhoneSub.trim(),
        directContactLocationLabel:
          form.directContactLocationLabel.trim() ||
          DEFAULT_CONTENT.directContactLocationLabel,
        directContactLocation: form.directContactLocation.trim(),
        directContactLocationSub: form.directContactLocationSub.trim(),
        directContactWorkingHoursLabel:
          form.directContactWorkingHoursLabel.trim() ||
          DEFAULT_CONTENT.directContactWorkingHoursLabel,
        directContactWorkingHours: isWorkingHoursDeleted
          ? ""
          : form.directContactWorkingHours.trim(),
        directContactWorkingHoursSub: isWorkingHoursDeleted
          ? ""
          : (form.directContactWorkingHoursSub || "").trim(),
        directContactEmailEnabled: form.directContactEmailEnabled !== false,
        directContactPhoneEnabled: form.directContactPhoneEnabled !== false,
        directContactLocationEnabled:
          form.directContactLocationEnabled !== false,
        directContactWorkingHoursEnabled:
          !isWorkingHoursDeleted &&
          form.directContactWorkingHoursEnabled !== false,
        socialLinks: JSON.stringify(form.socialLinks || []),
      };

      const updated = await updateContactPageContent(payload);

      if (updated) {
        setForm((prev) => ({
          ...prev,
          heroEyebrow: updated.heroEyebrow || payload.heroEyebrow,
          heroHeadlineLine1:
            updated.heroHeadlineLine1 || payload.heroHeadlineLine1,
          heroHeadlineHighlight:
            updated.heroHeadlineHighlight !== undefined
              ? updated.heroHeadlineHighlight
              : payload.heroHeadlineHighlight,
          heroDescription: updated.heroDescription || payload.heroDescription,
          badge1Title: updated.badge1Title || payload.badge1Title,
          badge1Subtitle: updated.badge1Subtitle || payload.badge1Subtitle,
          badge2Title: updated.badge2Title || payload.badge2Title,
          badge2Subtitle: updated.badge2Subtitle || payload.badge2Subtitle,
          heroBannerImageUrl: updated.heroBannerImageUrl || "",
          heroBannerImagePublicId: updated.heroBannerImagePublicId || "",
          heroBannerImageAlt:
            updated.heroBannerImageAlt || payload.heroBannerImageAlt,
          heroBannerObjectPosition:
            updated.heroBannerObjectPosition ||
            payload.heroBannerObjectPosition,

          directContactEyebrow:
            updated.directContactEyebrow || payload.directContactEyebrow,
          directContactHeading:
            updated.directContactHeading || payload.directContactHeading,
          directContactDescription:
            updated.directContactDescription !== undefined
              ? updated.directContactDescription
              : payload.directContactDescription,
          directContactEmailLabel:
            updated.directContactEmailLabel || payload.directContactEmailLabel,
          directContactEmail:
            updated.directContactEmail || payload.directContactEmail,
          directContactEmailSub:
            updated.directContactEmailSub || payload.directContactEmailSub,
          directContactPhoneLabel:
            updated.directContactPhoneLabel || payload.directContactPhoneLabel,
          directContactPhone:
            updated.directContactPhone || payload.directContactPhone,
          directContactPhoneSub:
            updated.directContactPhoneSub || payload.directContactPhoneSub,
          directContactLocationLabel:
            updated.directContactLocationLabel ||
            payload.directContactLocationLabel,
          directContactLocation:
            updated.directContactLocation || payload.directContactLocation,
          directContactLocationSub:
            updated.directContactLocationSub ||
            payload.directContactLocationSub,
          directContactWorkingHoursLabel:
            updated.directContactWorkingHoursLabel ||
            payload.directContactWorkingHoursLabel,
          directContactWorkingHours:
            updated.directContactWorkingHours ||
            payload.directContactWorkingHours,
          directContactWorkingHoursSub:
            updated.directContactWorkingHoursSub ||
            payload.directContactWorkingHoursSub,
          directContactEmailEnabled:
            updated.directContactEmailEnabled !== false,
          directContactPhoneEnabled:
            updated.directContactPhoneEnabled !== false,
          directContactLocationEnabled:
            updated.directContactLocationEnabled !== false,
          directContactWorkingHoursEnabled:
            updated.directContactWorkingHoursEnabled !== false,
          socialLinks: parseSocialLinks(
            updated.socialLinks || payload.socialLinks,
          ),
        }));
      }

      setLastSaved(new Date().toLocaleTimeString());
      setSuccess("Contact settings saved and published successfully!");
    } catch (err) {
      setError(err.message || "Failed to save Contact page settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm("Reset all fields to default Contact content?")) {
      setForm(DEFAULT_CONTENT);
      setSuccess("Reset to default copy. Click 'Save Changes' to persist.");
    }
  };

  // FAQ Handlers
  const handleToggleFaqActive = async (id) => {
    try {
      const updated = await toggleFaqActive(id);
      setFaqs((prev) => prev.map((f) => (f.id === id ? updated : f)));
      setSuccess(
        `FAQ ${updated.isActive ? "activated" : "deactivated"} successfully.`,
      );
    } catch (err) {
      setError(
        "Failed to toggle FAQ status: " + (err.message || "Unknown error"),
      );
    }
  };

  const handleMoveFaq = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const reordered = [...faqs];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setFaqs(reordered);

    try {
      const result = await reorderFaqs(reordered.map((f) => f.id));
      if (Array.isArray(result)) {
        setFaqs(result.filter((f) => f.category === "GENERAL"));
      }
      setSuccess("FAQ order updated successfully.");
    } catch (err) {
      setError(
        "Failed to save reordered FAQs: " + (err.message || "Unknown error"),
      );
      loadFaqs();
    }
  };

  const handleDeleteFaq = (faq) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete FAQ",
      message: `Are you sure you want to delete "${faq.question}"? This action cannot be undone.`,
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, loading: true }));
          await deleteFaq(faq.id);
          setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
          setSuccess("FAQ deleted successfully.");
          setConfirmModal({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
            loading: false,
          });
        } catch (err) {
          setError("Failed to delete FAQ: " + (err.message || "Unknown error"));
          setConfirmModal({
            isOpen: false,
            title: "",
            message: "",
            onConfirm: null,
            loading: false,
          });
        }
      },
    });
  };

  const handleFaqSaved = () => {
    setFaqModal({ open: false, faq: null });
    setSuccess("FAQ saved successfully.");
    loadFaqs();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
        <span className="text-xs font-mono uppercase tracking-wider">
          Loading Contact Page CMS...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-16">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2 h-2 bg-brand-red inline-block shrink-0"
              aria-hidden="true"
            />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-400">
              Contact Management
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase font-display tracking-tight text-white">
            Contact Page CMS
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Customize the public Contact page hero copy, direct contact details,
            and frequently asked questions.
          </p>
        </div>

        {(activeTab === "HERO" || activeTab === "DIRECT_CONTACT") && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={saving || uploadingImage}
              className="inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white text-xs font-mono font-semibold uppercase tracking-wider px-4 py-2.5 rounded-none border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || uploadingImage}
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-none border-none cursor-pointer transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.3)] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === "FAQS" && (
          <button
            type="button"
            onClick={() => setFaqModal({ open: true, faq: null })}
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-none border-none cursor-pointer transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.25)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add FAQ</span>
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 p-1 bg-[#0d0d0d] border border-white/10 mb-6 rounded-none">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
                setError("");
                setSuccess("");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border rounded-none ${
                isActive
                  ? "bg-brand-red text-white border-brand-red font-bold shadow-[0_2px_8px_rgba(239,68,68,0.25)]"
                  : "bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              {id === "FAQS" && faqs.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-white/10 text-white rounded-none text-[10px] font-mono">
                  {faqs.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status Messages */}
      {success && (
        <div className="mb-6 flex items-start gap-3 bg-brand-green/10 border border-brand-green/30 p-4 rounded-none text-brand-green text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{success}</span>
            {lastSaved && (
              <span className="text-neutral-400 ml-2">({lastSaved})</span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-3 bg-brand-red/10 border border-brand-red/30 p-4 rounded-none text-brand-red text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* TAB 1: HERO BANNER MANAGEMENT */}
      {activeTab === "HERO" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Controls Column */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            {/* Card 1: Headline & Subtitle */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-none p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                <Sparkles className="w-4 h-4 text-brand-red" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Headline & Description
                </h2>
              </div>

              {/* Eyebrow Label */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Eyebrow Label{" "}
                  <span className="text-neutral-600">
                    ({form.heroEyebrow.length}/150)
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={150}
                  value={form.heroEyebrow}
                  onChange={(e) => handleChange("heroEyebrow", e.target.value)}
                  placeholder="e.g. Contact Us"
                  className="w-full bg-black/60 border border-white/10 rounded-none px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-red font-mono"
                />
              </div>

              {/* Main Headline Line 1 */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Main Headline Text{" "}
                  <span className="text-neutral-600">
                    ({form.heroHeadlineLine1.length}/150)
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={150}
                  value={form.heroHeadlineLine1}
                  onChange={(e) =>
                    handleChange("heroHeadlineLine1", e.target.value)
                  }
                  placeholder="e.g. Let's Create Something"
                  className="w-full bg-black/60 border border-white/10 rounded-none px-3.5 py-2.5 text-xs text-white font-display font-bold uppercase outline-none focus:border-brand-red"
                />
              </div>

              {/* Headline Highlight (Gradient Accent) */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Headline Highlight (Red-to-Green Gradient){" "}
                  <span className="text-neutral-600">
                    ({form.heroHeadlineHighlight.length}/150)
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={150}
                  value={form.heroHeadlineHighlight}
                  onChange={(e) =>
                    handleChange("heroHeadlineHighlight", e.target.value)
                  }
                  placeholder="e.g. Amazing."
                  className="w-full bg-black/60 border border-white/10 rounded-none px-3.5 py-2.5 text-xs text-white font-display font-bold uppercase outline-none focus:border-brand-red"
                />
              </div>

              {/* Hero Description */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Hero Description{" "}
                  <span className="text-neutral-600">
                    ({form.heroDescription.length}/500)
                  </span>
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={form.heroDescription}
                  onChange={(e) =>
                    handleChange("heroDescription", e.target.value)
                  }
                  placeholder="Have a project in mind? We'd love to hear about it..."
                  className="w-full bg-black/60 border border-white/10 rounded-none px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-red font-mono leading-relaxed"
                />
              </div>
            </div>

            {/* Card 2: Benefit Badges */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-none p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                <Zap className="w-4 h-4 text-brand-green" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Hero Benefit Badges
                </h2>
              </div>

              {/* Badge 1: Fast Response */}
              <div className="p-4 rounded-none bg-black/40 border border-white/5 space-y-3">
                <p className="text-[11px] font-mono text-brand-red font-bold uppercase tracking-wider">
                  Badge 1 &bull; Fast Response
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      value={form.badge1Title}
                      onChange={(e) =>
                        handleChange("badge1Title", e.target.value)
                      }
                      placeholder="Fast Response"
                      className="w-full bg-black/60 border border-white/10 rounded-none px-3 py-2 text-xs text-white outline-none focus:border-brand-red font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      maxLength={120}
                      value={form.badge1Subtitle}
                      onChange={(e) =>
                        handleChange("badge1Subtitle", e.target.value)
                      }
                      placeholder="We reply within 24 hours"
                      className="w-full bg-black/60 border border-white/10 rounded-none px-3 py-2 text-xs text-white outline-none focus:border-brand-red font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Badge 2: Project Focused */}
              <div className="p-4 rounded-none bg-black/40 border border-white/5 space-y-3">
                <p className="text-[11px] font-mono text-brand-green font-bold uppercase tracking-wider">
                  Badge 2 &bull; Project Focused
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      value={form.badge2Title}
                      onChange={(e) =>
                        handleChange("badge2Title", e.target.value)
                      }
                      placeholder="Project Focused"
                      className="w-full bg-black/60 border border-white/10 rounded-none px-3 py-2 text-xs text-white outline-none focus:border-brand-red font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      maxLength={120}
                      value={form.badge2Subtitle}
                      onChange={(e) =>
                        handleChange("badge2Subtitle", e.target.value)
                      }
                      placeholder="Solutions tailored for you"
                      className="w-full bg-black/60 border border-white/10 rounded-none px-3 py-2 text-xs text-white outline-none focus:border-brand-red font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Workstation Banner Image Upload */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-none p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                <ImageIcon className="w-4 h-4 text-brand-red" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Hero Workstation Banner Image (1920 &times; 800)
                </h2>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {form.heroBannerImageUrl ? (
                <div className="space-y-4">
                  <div className="relative w-full aspect-[2.4/1] rounded-none overflow-hidden border border-white/10 bg-black">
                    <Image
                      src={form.heroBannerImageUrl}
                      alt={form.heroBannerImageAlt || "Hero Workstation Image"}
                      fill
                      className="object-cover"
                      style={{
                        objectPosition:
                          form.heroBannerObjectPosition || "center",
                      }}
                      sizes="(max-width: 1024px) 100vw, 600px"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        disabled={saving}
                        className="inline-flex items-center gap-1 bg-red-600/80 hover:bg-red-600 text-white px-2 py-1 rounded-none text-[10px] font-mono transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="inline-flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-mono px-3.5 py-2 rounded-none border border-white/10 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Replace Image
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/15 hover:border-brand-red/50 rounded-none p-6 text-center cursor-pointer transition-colors bg-black/30 hover:bg-black/50"
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
                      <span className="text-xs font-mono text-neutral-400">
                        Uploading to Cloudinary...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-neutral-400" />
                      <p className="text-xs font-mono text-white font-semibold">
                        Click to upload workstation image
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        PNG, JPG, WebP, SVG up to 10 MB (1920 &times; 800
                        recommended)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Image Alt & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Image Alt Text
                  </label>
                  <input
                    type="text"
                    maxLength={255}
                    value={form.heroBannerImageAlt}
                    onChange={(e) =>
                      handleChange("heroBannerImageAlt", e.target.value)
                    }
                    placeholder="DesignTouch+ Creative Workstation"
                    className="w-full bg-black/60 border border-white/10 rounded-none px-3 py-2 text-xs text-white outline-none focus:border-brand-red font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Object Position
                  </label>
                  <select
                    value={form.heroBannerObjectPosition || "center"}
                    onChange={(e) =>
                      handleChange("heroBannerObjectPosition", e.target.value)
                    }
                    className="w-full bg-black/60 border border-white/10 rounded-none px-3 py-2 text-xs text-white outline-none focus:border-brand-red font-mono"
                  >
                    {POSITION_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-neutral-900 text-white"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-green" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Live Public Hero Preview
                </h2>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                Exact Facsimile
              </span>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-none p-6 text-white space-y-6 shadow-2xl overflow-hidden">
              {/* Eyebrow */}
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-none bg-brand-red" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  {form.heroEyebrow || "Contact Us"}
                </span>
              </div>

              {/* Headline */}
              <h3 className="text-xl sm:text-2xl font-black uppercase leading-tight">
                {form.heroHeadlineLine1 || "Let's Create Something"}{" "}
                {form.heroHeadlineHighlight && (
                  <span className="bg-gradient-to-r from-brand-red to-brand-green bg-clip-text text-transparent">
                    {form.heroHeadlineHighlight}
                  </span>
                )}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                {form.heroDescription ||
                  "Have a project in mind? We'd love to hear about it. Fill out the form or reach out to us directly."}
              </p>

              {/* Badges Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-2.5 rounded-none bg-black/40 border border-white/5">
                  <div className="w-7 h-7 rounded-none border border-brand-red/40 flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5 text-brand-red" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">
                      {form.badge1Title || "Fast Response"}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {form.badge1Subtitle || "We reply within 24 hours"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-none bg-black/40 border border-white/5">
                  <div className="w-7 h-7 rounded-none border border-brand-green/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">
                      {form.badge2Title || "Project Focused"}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {form.badge2Subtitle || "Solutions tailored for you"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Workstation Visual Preview */}
              <div className="pt-2">
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-2">
                  Workstation Visual Preview
                </p>
                <div
                  className="relative min-h-[160px] rounded-none border border-white/10 bg-[#101010] overflow-hidden"
                  style={{
                    backgroundImage: form.heroBannerImageUrl
                      ? `url(${form.heroBannerImageUrl})`
                      : "var(--contact-workstation-image, radial-gradient(ellipse at 72% 40%, rgba(239,68,68,0.12), transparent 36%), radial-gradient(ellipse at 35% 80%, rgba(34,197,94,0.08), transparent 38%), linear-gradient(135deg, #141414, #080808 72%))",
                    backgroundSize: "cover",
                    backgroundPosition:
                      form.heroBannerObjectPosition || "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/25 via-transparent to-black/10" />
                  <div className="absolute inset-3 rounded-none border border-white/[0.07]" />
                  <div className="absolute left-4 right-4 bottom-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  <div className="absolute left-4 top-4 w-1.5 h-1.5 rounded-none bg-brand-red/80 shadow-[0_0_12px_rgba(239,68,68,0.65)]" />
                  <div className="absolute right-4 bottom-4 w-1.5 h-1.5 rounded-none bg-brand-green/80 shadow-[0_0_12px_rgba(34,197,94,0.55)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECT CONTACT INFORMATION MANAGEMENT */}
      {activeTab === "DIRECT_CONTACT" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-6">
              {/* Section Header Copy */}
              <div className="p-6 bg-[#111] border border-white/10 rounded-none space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
                  <Phone className="w-4 h-4 text-brand-red" />
                  <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
                    Section Header & Description
                  </h2>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Badge / Eyebrow Text
                  </label>
                  <input
                    type="text"
                    value={form.directContactEyebrow}
                    onChange={(e) =>
                      handleChange("directContactEyebrow", e.target.value)
                    }
                    maxLength={150}
                    placeholder="GET IN TOUCH"
                    className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                  />
                  <p className="text-[10px] text-neutral-500 font-mono mt-1">
                    Small red dot badge above the section title (default: GET IN
                    TOUCH).
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-white mb-1.5">
                    Section Heading <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.directContactHeading}
                    onChange={(e) =>
                      handleChange("directContactHeading", e.target.value)
                    }
                    maxLength={150}
                    required
                    placeholder="DIRECT CONTACT"
                    className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Section Description
                  </label>
                  <textarea
                    value={form.directContactDescription}
                    onChange={(e) =>
                      handleChange("directContactDescription", e.target.value)
                    }
                    rows={3}
                    placeholder="Prefer direct communication? Reach out to our team via email, phone, or WhatsApp."
                    className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none resize-y"
                  />
                </div>
              </div>

              {/* Item 1: Email Us (Required) */}
              <div className="p-6 bg-[#111] border border-white/10 rounded-none space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-red" />
                    <h3 className="text-sm font-display font-black uppercase tracking-wider text-white">
                      Item 1 — Email Channel
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-red/10 border border-brand-red/30 text-brand-red">
                      Required Channel
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleContactChannel("directContactEmailEnabled")
                      }
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-none border transition-colors cursor-pointer ${
                        form.directContactEmailEnabled !== false
                          ? "bg-brand-green/10 text-brand-green border-brand-green/30 hover:bg-brand-green/20"
                          : "bg-white/[0.04] text-neutral-400 border-white/10 hover:text-white"
                      }`}
                      title={
                        form.directContactEmailEnabled !== false
                          ? "Click to disable channel"
                          : "Click to enable channel"
                      }
                    >
                      {form.directContactEmailEnabled !== false
                        ? "Enabled"
                        : "Disabled"}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 font-mono">
                  Core business contact channel. Deletion is prevented to ensure
                  clients can always reach out.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Item Label
                    </label>
                    <input
                      type="text"
                      value={form.directContactEmailLabel}
                      onChange={(e) =>
                        handleChange("directContactEmailLabel", e.target.value)
                      }
                      maxLength={100}
                      placeholder="EMAIL US"
                      className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-white mb-1.5">
                      Email Address <span className="text-brand-red">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.directContactEmail}
                      onChange={(e) =>
                        handleChange("directContactEmail", e.target.value)
                      }
                      maxLength={255}
                      required={form.directContactEmailEnabled !== false}
                      placeholder="hello@designtouchplus.com"
                      className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Subtitle / Availability Note
                  </label>
                  <input
                    type="text"
                    value={form.directContactEmailSub}
                    onChange={(e) =>
                      handleChange("directContactEmailSub", e.target.value)
                    }
                    maxLength={150}
                    placeholder="We'll reply within 24 hours"
                    className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                  />
                  <p className="text-[10px] text-neutral-500 font-mono mt-1">
                    Clicking this email on public pages opens a mailto: link.
                  </p>
                </div>
              </div>

              {/* Item 2: Call / WhatsApp (Required) */}
              <div className="p-6 bg-[#111] border border-white/10 rounded-none space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-red" />
                    <h3 className="text-sm font-display font-black uppercase tracking-wider text-white">
                      Item 2 — Call & WhatsApp Channel
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-red/10 border border-brand-red/30 text-brand-red">
                      Required Channel
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleContactChannel("directContactPhoneEnabled")
                      }
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-none border transition-colors cursor-pointer ${
                        form.directContactPhoneEnabled !== false
                          ? "bg-brand-green/10 text-brand-green border-brand-green/30 hover:bg-brand-green/20"
                          : "bg-white/[0.04] text-neutral-400 border-white/10 hover:text-white"
                      }`}
                      title={
                        form.directContactPhoneEnabled !== false
                          ? "Click to disable channel"
                          : "Click to enable channel"
                      }
                    >
                      {form.directContactPhoneEnabled !== false
                        ? "Enabled"
                        : "Disabled"}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 font-mono">
                  Core business contact channel. Deletion is prevented.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Item Label
                    </label>
                    <input
                      type="text"
                      value={form.directContactPhoneLabel}
                      onChange={(e) =>
                        handleChange("directContactPhoneLabel", e.target.value)
                      }
                      maxLength={100}
                      placeholder="CALL / WHATSAPP"
                      className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-white mb-1.5">
                      Phone Number <span className="text-brand-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.directContactPhone}
                      onChange={(e) =>
                        handleChange("directContactPhone", e.target.value)
                      }
                      maxLength={100}
                      required={form.directContactPhoneEnabled !== false}
                      placeholder="+91 12345 67890"
                      className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Subtitle / Calling Hours
                  </label>
                  <input
                    type="text"
                    value={form.directContactPhoneSub}
                    onChange={(e) =>
                      handleChange("directContactPhoneSub", e.target.value)
                    }
                    maxLength={150}
                    placeholder="Mon - Sat: 10:00 AM - 7:00 PM"
                    className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                  />
                  <p className="text-[10px] text-neutral-500 font-mono mt-1">
                    Automatically formats both tel: and WhatsApp direct chat
                    links.
                  </p>
                </div>
              </div>

              {/* Item 3: Studio Location (Required) */}
              <div className="p-6 bg-[#111] border border-white/10 rounded-none space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-red" />
                    <h3 className="text-sm font-display font-black uppercase tracking-wider text-white">
                      Item 3 — Studio Location
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-red/10 border border-brand-red/30 text-brand-red">
                      Required Channel
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleContactChannel(
                          "directContactLocationEnabled",
                        )
                      }
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-none border transition-colors cursor-pointer ${
                        form.directContactLocationEnabled !== false
                          ? "bg-brand-green/10 text-brand-green border-brand-green/30 hover:bg-brand-green/20"
                          : "bg-white/[0.04] text-neutral-400 border-white/10 hover:text-white"
                      }`}
                      title={
                        form.directContactLocationEnabled !== false
                          ? "Click to disable channel"
                          : "Click to enable channel"
                      }
                    >
                      {form.directContactLocationEnabled !== false
                        ? "Enabled"
                        : "Disabled"}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 font-mono">
                  Core business contact channel. Deletion is prevented.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Item Label
                    </label>
                    <input
                      type="text"
                      value={form.directContactLocationLabel}
                      onChange={(e) =>
                        handleChange(
                          "directContactLocationLabel",
                          e.target.value,
                        )
                      }
                      maxLength={100}
                      placeholder="OUR LOCATION"
                      className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-white mb-1.5">
                      Location / Region{" "}
                      <span className="text-brand-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.directContactLocation}
                      onChange={(e) =>
                        handleChange("directContactLocation", e.target.value)
                      }
                      maxLength={255}
                      required={form.directContactLocationEnabled !== false}
                      placeholder="India · Remote Worldwide"
                      className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Subtitle / Coverage Note
                  </label>
                  <input
                    type="text"
                    value={form.directContactLocationSub}
                    onChange={(e) =>
                      handleChange("directContactLocationSub", e.target.value)
                    }
                    maxLength={150}
                    placeholder="We work with clients globally"
                    className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>

              {/* Item 4: Working Hours / Availability (Optional - Deletable & Re-addable) */}
              {!isWorkingHoursDeleted ? (
                <div className="p-6 bg-[#111] border border-white/10 rounded-none space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-red" />
                      <h3 className="text-sm font-display font-black uppercase tracking-wider text-white">
                        Item 4 — Working Hours / Availability
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-white/[0.05] border border-white/10 text-neutral-400">
                        Optional Channel
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleContactChannel(
                            "directContactWorkingHoursEnabled",
                          )
                        }
                        className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-none border transition-colors cursor-pointer ${
                          form.directContactWorkingHoursEnabled !== false
                            ? "bg-brand-green/10 text-brand-green border-brand-green/30 hover:bg-brand-green/20"
                            : "bg-white/[0.04] text-neutral-400 border-white/10 hover:text-white"
                        }`}
                        title={
                          form.directContactWorkingHoursEnabled !== false
                            ? "Click to disable channel"
                            : "Click to enable channel"
                        }
                      >
                        {form.directContactWorkingHoursEnabled !== false
                          ? "Enabled"
                          : "Disabled"}
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteWorkingHours}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-none bg-red-950/20 hover:bg-red-950/40 border border-brand-red/30 text-red-300 hover:text-red-200 cursor-pointer transition-colors"
                        title="Delete this optional channel"
                      >
                        <Trash2 className="w-3 h-3 text-brand-red" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                        Item Label
                      </label>
                      <input
                        type="text"
                        value={form.directContactWorkingHoursLabel}
                        onChange={(e) =>
                          handleChange(
                            "directContactWorkingHoursLabel",
                            e.target.value,
                          )
                        }
                        maxLength={100}
                        placeholder="WORKING HOURS"
                        className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-white mb-1.5">
                        Hours / Availability Text
                      </label>
                      <input
                        type="text"
                        value={form.directContactWorkingHours}
                        onChange={(e) =>
                          handleChange(
                            "directContactWorkingHours",
                            e.target.value,
                          )
                        }
                        maxLength={255}
                        placeholder="Monday - Saturday, 10:00 AM - 7:00 PM (IST)"
                        className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Subtitle / Timezone Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.directContactWorkingHoursSub}
                      onChange={(e) =>
                        handleChange(
                          "directContactWorkingHoursSub",
                          e.target.value,
                        )
                      }
                      maxLength={150}
                      placeholder="e.g. Standard IST Business Hours"
                      className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2 text-xs font-mono text-white outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-[#111]/60 border border-dashed border-white/15 rounded-none flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-none bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-500">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                        Working Hours Channel Removed
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                        Optional channel is currently hidden from public pages.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddWorkingHours}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/10 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-red" />
                    Add Working Hours Channel
                  </button>
                </div>
              )}

              {/* Social Media Links Management Section */}
              <div className="p-6 bg-[#111] border border-white/10 rounded-none space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <Share2 className="w-4 h-4 text-brand-red" />
                    <div>
                      <h3 className="text-sm font-display font-black uppercase tracking-wider text-white">
                        Social Media Profiles
                      </h3>
                      <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                        Manage channels displayed on homepage and contact page.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={(form.socialLinks || []).length >= 6}
                    onClick={() => setSocialModal({ open: true, link: null })}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-red hover:bg-[#dc2626] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-mono font-bold uppercase tracking-wider rounded-none border-none cursor-pointer transition-colors shadow-[0_2px_10px_rgba(239,68,68,0.25)]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Social Link ({(form.socialLinks || []).length}/6)
                  </button>
                </div>

                {/* List of configured social media profiles */}
                {(form.socialLinks || []).length > 0 ? (
                  <div className="space-y-2.5">
                    {form.socialLinks.map((link) => {
                      const Icon = getSocialPlatformIcon(link.platform);
                      return (
                        <div
                          key={link.id || link.platform}
                          className="p-3.5 bg-[#181818] border border-white/[0.08] flex items-center justify-between gap-4 rounded-none hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-9 h-9 bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                                  {link.platform}
                                </span>
                                <span
                                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-none font-bold uppercase tracking-wider ${
                                    link.enabled !== false
                                      ? "bg-brand-green/10 text-brand-green border border-brand-green/30"
                                      : "bg-white/[0.04] text-neutral-500 border border-white/10"
                                  }`}
                                >
                                  {link.enabled !== false ? "Active" : "Disabled"}
                                </span>
                              </div>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-mono text-neutral-400 hover:text-white truncate block transition-colors mt-0.5 no-underline flex items-center gap-1"
                                title={link.url}
                              >
                                <span className="truncate">{link.url}</span>
                                <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Enable / Disable Toggle button */}
                            <button
                              type="button"
                              onClick={() => handleToggleSocialLink(link.id)}
                              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded-none border transition-colors cursor-pointer ${
                                link.enabled !== false
                                  ? "bg-brand-green/10 text-brand-green border-brand-green/30 hover:bg-brand-green/20"
                                  : "bg-white/[0.04] text-neutral-400 border-white/10 hover:text-white"
                              }`}
                              title={
                                link.enabled !== false
                                  ? "Click to disable"
                                  : "Click to enable"
                              }
                            >
                              {link.enabled !== false ? "Enabled" : "Disabled"}
                            </button>

                            {/* Edit button */}
                            <button
                              type="button"
                              onClick={() =>
                                setSocialModal({ open: true, link })
                              }
                              className="p-1.5 text-neutral-400 hover:text-white bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors cursor-pointer rounded-none"
                              title="Edit link URL"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSocialLink(link.id)}
                              className="p-1.5 text-neutral-400 hover:text-brand-red bg-white/[0.04] border border-white/10 hover:border-brand-red/30 transition-colors cursor-pointer rounded-none"
                              title="Delete social link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-[#181818] border border-dashed border-white/10 rounded-none">
                    <Share2 className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-xs font-mono text-neutral-400">
                      No social media profiles added yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSocialModal({ open: true, link: null })}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-brand-red hover:underline bg-transparent border-none cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Your First Social Link
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Live Public Preview Column */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-4 lg:sticky lg:top-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-none bg-brand-green animate-pulse" />
                  Live Public Preview (Homepage & Contact)
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  /contact & /#contact
                </span>
              </div>

              {/* Exact Public Card Representation */}
              <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-none p-6 sm:p-7 shadow-2xl">
                <div className="mb-6 pb-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span
                      className="w-2 h-2 rounded-none bg-brand-red shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-neutral-400">
                      {form.directContactEyebrow || "GET IN TOUCH"}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-white mb-2">
                    {form.directContactHeading || "DIRECT CONTACT"}
                  </h2>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    {form.directContactDescription ||
                      "Prefer direct communication? Reach out to our team via email, phone, or WhatsApp."}
                  </p>
                </div>

                <div className="divide-y divide-white/[0.06]">
                  {/* Email (only if enabled & present) */}
                  {form.directContactEmailEnabled !== false &&
                  form.directContactEmail ? (
                    <div className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-none border border-brand-red/35 bg-brand-red/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-brand-red" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                          {form.directContactEmailLabel || "EMAIL US"}
                        </p>
                        <p className="text-xs font-semibold text-white break-words">
                          {form.directContactEmail}
                        </p>
                        {form.directContactEmailSub && (
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {form.directContactEmailSub}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Phone (only if enabled & present) */}
                  {form.directContactPhoneEnabled !== false &&
                  form.directContactPhone ? (
                    <div className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-none border border-brand-red/35 bg-brand-red/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-brand-red" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                          {form.directContactPhoneLabel || "CALL / WHATSAPP"}
                        </p>
                        <p className="text-xs font-semibold text-white break-words">
                          {form.directContactPhone}
                        </p>
                        {form.directContactPhoneSub && (
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {form.directContactPhoneSub}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Location (only if enabled & present) */}
                  {form.directContactLocationEnabled !== false &&
                  form.directContactLocation ? (
                    <div className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-none border border-brand-red/35 bg-brand-red/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-red" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                          {form.directContactLocationLabel || "OUR LOCATION"}
                        </p>
                        <p className="text-xs font-semibold text-white break-words">
                          {form.directContactLocation}
                        </p>
                        {form.directContactLocationSub && (
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {form.directContactLocationSub}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Working Hours (only if not deleted, enabled & present) */}
                  {!isWorkingHoursDeleted &&
                  form.directContactWorkingHoursEnabled !== false &&
                  form.directContactWorkingHours ? (
                    <div className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-none border border-brand-red/35 bg-brand-red/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-brand-red" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                          {form.directContactWorkingHoursLabel ||
                            "WORKING HOURS"}
                        </p>
                        <p className="text-xs font-semibold text-white break-words">
                          {form.directContactWorkingHours}
                        </p>
                        {form.directContactWorkingHoursSub && (
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {form.directContactWorkingHoursSub}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Social media links preview */}
                {(() => {
                  const enabledLinks = (form.socialLinks || []).filter(
                    (l) => l.enabled !== false && l.url,
                  );
                  if (enabledLinks.length === 0) return null;
                  return (
                    <div className="pt-5 mt-5 border-t border-white/[0.06]">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 mb-2.5">
                        Public Social Profiles ({enabledLinks.length} Active)
                      </p>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {enabledLinks.map((link) => {
                          const Icon = getSocialPlatformIcon(link.platform);
                          return (
                            <a
                              key={link.id || link.platform}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={link.platform}
                              title={`${link.platform}: ${link.url}`}
                              className="w-8 h-8 rounded-none bg-white/[0.04] border border-white/[0.08] hover:border-brand-red flex items-center justify-center text-neutral-400 hover:text-white transition-colors no-underline"
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Bottom Quick Save Button for Direct Contact */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider py-3 px-4 rounded-none border-none cursor-pointer transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.3)] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Direct Contact & Social Links
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT FAQ MANAGEMENT */}
      {activeTab === "FAQS" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#111] border border-white/10 rounded-none">
            <div>
              <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
                Frequently Asked Questions (General & Contact Category)
              </h2>
              <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                Total {faqs.length} FAQs configured (
                {faqs.filter((f) => f.isActive).length} active). Questions
                appear in the public Contact page accordion.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFaqModal({ open: true, faq: null })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer rounded-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </button>
          </div>

          {loadingFaqs ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-400 gap-3 border border-dashed border-white/10">
              <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
              <span className="text-xs font-mono">Loading Contact FAQs...</span>
            </div>
          ) : faqs.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-white/10 p-8 rounded-none">
              <p className="text-xs font-mono text-neutral-500 mb-3">
                No FAQs found under GENERAL / Contact category.
              </p>
              <button
                type="button"
                onClick={() => setFaqModal({ open: true, faq: null })}
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-brand-red/60 text-brand-red text-xs font-mono uppercase hover:bg-brand-red hover:text-white transition-colors rounded-none"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First FAQ</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#111] border rounded-none transition-colors ${
                    faq.isActive
                      ? "border-white/10"
                      : "border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <span className="w-7 h-7 rounded-none bg-white/[0.04] border border-white/10 flex items-center justify-center text-xs font-mono text-neutral-400 shrink-0 mt-0.5">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">
                          {faq.question}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border rounded-none ${
                            faq.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-neutral-800 text-neutral-400 border-neutral-700"
                          }`}
                        >
                          {faq.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-neutral-400 mt-1 line-clamp-2">
                        {faq.answer}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Ordering Controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveFaq(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 border border-white/10 text-neutral-400 hover:text-white disabled:opacity-30 rounded-none transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveFaq(index, 1)}
                      disabled={index === faqs.length - 1}
                      className="p-1.5 border border-white/10 text-neutral-400 hover:text-white disabled:opacity-30 rounded-none transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleFaqActive(faq.id)}
                      className={`p-1.5 border border-white/10 rounded-none transition-colors ${
                        faq.isActive
                          ? "text-neutral-400 hover:text-amber-400"
                          : "text-emerald-400 hover:text-emerald-300"
                      }`}
                      title={faq.isActive ? "Deactivate" : "Activate"}
                    >
                      {faq.isActive ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFaqModal({ open: true, faq })}
                      className="p-1.5 border border-white/10 text-neutral-400 hover:text-white rounded-none transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(faq)}
                      className="p-1.5 border border-white/10 text-neutral-400 hover:text-red-400 rounded-none transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAQ Create / Edit Modal */}
      {faqModal.open && (
        <FaqModal
          faq={faqModal.faq}
          defaultCategory="GENERAL"
          onClose={() => setFaqModal({ open: false, faq: null })}
          onSaved={handleFaqSaved}
        />
      )}

      {/* Social Media Link Create / Edit Modal */}
      <SocialLinkModal
        isOpen={socialModal.open}
        link={socialModal.link}
        existingLinks={form.socialLinks || []}
        onClose={() => setSocialModal({ open: false, link: null })}
        onSave={handleSaveSocialLink}
      />

      {/* Confirmation Modal */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() =>
          setConfirmModal({
            isOpen: false,
            title: "",
            message: "",
            loading: false,
            onConfirm: null,
          })
        }
      />
    </div>
  );
}
