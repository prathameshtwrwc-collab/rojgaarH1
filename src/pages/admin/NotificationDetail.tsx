import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, CreditCard, FileText, MapPin, ExternalLink, IndianRupee, Calendar, Building2 } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { useAdminNotifications } from '../../lib/adminNotifications';
import { Button } from '../../components/ui';

function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <div className={`text-sm text-[var(--navy)] font-semibold break-words ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</div>
    </div>
  );
}

export default function NotificationDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const { jobs, employers, cvRequests, loading } = useDatabase();
  const { user } = useAuth();

  const source = useMemo(() => ({ jobs, employers, cvRequests }), [jobs, employers, cvRequests]);
  const { items, markRead } = useAdminNotifications(user?.id, source);
  const notification = items.find(n => n.id === id);

  useEffect(() => {
    if (notification) markRead(notification.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification?.id]);

  if (loading) return <div className="dash-surface p-10 text-center text-sm text-[var(--charcoal)]">Loading…</div>;

  if (!notification) {
    return (
      <div className="dash-surface p-12 text-center space-y-3">
        <h3 className="text-lg font-bold text-[var(--navy)]">Notification not found</h3>
        <p className="text-sm text-[var(--charcoal)]">It may be older than 30 days or the record was removed.</p>
        <Link to="/admin/notifications"><Button variant="outline">Back to notifications</Button></Link>
      </div>
    );
  }

  const employerName = (empId: string) => employers.find((e: any) => e.id === empId)?.company_name || 'Unknown employer';

  const back = (
    <Link to="/admin/notifications" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--charcoal)] hover:text-[var(--orange)]">
      <ArrowLeft size={15} /> All notifications
    </Link>
  );

  if (notification.kind === 'cv') {
    const req: any = cvRequests.find((r: any) => r.id === notification.refId);
    if (!req) return <div className="space-y-4">{back}<div className="dash-surface p-10 text-center text-sm">This CV request no longer exists.</div></div>;
    const base = Number(req.amount || 0);
    const gst = Math.round(base * 0.18);
    return (
      <div className="space-y-6">
        {back}
        <div className="dash-surface dash-surface--pad space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--orange)] flex items-center gap-1.5"><FileText size={13} /> CV Request</p>
              <h2 className="text-xl font-bold text-[var(--navy)] mt-1 break-words">{req.plan_label}</h2>
              <p className="text-sm text-[var(--charcoal)] mt-0.5">{employerName(req.employer_id)}</p>
            </div>
            <span className={`dash-status ${req.status === 'delivered' ? 'dash-status--success' : req.status === 'cancelled' ? 'dash-status--danger' : req.status === 'processing' ? 'dash-status--warning' : 'dash-status--neutral'}`}>{req.status}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="CV count" value={`${req.cv_count} verified profiles`} />
            <Field label="Requested on" value={new Date(req.created_at).toLocaleString('en-IN')} />
            <Field label="Transaction ID" value={req.upi_transaction_id} mono />
            <Field label="Payment" value={req.payment_status} />
          </div>
          <div className="rounded-xl border border-[#E7E2D9] overflow-hidden text-sm">
            <div className="flex justify-between px-4 py-2.5 bg-[var(--bg-warm)]"><span className="text-[var(--charcoal)]">Base amount</span><span className="font-semibold">₹{base.toLocaleString()}</span></div>
            <div className="flex justify-between px-4 py-2.5 border-t border-[#EFEAE1]"><span className="text-[var(--charcoal)]">GST (18%)</span><span className="font-semibold">₹{gst.toLocaleString()}</span></div>
            <div className="flex justify-between px-4 py-3 border-t border-[#EFEAE1] bg-[var(--orange)]/5"><span className="font-bold">Total</span><span className="font-extrabold text-[var(--orange)] flex items-center"><IndianRupee size={14} />{(base + gst).toLocaleString()}</span></div>
          </div>
          <Link to={`/admin/cv-requests?request=${req.id}`}>
            <Button className="gap-1.5"><ExternalLink size={14} /> Open in CV Requests</Button>
          </Link>
        </div>
      </div>
    );
  }

  const job: any = jobs.find((j: any) => j.id === notification.refId);
  if (!job) return <div className="space-y-4">{back}<div className="dash-surface p-10 text-center text-sm">This job no longer exists.</div></div>;

  const isPayment = notification.kind === 'payment';
  return (
    <div className="space-y-6">
      {back}
      <div className="dash-surface dash-surface--pad space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isPayment ? 'text-amber-600' : 'text-[var(--orange)]'}`}>
              {isPayment ? <CreditCard size={13} /> : <Briefcase size={13} />} {isPayment ? 'Payment submitted' : 'New job posted'}
            </p>
            <h2 className="text-xl font-bold text-[var(--navy)] mt-1 break-words">{job.job_title}</h2>
            <p className="text-sm text-[var(--charcoal)] mt-0.5 flex items-center gap-1.5 break-words"><Building2 size={13} /> {employerName(job.employer_id)}</p>
          </div>
          <span className="dash-status dash-status--neutral">{job.status}</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Location" value={<span className="flex items-center gap-1 min-w-0"><MapPin size={13} /> {[job.city, job.state].filter(Boolean).join(', ')}</span>} />
          <Field label="Employment type" value={job.employment_type} />
          <Field label="Salary (₹/month)" value={`${Number(job.salary_min || 0).toLocaleString()} – ${Number(job.salary_max || 0).toLocaleString()}`} />
          <Field label="Openings" value={job.number_of_openings} />
          <Field label="Experience" value={`${job.experience_min_years ?? 0}–${job.experience_max_years ?? 0} years`} />
          <Field label="Qualification" value={job.qualification_required} />
          <Field label="Posted on" value={<span className="flex items-center gap-1"><Calendar size={13} /> {new Date(job.created_at).toLocaleString('en-IN')}</span>} />
          <Field label="Payment status" value={job.payment_status || 'none'} />
          {isPayment && <Field label="Transaction / reference" value={job.payment_reference || job.upi_transaction_id || job.id} mono />}
          {job.recruiter_name && <Field label="Recruiter contact" value={`${job.recruiter_name}${job.recruiter_phone ? ' · ' + job.recruiter_phone : ''}`} />}
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</p>
          <p className="text-sm text-[var(--charcoal)] leading-relaxed whitespace-pre-line break-words">{job.job_description || '—'}</p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Link to={`/admin/jobs/${job.id}`}><Button className="gap-1.5"><ExternalLink size={14} /> Open job post</Button></Link>
          <Link to="/admin/jobs"><Button variant="outline">Go to Jobs</Button></Link>
        </div>
      </div>
    </div>
  );
}
