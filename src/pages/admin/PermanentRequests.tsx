import { useMemo, useState } from 'react';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { Inbox, Trash2 } from 'lucide-react';
import {
  ShieldCheck, Eye, CheckCircle, XCircle, MapPin, Phone, Mail,
  Download, Copy, AlertTriangle, Clock, IndianRupee, Check, Users,
} from 'lucide-react';
import { Card, Button, Modal, Select, Toast } from '../../components/ui';
import { TableSkeleton } from '../../components/Skeleton';
import { AdminSearchInput } from '../../components/AdminToolbar';
import { useDatabase } from '../../context/DatabaseContext';
import { updatePermanentRequest, adminDeletePermanentRequest } from '../../lib/supabase/data';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { exportToCsv } from '../../lib/csvExport';

const STATUS_OPTIONS = ['All', 'pending', 'processing', 'delivered', 'cancelled'];
const TYPE_OPTIONS = ['All', 'unskilled', 'skilled'];
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

function typeMeta(type: string) {
  return type === 'skilled'
    ? { label: 'Skilled', cls: 'dash-status--accent' }
    : { label: 'Unskilled', cls: 'dash-status--neutral' };
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
    { key: 'processing', label: 'Sourcing', date: null, done: status === 'processing' || status === 'delivered' },
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

export default function PermanentRequests() {
  const { permanentRequests, employers, loading, refresh } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewingRequest, setViewingRequest] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const enrichedRequests = useMemo(() => {
    return permanentRequests.map((req: any) => {
      const employer = employers.find((e: any) => e.id === req.employer_id);
      const { base, gst, total } = gstBreakdown(req.amount);
      return {
        ...req,
        employerName: employer?.company_name || 'Unknown',
        employerCity: employer?.city || '',
        contactName: employer?.contact_name || '',
        contactEmail: employer?.contact_email || '',
        contactPhone: employer?.contact_phone || '',
        baseAmount: base,
        gstAmount: gst,
        totalAmount: total,
        isOverdue: req.status === 'pending' && hoursSince(req.created_at) > OVERDUE_HOURS,
      };
    });
  }, [permanentRequests, employers]);

  const filteredRequests = useMemo(() => {
    const result = enrichedRequests.filter((req: any) => {
      const matchesSearch = !searchTerm.trim() ||
        req.plan_label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.employerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.contactPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.upi_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      const matchesType = typeFilter === 'All' || req.candidate_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
    return result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'highAmount') return b.totalAmount - a.totalAmount;
      if (sortBy === 'lowAmount') return a.totalAmount - b.totalAmount;
      return 0;
    });
  }, [enrichedRequests, searchTerm, statusFilter, typeFilter, sortBy]);

  const handleViewDetails = (req: any) => {
    setViewingRequest(req);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    setUpdatingStatus(requestId);
    try {
      const updates: Record<string, any> = { status: newStatus };
      if (newStatus === 'delivered') updates.delivered_at = new Date().toISOString();
      const updated = await updatePermanentRequest(requestId, updates);
      await refresh();
      setToast({ message: `Request marked as ${statusMeta(newStatus).label}.`, type: 'success' });
      if (viewingRequest?.id === requestId) {
        setViewingRequest((prev: any) => ({ ...prev, ...updated }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : (err as any)?.message || 'Failed to update status.';
      const hint = /row-level security|permission|policy/i.test(msg)
        ? ' Run supabase/permanent-recruitment-requests.sql in the Supabase SQL Editor.'
        : /column .* does not exist/i.test(msg)
          ? ' Run supabase/permanent-recruitment-candidate-count.sql in the Supabase SQL Editor.'
          : '';
      setToast({ message: `Failed to update status: ${msg}.${hint}`, type: 'error' });
    } finally {
      setUpdatingStatus(null);
      setConfirmCancelId(null);
    }
  };

  const handleExport = () => {
    if (filteredRequests.length === 0) return;
    exportToCsv('permanent-recruitment-requests', filteredRequests.map((r: any) => ({
      'Request ID': r.id,
      'Employer': r.employerName,
      'City': r.employerCity,
      'Contact Name': r.contactName,
      'Contact Phone': r.contactPhone,
      'Contact Email': r.contactEmail,
      'Candidate Type': r.candidate_type,
      'Candidate Count': r.candidate_count,
      'Plan': r.plan_label,
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
    const revenue = permanentRequests.reduce((sum: number, r: any) => sum + gstBreakdown(r.amount).total, 0);
    const candidates = permanentRequests.reduce((sum: number, r: any) => sum + (Number(r.candidate_count) || 0), 0);
    return {
      total: permanentRequests.length,
      candidates,
      pending: permanentRequests.filter((r: any) => r.status === 'pending').length,
      processing: permanentRequests.filter((r: any) => r.status === 'processing').length,
      delivered: permanentRequests.filter((r: any) => r.status === 'delivered').length,
      overdue: enrichedRequests.filter((r: any) => r.isOverdue).length,
      revenue,
    };
  }, [permanentRequests, enrichedRequests]);

  const paging = usePagination(filteredRequests, 10);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy)]">Permanent Recruitment Requests</h2>
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
          <h2 className="text-2xl font-bold text-[var(--navy)]">Permanent Recruitment Requests</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">Review paid permanent-hiring requests, confirm orders and track delivery.</p>
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
          <div className="dash-metric__value">{stats.candidates}</div>
          <div className="dash-metric__label">Candidates Requested</div>
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
          <div className="dash-metric__label">Sourcing</div>
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
          placeholder="Search employers, contacts, transaction ID…"
          className="flex-1 min-w-[220px] sm:max-w-md"
        />
        <Select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          options={TYPE_OPTIONS.map(t => ({ value: t, label: t === 'All' ? 'All Types' : typeMeta(t).label }))}
          fullWidth={false} className="h-10 w-auto min-w-[150px]"
        />
        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          options={STATUS_OPTIONS.map(s => ({ value: s, label: s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1) }))}
          fullWidth={false} className="h-10 w-auto min-w-[150px]"
        />
        <Select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          options={SORT_OPTIONS}
          fullWidth={false} className="h-10 w-auto min-w-[150px]"
        />
        <span className="text-xs text-[var(--charcoal)] font-medium whitespace-nowrap">
          Showing <strong className="text-[var(--navy)]">{filteredRequests.length}</strong> of {permanentRequests.length}
        </span>
      </div>

      {filteredRequests.length === 0 ? (
        <Card className="p-12 text-center">
          <ShieldCheck size={48} className="mx-auto mb-3 text-slate-300" />
          <h3 className="text-lg font-bold text-[var(--navy)] mb-1">No Permanent Recruitment Requests Found</h3>
          <p className="text-sm text-[var(--charcoal)]">
            {permanentRequests.length === 0 ? 'No requests have been submitted yet.' : 'No requests match your current filters.'}
          </p>
        </Card>
      ) : (
        <div className="dash-surface overflow-hidden">
          <div className="admin-table overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-warm)] border-b border-[#E7E2D9]">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[var(--charcoal)] uppercase tracking-wider">Request</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[var(--charcoal)] uppercase tracking-wider">Employer &amp; Contact</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-[var(--charcoal)] uppercase tracking-wider">Candidates</th>
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
                  const tm = typeMeta(req.candidate_type);
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
                            {req.contactName && (
                              <p className="text-xs text-[var(--charcoal)] truncate">{req.contactName}</p>
                            )}
                            {req.contactPhone && (
                              <p className="text-xs text-[var(--charcoal)] flex items-center gap-1 mt-0.5">
                                <Phone size={10} /> {req.contactPhone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`dash-status ${tm.cls}`}>{tm.label}</span>
                        <p className="text-xs text-[var(--charcoal)] mt-1 flex items-center gap-1"><Users size={11} /> {req.candidate_count}</p>
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
                                title="Mark as Sourcing"
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
                          <button
                            onClick={() => setDeleteTarget(req)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete request"
                          >
                            <Trash2 size={14} />
                          </button>
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
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Permanent Recruitment Request Details" size="lg">
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
              <p className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider mb-3">Employer &amp; Contact Details</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--charcoal)]">Company</p>
                  <p className="font-semibold text-[var(--navy)]">{viewingRequest.employerName}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--charcoal)]">Location</p>
                  <p className="font-semibold text-[var(--navy)] flex items-center gap-1"><MapPin size={12} /> {viewingRequest.employerCity || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--charcoal)]">Contact Person</p>
                  <p className="font-semibold text-[var(--navy)]">{viewingRequest.contactName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--charcoal)]">Phone</p>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-[var(--navy)] flex items-center gap-1"><Phone size={12} /> {viewingRequest.contactPhone || 'N/A'}</p>
                    {viewingRequest.contactPhone && <CopyButton value={viewingRequest.contactPhone} label="Phone" />}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[var(--charcoal)]">Email</p>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-[var(--navy)] flex items-center gap-1 break-all"><Mail size={12} className="flex-shrink-0" /> {viewingRequest.contactEmail || 'N/A'}</p>
                    {viewingRequest.contactEmail && <CopyButton value={viewingRequest.contactEmail} label="Email" />}
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-surface dash-surface--pad">
              <p className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider mb-3">Plan &amp; Payment Breakdown</p>
              <div className="flex items-center justify-between text-sm mb-3">
                <div>
                  <p className="font-semibold text-[var(--navy)]">{viewingRequest.plan_label}</p>
                  <p className="text-xs text-[var(--charcoal)] flex items-center gap-1">
                    <span className={`dash-status ${typeMeta(viewingRequest.candidate_type).cls}`}>{typeMeta(viewingRequest.candidate_type).label}</span>
                    · {viewingRequest.candidate_count} candidate{viewingRequest.candidate_count > 1 ? 's' : ''}
                  </p>
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
                      <CheckCircle size={14} /> Mark Sourcing
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

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this request?"
        description="This permanently deletes the request and its payment record from the system. Use Cancel instead if you only want to stop it. This cannot be undone."
        confirmLabel="Delete request"
        onConfirm={async () => { await adminDeletePermanentRequest(deleteTarget.id); await refresh(); }}
      />

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={Boolean(confirmCancelId)} onClose={() => setConfirmCancelId(null)} title="Cancel This Request?" size="sm">
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
