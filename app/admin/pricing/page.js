"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  LayoutTemplate,
  Layers,
  PlusCircle,
  GitCommit,
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  ExternalLink,
  Star,
  Eye,
  EyeOff,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Upload,
  SlidersHorizontal,
  Compass,
} from "lucide-react";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import PricingPlanModal from "@/components/admin/PricingPlanModal";
import AddOnModal from "@/components/admin/AddOnModal";
import FaqModal from "@/components/admin/FaqModal";
import ProcessStepModal from "@/components/admin/ProcessStepModal";
import {
  getPricingPageContent,
  updatePricingPageContent,
  uploadPricingHeroImage,
  deletePricingHeroBanner,
  getPricingHeroBannersAdmin,
  createPricingHeroBanner,
  updatePricingHeroBanner,
  togglePricingHeroBannerActive,
  reorderPricingHeroBanners,
  deletePricingHeroBannerById,
  getPricingPlansAdmin,
  togglePricingPlanActive,
  reorderPricingPlans,
  deletePricingPlan,
  getAddOnsAdmin,
  toggleAddOnActive,
  reorderAddOns,
  deleteAddOn,
  getProcessStepsAdmin,
  toggleProcessStepActive,
  reorderProcessSteps,
  deleteProcessStep,
  getFaqsAdmin,
  toggleFaqActive,
  reorderFaqs,
  deleteFaq,
} from "@/lib/api";

const TABS = [
  { id: "HERO", label: "Page Hero", icon: LayoutTemplate },
  { id: "PLANS", label: "Pricing Plans", icon: Layers },
  { id: "ADDONS", label: "Add-Ons", icon: PlusCircle },
  { id: "PROCESS", label: "Our Process", icon: GitCommit },
  { id: "FAQS", label: "Pricing FAQs", icon: HelpCircle },
];

const DEFAULT_HERO_CONTENT = {
  heroEyebrow: "PRICING PLANS",
  heroHeadlineLine1: "SIMPLE PRICING.",
  heroHeadlineLine2: "POWERFUL",
  heroHeadlineHighlight: "RESULTS.",
  heroHighlightStyle: "gradient",
  heroDescription:
    "Choose the perfect plan for your needs. All plans include high-quality editing, fast delivery and unlimited revisions.",
  heroBannerImageUrl: "",
  heroBannerImagePublicId: "",
  heroBannerImageAlt: "DesignTouch+ Creative Production Studio",
  heroBannerObjectPosition: "center",
  heroPrimaryCtaText: "CHOOSE A PLAN",
  heroPrimaryCtaLink: "#plans",
  heroSecondaryCtaText: "BOOK A CALL",
  heroSecondaryCtaLink: "/contact",
  heroBackgroundImageUrl: "",
};

const MAX_HERO_BANNERS = 5;

const ADMIN_SERVICE_CATEGORIES = [
  { id: "ALL", label: "All Categories" },
  { id: "VIDEO_EDITING", label: "Video Editing" },
  { id: "THUMBNAIL_DESIGN", label: "Thumbnail Design" },
  { id: "CONTENT_CREATOR", label: "Content Creator" },
];

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState("PLANS");
  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  // Hero state
  const [heroForm, setHeroForm] = useState(DEFAULT_HERO_CONTENT);
  const [heroBanners, setHeroBanners] = useState([]);
  const [uploadingBannerIndex, setUploadingBannerIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bannerError, setBannerError] = useState("");
  const [bannerSuccess, setBannerSuccess] = useState("");
  const [savingBannerIndex, setSavingBannerIndex] = useState(null);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

  // Plans state
  const [planType, setPlanType] = useState("ONE_TIME");
  const [selectedPlanCategory, setSelectedPlanCategory] = useState("ALL");
  const [plans, setPlans] = useState([]);
  const [planModal, setPlanModal] = useState({ open: false, plan: null });

  // Add-ons state
  const [addOns, setAddOns] = useState([]);
  const [addOnModal, setAddOnModal] = useState({ open: false, addOn: null });

  // Process steps state
  const [steps, setSteps] = useState([]);
  const [stepModal, setStepModal] = useState({ open: false, step: null });

  // FAQs state
  const [faqs, setFaqs] = useState([]);
  const [faqModal, setFaqModal] = useState({ open: false, faq: null });

  // Delete confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load all data
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setBannerError("");

      const [heroData, bannersData, plansData, addOnsData, stepsData, faqsData] =
        await Promise.all([
          getPricingPageContent().catch(() => null),
          getPricingHeroBannersAdmin().catch(() => []),
          getPricingPlansAdmin().catch(() => []),
          getAddOnsAdmin().catch(() => []),
          getProcessStepsAdmin("PRICING").catch(() => []),
          getFaqsAdmin("PRICING").catch(() => []),
        ]);

      if (heroData) {
        const bannerUrl =
          heroData.heroBannerImageUrl || heroData.heroBackgroundImageUrl || "";
        setHeroForm({
          heroEyebrow: heroData.heroEyebrow || DEFAULT_HERO_CONTENT.heroEyebrow,
          heroHeadlineLine1:
            heroData.heroHeadlineLine1 || DEFAULT_HERO_CONTENT.heroHeadlineLine1,
          heroHeadlineLine2:
            heroData.heroHeadlineLine2 || DEFAULT_HERO_CONTENT.heroHeadlineLine2,
          heroHeadlineHighlight:
            heroData.heroHeadlineHighlight ||
            DEFAULT_HERO_CONTENT.heroHeadlineHighlight,
          heroHighlightStyle:
            heroData.heroHighlightStyle || DEFAULT_HERO_CONTENT.heroHighlightStyle,
          heroDescription:
            heroData.heroDescription || DEFAULT_HERO_CONTENT.heroDescription,
          heroBannerImageUrl: bannerUrl,
          heroBannerImagePublicId: heroData.heroBannerImagePublicId || "",
          heroBannerImageAlt:
            heroData.heroBannerImageAlt || DEFAULT_HERO_CONTENT.heroBannerImageAlt,
          heroBannerObjectPosition:
            heroData.heroBannerObjectPosition || DEFAULT_HERO_CONTENT.heroBannerObjectPosition,
          heroPrimaryCtaText:
            heroData.heroPrimaryCtaText || DEFAULT_HERO_CONTENT.heroPrimaryCtaText,
          heroPrimaryCtaLink:
            heroData.heroPrimaryCtaLink || DEFAULT_HERO_CONTENT.heroPrimaryCtaLink,
          heroSecondaryCtaText:
            heroData.heroSecondaryCtaText || DEFAULT_HERO_CONTENT.heroSecondaryCtaText,
          heroSecondaryCtaLink:
            heroData.heroSecondaryCtaLink || DEFAULT_HERO_CONTENT.heroSecondaryCtaLink,
          heroBackgroundImageUrl: heroData.heroBackgroundImageUrl || bannerUrl,
        });
      }

      if (Array.isArray(bannersData) && bannersData.length > 0) {
        setHeroBanners(bannersData);
      } else if (Array.isArray(heroData?.heroBanners) && heroData.heroBanners.length > 0) {
        setHeroBanners(heroData.heroBanners);
      } else if (heroData?.heroBannerImageUrl?.trim()) {
        setHeroBanners([
          {
            id: null,
            label: "Banner 1",
            imageUrl: heroData.heroBannerImageUrl.trim(),
            altText: heroData.heroBannerImageAlt || "DesignTouch+ Creative Production Studio",
            objectPosition: heroData.heroBannerObjectPosition || "center",
            displayOrder: 1,
            isActive: true,
          },
        ]);
      } else {
        setHeroBanners([]);
      }

      setPlans(Array.isArray(plansData) ? plansData : []);
      setAddOns(Array.isArray(addOnsData) ? addOnsData : []);
      setSteps(Array.isArray(stepsData) ? stepsData : []);
      setFaqs(Array.isArray(faqsData) ? faqsData : []);
    } catch (err) {
      setError(err.message || "Failed to load pricing data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---------- Hero Handlers ----------
  const handleHeroChange = (e) => {
    const { name, value } = e.target;
    setHeroForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeroSave = async (e) => {
    e.preventDefault();
    setSavingHero(true);
    setError(null);
    try {
      const bannerUrl =
        heroForm.heroBannerImageUrl?.trim() ||
        heroForm.heroBackgroundImageUrl?.trim() ||
        null;

      const payload = {
        heroEyebrow: heroForm.heroEyebrow?.trim() || "PRICING PLANS",
        heroHeadlineLine1: heroForm.heroHeadlineLine1?.trim() || "SIMPLE PRICING.",
        heroHeadlineLine2: heroForm.heroHeadlineLine2?.trim() || "POWERFUL",
        heroHeadlineHighlight: heroForm.heroHeadlineHighlight?.trim() || "RESULTS.",
        heroHighlightStyle: heroForm.heroHighlightStyle || "gradient",
        heroDescription: heroForm.heroDescription?.trim() || "",
        heroBannerImageUrl: bannerUrl,
        heroBannerImagePublicId: heroForm.heroBannerImagePublicId?.trim() || null,
        heroBannerImageAlt:
          heroForm.heroBannerImageAlt?.trim() || "DesignTouch+ Creative Production Studio",
        heroBannerObjectPosition: heroForm.heroBannerObjectPosition || "center",
        heroPrimaryCtaText: heroForm.heroPrimaryCtaText?.trim() || "CHOOSE A PLAN",
        heroPrimaryCtaLink: heroForm.heroPrimaryCtaLink?.trim() || "#plans",
        heroSecondaryCtaText: heroForm.heroSecondaryCtaText?.trim() || "BOOK A CALL",
        heroSecondaryCtaLink: heroForm.heroSecondaryCtaLink?.trim() || "/contact",
        heroBackgroundImageUrl: bannerUrl,
      };

      const updated = await updatePricingPageContent(payload);
      if (updated) {
        const updatedBanner =
          updated.heroBannerImageUrl || updated.heroBackgroundImageUrl || "";
        setHeroForm({
          heroEyebrow: updated.heroEyebrow || DEFAULT_HERO_CONTENT.heroEyebrow,
          heroHeadlineLine1:
            updated.heroHeadlineLine1 || DEFAULT_HERO_CONTENT.heroHeadlineLine1,
          heroHeadlineLine2:
            updated.heroHeadlineLine2 || DEFAULT_HERO_CONTENT.heroHeadlineLine2,
          heroHeadlineHighlight:
            updated.heroHeadlineHighlight || DEFAULT_HERO_CONTENT.heroHeadlineHighlight,
          heroHighlightStyle:
            updated.heroHighlightStyle || DEFAULT_HERO_CONTENT.heroHighlightStyle,
          heroDescription:
            updated.heroDescription || DEFAULT_HERO_CONTENT.heroDescription,
          heroBannerImageUrl: updatedBanner,
          heroBannerImagePublicId: updated.heroBannerImagePublicId || "",
          heroBannerImageAlt:
            updated.heroBannerImageAlt || DEFAULT_HERO_CONTENT.heroBannerImageAlt,
          heroBannerObjectPosition:
            updated.heroBannerObjectPosition || DEFAULT_HERO_CONTENT.heroBannerObjectPosition,
          heroPrimaryCtaText:
            updated.heroPrimaryCtaText || DEFAULT_HERO_CONTENT.heroPrimaryCtaText,
          heroPrimaryCtaLink:
            updated.heroPrimaryCtaLink || DEFAULT_HERO_CONTENT.heroPrimaryCtaLink,
          heroSecondaryCtaText:
            updated.heroSecondaryCtaText || DEFAULT_HERO_CONTENT.heroSecondaryCtaText,
          heroSecondaryCtaLink:
            updated.heroSecondaryCtaLink || DEFAULT_HERO_CONTENT.heroSecondaryCtaLink,
          heroBackgroundImageUrl: updated.heroBackgroundImageUrl || updatedBanner,
        });
      }
      showNotification("Hero settings saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save hero section.");
    } finally {
      setSavingHero(false);
    }
  };

  // ---------- Multi-Banner Handlers (Max 5) ----------
  const handleBannerFieldChange = (index, field, value) => {
    setHeroBanners((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
  };

  const handleBannerFileUpload = async (index, file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    const validExts = ["jpg", "jpeg", "png", "webp"];

    if (!validTypes.includes(file.type) && !validExts.includes(extension)) {
      setBannerError("Invalid file type. Please upload a JPG, JPEG, PNG, or WebP image.");
      return;
    }

    const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_BYTES) {
      setBannerError("Image file size exceeds the 10 MB limit.");
      return;
    }

    const currentBanner = heroBanners[index];
    if (!currentBanner) return;

    setUploadingBannerIndex(index);
    setBannerError("");
    setBannerSuccess("");
    setUploadProgress(20);

    try {
      setUploadProgress(50);
      const res = await uploadPricingHeroImage(file);
      setUploadProgress(85);

      const imageUrl = res?.url || res?.secureUrl || res?.imageUrl;
      const publicId = res?.publicId || "";

      if (!imageUrl) {
        throw new Error(res?.message || "Upload succeeded but no image URL was returned.");
      }

      setUploadProgress(95);

      const updatedPayload = {
        label: currentBanner.label || `Banner ${index + 1}`,
        imageUrl,
        imagePublicId: publicId,
        altText: currentBanner.altText || "DesignTouch+ Creative Production Studio",
        objectPosition: currentBanner.objectPosition || "center",
        displayOrder: Number(currentBanner.displayOrder) || index + 1,
        isActive: currentBanner.isActive !== false,
      };

      if (currentBanner.id) {
        const updated = await updatePricingHeroBanner(currentBanner.id, updatedPayload);
        setHeroBanners((prev) =>
          prev.map((b, i) => (i === index ? updated : b))
        );
      } else {
        const created = await createPricingHeroBanner(updatedPayload);
        setHeroBanners((prev) =>
          prev.map((b, i) => (i === index ? created : b))
        );
      }

      setBannerSuccess(`${updatedPayload.label} uploaded and saved successfully!`);
      showNotification(`${updatedPayload.label} uploaded successfully.`);
    } catch (err) {
      setBannerError(err.message || "Failed to upload banner image.");
    } finally {
      setUploadingBannerIndex(null);
      setUploadProgress(0);
    }
  };

  const handleSaveBanner = async (index) => {
    const banner = heroBanners[index];
    if (!banner) return;

    if (!banner.imageUrl || !banner.imageUrl.trim()) {
      setBannerError(`Please upload an image or provide a valid URL for Banner ${index + 1}.`);
      return;
    }

    setSavingBannerIndex(index);
    setBannerError("");
    setBannerSuccess("");

    try {
      const payload = {
        label: banner.label?.trim() || `Banner ${index + 1}`,
        imageUrl: banner.imageUrl.trim(),
        imagePublicId: banner.imagePublicId || null,
        altText: banner.altText?.trim() || "DesignTouch+ Creative Production Studio",
        objectPosition: banner.objectPosition || "center",
        displayOrder: Number(banner.displayOrder) || index + 1,
        isActive: banner.isActive !== false,
      };

      let result;
      if (banner.id) {
        result = await updatePricingHeroBanner(banner.id, payload);
      } else {
        result = await createPricingHeroBanner(payload);
      }

      setHeroBanners((prev) =>
        prev.map((b, i) => (i === index ? result : b))
      );
      setBannerSuccess(`${payload.label} saved successfully.`);
      showNotification(`${payload.label} saved successfully.`);
    } catch (err) {
      setBannerError(err.message || "Failed to save banner.");
    } finally {
      setSavingBannerIndex(null);
    }
  };

  const handleToggleBannerActive = async (index) => {
    const banner = heroBanners[index];
    if (!banner) return;

    if (!banner.id) {
      setHeroBanners((prev) =>
        prev.map((b, i) => (i === index ? { ...b, isActive: !b.isActive } : b))
      );
      return;
    }

    try {
      const updated = await togglePricingHeroBannerActive(banner.id);
      setHeroBanners((prev) =>
        prev.map((b, i) => (i === index ? updated : b))
      );
      showNotification(
        `${updated.label || `Banner ${index + 1}`} is now ${
          updated.isActive ? "active in carousel" : "inactive"
        }.`
      );
    } catch (err) {
      setBannerError(err.message || "Failed to toggle banner status.");
    }
  };

  const handleMoveBannerOrder = async (index, direction) => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroBanners.length) return;

    const reordered = [...heroBanners];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const allHaveIds = reordered.every((b) => Boolean(b.id));
    if (allHaveIds) {
      try {
        const updated = await reorderPricingHeroBanners(reordered.map((b) => b.id));
        setHeroBanners(updated);
        showNotification("Hero banners reordered successfully.");
      } catch (err) {
        setBannerError(err.message || "Failed to reorder banners.");
      }
    } else {
      setHeroBanners(reordered);
    }
  };

  const handleDeleteBanner = (index) => {
    const banner = heroBanners[index];
    if (!banner) return;

    setConfirmModal({
      open: true,
      title: `Delete ${banner.label || `Banner ${index + 1}`}?`,
      message: `Are you sure you want to remove this banner from the Pricing Hero carousel? This cannot be undone.`,
      onConfirm: async () => {
        try {
          if (banner.id) {
            await deletePricingHeroBannerById(banner.id);
          }
          setHeroBanners((prev) => prev.filter((_, i) => i !== index));
          showNotification("Banner removed successfully.");
        } catch (err) {
          setBannerError(err.message || "Failed to delete banner.");
        } finally {
          setConfirmModal({ open: false, title: "", message: "", onConfirm: null });
        }
      },
    });
  };

  const handleAddAnotherBanner = () => {
    if (heroBanners.length >= MAX_HERO_BANNERS) {
      setBannerError("Maximum of 5 hero banners reached.");
      return;
    }

    const nextOrder = heroBanners.length + 1;
    const newSlot = {
      label: `Banner ${nextOrder}`,
      imageUrl: "",
      imagePublicId: "",
      altText: "DesignTouch+ Creative Production Studio",
      objectPosition: "center",
      displayOrder: nextOrder,
      isActive: true,
    };
    setHeroBanners((prev) => [...prev, newSlot]);
  };

  const activePreviewBanners = heroBanners.filter(
    (b) => b.isActive !== false && Boolean(b.imageUrl?.trim())
  );

  useEffect(() => {
    if (activePreviewBanners.length <= 1) return undefined;
    const interval = setInterval(() => {
      setPreviewSlideIndex((prev) => (prev + 1) % activePreviewBanners.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [activePreviewBanners.length]);

  // ---------- Plan Handlers ----------
  const filteredPlans = plans.filter((p) => {
    const matchesType = p.priceType === planType;
    const planCat = p.serviceCategory || "VIDEO_EDITING";
    const matchesCategory =
      selectedPlanCategory === "ALL" || planCat === selectedPlanCategory;
    return matchesType && matchesCategory;
  });

  const handleTogglePlanActive = async (id) => {
    try {
      const updated = await togglePricingPlanActive(id);
      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showNotification(
        `Plan is now ${updated.isActive ? "active" : "inactive"}.`
      );
    } catch (err) {
      setError(err.message || "Failed to toggle plan status.");
    }
  };

  const handleMovePlan = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= filteredPlans.length) return;

    const reordered = [...filteredPlans];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const filteredIds = new Set(filteredPlans.map((p) => p.id));
    const otherPlans = plans.filter((p) => !filteredIds.has(p.id));
    const combinedIds = [...reordered.map((p) => p.id), ...otherPlans.map((p) => p.id)];

    try {
      const result = await reorderPricingPlans(combinedIds);
      setPlans(result);
      showNotification("Pricing plans reordered successfully.");
    } catch (err) {
      setError(err.message || "Failed to reorder plans.");
    }
  };

  const handleDeletePlan = (plan) => {
    setConfirmModal({
      open: true,
      title: `Delete ${plan.planName} Plan?`,
      message: `Are you sure you want to delete the ${plan.planName} tier? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await deletePricingPlan(plan.id);
          setPlans((prev) => prev.filter((p) => p.id !== plan.id));
          showNotification("Pricing plan deleted successfully.");
        } catch (err) {
          setError(err.message || "Failed to delete plan.");
        } finally {
          setConfirmModal({ open: false, title: "", message: "", onConfirm: null });
        }
      },
    });
  };

  // ---------- Add-On Handlers ----------
  const handleToggleAddOnActive = async (id) => {
    try {
      const updated = await toggleAddOnActive(id);
      setAddOns((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showNotification(
        `Add-on is now ${updated.isActive ? "active" : "inactive"}.`
      );
    } catch (err) {
      setError(err.message || "Failed to toggle add-on status.");
    }
  };

  const handleMoveAddOn = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= addOns.length) return;

    const reordered = [...addOns];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    try {
      const result = await reorderAddOns(reordered.map((a) => a.id));
      setAddOns(result);
      showNotification("Add-ons reordered successfully.");
    } catch (err) {
      setError(err.message || "Failed to reorder add-ons.");
    }
  };

  const handleDeleteAddOn = (addOn) => {
    setConfirmModal({
      open: true,
      title: `Delete ${addOn.name}?`,
      message: `Are you sure you want to delete this add-on? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteAddOn(addOn.id);
          setAddOns((prev) => prev.filter((a) => a.id !== addOn.id));
          showNotification("Add-on deleted successfully.");
        } catch (err) {
          setError(err.message || "Failed to delete add-on.");
        } finally {
          setConfirmModal({ open: false, title: "", message: "", onConfirm: null });
        }
      },
    });
  };

  // ---------- Process Step Handlers ----------
  const handleToggleStepActive = async (id) => {
    try {
      const updated = await toggleProcessStepActive(id);
      setSteps((prev) => prev.map((s) => (s.id === id ? updated : s)));
      showNotification(
        `Process step is now ${updated.isActive ? "active" : "inactive"}.`
      );
    } catch (err) {
      setError(err.message || "Failed to toggle process step.");
    }
  };

  const handleMoveStep = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const reordered = [...steps];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    try {
      await reorderProcessSteps(reordered.map((s) => s.id));
      const refreshed = await getProcessStepsAdmin("PRICING");
      setSteps(refreshed);
      showNotification("Process steps reordered successfully.");
    } catch (err) {
      setError(err.message || "Failed to reorder process steps.");
    }
  };

  const handleDeleteStep = (step) => {
    setConfirmModal({
      open: true,
      title: `Delete Step ${step.stepNumber}: ${step.title}?`,
      message: `Are you sure you want to remove this process step from the Pricing page?`,
      onConfirm: async () => {
        try {
          await deleteProcessStep(step.id);
          setSteps((prev) => prev.filter((s) => s.id !== step.id));
          showNotification("Process step deleted successfully.");
        } catch (err) {
          setError(err.message || "Failed to delete process step.");
        } finally {
          setConfirmModal({ open: false, title: "", message: "", onConfirm: null });
        }
      },
    });
  };

  // ---------- FAQ Handlers ----------
  const handleToggleFaqActive = async (id) => {
    try {
      const updated = await toggleFaqActive(id);
      setFaqs((prev) => prev.map((f) => (f.id === id ? updated : f)));
      showNotification(
        `FAQ is now ${updated.isActive ? "active" : "inactive"}.`
      );
    } catch (err) {
      setError(err.message || "Failed to toggle FAQ status.");
    }
  };

  const handleMoveFaq = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const reordered = [...faqs];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    try {
      const result = await reorderFaqs(reordered.map((f) => f.id));
      setFaqs(result.filter((f) => f.category === "PRICING"));
      showNotification("FAQs reordered successfully.");
    } catch (err) {
      setError(err.message || "Failed to reorder FAQs.");
    }
  };

  const handleDeleteFaq = (faq) => {
    setConfirmModal({
      open: true,
      title: "Delete FAQ?",
      message: `Are you sure you want to delete "${faq.question}"?`,
      onConfirm: async () => {
        try {
          await deleteFaq(faq.id);
          setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
          showNotification("FAQ deleted successfully.");
        } catch (err) {
          setError(err.message || "Failed to delete FAQ.");
        } finally {
          setConfirmModal({ open: false, title: "", message: "", onConfirm: null });
        }
      },
    });
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 outline-none transition-colors w-full";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-red shrink-0" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-neutral-400">
              CMS MANAGEMENT
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-black uppercase tracking-tight text-white">
            Pricing Page CMS
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Manage Hero messaging, Plans (One-Time & Monthly), Add-Ons, Process timeline, and FAQs.
          </p>
        </div>

        <Link
          href="/pricing"
          target="_blank"
          className="inline-flex items-center gap-2 px-3.5 py-2 border border-white/15 bg-white/[0.02] text-xs font-mono text-neutral-300 hover:text-white hover:border-brand-red/60 transition-colors self-start sm:self-auto"
        >
          <span>View Public Page</span>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
        </Link>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.msg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 p-1 bg-[#0d0d0d] border border-white/10">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                isActive
                  ? "bg-brand-red text-white border-brand-red font-bold"
                  : "bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-neutral-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
          <span className="text-xs font-mono">Loading Pricing CMS...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: HERO */}
          {activeTab === "HERO" && (
            <div className="space-y-6">
              <form onSubmit={handleHeroSave} className="bg-[#111] border border-white/10 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/10 gap-3">
                  <div>
                    <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
                      Pricing Hero Configuration
                    </h2>
                    <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                      Manage split-layout hero messaging, cinematic workstation banner image, highlight styling, and call-to-action buttons.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={savingHero || uploadingBannerIndex !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50 self-start sm:self-auto cursor-pointer"
                  >
                    {savingHero ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savingHero ? "Saving..." : "Save Hero"}</span>
                  </button>
                </div>

                {/* Section 1: Editorial Headline & Copy */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                    <span className="w-1.5 h-1.5 bg-brand-red inline-block" />
                    <span>Headline & Editorial Copy</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                        Eyebrow Text
                      </label>
                      <input
                        type="text"
                        name="heroEyebrow"
                        value={heroForm.heroEyebrow}
                        onChange={handleHeroChange}
                        placeholder="PRICING PLANS"
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                        Highlight Accent Style
                      </label>
                      <select
                        name="heroHighlightStyle"
                        value={heroForm.heroHighlightStyle || "gradient"}
                        onChange={handleHeroChange}
                        className={`${inputClasses} cursor-pointer`}
                      >
                        <option value="gradient" className="bg-[#111] text-white">
                          Gradient (Red → Orange → Green) [Default]
                        </option>
                        <option value="red" className="bg-[#111] text-white">
                          Solid Brand Red
                        </option>
                        <option value="green" className="bg-[#111] text-white">
                          Accent Green
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                        Headline Line 1
                      </label>
                      <input
                        type="text"
                        name="heroHeadlineLine1"
                        value={heroForm.heroHeadlineLine1}
                        onChange={handleHeroChange}
                        placeholder="SIMPLE PRICING."
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                        Headline Line 2 (Prefix)
                      </label>
                      <input
                        type="text"
                        name="heroHeadlineLine2"
                        value={heroForm.heroHeadlineLine2}
                        onChange={handleHeroChange}
                        placeholder="POWERFUL"
                        className={inputClasses}
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                        Headline Highlight Keyword
                      </label>
                      <input
                        type="text"
                        name="heroHeadlineHighlight"
                        value={heroForm.heroHeadlineHighlight}
                        onChange={handleHeroChange}
                        placeholder="RESULTS."
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                      Hero Description Subheading
                    </label>
                    <textarea
                      rows={3}
                      name="heroDescription"
                      value={heroForm.heroDescription}
                      onChange={handleHeroChange}
                      placeholder="Choose the perfect plan for your needs..."
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Section 2: Multi-Banner Management (Up to 5 Banners - Automatic Carousel) */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                        <span className="w-1.5 h-1.5 bg-brand-red inline-block" />
                        <span>Pricing Hero Banners (Max 5 Banners — 1.5s Carousel)</span>
                      </div>
                      <p className="text-[11px] font-mono text-neutral-400 mt-1">
                        Configure up to 5 cinematic production banners. The public /pricing hero smoothly slides between active banners horizontally every 1.5s with hover pause.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddAnotherBanner}
                        disabled={heroBanners.length >= MAX_HERO_BANNERS || uploadingBannerIndex !== null}
                        className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-none border border-brand-red transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        title={
                          heroBanners.length >= MAX_HERO_BANNERS
                            ? "Maximum limit of 5 banners reached."
                            : "Add another banner slot to the Pricing Hero carousel"
                        }
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          {heroBanners.length >= MAX_HERO_BANNERS
                            ? "Max 5 Banners Reached"
                            : "Add Banner"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Limit alert notice */}
                  {heroBanners.length >= MAX_HERO_BANNERS && (
                    <div className="flex items-center justify-between gap-2 bg-amber-950/30 border border-amber-700/50 text-amber-200 text-xs font-mono px-3.5 py-2.5">
                      <span>
                        Maximum limit reached ({heroBanners.length} / {MAX_HERO_BANNERS} banners). Delete or replace an existing banner to add a different one.
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 shrink-0">
                        5 / 5 ACTIVE SLOTS
                      </span>
                    </div>
                  )}

                  {/* Notifications */}
                  {bannerError && (
                    <div className="flex items-center gap-2 bg-red-950/50 border border-red-800 text-red-200 text-xs font-mono p-3">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{bannerError}</span>
                    </div>
                  )}
                  {bannerSuccess && (
                    <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs font-mono p-3">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{bannerSuccess}</span>
                    </div>
                  )}

                  {/* Upload Progress Bar */}
                  {uploadingBannerIndex !== null && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                        <span>
                          Uploading {heroBanners[uploadingBannerIndex]?.label || `Banner ${uploadingBannerIndex + 1}`} to Cloudinary (designtouch/pricing)...
                        </span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-brand-red transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Banner List */}
                  {heroBanners.length === 0 ? (
                    <div className="p-8 border border-dashed border-white/15 bg-white/[0.01] text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-400">
                        <ImageIcon className="w-5 h-5 text-brand-red" />
                      </div>
                      <div>
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                          No Hero Banners Configured
                        </h4>
                        <p className="text-[11px] font-mono text-neutral-400 mt-1 max-w-md mx-auto">
                          The public Pricing Hero currently renders the default studio fallback motif. Add your first workstation banner below to activate the multi-banner carousel.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAnotherBanner}
                        className="inline-flex items-center gap-2 bg-brand-red text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2 border border-brand-red cursor-pointer hover:bg-red-700 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Banner</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {heroBanners.map((banner, index) => {
                        const isUploadingThis = uploadingBannerIndex === index;
                        const isSavingThis = savingBannerIndex === index;
                        const bannerTitle = banner.label || `Banner ${index + 1}`;

                        return (
                          <div
                            key={banner.id ? `banner-${banner.id}` : `draft-${index}`}
                            className={`border p-4 sm:p-5 transition-colors ${
                              banner.isActive !== false
                                ? "bg-white/[0.02] border-white/15"
                                : "bg-black/40 border-white/10 opacity-75"
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 mb-4 border-b border-white/10">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-brand-red text-white">
                                  #{index + 1}
                                </span>
                                <input
                                  type="text"
                                  value={banner.label || ""}
                                  onChange={(e) =>
                                    handleBannerFieldChange(index, "label", e.target.value)
                                  }
                                  placeholder={`Banner ${index + 1}`}
                                  aria-label={`Banner ${index + 1} label`}
                                  className="bg-black border border-white/15 px-2.5 py-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-brand-red w-36 sm:w-48"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleToggleBannerActive(index)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase border cursor-pointer transition-colors ${
                                    banner.isActive !== false
                                      ? "bg-emerald-950/60 border-emerald-700/70 text-emerald-300 hover:bg-emerald-900/60"
                                      : "bg-neutral-900 border-white/15 text-neutral-400 hover:text-white"
                                  }`}
                                >
                                  {banner.isActive !== false ? (
                                    <>
                                      <Eye className="w-3 h-3" />
                                      <span>Active</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3 h-3" />
                                      <span>Inactive</span>
                                    </>
                                  )}
                                </button>
                                {banner.id ? (
                                  <span className="text-[10px] font-mono text-neutral-500">
                                    ID: {String(banner.id).substring(0, 8)}...
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-amber-400 uppercase">
                                    ● Unsaved Slot
                                  </span>
                                )}
                              </div>

                              {/* Reorder and Card Actions */}
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center border border-white/15 bg-black">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveBannerOrder(index, "UP")}
                                    disabled={index === 0}
                                    title="Move Banner Earlier in Carousel"
                                    className="p-1.5 text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="px-2 text-[10px] font-mono text-neutral-400 border-x border-white/10">
                                    Order: {banner.displayOrder ?? index + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveBannerOrder(index, "DOWN")}
                                    disabled={index === heroBanners.length - 1}
                                    title="Move Banner Later in Carousel"
                                    className="p-1.5 text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleSaveBanner(index)}
                                  disabled={isSavingThis || isUploadingThis}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-red text-white text-[11px] font-mono font-bold uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                  {isSavingThis ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Save className="w-3 h-3" />
                                  )}
                                  <span>{isSavingThis ? "Saving..." : "Save Banner"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteBanner(index)}
                                  className="p-1.5 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-mono transition-colors cursor-pointer"
                                  title="Delete this banner"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Card Body: Thumbnail & Inputs */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                              {/* Left Thumbnail & File Upload */}
                              <div className="lg:col-span-4 space-y-2.5">
                                <div className="relative aspect-[16/9] w-full bg-black border border-white/15 rounded-[2px] overflow-hidden group">
                                  {banner.imageUrl ? (
                                    <img
                                      src={banner.imageUrl}
                                      alt={banner.altText || bannerTitle}
                                      className="w-full h-full object-cover select-none"
                                      style={{
                                        objectPosition: banner.objectPosition || "center",
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-xs font-mono p-4 text-center">
                                      <ImageIcon className="w-8 h-8 mb-1.5 text-neutral-600" />
                                      <span>No image uploaded</span>
                                    </div>
                                  )}

                                  {banner.isActive === false && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-300 bg-black/80 px-2 py-1 border border-white/20">
                                        INACTIVE IN CAROUSEL
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <label
                                    htmlFor={`banner-file-${index}`}
                                    className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-white/25 hover:border-brand-red bg-white/[0.02] hover:bg-white/[0.05] text-[11px] font-mono uppercase tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer ${
                                      isUploadingThis ? "opacity-50 pointer-events-none" : ""
                                    }`}
                                  >
                                    {isUploadingThis ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-red" />
                                    ) : (
                                      <Upload className="w-3.5 h-3.5 text-brand-red" />
                                    )}
                                    <span>
                                      {isUploadingThis
                                        ? `Uploading (${uploadProgress}%)...`
                                        : banner.imageUrl
                                        ? "Replace Image File"
                                        : "Upload Banner Image"}
                                    </span>
                                  </label>
                                  <input
                                    id={`banner-file-${index}`}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/jpg"
                                    disabled={isUploadingThis}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleBannerFileUpload(index, file);
                                    }}
                                    className="hidden"
                                  />
                                </div>
                              </div>

                              {/* Right Metadata Inputs */}
                              <div className="lg:col-span-8 space-y-3">
                                <div>
                                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                                    Banner Image URL
                                  </label>
                                  <input
                                    type="text"
                                    value={banner.imageUrl || ""}
                                    onChange={(e) =>
                                      handleBannerFieldChange(index, "imageUrl", e.target.value)
                                    }
                                    placeholder="https://res.cloudinary.com/... or /assets/workstation.jpg"
                                    className={inputClasses}
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                                      Alt Text (SEO & Accessibility)
                                    </label>
                                    <input
                                      type="text"
                                      value={banner.altText || ""}
                                      onChange={(e) =>
                                        handleBannerFieldChange(index, "altText", e.target.value)
                                      }
                                      placeholder="DesignTouch+ Creative Production Studio"
                                      className={inputClasses}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                                      Focal Alignment / Object Position
                                    </label>
                                    <select
                                      value={banner.objectPosition || "center"}
                                      onChange={(e) =>
                                        handleBannerFieldChange(index, "objectPosition", e.target.value)
                                      }
                                      className={`${inputClasses} cursor-pointer`}
                                    >
                                      <option value="center" className="bg-[#111] text-white">
                                        Center (50% 50%) [Default]
                                      </option>
                                      <option value="top" className="bg-[#111] text-white">
                                        Top (Align to top)
                                      </option>
                                      <option value="bottom" className="bg-[#111] text-white">
                                        Bottom (Align to bottom)
                                      </option>
                                      <option value="left" className="bg-[#111] text-white">
                                        Left (Align to left)
                                      </option>
                                      <option value="right" className="bg-[#111] text-white">
                                        Right (Align to right)
                                      </option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section 3: Call-to-Action Buttons */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                      <span className="w-1.5 h-1.5 bg-brand-red inline-block" />
                      <span>Hero Action Buttons (CTAs)</span>
                    </div>
                    <p className="text-[11px] font-mono text-neutral-400 mt-1">
                      Configure primary and secondary hero buttons linking to pricing tiers or booking inquiry.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary CTA */}
                    <div className="p-4 bg-white/[0.02] border border-white/10 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-200">
                        <span className="w-2 h-2 bg-brand-red inline-block" />
                        <span>Primary Button (Filled Brand Red)</span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                          Button Text
                        </label>
                        <input
                          type="text"
                          name="heroPrimaryCtaText"
                          value={heroForm.heroPrimaryCtaText}
                          onChange={handleHeroChange}
                          placeholder="CHOOSE A PLAN"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                          Button Link URL or Anchor
                        </label>
                        <input
                          type="text"
                          name="heroPrimaryCtaLink"
                          value={heroForm.heroPrimaryCtaLink}
                          onChange={handleHeroChange}
                          placeholder="#plans"
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    {/* Secondary CTA */}
                    <div className="p-4 bg-white/[0.02] border border-white/10 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-neutral-200">
                        <span className="w-2 h-2 border border-white/40 inline-block" />
                        <span>Secondary Button (Outline)</span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                          Button Text
                        </label>
                        <input
                          type="text"
                          name="heroSecondaryCtaText"
                          value={heroForm.heroSecondaryCtaText}
                          onChange={handleHeroChange}
                          placeholder="BOOK A CALL"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                          Button Link URL
                        </label>
                        <input
                          type="text"
                          name="heroSecondaryCtaLink"
                          value={heroForm.heroSecondaryCtaLink}
                          onChange={handleHeroChange}
                          placeholder="/contact"
                          className={inputClasses}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>

              {/* Live Preview Card (Interactive Split Layout) */}
              <div className="bg-[#0b0b0b] border border-white/10 p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Eye className="w-4 h-4 text-brand-red" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                      Live Hero Preview (Interactive Split Layout)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-brand-green">
                    {activePreviewBanners.length > 1
                      ? `● 1.5s Auto-Sliding Carousel (${activePreviewBanners.length} Active Banners)`
                      : activePreviewBanners.length === 1
                      ? "● Static Display (1 Active Banner)"
                      : "○ Fallback Studio Motif Active"}
                  </span>
                </div>

                <div className="relative overflow-hidden border border-white/10 bg-[#080808] p-6 sm:p-8 rounded-[8px]">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 xl:gap-8">
                    {/* Left Column Preview */}
                    <div className="relative z-10 w-full lg:w-[42%] shrink-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 bg-brand-red shrink-0" />
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-neutral-300">
                          {heroForm.heroEyebrow || "PRICING PLANS"}
                        </span>
                      </div>

                      <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white mb-3 leading-[1.05]">
                        <span className="block">{heroForm.heroHeadlineLine1 || "SIMPLE PRICING."}</span>
                        <span className="block">
                          {heroForm.heroHeadlineLine2 || "POWERFUL"}{" "}
                          <span
                            className={
                              heroForm.heroHighlightStyle === "red"
                                ? "text-brand-red"
                                : heroForm.heroHighlightStyle === "green"
                                ? "text-brand-green"
                                : "bg-gradient-to-r from-brand-red via-orange-400 to-brand-green bg-clip-text text-transparent"
                            }
                          >
                            {heroForm.heroHeadlineHighlight || "RESULTS."}
                          </span>
                        </span>
                      </h2>

                      <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-5 max-w-md">
                        {heroForm.heroDescription ||
                          "Choose the perfect plan for your needs. All plans include high-quality editing, fast delivery and unlimited revisions."}
                      </p>

                      <div className="flex flex-wrap items-center gap-3">
                        {heroForm.heroPrimaryCtaText && (
                          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white text-xs font-mono font-bold uppercase tracking-wider">
                            <span>{heroForm.heroPrimaryCtaText}</span>
                            <span className="text-[10px]">→</span>
                          </div>
                        )}
                        {heroForm.heroSecondaryCtaText && (
                          <div className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider">
                            <span>{heroForm.heroSecondaryCtaText}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column Preview (Banner Carousel or Fallback Motif) */}
                    <div className="w-full lg:w-[56%] shrink-0">
                      {activePreviewBanners.length > 0 ? (
                        <div className="relative w-full aspect-[1.7/1] min-h-[220px] sm:min-h-[260px] bg-[#080808] rounded-[4px] overflow-hidden border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.6)] group select-none">
                          <div
                            className="flex w-full h-full transition-transform duration-500 ease-out"
                            style={{
                              transform: `translate3d(-${(previewSlideIndex % activePreviewBanners.length) * 100}%, 0, 0)`,
                            }}
                          >
                            {activePreviewBanners.map((b, i) => (
                              <div
                                key={b.id || i}
                                className="relative w-full h-full min-w-full shrink-0 grow-0 basis-full overflow-hidden bg-[#080808]"
                              >
                                <img
                                  src={b.imageUrl}
                                  alt={b.altText || b.label || "Banner preview"}
                                  className="w-full h-full object-cover"
                                  style={{
                                    objectPosition: b.objectPosition || "center",
                                  }}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Subtle left-edge feather scrim */}
                          <div
                            className="absolute inset-y-0 left-0 w-8 sm:w-12 pointer-events-none z-10"
                            style={{
                              background:
                                "linear-gradient(90deg, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.3) 50%, rgba(8,8,8,0) 100%)",
                            }}
                            aria-hidden="true"
                          />

                          {/* Studio badge */}
                          <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur border border-white/15 text-[9px] font-mono uppercase tracking-wider text-neutral-300 z-10">
                            DT+ PRODUCTION WORKSTATION
                          </div>

                          {/* Carousel indicators */}
                          {activePreviewBanners.length > 1 && (
                            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/80 px-2 py-1 rounded-full border border-white/15">
                              {activePreviewBanners.map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setPreviewSlideIndex(i)}
                                  className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                                    previewSlideIndex % activePreviewBanners.length === i
                                      ? "w-4 bg-brand-red"
                                      : "w-1 bg-white/40"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative w-full aspect-[1.7/1] min-h-[220px] sm:min-h-[260px] bg-[#0c0c0c] rounded-[4px] overflow-hidden border border-dashed border-white/15 flex flex-col items-center justify-center p-6 text-center select-none">
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(ellipse_at_95%_90%,rgba(239,68,68,0.08),transparent_45%)]"
                          />
                          <div className="relative z-10 flex flex-col items-center gap-2 max-w-xs">
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
                              <ImageIcon className="w-5 h-5 text-brand-red" />
                            </div>
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                              Fallback Studio Motif Active
                            </span>
                            <p className="text-[10px] font-mono text-neutral-400 leading-normal">
                              Add a workstation banner above to activate the automatic 1.5s multi-banner carousel.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING PLANS */}
          {activeTab === "PLANS" && (
            <div className="space-y-6">
              {/* Category selector row */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-[#111] border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    Service Category:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ADMIN_SERVICE_CATEGORIES.map((cat) => {
                      const isCatActive = selectedPlanCategory === cat.id;
                      const count =
                        cat.id === "ALL"
                          ? plans.filter((p) => p.priceType === planType).length
                          : plans.filter(
                              (p) =>
                                p.priceType === planType &&
                                (p.serviceCategory || "VIDEO_EDITING") === cat.id
                            ).length;

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedPlanCategory(cat.id)}
                          className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 border transition-all cursor-pointer ${
                            isCatActive
                              ? "bg-white text-black border-white font-bold"
                              : "bg-[#0d0d0d] text-neutral-400 border-white/10 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          {cat.label} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPlanModal({
                      open: true,
                      plan: null,
                      defaultType: planType,
                      defaultCategory:
                        selectedPlanCategory === "ALL"
                          ? "VIDEO_EDITING"
                          : selectedPlanCategory,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-red-700 transition-colors self-start lg:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    Add{" "}
                    {selectedPlanCategory !== "ALL"
                      ? ADMIN_SERVICE_CATEGORIES.find(
                          (c) => c.id === selectedPlanCategory
                        )?.label
                      : ""}{" "}
                    {planType === "ONE_TIME" ? "One-Time" : "Monthly"} Plan
                  </span>
                </button>
              </div>

              {/* Sub-toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-[#111] border border-white/10">
                <div className="inline-flex max-w-full bg-[#0d0d0d] border border-white/10 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setPlanType("ONE_TIME")}
                    className={`text-xs font-mono uppercase tracking-wider px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
                      planType === "ONE_TIME"
                        ? "bg-brand-red text-white font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    One-Time Projects ({
                      plans.filter((p) => {
                        const matchesType = p.priceType === "ONE_TIME";
                        const planCat = p.serviceCategory || "VIDEO_EDITING";
                        return (
                          matchesType &&
                          (selectedPlanCategory === "ALL" ||
                            planCat === selectedPlanCategory)
                        );
                      }).length
                    })
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanType("MONTHLY")}
                    className={`text-xs font-mono uppercase tracking-wider px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
                      planType === "MONTHLY"
                        ? "bg-brand-red text-white font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Monthly Packages ({
                      plans.filter((p) => {
                        const matchesType = p.priceType === "MONTHLY";
                        const planCat = p.serviceCategory || "VIDEO_EDITING";
                        return (
                          matchesType &&
                          (selectedPlanCategory === "ALL" ||
                            planCat === selectedPlanCategory)
                        );
                      }).length
                    })
                  </button>
                </div>

                <div className="text-[11px] font-mono text-neutral-400">
                  Showing {filteredPlans.length} plan{filteredPlans.length === 1 ? "" : "s"}
                </div>
              </div>

              {/* Plans Grid / List */}
              {filteredPlans.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-white/10 p-8">
                  <p className="text-xs font-mono text-neutral-500 mb-3">
                    No {planType === "ONE_TIME" ? "one-time" : "monthly"} plans configured for{" "}
                    {selectedPlanCategory === "ALL"
                      ? "this selection"
                      : ADMIN_SERVICE_CATEGORIES.find(
                          (c) => c.id === selectedPlanCategory
                        )?.label}
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setPlanModal({
                        open: true,
                        plan: null,
                        defaultType: planType,
                        defaultCategory:
                          selectedPlanCategory === "ALL"
                            ? "VIDEO_EDITING"
                            : selectedPlanCategory,
                      })
                    }
                    className="inline-flex items-center gap-2 px-3.5 py-2 border border-brand-red/60 text-brand-red text-xs font-mono uppercase hover:bg-brand-red hover:text-white transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Plan</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredPlans.map((plan, index) => {
                    const isCustom = plan.price == null;
                    const priceDisplay = isCustom
                      ? "CUSTOM"
                      : `${plan.currency || "₹"}${Number(plan.price).toLocaleString("en-IN")}${
                          plan.unit || ""
                        }`;

                    return (
                      <div
                        key={plan.id}
                        className={`relative flex flex-col justify-between bg-[#111] border p-5 transition-all ${
                          plan.isMostPopular
                            ? "border-brand-red/60 shadow-lg shadow-brand-red/5"
                            : "border-white/10"
                        } ${!plan.isActive ? "opacity-60" : ""}`}
                      >
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider font-bold ${
                                plan.isActive
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                              }`}
                            >
                              {plan.isActive ? "Active" : "Inactive"}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 uppercase tracking-wider bg-white/5 border border-white/10 text-neutral-300">
                              {plan.serviceCategory === "CONTENT_CREATOR"
                                ? "Content Creator"
                                : plan.serviceCategory === "THUMBNAIL_DESIGN"
                                ? "Thumbnail"
                                : "Video Editing"}
                            </span>
                          </div>

                          {plan.isMostPopular && (
                            <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-red text-white px-2 py-0.5">
                              <Star className="w-3 h-3 fill-current" />
                              {plan.badgeText || "MOST POPULAR"}
                            </span>
                          )}
                        </div>

                        {/* Title & Price */}
                        <div>
                          <h3 className="text-base font-display font-black uppercase text-white tracking-tight">
                            {plan.planName}
                          </h3>
                          <p className="text-[11px] font-mono text-neutral-400 mt-1 line-clamp-2 min-h-[32px]">
                            {plan.description || "No description provided."}
                          </p>

                          <div className="my-4 pb-4 border-b border-white/10">
                            <span
                              className={`text-xl font-display font-extrabold tracking-tight ${
                                isCustom ? "text-orange-400" : "text-white"
                              }`}
                            >
                              {priceDisplay}
                            </span>
                          </div>

                          {/* Features Preview */}
                          <div className="space-y-1.5 mb-5">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                              Features ({plan.features?.length || 0}):
                            </span>
                            <ul className="list-none p-0 m-0 space-y-1">
                              {(plan.features || []).slice(0, 4).map((feat, i) => (
                                <li
                                  key={i}
                                  className="text-xs text-neutral-300 font-mono flex items-start gap-1.5 truncate"
                                >
                                  <span className="text-brand-green">✓</span>
                                  <span className="truncate">{feat}</span>
                                </li>
                              ))}
                              {(plan.features?.length || 0) > 4 && (
                                <li className="text-[10px] text-neutral-500 font-mono italic">
                                  + {(plan.features?.length || 0) - 4} more features
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Action controls */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-1">
                          {/* Reorder arrows */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMovePlan(index, -1)}
                              disabled={index === 0}
                              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400"
                              title="Move left / up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMovePlan(index, 1)}
                              disabled={index === filteredPlans.length - 1}
                              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400"
                              title="Move right / down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Toggle Active */}
                          <button
                            type="button"
                            onClick={() => handleTogglePlanActive(plan.id)}
                            className={`p-1.5 transition-colors ${
                              plan.isActive
                                ? "text-neutral-400 hover:text-amber-400"
                                : "text-emerald-400 hover:text-emerald-300"
                            }`}
                            title={plan.isActive ? "Deactivate plan" : "Activate plan"}
                          >
                            {plan.isActive ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() =>
                              setPlanModal({
                                open: true,
                                plan,
                                defaultType: plan.priceType,
                                defaultCategory: plan.serviceCategory || "VIDEO_EDITING",
                              })
                            }
                            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                            title="Edit plan"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDeletePlan(plan)}
                            className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"
                            title="Delete plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADD-ONS */}
          {activeTab === "ADDONS" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#111] border border-white/10">
                <div>
                  <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
                    Add-On Services Catalog
                  </h2>
                  <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    Optional extras shown in the Add-Ons row on the pricing page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddOnModal({ open: true, addOn: null })}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Add-On</span>
                </button>
              </div>

              {addOns.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-white/10 p-8">
                  <p className="text-xs font-mono text-neutral-500 mb-3">No add-ons found.</p>
                  <button
                    type="button"
                    onClick={() => setAddOnModal({ open: true, addOn: null })}
                    className="inline-flex items-center gap-2 px-3.5 py-2 border border-brand-red/60 text-brand-red text-xs font-mono uppercase hover:bg-brand-red hover:text-white transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Add-On</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {addOns.map((addOn, index) => (
                    <div
                      key={addOn.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#111] border ${
                        addOn.isActive ? "border-white/10" : "border-white/5 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Display order index */}
                        <span className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-xs font-mono text-neutral-400 shrink-0">
                          {index + 1}
                        </span>

                        {/* Icon preview (custom uploaded or preset) */}
                        <div
                          className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 p-1 overflow-hidden"
                          title={addOn.customIconUrl ? "Custom uploaded icon" : `Preset: ${addOn.icon || "default"}`}
                        >
                          {addOn.customIconUrl ? (
                            <img
                              src={addOn.customIconUrl}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-[9px] font-mono text-neutral-400 uppercase">
                              {(addOn.icon || "icon").slice(0, 3)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-display font-bold text-white uppercase tracking-tight truncate">
                              {addOn.name}
                            </span>
                            {addOn.customIconUrl && (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 border bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                                Custom Icon
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border ${
                                addOn.isActive
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-neutral-800 text-neutral-400 border-neutral-700"
                              }`}
                            >
                              {addOn.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-brand-green mt-0.5 block">
                            {addOn.priceLabel}
                          </span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleMoveAddOn(index, -1)}
                          disabled={index === 0}
                          className="p-1.5 border border-white/10 text-neutral-400 hover:text-white disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveAddOn(index, 1)}
                          disabled={index === addOns.length - 1}
                          className="p-1.5 border border-white/10 text-neutral-400 hover:text-white disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAddOnActive(addOn.id)}
                          className={`p-1.5 border border-white/10 ${
                            addOn.isActive
                              ? "text-neutral-400 hover:text-amber-400"
                              : "text-emerald-400 hover:text-emerald-300"
                          }`}
                          title={addOn.isActive ? "Deactivate" : "Activate"}
                        >
                          {addOn.isActive ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddOnModal({ open: true, addOn })}
                          className="p-1.5 border border-white/10 text-neutral-400 hover:text-white"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddOn(addOn)}
                          className="p-1.5 border border-white/10 text-neutral-400 hover:text-red-400"
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

          {/* TAB 4: PROCESS STEPS */}
          {activeTab === "PROCESS" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#111] border border-white/10">
                <div>
                  <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
                    Pricing Process Steps (Our Process)
                  </h2>
                  <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    The 5-step client delivery workflow shown on the Pricing page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setStepModal({
                      open: true,
                      step: {
                        pageType: "PRICING",
                        stepNumber: steps.length + 1,
                        displayOrder: steps.length + 1,
                      },
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Process Step</span>
                </button>
              </div>

              {steps.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-white/10 p-8">
                  <p className="text-xs font-mono text-neutral-500 mb-3">
                    No process steps configured for PRICING.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#111] border ${
                        step.isActive ? "border-white/10" : "border-white/5 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="w-8 h-8 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-xs font-mono font-bold text-brand-red shrink-0">
                          {step.stepNumber}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-display font-bold text-white uppercase tracking-tight truncate">
                              {step.title}
                            </span>
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border ${
                                step.isActive
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-neutral-800 text-neutral-400 border-neutral-700"
                              }`}
                            >
                              {step.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-neutral-400 mt-0.5 line-clamp-1">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleMoveStep(index, -1)}
                          disabled={index === 0}
                          className="p-1.5 border border-white/10 text-neutral-400 hover:text-white disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStep(index, 1)}
                          disabled={index === steps.length - 1}
                          className="p-1.5 border border-white/10 text-neutral-400 hover:text-white disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStepActive(step.id)}
                          className={`p-1.5 border border-white/10 ${
                            step.isActive
                              ? "text-neutral-400 hover:text-amber-400"
                              : "text-emerald-400 hover:text-emerald-300"
                          }`}
                          title={step.isActive ? "Deactivate" : "Activate"}
                        >
                          {step.isActive ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setStepModal({ open: true, step })}
                          className="p-1.5 border border-white/10 text-neutral-400 hover:text-white"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStep(step)}
                          className="p-1.5 border border-white/10 text-neutral-400 hover:text-red-400"
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

          {/* TAB 5: PRICING FAQS */}
          {activeTab === "FAQS" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#111] border border-white/10">
                <div>
                  <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
                    Frequently Asked Questions (Pricing Category)
                  </h2>
                  <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    Total {faqs.length} FAQs configured ({faqs.filter((f) => f.isActive).length} active).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFaqModal({
                      open: true,
                      faq: null,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add FAQ</span>
                </button>
              </div>

              {faqs.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-white/10 p-8">
                  <p className="text-xs font-mono text-neutral-500 mb-3">
                    No FAQs found under PRICING category.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFaqModal({ open: true, faq: null })}
                    className="inline-flex items-center gap-2 px-3.5 py-2 border border-brand-red/60 text-brand-red text-xs font-mono uppercase hover:bg-brand-red hover:text-white transition-colors"
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
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#111] border ${
                        faq.isActive ? "border-white/10" : "border-white/5 opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-xs font-mono text-neutral-400 shrink-0 mt-0.5">
                          {index + 1}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">
                              {faq.question}
                            </span>
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border ${
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

                      {/* Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveFaq(index, -1)}
                          disabled={index === 0}
                          className="p-1.5 border border-white/10 text-neutral-400 hover:text-white disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveFaq(index, 1)}
                          disabled={index === faqs.length - 1}
                          className="p-1.5 border border-white/10 text-neutral-400 hover:text-white disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFaqActive(faq.id)}
                          className={`p-1.5 border border-white/10 ${
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
                          className="p-1.5 border border-white/10 text-neutral-400 hover:text-white"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(faq)}
                          className="p-1.5 border border-white/10 text-neutral-400 hover:text-red-400"
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
        </>
      )}

      {/* Plan Modal */}
      {planModal.open && (
        <PricingPlanModal
          plan={planModal.plan}
          defaultType={planModal.defaultType || planType}
          defaultCategory={
            planModal.defaultCategory ||
            (selectedPlanCategory === "ALL"
              ? "VIDEO_EDITING"
              : selectedPlanCategory)
          }
          onClose={() => setPlanModal({ open: false, plan: null })}
          onSaved={() => {
            setPlanModal({ open: false, plan: null });
            loadAll();
            showNotification("Plan saved successfully.");
          }}
        />
      )}

      {/* Add-On Modal */}
      {addOnModal.open && (
        <AddOnModal
          addOn={addOnModal.addOn}
          onClose={() => setAddOnModal({ open: false, addOn: null })}
          onSaved={() => {
            setAddOnModal({ open: false, addOn: null });
            loadAll();
            showNotification("Add-on saved successfully.");
          }}
        />
      )}

      {/* Process Step Modal */}
      {stepModal.open && (
        <ProcessStepModal
          step={stepModal.step}
          onClose={() => setStepModal({ open: false, step: null })}
          onSaved={() => {
            setStepModal({ open: false, step: null });
            loadAll();
            showNotification("Process step saved successfully.");
          }}
        />
      )}

      {/* FAQ Modal */}
      {faqModal.open && (
        <FaqModal
          faq={faqModal.faq}
          defaultCategory="PRICING"
          onClose={() => setFaqModal({ open: false, faq: null })}
          onSaved={() => {
            setFaqModal({ open: false, faq: null });
            loadAll();
            showNotification("FAQ saved successfully.");
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() =>
          setConfirmModal({ open: false, title: "", message: "", onConfirm: null })
        }
      />
    </div>
  );
}

