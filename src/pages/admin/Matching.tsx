import { useState, useMemo } from 'react';
import { GitMerge, Zap, CheckCircle, Trophy, Sparkles } from 'lucide-react';
import { Card, Badge, Button, Select } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { createMatch, updateMatchStatus as updateMatchStatusApi } from '../../lib/supabase/data';
import { computeMatch, matchLabel } from '../../lib/matching';

function getScoreColor(score: number) {
  if (score >= 80) return 'text-[var(--green)] bg-[#0D604A]/5 border-[#0D604A]/10';
  if (score >= 60) return 'text-[var(--orange)] bg-[#F15A24]/5 border-[#F15A24]/10';
  if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

const matchStatusVariant: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
  'Pending': 'warning', 'Shortlisted': 'info', 'Interview Scheduled': 'default', 'Offered': 'success', 'Rejected': 'danger',
};

type Mode = 'manual' | 'bestForJob';

export default function Matching() {
  const { candidates, jobs, employers, matches, refresh } = useDatabase();
  const [mode, setMode] = useState<Mode>('manual');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [matchResult, setMatchResult] = useState<{ candidate: any; job: any } | null>(null);
  const [saving, setSaving] = useState(false);
  const [bestJobId, setBestJobId] = useState('');
  const [creatingFor, setCreatingFor] = useState<string | null>(null);

  const employerName = (employerId: string) => employers.find((e: any) => e.id === employerId)?.company_name || 'Unknown';

  const openJobs = useMemo(() => jobs.filter((j: any) => j.status === 'Open'), [jobs]);
  const existingMatchKeys = useMemo(() => new Set(matches.map((m: any) => `${m.candidate_id}:${m.job_id}`)), [matches]);

  const matchesEnriched = useMemo(() => matches.map((m: any) => {
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
    try {
      await createMatch({ candidate_id: candidateId, job_id: jobId, match_score: score, status: 'Pending' } as any);
      await refresh();
      setMatchResult(null);
      setSelectedCandidate('');
      setSelectedJob('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create match');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (matchId: string, status: string) => {
    try {
      await updateMatchStatusApi(matchId, status);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update match status');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy)]">Matching Engine</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">Weighted, explainable candidate-to-job compatibility scoring</p>
        </div>
        <div className="flex bg-slate-100 rounded-full p-1">
          <button onClick={() => setMode('manual')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${mode === 'manual' ? 'bg-white text-[var(--navy)] shadow-sm' : 'text-[var(--charcoal)]'}`}>Manual Match</button>
          <button onClick={() => setMode('bestForJob')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${mode === 'bestForJob' ? 'bg-white text-[var(--navy)] shadow-sm' : 'text-[var(--charcoal)]'}`}>Best Candidates for a Job</button>
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
              onChange={e => setSelectedCandidate(e.target.value)}
            />
            <Select
              label="Select Job Opening"
              options={[{ value: '', label: 'Choose a job...' }, ...openJobs.map((j: any) => ({ value: j.id, label: `${j.job_title} at ${employerName(j.employer_id)}` }))]}
              value={selectedJob}
              onChange={e => setSelectedJob(e.target.value)}
            />
          </div>
          <Button onClick={handleMatch} disabled={!selectedCandidate || !selectedJob} className="gap-2">
            <GitMerge size={16} /> Calculate Match
          </Button>

          {matchResult && currentBreakdown && (
            <div className="mt-6 p-4 bg-[var(--bg-warm)] rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider">{matchLabel(currentBreakdown.score).label}</p>
                  <p className="font-bold text-[var(--navy)] text-base">{matchResult.candidate.profile_name || matchResult.candidate.id} ↔ {matchResult.job.job_title} at {employerName(matchResult.job.employer_id)}</p>
                </div>
                <div className={`text-2xl font-bold px-4 py-2 rounded-xl border ${getScoreColor(currentBreakdown.score)}`}>
                  {currentBreakdown.score}%
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 text-xs">
                <div className="bg-white rounded-lg p-2 border border-slate-200"><p className="text-slate-400">Skills</p><p className="font-bold text-[var(--navy)]">{currentBreakdown.skillsScore}/40</p></div>
                <div className="bg-white rounded-lg p-2 border border-slate-200"><p className="text-slate-400">Experience</p><p className="font-bold text-[var(--navy)]">{currentBreakdown.experienceScore}/20</p></div>
                <div className="bg-white rounded-lg p-2 border border-slate-200"><p className="text-slate-400">Salary</p><p className="font-bold text-[var(--navy)]">{currentBreakdown.salaryScore}/15</p></div>
                <div className="bg-white rounded-lg p-2 border border-slate-200"><p className="text-slate-400">Location</p><p className="font-bold text-[var(--navy)]">{currentBreakdown.locationScore}/15</p></div>
                <div className="bg-white rounded-lg p-2 border border-slate-200"><p className="text-slate-400">Job Type</p><p className="font-bold text-[var(--navy)]">{currentBreakdown.jobTypeScore}/5</p></div>
                <div className="bg-white rounded-lg p-2 border border-slate-200"><p className="text-slate-400">Education</p><p className="font-bold text-[var(--navy)]">{currentBreakdown.qualificationScore}/5</p></div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {currentBreakdown.reasons.map((r, i) => <span key={i} className="text-[11px] font-medium text-[var(--charcoal)] bg-white border border-slate-200 rounded-full px-2.5 py-1">{r}</span>)}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="success" onClick={() => confirmMatch(matchResult.candidate.id, matchResult.job.id, currentBreakdown.score)} disabled={saving} className="gap-1"><CheckCircle size={14} /> {saving ? 'Saving...' : 'Confirm Match'}</Button>
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
          <Select
            label="Select Job Opening"
            options={[{ value: '', label: 'Choose a job...' }, ...openJobs.map((j: any) => ({ value: j.id, label: `${j.job_title} at ${employerName(j.employer_id)}` }))]}
            value={bestJobId}
            onChange={e => setBestJobId(e.target.value)}
          />

          {bestJobId && (
            <div className="mt-5 space-y-3">
              {bestForJob.map(({ candidate, breakdown }, idx) => {
                const alreadyMatched = existingMatchKeys.has(`${candidate.id}:${bestJobId}`);
                return (
                  <div key={candidate.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:shadow-sm transition-shadow">
                    <div className="w-7 h-7 rounded-full bg-[var(--navy)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[var(--navy)] truncate">{candidate.profile_name || candidate.id}</p>
                      <p className="text-xs text-[var(--charcoal)] truncate">{breakdown.reasons.join(' · ') || 'Limited profile data'}</p>
                    </div>
                    <div className={`text-sm font-bold px-3 py-1 rounded-lg border flex-shrink-0 ${getScoreColor(breakdown.score)}`}>{breakdown.score}%</div>
                    {alreadyMatched ? (
                      <Badge variant="default" className="flex-shrink-0">Matched</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="success"
                        disabled={creatingFor === candidate.id}
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
          <h3 className="font-bold text-[var(--navy)]">All Matches ({matches.length})</h3>
        </div>
        <div className="overflow-x-auto">
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
              {matchesEnriched.map((match: any) => (
                <tr key={match.id} className="border-b border-slate-100 hover:bg-slate-100 transition-colors">
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
                        { value: 'Pending', label: 'Pending' },
                        { value: 'Shortlisted', label: 'Shortlisted' },
                        { value: 'Interview Scheduled', label: 'Interview Scheduled' },
                        { value: 'Offered', label: 'Offered' },
                        { value: 'Rejected', label: 'Rejected' },
                      ]}
                      value={match.status}
                      onChange={e => handleStatusChange(match.id, e.target.value)}
                      className="!py-1 text-xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
