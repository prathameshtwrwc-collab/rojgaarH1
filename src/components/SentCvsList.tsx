import { useState } from 'react';
import { FileText, Undo2, MessageSquareQuote, Phone } from 'lucide-react';
import { SUBMISSION_STATUS, withdrawCvSubmission, type CvSubmission } from '../lib/supabase/cvSubmissions';

// Admin view of what was sent to an employer and how they answered.
// A CV the employer has not opened yet can still be withdrawn.

const when = (v?: string | null) => (v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '');

export default function SentCvsList({ submissions, onChanged, onToast }: {
  submissions: CvSubmission[];
  onChanged: () => Promise<void> | void;
  onToast?: (msg: string) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (submissions.length === 0) {
    return <p className="text-sm text-[var(--charcoal)] py-2">Nothing sent yet. Use Send CVs to pick candidates for this employer.</p>;
  }

  const counts = submissions.reduce<Record<string, number>>((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {});
  const opened = submissions.filter(s => s.status !== 'sent').length;

  const withdraw = async (id: string) => {
    setBusy(id);
    try {
      await withdrawCvSubmission(id);
      await onChanged();
      onToast?.('CV withdrawn');
    } catch (err) {
      onToast?.((err as { message?: string })?.message || 'Could not withdraw this CV');
    } finally {
      setBusy(null);
      setConfirmId(null);
    }
  };

  return (
    <div>
      {/* Employer response at a glance */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="dash-status dash-status--neutral tabular-nums">{opened}/{submissions.length} opened</span>
        {(['shortlisted', 'interview', 'hired', 'rejected'] as const).filter(k => counts[k]).map(k => (
          <span key={k} className={`dash-status ${SUBMISSION_STATUS[k].cls} tabular-nums`}>{counts[k]} {SUBMISSION_STATUS[k].label.toLowerCase()}</span>
        ))}
      </div>

      <div className="divide-y divide-[#EFEAE1]">
        {submissions.map(s => {
          const meta = SUBMISSION_STATUS[s.status] || SUBMISSION_STATUS.sent;
          return (
            <div key={s.id} className="py-3 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-[var(--navy)]">{s.candidate_name || 'Candidate'}</p>
                  {s.match_score != null && <span className="text-[11px] font-bold text-slate-500 tabular-nums">{s.match_score}%</span>}
                  <span className={`dash-status ${meta.cls}`}>{meta.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>Sent {when(s.sent_at)}</span>
                  {s.viewed_at && <span>· opened {when(s.viewed_at)}</span>}
                  {s.responded_at && <span>· answered {when(s.responded_at)}</span>}
                  {!s.share_contact && <span className="inline-flex items-center gap-0.5"><Phone size={10} /> number hidden</span>}
                  {s.resume_url ? (
                    <a href={s.resume_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-[var(--orange)] font-semibold hover:underline"><FileText size={10} /> Resume</a>
                  ) : <span>· no resume</span>}
                </p>
                {s.employer_feedback && (
                  <p className="mt-1.5 text-xs text-[var(--navy)] bg-[var(--bg-warm)] rounded-lg px-2.5 py-1.5 flex items-start gap-1.5">
                    <MessageSquareQuote size={13} className="text-[var(--orange)] flex-shrink-0 mt-px" /> <span className="break-words">{s.employer_feedback}</span>
                  </p>
                )}
              </div>
              {s.status === 'sent' && (
                confirmId === s.id ? (
                  <button
                    type="button"
                    onClick={() => withdraw(s.id)}
                    disabled={busy === s.id}
                    className="h-8 px-2.5 rounded-lg bg-red-600 text-white text-xs font-bold flex-shrink-0 disabled:opacity-60"
                  >
                    {busy === s.id ? 'Withdrawing…' : 'Withdraw?'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setConfirmId(s.id); setTimeout(() => setConfirmId(c => (c === s.id ? null : c)), 3500); }}
                    title="Withdraw (only before the employer opens it)"
                    aria-label={`Withdraw ${s.candidate_name || 'this CV'}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                  >
                    <Undo2 size={15} />
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
