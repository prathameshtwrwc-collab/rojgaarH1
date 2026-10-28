import { useEffect, useMemo, useState } from 'react';
import { FileText, Phone, Sparkles, MessageSquareQuote, ChevronDown, Check, Inbox, Briefcase } from 'lucide-react';
import { respondToCvSubmission, SUBMISSION_STATUS, type CvSubmission, type CvSubmissionStatus } from '../lib/supabase/cvSubmissions';
import { haptic } from '../lib/haptics';

// Employer side of hand-picked CVs: "CVs from Rojgaar Hai".
// Opening a resume marks it viewed; each candidate can be marked Shortlisted / Interview /
// Hired / Not a fit, with optional feedback that goes back to the Rojgaar Hai team.

type Tab = 'new' | 'all' | 'shortlisted' | 'interview' | 'hired' | 'rejected';
const ANSWERS: { key: CvSubmissionStatus; label: string; on: string }[] = [
  { key: 'shortlisted', label: 'Shortlist', on: 'bg-[var(--green)] text-white border-[var(--green)]' },
  { key: 'interview', label: 'Interview', on: 'bg-[var(--navy)] text-white border-[var(--navy)]' },
  { key: 'hired', label: 'Hired', on: 'bg-[var(--green)] text-white border-[var(--green)]' },
  { key: 'rejected', label: 'Not a fit', on: 'bg-red-600 text-white border-red-600' },
];

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
const when = (v: string) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export default function EmployerReceivedCvs({ submissions, jobs, onChanged, onToast }: {
  submissions: CvSubmission[];
  jobs: any[];
  onChanged: () => Promise<void> | void;
  onToast: (msg: string) => void;
}) {
  // Local copy so taps feel instant; the server refresh catches up quietly
  const [rows, setRows] = useState<CvSubmission[]>(submissions);
  useEffect(() => { setRows(submissions); }, [submissions]);

  const newCount = rows.filter(r => r.status === 'sent').length;
  const [tab, setTab] = useState<Tab>(newCount > 0 ? 'new' : 'all');
  const [openFeedback, setOpenFeedback] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const jobTitle = (id: string | null) => (id ? jobs.find((j: any) => j.id === id)?.job_title || 'A job' : 'General CV request');

  const filtered = rows.filter(r => (tab === 'all' ? true : tab === 'new' ? r.status === 'sent' : r.status === tab));

  // Grouped by job, newest batch first
  const groups = useMemo(() => {
    const map = new Map<string, CvSubmission[]>();
    filtered.forEach(r => {
      const k = r.job_id || 'general';
      map.set(k, [...(map.get(k) || []), r]);
    });
    return [...map.entries()].sort((a, b) => String(b[1][0]?.sent_at).localeCompare(String(a[1][0]?.sent_at)));
  }, [filtered]);

  const patchLocal = (id: string, patch: Partial<CvSubmission>) => setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));

  const openResume = async (r: CvSubmission) => {
    if (r.resume_url) window.open(r.resume_url, '_blank', 'noopener');
    if (r.status !== 'sent') return;
    patchLocal(r.id, { status: 'viewed', viewed_at: new Date().toISOString() });
    try {
      await respondToCvSubmission(r.id, { status: 'viewed', markViewed: true });
      onChanged();
    } catch { /* viewing still worked; the mark can be retried later */ }
  };

  const answer = async (r: CvSubmission, status: CvSubmissionStatus) => {
    if (busy) return;
    haptic(status === 'rejected' ? 'tap' : 'success');
    const before = r.status;
    patchLocal(r.id, { status, responded_at: new Date().toISOString() });
    setBusy(r.id);
    try {
      await respondToCvSubmission(r.id, { status, markViewed: !r.viewed_at });
      onToast(status === 'rejected' ? `${r.candidate_name || 'Candidate'} marked as not a fit` : `${r.candidate_name || 'Candidate'} marked ${SUBMISSION_STATUS[status].employerLabel.toLowerCase()}`);
      onChanged();
    } catch (err) {
      patchLocal(r.id, { status: before });
      onToast((err as { message?: string })?.message || 'Could not save. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const saveFeedback = async (r: CvSubmission) => {
    const text = (drafts[r.id] ?? r.employer_feedback ?? '').trim();
    setBusy(r.id);
    try {
      await respondToCvSubmission(r.id, { employer_feedback: text || null });
      patchLocal(r.id, { employer_feedback: text || null });
      setOpenFeedback(null);
      onToast('Feedback sent to the Rojgaar Hai team');
      onChanged();
    } catch (err) {
      onToast((err as { message?: string })?.message || 'Could not send feedback. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  if (rows.length === 0) return null;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'new', label: 'New', count: newCount },
    { key: 'all', label: 'All', count: rows.length },
    { key: 'shortlisted', label: 'Shortlisted', count: rows.filter(r => r.status === 'shortlisted').length },
    { key: 'interview', label: 'Interview', count: rows.filter(r => r.status === 'interview').length },
    { key: 'hired', label: 'Hired', count: rows.filter(r => r.status === 'hired').length },
    { key: 'rejected', label: 'Not a fit', count: rows.filter(r => r.status === 'rejected').length },
  ];

  return (
    <section id="employer-received-cvs" className="scroll-mt-20" aria-labelledby="received-cvs-title">
      <div className="ap-section-head">
        <div>
          <h2 id="received-cvs-title" className="dash-section-title flex items-center gap-2">
            <Sparkles size={17} className="text-[var(--orange)]" /> CVs from Rojgaar Hai
          </h2>
          <p className="text-xs text-[var(--charcoal)] mt-0.5">Candidates our team picked for your jobs. Open a resume, then tell us who you want to meet.</p>
        </div>
        {newCount > 0 && <span className="dash-status dash-status--accent tabular-nums flex-shrink-0">{newCount} new</span>}
      </div>

      <div className="ap-rail mb-3" role="tablist" aria-label="Filter CVs">
        {tabs.filter(t => t.key === 'new' || t.key === 'all' || t.count > 0).map(t => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} aria-pressed={tab === t.key} onClick={() => { haptic('select'); setTab(t.key); }} className="ap-chip">
            {t.label} <span className="tabular-nums opacity-60">{t.count}</span>
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="dash-surface p-8 text-center">
          <Inbox size={22} className="mx-auto text-slate-300" />
          <p className="text-sm font-bold text-[var(--navy)] mt-2">{tab === 'new' ? 'You have opened every CV' : 'Nothing here yet'}</p>
          <p className="text-xs text-[var(--charcoal)] mt-1">{tab === 'new' ? 'New CVs from our team will show up here.' : 'Try another filter.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(([key, list]) => {
            const message = list.find(r => r.message)?.message;
            return (
              <div key={key} className="dash-surface overflow-hidden">
                <div className="px-4 py-3 border-b border-[#EFEAE1] bg-[var(--bg-warm)]/70 flex items-center gap-2.5">
                  <Briefcase size={15} className="text-[var(--navy)] flex-shrink-0" />
                  <p className="text-sm font-extrabold text-[var(--navy)] truncate flex-1">{jobTitle(list[0].job_id)}</p>
                  <span className="text-[11px] font-semibold text-[var(--charcoal)] tabular-nums flex-shrink-0">{list.length} {list.length === 1 ? 'CV' : 'CVs'}</span>
                </div>
                {message && (
                  <p className="px-4 pt-3 text-xs text-[var(--navy)] flex items-start gap-1.5">
                    <MessageSquareQuote size={14} className="text-[var(--orange)] flex-shrink-0 mt-px" />
                    <span className="break-words"><span className="font-bold">From our team:</span> {message}</span>
                  </p>
                )}
                <div className="divide-y divide-[#EFEAE1]">
                  {list.map(r => {
                    const name = r.candidate_name || 'Candidate';
                    const isNew = r.status === 'sent';
                    return (
                      <div key={r.id} className={`p-4 transition-colors ${isNew ? 'bg-[var(--orange)]/[0.03]' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <span className="w-11 h-11 rounded-full bg-[var(--orange)]/10 text-[var(--orange)] text-sm font-extrabold flex items-center justify-center">{initials(name)}</span>
                            {isNew && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--orange)] ring-2 ring-white" aria-label="New" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-extrabold text-[var(--navy)]">{name}</p>
                              {r.match_score != null && (
                                <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md tabular-nums ${r.match_score >= 70 ? 'bg-[var(--green)]/10 text-[var(--green)]' : 'bg-slate-100 text-slate-600'}`}>{r.match_score}% match</span>
                              )}
                              {!isNew && <span className={`dash-status ${SUBMISSION_STATUS[r.status].cls}`}>{SUBMISSION_STATUS[r.status].employerLabel}</span>}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">Sent {when(r.sent_at)}</p>
                            {r.admin_note && (
                              <p className="mt-2 text-[13px] text-[var(--charcoal)] leading-snug break-words">
                                <span className="font-bold text-[var(--navy)]">Why we picked them: </span>{r.admin_note}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Open the resume / call */}
                        <div className="mt-3 grid grid-cols-2 sm:flex gap-2">
                          {r.resume_url ? (
                            <button
                              type="button"
                              onClick={() => openResume(r)}
                              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full bg-[var(--navy)] text-white text-[13px] font-bold active:scale-[0.97] transition-transform"
                            >
                              <FileText size={14} /> View resume
                            </button>
                          ) : (
                            <span className="inline-flex items-center justify-center h-10 px-4 rounded-full bg-slate-100 text-slate-500 text-[12px] font-semibold">No resume, ask us for it</span>
                          )}
                          {r.candidate_phone ? (
                            <a
                              href={`tel:${r.candidate_phone}`}
                              onClick={() => { if (r.status === 'sent') openResume({ ...r, resume_url: null }); }}
                              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border border-slate-300 text-[13px] font-bold text-[var(--navy)] hover:bg-slate-50 active:scale-[0.97] transition-transform"
                            >
                              <Phone size={14} /> Call
                            </a>
                          ) : (
                            <a
                              href={`mailto:support@rojgaarhai.com?subject=${encodeURIComponent(`Interview with ${name}`)}&body=${encodeURIComponent(`Please arrange an interview with ${name} for ${jobTitle(r.job_id)}.`)}`}
                              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border border-slate-300 text-[13px] font-bold text-[var(--navy)] hover:bg-slate-50"
                            >
                              Ask us to arrange
                            </a>
                          )}
                        </div>

                        {/* Answer */}
                        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={`Your decision on ${name}`}>
                          {ANSWERS.map(a => {
                            const on = r.status === a.key;
                            return (
                              <button
                                key={a.key}
                                type="button"
                                aria-pressed={on}
                                disabled={busy === r.id}
                                onClick={() => answer(r, a.key)}
                                className={`inline-flex items-center gap-1 h-9 px-3.5 rounded-full border text-[12.5px] font-bold transition-all active:scale-95 disabled:opacity-60 ${on ? a.on : 'bg-white border-[#D8D2C6] text-[var(--navy)] hover:border-slate-400'}`}
                              >
                                {on && <Check size={13} strokeWidth={3} />} {a.label}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => setOpenFeedback(o => (o === r.id ? null : r.id))}
                            aria-expanded={openFeedback === r.id}
                            className="inline-flex items-center gap-1 h-9 px-3 text-[12.5px] font-bold text-[var(--charcoal)] hover:text-[var(--orange)]"
                          >
                            {r.employer_feedback ? 'Edit note' : 'Add note'} <ChevronDown size={13} className={`transition-transform ${openFeedback === r.id ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {r.employer_feedback && openFeedback !== r.id && (
                          <p className="mt-2 text-xs text-[var(--charcoal)] bg-[var(--bg-warm)] rounded-lg px-2.5 py-1.5 break-words">Your note: {r.employer_feedback}</p>
                        )}

                        {openFeedback === r.id && (
                          <div className="mt-2.5 ecm-pop">
                            <textarea
                              value={drafts[r.id] ?? r.employer_feedback ?? ''}
                              onChange={e => setDrafts(d => ({ ...d, [r.id]: e.target.value }))}
                              rows={2}
                              maxLength={500}
                              autoFocus
                              placeholder="e.g. Good fit, but we need someone who can join this month"
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--orange)]/15 focus:border-[var(--orange)] resize-none"
                            />
                            <div className="flex justify-end gap-2 mt-1.5">
                              <button type="button" onClick={() => setOpenFeedback(null)} className="h-9 px-3 text-xs font-bold text-[var(--charcoal)]">Cancel</button>
                              <button type="button" onClick={() => saveFeedback(r)} disabled={busy === r.id} className="h-9 px-4 rounded-full bg-[var(--orange)] text-white text-xs font-bold disabled:opacity-60">
                                {busy === r.id ? 'Sending…' : 'Send to our team'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
