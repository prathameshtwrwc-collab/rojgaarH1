import { useState, useMemo, useEffect } from 'react';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { Inbox } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText, Eye, CheckCircle, XCircle, MapPin, Briefcase, ExternalLink,
  Download, Copy, AlertTriangle, Clock, IndianRupee, Check,
} from 'lucide-react';
import { Card, Button, Modal, Select, Toast } from '../../components/ui';
import { TableSkeleton } from '../../components/Skeleton';
import { AdminSearchInput } from '../../components/AdminToolbar';
import { useDatabase } from '../../context/DatabaseContext';
import { updateCvRequest } from '../../lib/supabase/data';
import { exportToCsv } from '../../lib/csvExport';

const STATUS_OPTIONS = ['All', 'pending', 'processing', 'delivered', 'cancelled'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highAmount', label: 'Highest Amount' },
  { value: 'lowAmount', label: 'Lowest Amount' },
];

const OVERDUE_HOURS = 4;

function statusMeta(status: string) {
  switch (status) {
    case 'delivered': return { label: 'Delivered', cls: 'dash-status--success' };
    case 'processing': return { label: 'Processing', cls: 'dash-status--warning' };
    case 'cancelled': return { label: 'Cancelled', cls: 'dash-status--danger' };
    default: return { label: 'Pending', cls: 'dash-status--neutral' };
  }
}

function hoursSince(dateStr?: string): number {
  if (!dateStr) return 0;
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
}

function gstBreakdown(baseAmount: number) {
  const base = Number(baseAmount) || 0;
  const gst = Math.round(base * 0.18);
  return { base, gst, total: base + gst };
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch { /* clipboard unavailable */ }
      }}
      title={`Copy ${label}`}
      className="inline-flex items-center justify-center w-5 h-5 rounded text-slate-400 hover:text-[var(--navy)] hover:bg-slate-100 transition-colors flex-shrink-0"
    >
      {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
    </button>
  );
}

function StatusTimeline({ status, createdAt, deliveredAt }: { status: string; createdAt?: string; deliveredAt?: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-[var(--green)] text-white flex items-center justify-center"><Check size={15} /></div>
          <span className="text-[10px] font-semibold text-[var(--navy)] mt-1 whitespace-nowrap">Requested</span>
        </div>
        <div className="flex-1 h-0.5 bg-red-200" />
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center"><XCircle size={16} /></div>
          <span className="text-[10px] font-semibold text-red-600 mt-1 whitespace-nowrap">Cancelled</span>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: 'Requested', date: createdAt, done: true },
    { key: 'processing', label: 'Processing', date: null, done: status === 'processing' || status === 'delivered' },
    { key: 'delivered', label: 'Delivered', date: deliveredAt, done: status === 'delivered' },
  ];

  return (
    <div className="flex items-center">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center flex-1 last:flex-initial">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              step.done ? 'bg-[var(--green)] text-white' : 'bg-[var(--bg-warm)] text-[var(--charcoal)] border border-[#E7E2D9]'
            }`}>
              {step.done ? <Check size={15} /> : i + 1}
            </div>
            <span className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${step.done ? 'text-[var(--navy)]' : 'text-[var(--charcoal)]'}`}>
              {step.label}
            </span>
            {step.date && <span className="text-[9px] text-slate-400">{new Date(step.date).toLocaleDateString('en-IN')}</span>}
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 -mt-5 ${steps[i + 1].done ? 'bg-[var(--green)]' : 'bg-[#E7E2D9]'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CvRequests() {
  const { cvRequests, employers, jobs, loading, refresh } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewingRequest, setViewingRequest] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const enrichedRequests = useMemo(() => {
    return cvRequests.map((req: any) => {
      const employer = employers.find((e: any) => e.id === req.employer_id);
      const job = jobs.find((j: any) => j.id === req.job_id);
      const { base, gst, total } = gstBreakdown(req.amount);
      return {
        ...req,
        employerName: employer?.company_name || 'Unknown',
        employerCity: employer?.city || '',
        jobTitle: job?.job_title || 'N/A',
        jobCity: job?.city || '',
        jobStatus: job?.status || 'N/A',
        baseAmount: base,
        gstAmount: gst,
        totalAmount: total,
        isOverdue: req.status === 'pending' && hoursSince(req.created_at) > OVERDUE_HOURS,
      };
    });
  }, [cvRequests, employers, jobs]);

  const filteredRequests = useMemo(() => {
    const result = enrichedRequests.filter((req: any) => {
      const matchesSearch = !searchTerm.trim() ||
        req.plan_label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.employerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.upi_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'highAmount') return b.totalAmount - a.totalAmount;
      if (sortBy === 'lowAmount') return a.totalAmount - b.totalAmount;
      return 0;
    });
  }, [enrichedRequests, searchTerm, statusFilter, sortBy]);

  const handleViewDetails = (req: any) => {
    setViewingRequest(req);
    setShowDetailModal(true);
  };

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const rid = searchParams.get('request');
    if (!rid) return;
    const target = enrichedRequests.find((r: any) => r.id === rid);
    if (target) handleViewDetails(target);
    const next = new URLSearchParams(searchParams);
    next.delete('request');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, enrichedRequests]);

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    setUpdatingStatus(requestId);
    try {
      const updates: Record<string, any> = { status: newStatus };
      if (newStatus === 'delivered') updates.delivered_at = new Date().toISOString();
      const updated = await updateCvRequest(requestId, updates);
      await refresh();
      setToast({ message: `Request marked as ${statusMeta(newStatus).label}.`, type: 'success' });
      if (viewingRequest?.id === requestId) {
        setViewingRequest((prev: any) => ({ ...prev, ...updated }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : (err as any)?.message || 'Failed to update status.';
      const hint = /row-level security|permission|policy/i.test(msg)
        ? ' Run supabase/cv-requests-admin-update.sql in the Supabase SQL Editor.'
        : /column .* does not exist/i.test(msg)
          ? ' Run supabase/cv-requests-admin-update.sql in the Supabase SQL Editor.'
          : '';
      setToast({ message: `Failed to update status: ${msg}.${hint}`, type: 'error' });
    } finally {
      setUpdatingStatus(null);
      setConfirmCancelId(null);
    }
  };

  const handleExport = () => {
    if (filteredRequests.length === 0) return;
    exportToCsv('cv-requests', filteredRequests.map((r: any) => ({
      'Request ID': r.id,
      'Employer': r.employerName,
      'City': r.employerCity,
      'Job': r.jobTitle,
      'Plan': r.plan_label,
      'CV Count': r.cv_count,
      'Base Amount': r.baseAmount,
      'GST (18%)': r.gstAmount,
      'Total Amount': r.totalAmount,
      'Payment Status': r.payment_status,
      'Transaction ID': r.upi_transaction_id,
      'Status': r.status,
      'Requested At': r.created_at,
      'Delivered At': r.delivered_at,
    })));
  };

  const stats = useMemo(() => {
    const revenue = cvRequests.reduce((sum: number, r: any) => sum + gstBreakdown(r.amount).total, 0);
    return {
      total: cvRequests.length,
      pending: cvRequests.filter((r: any) => r.status === 'pending').length,
      processing: cvRequests.filter((r: any) => r.status === 'processing').length,
      delivered: cvRequests.filter((r: any) => r.status === 'delivered').length,
      overdue: enrichedRequests.filter((r: any) => r.isOverdue).length,
      revenue,
    };
  }, [cvRequests, enrichedRequests]);

  const paging = usePagination(filteredRequests, 10);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy)]">CV Requests</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">Loading requests…</p>
        </div>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy)]">CV Requests</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">Review paid CV requests, confirm orders and track delivery.</p>
        </div>
        <button onClick={handleExport} disabled={filteredRequests.length === 0} className="dash-btn dash-btn-secondary dash-btn--compact disabled:opacity-50">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="dash-metrics">
        <div className="dash-metric">
          <div className="dash-metric__value">{stats.total}</div>
          <div className="dash-metric__label">Total Requests</div>
        </div>
        <div className="dash-metric">
          <div className="dash-metric__value dash-metric__value--accent">{stats.pending}</div>
          <div className="dash-metric__label">Pending</div>
          {stats.overdue > 0 && (
            <div className="dash-metric__trend" style={{ color: '#B91C1C' }}>{stats.overdue} overdue</div>
          )}
        </div>
        <div className="dash-metric">
          <div className="dash-metric__value">{stats.processing}</div>
          <div className="dash-metric__label">Processing</div>
        </div>
        <div className="dash-metric">
          <div className="dash-metric__value">{stats.delivered}</div>
          <div className="dash-metric__label">Delivered</div>
        </div>
        <div className="dash-metric">
          <div className="dash-metric__value">₹{stats.revenue.toLocaleString()}</div>
          <div className="dash-metric__label">Total Revenue (incl. GST)</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <AdminSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search plans, employers, jobs, transaction ID…"
          className="flex-1 min-w-[220px] sm:max-w-md"
        />
        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          options={STATUS_OPTIONS.map(s => ({ value: s, label: s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1) }))}
          className="h-10 w-auto"
        />
        <Select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          options={SORT_OPTIONS}
          className="h-10 w-auto"
        />
        <span className="text-xs text-[var(--charcoal)] font-medium whitespace-nowrap">
          Showing <strong className="text-[var(--navy)]">{filteredRequests.length}</strong> of {cvRequests.length}
        </span>
      </div>

      {filteredRequests.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText size={48} className="mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-bold text-[var(--navy)] mb-1">No CV Requests Found</h3>
          <p className="text-sm text-[var(--charcoal)]">
            {cvRequests.length === 0 ? 'No CV requests have been submitted yet.' : 'No requests match your current filters.'}
          </p>
        </Card>
      ) : (
        <div className="dash-surface overflow-hidden">
          <div className="admin-table overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-warm)] border-b border-[#E7E2D9]">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[var(--charcoal)] uppercase tracking-wider">Request</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[var(--charcoal)] uppercase tracking-wider">Employer</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[var(--charcoal)] uppercase tracking-wider">Plan</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[var(--charcoal)] uppercase tracking-wider">Job</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[var(--charcoal)] uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[var(--charcoal)] uppercase tracking-wider">Payment</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[var(--charcoal)] uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[var(--charcoal)] uppercase tracking-wider">Date</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold text-[var(--charcoal)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEAE1]">
                {paging.pageItems.map((req: any) => {
                  const st = statusMeta(req.status);
                  return (
                    <tr key={req.id} className="hover:bg-[var(--bg-warm)] transition-colors cursor-pointer" onClick={() => handleViewDetails(req)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-[var(--charcoal)]">#{req.id?.slice(0, 8)}</span>
                          <CopyButton value={req.id} label="Request ID" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="dash-avatar w-8 h-8 text-[11px] flex-shrink-0">{req.employerName.charAt(0)}</div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--navy)] truncate">{req.employerName}</p>
                            <p className="text-xs text-[var(--charcoal)] flex items-center gap-1 mt-0.5">
                              <MapPin size={10} /> {req.employerCity || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-[var(--navy)]">{req.plan_label}</p>
                          <p className="text-xs text-[var(--charcoal)]">{req.cv_count} CVs</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {req.job_id ? (
                          <Link
                            to={`/admin/jobs/${req.job_id}`}
                            onClick={e => e.stopPropagation()}
                            className="text-[var(--orange)] hover:underline flex items-center gap-1 max-w-[160px]"
                          >
                            <Briefcase size={12} className="flex-shrink-0" /> <span className="truncate">{req.jobTitle}</span>
                          </Link>
                        ) : (
                          <span className="text-[var(--charcoal)]">General Request</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-[var(--navy)]">₹{req.totalAmount.toLocaleString()}</p>
                        <p className="text-[10px] text-[var(--charcoal)]">₹{req.baseAmount.toLocaleString()} + 18% GST</p>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className={`dash-status ${req.payment_status === 'paid' ? 'dash-status--success' : 'dash-status--warning'}`}>
                            {req.payment_status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                          {req.upi_transaction_id && (
                            <div className="flex items-center gap-1 mt-1">
                              <p className="text-[10px] text-[var(--charcoal)] font-mono truncate max-w-[90px]">{req.upi_transaction_id}</p>
                              <CopyButton value={req.upi_transaction_id} label="Transaction ID" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`dash-status ${st.cls}`}>{st.label}</span>
                        {req.isOverdue && (
                          <span className="dash-status dash-status--danger mt-1" title={`Awaiting confirmation for over ${OVERDUE_HOURS}h`}>
                            <AlertTriangle size={10} /> Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-[var(--charcoal)]">
                          {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN') : 'N/A'}
                        </p>
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDetails(req)}
                            className="p-1.5 text-slate-500 hover:text-[var(--navy)] rounded-lg hover:bg-slate-100"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          {req.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'processing')}
                                disabled={updatingStatus === req.id}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50"
                                title="Mark as Processing"
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => setConfirmCancelId(req.id)}
                                disabled={updatingStatus === req.id}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                title="Cancel"
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                          {req.status === 'processing' && (
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'delivered')}
                              disabled={updatingStatus === req.id}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50"
                              title="Mark as Delivered"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
                {paging.total === 0 ? (
                  <EmptyState icon={<Inbox size={20} />} title="No requests to show" body="Nothing matches this view yet. Try clearing a filter or search." />
                ) : (
                  <Pagination page={paging.page} pageSize={paging.pageSize} total={paging.total} onPageChange={paging.setPage} label="requests" />
                )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="CV Request Details" size="lg">
        {viewingRequest && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--charcoal)] uppercase tracking-wider font-semibold">Request ID</span>
                <span className="text-sm font-mono text-[var(--navy)]">{viewingRequest.id}</span>
                <CopyButton value={viewingRequest.id} label="Request ID" />
              </div>
              <span className={`dash-status ${statusMeta(viewingRequest.status).cls}`}>{statusMeta(viewingRequest.status).label}</span>
            </div>

            <div className="dash-surface dash-surface--pad">
              <p className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider mb-3">Status Tracking</p>
              <StatusTimeline status={viewingRequest.status} createdAt={viewingRequest.created_at} deliveredAt={viewingRequest.delivered_at} />
              {viewingRequest.isOverdue && (
                <p className="mt-3 text-xs text-red-600 font-semibold flex items-center gap-1.5">
                  <AlertTriangle size={13} /> This request has been pending confirmation for over {OVERDUE_HOURS} hours.
                </p>
              )}
              {viewingRequest.notes && (
                <p className="mt-3 text-xs text-[var(--charcoal)]"><span className="font-semibold text-[var(--navy)]">Notes:</span> {viewingRequest.notes}</p>
              )}
            </div>

            <div className="dash-surface dash-surface--pad">
              <p className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider mb-3">Employer Information</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--charcoal)]">Company</p>
                  <p className="font-semibold text-[var(--navy)]">{viewingRequest.employerName}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--charcoal)]">Location</p>
                  <p className="font-semibold text-[var(--navy)] flex items-center gap-1"><MapPin size={12} /> {viewingRequest.employerCity || 'N/A'}</p>
                </div>
              </div>
            </div>

            {viewingRequest.job_id && (
              <div className="dash-surface dash-surface--pad">
                <p className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider mb-3">Job Post Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-xs text-[var(--charcoal)]">Job Title</p>
                    <p className="font-semibold text-[var(--navy)]">{viewingRequest.jobTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--charcoal)]">Job Status</p>
                    <span className={`dash-status ${viewingRequest.jobStatus === 'Open' ? 'dash-status--success' : 'dash-status--neutral'}`}>
                      {viewingRequest.jobStatus}
                    </span>
                  </div>
                </div>
                <Link to={`/admin/jobs/${viewingRequest.job_id}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-[var(--orange)] hover:underline font-semibold">
                  <ExternalLink size={12} /> View Job Post
                </Link>
              </div>
            )}

            <div className="dash-surface dash-surface--pad">
              <p className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider mb-3">Plan & Payment Breakdown</p>
              <div className="flex items-center justify-between text-sm mb-3">
                <div>
                  <p className="font-semibold text-[var(--navy)]">{viewingRequest.plan_label}</p>
                  <p className="text-xs text-[var(--charcoal)]">{viewingRequest.cv_count} verified candidate profiles</p>
                </div>
                <span className={`dash-status ${viewingRequest.payment_status === 'paid' ? 'dash-status--success' : 'dash-status--warning'}`}>
                  {viewingRequest.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>

              <div className="rounded-xl border border-[#E7E2D9] overflow-hidden text-sm">
                <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-warm)]">
                  <span className="text-[var(--charcoal)]">Base Amount</span>
                  <span className="font-semibold text-[var(--navy)]">₹{viewingRequest.baseAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#EFEAE1]">
                  <span className="text-[var(--charcoal)]">GST (18%)</span>
                  <span className="font-semibold text-[var(--navy)]">₹{viewingRequest.gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#EFEAE1] bg-[var(--orange)]/5">
                  <span className="font-bold text-[var(--navy)]">Total Paid</span>
                  <span className="font-extrabold text-[var(--orange)] text-lg flex items-center"><IndianRupee size={16} />{viewingRequest.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                <div className="col-span-2">
                  <p className="text-xs text-[var(--charcoal)]">UPI Transaction ID</p>
                  <div className="flex items-center gap-1.5">
                    <p className="font-mono text-sm text-[var(--navy)]">{viewingRequest.upi_transaction_id || 'N/A'}</p>
                    {viewingRequest.upi_transaction_id && <CopyButton value={viewingRequest.upi_transaction_id} label="Transaction ID" />}
                  </div>
                </div>
                {viewingRequest.paid_at && (
                  <div className="col-span-2 flex items-center gap-1.5 text-xs text-[var(--charcoal)]">
                    <Clock size={12} /> Paid {new Date(viewingRequest.paid_at).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            </div>

            {viewingRequest.status !== 'delivered' && viewingRequest.status !== 'cancelled' && (
              <div className="flex gap-2 pt-1">
                {viewingRequest.status === 'pending' && (
                  <>
                    <Button variant="primary" onClick={() => handleUpdateStatus(viewingRequest.id, 'processing')} disabled={updatingStatus === viewingRequest.id} className="flex-1 gap-1.5">
                      <CheckCircle size={14} /> Mark Processing
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmCancelId(viewingRequest.id)} disabled={updatingStatus === viewingRequest.id} className="flex-1 gap-1.5">
                      <XCircle size={14} /> Cancel
                    </Button>
                  </>
                )}
                {viewingRequest.status === 'processing' && (
                  <Button variant="primary" onClick={() => handleUpdateStatus(viewingRequest.id, 'delivered')} disabled={updatingStatus === viewingRequest.id} className="flex-1 gap-1.5">
                    <CheckCircle size={14} /> Mark Delivered
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={Boolean(confirmCancelId)} onClose={() => setConfirmCancelId(null)} title="Cancel CV Request?" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} />
            </div>
            <p className="text-sm text-[var(--charcoal)] leading-relaxed">
              This will mark the request as cancelled. The employer will no longer see it as active, and this action cannot be undone from here.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmCancelId(null)}>Go Back</Button>
            <Button
              variant="danger"
              onClick={() => confirmCancelId && handleUpdateStatus(confirmCancelId, 'cancelled')}
              disabled={Boolean(updatingStatus)}
            >
              {updatingStatus ? 'Cancelling...' : 'Yes, Cancel Request'}
            </Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
