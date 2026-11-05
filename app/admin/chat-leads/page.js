"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import {
  Users,
  MessageSquare,
  Calendar,
  Search,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  Mail,
  User,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import {
  getAdminChatLeads,
  getAdminChatLeadsStats,
  getAdminChatLeadDetail,
  updateAdminChatLeadStatus,
  deleteAdminChatLead,
  bulkDeleteAdminChatLeads,
  exportAdminChatLeads,
} from "@/lib/api";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminInput,
  AdminSelect,
  AdminTableWrapper,
  AdminTable,
  AdminThead,
  AdminTbody,
  AdminTr,
  AdminTh,
  AdminTd,
  AdminModal,
  AdminAlert,
  AdminEmptyState,
} from "@/components/admin/AdminUI";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";

function formatDateTime(isoString) {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export default function AdminChatLeadsPage() {
  const [, startTransition] = useTransition();

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    leadsToday: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Table Data & Pagination
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 15;

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateRangeFilter, setDateRangeFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("newest");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail Modal State
  const [activeLeadId, setActiveLeadId] = useState(null);
  const [leadDetail, setLeadDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Delete Modals
  const [singleDeleteTarget, setSingleDeleteTarget] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Feedback Alerts
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [exporting, setExporting] = useState(false);

  // Auto-dismiss alerts after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 7000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Load Dashboard Stats
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await getAdminChatLeadsStats();
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load chat leads stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load Leads Page
  const loadLeads = useCallback(
    async (pageToLoad = 0) => {
      try {
        setLoading(true);
        setError("");
        const res = await getAdminChatLeads({
          search,
          status: statusFilter,
          dateRange: dateRangeFilter,
          sort: sortOption,
          page: pageToLoad,
          size: pageSize,
        });

        if (res) {
          setLeads(res.leads || []);
          setPage(res.currentPage ?? pageToLoad);
          setTotalPages(res.totalPages || 1);
          setTotalElements(res.totalElements || 0);

          if (res.stats) {
            setStats(res.stats);
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load chat leads. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, dateRangeFilter, sortOption]
  );

  // Initial load
  useEffect(() => {
    loadLeads(0);
    loadStats();
  }, [loadLeads, loadStats]);

  // Handle Search Input Debounce / Enter
  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      setPage(0);
      loadLeads(0);
    }
  };

  // Selection handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllOnPageSelected =
    leads.length > 0 && leads.every((l) => selectedIds.includes(l.id));

  const handleSelectAllOnPage = () => {
    if (isAllOnPageSelected) {
      const onPageIds = new Set(leads.map((l) => l.id));
      setSelectedIds((prev) => prev.filter((id) => !onPageIds.has(id)));
    } else {
      const merged = new Set([...selectedIds, ...leads.map((l) => l.id)]);
      setSelectedIds(Array.from(merged));
    }
  };

  // Export handlers
  const handleExportAll = async () => {
    try {
      setExporting(true);
      setError("");
      const result = await exportAdminChatLeads({
        search,
        status: statusFilter,
        dateRange: dateRangeFilter,
      });
      setSuccess(`Exported chat leads file: ${result.filename}`);
    } catch (err) {
      setError(err.message || "Failed to export chat leads to Excel.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      setExporting(true);
      setError("");
      const result = await exportAdminChatLeads({
        ids: selectedIds,
      });
      setSuccess(`Exported ${selectedIds.length} selected leads to Excel.`);
    } catch (err) {
      setError(err.message || "Failed to export selected leads.");
    } finally {
      setExporting(false);
    }
  };

  // Single Delete
  const handleConfirmSingleDelete = async () => {
    if (!singleDeleteTarget) return;
    try {
      setDeleteLoading(true);
      await deleteAdminChatLead(singleDeleteTarget.id);
      setSuccess(`Lead "${singleDeleteTarget.name}" deleted successfully.`);
      setSelectedIds((prev) => prev.filter((id) => id !== singleDeleteTarget.id));
      setSingleDeleteTarget(null);
      if (activeLeadId === singleDeleteTarget.id) {
        setActiveLeadId(null);
        setLeadDetail(null);
      }
      loadLeads(page);
      loadStats();
    } catch (err) {
      setError(err.message || "Failed to delete lead.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Bulk Delete
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setDeleteLoading(true);
      const res = await bulkDeleteAdminChatLeads(selectedIds);
      setSuccess(res?.message || `Successfully deleted ${selectedIds.length} leads.`);
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
      loadLeads(0);
      loadStats();
    } catch (err) {
      setError(err.message || "Failed to delete selected leads.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // View Lead Detail
  const handleOpenDetail = async (lead) => {
    setActiveLeadId(lead.id);
    setDetailLoading(true);
    try {
      const detail = await getAdminChatLeadDetail(lead.id);
      setLeadDetail(detail);
    } catch (err) {
      setError(err.message || "Failed to load lead details.");
    } finally {
      setDetailLoading(false);
    }
  };

  // Update Status from Detail Drawer / Table
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setStatusUpdating(true);
      const updated = await updateAdminChatLeadStatus(id, newStatus);
      // Update local state in table
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, conversationStatus: updated.conversationStatus } : l
        )
      );
      // Update modal state if open
      if (leadDetail && leadDetail.id === id) {
        setLeadDetail((prev) => ({
          ...prev,
          conversationStatus: updated.conversationStatus,
        }));
      }
      setSuccess(`Status updated to ${newStatus}.`);
      loadStats();
    } catch (err) {
      setError(err.message || "Failed to update lead status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDateRangeFilter("ALL");
    setSortOption("newest");
    setPage(0);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    dateRangeFilter !== "ALL" ||
    sortOption !== "newest";

  return (
    <div className="pb-16">
      {/* Top Page Header */}
      <AdminPageHeader
        title="Chat Leads"
        description="Review visitor inquiries, manage lead status, and export to Excel."
        action={
          <div className="flex items-center gap-2">
            <AdminButton
              variant="outline"
              size="sm"
              onClick={handleExportAll}
              disabled={exporting || leads.length === 0}
              title="Download all leads matching current filters as .xlsx"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exporting ? "Exporting..." : "Export All (.xlsx)"}</span>
            </AdminButton>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => {
                loadLeads(page);
                loadStats();
              }}
              title="Refresh leads and stats"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </AdminButton>
          </div>
        }
      />

      {/* Alerts */}
      {error && <AdminAlert variant="error">{error}</AdminAlert>}
      {success && <AdminAlert variant="success">{success}</AdminAlert>}

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Total Leads */}
        <AdminCard padding="p-5" className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Total Leads
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display mt-1">
                {statsLoading ? "—" : stats.totalLeads.toLocaleString()}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1">
                All visitor records captured
              </p>
            </div>
            <div className="w-10 h-10 bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>

        {/* New Leads (Active) */}
        <AdminCard padding="p-5" className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                New Leads
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display mt-1">
                {statsLoading ? "—" : stats.newLeads.toLocaleString()}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1">
                Active status inquiries
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>

        {/* Leads Today */}
        <AdminCard padding="p-5" className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-brand-red">
                Leads Today
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display mt-1">
                {statsLoading ? "—" : stats.leadsToday.toLocaleString()}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-1">
                Created since midnight
              </p>
            </div>
            <div className="w-10 h-10 bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Filter and Search Bar */}
      <AdminCard padding="p-4" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <AdminInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder="Search by name or email..."
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <AdminSelect
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </AdminSelect>
          </div>

          {/* Date Range Filter */}
          <div className="md:col-span-3">
            <AdminSelect
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
            </AdminSelect>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <AdminSelect
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setPage(0);
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </AdminSelect>
          </div>
        </div>

        {/* Toolbar Sub-actions (Selection & Clear) */}
        {(selectedIds.length > 0 || hasActiveFilters) && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <>
                  <span className="text-xs font-mono font-bold text-white bg-white/10 px-2.5 py-1">
                    {selectedIds.length} SELECTED
                  </span>
                  <AdminButton
                    variant="outline"
                    size="sm"
                    onClick={handleExportSelected}
                    disabled={exporting}
                    title="Export only selected rows to Excel"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Selected</span>
                  </AdminButton>
                  <AdminButton
                    variant="danger"
                    size="sm"
                    onClick={() => setShowBulkDeleteModal(true)}
                    title="Delete selected leads"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected</span>
                  </AdminButton>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="text-xs font-mono text-neutral-400 hover:text-white underline cursor-pointer ml-1"
                  >
                    Deselect All
                  </button>
                </>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-mono text-neutral-400 hover:text-brand-red flex items-center gap-1 cursor-pointer transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        )}
      </AdminCard>

      {/* Leads Table */}
      {loading ? (
        <div className="p-12 text-center bg-[#0d0d0d] border border-white/10">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-red mx-auto mb-2" />
          <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
            Loading chat leads...
          </p>
        </div>
      ) : leads.length === 0 ? (
        <AdminEmptyState
          title="No chat leads found"
          description={
            hasActiveFilters
              ? "No leads matched your search or filter settings. Try clearing your filters."
              : "No visitor leads have been captured yet. When visitors enter their details in the chat, their information will appear here."
          }
          action={
            hasActiveFilters ? (
              <AdminButton variant="secondary" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </AdminButton>
            ) : null
          }
        />
      ) : (
        <>
          <AdminTableWrapper>
            <AdminTable>
              <AdminThead>
                <AdminTr>
                  <AdminTh className="w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAllOnPage}
                      className="text-neutral-400 hover:text-white cursor-pointer"
                      title={isAllOnPageSelected ? "Deselect page" : "Select all on page"}
                    >
                      {isAllOnPageSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand-red" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </AdminTh>
                  <AdminTh>Visitor Name</AdminTh>
                  <AdminTh>Email</AdminTh>
                  <AdminTh>Captured Date</AdminTh>
                  <AdminTh>Status</AdminTh>
                  <AdminTh className="text-right">Actions</AdminTh>
                </AdminTr>
              </AdminThead>
              <AdminTbody>
                {leads.map((lead) => {
                  const isSelected = selectedIds.includes(lead.id);
                  const statusVariant =
                    lead.conversationStatus === "ACTIVE"
                      ? "active"
                      : lead.conversationStatus === "RESOLVED"
                      ? "neutral"
                      : "inactive";

                  return (
                    <AdminTr
                      key={lead.id}
                      className={isSelected ? "bg-white/[0.04]" : ""}
                    >
                      {/* Checkbox */}
                      <AdminTd className="text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(lead.id)}
                          className="text-neutral-400 hover:text-white cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand-red" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </AdminTd>

                      {/* Visitor Name */}
                      <AdminTd>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 font-bold text-xs uppercase font-mono">
                            {lead.name ? lead.name.charAt(0) : "V"}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs tracking-wide">
                              {lead.name || "Anonymous Visitor"}
                            </p>
                            <span className="text-[10px] font-mono text-neutral-500 uppercase">
                              ID: {lead.id ? lead.id.substring(0, 8) : "—"}
                            </span>
                          </div>
                        </div>
                      </AdminTd>

                      {/* Email */}
                      <AdminTd>
                        <a
                          href={`mailto:${lead.email}`}
                          className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white hover:underline font-mono"
                          title="Compose email"
                        >
                          <Mail className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{lead.email}</span>
                        </a>
                      </AdminTd>

                      {/* Captured Date */}
                      <AdminTd>
                        <div className="text-xs text-neutral-300 font-mono">
                          {formatDateTime(lead.createdAt)}
                        </div>
                      </AdminTd>

                      {/* Conversation Status */}
                      <AdminTd>
                        <AdminBadge variant={statusVariant}>
                          {lead.conversationStatus || "ACTIVE"}
                        </AdminBadge>
                      </AdminTd>

                      {/* Actions */}
                      <AdminTd className="text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <AdminButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetail(lead)}
                            title="View lead details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </AdminButton>
                          <AdminButton
                            variant="ghost"
                            size="icon"
                            onClick={() => setSingleDeleteTarget(lead)}
                            title="Delete this lead"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-400" />
                          </AdminButton>
                        </div>
                      </AdminTd>
                    </AdminTr>
                  );
                })}
              </AdminTbody>
            </AdminTable>
          </AdminTableWrapper>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 px-2">
            <p className="text-xs font-mono text-neutral-400">
              Showing{" "}
              <span className="text-white font-bold">
                {leads.length > 0 ? page * pageSize + 1 : 0}
              </span>{" "}
              to{" "}
              <span className="text-white font-bold">
                {Math.min((page + 1) * pageSize, totalElements)}
              </span>{" "}
              of <span className="text-white font-bold">{totalElements}</span> leads
            </p>

            <div className="flex items-center gap-2">
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  const newPage = Math.max(0, page - 1);
                  setPage(newPage);
                  loadLeads(newPage);
                }}
                disabled={page <= 0 || loading}
              >
                Previous
              </AdminButton>

              <span className="text-xs font-mono text-neutral-300 px-2">
                Page {page + 1} of {totalPages || 1}
              </span>

              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  const newPage = Math.min(totalPages - 1, page + 1);
                  setPage(newPage);
                  loadLeads(newPage);
                }}
                disabled={page >= totalPages - 1 || loading}
              >
                Next
              </AdminButton>
            </div>
          </div>
        </>
      )}

      {/* Lead Detail Modal */}
      {activeLeadId && (
        <AdminModal
          isOpen={Boolean(activeLeadId)}
          onClose={() => {
            setActiveLeadId(null);
            setLeadDetail(null);
          }}
          title="Lead Details"
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div>
                {leadDetail && (
                  <AdminButton
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSingleDeleteTarget({
                        id: leadDetail.id,
                        name: leadDetail.name,
                        email: leadDetail.email,
                      });
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Lead</span>
                  </AdminButton>
                )}
              </div>
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setActiveLeadId(null);
                  setLeadDetail(null);
                }}
              >
                Close
              </AdminButton>
            </div>
          }
        >
          {detailLoading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-red mx-auto mb-2" />
              <p className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                Loading lead details...
              </p>
            </div>
          ) : !leadDetail ? (
            <div className="py-8 text-center text-xs font-mono text-neutral-400">
              Lead details could not be loaded.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Visitor Overview */}
              <div className="p-4 bg-[#0a0a0a] border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    Visitor Name
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {leadDetail.name || "Anonymous Visitor"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    Email Address
                  </p>
                  <a
                    href={`mailto:${leadDetail.email}`}
                    className="text-xs text-brand-red hover:underline font-mono mt-0.5 inline-block truncate max-w-full"
                  >
                    {leadDetail.email}
                  </a>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    Captured Date
                  </p>
                  <p className="text-xs text-neutral-300 font-mono mt-0.5">
                    {formatDateTime(leadDetail.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    Source
                  </p>
                  <p className="text-xs text-neutral-300 font-mono mt-0.5 uppercase">
                    {leadDetail.source || "WEBSITE_CHATBOT"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    Lead Status
                  </p>
                  <div className="max-w-xs">
                    <AdminSelect
                      value={leadDetail.conversationStatus || "ACTIVE"}
                      disabled={statusUpdating}
                      onChange={(e) =>
                        handleUpdateStatus(leadDetail.id, e.target.value)
                      }
                      className="py-1 text-xs"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </AdminSelect>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AdminModal>
      )}

      {/* Confirm Single Delete Modal */}
      <AdminConfirmModal
        isOpen={Boolean(singleDeleteTarget)}
        title="Delete Lead"
        message={
          singleDeleteTarget
            ? `Are you sure you want to delete lead "${singleDeleteTarget.name}" (${singleDeleteTarget.email})? This action cannot be undone.`
            : "Are you sure you want to proceed?"
        }
        confirmLabel="Delete Lead"
        cancelLabel="Cancel"
        loading={deleteLoading}
        onConfirm={handleConfirmSingleDelete}
        onCancel={() => setSingleDeleteTarget(null)}
      />

      {/* Confirm Bulk Delete Modal */}
      <AdminConfirmModal
        isOpen={showBulkDeleteModal}
        title="Delete Selected Leads"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected leads? This action cannot be undone.`}
        confirmLabel={`Delete ${selectedIds.length} Leads`}
        cancelLabel="Cancel"
        loading={deleteLoading}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setShowBulkDeleteModal(false)}
      />
    </div>
  );
}

