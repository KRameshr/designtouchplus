"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Save,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Plus,
  Pencil,
  ArrowUp,
  ArrowDown,
  LayoutTemplate,
  BarChart3,
  BookOpen,
  Gem,
  GitMerge,
  Users,
  Eye,
  Check,
  Linkedin,
  Instagram,
  User,
  ShieldAlert,
  Video,
} from "lucide-react";
import {
  getAboutContent,
  updateAboutContent,
  deleteAboutHeroBanner,
  uploadAboutHeroImage,
  uploadAboutStoryImage,
  uploadAboutVideo,
  getStats,
  deleteStat,
  getValues,
  deleteValue,
  getProcessStepsAdmin,
  reorderProcessSteps,
  deleteProcessStep,
  toggleProcessStepActive,
  getTeamAdmin,
  deleteTeamMember,
} from "@/lib/api";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import TeamMemberForm from "@/components/admin/TeamMemberForm";
import CompanyValueModal from "@/components/admin/CompanyValueModal";
import StatItemModal from "@/components/admin/StatItemModal";
import ProcessStepModal from "@/components/admin/ProcessStepModal";
import { VALUE_ICON_MAP, getIcon as getValueIcon } from "@/components/about/ValuesGrid";
import { getProcessIconMeta } from "@/lib/processIcons";

const TABS = [
  { id: "HERO", label: "Hero Section", icon: LayoutTemplate },
  { id: "STATS", label: "Statistics", icon: BarChart3 },
  { id: "STORY", label: "Our Story", icon: BookOpen },
  { id: "VALUES", label: "Our Values", icon: Gem },
  { id: "PROCESS", label: "Our Process", icon: GitMerge },
  { id: "TEAM", label: "Team Members", icon: Users },
];

const DEFAULT_ABOUT = {
  heading: "WE ARE DESIGNTOUCH+",
  subheading:
    "We are a team of passionate storytellers, editors and creators who turn ideas into powerful visual experiences.",
  ctaText: "Let's Create Together",
  ctaLink: "/contact",
  heroBannerImageUrl: "",
  heroBannerImagePublicId: "",
  storyHeading: "Turning Ideas Into Impact.",
  storyParagraph1:
    "DesignTouch+ was born out of a love for storytelling and a passion for visual creativity.",
  storyParagraph2:
    "We believe every brand has a story worth telling, and our job is to tell it the right way.",
  storyImageUrl: "",
  founderName: "Rohit Sharma",
  founderDesignation: "Founder, DesignTouch+",
  storyVideoUrl: "",
  storyVideoThumbnailUrl: "",
};

function AboutCMSContent() {
  const searchParams = useSearchParams();
  const initialTabParam = (searchParams.get("tab") || "").toUpperCase();

  const [activeTab, setActiveTab] = useState(
    ["HERO", "STATS", "STORY", "VALUES", "PROCESS", "TEAM"].includes(initialTabParam)
      ? initialTabParam
      : "HERO"
  );

  const [form, setForm] = useState(DEFAULT_ABOUT);
  const [stats, setStats] = useState([]);
  const [values, setValues] = useState([]);
  const [processSteps, setProcessSteps] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingStoryImg, setUploadingStoryImg] = useState(false);
  const [uploadingStoryVideo, setUploadingStoryVideo] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSaved, setLastSaved] = useState("");

  // Modals state
  const [teamModal, setTeamModal] = useState({ open: false, member: null });
  const [statModal, setStatModal] = useState({ open: false, stat: null });
  const [valueModal, setValueModal] = useState({ open: false, valueItem: null });
  const [stepModal, setStepModal] = useState({ open: false, step: null });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    loading: false,
  });

  const bannerInputRef = useRef(null);
  const storyImgInputRef = useRef(null);
  const storyVideoInputRef = useRef(null);

  // Load All About Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [aboutData, statsData, valuesData, stepsData, teamData] = await Promise.all([
        getAboutContent().catch(() => null),
        getStats().catch(() => []),
        getValues().catch(() => []),
        getProcessStepsAdmin("ABOUT").catch(() => []),
        getTeamAdmin().catch(() => []),
      ]);

      if (aboutData) {
        setForm({
          heading: aboutData.heading || DEFAULT_ABOUT.heading,
          subheading: aboutData.subheading || DEFAULT_ABOUT.subheading,
          ctaText: aboutData.ctaText || DEFAULT_ABOUT.ctaText,
          ctaLink: aboutData.ctaLink || DEFAULT_ABOUT.ctaLink,
          heroBannerImageUrl: aboutData.heroBannerImageUrl || "",
          heroBannerImagePublicId: aboutData.heroBannerImagePublicId || "",
          storyHeading: aboutData.storyHeading || DEFAULT_ABOUT.storyHeading,
          storyParagraph1: aboutData.storyParagraph1 || DEFAULT_ABOUT.storyParagraph1,
          storyParagraph2: aboutData.storyParagraph2 || DEFAULT_ABOUT.storyParagraph2,
          storyImageUrl: aboutData.storyImageUrl || aboutData.storyVideoThumbnailUrl || "",
          founderName: aboutData.founderName || DEFAULT_ABOUT.founderName,
          founderDesignation: aboutData.founderDesignation || DEFAULT_ABOUT.founderDesignation,
          storyVideoUrl: aboutData.storyVideoUrl || "",
          storyVideoThumbnailUrl: aboutData.storyVideoThumbnailUrl || "",
        });
      }

      setStats(Array.isArray(statsData) ? statsData : []);
      setValues(Array.isArray(valuesData) ? valuesData : []);
      setProcessSteps(Array.isArray(stepsData) ? stepsData : []);
      setTeamMembers(Array.isArray(teamData) ? teamData : []);
    } catch (err) {
      setError("Failed to load About settings: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync tab from URL if changed
  useEffect(() => {
    const tabParam = (searchParams.get("tab") || "").toUpperCase();
    if (["HERO", "STATS", "STORY", "VALUES", "PROCESS", "TEAM"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Banner Upload
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a JPG, PNG, or WebP banner image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Banner file exceeds the 10 MB limit.");
      return;
    }

    setUploadingBanner(true);
    setError("");
    setSuccess("");

    try {
      const res = await uploadAboutHeroImage(file);
      const newUrl = res?.secure_url || res?.url;
      const newPublicId = res?.public_id || "";
      if (!newUrl) throw new Error("Upload did not return an image URL.");

      // Save banner URL immediately to backend to ensure persistence
      const updated = await updateAboutContent({
        ...form,
        heroBannerImageUrl: newUrl,
        heroBannerImagePublicId: newPublicId,
      });

      setForm((prev) => ({
        ...prev,
        heroBannerImageUrl: updated.heroBannerImageUrl || newUrl,
        heroBannerImagePublicId: updated.heroBannerImagePublicId || newPublicId,
      }));

      setSuccess("Hero banner uploaded, saved and published successfully.");
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Failed to upload hero banner.");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (!confirm("Are you sure you want to remove the Hero banner image?")) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await deleteAboutHeroBanner();
      setForm((prev) => ({
        ...prev,
        heroBannerImageUrl: "",
        heroBannerImagePublicId: "",
      }));
      setSuccess("Hero banner removed successfully.");
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Failed to remove hero banner.");
    } finally {
      setSaving(false);
    }
  };

  // Story Image Upload
  const handleStoryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Story image exceeds the 10 MB limit.");
      return;
    }

    setUploadingStoryImg(true);
    setError("");
    setSuccess("");

    try {
      const res = await uploadAboutStoryImage(file);
      const newUrl = res?.secure_url || res?.url;
      if (!newUrl) throw new Error("Upload did not return an image URL.");

      // Save story image URL to backend
      const updated = await updateAboutContent({
        ...form,
        storyImageUrl: newUrl,
      });

      setForm((prev) => ({
        ...prev,
        storyImageUrl: updated.storyImageUrl || newUrl,
      }));

      setSuccess("Story image uploaded, saved and published successfully.");
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Failed to upload story image.");
    } finally {
      setUploadingStoryImg(false);
    }
  };

  const handleRemoveStoryImage = async () => {
    if (!confirm("Are you sure you want to remove the story image?")) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await updateAboutContent({
        ...form,
        storyImageUrl: "",
        storyVideoThumbnailUrl: "",
      });
      setForm((prev) => ({
        ...prev,
        storyImageUrl: "",
      }));
      setSuccess("Story image removed successfully.");
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Failed to remove story image.");
    } finally {
      setSaving(false);
    }
  };

  // Story Video Upload
  const handleStoryVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];
    const isVideo = validTypes.includes(file.type) || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
    if (!isVideo) {
      setError("Invalid video format. Please upload an MP4 or WebM video file.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("Video file exceeds the 100 MB limit.");
      return;
    }

    setUploadingStoryVideo(true);
    setError("");
    setSuccess("");

    try {
      const res = await uploadAboutVideo(file);
      const newUrl = res?.secure_url || res?.url;
      if (!newUrl) throw new Error("Upload did not return a video URL.");

      // Save video URL directly to backend
      const updated = await updateAboutContent({
        ...form,
        storyVideoUrl: newUrl,
      });

      setForm((prev) => ({
        ...prev,
        storyVideoUrl: updated.storyVideoUrl || newUrl,
      }));

      setSuccess("Story video uploaded, saved and published successfully.");
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Failed to upload story video.");
    } finally {
      setUploadingStoryVideo(false);
    }
  };

  const handleRemoveStoryVideo = async () => {
    if (!confirm("Are you sure you want to remove the story video?")) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await updateAboutContent({
        ...form,
        storyVideoUrl: "",
      });
      setForm((prev) => ({
        ...prev,
        storyVideoUrl: "",
      }));
      setSuccess("Story video removed successfully.");
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Failed to remove story video.");
    } finally {
      setSaving(false);
    }
  };

  // Save Hero or Story Text Content
  const handleSaveAboutContent = async () => {
    if (!form.heading.trim()) {
      setError("Hero heading cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        heading: form.heading.trim(),
        subheading: form.subheading.trim(),
        ctaText: form.ctaText.trim(),
        ctaLink: form.ctaLink.trim(),
        heroBannerImageUrl: form.heroBannerImageUrl || "",
        heroBannerImagePublicId: form.heroBannerImagePublicId || "",
        storyHeading: form.storyHeading.trim(),
        storyParagraph1: form.storyParagraph1.trim(),
        storyParagraph2: form.storyParagraph2.trim(),
        storyImageUrl: form.storyImageUrl || "",
        founderName: form.founderName.trim(),
        founderDesignation: form.founderDesignation?.trim() || "Founder, DesignTouch+",
        storyVideoUrl: form.storyVideoUrl?.trim() || "",
        storyVideoThumbnailUrl: form.storyVideoThumbnailUrl || form.storyImageUrl || "",
      };

      const updated = await updateAboutContent(payload);
      if (updated) {
        setForm((prev) => ({
          ...prev,
          heading: updated.heading || payload.heading,
          subheading: updated.subheading || payload.subheading,
          ctaText: updated.ctaText || payload.ctaText,
          ctaLink: updated.ctaLink || payload.ctaLink,
          storyHeading: updated.storyHeading || payload.storyHeading,
          storyParagraph1: updated.storyParagraph1 || payload.storyParagraph1,
          storyParagraph2: updated.storyParagraph2 || payload.storyParagraph2,
          founderName: updated.founderName || payload.founderName,
          founderDesignation: updated.founderDesignation || payload.founderDesignation,
          storyVideoUrl: updated.storyVideoUrl || payload.storyVideoUrl,
          storyVideoThumbnailUrl: updated.storyVideoThumbnailUrl || payload.storyVideoThumbnailUrl,
        }));
      }

      setLastSaved(new Date().toLocaleTimeString());
      setSuccess("About page content saved and published successfully!");
    } catch (err) {
      setError(err.message || "Failed to save About page settings.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Stat
  const handleDeleteStat = (stat) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Statistic",
      message: `Are you sure you want to delete the metric "${stat.description || stat.label}"? This action cannot be undone.`,
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteStat(stat.id);
          setStats((prev) => prev.filter((s) => s.id !== stat.id));
          setSuccess("Metric deleted successfully.");
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, loading: false });
        } catch (err) {
          setError(err.message || "Failed to delete metric.");
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, loading: false });
        }
      },
    });
  };

  // Delete Value
  const handleDeleteValue = (val) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Company Value",
      message: `Are you sure you want to delete "${val.title}"?`,
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteValue(val.id);
          setValues((prev) => prev.filter((v) => v.id !== val.id));
          setSuccess("Company value deleted successfully.");
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, loading: false });
        } catch (err) {
          setError(err.message || "Failed to delete company value.");
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, loading: false });
        }
      },
    });
  };

  // Move Process Step
  const handleMoveStep = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= processSteps.length) return;

    const reordered = [...processSteps];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setProcessSteps(reordered);

    try {
      const ids = reordered.map((s) => s.id);
      await reorderProcessSteps(ids);
      setSuccess("Process step order updated.");
    } catch (err) {
      setError("Failed to reorder process steps: " + (err.message || "Unknown error"));
      loadData();
    }
  };

  // Toggle Process Step Active
  const handleToggleStepActive = async (id) => {
    try {
      const updated = await toggleProcessStepActive(id);
      setProcessSteps((prev) => prev.map((s) => (s.id === id ? updated : s)));
      setSuccess(`Process step ${updated.isActive ? "activated" : "deactivated"} successfully.`);
    } catch (err) {
      setError("Failed to toggle process step status: " + (err.message || "Unknown error"));
    }
  };

  // Delete Process Step
  const handleDeleteStep = (step) => {
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
          setSuccess("Process step deleted successfully.");
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, loading: false });
        } catch (err) {
          setError(err.message || "Failed to delete process step.");
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, loading: false });
        }
      },
    });
  };

  // Delete Team Member
  const handleDeleteTeamMember = (member) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Team Member",
      message: `Are you sure you want to remove "${member.name}" (${member.role}) from the team?`,
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteTeamMember(member.id);
          setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
          setSuccess("Team member removed successfully.");
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, loading: false });
        } catch (err) {
          setError(err.message || "Failed to delete team member.");
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, loading: false });
        }
      },
    });
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 outline-none transition-colors w-full";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
        <span className="text-xs font-mono uppercase tracking-wider">
          Loading About Page CMS...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 bg-brand-red inline-block shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-400">
              Agency Management
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase font-display tracking-tight text-white">
            About Page CMS
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Manage public About hero copy, banner image, agency stats, story, company values, process steps, and team members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-white/15 hover:border-white/30 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors no-underline rounded-none"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Public Page</span>
            <ExternalLink className="w-3 h-3 text-neutral-500" />
          </Link>

          {(activeTab === "HERO" || activeTab === "STORY") && (
            <button
              type="button"
              onClick={handleSaveAboutContent}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] disabled:opacity-50 text-white text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-none border-none cursor-pointer transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.25)]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          )}

          {activeTab === "STATS" && (
            <button
              type="button"
              onClick={() => setStatModal({ open: true, stat: null })}
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-none border-none cursor-pointer transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.25)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Metric</span>
            </button>
          )}

          {activeTab === "VALUES" && (
            <button
              type="button"
              onClick={() => setValueModal({ open: true, valueItem: null })}
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-none border-none cursor-pointer transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.25)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Value Card</span>
            </button>
          )}

          {activeTab === "PROCESS" && (
            <button
              type="button"
              onClick={() => setStepModal({ open: true, step: null })}
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-none border-none cursor-pointer transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.25)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Process Step</span>
            </button>
          )}

          {activeTab === "TEAM" && (
            <button
              type="button"
              onClick={() => setTeamModal({ open: true, member: null })}
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-none border-none cursor-pointer transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.25)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Member</span>
            </button>
          )}
        </div>
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
              {id === "STATS" && stats.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/10 text-white text-[10px] font-mono">
                  {stats.length}
                </span>
              )}
              {id === "VALUES" && values.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/10 text-white text-[10px] font-mono">
                  {values.length}
                </span>
              )}
              {id === "PROCESS" && processSteps.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/10 text-white text-[10px] font-mono">
                  {processSteps.length}
                </span>
              )}
              {id === "TEAM" && teamMembers.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/10 text-white text-[10px] font-mono">
                  {teamMembers.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between p-3.5 mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
          {lastSaved && <span className="text-[10px] text-emerald-500/70">Published {lastSaved}</span>}
        </div>
      )}

      {/* =========================================================================
          TAB A: HERO SECTION
          ========================================================================= */}
      {activeTab === "HERO" && (
        <div className="space-y-6">
          <div className="bg-[#0f0f0f] border border-white/[0.08] p-5 sm:p-6">
            <h2 className="text-sm font-display font-black uppercase tracking-wider text-white mb-1">
              Hero Copy & Call-to-Action
            </h2>
            <p className="text-[11px] font-mono text-neutral-400 mb-5">
              The primary hook displayed at the top of the public About page.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Hero Heading *
                </label>
                <input
                  type="text"
                  value={form.heading}
                  onChange={(e) => handleChange("heading", e.target.value)}
                  placeholder="e.g. WE ARE DESIGNTOUCH+"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Short Description *
                </label>
                <textarea
                  rows={3}
                  value={form.subheading}
                  onChange={(e) => handleChange("subheading", e.target.value)}
                  placeholder="We are a team of passionate storytellers, editors and creators..."
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={form.ctaText}
                    onChange={(e) => handleChange("ctaText", e.target.value)}
                    placeholder="e.g. Let's Create Together"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    CTA Button Destination Link
                  </label>
                  <input
                    type="text"
                    value={form.ctaLink}
                    onChange={(e) => handleChange("ctaLink", e.target.value)}
                    placeholder="e.g. /contact or #story"
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Banner Image Section */}
          <div className="bg-[#0f0f0f] border border-white/[0.08] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
                Hero Banner Image
              </h2>
              <span className="text-[11px] font-mono text-brand-red bg-brand-red/10 px-2 py-0.5 border border-brand-red/20 self-start sm:self-auto">
                Recommended: 1920 × 800 px
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400 mb-5">
              Uploads an edge-to-edge cinematic banner image rendered behind the hero content on the public About page. Replacing or removing the banner does not alter your text copy.
            </p>

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleBannerUpload}
              className="hidden"
            />

            {form.heroBannerImageUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-[16/7] w-full max-w-3xl overflow-hidden border border-white/15 bg-black select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.heroBannerImageUrl}
                    alt="Current About Hero Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/80 border border-white/10 text-[10px] font-mono text-neutral-300">
                    Active Banner
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner || saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-mono uppercase tracking-wider border border-white/15 cursor-pointer transition-colors"
                  >
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-red" />
                        <span>Uploading New Banner...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace Banner</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    disabled={uploadingBanner || saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-mono uppercase tracking-wider border border-white/10 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Banner</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !uploadingBanner && bannerInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 hover:border-brand-red/50 bg-white/[0.02] hover:bg-white/[0.04] p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-none bg-white/[0.05] border border-white/10 flex items-center justify-center text-neutral-400">
                  {uploadingBanner ? (
                    <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-1">
                    {uploadingBanner ? "Uploading Banner..." : "Click to Upload Hero Banner"}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-500">
                    Recommended dimensions: 1920 × 800 px (JPG, PNG, WebP up to 10 MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB B: STATISTICS
          ========================================================================= */}
      {activeTab === "STATS" && (
        <div className="space-y-6">
          <div className="bg-[#0f0f0f] border border-white/[0.08] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
                  Agency Metric Statistics
                </h2>
                <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                  The four key metric counters displayed directly beneath the About hero.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatModal({ open: true, stat: null })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono uppercase tracking-wider border-none cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Metric</span>
              </button>
            </div>

            {stats.length === 0 ? (
              <p className="text-xs font-mono text-neutral-500 py-6 text-center">
                No statistics found. Click &quot;Add Metric&quot; to create one.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mb-2">
                        <span>ORDER: #{item.displayOrder || 0}</span>
                      </div>
                      <p className="text-3xl font-black text-white font-display mb-1">
                        {item.value}
                        <span className="text-brand-red">{item.suffix || "+"}</span>
                      </p>
                      <p className="text-xs text-neutral-300 font-mono uppercase tracking-wide">
                        {item.description || item.label}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setStatModal({ open: true, stat: item })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStat(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-neutral-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB C: OUR STORY
          ========================================================================= */}
      {activeTab === "STORY" && (
        <div className="space-y-6">
          <div className="bg-[#0f0f0f] border border-white/[0.08] p-5 sm:p-6">
            <h2 className="text-sm font-display font-black uppercase tracking-wider text-white mb-1">
              Story Text & Narrative
            </h2>
            <p className="text-[11px] font-mono text-neutral-400 mb-5">
              The founding narrative and mission statements displayed in the Our Story section.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Section Heading *
                </label>
                <input
                  type="text"
                  value={form.storyHeading}
                  onChange={(e) => handleChange("storyHeading", e.target.value)}
                  placeholder="e.g. Turning Ideas Into Impact."
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Story Paragraph 1 *
                </label>
                <textarea
                  rows={3}
                  value={form.storyParagraph1}
                  onChange={(e) => handleChange("storyParagraph1", e.target.value)}
                  placeholder="DesignTouch+ was born out of a love for storytelling..."
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Story Paragraph 2
                </label>
                <textarea
                  rows={3}
                  value={form.storyParagraph2}
                  onChange={(e) => handleChange("storyParagraph2", e.target.value)}
                  placeholder="We believe every brand has a story worth telling..."
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Founder Name
                  </label>
                  <input
                    type="text"
                    value={form.founderName}
                    onChange={(e) => handleChange("founderName", e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Founder Designation
                  </label>
                  <input
                    type="text"
                    value={form.founderDesignation}
                    onChange={(e) => handleChange("founderDesignation", e.target.value)}
                    placeholder="e.g. Founder, DesignTouch+"
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Story Video & Media Player */}
          <div className="bg-[#0f0f0f] border border-white/[0.08] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
                Our Story Video Player
              </h2>
              {form.storyVideoUrl ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/20">
                  <Check className="w-3 h-3" />
                  Video Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-white/5 text-neutral-400 border border-white/10">
                  Fallback Demo Active
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-neutral-400 mb-5">
              Upload an MP4 or WebM video, or specify a video URL. Clicking play in the Our Story section plays this video with interactive player controls.
            </p>

            <input
              ref={storyVideoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleStoryVideoUpload}
              className="hidden"
            />

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Video URL (MP4, WebM, Cloudinary)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.storyVideoUrl}
                    onChange={(e) => handleChange("storyVideoUrl", e.target.value)}
                    placeholder="e.g. https://res.cloudinary.com/.../story.mp4 or /hero-demo.mp4"
                    className={inputClasses}
                  />
                  <button
                    type="button"
                    onClick={() => storyVideoInputRef.current?.click()}
                    disabled={uploadingStoryVideo || saving}
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-mono uppercase tracking-wider border border-white/15 cursor-pointer transition-colors"
                  >
                    {uploadingStoryVideo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-red" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Video</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] font-mono text-neutral-500 mt-1">
                  Upload an MP4 / WebM file (up to 100 MB) or paste a hosted video URL.
                </p>
              </div>
            </div>

            {form.storyVideoUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-video w-full max-w-xl overflow-hidden border border-white/15 bg-black">
                  <video
                    src={form.storyVideoUrl}
                    poster={form.storyImageUrl || "/assets/about/production-shoot.jpg"}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => storyVideoInputRef.current?.click()}
                    disabled={uploadingStoryVideo || saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-mono uppercase tracking-wider border border-white/15 cursor-pointer transition-colors"
                  >
                    {uploadingStoryVideo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-red" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace Video</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveStoryVideo}
                    disabled={uploadingStoryVideo || saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-mono uppercase tracking-wider border border-white/10 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Video</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !uploadingStoryVideo && storyVideoInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 hover:border-brand-red/50 bg-white/[0.02] hover:bg-white/[0.04] p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 max-w-xl"
              >
                <div className="w-12 h-12 rounded-none bg-white/[0.05] border border-white/10 flex items-center justify-center text-neutral-400">
                  {uploadingStoryVideo ? (
                    <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
                  ) : (
                    <Video className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-1">
                    {uploadingStoryVideo ? "Uploading Story Video..." : "Upload Story Video (MP4 / WebM)"}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-500">
                    Supports MP4 or WebM up to 100 MB. Click to select a file from your device.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Story Visual / Thumbnail Image */}
          <div className="bg-[#0f0f0f] border border-white/[0.08] p-5 sm:p-6">
            <h2 className="text-sm font-display font-black uppercase tracking-wider text-white mb-1">
              Our Story Video Poster & Artwork
            </h2>
            <p className="text-[11px] font-mono text-neutral-400 mb-5">
              Poster image displayed before video playback starts on the public About page. Recommended 16:9 ratio.
            </p>

            <input
              ref={storyImgInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleStoryImageUpload}
              className="hidden"
            />

            {form.storyImageUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-video w-full max-w-xl overflow-hidden border border-white/15 bg-black select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.storyImageUrl}
                    alt="Our Story Journey Artwork"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => storyImgInputRef.current?.click()}
                    disabled={uploadingStoryImg || saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-mono uppercase tracking-wider border border-white/15 cursor-pointer transition-colors"
                  >
                    {uploadingStoryImg ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-red" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace Image</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveStoryImage}
                    disabled={uploadingStoryImg || saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-mono uppercase tracking-wider border border-white/10 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !uploadingStoryImg && storyImgInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 hover:border-brand-red/50 bg-white/[0.02] hover:bg-white/[0.04] p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 max-w-xl"
              >
                <div className="w-12 h-12 rounded-none bg-white/[0.05] border border-white/10 flex items-center justify-center text-neutral-400">
                  {uploadingStoryImg ? (
                    <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-1">
                    {uploadingStoryImg ? "Uploading Artwork..." : "Click to Upload Story Artwork"}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-500">
                    Recommended dimensions: 16:9 ratio (JPG, PNG, WebP up to 10 MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB D: OUR VALUES
          ========================================================================= */}
      {activeTab === "VALUES" && (
        <div className="space-y-6">
          <div className="bg-[#0f0f0f] border border-white/[0.08] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
                  Company Values
                </h2>
                <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                  Core values displayed in the Our Values section (Quality First, Creativity, On-Time Delivery, Client First).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setValueModal({ open: true, valueItem: null })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono uppercase tracking-wider border-none cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Value Card</span>
              </button>
            </div>

            {values.length === 0 ? (
              <p className="text-xs font-mono text-neutral-500 py-6 text-center">
                No values defined yet. Click &quot;Add Value Card&quot; to create one.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {values.map((v) => {
                  const IconComponent = getValueIcon(v.icon, v.title);
                  return (
                    <div
                      key={v.id}
                      className="p-5 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-none bg-brand-red/10 border border-brand-red/30 flex items-center justify-center mb-3 text-brand-red">
                          {IconComponent && <IconComponent className="w-5 h-5" />}
                        </div>
                        <h3 className="text-sm font-bold text-white mb-2">{v.title}</h3>
                        <p className="text-neutral-400 text-xs leading-relaxed">
                          {v.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setValueModal({ open: true, valueItem: v })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteValue(v)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-neutral-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB E: OUR PROCESS
          ========================================================================= */}
      {activeTab === "PROCESS" && (
        <div className="space-y-6">
          <div className="bg-[#0f0f0f] border border-white/[0.08] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
                  Our Methodology & Process Steps
                </h2>
                <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                  Workflow steps for the About page methodology timeline (Discover, Plan, Create, Review, Deliver).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStepModal({ open: true, step: null })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono uppercase tracking-wider border-none cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Process Step</span>
              </button>
            </div>

            {processSteps.length === 0 ? (
              <p className="text-xs font-mono text-neutral-500 py-6 text-center">
                No process steps configured for the About page. Click &quot;Add Process Step&quot; to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {processSteps.map((step, idx) => {
                  const meta = getProcessIconMeta(step.icon, step.title, step.stepNumber);
                  return (
                    <div
                      key={step.id}
                      className="p-4 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-mono font-bold text-brand-red">
                            {String(step.stepNumber || idx + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold uppercase text-white font-display">
                              {step.title}
                            </h3>
                            {step.isActive === false && (
                              <span className="text-[10px] font-mono text-neutral-500 bg-white/5 px-1.5 py-0.5">
                                Hidden
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, -1)}
                          disabled={idx === 0}
                          aria-label="Move step up"
                          className="w-7 h-7 bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white flex items-center justify-center border border-white/10 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, 1)}
                          disabled={idx === processSteps.length - 1}
                          aria-label="Move step down"
                          className="w-7 h-7 bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white flex items-center justify-center border border-white/10 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStepActive(step.id)}
                          className={`px-2.5 py-1 text-[11px] font-mono border cursor-pointer ${
                            step.isActive !== false
                              ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                              : "text-neutral-500 border-white/10 bg-white/5"
                          }`}
                        >
                          {step.isActive !== false ? "Active" : "Disabled"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setStepModal({ open: true, step })}
                          className="px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStep(step)}
                          className="px-2.5 py-1 text-[11px] font-mono text-neutral-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB F: TEAM MEMBERS
          ========================================================================= */}
      {activeTab === "TEAM" && (
        <div className="space-y-6">
          <div className="bg-[#0f0f0f] border border-white/[0.08] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
                  Meet The Team Roster
                </h2>
                <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                  Preserves existing Team CRUD and database records displayed on the public About page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTeamModal({ open: true, member: null })}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono uppercase tracking-wider border-none cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Member</span>
              </button>
            </div>

            {teamMembers.length === 0 ? (
              <p className="text-xs font-mono text-neutral-500 py-6 text-center">
                No team members found. Click &quot;New Member&quot; to add one.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-20 bg-neutral-900 border border-white/10 shrink-0 overflow-hidden relative">
                        {member.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-mono font-bold text-neutral-600">
                            {member.name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-white truncate font-display">
                            {member.name}
                          </h3>
                          {member.isActive !== false ? (
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.5">
                              Active
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-neutral-500 bg-white/5 px-1 py-0.5">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5 truncate">{member.role}</p>

                        <div className="flex items-center gap-2 mt-2">
                          {member.linkedinUrl && (
                            <a
                              href={member.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-neutral-400 hover:text-white"
                              title="LinkedIn Profile"
                            >
                              <Linkedin className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {member.instagramUrl && (
                            <a
                              href={member.instagramUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-neutral-400 hover:text-white"
                              title="Instagram Profile"
                            >
                              <Instagram className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setTeamModal({ open: true, member })}
                        className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTeamMember(member)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-mono text-neutral-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {teamModal.open && (
        <TeamMemberForm
          member={teamModal.member}
          onClose={() => setTeamModal({ open: false, member: null })}
          onSaved={() => {
            setTeamModal({ open: false, member: null });
            loadData();
            setSuccess("Team member saved successfully.");
          }}
        />
      )}

      {statModal.open && (
        <StatItemModal
          statItem={statModal.stat}
          onClose={() => setStatModal({ open: false, stat: null })}
          onSaved={() => {
            setStatModal({ open: false, stat: null });
            loadData();
            setSuccess("Statistic saved successfully.");
          }}
        />
      )}

      {valueModal.open && (
        <CompanyValueModal
          valueItem={valueModal.valueItem}
          onClose={() => setValueModal({ open: false, valueItem: null })}
          onSaved={() => {
            setValueModal({ open: false, valueItem: null });
            loadData();
            setSuccess("Company value saved successfully.");
          }}
        />
      )}

      {stepModal.open && (
        <ProcessStepModal
          step={stepModal.step}
          defaultPageType="ABOUT"
          onClose={() => setStepModal({ open: false, step: null })}
          onSaved={() => {
            setStepModal({ open: false, step: null });
            loadData();
            setSuccess("Process step saved successfully.");
          }}
        />
      )}

      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null, loading: false })}
      />
    </div>
  );
}

export default function AdminAboutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
          <span className="text-xs font-mono uppercase tracking-wider">Loading About CMS...</span>
        </div>
      }
    >
      <AboutCMSContent />
    </Suspense>
  );
}

