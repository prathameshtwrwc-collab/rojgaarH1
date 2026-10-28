import { useState, useMemo } from 'react';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { Inbox } from 'lucide-react';
import { GitMerge, Zap, CheckCircle, Trophy, Sparkles, Download, Send } from 'lucide-react';
import SendCvsModal from '../../components/SendCvsModal';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, Select, Toast } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { createMatch, updateMatchStatus as updateMatchStatusApi, getCandidateEducation, getCandidateExperience, getCandidateLanguages } from '../../lib/supabase/data';
import { computeMatch, matchLabel, checkText } from '../../lib/matching';

function getScoreColor(score: number) {
  if (score >= 80) return 'text-[var(--green)] bg-[#0D604A]/5 border-[#0D604A]/10';
  if (score >= 60) return 'text-[var(--orange)] bg-[#F15A24]/5 border-[#F15A24]/10';
  if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

const matchStatusVariant: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
  'Pending': 'warning', 'Shortlisted': 'info', 'Interview Scheduled': 'default', 'Offered': 'success', 'Hired': 'success', 'Rejected': 'danger',
};
// "Hired" is set by the hire flow; it must be in the list or the dropdown would show the wrong value
const MATCH_STATUSES = ['Pending', 'Shortlisted', 'Interview Scheduled', 'Offered', 'Hired', 'Rejected'];

type Mode = 'manual' | 'bestForJob';

export default function Matching() {
  const { candidates, jobs, employers, matches, cvSubmissions, cvRequests, jobSkills, refresh } = useDatabase();
  const { user } = useAuth();
  const [showSendCvs, setShowSendCvs] = useState(false);
  const [mode, setMode] = useState<Mode>('manual');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [matchResult, setMatchResult] = useState<{ candidate: any; job: any } | null>(null);
  const [saving, setSaving] = useState(false);
  const [bestJobId, setBestJobId] = useState('');
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [statusBusy, setStatusBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const errMsg = (err: unknown, fallback: string) => (err as { message?: string })?.message || fallback;

  const employerName = (employerId: string) => employers.find((e: any) => e.id === employerId)?.company_name || 'Unknown';

  const openJobs = useMemo(() => jobs.filter((j: any) => j.status === 'Open'), [jobs]);
  const existingMatchKeys = useMemo(() => new Set(matches.map((m: any) => `${m.candidate_id}:${m.job_id}`)), [matches]);

  const matchesEnriched = useMemo(() => [...matches].sort((a: any, b: any) => String(b.created_at || '').localeCompare(String(a.created_at || ''))).map((m: any) => {
    const candidate = candidates.find((c: any) => c.id === m.candidate_id);
    const job = jobs.find((j: any) => j.id === m.job_id);
    return {
      ...m,
      candidateName: candidate?.profile_name || 'Unknown',
      jobTitle: job?.job_title || 'Unknown',
      companyName: job ? employerName(job.employer_id) : 'Unknown',
    };
  }), [matches, candidates, jobs, employers]);

  const handleMatch = () => {
    const candidate = candidates.find((c: any) => c.id === selectedCandidate);
    const job = jobs.find((j: any) => j.id === selectedJob);
    if (candidate && job) setMatchResult({ candidate, job });
  };

  const currentBreakdown = matchResult ? computeMatch(matchResult.candidate, matchResult.job) : null;

  const confirmMatch = async (candidateId: string, jobId: string, score: number) => {
    setSaving(true);
    if (existingMatchKeys.has(`${candidateId}:${jobId}`)) {
      setToast('This candidate is already matched to this job');
      setSaving(false);
      return;
    }
    try {
      await createMatch({ candidate_id: candidateId, job_id: jobId, match_score: score, status: 'Pending' } as any);
      await refresh({ silent: true });
      setMatchResult(null);
      setSelectedCandidate('');
      setSelectedJob('');
      setToast('Match created');
    } catch (err) {
      setToast(errMsg(err, 'Failed to create match'));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (matchId: string, status: string) => {
    setStatusBusy(matchId);
    try {
      await updateMatchStatusApi(matchId, status);
      await refresh({ silent: true });
      setToast(`Status changed to ${status}`);
    } catch (err) {
      setToast(errMsg(err, 'Failed to update match status'));
    } finally {
      setStatusBusy(null);
    }
  };

  const downloadBestCandidatesCsv = async () => {
    if (!bestJobId) return;
    setDownloadingCsv(true);
    try {
      const job = jobs.find((j: any) => j.id === bestJobId);
      if (!job) return;

      const ranked = candidates
        .map((c: any) => ({ candidate: c, breakdown: computeMatch(c, job) }))
        .sort((a, b) => b.breakdown.score - a.breakdown.score)
        .slice(0, 8);

      const enriched = await Promise.all(ranked.map(async ({ candidate }) => {
        const [education, experience, languages] = await Promise.all([
          getCandidateEducation(candidate.id),
          getCandidateExperience(candidate.id),
          getCandidateLanguages(candidate.id),
        ]);

        const educationText = (education || [])
          .map((e: any) => [e.degree, e.field_of_study, e.institution_name].filter(Boolean).join(' - '))
          .join('; ') || '';

        const experienceText = (experience || [])
          .map((e: any) => [e.job_title, e.company_name, e.employment_type].filter(Boolean).join(' at '))
          .join('; ') || '';

        const languageText = (languages || [])
          .map((l: any) => l.language_name)
          .filter(Boolean)
          .join(', ') || '';

        const location = [candidate.city, candidate.state, candidate.country].filter(Boolean).join(', ');

        return {
          name: candidate.profile_name || candidate.id,
          number: candidate.profile_phone || '',
          email: candidate.email || '',
          skills: (candidate.skills || []).join(', '),
          location,
          willingToRelocate: candidate.willing_to_relocate ? 'Yes' : 'No',
          workExperience: experienceText,
          languages: languageText,
          education: educationText,
          matchedForPost: job.job_title,
        };
      }));

      const headers = [
        'Name', 'Number', 'Email', 'Skills', 'Location',
        'Willing To Relocate', 'Work Experience', 'Languages', 'Education', 'Matched For Post',
      ];

      const escapeCsv = (value: string) => {
        const text = String(value ?? '');
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
          return '"' + text.replace(/"/g, '""') + '"';
        }
        return text;
      };

      const csvRows = [
        headers.join(','),
        ...enriched.map((row) =>
          [
            row.name,
            row.number,
            row.email,
            row.skills,
            row.location,
            row.willingToRelocate,
            row.workExperience,
            row.languages,
            row.education,
            row.matchedForPost,
          ].map(escapeCsv).join(',')
        ),
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `best-candidates-${job.job_title.replace(/\s+/g, '-').toLowerCase()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setToast(errMsg(err, 'Failed to download CSV'));
    } finally {
      setDownloadingCsv(false);
    }
  };

  const bestForJob = useMemo(() => {
    const job = jobs.find((j: any) => j.id === bestJobId);
    if (!job) return [];
    return candidates
      .map((c: any) => ({ candidate: c, breakdown: computeMatch(c, job) }))
      .sort((a, b) => b.breakdown.score - a.breakdown.score)
      .slice(0, 8);
  }, [bestJobId, jobs, candidates]);

  const paging = usePagination(matchesEnriched, 10);

  return (
    <div className="space-y-6 dash-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="admin-page-title text-2xl font-bold text-[var(--navy)]">Matching Engine</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">Weighted, explainable candidate-to-job compatibility scoring</p>
        </div>
        <div role="tablist" aria-label="Matching mode" className="relative grid grid-cols-2 bg-slate-100 rounded-full p-1 w-full sm:w-auto">
          <span aria-hidden className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]" style={{ transform: mode === 'bestForJob' ? 'translateX(100%)' : 'none' }} />
          {([['manual', 'Manual match'], ['bestForJob', 'Best for a job']] as const).map(([m, label]) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`relative z-10 h-9 px-4 rounded-full text-xs font-bold transition-colors ${mode === m ? 'text-[var(--navy)]' : 'text-[var(--charcoal)]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'manual' ? (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#101A36]/10 rounded-lg text-[var(--orange)]"><Zap size={20} /></div>
            <h3 className="font-bold text-[var(--navy)]">Create New Match</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Select
              label="Select Candidate"
              options={[{ value: '', label: 'Choose a candidate...' }, ...candidates.map((c: any) => ({ value: c.id, label: `${c.profile_name || c.id} — ${(c.skills || []).slice(0, 2).join(', ')}` }))]}
              value={selectedCandidate}
              onChange={e => { setSelectedCandidate(e.target.value); setMatchResult(null); }}
            />
            <Select
              label="Select Job Opening"
              options={[{ value: '', label: 'Choose a job...' }, ...openJobs.map((j: any) => ({ value: j.id, label: `${j.job_title} at ${employerName(j.employer_id)}` }))]}
              value={selectedJob}
              onChange={e => { setSelectedJob(e.target.value); setMatchResult(null); }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleMatch} disabled={!selectedCandidate || !selectedJob} className="gap-2">
              <GitMerge size={16} /> Calculate Match
            </Button>
            {selectedCandidate && selectedJob && existingMatchKeys.has(`${selectedCandidate}:${selectedJob}`) && (
              <span className="text-xs font-semibold text-amber-700">Already matched. You can still view the score.</span>
            )}
          </div>

          {matchResult && currentBreakdown && (
            <div className="mt-6 p-4 bg-[var(--bg-warm)] rounded-xl border border-slate-200" style={{ animation: "ap-scale-in 320ms var(--ease-out-expo) both" }}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider">{matchLabel(currentBreakdown.score).label}</p>
                  <p className="font-bold text-[var(--navy)] text-base break-words">{matchResult.candidate.profile_name || 'Unnamed'} ↔ {matchResult.job.job_title} at {employerName(matchResult.job.employer_id)}</p>
                </div>
                <div className={`text-2xl font-bold px-4 py-2 rounded-xl border flex-shrink-0 tabular-nums ${getScoreColor(currentBreakdown.score)}`}>
                  {currentBreakdown.score}%
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 text-xs">
                <div className="bg-white rounded-lg p-2 border border-slate-200"><p className="text-slate-400">Skills</p><p className="font-bold text-[var(--navy)]">{checkText(currentBreakdown, 'skills')}</p></div>
                <div className="bg-white rounded-lg p-2 border border-slate-200"><p className="text-slate-400">Experience</p><p className="font-bold text-[var(--navy)]">{checkText(currentBreakdown, 'experience')}</p></div>
                <div className="bg-white rounded-lg p-2 border border-slate-200"><p className="text-slate-400">Salary</p><p className="font-bold text-[var(--navy)]">{checkText(currentBreakdown, 'salary')}</p></div>
                <div className="bg-white rounded-lg p-2 border border-slate-200"><p className="text-slate-400">Location</p><p className="font-bold text-[var(--navy)]">{checkText(currentBreakdown, 'location')}</p></div>
                <div className="bg-white rounded-lg p-2 border border-slate-200"><p className="text-slate-400">Job Type</p><p className="font-bold text-[var(--navy)]">{checkText(currentBreakdown, 'jobType')}</p></div>
                <div className="bg-white rounded-lg p-2 border border-slate-200"><p className="text-slate-400">Education</p><p className="font-bold text-[var(--navy)]">{checkText(currentBreakdown, 'qualification')}</p></div>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Based on {Math.round(currentBreakdown.coverage * 100)}% of the profile and job details{currentBreakdown.confident ? '' : ' · limited data, treat this score with care'}.
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {currentBreakdown.reasons.map((r, i) => <span key={i} className="text-[11px] font-medium text-[var(--charcoal)] bg-white border border-slate-200 rounded-full px-2.5 py-1">{r}</span>)}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="success" onClick={() => confirmMatch(matchResult.candidate.id, matchResult.job.id, currentBreakdown.score)} disabled={saving || existingMatchKeys.has(`${matchResult.candidate.id}:${matchResult.job.id}`)} loading={saving} className="gap-1">{!saving && <CheckCircle size={14} />} {saving ? 'Saving…' : 'Confirm Match'}</Button>
                <Button size="sm" variant="ghost" onClick={() => setMatchResult(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#101A36]/10 rounded-lg text-[var(--orange)]"><Trophy size={20} /></div>
            <h3 className="font-bold text-[var(--navy)]">Best Candidates for a Job</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <Select
                label="Select Job Opening"
                options={[{ value: '', label: 'Choose a job...' }, ...openJobs.map((j: any) => ({ value: j.id, label: `${j.job_title} at ${employerName(j.employer_id)}` }))]}
                value={bestJobId}
                onChange={e => setBestJobId(e.target.value)}
              />
            </div>
            <div className="flex gap-2 self-end">
              <Button onClick={() => setShowSendCvs(true)} disabled={!bestJobId} className="gap-2">
                <Send size={16} /> Send CVs
              </Button>
              <Button
                variant="secondary"
                onClick={downloadBestCandidatesCsv}
                disabled={!bestJobId || downloadingCsv}
                className="gap-2"
              >
                <Download size={16} /> {downloadingCsv ? 'Downloading...' : 'CSV'}
              </Button>
            </div>
          </div>

          {bestJobId && (
            <div className="mt-5 space-y-3">
              {bestForJob.map(({ candidate, breakdown }, idx) => {
                const alreadyMatched = existingMatchKeys.has(`${candidate.id}:${bestJobId}`);
                return (
                  <div key={candidate.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:shadow-sm transition-shadow">
                    <div className="w-7 h-7 rounded-full bg-[var(--navy)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--navy)] truncate">{candidate.profile_name || 'Unnamed'}</p>
                      <p className="text-xs text-[var(--charcoal)] truncate">{breakdown.reasons.join(' · ') || 'Limited profile data'}</p>
                    </div>
                    <div className={`text-sm font-bold px-3 py-1 rounded-lg border flex-shrink-0 tabular-nums ${getScoreColor(breakdown.score)}`}>{breakdown.score}%</div>
                    {alreadyMatched ? (
                      <Badge variant="default" className="flex-shrink-0">Matched</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="success"
                        disabled={Boolean(creatingFor)}
                        loading={creatingFor === candidate.id}
                        onClick={async () => { setCreatingFor(candidate.id); await confirmMatch(candidate.id, bestJobId, breakdown.score); setCreatingFor(null); }}
                        className="flex-shrink-0 gap-1 text-xs"
                      >
                        <Sparkles size={12} /> Match
                      </Button>
                    )}
                  </div>
                );
              })}
              {bestForJob.length === 0 && <p className="text-sm text-[var(--charcoal)] text-center py-6">No candidates in the system yet.</p>}
            </div>
          )}
        </Card>
      )}

      {/* Existing Matches */}
      <Card padding={false}>
        <div className="px-4 py-3 border-b border-slate-200 bg-[var(--bg-warm)]/80">
          <h3 className="font-bold text-[var(--navy)]">All Matches <span className="tabular-nums text-[var(--charcoal)] font-semibold">({matches.length})</span></h3>
        </div>
        <div className="admin-table overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-[var(--bg-warm)]/90">
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Candidate</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Job</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Company</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Score</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paging.pageItems.map((match: any) => (
                <tr key={match.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-[background-color,opacity] ${statusBusy === match.id ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3 text-sm font-semibold text-[var(--navy)]">{match.candidateName}</td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)]">{match.jobTitle}</td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)]">{match.companyName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-12 text-sm font-bold rounded-lg border px-2 py-0.5 ${getScoreColor(match.match_score)}`}>
                      {match.match_score}%
                    </span>
                  </td>
                  <td className="px-4 py-3"><Badge variant={matchStatusVariant[match.status]}>{match.status}</Badge></td>
                  <td className="px-4 py-3">
                    <Select
                      options={[
                        ...MATCH_STATUSES.map(s => ({ value: s, label: s })),
                        // Keep any status we don't know about visible instead of silently showing "Pending"
                        ...(match.status && !MATCH_STATUSES.includes(match.status) ? [{ value: match.status, label: match.status }] : []),
                      ]}
                      value={match.status}
                      onChange={e => handleStatusChange(match.id, e.target.value)}
                      disabled={statusBusy === match.id}
                      aria-label={`Status for ${match.candidateName}`}
                      className="!py-1 text-xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
                {paging.total === 0 ? (
                  <div className="p-4"><EmptyState icon={<Inbox size={20} />} title="No matches yet" body="Create one above, or pick a job to see its best candidates." /></div>
                ) : (
                  <Pagination page={paging.page} pageSize={paging.pageSize} total={paging.total} onPageChange={paging.setPage} label="matches" />
                )}
        </div>
      </Card>

      {(() => {
        const job = jobs.find((j: any) => j.id === bestJobId) || null;
        return (
          <SendCvsModal
            isOpen={showSendCvs && Boolean(job)}
            onClose={() => setShowSendCvs(false)}
            job={job}
            employer={job ? employers.find((e: any) => e.id === job.employer_id) || null : null}
            candidates={candidates}
            jobSkills={job ? jobSkills[job.id] || [] : []}
            submissions={cvSubmissions}
            cvRequest={job ? cvRequests.find((r: any) => r.job_id === job.id && r.status !== 'cancelled' && r.status !== 'delivered') || null : null}
            adminId={user?.id || null}
            onSent={() => refresh({ silent: true })}
          />
        );
      })()}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
