import { useEffect, useMemo, useState } from 'react';
import { Search, X, FileText, MapPin, Briefcase, Check, Send, Mail, ShieldCheck, Sparkles, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Modal, Button, Toggle } from './ui';
import { computeMatch } from '../lib/matching';
import { getApplicationsForJob, updateCvRequest } from '../lib/supabase/data';
import { sendCvSubmissions, type CvSubmission } from '../lib/supabase/cvSubmissions';
import { haptic } from '../lib/haptics';

// Admin flow for hand-picking candidates and sending their CVs to an employer.
//   Step 1 "Pick": candidates ranked by fit for the job, with search and quick filters.
//   Step 2 "Review": a note per candidate (pre-filled with why they fit), a covering message,
//                    and whether to share phone numbers.
//   Step 3 "Sent": confirmation, plus a ready-made email to the employer.
// When opened for a paid CV request, it tracks how many CVs are still owed and moves the
// request to Processing, then Delivered once the full count has been sent.

type Step = 'pick' | 'review' | 'done';
type QuickFilter = 'resume' | 'strong' | 'applied' | 'local';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** The job the CVs are for. Optional only for a general (job-less) CV request. */
  job: any | null;
  employer: any | null;
  candidates: any[];
  jobSkills?: string[];
  /** Everything already sent, so nobody is sent twice */
  submissions: CvSubmission[];
  /** When fulfilling a paid CV request */
  cvRequest?: any | null;
  adminId: string | null;
  onSent: (sent: CvSubmission[]) => Promise<void> | void;
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
const scoreTone = (s: number) => (s >= 70 ? 'text-[var(--green)] bg-[var(--green)]/10' : s >= 45 ? 'text-[var(--orange)] bg-[var(--orange)]/10' : 'text-slate-500 bg-slate-100');

export default function SendCvsModal({ isOpen, onClose, job, employer, candidates, jobSkills = [], submissions, cvRequest, adminId, onSent }: Props) {
  const [step, setStep] = useState<Step>('pick');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Set<QuickFilter>>(new Set(['resume']));
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [shareContact, setShareContact] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sentRows, setSentRows] = useState<CvSubmission[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  // Request progress as it stood right after sending (the list refreshes underneath us)
  const [doneInfo, setDoneInfo] = useState<{ total: number; delivered: boolean } | null>(null);

  // Fresh start every time it opens
  useEffect(() => {
    if (!isOpen) return;
    setStep('pick');
    setQuery('');
    setFilters(new Set(['resume']));
    setSelected([]);
    setNotes({});
    setMessage('');
    setShareContact(true);
    setError('');
    setSentRows([]);
    setDoneInfo(null);
  }, [isOpen]);

  // Who already applied to this job: worth knowing, and a good signal of interest
  useEffect(() => {
    if (!isOpen || !job?.id) { setAppliedIds(new Set()); return; }
    let off = false;
    getApplicationsForJob(job.id)
      .then(apps => { if (!off) setAppliedIds(new Set((apps || []).map((a: any) => a.candidate_id))); })
      .catch(() => {});
    return () => { off = true; };
  }, [isOpen, job?.id]);

  const alreadySent = useMemo(() => {
    const map = new Map<string, CvSubmission>();
    submissions
      .filter(s => s.employer_id === employer?.id && (s.job_id || null) === (job?.id || null))
      .forEach(s => map.set(s.candidate_id, s));
    return map;
  }, [submissions, employer?.id, job?.id]);

  // CVs still owed on a paid request
  const sentForRequest = cvRequest ? submissions.filter(s => s.cv_request_id === cvRequest.id).length : 0;
  const owed = cvRequest ? Math.max(0, Number(cvRequest.cv_count || 0) - sentForRequest) : null;

  const ranked = useMemo(() => {
    const jobForMatch = job ? { ...job, skills_required: jobSkills.length ? jobSkills : job.skills_required || [] } : null;
    return candidates
      .filter(c => c.status !== 'Inactive')
      .map(c => {
        const breakdown = jobForMatch ? computeMatch(c, jobForMatch) : null;
        return { c, breakdown, score: breakdown ? breakdown.score : null };
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || String(b.c.created_at || '').localeCompare(String(a.c.created_at || '')));
  }, [candidates, job, jobSkills]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ranked.filter(({ c, score }) => {
      if (filters.has('resume') && !c.resume_url) return false;
      if (filters.has('strong') && (score ?? 0) < 70) return false;
      if (filters.has('applied') && !appliedIds.has(c.id)) return false;
      if (filters.has('local') && job?.city && (c.city || c.location || '').toLowerCase().trim() !== String(job.city).toLowerCase().trim()) return false;
      if (q) {
        const hay = [c.profile_name, c.profile_phone, c.city, c.location, c.qualification, ...(c.skills || [])].join(' ').toLowerCase();
        if (!q.split(/\s+/).every(w => hay.includes(w))) return false;
      }
      return true;
    });
  }, [ranked, filters, query, appliedIds, job?.city]);

  const byId = useMemo(() => new Map(ranked.map(r => [r.c.id, r])), [ranked]);

  const toggleFilter = (f: QuickFilter) => {
    haptic('select');
    setFilters(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f); else next.add(f);
      return next;
    });
  };

  const toggle = (id: string) => {
    if (alreadySent.has(id)) return;
    haptic('select');
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const goReview = () => {
    // Pre-fill each note with the matcher's reasons, so the admin only has to adjust it
    setNotes(prev => {
      const next = { ...prev };
      selected.forEach(id => {
        if (next[id] !== undefined) return;
        const r = byId.get(id);
        const reasons = r?.breakdown?.reasons?.slice(0, 3) || [];
        next[id] = reasons.join('. ') + (reasons.length ? '.' : '');
      });
      return next;
    });
    setStep('review');
  };

  const send = async () => {
    if (!employer || selected.length === 0) return;
    setSending(true);
    setError('');
    try {
      const rows = await sendCvSubmissions({
        employerId: employer.id,
        jobId: job?.id || null,
        cvRequestId: cvRequest?.id || null,
        sentBy: adminId,
        message: message.trim() || null,
        shareContact,
        candidates: selected.map(id => {
          const r = byId.get(id)!;
          return {
            candidate_id: id,
            candidate_name: r.c.profile_name || 'Candidate',
            candidate_phone: r.c.profile_phone || null,
            resume_url: r.c.resume_url || null,
            match_score: r.score,
            admin_note: (notes[id] || '').trim() || null,
          };
        }),
      });
      // Keep the paid request's status in step with what has been sent
      if (cvRequest && cvRequest.status !== 'cancelled') {
        const total = sentForRequest + rows.length;
        const done = total >= Number(cvRequest.cv_count || 0);
        setDoneInfo({ total, delivered: done });
        try {
          await updateCvRequest(cvRequest.id, done
            ? { status: 'delivered', delivered_at: new Date().toISOString() }
            : { status: 'processing' });
        } catch { /* the CVs are sent; the status can still be changed by hand */ }
      }
      haptic('success');
      setSentRows(rows);
      setStep('done');
      await onSent(rows);
    } catch (err) {
      haptic('error');
      setError((err as { message?: string })?.message || 'Could not send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const dashboardUrl = `${window.location.origin}/dashboard/employer`;
  const mailto = useMemo(() => {
    if (!employer?.contact_email) return '';
    const lines = sentRows.map((r, i) => `${i + 1}. ${r.candidate_name}${r.match_score != null ? ` (${r.match_score}% match)` : ''}${r.admin_note ? ` - ${r.admin_note}` : ''}`);
    const subject = `${sentRows.length} shortlisted ${sentRows.length === 1 ? 'CV' : 'CVs'}${job ? ` for ${job.job_title}` : ''} - Rojgaar Hai`;
    const body = [
      `Dear ${employer.contact_name || employer.company_name || 'Hiring team'},`,
      '',
      `We have shortlisted ${sentRows.length} ${sentRows.length === 1 ? 'candidate' : 'candidates'}${job ? ` for your ${job.job_title} opening` : ''}:`,
      '',
      ...lines,
      '',
      message.trim() ? `${message.trim()}\n` : '',
      `Open their resumes and tell us who you would like to meet: ${dashboardUrl}`,
      '',
      'Regards,',
      'Team Rojgaar Hai',
    ].join('\n');
    return `mailto:${employer.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [sentRows, employer, job, message, dashboardUrl]);

  const title = step === 'done' ? 'CVs sent' : step === 'review' ? `Review ${selected.length} ${selected.length === 1 ? 'CV' : 'CVs'}` : 'Send CVs to employer';

  const footer = step === 'pick' ? (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-[var(--navy)] tabular-nums">{selected.length} selected</p>
        {owed !== null && (
          <p className={`text-[11px] font-semibold ${selected.length > owed ? 'text-amber-700' : 'text-[var(--charcoal)]'}`}>
            {owed === 0 ? 'This request is already fully delivered' : selected.length > owed ? `${selected.length - owed} more than the ${owed} still owed` : `${owed - selected.length} of ${owed} still to pick`}
          </p>
        )}
      </div>
      <Button onClick={goReview} disabled={selected.length === 0} className="gap-1.5">
        Review <span className="tabular-nums">({selected.length})</span>
      </Button>
    </div>
  ) : step === 'review' ? (
    <div className="flex items-center justify-between gap-2">
      <Button variant="ghost" onClick={() => setStep('pick')} disabled={sending} className="gap-1"><ArrowLeft size={15} /> Back</Button>
      <Button variant="success" onClick={send} loading={sending} disabled={sending || !employer} className="gap-1.5">
        {!sending && <Send size={15} />} {sending ? 'Sending…' : `Send ${selected.length} ${selected.length === 1 ? 'CV' : 'CVs'}`}
      </Button>
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-2">
      {mailto ? (
        <a href={mailto} className="inline-flex items-center justify-center gap-2 h-11 rounded-full border border-slate-300 text-sm font-bold text-[var(--navy)] hover:bg-slate-50">
          <Mail size={15} /> Email employer
        </a>
      ) : <span />}
      <Button onClick={onClose} className={mailto ? '' : 'col-start-2'}>Done</Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg" variant="full" footer={footer}>
      {/* Who it goes to */}
      <div className="flex items-center gap-3 rounded-2xl bg-[var(--bg-warm)] border border-[#E7E2D9] p-3.5 mb-4">
        <span className="w-10 h-10 rounded-xl bg-[var(--navy)] text-white flex items-center justify-center flex-shrink-0"><Briefcase size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-[var(--navy)] truncate">{job?.job_title || 'General CV request'}</p>
          <p className="text-xs text-[var(--charcoal)] truncate">
            {employer?.company_name || 'Unknown employer'}{job?.city ? ` · ${job.city}` : ''}
            {cvRequest ? ` · ${cvRequest.plan_label} (${sentForRequest}/${cvRequest.cv_count} sent)` : ''}
          </p>
        </div>
      </div>

      {step === 'pick' && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search name, skill, city, phone"
              aria-label="Search candidates"
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-[var(--orange)]/15 focus:border-[var(--orange)] [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="ap-rail" role="group" aria-label="Quick filters">
            <button type="button" className="ap-chip" aria-pressed={filters.has('resume')} onClick={() => toggleFilter('resume')}><FileText size={13} /> Has resume</button>
            {job && <button type="button" className="ap-chip" aria-pressed={filters.has('strong')} onClick={() => toggleFilter('strong')}><Sparkles size={13} /> 70%+ match</button>}
            {job && <button type="button" className="ap-chip" aria-pressed={filters.has('applied')} onClick={() => toggleFilter('applied')}>Applied to this job <span className="opacity-60 tabular-nums">{appliedIds.size}</span></button>}
            {job?.city && <button type="button" className="ap-chip" aria-pressed={filters.has('local')} onClick={() => toggleFilter('local')}><MapPin size={13} /> In {job.city}</button>}
          </div>

          <p className="text-xs text-[var(--charcoal)]" aria-live="polite">
            <span className="font-bold text-[var(--navy)] tabular-nums">{visible.length}</span> {visible.length === 1 ? 'candidate' : 'candidates'}{job ? ', best fit first' : ''}
            {alreadySent.size > 0 && <> · <span className="tabular-nums">{alreadySent.size}</span> already sent</>}
          </p>

          <div className="space-y-2">
            {visible.slice(0, 120).map(({ c, score, breakdown }) => {
              const name = c.profile_name || 'Unnamed';
              const sent = alreadySent.get(c.id);
              const isOn = selected.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isOn}
                  disabled={Boolean(sent)}
                  onClick={() => toggle(c.id)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-2xl border transition-all duration-200 ${
                    sent ? 'opacity-55 cursor-not-allowed bg-slate-50 border-slate-200'
                      : isOn ? 'border-[var(--orange)] bg-[var(--orange)]/[0.05] shadow-[0_6px_18px_-12px_rgba(241,90,36,0.6)]'
                        : 'border-slate-200 bg-white hover:border-slate-300 active:scale-[0.99]'
                  }`}
                >
                  <span className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isOn ? 'bg-[var(--orange)] border-[var(--orange)]' : 'border-slate-300 bg-white'}`}>
                    {isOn && <Check size={13} strokeWidth={3.5} className="text-white" />}
                  </span>
                  {c.profile_photo_url ? (
                    <img src={c.profile_photo_url} alt="" loading="lazy" className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-slate-100" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-[var(--orange)]/10 text-[var(--orange)] text-xs font-extrabold flex items-center justify-center flex-shrink-0">{initials(name)}</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold text-[var(--navy)] truncate">{name}</span>
                      {appliedIds.has(c.id) && <span className="text-[10px] font-bold text-[var(--green)] bg-[var(--green)]/10 px-1.5 py-0.5 rounded-md flex-shrink-0">Applied</span>}
                    </span>
                    <span className="block text-xs text-[var(--charcoal)] truncate mt-0.5">
                      {[Number(c.total_experience_years) > 0 ? `${c.total_experience_years} yrs` : 'Fresher', c.qualification, c.city || c.location].filter(Boolean).join(' · ')}
                    </span>
                    {(c.skills || []).length > 0 && (
                      <span className="flex flex-wrap gap-1 mt-1.5">
                        {(c.skills || []).slice(0, 4).map((s: string) => (
                          <span key={s} className={`text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md ${breakdown?.matchedSkills?.includes(s) ? 'bg-[var(--green)]/10 text-[var(--green)]' : 'bg-slate-100 text-slate-600'}`}>{s}</span>
                        ))}
                      </span>
                    )}
                    {sent && <span className="block text-[11px] font-semibold text-slate-500 mt-1">Sent {new Date(sent.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                    {!sent && !c.resume_url && <span className="block text-[11px] font-semibold text-amber-700 mt-1">No resume uploaded, the employer sees the profile only</span>}
                  </span>
                  {score !== null && (
                    <span className={`text-xs font-extrabold px-2 py-1 rounded-lg flex-shrink-0 tabular-nums ${scoreTone(score)}`}>{score}%</span>
                  )}
                </button>
              );
            })}
            {visible.length > 120 && <p className="text-center text-xs text-slate-500 py-2">Showing the top 120. Search to narrow down.</p>}
            {visible.length === 0 && (
              <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-[#D8D2C6]">
                <p className="text-sm font-bold text-[var(--navy)]">No candidates match</p>
                <p className="text-xs text-[var(--charcoal)] mt-1">Turn off a filter or try another search.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4 ecm-step--fwd">
          {error && (
            <div role="alert" className="auth-error p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="space-y-2.5">
            {selected.map(id => {
              const r = byId.get(id);
              if (!r) return null;
              const name = r.c.profile_name || 'Unnamed';
              return (
                <div key={id} className="rounded-2xl border border-slate-200 p-3.5 bg-white">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-[var(--orange)]/10 text-[var(--orange)] text-xs font-extrabold flex items-center justify-center flex-shrink-0">{initials(name)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[var(--navy)] truncate">{name}</p>
                      <p className="text-[11px] text-[var(--charcoal)] truncate">{r.c.resume_url ? 'Resume attached' : 'No resume, profile only'}{r.score !== null ? ` · ${r.score}% match` : ''}</p>
                    </div>
                    <button type="button" onClick={() => setSelected(prev => prev.filter(x => x !== id))} aria-label={`Remove ${name}`} className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-600">
                      <X size={15} />
                    </button>
                  </div>
                  <label className="block mt-2.5">
                    <span className="block text-[11px] font-bold text-slate-500 mb-1">Why they fit (the employer sees this)</span>
                    <textarea
                      value={notes[id] || ''}
                      onChange={e => setNotes(prev => ({ ...prev, [id]: e.target.value }))}
                      rows={2}
                      maxLength={300}
                      placeholder="e.g. 4 years on CNC machines, lives 3 km from the plant, can join in a week"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--orange)]/15 focus:border-[var(--orange)] resize-none"
                    />
                  </label>
                </div>
              );
            })}
            {selected.length === 0 && <p className="text-sm text-[var(--charcoal)] text-center py-6">Nothing selected. Go back and pick candidates.</p>}
          </div>

          <label className="block">
            <span className="block text-xs font-bold text-[var(--navy)] mb-1.5">Message to the employer (optional)</span>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              maxLength={600}
              placeholder="e.g. All three have been called and are available for interviews this week."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--orange)]/15 focus:border-[var(--orange)] resize-none"
            />
          </label>

          <div className="rounded-2xl border border-slate-200 p-3.5 space-y-2">
            <Toggle label="Share candidates' phone numbers" checked={shareContact} onChange={setShareContact} />
            <p className="text-[11.5px] text-[var(--charcoal)] flex items-start gap-1.5">
              <ShieldCheck size={13} className="text-[var(--green)] mt-px flex-shrink-0" />
              {shareContact
                ? 'The employer can call candidates directly. Turn this off to keep contact through Rojgaar Hai.'
                : 'Phone numbers stay hidden. The employer will ask you to arrange interviews.'}
            </p>
          </div>

          <p className="text-[11.5px] text-slate-500">
            The employer sees these on their dashboard under this job, can open each resume, and marks each person Shortlisted, Interview, Hired or Not a fit. You will see their answers here.
          </p>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-6 dash-enter" role="status">
          <div className="auth-verified inline-flex mb-4">
            <span className="w-16 h-16 rounded-full bg-[var(--green)] text-white flex items-center justify-center shadow-lg"><CheckCircle2 size={32} /></span>
          </div>
          <h3 className="text-xl font-extrabold text-[var(--navy)]">{sentRows.length} {sentRows.length === 1 ? 'CV' : 'CVs'} sent to {employer?.company_name || 'the employer'}</h3>
          <p className="text-sm text-[var(--charcoal)] mt-2 max-w-sm mx-auto">
            They will see {sentRows.length === 1 ? 'it' : 'them'} on their dashboard right away.
            {cvRequest && doneInfo && (doneInfo.delivered
              ? ' The CV request is now marked Delivered.'
              : ` ${Number(cvRequest.cv_count || 0) - doneInfo.total} more still owed on this request.`)}
          </p>
          {employer?.contact_email && <p className="text-xs text-slate-500 mt-3">Want them to know now? Send the ready-made email below.</p>}
        </div>
      )}
    </Modal>
  );
}
