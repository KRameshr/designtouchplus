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
} from "lucide-react";
import ServiceForm from "@/components/admin/ServiceForm";
import ProcessStepModal from "@/components/admin/ProcessStepModal";
import ToolModal from "@/components/admin/ToolModal";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import {
  getServicesPageContent,
  updateServicesPageContent,
  uploadServicesHeroImage,
  deleteServicesHeroBanner,
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

export default function AdminServicesPage() {
  const [activeTab, setActiveTab] = useState("SERVICES");

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

  // Banner Image upload state
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bannerSuccess, setBannerSuccess] = useState("");
  const [bannerError, setBannerError] = useState("");

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
    loadServices();
    loadProcessSteps();
    loadTools();
  }, [loadContent, loadServices, loadProcessSteps, loadTools]);

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
      setSuccess(`${sectionName || "Services page content"} saved successfully!`);
    } catch (err) {
      setError(err.message || "Failed to save services page content.");
    } finally {
      setSavingContent(false);
    }
  };

  // Handle banner image upload
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    const validExts = ["jpg", "jpeg", "png", "webp"];

    if (!validTypes.includes(file.type) && !validExts.includes(extension)) {
      setBannerError("Invalid file type. Please upload a JPG, PNG, or WebP image.");
      return;
    }

    const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_BYTES) {
      setBannerError("Image file size exceeds the 10 MB limit.");
      return;
    }

    setUploadingImage(true);
    setBannerError("");
    setBannerSuccess("");
    setUploadProgress(25);

    try {
      setUploadProgress(60);
      const res = await uploadServicesHeroImage(file);
      setUploadProgress(90);

      const updated = {
        ...pageContent,
        heroBannerImageUrl: res.secureUrl,
        heroBannerImagePublicId: res.publicId,
      };
      setPageContent(updated);

      await updateServicesPageContent(updated);
      setUploadProgress(100);
      setBannerSuccess("Hero banner image uploaded and published successfully!");
      setSuccess("Services hero banner updated!");
    } catch (err) {
      setBannerError(err.message || "Failed to upload hero banner image.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle banner image deletion with confirmation modal
  const handleDeleteBannerClick = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Hero Banner Image",
      message:
        "Are you sure you want to delete the Services hero banner image? The public Services page will revert to its clean default studio fallback.",
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteServicesHeroBanner();
          setPageContent((prev) => ({
            ...prev,
            heroBannerImageUrl: "",
            heroBannerImagePublicId: "",
          }));
          setBannerSuccess("Hero banner image removed successfully.");
          setSuccess("Services hero banner image deleted.");
          setConfirmModal({ isOpen: false });
        } catch (err) {
          setBannerError(err.message || "Failed to delete banner image.");
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
      setProcessSteps((prev) => prev.map((st) => (st.id === id ? updated : st)));
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
            Manage public catalog disciplines, hero workstation, process pipeline, software stack, and call-to-action
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
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
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
              No services found. Click &quot;Add New Service&quot; to create one.
            </div>
          ) : (
            <div className="bg-[#0c0c0c] border border-white/10 overflow-x-auto rounded-none">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">#</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Title</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Slug</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Icon</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Theme</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Order</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {services.map((service) => {
                    const isActive = service.isActive !== false;
                    return (
                      <tr key={service.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-neutral-500">{service.orderNumber || "—"}</td>
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
                        <td className="px-4 py-3 text-neutral-400">/services/{service.slug}</td>
                        <td className="px-4 py-3 uppercase text-neutral-300">{service.icon || "video"}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-block w-3 h-3 border border-white/20"
                            style={{ backgroundColor: service.colorTheme || "#ef4444" }}
                            title={service.colorTheme}
                          />
                        </td>
                        <td className="px-4 py-3 text-neutral-400">{service.displayOrder ?? 0}</td>
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
                            {isActive ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
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
                <h2 className="text-sm font-display font-black uppercase text-white">Hero Editorial Copy</h2>
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
                <span className="text-[10px] font-mono font-bold uppercase text-brand-red">Primary Action Button</span>
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
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Secondary Action Link</span>
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
                <h2 className="text-sm font-display font-black uppercase text-white">Hero Banner Image</h2>
                <p className="text-[11px] font-mono text-neutral-400">
                  Cloudinary banner image displayed inside the studio monitor frame on the public Services hero
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
                  <span className="text-[9px] font-mono text-neutral-500 text-center px-1">Studio Fallback</span>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white">
                    {pageContent.heroBannerImageUrl ? "Custom Cloudinary Banner Active" : "Default Studio Fallback"}
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
                  {pageContent.heroBannerImageUrl || "No custom banner configured. Upload or replace via the Hero Banner Image tab."}
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
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Metric 1</span>
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
                <span className="text-[10px] font-mono font-bold uppercase text-brand-red">Metric 2 (Red)</span>
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
                <span className="text-[10px] font-mono font-bold uppercase text-brand-green">Metric 3 (Green)</span>
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
                <span className="text-white">Display Studio Workstation Monitor</span>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* TAB: HERO BANNER IMAGE */}
      {activeTab === "BANNER" && (
        <div className="space-y-6">
          <div className="bg-[#0c0c0c] border border-white/10 p-5 rounded-none space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-brand-red rounded-none inline-block" />
                  <h2 className="text-sm font-display font-black uppercase text-white">
                    Hero Banner Image CMS
                  </h2>
                </div>
                <p className="text-[11px] font-mono text-neutral-400">
                  Responsive banner image shown inside the studio monitor frame on the public Services page hero.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-none border border-brand-red cursor-pointer transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : pageContent.heroBannerImageUrl ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace Image</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose &amp; Upload Image</span>
                    </>
                  )}
                </button>
                {pageContent.heroBannerImageUrl && (
                  <button
                    type="button"
                    onClick={handleDeleteBannerClick}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-none border border-red-800/60 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Image</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSavePageContent("Hero Banner")}
                  disabled={savingContent || uploadingImage}
                  className="inline-flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/10 text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-none border border-white/20 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingContent ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>

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
            {uploadingImage && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                  <span>Uploading to Cloudinary (designtouch/services)...</span>
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

            {/* Live Preview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Preview Frame */}
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-neutral-400">
                  <span>Live Monitor Preview (16:9 Aspect Ratio)</span>
                  <span className={pageContent.heroBannerImageUrl ? "text-brand-green" : "text-neutral-500"}>
                    {pageContent.heroBannerImageUrl ? "● Custom Image Active" : "○ Default Studio Fallback"}
                  </span>
                </div>

                <div className="relative bg-[#0c0c0c] border border-white/20 p-2.5 sm:p-3 shadow-2xl">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08] px-1 text-[10px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse inline-block" />
                      <span className="text-white font-bold uppercase tracking-wider">STUDIO BANNER // DISPLAY 01</span>
                    </div>
                    <span className="text-neutral-400">SERVICES HERO</span>
                  </div>

                  <div className="relative aspect-[16/9] w-full bg-[#141414] overflow-hidden border border-white/10 flex items-center justify-center">
                    {pageContent.heroBannerImageUrl ? (
                      <img
                        src={pageContent.heroBannerImageUrl}
                        alt="Services hero banner preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#121212] via-[#161616] to-[#0c0c0c]">
                        <div className="w-12 h-12 border border-white/15 bg-white/[0.04] flex items-center justify-center mb-3 text-neutral-400">
                          <ImageIcon className="w-6 h-6 text-neutral-400" />
                        </div>
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-300">
                          No Custom Banner Configured
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 mt-1">
                          The public page currently displays the clean studio fallback.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Details & Manual Controls */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white/[0.02] border border-white/10 p-4 space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                    Asset Metadata &amp; Guidelines
                  </h3>
                  <div className="space-y-2 text-[11px] font-mono text-neutral-300">
                    <div className="flex justify-between py-1 border-b border-white/[0.06]">
                      <span className="text-neutral-500">Supported formats:</span>
                      <span className="text-white">JPG, JPEG, PNG, WebP</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.06]">
                      <span className="text-neutral-500">Max file size:</span>
                      <span className="text-white">10 MB</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.06]">
                      <span className="text-neutral-500">Recommended ratio:</span>
                      <span className="text-white">16:9 (1920 × 1080)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.06]">
                      <span className="text-neutral-500">Storage target:</span>
                      <span className="text-white">Cloudinary / designtouch/services</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/10 p-4 space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                    Direct Image Configuration
                  </h3>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      Cloudinary Secure URL
                    </label>
                    <input
                      name="heroBannerImageUrl"
                      value={pageContent.heroBannerImageUrl || ""}
                      onChange={handleContentChange}
                      placeholder="https://res.cloudinary.com/..."
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                      Cloudinary Public ID
                    </label>
                    <input
                      name="heroBannerImagePublicId"
                      value={pageContent.heroBannerImagePublicId || ""}
                      onChange={handleContentChange}
                      placeholder="designtouch/services/..."
                      className={inputClasses}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-neutral-500">
                    Uploading a file automatically populates and saves these fields to Cloudinary and the database.
                  </p>
                </div>
              </div>
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
                <h2 className="text-sm font-display font-black uppercase text-white">Process Section Intro</h2>
                <p className="text-[11px] font-mono text-neutral-400">Header titles and description</p>
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
                No process steps found. Click &quot;Add Process Step&quot; to create one.
              </div>
            ) : (
              <div className="bg-[#0c0c0c] border border-white/10 overflow-x-auto rounded-none">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Step #</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Title</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Description</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Icon</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {processSteps.map((step) => {
                      const isActive = step.isActive !== false;
                      return (
                        <tr key={step.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-brand-red font-bold">
                            {String(step.stepNumber).padStart(2, "0")}
                          </td>
                          <td className="px-4 py-3 text-white font-medium">{step.title}</td>
                          <td className="px-4 py-3 text-neutral-400 max-w-xs truncate">{step.description}</td>
                          <td className="px-4 py-3 uppercase text-neutral-300">{step.icon || "discover"}</td>
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
                              {isActive ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
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
                <h2 className="text-sm font-display font-black uppercase text-white">Tools Section Intro</h2>
                <p className="text-[11px] font-mono text-neutral-400">Header titles and description</p>
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
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Key</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Name</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Role / Specialty</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Order</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {tools.map((tool) => {
                      const isActive = tool.isActive !== false;
                      return (
                        <tr key={tool.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <span className="w-7 h-7 flex items-center justify-center font-display font-black text-xs border border-white/20 bg-white/[0.05] text-white">
                              {tool.iconKey || tool.name.substring(0, 2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white font-medium">{tool.name}</td>
                          <td className="px-4 py-3 text-neutral-400">{tool.role || "—"}</td>
                          <td className="px-4 py-3 text-neutral-400">{tool.displayOrder ?? 0}</td>
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
                              {isActive ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
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
              <h2 className="text-sm font-display font-black uppercase text-white">Bottom Call-to-Action</h2>
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
