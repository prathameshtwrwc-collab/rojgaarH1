import { useEffect, useState } from 'react';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { Inbox } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { Briefcase, MapPin, IndianRupee, Search, Download, Building2, Users, X, Phone, Send } from 'lucide-react';
import { Card, Badge, Select, Button, Toast } from '../../components/ui';
import SendCvsModal from '../../components/SendCvsModal';
import SentCvsList from '../../components/SentCvsList';
import { useAuth } from '../../context/AuthContext';
import { BackLink, DetailSkeleton, DetailProblem, fmtDate, payText } from '../../components/AdminDetailBits';
import { useDatabase } from '../../context/DatabaseContext';
import { getApplicationsForJob } from '../../lib/supabase/data';
import { exportToCsv } from '../../lib/csvExport';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
  applied: 'info', screening: 'warning', shortlisted: 'info', interview_scheduled: 'default',
  interviewed: 'default', selected: 'success', rejected: 'danger', withdrawn: 'default', joined: 'success',
};

const statusLabel = (s: string) => (s || 'applied').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export default function JobPostDetail() {
  const { id } = useParams<{ id: string }>();
  const { jobs, employers, candidates, jobSkills, cvSubmissions, cvRequests, loading: dbLoading, refresh } = useDatabase();
  const { user } = useAuth();
  const [showSendCvs, setShowSendCvs] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const job = jobs.find((j: any) => j.id === id);
  const employer = job ? employers.find((e: any) => e.id === job.employer_id) : null;
  const candidatesMap = new Map(candidates.map((c: any) => [c.id, c]));

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setLoadFailed(false);
    getApplicationsForJob(id)
      .then(apps => { if (!cancelled) setApplications(apps || []); })
      .catch(() => { if (!cancelled) setLoadFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const applicants = applications
    .map((a: any) => ({ ...a, candidate: candidatesMap.get(a.candidate_id) }))
    .filter((a: any) => a.candidate);

  const filtered = applicants.filter((a: any) => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      (a.candidate.profile_name || '').toLowerCase().includes(q) ||
      (a.candidate.profile_phone || '').replace(/\D/g, '').includes(q.replace(/\D/g, '') || '\u0000');
    return matchStatus && matchSearch;
  });

  // Hooks must run on every render, so paging sits above the early returns below
  const paging = usePagination(filtered, 10);
  const statusCounts = applicants.reduce<Record<string, number>>((acc, a: any) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

  const handleExportCsv = () => {
    exportToCsv(`applicants-${job?.job_title || 'job'}`, filtered.map((a: any) => ({
      'Candidate Name': a.candidate.profile_name || 'Unnamed',
      Phone: a.candidate.profile_phone || '',
      Location: a.candidate.location || a.candidate.city || '',
      State: a.candidate.state || '',
      Qualification: a.candidate.qualification || '',
      Skills: a.candidate.skills || [],
      'Experience (yrs)': a.candidate.total_experience_years ?? '',
      'Expected Salary': a.candidate.expected_salary_min ?? '',
      'Application Status': statusLabel(a.status),
      'Applied On': a.applied_at ? a.applied_at.split('T')[0] : '',
      'Candidate ID': a.candidate_id,
    })));
  };

  if (!job) {
    if (dbLoading) return <DetailSkeleton />;
    return <DetailProblem title="Job not found" body="It may have been deleted, or the link is wrong." backTo="/admin/jobs" backLabel="Back to Job Postings" />;
  }

  return (
    <div className="space-y-6">
      <BackLink to="/admin/jobs">Back to Job Postings</BackLink>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--orange)]/10 text-[var(--orange)] flex items-center justify-center flex-shrink-0">
              <Briefcase size={26} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--navy)] break-words">{job.job_title}</h1>
              {employer ? (
                <Link to={`/employer/${employer.id}`} className="text-sm text-[var(--charcoal)] hover:text-[var(--orange)] inline-flex items-center gap-1 mt-1">
                  <Building2 size={14} /> {employer.company_name || 'Unnamed company'}
                </Link>
              ) : (
                <p className="text-sm text-[var(--charcoal)] flex items-center gap-1 mt-1"><Building2 size={14} /> Unknown employer</p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--charcoal)] mt-2">
                {(job.city || job.state) && <span className="flex items-center gap-1"><MapPin size={12} /> {[job.city, job.state].filter(Boolean).join(', ')}</span>}
                <span className="flex items-center gap-1"><IndianRupee size={12} /> {payText(job.salary_min, job.salary_max).replace(/^₹/, '')}</span>
                {job.employment_type && <span>{job.employment_type}</span>}
                {job.created_at && <span>Posted {fmtDate(job.created_at)}</span>}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {(jobSkills[job.id] || []).map((s: string) => <Badge key={s} variant="info" className="text-[10px]">{s}</Badge>)}
              </div>
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
            <Badge variant={job.status === 'Open' ? 'success' : job.status === 'Pending' ? 'warning' : 'default'}>{job.status}</Badge>
            <Button size="sm" onClick={() => setShowSendCvs(true)} disabled={!employer} className="gap-1.5">
              <Send size={14} /> Send CVs to employer
            </Button>
          </div>
        </div>
      </Card>

      {/* CVs hand-picked by the team, with the employer's answers */}
      {(() => {
        const sent = cvSubmissions.filter(s => s.job_id === job.id);
        const openRequest = cvRequests.find((r: any) => r.job_id === job.id && r.status !== 'cancelled' && r.status !== 'delivered');
        return (
          <Card>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-bold text-[var(--navy)] flex items-center gap-2">
                  <Send size={17} className="text-[var(--orange)]" /> Sent to employer <span className="text-[var(--charcoal)] font-semibold tabular-nums">({sent.length})</span>
                </h3>
                {openRequest && (
                  <p className="text-xs text-amber-700 font-semibold mt-1">
                    Paid request open: {openRequest.plan_label}, {cvSubmissions.filter(s => s.cv_request_id === openRequest.id).length} of {openRequest.cv_count} sent
                  </p>
                )}
              </div>
              {sent.length > 0 && (
                <button type="button" onClick={() => setShowSendCvs(true)} className="text-xs font-bold text-[var(--orange)] hover:underline flex-shrink-0">Send more</button>
              )}
            </div>
            <SentCvsList submissions={sent} onChanged={() => refresh({ silent: true })} onToast={setToast} />
          </Card>
        );
      })()}

      <Card padding={false}>
        <div className="p-4 border-b border-slate-200 bg-[var(--bg-warm)]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-[var(--navy)] flex items-center gap-2">
            <Users size={18} className="text-[var(--orange)]" /> Applicants <span className="tabular-nums text-[var(--charcoal)] font-semibold">({filtered.length}{filtered.length !== applicants.length ? ` of ${applicants.length}` : ''})</span>
          </h3>
          <div className="grid grid-cols-[1fr_auto] sm:flex items-center gap-2 sm:flex-wrap">
            <div className="relative col-span-2 sm:col-span-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--charcoal)] pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name or phone"
                aria-label="Search applicants"
                className="w-full h-10 pl-9 pr-9 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-[var(--orange)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
                  <X size={14} />
                </button>
              )}
            </div>
            <Select
              options={[
                { value: 'All', label: `All statuses (${applicants.length})` },
                ...['applied', 'screening', 'shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'rejected', 'joined'].map(s => ({
                  value: s,
                  label: `${statusLabel(s)}${statusCounts[s] ? ` (${statusCounts[s]})` : ''}`,
                })),
              ]}
              aria-label="Filter by status"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            />
            <button type="button" onClick={handleExportCsv} disabled={filtered.length === 0} className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-[var(--navy)] hover:bg-slate-50 transition-colors disabled:opacity-50">
              <Download size={15} /> CSV
            </button>
          </div>
        </div>

        <div className="admin-table overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-[var(--bg-warm)]">
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Candidate</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Location</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Experience</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Applied On</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {paging.pageItems.map((a: any) => (
                <tr key={a.id} className="border-b border-slate-100/60 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-[var(--navy)]">{a.candidate.profile_name || 'Unnamed'}</p>
                    {a.candidate.profile_phone && (
                      <a href={`tel:${a.candidate.profile_phone}`} className="text-xs text-[var(--charcoal)] hover:text-[var(--orange)] inline-flex items-center gap-1">
                        <Phone size={10} /> {a.candidate.profile_phone}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden sm:table-cell">{a.candidate.location || a.candidate.city || '—'}</td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden md:table-cell">{Number(a.candidate.total_experience_years) > 0 ? `${a.candidate.total_experience_years} yrs` : 'Fresher'}</td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)] whitespace-nowrap">{fmtDate(a.applied_at) || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[a.status] || 'default'}>{statusLabel(a.status)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
                {loading ? (
                  <div className="p-6 space-y-3" role="status" aria-label="Loading applicants">{[0, 1, 2].map(i => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}</div>
                ) : paging.total === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon={<Inbox size={20} />}
                      title={loadFailed ? 'Could not load applicants' : applicants.length === 0 ? 'No applications yet' : 'No applicants match'}
                      body={loadFailed ? 'Check your connection and reload the page.' : applicants.length === 0 ? 'Applicants appear here as soon as candidates apply.' : 'Try a different search or status.'}
                    />
                  </div>
                ) : (
                  <Pagination page={paging.page} pageSize={paging.pageSize} total={paging.total} onPageChange={paging.setPage} label="applications" />
                )}
        </div>
      </Card>

      <SendCvsModal
        isOpen={showSendCvs}
        onClose={() => setShowSendCvs(false)}
        job={job}
        employer={employer}
        candidates={candidates}
        jobSkills={jobSkills[job.id] || []}
        submissions={cvSubmissions}
        // An open paid request for this job is fulfilled by what you send here
        cvRequest={cvRequests.find((r: any) => r.job_id === job.id && r.status !== 'cancelled' && r.status !== 'delivered') || null}
        adminId={user?.id || null}
        onSent={() => refresh({ silent: true })}
      />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
