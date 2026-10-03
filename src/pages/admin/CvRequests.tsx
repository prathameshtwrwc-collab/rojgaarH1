import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Eye, CheckCircle, XCircle, MapPin, Briefcase, ExternalLink } from 'lucide-react';
import { Card, Button, Modal, Input, Select } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';

const STATUS_OPTIONS = ['All', 'pending', 'processing', 'delivered', 'cancelled'];

export default function CvRequests() {
  const { cvRequests, employers, jobs, refresh } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewingRequest, setViewingRequest] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const enrichedRequests = useMemo(() => {
    return cvRequests.map((req: any) => {
      const employer = employers.find((e: any) => e.id === req.employer_id);
      const job = jobs.find((j: any) => j.id === req.job_id);
      return {
        ...req,
        employerName: employer?.company_name || 'Unknown',
        employerCity: employer?.city || '',
        jobTitle: job?.job_title || 'N/A',
        jobCity: job?.city || '',
        jobStatus: job?.status || 'N/A',
      };
    });
  }, [cvRequests, employers, jobs]);

  const filteredRequests = useMemo(() => {
    return enrichedRequests.filter((req: any) => {
      const matchesSearch = !searchTerm.trim() ||
        req.plan_label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.employerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.upi_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedRequests, searchTerm, statusFilter]);

  const handleViewDetails = (req: any) => {
    setViewingRequest(req);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    setUpdatingStatus(requestId);
    try {
      const { updateCvRequest } = await import('../../lib/supabase/data');
      await updateCvRequest(requestId, { status: newStatus });
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: cvRequests.length,
      pending: cvRequests.filter((r: any) => r.status === 'pending').length,
      processing: cvRequests.filter((r: any) => r.status === 'processing').length,
      delivered: cvRequests.filter((r: any) => r.status === 'delivered').length,
      totalAmount: cvRequests.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0),
    };
  }, [cvRequests]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy)]">CV Requests</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">
            {stats.total} total · {stats.pending} pending · {stats.processing} processing · {stats.delivered} delivered
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--charcoal)]" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search plans, employers, jobs..."
              className="pl-9 h-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={STATUS_OPTIONS.map(s => ({ value: s, label: s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1) }))}
            className="h-10"
          />
        </div>
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
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-[var(--charcoal)] uppercase tracking-wider">Request ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[var(--charcoal)] uppercase tracking-wider">Employer</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[var(--charcoal)] uppercase tracking-wider">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[var(--charcoal)] uppercase tracking-wider">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[var(--charcoal)] uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[var(--charcoal)] uppercase tracking-wider">Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[var(--charcoal)] uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[var(--charcoal)] uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[var(--charcoal)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[var(--charcoal)]">#{req.id?.slice(0, 8)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-[var(--navy)]">{req.employerName}</p>
                        <p className="text-xs text-[var(--charcoal)] flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {req.employerCity || 'N/A'}
                        </p>
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
                        <Link to={`/admin/jobs/${req.job_id}`} className="text-[var(--orange)] hover:underline flex items-center gap-1">
                          <Briefcase size={12} /> {req.jobTitle?.slice(0, 25)}...
                        </Link>
                      ) : (
                        <span className="text-[var(--charcoal)]">General Request</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[var(--navy)]">₹{Number(req.amount).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${req.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {req.payment_status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                        {req.upi_transaction_id && (
                          <p className="text-[10px] text-[var(--charcoal)] mt-1 font-mono">{req.upi_transaction_id}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${req.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : req.status === 'processing' ? 'bg-amber-100 text-amber-700' : req.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                        {req.status?.charAt(0).toUpperCase() + req.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-[var(--charcoal)]">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN') : 'N/A'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
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
                              onClick={() => handleUpdateStatus(req.id, 'cancelled')}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="CV Request Details" size="lg">
        {viewingRequest && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--charcoal)] uppercase tracking-wider font-semibold mb-1">Request ID</p>
                <p className="text-sm font-mono text-[var(--navy)]">{viewingRequest.id}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--charcoal)] uppercase tracking-wider font-semibold mb-1">Requested On</p>
                <p className="text-sm text-[var(--navy)]">{new Date(viewingRequest.created_at).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="bg-[var(--bg-warm)] rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider">Employer Information</p>
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
              <div className="bg-[var(--bg-warm)] rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider">Job Post Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-[var(--charcoal)]">Job Title</p>
                    <p className="font-semibold text-[var(--navy)]">{viewingRequest.jobTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--charcoal)]">Job Status</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${viewingRequest.jobStatus === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {viewingRequest.jobStatus}
                    </span>
                  </div>
                </div>
                <Link to={`/admin/jobs/${viewingRequest.job_id}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-[var(--orange)] hover:underline">
                  <ExternalLink size={12} /> View Job Post
                </Link>
              </div>
            )}

            <div className="bg-[var(--bg-warm)] rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider">Plan & Payment Details</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--charcoal)]">Plan</p>
                  <p className="font-semibold text-[var(--navy)]">{viewingRequest.plan_label}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--charcoal)]">CV Count</p>
                  <p className="font-semibold text-[var(--navy)]">{viewingRequest.cv_count}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--charcoal)]">Base Amount</p>
                  <p className="font-semibold text-[var(--navy)]">₹{Number(viewingRequest.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--charcoal)]">GST (18%)</p>
                  <p className="font-semibold text-[var(--navy)]">₹{(Number(viewingRequest.amount) * 0.18).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--charcoal)]">Total Paid</p>
                  <p className="font-bold text-[var(--orange)] text-lg">₹{(Number(viewingRequest.amount) * 1.18).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--charcoal)]">Payment Status</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${viewingRequest.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {viewingRequest.payment_status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[var(--charcoal)]">UPI Transaction ID</p>
                  <p className="font-mono text-sm text-[var(--navy)]">{viewingRequest.upi_transaction_id || 'N/A'}</p>
                </div>
                {viewingRequest.paid_at && (
                  <div className="col-span-2">
                    <p className="text-xs text-[var(--charcoal)]">Paid At</p>
                    <p className="text-sm text-[var(--navy)]">{new Date(viewingRequest.paid_at).toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[var(--bg-warm)] rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider">Status Tracking</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--charcoal)]">Current Status:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${viewingRequest.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : viewingRequest.status === 'processing' ? 'bg-amber-100 text-amber-700' : viewingRequest.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                  {viewingRequest.status?.charAt(0).toUpperCase() + viewingRequest.status?.slice(1)}
                </span>
              </div>
              {viewingRequest.notes && (
                <div>
                  <p className="text-xs text-[var(--charcoal)]">Notes</p>
                  <p className="text-sm text-[var(--navy)]">{viewingRequest.notes}</p>
                </div>
              )}
              {viewingRequest.delivered_at && (
                <div>
                  <p className="text-xs text-[var(--charcoal)]">Delivered At</p>
                  <p className="text-sm text-[var(--navy)]">{new Date(viewingRequest.delivered_at).toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>

            {viewingRequest.status !== 'delivered' && viewingRequest.status !== 'cancelled' && (
              <div className="flex gap-2 pt-1">
                {viewingRequest.status === 'pending' && (
                  <>
                    <Button variant="primary" onClick={() => handleUpdateStatus(viewingRequest.id, 'processing')} disabled={updatingStatus === viewingRequest.id} className="flex-1">
                      <CheckCircle size={14} className="mr-1" /> Mark Processing
                    </Button>
                    <Button variant="ghost" onClick={() => handleUpdateStatus(viewingRequest.id, 'cancelled')} disabled={updatingStatus === viewingRequest.id} className="flex-1">
                      <XCircle size={14} className="mr-1" /> Cancel
                    </Button>
                  </>
                )}
                {viewingRequest.status === 'processing' && (
                  <Button variant="primary" onClick={() => handleUpdateStatus(viewingRequest.id, 'delivered')} disabled={updatingStatus === viewingRequest.id} className="flex-1">
                    <CheckCircle size={14} className="mr-1" /> Mark Delivered
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
