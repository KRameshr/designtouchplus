"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { adminFetch } from "@/lib/auth";
import {
  uploadPortfolioVideo,
  uploadPortfolioImage,
  getPortfolioCategories,
} from "@/lib/api";

const CONTENT_TYPES = [
  { value: "VIDEO_EDITING", label: "Video Editing" },
  { value: "THUMBNAIL_DESIGN", label: "Thumbnail Design" },
];

const LEGACY_VIDEO_CATEGORIES = new Set([
  "YOUTUBE",
  "INSTAGRAM_REELS",
  "COMMERCIAL",
  "MOTION_GRAPHICS",
  "CORPORATE",
  "REAL_ESTATE",
]);

export const VIDEO_ASPECT_RATIOS = [
  {
    value: "9:16",
    label: "Instagram Reels / YouTube Shorts — 9:16",
    badge: "9:16",
    resolution: "1080 × 1920",
    ratioNumber: 9 / 16,
  },
  {
    value: "16:9",
    label: "YouTube Landscape — 16:9",
    badge: "16:9",
    resolution: "1920 × 1080",
    ratioNumber: 16 / 9,
  },
  {
    value: "1:1",
    label: "Square Social Video — 1:1",
    badge: "1:1",
    resolution: "1080 × 1080",
    ratioNumber: 1,
  },
  {
    value: "4:5",
    label: "Portrait Feed Video — 4:5",
    badge: "4:5",
    resolution: "1080 × 1350",
    ratioNumber: 4 / 5,
  },
  {
    value: "AUTO",
    label: "Auto Detect / Original Ratio",
    badge: "AUTO",
    resolution: "Original Video Ratio",
    ratioNumber: null,
  },
];

export function normalizeAspectRatio(val) {
  if (!val) return "16:9";
  if (val === "RATIO_9_16" || val === "9:16" || val === "9/16") return "9:16";
  if (val === "RATIO_16_9" || val === "16:9" || val === "16/9") return "16:9";
  if (val === "RATIO_1_1" || val === "1:1" || val === "1/1") return "1:1";
  if (val === "RATIO_4_5" || val === "4:5" || val === "4/5") return "4:5";
  if (val === "AUTO") return "AUTO";
  return val;
}

export function getPreviewAspectClass(ratio) {
  if (ratio === "9:16" || ratio === "RATIO_9_16") return "aspect-[9/16] max-w-[220px]";
  if (ratio === "1:1" || ratio === "RATIO_1_1") return "aspect-square max-w-[260px]";
  if (ratio === "4:5" || ratio === "RATIO_4_5") return "aspect-[4/5] max-w-[240px]";
  return "aspect-[16/9] max-w-sm";
}

const EMPTY_FORM = {
  title: "",
  contentType: "VIDEO_EDITING",
  categoryId: "",
  category: "",
  subCategory: "",
  description: "",
  duration: "",
  videoUrl: "",
  videoPublicId: "",
  videoAspectRatio: "16:9",
  imageUrl: "",
  thumbnailUrl: "",
  imagePublicId: "",
  liveVideoUrl: "",
  googleDriveUrl: "",
  resourceLinks: [],
  displayOrder: 0,
  isFeatured: false,
};

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
];

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function validateVideoFile(file) {
  if (!file) return "No file selected.";
  const name = file.name.toLowerCase();
  const validExt =
    name.endsWith(".mp4") ||
    name.endsWith(".webm") ||
    name.endsWith(".mov") ||
    name.endsWith(".mkv");
  if (!ALLOWED_VIDEO_TYPES.includes(file.type) && !validExt) {
    return "Unsupported video format. Please upload an MP4, WEBM, or MOV video file.";
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return `Video file is too large (${formatBytes(file.size)}). Maximum supported size is 100 MB.`;
  }
  return null;
}

function validateImageFile(file) {
  if (!file) return "No file selected.";
  const name = file.name.toLowerCase();
  const validExt =
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp");
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !validExt) {
    return "Unsupported image format. Please upload a JPG, PNG, or WebP image.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `Image file is too large (${formatBytes(file.size)}). Maximum supported size is 10 MB.`;
  }
  return null;
}

function isValidHttpUrl(str) {
  if (!str || typeof str !== "string") return false;
  try {
    const url = new URL(str.trim());
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function isValidGoogleDriveUrl(str) {
  if (!str || typeof str !== "string") return false;
  try {
    const url = new URL(str.trim());
    if (url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    const host = url.hostname.toLowerCase();
    return (
      host === "drive.google.com" ||
      host.endsWith(".drive.google.com") ||
      host === "docs.google.com" ||
      host.endsWith(".docs.google.com")
    );
  } catch {
    return false;
  }
}

export default function PortfolioForm({ item, onClose, onSaved }) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const modalBodyRef = useRef(null);

  useEffect(() => {
    let active = true;
    getPortfolioCategories(null, false)
      .then((data) => {
        if (active && Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingCategories(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const [form, setForm] = useState(
    item
      ? {
          ...EMPTY_FORM,
          ...item,
          categoryId: item.categoryId || "",
          category: item.category || "",
          subCategory: item.subCategory || "",
          description: item.description || "",
          duration: item.duration || "",
          videoUrl: item.videoUrl || "",
          videoPublicId: item.videoPublicId || "",
          videoAspectRatio: item.videoAspectRatio ? normalizeAspectRatio(item.videoAspectRatio) : "16:9",
          imageUrl: item.imageUrl || "",
          thumbnailUrl: item.thumbnailUrl || "",
          imagePublicId: item.imagePublicId || "",
          liveVideoUrl: item.liveVideoUrl || "",
          googleDriveUrl: item.googleDriveUrl || "",
          resourceLinks: Array.isArray(item.resourceLinks)
            ? item.resourceLinks.map((link) => ({
                title: link?.title || "",
                url: link?.url || "",
                description: link?.description || "",
              }))
            : [],
          displayOrder: item.displayOrder ?? 0,
          isFeatured: Boolean(item.isFeatured),
        }
      : EMPTY_FORM
  );

  // Sync categoryId if item is loaded with legacy fields or categories just loaded
  useEffect(() => {
    if (!form.categoryId && categories.length > 0 && item) {
      const matched = categories.find((c) => {
        if (item.categoryId && c.id === item.categoryId) return true;
        if (item.category && c.categoryType === "VIDEO_EDITING") {
          const slug = item.category.toLowerCase().replace(/_/g, "-");
          if (c.slug === slug) return true;
        }
        if (item.subCategory && c.categoryType === "THUMBNAIL_DESIGN") {
          if (c.name.toLowerCase() === item.subCategory.toLowerCase()) return true;
        }
        return false;
      });
      if (matched) {
        setForm((prev) => ({
          ...prev,
          categoryId: matched.id,
        }));
      }
    }
  }, [categories, item, form.categoryId]);

  // Categories strictly partitioned by content type
  const availableCategories = useMemo(() => {
    return categories
      .filter((c) => c.categoryType === form.contentType)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [categories, form.contentType]);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState("");

  // --- Video Editing Media States ---
  const videoFileInputRef = useRef(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [videoPreviewBlobUrl, setVideoPreviewBlobUrl] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState("");
  const [videoUploadSuccess, setVideoUploadSuccess] = useState("");

  // Create object URL for local video preview immediately
  useEffect(() => {
    if (selectedVideoFile) {
      const url = URL.createObjectURL(selectedVideoFile);
      setVideoPreviewBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoPreviewBlobUrl(null);
    }
  }, [selectedVideoFile]);

  const posterFileInputRef = useRef(null);
  const [selectedPosterFile, setSelectedPosterFile] = useState(null);
  const [posterPreviewBlobUrl, setPosterPreviewBlobUrl] = useState(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [posterUploadError, setPosterUploadError] = useState("");
  const [posterUploadSuccess, setPosterUploadSuccess] = useState("");

  // Create object URL for local poster preview immediately
  useEffect(() => {
    if (selectedPosterFile) {
      const url = URL.createObjectURL(selectedPosterFile);
      setPosterPreviewBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPosterPreviewBlobUrl(null);
    }
  }, [selectedPosterFile]);

  // --- Thumbnail Design Media States ---
  const thumbnailFileInputRef = useRef(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);
  const [thumbnailPreviewBlobUrl, setThumbnailPreviewBlobUrl] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailUploadError, setThumbnailUploadError] = useState("");
  const [thumbnailUploadSuccess, setThumbnailUploadSuccess] = useState("");

  // Create object URL for local thumbnail preview immediately
  useEffect(() => {
    if (selectedThumbnailFile) {
      const url = URL.createObjectURL(selectedThumbnailFile);
      setThumbnailPreviewBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setThumbnailPreviewBlobUrl(null);
    }
  }, [selectedThumbnailFile]);

  const [detectedVideoDimensions, setDetectedVideoDimensions] = useState(null);

  const handleVideoMetadataLoaded = (e) => {
    const video = e.target;
    if (video && video.videoWidth && video.videoHeight) {
      setDetectedVideoDimensions({
        width: video.videoWidth,
        height: video.videoHeight,
        ratio: video.videoWidth / video.videoHeight,
      });
    }
  };

  const selectedRatioConfig = useMemo(() => {
    return (
      VIDEO_ASPECT_RATIOS.find((r) => r.value === form.videoAspectRatio) ||
      VIDEO_ASPECT_RATIOS[1]
    );
  }, [form.videoAspectRatio]);

  const detectedMismatchWarning = useMemo(() => {
    if (form.contentType !== "VIDEO_EDITING" || !detectedVideoDimensions || form.videoAspectRatio === "AUTO") {
      return null;
    }
    const cfg = VIDEO_ASPECT_RATIOS.find((r) => r.value === form.videoAspectRatio);
    if (!cfg || !cfg.ratioNumber) return null;

    const actual = detectedVideoDimensions.width / detectedVideoDimensions.height;
    const diff = Math.abs(actual - cfg.ratioNumber) / cfg.ratioNumber;
    if (diff > 0.15) {
      const actualOrientation =
        actual > 1.2 ? "Landscape" : actual < 0.85 ? "Portrait / Vertical" : "Square";
      return `Detected source video: ${detectedVideoDimensions.width} × ${detectedVideoDimensions.height} (${actualOrientation}). Selected container ratio: ${form.videoAspectRatio}. Note: The source file remains completely unchanged; the player container will adapt to ${form.videoAspectRatio} and fit the video without cropping.`;
    }
    return null;
  }, [form.contentType, detectedVideoDimensions, form.videoAspectRatio]);

  const scrollModalToTop = () => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContentTypeChange = (e) => {
    const newType = e.target.value;
    if (newType === form.contentType) return;

    if (form.contentType === "VIDEO_EDITING") {
      const hasVideoMedia = Boolean(
        form.videoUrl || selectedVideoFile || form.liveVideoUrl || form.googleDriveUrl
      );
      if (hasVideoMedia) {
        const confirmed = window.confirm(
          "Switching to Thumbnail Design will clear the current video asset and delivery links. Continue?"
        );
        if (!confirmed) return;
      }
    } else if (form.contentType === "THUMBNAIL_DESIGN") {
      const hasThumbMedia = Boolean(
        form.imageUrl || form.thumbnailUrl || selectedThumbnailFile
      );
      if (hasThumbMedia) {
        const confirmed = window.confirm(
          "Switching to Video Editing will clear the current thumbnail image. Continue?"
        );
        if (!confirmed) return;
      }
    }

    setForm((prev) => {
      if (newType === "VIDEO_EDITING") {
        return {
          ...prev,
          contentType: newType,
          categoryId: "",
          category: "",
          subCategory: "",
          videoAspectRatio: "16:9",
          imageUrl: "",
          thumbnailUrl: "",
          imagePublicId: "",
        };
      } else {
        return {
          ...prev,
          contentType: newType,
          categoryId: "",
          category: "",
          subCategory: "",
          duration: "",
          videoUrl: "",
          videoPublicId: "",
          videoAspectRatio: null,
          liveVideoUrl: "",
          googleDriveUrl: prev.googleDriveUrl || "",
          resourceLinks: [],
        };
      }
    });

    setDetectedVideoDimensions(null);

    // Reset upload states
    setSelectedVideoFile(null);
    setVideoUploadError("");
    setVideoUploadSuccess("");
    if (videoFileInputRef.current) videoFileInputRef.current.value = "";

    setSelectedPosterFile(null);
    setPosterUploadError("");
    setPosterUploadSuccess("");
    if (posterFileInputRef.current) posterFileInputRef.current.value = "";

    setSelectedThumbnailFile(null);
    setThumbnailUploadError("");
    setThumbnailUploadSuccess("");
    if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = "";
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const selected = categories.find((c) => c.id === catId);
    let legacyCat = "";
    if (selected?.categoryType === "VIDEO_EDITING") {
      const normalized = selected.slug.toUpperCase().replace(/-/g, "_");
      if (LEGACY_VIDEO_CATEGORIES.has(normalized)) {
        legacyCat = normalized;
      }
    }

    setForm((prev) => ({
      ...prev,
      categoryId: catId,
      category: legacyCat,
      subCategory:
        selected?.categoryType === "THUMBNAIL_DESIGN"
          ? selected.name
          : prev.subCategory,
    }));
  };

  // --- External Video & Delivery Links Handlers ---
  const handleAddResourceLink = () => {
    setForm((prev) => ({
      ...prev,
      resourceLinks: [
        ...(prev.resourceLinks || []),
        { title: "", url: "", description: "" },
      ],
    }));
  };

  const handleUpdateResourceLink = (index, field, value) => {
    setForm((prev) => {
      const updated = [...(prev.resourceLinks || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, resourceLinks: updated };
    });
  };

  const handleRemoveResourceLink = (index) => {
    setForm((prev) => ({
      ...prev,
      resourceLinks: (prev.resourceLinks || []).filter((_, i) => i !== index),
    }));
  };

  // --- Video Handlers ---
  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateVideoFile(file);
    if (validationError) {
      setVideoUploadError(validationError);
      setSelectedVideoFile(null);
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
      return;
    }

    setSelectedVideoFile(file);
    setVideoUploadError("");
    setVideoUploadSuccess("");
  };

  const handleUploadVideo = async () => {
    if (!selectedVideoFile || uploadingVideo) return;

    setUploadingVideo(true);
    setVideoUploadError("");
    setVideoUploadSuccess("");

    try {
      const result = await uploadPortfolioVideo(selectedVideoFile);
      if (result && result.url) {
        setForm((prev) => ({
          ...prev,
          videoUrl: result.url,
          videoPublicId: result.publicId || "",
        }));
        setVideoUploadSuccess(
          `Video stored in Cloudinary (folder: designtouch/portfolio, ID: ${result.publicId || "stored"}).`
        );
        setSelectedVideoFile(null);
        if (videoFileInputRef.current) videoFileInputRef.current.value = "";
      } else {
        throw new Error("No video URL returned from the server.");
      }
    } catch (err) {
      setVideoUploadError(err.message || "Failed to upload video to Cloudinary.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleClearSelectedVideo = () => {
    setSelectedVideoFile(null);
    setVideoUploadError("");
    if (videoFileInputRef.current) videoFileInputRef.current.value = "";
  };

  const handleRemoveVideo = () => {
    setForm((prev) => ({
      ...prev,
      videoUrl: "",
      videoPublicId: "",
    }));
    setVideoUploadSuccess("");
    setVideoUploadError("");
    setSelectedVideoFile(null);
    if (videoFileInputRef.current) videoFileInputRef.current.value = "";
  };

  // --- Poster Handlers (Optional for Video Editing) ---
  const handlePosterSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setPosterUploadError(validationError);
      setSelectedPosterFile(null);
      if (posterFileInputRef.current) posterFileInputRef.current.value = "";
      return;
    }

    setSelectedPosterFile(file);
    setPosterUploadError("");
    setPosterUploadSuccess("");
  };

  const handleUploadPoster = async () => {
    if (!selectedPosterFile || uploadingPoster) return;

    setUploadingPoster(true);
    setPosterUploadError("");
    setPosterUploadSuccess("");

    try {
      const result = await uploadPortfolioImage(selectedPosterFile, "designtouch/portfolio");
      if (result && result.url) {
        setForm((prev) => ({
          ...prev,
          imageUrl: result.url,
          imagePublicId: result.publicId || "",
        }));
        setPosterUploadSuccess(
          `Poster image uploaded to Cloudinary (${result.publicId || "stored"}).`
        );
        setSelectedPosterFile(null);
        if (posterFileInputRef.current) posterFileInputRef.current.value = "";
      } else {
        throw new Error("No image URL returned from the server.");
      }
    } catch (err) {
      setPosterUploadError(err.message || "Failed to upload poster image to Cloudinary.");
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleClearSelectedPoster = () => {
    setSelectedPosterFile(null);
    setPosterUploadError("");
    if (posterFileInputRef.current) posterFileInputRef.current.value = "";
  };

  const handleRemovePoster = () => {
    setForm((prev) => ({
      ...prev,
      imageUrl: "",
      imagePublicId: "",
    }));
    setPosterUploadSuccess("");
    setPosterUploadError("");
    setSelectedPosterFile(null);
    if (posterFileInputRef.current) posterFileInputRef.current.value = "";
  };

  // --- Thumbnail Handlers (Required for Thumbnail Design) ---
  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setThumbnailUploadError(validationError);
      setSelectedThumbnailFile(null);
      if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = "";
      return;
    }

    setSelectedThumbnailFile(file);
    setThumbnailUploadError("");
    setThumbnailUploadSuccess("");
  };

  const handleUploadThumbnail = async () => {
    if (!selectedThumbnailFile || uploadingThumbnail) return;

    setUploadingThumbnail(true);
    setThumbnailUploadError("");
    setThumbnailUploadSuccess("");

    try {
      const result = await uploadPortfolioImage(selectedThumbnailFile, "designtouch/thumbnails");
      if (result && result.url) {
        setForm((prev) => ({
          ...prev,
          imageUrl: result.url,
          thumbnailUrl: result.url,
          imagePublicId: result.publicId || "",
        }));
        setThumbnailUploadSuccess(
          `Thumbnail stored in Cloudinary (folder: designtouch/thumbnails, ID: ${result.publicId || "stored"}).`
        );
        setSelectedThumbnailFile(null);
        if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = "";
      } else {
        throw new Error("No image URL returned from the server.");
      }
    } catch (err) {
      setThumbnailUploadError(err.message || "Failed to upload thumbnail to Cloudinary.");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleClearSelectedThumbnail = () => {
    setSelectedThumbnailFile(null);
    setThumbnailUploadError("");
    if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = "";
  };

  const handleRemoveThumbnail = () => {
    setForm((prev) => ({
      ...prev,
      imageUrl: "",
      thumbnailUrl: "",
      imagePublicId: "",
    }));
    setThumbnailUploadSuccess("");
    setThumbnailUploadError("");
    setSelectedThumbnailFile(null);
    if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = "";
  };

  const isBusy = saving || uploadingVideo || uploadingPoster || uploadingThumbnail;
  const isVideo = form.contentType === "VIDEO_EDITING";

  // --- Form Submission with Auto-Upload ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBusy) return;

    setError("");

    if (!form.title || !form.title.trim()) {
      setError("Project Title is required.");
      scrollModalToTop();
      return;
    }

    if (!form.categoryId) {
      setError("Please select a category for this project.");
      scrollModalToTop();
      return;
    }

    // Validate Google Drive URL across all project types if provided
    if (form.googleDriveUrl?.trim()) {
      if (!isValidGoogleDriveUrl(form.googleDriveUrl.trim())) {
        setError(
          "Google Drive URL must be a valid, secure HTTPS link from Google Drive (e.g. https://drive.google.com/... or https://docs.google.com/...)."
        );
        scrollModalToTop();
        return;
      }
    }

    // Media checks
    if (isVideo) {
      const hasVideoMedia = Boolean(
        form.videoUrl?.trim() || selectedVideoFile || form.liveVideoUrl?.trim()
      );
      if (!hasVideoMedia) {
        setError(
          "For Video Editing projects, provide at least one video asset: upload a video file, enter a Video URL, or provide a Live Video URL."
        );
        scrollModalToTop();
        return;
      }

      if (form.liveVideoUrl?.trim() && !isValidHttpUrl(form.liveVideoUrl.trim())) {
        setError(
          "Live Video URL must be a valid HTTP or HTTPS URL (e.g. https://www.youtube.com/watch?v=...)."
        );
        scrollModalToTop();
        return;
      }

      if (Array.isArray(form.resourceLinks)) {
        for (let i = 0; i < form.resourceLinks.length; i++) {
          const link = form.resourceLinks[i];
          const hasTitle = Boolean(link?.title?.trim());
          const hasUrl = Boolean(link?.url?.trim());
          if (hasTitle || hasUrl) {
            if (!hasTitle) {
              setError(`Resource Link #${i + 1} is missing a title.`);
              scrollModalToTop();
              return;
            }
            if (!hasUrl) {
              setError(`Resource Link #${i + 1} ("${link.title}") is missing a URL.`);
              scrollModalToTop();
              return;
            }
            if (!isValidHttpUrl(link.url.trim())) {
              setError(
                `Resource Link #${i + 1} ("${link.title}") must be a valid HTTP or HTTPS URL.`
              );
              scrollModalToTop();
              return;
            }
          }
        }
      }
    } else {
      const hasImage = Boolean(
        form.imageUrl?.trim() ||
        form.thumbnailUrl?.trim() ||
        selectedThumbnailFile
      );
      if (!hasImage) {
        setError("A thumbnail image upload or image URL is required for Thumbnail Design projects.");
        scrollModalToTop();
        return;
      }
    }

    setSaving(true);

    try {
      let activeVideoUrl = form.videoUrl?.trim() || "";
      let activeVideoPublicId = form.videoPublicId?.trim() || "";
      let activeImageUrl = form.imageUrl?.trim() || "";
      let activeThumbnailUrl = form.thumbnailUrl?.trim() || "";
      let activeImagePublicId = form.imagePublicId?.trim() || "";

      // 1. Auto-upload video if a file was selected but not yet uploaded
      if (isVideo && selectedVideoFile) {
        setSaveStatusText("Uploading video to Cloudinary (folder: designtouch/portfolio)...");
        setUploadingVideo(true);
        try {
          const videoUploadRes = await uploadPortfolioVideo(selectedVideoFile);
          if (videoUploadRes && videoUploadRes.url) {
            activeVideoUrl = videoUploadRes.url;
            activeVideoPublicId = videoUploadRes.publicId || "";
            setForm((prev) => ({
              ...prev,
              videoUrl: videoUploadRes.url,
              videoPublicId: videoUploadRes.publicId || "",
            }));
            setSelectedVideoFile(null);
            if (videoFileInputRef.current) videoFileInputRef.current.value = "";
          } else {
            throw new Error("No video URL returned from the server.");
          }
        } catch (vidErr) {
          setError(vidErr.message || "Failed to upload video to Cloudinary.");
          scrollModalToTop();
          return;
        } finally {
          setUploadingVideo(false);
        }
      }

      // 2. Auto-upload poster if a file was selected but not yet uploaded
      if (isVideo && selectedPosterFile) {
        setSaveStatusText("Uploading poster image to Cloudinary...");
        setUploadingPoster(true);
        try {
          const posterUploadRes = await uploadPortfolioImage(selectedPosterFile, "designtouch/portfolio");
          if (posterUploadRes && posterUploadRes.url) {
            activeImageUrl = posterUploadRes.url;
            activeImagePublicId = posterUploadRes.publicId || "";
            setForm((prev) => ({
              ...prev,
              imageUrl: posterUploadRes.url,
              imagePublicId: posterUploadRes.publicId || "",
            }));
            setSelectedPosterFile(null);
            if (posterFileInputRef.current) posterFileInputRef.current.value = "";
          } else {
            throw new Error("No poster image URL returned from the server.");
          }
        } catch (postErr) {
          setError(postErr.message || "Failed to upload poster image to Cloudinary.");
          scrollModalToTop();
          return;
        } finally {
          setUploadingPoster(false);
        }
      }

      // 3. Auto-upload thumbnail if a file was selected but not yet uploaded
      if (!isVideo && selectedThumbnailFile) {
        setSaveStatusText("Uploading thumbnail image to Cloudinary (folder: designtouch/thumbnails)...");
        setUploadingThumbnail(true);
        try {
          const thumbUploadRes = await uploadPortfolioImage(selectedThumbnailFile, "designtouch/thumbnails");
          if (thumbUploadRes && thumbUploadRes.url) {
            activeImageUrl = thumbUploadRes.url;
            activeThumbnailUrl = thumbUploadRes.url;
            activeImagePublicId = thumbUploadRes.publicId || "";
            setForm((prev) => ({
              ...prev,
              imageUrl: thumbUploadRes.url,
              thumbnailUrl: thumbUploadRes.url,
              imagePublicId: thumbUploadRes.publicId || "",
            }));
            setSelectedThumbnailFile(null);
            if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = "";
          } else {
            throw new Error("No thumbnail image URL returned from the server.");
          }
        } catch (thErr) {
          setError(thErr.message || "Failed to upload thumbnail image to Cloudinary.");
          scrollModalToTop();
          return;
        } finally {
          setUploadingThumbnail(false);
        }
      }

      setSaveStatusText("Persisting project in database...");

      // Final validation after uploads
      if (isVideo && !activeVideoUrl && !form.liveVideoUrl?.trim()) {
        setError(
          "A valid video asset is required (Cloudinary video URL, direct video URL, or Live Video URL)."
        );
        scrollModalToTop();
        return;
      }

      if (!isVideo && !activeImageUrl && !activeThumbnailUrl) {
        setError("A valid thumbnail image is required to save Thumbnail Design projects.");
        scrollModalToTop();
        return;
      }

      const thumbImg = activeImageUrl || activeThumbnailUrl || null;

      // Safe legacy category string: only send if matching known legacy enum
      let safeCategory = null;
      if (form.category && LEGACY_VIDEO_CATEGORIES.has(form.category)) {
        safeCategory = form.category;
      }

      const cleanedResourceLinks =
        isVideo && Array.isArray(form.resourceLinks)
          ? form.resourceLinks
              .filter((l) => l?.title?.trim() && l?.url?.trim())
              .map((l) => ({
                title: l.title.trim(),
                url: l.url.trim(),
                description: l.description ? l.description.trim() : null,
              }))
          : [];

      const payload = {
        title: form.title.trim(),
        contentType: form.contentType,
        categoryId: form.categoryId || null,
        category: safeCategory,
        subCategory: form.subCategory ? form.subCategory.trim() : null,
        description: form.description ? form.description.trim() : null,
        duration: isVideo && form.duration ? form.duration.trim() : null,
        videoUrl: isVideo ? (activeVideoUrl || null) : null,
        videoPublicId: isVideo ? (activeVideoPublicId || null) : null,
        imageUrl: isVideo ? (activeImageUrl || null) : thumbImg,
        thumbnailUrl: isVideo ? (activeThumbnailUrl || null) : thumbImg,
        imagePublicId: activeImagePublicId || null,
        liveVideoUrl: isVideo && form.liveVideoUrl?.trim() ? form.liveVideoUrl.trim() : null,
        googleDriveUrl: form.googleDriveUrl?.trim() ? form.googleDriveUrl.trim() : null,
        resourceLinks: cleanedResourceLinks,
        videoAspectRatio: isVideo ? (form.videoAspectRatio || "AUTO") : null,
        displayOrder: Number(form.displayOrder) || 0,
        isFeatured: Boolean(form.isFeatured),
      };

      if (item?.id) {
        await adminFetch(`/api/portfolio/${item.id}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await adminFetch("/api/portfolio", {
          method: "POST",
          body: payload,
        });
      }

      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save portfolio project.");
      scrollModalToTop();
    } finally {
      setSaving(false);
      setSaveStatusText("");
    }
  };

  const inputClasses =
    "bg-black/60 border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors w-full min-w-0 font-sans";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0e0e0e] border border-white/15 rounded-none w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#121212] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              {item?.id ? "Edit Portfolio Project" : "New Portfolio Project"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white disabled:opacity-40 bg-transparent border border-transparent hover:border-white/10 rounded-none cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2L10 10M10 2L2 10" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form
          ref={modalBodyRef}
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1"
        >
          {/* Top Error Alert */}
          {error && (
            <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-none px-3.5 py-2.5">
              <span className="w-1.5 h-1.5 bg-brand-red shrink-0 mt-1" />
              <span className="break-words min-w-0 font-mono">{error}</span>
            </div>
          )}

          {/* Section 1: Project Information */}
          <div className="p-4 bg-black/40 border border-white/[0.08] rounded-none">
            <div className="flex items-center justify-between pb-2 mb-3.5 border-b border-white/[0.06]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-300">
                01 // Project Information
              </span>
              <span className="text-[9px] font-mono text-neutral-500">METADATA</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                  Project Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder={
                    isVideo
                      ? "e.g. Motivation Video Edit"
                      : "e.g. How I Made ₹10 Lakh Online"
                  }
                  className={inputClasses}
                  disabled={isBusy}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                    Content Type *
                  </label>
                  <select
                    name="contentType"
                    value={form.contentType}
                    onChange={handleContentTypeChange}
                    className={inputClasses}
                    disabled={isBusy}
                  >
                    {CONTENT_TYPES.map(({ value, label }) => (
                      <option key={value} value={value} className="bg-[#111] text-white">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={form.categoryId || ""}
                    onChange={handleCategoryChange}
                    className={inputClasses}
                    required
                    disabled={isBusy}
                  >
                    <option value="" className="bg-[#111] text-neutral-500">
                      {loadingCategories ? "Loading categories..." : "Select Category..."}
                    </option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#111] text-white">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-[9px] font-mono text-neutral-500 mt-1 block">
                    {isVideo
                      ? "Showing Video Editing categories"
                      : "Showing Thumbnail Design categories"}
                  </span>
                </div>
              </div>

              {/* Video Format / Aspect Ratio (Required for Video Editing) */}
              {isVideo && (
                <div className="p-3 bg-black/60 border border-white/10 rounded-none space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-brand-red inline-block" />
                      <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-300">
                        Video Format / Aspect Ratio *
                      </label>
                    </div>
                    <span className="text-[9px] font-mono text-neutral-500">
                      CONTAINER GEOMETRY
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <select
                        name="videoAspectRatio"
                        value={form.videoAspectRatio || "16:9"}
                        onChange={handleChange}
                        className={inputClasses}
                        disabled={isBusy}
                        required={isVideo}
                      >
                        {VIDEO_ASPECT_RATIOS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[#111] text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Recommendation Badge Beside Dropdown */}
                    <div className="p-2 bg-white/[0.03] border border-white/10 flex flex-col justify-center min-h-[42px]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold uppercase text-brand-red">
                          {selectedRatioConfig?.badge}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-300">
                          Recommended: {selectedRatioConfig?.resolution}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-neutral-500 block">
                        Guideline only · upload resolutions are not restricted
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                  Sub-Category / Tag (Optional)
                </label>
                <input
                  name="subCategory"
                  value={form.subCategory}
                  onChange={handleChange}
                  placeholder={
                    isVideo
                      ? "e.g. 9:16 Shorts, 4K Master"
                      : "e.g. High CTR, 3D Render"
                  }
                  className={inputClasses}
                  disabled={isBusy}
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                  Project Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Brief summary of creative scope, pacing, color grading, or audio design."
                  className={`${inputClasses} resize-y min-h-[60px]`}
                  disabled={isBusy}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Media Assets & Storage */}
          <div className="p-4 bg-black/40 border border-white/[0.08] rounded-none">
            <div className="flex items-center justify-between pb-2 mb-3.5 border-b border-white/[0.06]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-300">
                02 // {isVideo ? "Video Asset & Cloudinary Storage" : "Thumbnail Image & Cloudinary Storage"}
              </span>
              <span className="text-[9px] font-mono text-neutral-500">
                {isVideo ? "FOLDER: designtouch/portfolio" : "FOLDER: designtouch/thumbnails"}
              </span>
            </div>

            {/* CASE A: VIDEO EDITING */}
            {isVideo && (
              <div className="space-y-4">
                {/* Dedicated Video Upload Widget */}
                <div className="p-3.5 bg-black/60 border border-white/10 rounded-none space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-red inline-block" />
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-200">
                        Upload Video File *
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-neutral-500">
                      MP4 / WEBM / MOV // MAX 100 MB
                    </span>
                  </div>

                  {videoUploadError && (
                    <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-none px-3 py-2">
                      <span className="w-1.5 h-1.5 bg-brand-red shrink-0 mt-1" />
                      <span className="break-words min-w-0">{videoUploadError}</span>
                    </div>
                  )}

                  {videoUploadSuccess && (
                    <div className="flex items-start gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-none px-3 py-2">
                      <span className="w-1.5 h-1.5 bg-brand-green shrink-0 mt-1" />
                      <span className="break-words min-w-0">{videoUploadSuccess}</span>
                    </div>
                  )}

                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                    onChange={handleVideoSelect}
                    disabled={isBusy}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      disabled={isBusy}
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 text-white text-xs font-mono uppercase tracking-wider rounded-none border border-white/10 cursor-pointer transition-colors shrink-0"
                    >
                      <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>
                        {selectedVideoFile
                          ? "Choose Different Video"
                          : form.videoUrl
                          ? "Replace Video File"
                          : "Choose Video File"}
                      </span>
                    </button>

                    {selectedVideoFile && (
                      <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/10 text-xs min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-white text-[11px] truncate">
                            {selectedVideoFile.name}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {formatBytes(selectedVideoFile.size)} · <span className="text-amber-400">Selected (uploads on Save)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleUploadVideo}
                            disabled={isBusy}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-brand-red hover:bg-[#dc2626] disabled:opacity-60 text-white text-[11px] font-mono uppercase tracking-wider rounded-none border border-brand-red cursor-pointer transition-colors"
                          >
                            {uploadingVideo ? <span>Uploading...</span> : <span>Upload Now</span>}
                          </button>
                          <button
                            type="button"
                            onClick={handleClearSelectedVideo}
                            disabled={isBusy}
                            className="px-2 py-1 text-neutral-400 hover:text-white text-[11px] font-mono uppercase bg-transparent border border-white/10 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}

                    {!selectedVideoFile && form.videoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        disabled={isBusy}
                        className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-red-400 bg-transparent border border-white/10 hover:border-red-500/30 cursor-pointer transition-colors"
                      >
                        Remove Video
                      </button>
                    )}
                  </div>

                  {form.videoPublicId && (
                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 pt-1">
                      <span className="text-neutral-500">Cloudinary Video ID:</span>
                      <span className="text-neutral-300 bg-white/[0.04] px-1.5 py-0.5 border border-white/10 truncate max-w-sm">
                        {form.videoPublicId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Direct Video URL Field */}
                <div>
                  <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                    Video URL (Direct MP4 / Cloudinary URL) *
                  </label>
                  <input
                    name="videoUrl"
                    value={form.videoUrl}
                    onChange={handleChange}
                    placeholder="e.g. https://res.cloudinary.com/.../video.mp4"
                    className={inputClasses}
                    disabled={isBusy}
                  />
                  <span className="text-[9px] font-mono text-neutral-500 mt-1 block">
                    Upload a file above or enter a direct MP4 URL. If a file is selected, it will be uploaded automatically when you save.
                  </span>
                </div>

                {/* Optional Poster / Cover Image */}
                <div className="p-3.5 bg-black/40 border border-white/10 rounded-none space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.06]">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-300">
                      Optional Poster / Cover Image
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500">
                      JPG / PNG / WEBP // MAX 10 MB
                    </span>
                  </div>

                  {posterUploadError && (
                    <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-none px-3 py-2">
                      <span className="w-1.5 h-1.5 bg-brand-red shrink-0 mt-1" />
                      <span className="break-words min-w-0">{posterUploadError}</span>
                    </div>
                  )}

                  {posterUploadSuccess && (
                    <div className="flex items-start gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-none px-3 py-2">
                      <span className="w-1.5 h-1.5 bg-brand-green shrink-0 mt-1" />
                      <span className="break-words min-w-0">{posterUploadSuccess}</span>
                    </div>
                  )}

                  <input
                    ref={posterFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    onChange={handlePosterSelect}
                    disabled={isBusy}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => posterFileInputRef.current?.click()}
                      disabled={isBusy}
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 text-white text-xs font-mono uppercase tracking-wider rounded-none border border-white/10 cursor-pointer transition-colors shrink-0"
                    >
                      <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {selectedPosterFile
                          ? "Choose Different Poster"
                          : form.imageUrl
                          ? "Replace Poster Image"
                          : "Upload Poster Image"}
                      </span>
                    </button>

                    {selectedPosterFile && (
                      <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/10 text-xs min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-white text-[11px] truncate">
                            {selectedPosterFile.name}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {formatBytes(selectedPosterFile.size)} · <span className="text-amber-400">Selected (uploads on Save)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleUploadPoster}
                            disabled={isBusy}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-brand-red hover:bg-[#dc2626] disabled:opacity-60 text-white text-[11px] font-mono uppercase tracking-wider rounded-none border border-brand-red cursor-pointer transition-colors"
                          >
                            {uploadingPoster ? <span>Uploading...</span> : <span>Upload Now</span>}
                          </button>
                          <button
                            type="button"
                            onClick={handleClearSelectedPoster}
                            disabled={isBusy}
                            className="px-2 py-1 text-neutral-400 hover:text-white text-[11px] font-mono uppercase bg-transparent border border-white/10 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}

                    {!selectedPosterFile && form.imageUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePoster}
                        disabled={isBusy}
                        className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-red-400 bg-transparent border border-white/10 hover:border-red-500/30 cursor-pointer transition-colors"
                      >
                        Remove Poster
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                      Poster Image URL (or paste external URL)
                    </label>
                    <input
                      name="imageUrl"
                      value={form.imageUrl}
                      onChange={handleChange}
                      placeholder="e.g. https://res.cloudinary.com/.../poster.jpg"
                      className={inputClasses}
                      disabled={isBusy}
                    />
                  </div>
                </div>

                {/* Video / Poster Live Preview */}
                {(videoPreviewBlobUrl || form.videoUrl || posterPreviewBlobUrl || form.imageUrl) && (
                  <div className="pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono uppercase text-neutral-400">
                        Live Preview ({form.videoAspectRatio || "16:9"} Container):
                      </span>
                      <span className="text-[9px] font-mono text-brand-red uppercase">
                        {form.videoUrl
                          ? "● Cloudinary Video URL Active"
                          : videoPreviewBlobUrl
                          ? "● Local Video Preview"
                          : "● Poster Image Preview Only"}
                      </span>
                    </div>

                    <div
                      className={`relative w-full ${getPreviewAspectClass(form.videoAspectRatio)} bg-black border border-white/10 overflow-hidden mx-auto sm:mx-0`}
                    >
                      {videoPreviewBlobUrl || form.videoUrl ? (
                        <video
                          key={videoPreviewBlobUrl || form.videoUrl}
                          src={videoPreviewBlobUrl || form.videoUrl}
                          poster={posterPreviewBlobUrl || form.imageUrl || undefined}
                          onLoadedMetadata={handleVideoMetadataLoaded}
                          controls
                          muted
                          playsInline
                          className="w-full h-full object-contain bg-black"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={posterPreviewBlobUrl || form.imageUrl}
                          alt="Poster Preview"
                          className="w-full h-full object-contain bg-black"
                        />
                      )}
                    </div>

                    {detectedMismatchWarning && (
                      <div className="flex items-start gap-2.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 px-3 py-2 mt-2">
                        <span className="w-1.5 h-1.5 bg-amber-400 shrink-0 mt-1" />
                        <span className="font-mono text-[10px] leading-relaxed">
                          {detectedMismatchWarning}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CASE B: THUMBNAIL DESIGN (Strictly Image, No Video) */}
            {!isVideo && (
              <div className="space-y-4">
                <div className="p-3.5 bg-black/60 border border-white/10 rounded-none space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-red inline-block" />
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-200">
                        Upload Thumbnail Image *
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-neutral-500">
                      JPG / PNG / WEBP // MAX 10 MB
                    </span>
                  </div>

                  {thumbnailUploadError && (
                    <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-none px-3 py-2">
                      <span className="w-1.5 h-1.5 bg-brand-red shrink-0 mt-1" />
                      <span className="break-words min-w-0">{thumbnailUploadError}</span>
                    </div>
                  )}

                  {thumbnailUploadSuccess && (
                    <div className="flex items-start gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-none px-3 py-2">
                      <span className="w-1.5 h-1.5 bg-brand-green shrink-0 mt-1" />
                      <span className="break-words min-w-0">{thumbnailUploadSuccess}</span>
                    </div>
                  )}

                  <input
                    ref={thumbnailFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    onChange={handleThumbnailSelect}
                    disabled={isBusy}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => thumbnailFileInputRef.current?.click()}
                      disabled={isBusy}
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 text-white text-xs font-mono uppercase tracking-wider rounded-none border border-white/10 cursor-pointer transition-colors shrink-0"
                    >
                      <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {selectedThumbnailFile
                          ? "Choose Different Image"
                          : form.imageUrl || form.thumbnailUrl
                          ? "Replace Thumbnail Image"
                          : "Choose Thumbnail Image"}
                      </span>
                    </button>

                    {selectedThumbnailFile && (
                      <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/10 text-xs min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-white text-[11px] truncate">
                            {selectedThumbnailFile.name}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {formatBytes(selectedThumbnailFile.size)} · <span className="text-amber-400">Selected (uploads on Save)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleUploadThumbnail}
                            disabled={isBusy}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-brand-red hover:bg-[#dc2626] disabled:opacity-60 text-white text-[11px] font-mono uppercase tracking-wider rounded-none border border-brand-red cursor-pointer transition-colors"
                          >
                            {uploadingThumbnail ? <span>Uploading...</span> : <span>Upload Now</span>}
                          </button>
                          <button
                            type="button"
                            onClick={handleClearSelectedThumbnail}
                            disabled={isBusy}
                            className="px-2 py-1 text-neutral-400 hover:text-white text-[11px] font-mono uppercase bg-transparent border border-white/10 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}

                    {!selectedThumbnailFile && (form.imageUrl || form.thumbnailUrl) && (
                      <button
                        type="button"
                        onClick={handleRemoveThumbnail}
                        disabled={isBusy}
                        className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-red-400 bg-transparent border border-white/10 hover:border-red-500/30 cursor-pointer transition-colors"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  {form.imagePublicId && (
                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 pt-1">
                      <span className="text-neutral-500">Cloudinary Image ID:</span>
                      <span className="text-neutral-300 bg-white/[0.04] px-1.5 py-0.5 border border-white/10 truncate max-w-sm">
                        {form.imagePublicId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Direct Image URL for compatibility / fallback */}
                <div>
                  <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                    Thumbnail Image URL *
                  </label>
                  <input
                    name="imageUrl"
                    value={form.imageUrl || form.thumbnailUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        imageUrl: val,
                        thumbnailUrl: val,
                      }));
                    }}
                    placeholder="e.g. https://res.cloudinary.com/.../thumbnail.jpg"
                    className={inputClasses}
                    disabled={isBusy}
                  />
                  <span className="text-[9px] font-mono text-neutral-500 mt-1 block">
                    Upload an image file above or paste an image URL. If an image file is selected, it will be uploaded automatically on Save.
                  </span>
                </div>

                {/* Thumbnail Image Live Preview */}
                {(thumbnailPreviewBlobUrl || form.imageUrl || form.thumbnailUrl) && (
                  <div className="pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono uppercase text-neutral-400">
                        Thumbnail Preview (16:9 Packaging):
                      </span>
                      <span className="text-[9px] font-mono text-brand-red uppercase">
                        {form.imageUrl
                          ? "● Cloudinary Image Active"
                          : "● Local Thumbnail Preview"}
                      </span>
                    </div>
                    <div className="relative aspect-video w-full max-w-sm bg-black border border-white/10 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailPreviewBlobUrl || form.imageUrl || form.thumbnailUrl}
                        alt="Thumbnail Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Optional Google Drive Link for Thumbnail Design */}
                <div className="pt-3 border-t border-white/[0.08]">
                  <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-300 mb-1.5 flex items-center justify-between">
                    <span>GOOGLE DRIVE URL</span>
                    <span className="text-[9px] font-mono text-neutral-500 font-normal">OPTIONAL // ORIGINAL ASSET / DELIVERY FOLDER</span>
                  </label>
                  <input
                    name="googleDriveUrl"
                    value={form.googleDriveUrl || ""}
                    onChange={handleChange}
                    placeholder="e.g. https://drive.google.com/drive/folders/... or https://drive.google.com/file/d/..."
                    className={inputClasses}
                    disabled={isBusy}
                  />
                  <span className="text-[9px] font-mono text-neutral-400 mt-1.5 block leading-relaxed">
                    Paste an HTTPS Google Drive sharing link for the original high-resolution thumbnail artwork or its delivery folder. Please ensure the link has suitable sharing permissions (e.g. &quot;Anyone with the link can view&quot;) for the intended recipient.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: External Video & Client Delivery Links (Video Editing Only) */}
          {isVideo && (
            <div className="p-4 bg-black/40 border border-white/[0.08] rounded-none">
              <div className="flex items-center justify-between pb-2 mb-3.5 border-b border-white/[0.06]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-300">
                  03 // External Video &amp; Client Delivery Links
                </span>
                <span className="text-[9px] font-mono text-neutral-500">STREAMING &amp; CLOUD ASSETS</span>
              </div>

              <div className="space-y-4">
                {/* Live Video URL */}
                <div>
                  <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                    Live Video URL (YouTube / Instagram / Vimeo / Facebook)
                  </label>
                  <input
                    name="liveVideoUrl"
                    value={form.liveVideoUrl}
                    onChange={handleChange}
                    placeholder="e.g. https://www.youtube.com/watch?v=... or https://instagram.com/p/..."
                    className={inputClasses}
                    disabled={isBusy}
                  />
                  <span className="text-[9px] font-mono text-neutral-500 mt-1 block">
                    Public live streaming or social URL. Enables the &quot;WATCH LIVE&quot; action on the project detail page.
                  </span>
                </div>

                {/* Google Drive Delivery URL */}
                <div>
                  <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                    Google Drive Delivery URL (Client Delivery)
                  </label>
                  <input
                    name="googleDriveUrl"
                    value={form.googleDriveUrl}
                    onChange={handleChange}
                    placeholder="e.g. https://drive.google.com/drive/folders/... or file link"
                    className={inputClasses}
                    disabled={isBusy}
                  />
                  <span className="text-[9px] font-mono text-neutral-500 mt-1 block">
                    Secure client view/download link. Enables the &quot;GOOGLE DRIVE&quot; delivery button on the project page.
                  </span>
                </div>

                {/* Dynamic Additional Resource Links */}
                <div className="pt-2 border-t border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-300 block">
                        Additional Resource Links
                      </span>
                      <span className="text-[9px] font-mono text-neutral-500">
                        Instagram reels, client asset packs, LUTs, cue sheets, or source materials.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddResourceLink}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white text-[10px] font-mono uppercase tracking-wider rounded-none border border-white/10 hover:border-white/20 transition-colors cursor-pointer shrink-0"
                    >
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 1V11M1 6H11" />
                      </svg>
                      <span>Add Link</span>
                    </button>
                  </div>

                  {(!form.resourceLinks || form.resourceLinks.length === 0) ? (
                    <div className="p-3 bg-black/50 border border-dashed border-white/10 text-center">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                        No additional resource links added.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.resourceLinks.map((link, index) => (
                        <div
                          key={index}
                          className="p-3 bg-black/60 border border-white/10 rounded-none space-y-2.5 relative"
                        >
                          <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.05]">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-brand-red font-bold">
                              Link #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveResourceLink(index)}
                              disabled={isBusy}
                              className="text-neutral-500 hover:text-red-400 p-1 text-[10px] font-mono uppercase tracking-wider inline-flex items-center gap-1 bg-transparent border-0 cursor-pointer transition-colors"
                              title="Remove Link"
                            >
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 2L10 10M10 2L2 10" />
                              </svg>
                              <span>Remove</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="text-[9px] font-mono uppercase text-neutral-400 mb-1 block">
                                Title *
                              </label>
                              <input
                                value={link.title || ""}
                                onChange={(e) => handleUpdateResourceLink(index, "title", e.target.value)}
                                placeholder="e.g. Instagram Reel 9:16"
                                className={inputClasses}
                                disabled={isBusy}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-mono uppercase text-neutral-400 mb-1 block">
                                Target URL (HTTP/HTTPS) *
                              </label>
                              <input
                                value={link.url || ""}
                                onChange={(e) => handleUpdateResourceLink(index, "url", e.target.value)}
                                placeholder="https://..."
                                className={inputClasses}
                                disabled={isBusy}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] font-mono uppercase text-neutral-400 mb-1 block">
                              Description / Note (Optional)
                            </label>
                            <input
                              value={link.description || ""}
                              onChange={(e) => handleUpdateResourceLink(index, "description", e.target.value)}
                              placeholder="e.g. 60fps high-bitrate vertical export for social campaigns"
                              className={inputClasses}
                              disabled={isBusy}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Settings & Visibility */}
          <div className="p-4 bg-black/40 border border-white/[0.08] rounded-none">
            <div className="flex items-center justify-between pb-2 mb-3.5 border-b border-white/[0.06]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-300">
                04 // Settings &amp; Visibility
              </span>
              <span className="text-[9px] font-mono text-neutral-500">ORDER &amp; FEATURING</span>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {isVideo ? (
                  <div>
                    <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                      Duration (e.g. 08:12 or 00:45)
                    </label>
                    <input
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      placeholder="e.g. 08:12"
                      className={inputClasses}
                      disabled={isBusy}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-500 mb-1.5 block">
                      Duration (N/A for Thumbnails)
                    </label>
                    <input
                      disabled
                      value="Static Image Graphic"
                      className={`${inputClasses} opacity-40 cursor-not-allowed`}
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={form.displayOrder}
                    onChange={handleChange}
                    placeholder="0"
                    className={inputClasses}
                    disabled={isBusy}
                  />
                </div>
              </div>

              {/* Featured Toggle */}
              <label className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  disabled={isBusy}
                  className="w-4 h-4 accent-brand-red rounded-none"
                />
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-white block">
                    Feature on Homepage Carousel
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    When checked, this project appears in the Homepage &quot;Featured Projects&quot; showcase.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Bottom Error Alert (Guaranteed visible above actions) */}
          {error && (
            <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-none px-3.5 py-2.5">
              <span className="w-1.5 h-1.5 bg-brand-red shrink-0 mt-1" />
              <span className="break-words min-w-0 font-mono">{error}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
            <div className="text-[11px] font-mono text-neutral-400 min-h-[1.25rem]">
              {isBusy && (
                <div className="flex items-center gap-2 text-brand-red animate-pulse">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>{saveStatusText || "Processing project media..."}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isBusy}
                className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white disabled:opacity-40 border border-white/15 bg-transparent rounded-none cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-brand-red hover:bg-[#dc2626] disabled:opacity-60 border border-brand-red rounded-none cursor-pointer transition-colors"
              >
                {isBusy ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>
                      {uploadingVideo
                        ? "Uploading Video..."
                        : uploadingPoster
                        ? "Uploading Poster..."
                        : uploadingThumbnail
                        ? "Uploading Thumbnail..."
                        : "Saving Project..."}
                    </span>
                  </>
                ) : (
                  <span>{item?.id ? "Update Project" : "Save Project"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
