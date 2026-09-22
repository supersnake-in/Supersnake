'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Mail,
  Phone,
  Copy,
  Check,
  Eye,
  RefreshCw,
  FileText,
  Package,
  X,
  ChevronRight,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { DefectReport, DefectStatus } from '@/lib/types';

const STATUS_OPTIONS: DefectStatus[] = [
  'Pending Review',
  'Under Investigation',
  'Approved',
  'Rejected',
  'Resolved',
];

export default function AdminDefectsPage() {
  const { defectReports, updateDefectReportStatus, refreshDefectReports } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<DefectReport | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync latest defect reports from Supabase on mount
  React.useEffect(() => {
    refreshDefectReports();
  }, [refreshDefectReports]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDefectReports();
    setIsRefreshing(false);
  };

  // Form states inside modal
  const [currentStatus, setCurrentStatus] = useState<DefectStatus>('Pending Review');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync modal state when selectedReport changes
  const handleOpenReport = (report: DefectReport) => {
    setSelectedReport(report);
    setCurrentStatus(report.status);
    setAdminNotes(report.adminNotes || '');
    setSaveSuccess(false);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
    setLightboxImage(null);
    setSaveSuccess(false);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getClientEmailSubject = (report: DefectReport) => {
    return `SuperSnake Claim ${report.reportNumber} - Order #${report.orderNumber}`;
  };

  const getClientEmailBody = (report: DefectReport, status: DefectStatus, notes: string) => {
    let statusText = `Your defect report is currently under review by our senior inspection atelier.`;
    if (status === 'Approved') {
      statusText = `We are pleased to inform you that your claim has been APPROVED by our Quality Atelier. We are processing your requested resolution.`;
    } else if (status === 'Under Investigation') {
      statusText = `Our senior inspection atelier has placed your claim under active investigation. We are reviewing the submitted evidence with our production team.`;
    } else if (status === 'Rejected') {
      statusText = `Following inspection by our atelier team, we regret to inform you that your claim could not be approved under our return/defect policy.`;
    } else if (status === 'Resolved') {
      statusText = `Your claim has been fully resolved and closed in our atelier system.`;
    }

    return `Dear ${report.customerName},

Regarding your reported defect claim ${report.reportNumber} for Order #${report.orderNumber} (${report.productName}):

${statusText}

${notes ? `QC Atelier Notes: ${notes}\n\n` : ''}If you have any further questions, please reply directly to this email or contact support@supersnake.in.

Warm regards,
SuperSnake Atelier Quality Assurance
Bengaluru, India
support@supersnake.in`;
  };

  const handleCopyEmailTemplate = () => {
    if (!selectedReport) return;
    const body = getClientEmailBody(selectedReport, currentStatus, adminNotes);
    navigator.clipboard.writeText(body);
    setCopiedField('template');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSaveStatus = async () => {
    if (!selectedReport) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const ok = await updateDefectReportStatus(
        selectedReport.id,
        currentStatus,
        adminNotes.trim()
      );
      if (ok) {
        setSaveSuccess(true);
        // Update local selected report reference
        setSelectedReport((prev) =>
          prev
            ? {
                ...prev,
                status: currentStatus,
                adminNotes: adminNotes.trim(),
                updatedAt: new Date().toISOString(),
              }
            : null
        );
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Failed to update defect report:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // KPI counts
  const totalCount = defectReports.length;
  const pendingCount = defectReports.filter((d) => d.status === 'Pending Review').length;
  const investigatingCount = defectReports.filter(
    (d) => d.status === 'Under Investigation'
  ).length;
  const approvedCount = defectReports.filter((d) => d.status === 'Approved').length;
  const rejectedCount = defectReports.filter((d) => d.status === 'Rejected').length;
  const resolvedCount = defectReports.filter((d) => d.status === 'Resolved').length;

  // Filtered list
  const filteredReports = useMemo(() => {
    return defectReports.filter((report) => {
      const matchesSearch =
        report.reportNumber.toLowerCase().includes(search.toLowerCase()) ||
        report.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        report.customerName.toLowerCase().includes(search.toLowerCase()) ||
        report.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        report.customerPhone.toLowerCase().includes(search.toLowerCase()) ||
        report.productName.toLowerCase().includes(search.toLowerCase()) ||
        report.defectType.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [defectReports, search, statusFilter]);

  const getStatusBadge = (status: DefectStatus) => {
    switch (status) {
      case 'Pending Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock size={11} /> PENDING REVIEW
          </span>
        );
      case 'Under Investigation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <RefreshCw size={11} className="animate-spin" /> INVESTIGATING
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-snake-green/10 text-snake-green border border-snake-green/30">
            <CheckCircle2 size={11} /> APPROVED
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30">
            <XCircle size={11} /> REJECTED
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-700/50 text-neutral-300 border border-neutral-600">
            <Check size={11} /> RESOLVED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-neutral-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-red-950/60 border border-red-800/60 rounded text-red-400">
              <ShieldAlert size={16} />
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              ATELIER QUALITY AUDIT & CLAIMS
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold uppercase text-white tracking-tight">
            DEFECTS REPORTED
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Review customer damage submissions, inspect photo & video proof, and issue garment replacements or refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded text-xs text-neutral-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-snake-green' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Claims'}</span>
          </button>

          <Link
            href="/returns/report"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded text-xs text-neutral-300 hover:text-white transition-colors"
          >
            <ExternalLink size={13} />
            <span>Open Client Portal</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        <div className="p-4 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-1">
          <span className="text-[10px] uppercase text-neutral-500 tracking-wider">ALL CLAIMS</span>
          <div className="text-2xl font-bold font-display text-white">{totalCount}</div>
          <p className="text-[10px] text-neutral-500">Total submitted tickets</p>
        </div>

        <div className="p-4 bg-[#0d0d0d] border border-amber-500/20 rounded-lg space-y-1">
          <span className="text-[10px] uppercase text-amber-400/90 tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            PENDING REVIEW
          </span>
          <div className="text-2xl font-bold font-display text-amber-400">{pendingCount}</div>
          <p className="text-[10px] text-neutral-500">Awaiting triage</p>
        </div>

        <div className="p-4 bg-[#0d0d0d] border border-sky-500/20 rounded-lg space-y-1">
          <span className="text-[10px] uppercase text-sky-400 tracking-wider">INVESTIGATING</span>
          <div className="text-2xl font-bold font-display text-sky-400">{investigatingCount}</div>
          <p className="text-[10px] text-neutral-500">Evidence under review</p>
        </div>

        <div className="p-4 bg-[#0d0d0d] border border-snake-green/20 rounded-lg space-y-1">
          <span className="text-[10px] uppercase text-snake-green tracking-wider">APPROVED</span>
          <div className="text-2xl font-bold font-display text-snake-green">{approvedCount}</div>
          <p className="text-[10px] text-neutral-500">Replacement / Refund</p>
        </div>

        <div className="p-4 bg-[#0d0d0d] border border-neutral-800/80 rounded-lg space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase text-neutral-400 tracking-wider">CLOSED</span>
          <div className="text-2xl font-bold font-display text-neutral-300">
            {rejectedCount + resolvedCount}
          </div>
          <p className="text-[10px] text-neutral-500">
            {rejectedCount} Rejected • {resolvedCount} Resolved
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket #, order #, client, product, defect..."
            className="w-full bg-[#0d0d0d] border border-neutral-800 rounded px-3 py-2 pl-9 text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All', count: totalCount },
            { id: 'Pending Review', label: 'Pending', count: pendingCount },
            { id: 'Under Investigation', label: 'Investigating', count: investigatingCount },
            { id: 'Approved', label: 'Approved', count: approvedCount },
            { id: 'Rejected', label: 'Rejected', count: rejectedCount },
            { id: 'Resolved', label: 'Resolved', count: resolvedCount },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-neutral-800 text-white font-bold border border-neutral-700'
                    : 'bg-[#0d0d0d] text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-snake-green text-black font-bold' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Defects Table */}
      <div className="bg-[#0d0d0d] border border-neutral-800/80 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">TICKET # / DATE</th>
              <th className="py-3 px-4">ORDER</th>
              <th className="py-3 px-4">CLIENT</th>
              <th className="py-3 px-4">AFFECTED GARMENT</th>
              <th className="py-3 px-4">DEFECT CATEGORY</th>
              <th className="py-3 px-4">EVIDENCE</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-neutral-500">
                  <ShieldAlert size={28} className="mx-auto mb-3 text-neutral-600" />
                  <p className="text-xs uppercase font-bold text-neutral-400">NO DEFECT REPORTS FOUND</p>
                  <p className="text-[11px] text-neutral-600 mt-1 max-w-md mx-auto">
                    {search || statusFilter !== 'all'
                      ? 'No claims match your search or filter parameters.'
                      : 'If a claim was submitted recently, click "Sync Claims Now" to pull the latest records from the cloud.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="mt-4 px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-300 hover:text-white font-mono inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-snake-green' : ''} />
                    <span>{isRefreshing ? 'Syncing...' : 'Sync Claims Now'}</span>
                  </button>
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => {
                const photosCount = report.images?.length || 0;
                const hasVideo = Boolean(report.videoUrl);

                return (
                  <tr
                    key={report.id}
                    onClick={() => handleOpenReport(report)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    {/* Ticket & Date */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block group-hover:text-snake-green transition-colors">
                        {report.reportNumber}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(report.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Order Number */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-300 font-bold">
                        {report.orderNumber}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <span className="text-white block font-semibold">{report.customerName}</span>
                      <span className="text-[10px] text-neutral-400 block truncate max-w-[160px]">
                        {report.customerEmail}
                      </span>
                    </td>

                    {/* Affected Garment */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-11 bg-neutral-900 border border-neutral-800 rounded overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                          {report.productImage ? (
                            <img
                              src={report.productImage}
                              alt={report.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={14} className="text-neutral-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate max-w-[180px]">
                            {report.productName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
                            {report.productColor && <span>{report.productColor}</span>}
                            {report.productColor && report.productSize && <span>•</span>}
                            {report.productSize && (
                              <span className="px-1 bg-neutral-800 text-neutral-300 rounded text-[9px] font-bold">
                                {report.productSize}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Defect Type */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-neutral-300 line-clamp-1">
                        {report.defectType}
                      </span>
                    </td>

                    {/* Evidence */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {photosCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[10px] text-neutral-300">
                            <ImageIcon size={10} className="text-neutral-400" />
                            {photosCount}
                          </span>
                        )}
                        {hasVideo && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[10px] text-snake-green">
                            <Video size={10} />
                            Vid
                          </span>
                        )}
                        {photosCount === 0 && !hasVideo && (
                          <span className="text-[10px] text-neutral-600">None</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(report.status)}</td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReport(report);
                        }}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-white hover:text-black rounded text-[10px] uppercase font-bold text-neutral-300 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>INSPECT</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Case Inspection Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-xs">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-800/90 flex items-center justify-between bg-neutral-950 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-950/60 border border-red-800/60 rounded text-red-400">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold uppercase text-white font-display">
                      TICKET {selectedReport.reportNumber}
                    </h2>
                    {getStatusBadge(selectedReport.status)}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Filed on {new Date(selectedReport.createdAt).toLocaleString('en-IN')}
                    {selectedReport.updatedAt && (
                      <span className="text-neutral-500">
                        {' '}
                        • Last updated {new Date(selectedReport.updatedAt).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Order & Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Client Info */}
                <div className="p-4 bg-neutral-950/80 border border-neutral-800/80 rounded-lg space-y-2">
                  <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider block">
                    CLIENT DOSSIER
                  </span>
                  <div>
                    <p className="text-white font-bold text-sm">{selectedReport.customerName}</p>
                    <div className="flex items-center justify-between text-neutral-400 mt-1">
                      <span className="truncate">{selectedReport.customerEmail}</span>
                      <button
                        onClick={() => handleCopy(selectedReport.customerEmail, 'email')}
                        className="text-neutral-500 hover:text-white ml-1 p-0.5"
                        title="Copy email"
                      >
                        {copiedField === 'email' ? <Check size={11} className="text-snake-green" /> : <Copy size={11} />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400 mt-0.5">
                      <span>{selectedReport.customerPhone || 'No phone recorded'}</span>
                      {selectedReport.customerPhone && (
                        <button
                          onClick={() => handleCopy(selectedReport.customerPhone, 'phone')}
                          className="text-neutral-500 hover:text-white ml-1 p-0.5"
                          title="Copy phone"
                        >
                          {copiedField === 'phone' ? <Check size={11} className="text-snake-green" /> : <Copy size={11} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const subject = getClientEmailSubject(selectedReport);
                    const body = getClientEmailBody(selectedReport, currentStatus, adminNotes);
                    const cleanPhone = (selectedReport.customerPhone || '').replace(/[^0-9]/g, '');

                    return (
                      <div className="pt-3 border-t border-neutral-800/80 space-y-2">
                        <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider block">
                          CONTACT CLIENT
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Gmail Web Compose */}
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                              selectedReport.customerEmail
                            )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-600/15 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded text-[11px] font-bold transition-colors"
                            title="Open pre-filled compose window in Gmail Web"
                          >
                            <Mail size={12} />
                            <span>Gmail Web</span>
                          </a>

                          {/* Default Mail App */}
                          <a
                            href={`mailto:${selectedReport.customerEmail}?subject=${encodeURIComponent(
                              subject
                            )}&body=${encodeURIComponent(body)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-900 hover:bg-white text-neutral-300 hover:text-black border border-neutral-700 rounded text-[11px] font-bold transition-colors"
                            title="Open default system mail client"
                          >
                            <ExternalLink size={12} />
                            <span>Mail App</span>
                          </a>

                          {/* WhatsApp (if phone available) */}
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(
                                `Hello ${selectedReport.customerName}, regarding your SuperSnake Claim ${selectedReport.reportNumber} for Order #${selectedReport.orderNumber}:`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600/15 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded text-[11px] font-bold transition-colors"
                              title="Open WhatsApp chat with client"
                            >
                              <MessageSquare size={12} />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          {/* Copy Email Template */}
                          <button
                            type="button"
                            onClick={handleCopyEmailTemplate}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 rounded text-[11px] font-mono transition-colors"
                            title="Copy email template to clipboard"
                          >
                            {copiedField === 'template' ? (
                              <>
                                <Check size={11} className="text-snake-green" />
                                <span className="text-snake-green font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Order Information */}
                <div className="p-4 bg-neutral-950/80 border border-neutral-800/80 rounded-lg space-y-2">
                  <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider block">
                    PURCHASE ORDER
                  </span>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-sm">{selectedReport.orderNumber}</span>
                      <button
                        onClick={() => handleCopy(selectedReport.orderNumber, 'order')}
                        className="text-neutral-500 hover:text-white p-0.5"
                        title="Copy order number"
                      >
                        {copiedField === 'order' ? <Check size={11} className="text-snake-green" /> : <Copy size={11} />}
                      </button>
                    </div>
                    <span className="text-[10px] text-neutral-400 block mt-1">
                      Matched Order ID: {selectedReport.orderId}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/60">
                    <Link
                      href={`/admin/orders`}
                      className="inline-flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white hover:underline"
                    >
                      <ExternalLink size={12} /> View in Orders Tab
                    </Link>
                  </div>
                </div>

                {/* Affected Product */}
                <div className="p-4 bg-neutral-950/80 border border-neutral-800/80 rounded-lg space-y-2">
                  <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider block">
                    AFFECTED ITEM
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 bg-neutral-900 border border-neutral-800 rounded overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                      {selectedReport.productImage ? (
                        <img
                          src={selectedReport.productImage}
                          alt={selectedReport.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={18} className="text-neutral-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs uppercase">{selectedReport.productName}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-1">
                        {selectedReport.productColor && <span>Color: {selectedReport.productColor}</span>}
                        {selectedReport.productSize && (
                          <span className="px-1.5 py-0.2 bg-neutral-800 text-neutral-200 rounded font-bold">
                            Size: {selectedReport.productSize}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Defect Particulars & Statement */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
                  <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider">
                    CLAIM CATEGORY & STATEMENT
                  </span>
                  <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300 rounded text-[10px] font-bold">
                    {selectedReport.defectType}
                  </span>
                </div>

                <div className="bg-neutral-900/50 p-3.5 rounded border border-neutral-800/50 text-neutral-200 text-xs whitespace-pre-wrap leading-relaxed font-sans">
                  {selectedReport.description}
                </div>
              </div>

              {/* Photo Evidence */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={13} />
                    PHOTOGRAPHIC EVIDENCE ({selectedReport.images?.length || 0} / 5)
                  </span>
                  <span className="text-[10px] text-neutral-500">Click any image to expand</span>
                </div>

                {selectedReport.images && selectedReport.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {selectedReport.images.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImage(imgSrc)}
                        className="group relative aspect-square bg-neutral-950 border border-neutral-800 hover:border-snake-green rounded-lg overflow-hidden cursor-zoom-in transition-all"
                      >
                        <img
                          src={imgSrc}
                          alt={`Defect photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye size={18} className="text-white drop-shadow" />
                        </div>
                        <span className="absolute bottom-1 right-1 px-1 bg-black/70 text-[9px] text-white rounded font-mono">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-950 border border-neutral-800/80 rounded-lg text-center text-neutral-500 text-xs">
                    No photographic evidence attached to this claim.
                  </div>
                )}
              </div>

              {/* Video Evidence */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider flex items-center gap-1.5">
                  <Video size={13} />
                  UNBOXING VIDEO EVIDENCE
                </span>

                {selectedReport.videoUrl ? (
                  <div className="max-w-xl bg-black border border-neutral-800 rounded-lg overflow-hidden">
                    <video
                      controls
                      src={selectedReport.videoUrl}
                      className="w-full max-h-[360px] object-contain bg-black"
                    >
                      Your browser does not support HTML5 video playback.
                    </video>
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-950 border border-neutral-800/80 rounded-lg text-neutral-500 text-xs flex items-center gap-2">
                    <Video size={14} className="text-neutral-600" />
                    <span>No unboxing video was submitted with this claim.</span>
                  </div>
                )}
              </div>

              {/* Administrative Resolution & Triage Controls */}
              <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs uppercase text-white font-bold tracking-wider flex items-center gap-2">
                    <Sparkles size={14} className="text-snake-green" />
                    ADMINISTRATIVE DISPOSITION & NOTES
                  </span>
                  {saveSuccess && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-snake-green font-bold animate-fade-in">
                      <CheckCircle2 size={13} /> Changes saved successfully!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Selector */}
                  <div>
                    <label className="block text-[10px] uppercase text-neutral-400 font-bold tracking-wider mb-1.5">
                      WORKFLOW STATUS
                    </label>
                    <select
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value as DefectStatus)}
                      className="w-full bg-[#0d0d0d] border border-neutral-700 rounded px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-snake-green"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Choose disposition. Set to Approved when issuing replacement or refund.
                    </p>
                  </div>

                  {/* Quick Disposition Shortcuts */}
                  <div>
                    <label className="block text-[10px] uppercase text-neutral-400 font-bold tracking-wider mb-1.5">
                      QUICK ACTIONS
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStatus('Approved')}
                        className="px-2.5 py-1.5 bg-snake-green/10 border border-snake-green/40 hover:bg-snake-green hover:text-black rounded text-[10px] font-bold text-snake-green transition-colors"
                      >
                        APPROVE CLAIM
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStatus('Under Investigation')}
                        className="px-2.5 py-1.5 bg-sky-500/10 border border-sky-500/40 hover:bg-sky-500 hover:text-black rounded text-[10px] font-bold text-sky-400 transition-colors"
                      >
                        INVESTIGATING
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStatus('Rejected')}
                        className="px-2.5 py-1.5 bg-red-500/10 border border-red-500/40 hover:bg-red-500 hover:text-white rounded text-[10px] font-bold text-red-400 transition-colors"
                      >
                        REJECT
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStatus('Resolved')}
                        className="px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 rounded text-[10px] font-bold text-neutral-300 transition-colors"
                      >
                        RESOLVE
                      </button>
                    </div>
                  </div>
                </div>

                {/* Admin Internal Notes */}
                <div>
                  <label className="block text-[10px] uppercase text-neutral-400 font-bold tracking-wider mb-1.5">
                    INTERNAL AUDIT NOTES & REMEDY LOG
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter internal resolution notes (e.g., 'Replacement AWB #SF123 dispatched', 'Fabric defect confirmed by QC atelier', 'Razorpay Refund ID #rfnd_xyz issued')..."
                    className="w-full bg-[#0d0d0d] border border-neutral-800 rounded p-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-snake-green text-xs font-mono"
                  />
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white font-bold uppercase transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveStatus}
                    disabled={isSaving}
                    className="px-5 py-2 bg-white hover:bg-snake-green text-black font-bold uppercase rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Save Claim Updates</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Overlay */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 bg-neutral-900 border border-neutral-800 rounded-full text-white hover:bg-neutral-800"
          >
            <X size={20} />
          </button>
          <img
            src={lightboxImage}
            alt="Expanded defect evidence"
            className="max-w-full max-h-[90vh] object-contain rounded border border-neutral-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
