"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Layers,
  LayoutTemplate,
  Image as ImageIcon,
  Upload,
  Loader2,
  RefreshCw,
  GitCommit,
  Wrench,
  Megaphone,
  Check,
  X as XIcon,
  Eye,
  ArrowUp,
  ArrowDown,
  Clapperboard,
  Film,
  Smartphone,
  Youtube,
  Palette,
  BarChart3,
} from "lucide-react";
import ServiceForm from "@/components/admin/ServiceForm";
import ProcessStepModal from "@/components/admin/ProcessStepModal";
import ToolModal from "@/components/admin/ToolModal";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { getProcessIconMeta } from "@/lib/processIcons";
import { resolveToolIconMeta } from "@/lib/toolIcons";
import {
  ServiceOutlineIcon,
  resolveServiceIconKey,
  resolveServiceTheme,
} from "@/lib/serviceIcons";
import {
  getServicesPageContent,
  updateServicesPageContent,
  uploadServicesHeroImage,
  deleteServicesHeroBanner,
  getServicesHeroBannersAdmin,
  createServicesHeroBanner,
  updateServicesHeroBanner,
  toggleServicesHeroBannerActive,
  reorderServicesHeroBanners,
  deleteServicesHeroBannerById,
  getServicesAdmin,
  toggleServiceActive,
  deleteService,
  getProcessStepsAdmin,
  toggleProcessStepActive,
  deleteProcessStep,
  getToolsAdmin,
  toggleToolActive,
  deleteTool,
} from "@/lib/api";

const TABS = [
  { id: "SERVICES", label: "Services Catalog", icon: Layers },
  { id: "HERO", label: "Page Hero", icon: LayoutTemplate },
  { id: "BANNER", label: "Hero Banner Image", icon: ImageIcon },
  { id: "PROCESS", label: "Our Process", icon: GitCommit },
  { id: "TOOLS", label: "Tools We Use", icon: Wrench },
  { id: "CTA", label: "Bottom CTA", icon: Megaphone },
];

const EMPTY_PAGE_CONTENT = {
  heroEyebrow: "OUR SERVICES // FULL-SERVICE CREATIVE STUDIO",
  heroHeadlineLine1: "CREATIVE SOLUTIONS",
  heroHeadlineLine2: "THAT DRIVE",
  heroHeadlineHighlight: "RESULTS.",
  heroDescription:
    "From concept to final cut, we provide end-to-end creative services that help brands connect, engage, and grow. Every edit, thumbnail, and motion visual is crafted for maximum retention and measurable conversion.",
  heroPrimaryCtaText: "DISCUSS YOUR PROJECT",
  heroPrimaryCtaLink: "/contact",
  heroSecondaryCtaText: "VIEW WORK ARCHIVE",
  heroSecondaryCtaLink: "/portfolio",
  heroVideoUrl: "/hero-demo.mp4",
  heroStat1Value: "4K+",
  heroStat1Label: "Master Exports",
  heroStat2Value: "48H",
  heroStat2Label: "Avg First Draft",
  heroStat3Value: "100%",
  heroStat3Label: "Retention Focus",
  heroShowStats: true,
  heroShowWorkstation: true,
  heroBannerImageUrl: "",
  heroBannerImagePublicId: "",

  servicesEyebrow: "WHAT WE DO // PORTFOLIO DISCIPLINES",
  servicesHeading: "OUR SERVICES",
  servicesDescription:
    "High-quality creative services tailored to your brand’s unique needs. Engineered for digital retention and commercial performance.",

  processEyebrow: "HOW WE WORK // METHODOLOGY",
  processHeading: "OUR PROCESS",
  processDescription:
    "A structured five-step production workflow built for creative alignment, swift turnaround, and measurable results.",

  toolsEyebrow: "PRODUCTION STACK // HARDWARE & SOFTWARE",
  toolsHeading: "TOOLS WE USE",
  toolsDescription:
    "Industry-standard software suites power every frame, cut, grade, and render we produce for our clients.",

  ctaEyebrow: "STUDIO AVAILABILITY // NOW ACCEPTING COMMISSIONS",
  ctaHeadingLine1: "LET’S CREATE SOMETHING",
  ctaHeadingLine2: "AMAZING",
  ctaHeadingHighlight: "TOGETHER.",
  ctaDescription:
    "Have a project in mind? We're ready to bring your ideas to life with high-retention video editing, scroll-stopping thumbnails, and cinematic visual assets.",
  ctaButtonText: "GET IN TOUCH",
  ctaButtonLink: "/contact",
  ctaAccentNote: "Free 30-min strategy call • Fast 48h turnaround",
};

export default function AdminServicesPage({ defaultTab = "SERVICES" }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Global messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Page Content state
  const [pageContent, setPageContent] = useState(EMPTY_PAGE_CONTENT);
  const [loadingContent, setLoadingContent] = useState(true);
  const [savingContent, setSavingContent] = useState(false);

  // Services Catalog state
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [editingService, setEditingService] = useState(null);

  // Process Steps state
  const [processSteps, setProcessSteps] = useState([]);
  const [loadingSteps, setLoadingSteps] = useState(true);
  const [editingStep, setEditingStep] = useState(null);

  // Tools state
  const [tools, setTools] = useState([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [editingTool, setEditingTool] = useState(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    loading: false,
  });

  // Multi-Banner (1..5) state
  const MAX_HERO_BANNERS = 5;
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [uploadingBannerIndex, setUploadingBannerIndex] = useState(null);
  const [savingBannerIndex, setSavingBannerIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bannerSuccess, setBannerSuccess] = useState("");
  const [bannerError, setBannerError] = useState("");
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const fileInputRefs = useRef({});

  // Clear toast after 4s
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (bannerSuccess) {
      const timer = setTimeout(() => setBannerSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [bannerSuccess]);

  // Load Page Content
  const loadContent = useCallback(async () => {
    setLoadingContent(true);
    try {
      const data = await getServicesPageContent();
      if (data) {
        setPageContent((prev) => ({
          ...prev,
          ...data,
          heroShowStats: data.heroShowStats !== false,
          heroShowWorkstation: data.heroShowWorkstation !== false,
        }));
      }
    } catch (err) {
      console.warn("Could not load services-page content:", err.message);
    } finally {
      setLoadingContent(false);
    }
  }, []);

  // Load Multi-Banners (Admin)
  const loadBanners = useCallback(async () => {
    setLoadingBanners(true);
    try {
      const data = await getServicesHeroBannersAdmin();
      if (Array.isArray(data) && data.length > 0) {
        setBanners(
          data.map((b, idx) => ({
            id: b.id,
            label: b.label || `Banner ${idx + 1}`,
            imageUrl: b.imageUrl || "",
            imagePublicId: b.imagePublicId || "",
            displayOrder: b.displayOrder ?? idx + 1,
            isActive: b.isActive !== false,
          })),
        );
      } else {
        // Initialize with 1 default Banner 1 draft slot if none exist yet
        setBanners([
          {
            id: null,
            label: "Banner 1",
            imageUrl: "",
            imagePublicId: "",
            displayOrder: 1,
            isActive: true,
          },
        ]);
      }
    } catch (err) {
      console.warn("Could not load services hero banners:", err.message);
    } finally {
      setLoadingBanners(false);
    }
  }, []);

  // Load Services
  const loadServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const data = await getServicesAdmin();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load services list.");
    } finally {
      setLoadingServices(false);
    }
  }, []);

  // Load Process Steps
  const loadProcessSteps = useCallback(async () => {
    setLoadingSteps(true);
    try {
      const data = await getProcessStepsAdmin("SERVICES");
      setProcessSteps(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load process steps.");
    } finally {
      setLoadingSteps(false);
    }
  }, []);

  // Load Tools
  const loadTools = useCallback(async () => {
    setLoadingTools(true);
    try {
      const data = await getToolsAdmin();
      setTools(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load tools.");
    } finally {
      setLoadingTools(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
    loadBanners();
    loadServices();
    loadProcessSteps();
    loadTools();
  }, [loadContent, loadBanners, loadServices, loadProcessSteps, loadTools]);

  // Active banners for live preview simulation
  const activePreviewBanners = banners.filter(
    (b) => b.isActive !== false && b.imageUrl && b.imageUrl.trim() !== "",
  );

  // Auto-advance live simulation carousel in Admin when >1 active banners (every 2 seconds)
  useEffect(() => {
    if (activePreviewBanners.length <= 1) {
      setPreviewSlideIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setPreviewSlideIndex((prev) => (prev + 1) % activePreviewBanners.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [activePreviewBanners.length]);

  // Handle Page Content Input Change
  const handleContentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPageContent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save Page Content (Hero, Headers, or CTA)
  const handleSavePageContent = async (sectionName) => {
    setSavingContent(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateServicesPageContent(pageContent);
      if (updated) {
        setPageContent((prev) => ({ ...prev, ...updated }));
      }
      setSuccess(
        `${sectionName || "Services page content"} saved successfully!`,
      );
    } catch (err) {
      setError(err.message || "Failed to save services page content.");
    } finally {
      setSavingContent(false);
    }
  };

  // Update field on a specific banner slot
  const handleBannerFieldChange = (index, field, value) => {
    setBanners((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  // Add Another Banner slot (up to MAX_HERO_BANNERS = 5)
  const handleAddAnotherBanner = () => {
    setBannerError("");
    setBannerSuccess("");
    if (banners.length >= MAX_HERO_BANNERS) {
      setBannerError("Maximum of 5 hero banners reached.");
      return;
    }
    const nextNum = banners.length + 1;
    setBanners((prev) => [
      ...prev,
      {
        id: null,
        label: `Banner ${nextNum}`,
        imageUrl: "",
        imagePublicId: "",
        displayOrder: nextNum,
        isActive: true,
      },
    ]);
    setBannerSuccess(
      `Added Banner ${nextNum} slot. Upload an image to publish it.`,
    );
  };

  // Upload/Replace image for a specific banner slot
  const handleBannerFileSelect = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    const validExts = ["jpg", "jpeg", "png", "webp"];

    if (!validTypes.includes(file.type) && !validExts.includes(extension)) {
      setBannerError(
        "Invalid file type. Please upload a JPG, JPEG, PNG, or WebP image.",
      );
      return;
    }

    const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_BYTES) {
      setBannerError("Image file size exceeds the 10 MB limit.");
      return;
    }

    const currentBanner = banners[index];
    if (!currentBanner) return;

    setUploadingBannerIndex(index);
    setBannerError("");
    setBannerSuccess("");
    setUploadProgress(25);

    try {
      setUploadProgress(50);
      const res = await uploadServicesHeroImage(file);
      setUploadProgress(85);

      const imageUrl = res?.url || res?.secureUrl || res?.imageUrl;
      const publicId = res?.publicId || "";

      if (!imageUrl) {
        throw new Error(
          res?.message ||
            "Upload succeeded but no image URL was returned from the server.",
        );
      }

      const payload = {
        label: currentBanner.label || `Banner ${index + 1}`,
        imageUrl,
        imagePublicId: publicId,
        displayOrder: Number(currentBanner.displayOrder) || index + 1,
        isActive: currentBanner.isActive !== false,
      };

      // Optimistically update local state so preview renders immediately
      setBanners((prev) =>
        prev.map((item, idx) =>
          idx === index ? { ...item, ...payload } : item,
        ),
      );

      // Create or update in database
      const saved = currentBanner.id
        ? await updateServicesHeroBanner(currentBanner.id, payload)
        : await createServicesHeroBanner(payload);

      if (saved) {
        setBanners((prev) =>
          prev.map((item, idx) =>
            idx === index
              ? {
                  id: saved.id,
                  label: saved.label || payload.label,
                  imageUrl: saved.imageUrl || imageUrl,
                  imagePublicId: saved.imagePublicId || publicId,
                  displayOrder: saved.displayOrder ?? payload.displayOrder,
                  isActive: saved.isActive !== false,
                }
              : item,
          ),
        );
      }

      setUploadProgress(100);
      setBannerSuccess(
        `${payload.label} uploaded and published to the Services carousel!`,
      );
      setSuccess(`${payload.label} saved!`);
    } catch (err) {
      setBannerError(err.message || "Failed to upload banner image.");
    } finally {
      setUploadingBannerIndex(null);
      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index].value = "";
      }
    }
  };

  // Save a specific banner slot manually
  const handleSaveBannerItem = async (index) => {
    const currentBanner = banners[index];
    if (!currentBanner) return;

    if (!currentBanner.imageUrl || !currentBanner.imageUrl.trim()) {
      setBannerError(
        `Please upload an image or provide a valid Cloudinary URL for ${currentBanner.label || `Banner ${index + 1}`} before saving.`,
      );
      return;
    }

    setSavingBannerIndex(index);
    setBannerError("");
    setBannerSuccess("");

    try {
      const payload = {
        label: currentBanner.label || `Banner ${index + 1}`,
        imageUrl: currentBanner.imageUrl.trim(),
        imagePublicId: (currentBanner.imagePublicId || "").trim(),
        displayOrder: Number(currentBanner.displayOrder) || index + 1,
        isActive: currentBanner.isActive !== false,
      };

      const saved = currentBanner.id
        ? await updateServicesHeroBanner(currentBanner.id, payload)
        : await createServicesHeroBanner(payload);

      await loadBanners();
      setBannerSuccess(`${saved?.label || payload.label} saved successfully!`);
      setSuccess(`${saved?.label || payload.label} updated!`);
    } catch (err) {
      setBannerError(err.message || "Failed to save banner.");
    } finally {
      setSavingBannerIndex(null);
    }
  };

  // Toggle Active / Inactive on a banner
  const handleToggleBannerActive = async (index) => {
    const currentBanner = banners[index];
    if (!currentBanner) return;

    setBannerError("");
    setBannerSuccess("");

    // If unsaved draft, toggle locally
    if (!currentBanner.id) {
      handleBannerFieldChange(index, "isActive", !currentBanner.isActive);
      return;
    }

    try {
      const updated = await toggleServicesHeroBannerActive(currentBanner.id);
      setBanners((prev) =>
        prev.map((item, idx) =>
          idx === index
            ? {
                ...item,
                isActive: updated.isActive !== false,
              }
            : item,
        ),
      );
      const statusText = updated.isActive
        ? "Active (shown in carousel)"
        : "Inactive (hidden from public page)";
      setBannerSuccess(
        `${updated.label || `Banner ${index + 1}`} is now ${statusText}.`,
      );
      setSuccess(
        `${updated.label || `Banner ${index + 1}`} visibility updated.`,
      );
    } catch (err) {
      setBannerError(err.message || "Failed to toggle banner status.");
    }
  };

  // Move banner up/down in displayOrder
  const handleMoveBannerOrder = async (index, direction) => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    setBannerError("");
    const reordered = [...banners];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const normalized = reordered.map((b, idx) => ({
      ...b,
      displayOrder: idx + 1,
      label: /^Banner \d+$/i.test(b.label || "")
        ? `Banner ${idx + 1}`
        : b.label,
    }));

    setBanners(normalized);

    const savedIds = normalized.filter((b) => b.id != null).map((b) => b.id);
    if (savedIds.length > 1) {
      try {
        const updatedList = await reorderServicesHeroBanners(savedIds);
        if (Array.isArray(updatedList)) {
          const unsavedDrafts = normalized.filter((b) => b.id == null);
          setBanners([
            ...updatedList.map((b, idx) => ({
              id: b.id,
              label: b.label || `Banner ${idx + 1}`,
              imageUrl: b.imageUrl || "",
              imagePublicId: b.imagePublicId || "",
              displayOrder: b.displayOrder ?? idx + 1,
              isActive: b.isActive !== false,
            })),
            ...unsavedDrafts,
          ]);
        }
        setBannerSuccess("Banner carousel display order updated.");
      } catch (err) {
        setBannerError(err.message || "Failed to reorder banners.");
      }
    }
  };

  // Delete a specific banner with confirmation modal
  const handleDeleteBannerItem = (index) => {
    const currentBanner = banners[index];
    if (!currentBanner) return;

    const bannerTitle = currentBanner.label || `Banner ${index + 1}`;

    // If it's an unsaved draft card with no image and we have more than 1 slot, remove immediately
    if (!currentBanner.id && !currentBanner.imageUrl && banners.length > 1) {
      setBanners((prev) => prev.filter((_, idx) => idx !== index));
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: `Delete ${bannerTitle}`,
      message: `Are you sure you want to delete "${bannerTitle}"? If this is the only active banner, the public Services page will display the clean studio fallback.`,
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          if (currentBanner.id) {
            await deleteServicesHeroBannerById(currentBanner.id);
          }
          await loadBanners();
          setBannerSuccess(`${bannerTitle} deleted successfully.`);
          setSuccess(`${bannerTitle} removed.`);
          setConfirmModal({ isOpen: false });
        } catch (err) {
          setBannerError(err.message || "Failed to delete banner.");
          setConfirmModal({ isOpen: false });
        }
      },
    });
  };

  // Toggle Service Active
  const handleToggleService = async (id) => {
    try {
      const updated = await toggleServiceActive(id);
      setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
      setSuccess(`Service "${updated.title}" visibility toggled.`);
    } catch (err) {
      setError(err.message || "Failed to toggle service status.");
    }
  };

  // Open Service Delete Modal
  const openDeleteServiceModal = (service) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Service",
      message: `Are you sure you want to delete "${service.title}"? This cannot be undone.`,
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteService(service.id);
          setServices((prev) => prev.filter((s) => s.id !== service.id));
          setSuccess(`Service "${service.title}" deleted.`);
          setConfirmModal({ isOpen: false });
        } catch (err) {
          setError(err.message || "Failed to delete service.");
          setConfirmModal({ isOpen: false });
        }
      },
    });
  };

  // Toggle Process Step Active
  const handleToggleStep = async (id) => {
    try {
      const updated = await toggleProcessStepActive(id);
      setProcessSteps((prev) =>
        prev.map((st) => (st.id === id ? updated : st)),
      );
      setSuccess(`Process step "${updated.title}" status toggled.`);
    } catch (err) {
      setError(err.message || "Failed to toggle process step.");
    }
  };

  // Open Step Delete Modal
  const openDeleteStepModal = (step) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Process Step",
      message: `Are you sure you want to delete step "${step.title}"?`,
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteProcessStep(step.id);
          setProcessSteps((prev) => prev.filter((s) => s.id !== step.id));
          setSuccess(`Process step "${step.title}" deleted.`);
          setConfirmModal({ isOpen: false });
        } catch (err) {
          setError(err.message || "Failed to delete process step.");
          setConfirmModal({ isOpen: false });
        }
      },
    });
  };

  // Toggle Tool Active
  const handleToggleTool = async (id) => {
    try {
      const updated = await toggleToolActive(id);
      setTools((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setSuccess(`Tool "${updated.name}" status toggled.`);
    } catch (err) {
      setError(err.message || "Failed to toggle tool.");
    }
  };

  // Open Tool Delete Modal
  const openDeleteToolModal = (tool) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Software Tool",
      message: `Are you sure you want to remove "${tool.name}" from the production stack?`,
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteTool(tool.id);
          setTools((prev) => prev.filter((t) => t.id !== tool.id));
          setSuccess(`Tool "${tool.name}" removed.`);
          setConfirmModal({ isOpen: false });
        } catch (err) {
          setError(err.message || "Failed to delete tool.");
          setConfirmModal({ isOpen: false });
        }
      },
    });
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 outline-none transition-colors w-full";

  return (
    <div className="space-y-6 pb-16">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-brand-red inline-block" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
              CONTENT MANAGEMENT // PUBLIC SERVICES
            </span>
          </div>
          <h1 className="text-2xl font-display font-black uppercase tracking-tight text-white">
            Services Page CMS
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-0.5">
            Manage public catalog disciplines, hero workstation, process
            pipeline, software stack, and call-to-action
          </p>
        </div>

        {/* Global Action Shortcut: View Public Page */}
        <a
          href="/services"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 px-4 py-2.5 rounded-none transition-colors no-underline"
        >
          <span>View Public Services</span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 10L10 2M10 2H4M10 2V8" />
          </svg>
        </a>
      </div>

      {/* Global Alerts */}
      {success && (
        <div className="flex items-center gap-3 bg-brand-green/10 border border-brand-green/30 text-brand-green px-4 py-3 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-brand-red/10 border border-brand-red/30 text-brand-red px-4 py-3 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1 bg-[#0c0c0c] border border-white/10 p-1 rounded-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all rounded-none border cursor-pointer ${
                isActive
                  ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20"
                  : "bg-transparent text-neutral-400 hover:text-white hover:bg-white/[0.04] border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SERVICES CATALOG */}
      {activeTab === "SERVICES" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0c0c] border border-white/10 p-4 rounded-none">
            <div>
              <h2 className="text-sm font-display font-black uppercase text-white">
                Services Catalog ({services.length})
              </h2>
              <p className="text-[11px] font-mono text-neutral-400">
                Manage service cards shown in the 4x2 grid on /services
              </p>
            </div>
            <button
              onClick={() => setEditingService({})}
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-mono font-bold uppercase tracking-widest px-4 py-2.5 rounded-none border border-brand-red cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Service
            </button>
          </div>

          {loadingServices ? (
            <div className="p-8 text-center text-xs font-mono text-neutral-500 bg-[#0c0c0c] border border-white/10">
              Loading services catalog...
            </div>
          ) : services.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-neutral-500 bg-[#0c0c0c] border border-white/10">
              No services found. Click &quot;Add New Service&quot; to create
              one.
            </div>
          ) : (
            <div className="bg-[#0c0c0c] border border-white/10 overflow-x-auto rounded-none">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      #
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Title
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Slug
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Icon
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Theme
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Order
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {services.map((service, idx) => {
                    const isActive = service.isActive !== false;
                    const iconKey = resolveServiceIconKey(
                      service.icon,
                      service.slug,
                      service.title
                    );
                    const rowTheme = resolveServiceTheme(
                      service.colorTheme,
                      idx
                    );
                    return (
                      <tr
                        key={service.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3 text-neutral-500">
                          {service.orderNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-white font-medium">
                          <div>
                            <span>{service.title}</span>
                            {service.features && (
                              <span className="block text-[10px] text-neutral-500">
                                {service.features.length} features listed
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-neutral-400">
                          /services/{service.slug}
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center gap-2.5">
                            <span
                              className="w-8 h-8 rounded-[6px] bg-[#0a0a0a] border border-white/15 flex items-center justify-center shrink-0"
                              style={{ color: rowTheme.hex }}
                            >
                              <ServiceOutlineIcon
                                iconKey={iconKey}
                                className="w-5 h-5"
                              />
                            </span>
                            <span className="uppercase text-neutral-300 text-[11px]">
                              {iconKey}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-[4px]"
                            style={{
                              color: rowTheme.hex,
                              borderColor: `${rowTheme.hex}35`,
                              backgroundColor: `${rowTheme.hex}12`,
                            }}
                            title={`Theme: ${rowTheme.label}`}
                          >
                            <span
                              className="w-2 h-2 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: rowTheme.hex }}
                            />
                            {rowTheme.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-400">
                          {service.displayOrder ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleToggleService(service.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider border rounded-none cursor-pointer transition-colors ${
                              isActive
                                ? "bg-brand-green/10 text-brand-green border-brand-green/30 hover:bg-brand-green/20"
                                : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700"
                            }`}
                          >
                            {isActive ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <XIcon className="w-3 h-3" />
                            )}
                            {isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingService(service)}
                              title="Edit Service"
                              className="w-8 h-8 rounded-none bg-white/[0.04] hover:bg-white/[0.1] flex items-center justify-center text-neutral-300 border border-white/10 cursor-pointer transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openDeleteServiceModal(service)}
                              title="Delete Service"
                              className="w-8 h-8 rounded-none bg-white/[0.04] hover:bg-brand-red/20 text-neutral-300 hover:text-brand-red border border-white/10 hover:border-brand-red/40 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAGE HERO */}
      {activeTab === "HERO" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSavePageContent("Page Hero");
          }}
          className="space-y-6"
        >
          <div className="bg-[#0c0c0c] border border-white/10 p-5 rounded-none space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-sm font-display font-black uppercase text-white">
                  Hero Editorial Copy
                </h2>
                <p className="text-[11px] font-mono text-neutral-400">
                  Headline, eyebrow banner, and supporting value proposition
                </p>
              </div>
              <button
                type="submit"
                disabled={savingContent}
                className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-mono font-bold uppercase tracking-widest px-5 py-2.5 rounded-none border border-brand-red cursor-pointer transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {savingContent ? "Saving..." : "Save Hero"}
              </button>
            </div>

            {/* Eyebrow */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Eyebrow Badge Text
              </label>
              <input
                name="heroEyebrow"
                value={pageContent.heroEyebrow || ""}
                onChange={handleContentChange}
                placeholder="OUR SERVICES // FULL-SERVICE CREATIVE STUDIO"
                className={inputClasses}
              />
            </div>

            {/* Headlines */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  Headline Line 1
                </label>
                <input
                  name="heroHeadlineLine1"
                  value={pageContent.heroHeadlineLine1 || ""}
                  onChange={handleContentChange}
                  placeholder="CREATIVE SOLUTIONS"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  Headline Line 2
                </label>
                <input
                  name="heroHeadlineLine2"
                  value={pageContent.heroHeadlineLine2 || ""}
                  onChange={handleContentChange}
                  placeholder="THAT DRIVE"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  Headline Highlight (Red)
                </label>
                <input
                  name="heroHeadlineHighlight"
                  value={pageContent.heroHeadlineHighlight || ""}
                  onChange={handleContentChange}
                  placeholder="RESULTS."
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Hero Description Body
              </label>
              <textarea
                name="heroDescription"
                value={pageContent.heroDescription || ""}
                onChange={handleContentChange}
                rows={3}
                className={`${inputClasses} resize-none`}
              />
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase text-brand-red">
                  Primary Action Button
                </span>
                <input
                  name="heroPrimaryCtaText"
                  value={pageContent.heroPrimaryCtaText || ""}
                  onChange={handleContentChange}
                  placeholder="DISCUSS YOUR PROJECT"
                  className={inputClasses}
                />
                <input
                  name="heroPrimaryCtaLink"
                  value={pageContent.heroPrimaryCtaLink || ""}
                  onChange={handleContentChange}
                  placeholder="/contact"
                  className={inputClasses}
                />
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">
                  Secondary Action Link
                </span>
                <input
                  name="heroSecondaryCtaText"
                  value={pageContent.heroSecondaryCtaText || ""}
                  onChange={handleContentChange}
                  placeholder="VIEW WORK ARCHIVE"
                  className={inputClasses}
                />
                <input
                  name="heroSecondaryCtaLink"
                  value={pageContent.heroSecondaryCtaLink || ""}
                  onChange={handleContentChange}
                  placeholder="/portfolio"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Hero Banner Image Overview */}
          <div className="bg-[#0c0c0c] border border-white/10 p-5 rounded-none space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-sm font-display font-black uppercase text-white">
                  Hero Banner Image
                </h2>
                <p className="text-[11px] font-mono text-neutral-400">
                  Cloudinary banner image displayed as the full-width background
                  on the public Services hero
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("BANNER")}
                className="inline-flex items-center gap-1.5 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-none border border-brand-red/40 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Open Banner CMS Tab</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/[0.02] border border-white/10 p-3.5">
              <div className="w-32 aspect-[16/9] bg-[#141414] border border-white/15 overflow-hidden flex items-center justify-center shrink-0">
                {pageContent.heroBannerImageUrl ? (
                  <img
                    src={pageContent.heroBannerImageUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[9px] font-mono text-neutral-500 text-center px-1">
                    Studio Fallback
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white">
                    {pageContent.heroBannerImageUrl
                      ? "Custom Cloudinary Banner Active"
                      : "Default Studio Fallback"}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 border ${
                      pageContent.heroBannerImageUrl
                        ? "border-brand-green/40 text-brand-green bg-brand-green/10"
                        : "border-neutral-700 text-neutral-400 bg-neutral-900"
                    }`}
                  >
                    {pageContent.heroBannerImageUrl ? "ACTIVE" : "STANDBY"}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-400 truncate max-w-md">
                  {pageContent.heroBannerImageUrl ||
                    "No custom banner configured. Upload or replace via the Hero Banner Image tab."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("BANNER")}
                className="text-xs font-mono text-brand-red hover:underline shrink-0"
              >
                Manage Banner &rarr;
              </button>
            </div>
          </div>

          {/* Hero Workstation & Metrics */}
          <div className="bg-[#0c0c0c] border border-white/10 p-5 rounded-none space-y-4">
            <h2 className="text-sm font-display font-black uppercase text-white pb-3 border-b border-white/10">
              Studio Workstation &amp; Metric Indicators
            </h2>

            {/* Video URL */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Workstation Demo Video / Preview URL
              </label>
              <input
                name="heroVideoUrl"
                value={pageContent.heroVideoUrl || ""}
                onChange={handleContentChange}
                placeholder="/hero-demo.mp4 or Cloudinary MP4 URL"
                className={inputClasses}
              />
            </div>

            {/* Metric Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white/[0.02] border border-white/10 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">
                  Metric 1
                </span>
                <input
                  name="heroStat1Value"
                  value={pageContent.heroStat1Value || ""}
                  onChange={handleContentChange}
                  placeholder="4K+"
                  className={inputClasses}
                />
                <input
                  name="heroStat1Label"
                  value={pageContent.heroStat1Label || ""}
                  onChange={handleContentChange}
                  placeholder="Master Exports"
                  className={inputClasses}
                />
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/10 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-brand-red">
                  Metric 2 (Red)
                </span>
                <input
                  name="heroStat2Value"
                  value={pageContent.heroStat2Value || ""}
                  onChange={handleContentChange}
                  placeholder="48H"
                  className={inputClasses}
                />
                <input
                  name="heroStat2Label"
                  value={pageContent.heroStat2Label || ""}
                  onChange={handleContentChange}
                  placeholder="Avg First Draft"
                  className={inputClasses}
                />
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/10 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-brand-green">
                  Metric 3 (Green)
                </span>
                <input
                  name="heroStat3Value"
                  value={pageContent.heroStat3Value || ""}
                  onChange={handleContentChange}
                  placeholder="100%"
                  className={inputClasses}
                />
                <input
                  name="heroStat3Label"
                  value={pageContent.heroStat3Label || ""}
                  onChange={handleContentChange}
                  placeholder="Retention Focus"
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Visibility Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer bg-white/[0.03] border border-white/10 p-3 text-xs font-mono select-none">
                <input
                  type="checkbox"
                  name="heroShowStats"
                  checked={pageContent.heroShowStats}
                  onChange={handleContentChange}
                  className="accent-brand-red w-4 h-4"
                />
                <span className="text-white">Display Metric Stats Row</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white/[0.03] border border-white/10 p-3 text-xs font-mono select-none">
                <input
                  type="checkbox"
                  name="heroShowWorkstation"
                  checked={pageContent.heroShowWorkstation}
                  onChange={handleContentChange}
                  className="accent-brand-red w-4 h-4"
                />
                <span className="text-white">
                  Display Studio Workstation Monitor
                </span>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* TAB: HERO BANNER IMAGE (MULTI-BANNER CAROUSEL CMS 1..5) */}
      {activeTab === "BANNER" && (
        <div className="space-y-6">
          <div className="bg-[#0c0c0c] border border-white/10 p-5 rounded-none space-y-6">
            {/* Top Bar: Title, Counter Badge, and ADD ANOTHER BANNER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1">
                  <span className="w-2 h-2 bg-brand-red rounded-none inline-block" />
                  <h2 className="text-sm font-display font-black uppercase text-white">
                    Hero Banner Image CMS (Carousel)
                  </h2>
                  <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 bg-white/[0.06] border border-white/15 text-white">
                    {banners.length} / {MAX_HERO_BANNERS} banners
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                    {activePreviewBanners.length} active on public page
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-400">
                  Manage up to 5 responsive hero banners. All active banners
                  automatically cycle in a smooth left-to-right carousel on the
                  public Services page.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddAnotherBanner}
                  disabled={
                    banners.length >= MAX_HERO_BANNERS ||
                    uploadingBannerIndex !== null
                  }
                  title={
                    banners.length >= MAX_HERO_BANNERS
                      ? "Maximum of 5 hero banners reached."
                      : "Add another banner slot to the Services hero carousel"
                  }
                  className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-none border border-brand-red cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {banners.length >= MAX_HERO_BANNERS
                      ? "Max 5 Banners Reached"
                      : "Add Another Banner"}
                  </span>
                </button>
              </div>
            </div>

            {/* Maximum reached notice */}
            {banners.length >= MAX_HERO_BANNERS && (
              <div className="flex items-center justify-between gap-2 bg-amber-950/30 border border-amber-700/50 text-amber-200 text-xs font-mono px-3.5 py-2.5">
                <span>
                  Maximum limit reached ({banners.length} / {MAX_HERO_BANNERS}{" "}
                  banners). Delete or replace an existing banner to upload a
                  different one.
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">
                  LIMIT: 5 MAX
                </span>
              </div>
            )}

            {/* Feedback Notifications */}
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
                    Uploading{" "}
                    {banners[uploadingBannerIndex]?.label ||
                      `Banner ${uploadingBannerIndex + 1}`}{" "}
                    to Cloudinary (designtouch/services)...
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

            {/* Live Public Carousel Simulation & Asset Guidelines */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-neutral-400">
                  <span>Public Services Hero Carousel Live Simulation</span>
                  <span
                    className={
                      activePreviewBanners.length > 0
                        ? "text-brand-green"
                        : "text-neutral-500"
                    }
                  >
                    {activePreviewBanners.length > 1
                      ? `● Auto-Sliding Carousel (${activePreviewBanners.length} Active Banners)`
                      : activePreviewBanners.length === 1
                        ? "● Static Hero (1 Active Banner)"
                        : "○ Default Studio Fallback (0 Active Banners)"}
                  </span>
                </div>

                <div className="relative w-full aspect-[21/9] min-h-[190px] bg-[#080808] border border-white/20 overflow-hidden flex items-center p-4 sm:p-6 select-none shadow-2xl">
                  {activePreviewBanners.length > 0 ? (
                    <>
                      <div
                        className="absolute inset-0 flex h-full w-full transition-transform duration-700 ease-in-out"
                        style={{
                          transform: `translate3d(-${(previewSlideIndex % activePreviewBanners.length) * 100}%, 0, 0)`,
                        }}
                      >
                        {activePreviewBanners.map((b, sIdx) => (
                          <div
                            key={b.id || `sim-${sIdx}`}
                            className="relative h-full w-full shrink-0 grow-0 basis-full bg-no-repeat bg-cover bg-[position:right_center]"
                            style={{
                              backgroundImage: `url("${b.imageUrl}")`,
                              backgroundSize: "cover",
                              backgroundPosition: "right center",
                              backgroundRepeat: "no-repeat",
                            }}
                          />
                        ))}
                      </div>
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(90deg, #080808 0%, #080808 45.5%, rgba(8,8,8,0.92) 49%, rgba(8,8,8,0.3) 55%, rgba(8,8,8,0) 62%, rgba(8,8,8,0) 100%)",
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/70 via-transparent to-[#080808]/25 pointer-events-none" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c] via-[#080808] to-[#040404]" />
                  )}

                  <div className="relative z-10 max-w-sm space-y-2 pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-brand-red inline-block" />
                      <span className="text-[8px] font-mono font-semibold uppercase tracking-widest text-neutral-300">
                        {pageContent.heroEyebrow || "OUR SERVICES"}
                      </span>
                    </div>
                    <div className="font-display text-sm sm:text-base font-black uppercase text-white leading-tight">
                      {pageContent.heroHeadlineLine1 || "CREATIVE SOLUTIONS"}{" "}
                      <span className="text-brand-red">
                        {pageContent.heroHeadlineHighlight || "RESULTS."}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[8px] font-mono px-2 py-1 bg-brand-red text-white uppercase font-bold">
                        {pageContent.heroPrimaryCtaText ||
                          "DISCUSS YOUR PROJECT"}
                      </span>
                      <span className="text-[8px] font-mono px-2 py-1 bg-white/10 text-neutral-300 uppercase">
                        {pageContent.heroSecondaryCtaText || "VIEW ARCHIVE"}
                      </span>
                    </div>
                  </div>

                  {/* Slide dots in simulation when > 1 active banner */}
                  {activePreviewBanners.length > 1 && (
                    <div className="absolute bottom-2.5 right-3 z-20 flex items-center gap-1.5 bg-black/65 border border-white/10 px-2.5 py-1">
                      {activePreviewBanners.map((b, sIdx) => {
                        const isCurr =
                          sIdx ===
                          previewSlideIndex % activePreviewBanners.length;
                        return (
                          <button
                            key={b.id || `dot-${sIdx}`}
                            type="button"
                            onClick={() => setPreviewSlideIndex(sIdx)}
                            className={`h-1.5 transition-all cursor-pointer ${
                              isCurr
                                ? "w-5 bg-brand-red"
                                : "w-1.5 bg-white/40 hover:bg-white/70"
                            }`}
                            title={b.label || `Slide ${sIdx + 1}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-3">
                <div className="bg-white/[0.02] border border-white/10 p-4 space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                    Carousel &amp; Asset Guidelines
                  </h3>
                  <div className="space-y-2 text-[11px] font-mono text-neutral-300">
                    <div className="flex justify-between py-1 border-b border-white/[0.06]">
                      <span className="text-neutral-500">Maximum banners:</span>
                      <span className="text-white">5 Banners</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.06]">
                      <span className="text-neutral-500">Slide interval:</span>
                      <span className="text-white">2.0s (Right-to-Left)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.06]">
                      <span className="text-neutral-500">
                        Supported formats:
                      </span>
                      <span className="text-white">JPG, JPEG, PNG, WebP</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.06]">
                      <span className="text-neutral-500">Max file size:</span>
                      <span className="text-white">10 MB per banner</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.06]">
                      <span className="text-neutral-500">Storage target:</span>
                      <span className="text-white">
                        Cloudinary / designtouch/services
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Banner Editor Cards (Banner 1 .. Banner 5) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Configured Hero Banners ({banners.length} / {MAX_HERO_BANNERS}
                  )
                </h3>
                <span className="text-[10px] font-mono text-neutral-400">
                  Ordered by Display Order (ascending)
                </span>
              </div>

              {loadingBanners ? (
                <div className="p-8 text-center text-xs font-mono text-neutral-400 border border-white/10">
                  Loading hero banners...
                </div>
              ) : (
                <div className="space-y-4">
                  {banners.map((banner, index) => {
                    const isUploadingThis = uploadingBannerIndex === index;
                    const isSavingThis = savingBannerIndex === index;
                    const bannerTitle = banner.label || `Banner ${index + 1}`;

                    return (
                      <div
                        key={
                          banner.id ? `banner-${banner.id}` : `draft-${index}`
                        }
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
                                handleBannerFieldChange(
                                  index,
                                  "label",
                                  e.target.value,
                                )
                              }
                              placeholder={`Banner ${index + 1}`}
                              aria-label={`Banner ${index + 1} label`}
                              className="bg-black border border-white/15 px-2.5 py-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-brand-red w-36 sm:w-44"
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
                                ID: {banner.id}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-amber-400 uppercase">
                                ● Unsaved Slot
                              </span>
                            )}
                          </div>

                          {/* Order & Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Up / Down order controls */}
                            <div className="inline-flex items-center border border-white/15 bg-black">
                              <button
                                type="button"
                                onClick={() =>
                                  handleMoveBannerOrder(index, "UP")
                                }
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
                                onClick={() =>
                                  handleMoveBannerOrder(index, "DOWN")
                                }
                                disabled={index === banners.length - 1}
                                title="Move Banner Later in Carousel"
                                className="p-1.5 text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Hidden file input per banner */}
                            <input
                              ref={(el) => {
                                fileInputRefs.current[index] = el;
                              }}
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/jpg"
                              onChange={(e) => handleBannerFileSelect(index, e)}
                              className="hidden"
                            />

                            {/* Upload / Replace button */}
                            <button
                              type="button"
                              onClick={() =>
                                fileInputRefs.current[index]?.click()
                              }
                              disabled={isUploadingThis}
                              className="inline-flex items-center gap-1.5 bg-brand-red hover:bg-[#dc2626] text-white text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-none border border-brand-red cursor-pointer transition-colors disabled:opacity-50"
                            >
                              {isUploadingThis ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Uploading...</span>
                                </>
                              ) : banner.imageUrl ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Replace Image</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload Image</span>
                                </>
                              )}
                            </button>

                            {/* Save Banner button */}
                            <button
                              type="button"
                              onClick={() => handleSaveBannerItem(index)}
                              disabled={isSavingThis || isUploadingThis}
                              className="inline-flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/15 text-white text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-none border border-white/20 cursor-pointer transition-colors disabled:opacity-50"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>{isSavingThis ? "Saving..." : "Save"}</span>
                            </button>

                            {/* Delete Banner button */}
                            {(banner.id ||
                              banner.imageUrl ||
                              banners.length > 1) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteBannerItem(index)}
                                disabled={isUploadingThis || isSavingThis}
                                className="inline-flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-none border border-red-800/60 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Card Body: Thumbnail Preview + Cloudinary Metadata Fields */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                          {/* Banner 16:9 Preview */}
                          <div className="lg:col-span-5">
                            <div className="relative aspect-[16/9] w-full bg-[#121212] border border-white/15 overflow-hidden flex items-center justify-center">
                              {banner.imageUrl ? (
                                <img
                                  src={banner.imageUrl}
                                  alt={`${bannerTitle} preview`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center p-4 text-center">
                                  <ImageIcon className="w-6 h-6 text-neutral-500 mb-1.5" />
                                  <span className="text-[11px] font-mono uppercase text-neutral-400">
                                    No Image Uploaded for {bannerTitle}
                                  </span>
                                  <span className="text-[10px] font-mono text-neutral-500 mt-0.5">
                                    Click &ldquo;Upload Image&rdquo; to upload
                                    to Cloudinary
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Banner Fields */}
                          <div className="lg:col-span-7 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div className="sm:col-span-3">
                                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                                  Cloudinary Secure URL
                                </label>
                                <input
                                  type="text"
                                  value={banner.imageUrl || ""}
                                  onChange={(e) =>
                                    handleBannerFieldChange(
                                      index,
                                      "imageUrl",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="https://res.cloudinary.com/..."
                                  className={inputClasses}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                                  Display Order
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  max={MAX_HERO_BANNERS}
                                  value={banner.displayOrder ?? index + 1}
                                  onChange={(e) =>
                                    handleBannerFieldChange(
                                      index,
                                      "displayOrder",
                                      parseInt(e.target.value, 10) || 1,
                                    )
                                  }
                                  className={inputClasses}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                                Cloudinary Public ID
                              </label>
                              <input
                                type="text"
                                value={banner.imagePublicId || ""}
                                onChange={(e) =>
                                  handleBannerFieldChange(
                                    index,
                                    "imagePublicId",
                                    e.target.value,
                                  )
                                }
                                placeholder="designtouch/services/..."
                                className={inputClasses}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OUR PROCESS */}
      {activeTab === "PROCESS" && (
        <div className="space-y-6">
          {/* Section Headers Card */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSavePageContent("Process Section Header");
            }}
            className="bg-[#0c0c0c] border border-white/10 p-5 rounded-none space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-sm font-display font-black uppercase text-white">
                  Process Section Intro
                </h2>
                <p className="text-[11px] font-mono text-neutral-400">
                  Header titles and description
                </p>
              </div>
              <button
                type="submit"
                disabled={savingContent}
                className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-mono font-bold uppercase tracking-widest px-4 py-2 rounded-none border border-brand-red cursor-pointer transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {savingContent ? "Saving..." : "Save Headers"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  Eyebrow Text
                </label>
                <input
                  name="processEyebrow"
                  value={pageContent.processEyebrow || ""}
                  onChange={handleContentChange}
                  placeholder="HOW WE WORK // METHODOLOGY"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  Heading Title
                </label>
                <input
                  name="processHeading"
                  value={pageContent.processHeading || ""}
                  onChange={handleContentChange}
                  placeholder="OUR PROCESS"
                  className={inputClasses}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Intro Description
              </label>
              <textarea
                name="processDescription"
                value={pageContent.processDescription || ""}
                onChange={handleContentChange}
                rows={2}
                className={`${inputClasses} resize-none`}
              />
            </div>
          </form>

          {/* Process Steps Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0c0c] border border-white/10 p-4 rounded-none">
              <div>
                <h3 className="text-sm font-display font-black uppercase text-white">
                  Workflow Timeline Steps ({processSteps.length})
                </h3>
                <p className="text-[11px] font-mono text-neutral-400">
                  Phased delivery steps displayed on the public timeline
                </p>
              </div>
              <button
                onClick={() => setEditingStep({})}
                className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-mono font-bold uppercase tracking-widest px-4 py-2.5 rounded-none border border-brand-red cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Process Step
              </button>
            </div>

            {loadingSteps ? (
              <div className="p-8 text-center text-xs font-mono text-neutral-500 bg-[#0c0c0c] border border-white/10">
                Loading process steps...
              </div>
            ) : processSteps.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-neutral-500 bg-[#0c0c0c] border border-white/10">
                No process steps found. Click &quot;Add Process Step&quot; to
                create one.
              </div>
            ) : (
              <div className="bg-[#0c0c0c] border border-white/10 overflow-x-auto rounded-none">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Step #
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Title
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Description
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Icon
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {processSteps.map((step) => {
                      const isActive = step.isActive !== false;
                      const stepIconMeta = getProcessIconMeta(
                        step.icon,
                        step.title,
                        step.stepNumber
                      );
                      return (
                        <tr
                          key={step.id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 py-3 text-brand-red font-bold">
                            {String(step.stepNumber).padStart(2, "0")}
                          </td>
                          <td className="px-4 py-3 text-white font-medium">
                            {step.title}
                          </td>
                          <td className="px-4 py-3 text-neutral-400 max-w-xs truncate">
                            {step.description}
                          </td>
                          <td className="px-4 py-3">
                            <div className="inline-flex items-center gap-2.5">
                              <span className="w-8 h-8 rounded-full bg-[#0b0b0b] border border-white/20 flex items-center justify-center shrink-0">
                                <img
                                  src={stepIconMeta.src}
                                  alt={stepIconMeta.label}
                                  width={16}
                                  height={16}
                                  className="w-4 h-4 object-contain"
                                />
                              </span>
                              <span className="uppercase text-neutral-300 text-[11px]">
                                {stepIconMeta.shortLabel}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleToggleStep(step.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider border rounded-none cursor-pointer transition-colors ${
                                isActive
                                  ? "bg-brand-green/10 text-brand-green border-brand-green/30 hover:bg-brand-green/20"
                                  : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700"
                              }`}
                            >
                              {isActive ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <XIcon className="w-3 h-3" />
                              )}
                              {isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingStep(step)}
                                title="Edit Step"
                                className="w-8 h-8 rounded-none bg-white/[0.04] hover:bg-white/[0.1] flex items-center justify-center text-neutral-300 border border-white/10 cursor-pointer transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openDeleteStepModal(step)}
                                title="Delete Step"
                                className="w-8 h-8 rounded-none bg-white/[0.04] hover:bg-brand-red/20 text-neutral-300 hover:text-brand-red border border-white/10 hover:border-brand-red/40 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: TOOLS WE USE */}
      {activeTab === "TOOLS" && (
        <div className="space-y-6">
          {/* Section Headers Card */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSavePageContent("Tools Section Header");
            }}
            className="bg-[#0c0c0c] border border-white/10 p-5 rounded-none space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-sm font-display font-black uppercase text-white">
                  Tools Section Intro
                </h2>
                <p className="text-[11px] font-mono text-neutral-400">
                  Header titles and description
                </p>
              </div>
              <button
                type="submit"
                disabled={savingContent}
                className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-mono font-bold uppercase tracking-widest px-4 py-2 rounded-none border border-brand-red cursor-pointer transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {savingContent ? "Saving..." : "Save Headers"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  Eyebrow Text
                </label>
                <input
                  name="toolsEyebrow"
                  value={pageContent.toolsEyebrow || ""}
                  onChange={handleContentChange}
                  placeholder="PRODUCTION STACK // HARDWARE & SOFTWARE"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  Heading Title
                </label>
                <input
                  name="toolsHeading"
                  value={pageContent.toolsHeading || ""}
                  onChange={handleContentChange}
                  placeholder="TOOLS WE USE"
                  className={inputClasses}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Intro Description
              </label>
              <textarea
                name="toolsDescription"
                value={pageContent.toolsDescription || ""}
                onChange={handleContentChange}
                rows={2}
                className={`${inputClasses} resize-none`}
              />
            </div>
          </form>

          {/* Tools Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0c0c] border border-white/10 p-4 rounded-none">
              <div>
                <h3 className="text-sm font-display font-black uppercase text-white">
                  Software Stack Assets ({tools.length})
                </h3>
                <p className="text-[11px] font-mono text-neutral-400">
                  Applications showcased on the tools row grid
                </p>
              </div>
              <button
                onClick={() => setEditingTool({})}
                className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-mono font-bold uppercase tracking-widest px-4 py-2.5 rounded-none border border-brand-red cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Tool
              </button>
            </div>

            {loadingTools ? (
              <div className="p-8 text-center text-xs font-mono text-neutral-500 bg-[#0c0c0c] border border-white/10">
                Loading production stack tools...
              </div>
            ) : tools.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-neutral-500 bg-[#0c0c0c] border border-white/10">
                No tools configured. Click &quot;Add Tool&quot; to add one.
              </div>
            ) : (
              <div className="bg-[#0c0c0c] border border-white/10 overflow-x-auto rounded-none">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Icon
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Name
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Role / Specialty
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Order
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {tools.map((tool) => {
                      const isActive = tool.isActive !== false;
                      const toolIconMeta = resolveToolIconMeta(tool);
                      return (
                        <tr
                          key={tool.id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="inline-flex items-center gap-2.5">
                              {toolIconMeta.hasIcon && toolIconMeta.src ? (
                                <img
                                  src={toolIconMeta.src}
                                  alt={tool.name}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 object-contain shrink-0"
                                />
                              ) : (
                                <span className="w-8 h-8 rounded-[7px] bg-[#141414] border border-white/15 flex items-center justify-center shrink-0 font-mono text-[11px] font-bold text-neutral-200">
                                  {tool.iconKey || toolIconMeta.shortCode}
                                </span>
                              )}
                              <div>
                                <span className="block text-[11px] text-neutral-200 font-bold uppercase">
                                  {tool.iconKey || toolIconMeta.shortCode}
                                </span>
                                <span className="block text-[9px] text-neutral-500">
                                  {toolIconMeta.hasIcon && toolIconMeta.filename
                                    ? toolIconMeta.filename
                                    : "Monogram fallback"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white font-medium">
                            {tool.name}
                          </td>
                          <td className="px-4 py-3 text-neutral-400">
                            {tool.role || "—"}
                          </td>
                          <td className="px-4 py-3 text-neutral-400">
                            {tool.displayOrder ?? 0}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleToggleTool(tool.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider border rounded-none cursor-pointer transition-colors ${
                                isActive
                                  ? "bg-brand-green/10 text-brand-green border-brand-green/30 hover:bg-brand-green/20"
                                  : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700"
                              }`}
                            >
                              {isActive ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <XIcon className="w-3 h-3" />
                              )}
                              {isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingTool(tool)}
                                title="Edit Tool"
                                className="w-8 h-8 rounded-none bg-white/[0.04] hover:bg-white/[0.1] flex items-center justify-center text-neutral-300 border border-white/10 cursor-pointer transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openDeleteToolModal(tool)}
                                title="Delete Tool"
                                className="w-8 h-8 rounded-none bg-white/[0.04] hover:bg-brand-red/20 text-neutral-300 hover:text-brand-red border border-white/10 hover:border-brand-red/40 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: BOTTOM CTA */}
      {activeTab === "CTA" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSavePageContent("Bottom Call-to-Action");
          }}
          className="bg-[#0c0c0c] border border-white/10 p-5 rounded-none space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-sm font-display font-black uppercase text-white">
                Bottom Call-to-Action
              </h2>
              <p className="text-[11px] font-mono text-neutral-400">
                Conversion banner displayed at the bottom of /services
              </p>
            </div>
            <button
              type="submit"
              disabled={savingContent}
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-mono font-bold uppercase tracking-widest px-5 py-2.5 rounded-none border border-brand-red cursor-pointer transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {savingContent ? "Saving..." : "Save CTA"}
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Availability Eyebrow
            </label>
            <input
              name="ctaEyebrow"
              value={pageContent.ctaEyebrow || ""}
              onChange={handleContentChange}
              placeholder="STUDIO AVAILABILITY // NOW ACCEPTING COMMISSIONS"
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Headline Line 1
              </label>
              <input
                name="ctaHeadingLine1"
                value={pageContent.ctaHeadingLine1 || ""}
                onChange={handleContentChange}
                placeholder="LET’S CREATE SOMETHING"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Headline Line 2
              </label>
              <input
                name="ctaHeadingLine2"
                value={pageContent.ctaHeadingLine2 || ""}
                onChange={handleContentChange}
                placeholder="AMAZING"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Headline Highlight (Red)
              </label>
              <input
                name="ctaHeadingHighlight"
                value={pageContent.ctaHeadingHighlight || ""}
                onChange={handleContentChange}
                placeholder="TOGETHER."
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Description Body
            </label>
            <textarea
              name="ctaDescription"
              value={pageContent.ctaDescription || ""}
              onChange={handleContentChange}
              rows={3}
              className={`${inputClasses} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                CTA Button Text
              </label>
              <input
                name="ctaButtonText"
                value={pageContent.ctaButtonText || ""}
                onChange={handleContentChange}
                placeholder="GET IN TOUCH"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                CTA Destination URL
              </label>
              <input
                name="ctaButtonLink"
                value={pageContent.ctaButtonLink || ""}
                onChange={handleContentChange}
                placeholder="/contact"
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Accent Note (Optional subtitle)
            </label>
            <input
              name="ctaAccentNote"
              value={pageContent.ctaAccentNote || ""}
              onChange={handleContentChange}
              placeholder="Free 30-min strategy call • Fast 48h turnaround"
              className={inputClasses}
            />
          </div>
        </form>
      )}

      {/* MODAL 1: Service Form (New / Edit) */}
      {editingService !== null && (
        <ServiceForm
          service={Object.keys(editingService).length ? editingService : null}
          onClose={() => setEditingService(null)}
          onSaved={() => {
            setEditingService(null);
            setSuccess("Service saved successfully!");
            loadServices();
          }}
        />
      )}

      {/* MODAL 2: Process Step Modal (New / Edit) */}
      {editingStep !== null && (
        <ProcessStepModal
          step={Object.keys(editingStep).length ? editingStep : null}
          onClose={() => setEditingStep(null)}
          onSaved={() => {
            setEditingStep(null);
            setSuccess("Process step saved successfully!");
            loadProcessSteps();
          }}
        />
      )}

      {/* MODAL 3: Tool Modal (New / Edit) */}
      {editingTool !== null && (
        <ToolModal
          tool={Object.keys(editingTool).length ? editingTool : null}
          onClose={() => setEditingTool(null)}
          onSaved={() => {
            setEditingTool(null);
            setSuccess("Tool saved successfully!");
            loadTools();
          }}
        />
      )}

      {/* MODAL 4: Custom Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false })}
      />
    </div>
  );
}
