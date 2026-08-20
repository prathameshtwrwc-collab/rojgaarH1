import { useState } from 'react';
import { GitMerge, Zap, CheckCircle } from 'lucide-react';
import { Card, Badge, Button, Select } from '../../components/ui';
import { useData, JobSeeker, JobPosting, CandidateMatch } from '../../context/DataContext';

function computeMatchScore(candidate: JobSeeker, job: JobPosting): number {
  let score = 0;
  // Skills overlap (40% weight)
  const skillOverlap = candidate.skills.filter(s => job.skillsRequired.some(js => js.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(js.toLowerCase())));
  score += (skillOverlap.length / Math.max(job.skillsRequired.length, 1)) * 40;
  // Salary match (20% weight)
  const expectedSalary = parseInt(candidate.expectedSalary) || 0;
  const salaryMin = parseInt(job.salaryMin) || 0;
  const salaryMax = parseInt(job.salaryMax) || 0;
  if (expectedSalary >= salaryMin && expectedSalary <= salaryMax) score += 20;
  else if (expectedSalary < salaryMin) score += 10;
  // Location (20% weight)
  if (candidate.state === job.state || candidate.location === job.city) score += 20;
  else if (candidate.willingToRelocate && candidate.preferredLocations.some(l => l === job.state || l === job.city)) score += 15;
  // Experience (10% weight)
  const expYears = parseInt(candidate.totalExperience) || 0;
  const reqExp = parseInt(job.experienceRequired) || 0;
  if (expYears >= reqExp - 1 && expYears <= reqExp + 3) score += 10;
  else if (expYears >= reqExp) score += 5;
  // Job type (10% weight)
  if (candidate.preferredJobType === job.employmentType) score += 10;
  return Math.min(Math.round(score), 100);
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-[var(--green)] bg-[#0D604A]/5 border-[#0D604A]/10';
  if (score >= 60) return 'text-[var(--orange)] bg-[#F15A24]/5 border-[#F15A24]/10';
  return 'text-red-700 bg-red-50 border-red-200';
}

const matchStatusVariant: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
  'Pending': 'warning', 'Shortlisted': 'info', 'Interview Scheduled': 'default', 'Offered': 'success', 'Rejected': 'danger',
};

export default function Matching() {
  const { jobSeekers, jobPostings, matches, addMatch, updateMatchStatus } = useData();
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [matchResult, setMatchResult] = useState<{ score: number; candidate: JobSeeker; job: JobPosting } | null>(null);

  const handleMatch = () => {
    const candidate = jobSeekers.find(c => c.id === selectedCandidate);
    const job = jobPostings.find(j => j.id === selectedJob);
    if (candidate && job) {
      const score = computeMatchScore(candidate, job);
      setMatchResult({ score, candidate, job });
    }
  };

  const confirmMatch = () => {
    if (matchResult) {
      const newMatch: CandidateMatch = {
        id: `CM${String(Date.now()).slice(-6)}`,
        candidateId: matchResult.candidate.id,
        jobId: matchResult.job.id,
        candidateName: matchResult.candidate.firstName + ' ' + matchResult.candidate.lastName,
        jobTitle: matchResult.job.jobTitle,
        companyName: matchResult.job.companyName,
        matchScore: matchResult.score,
        status: 'Pending',
        createdAt: new Date().toISOString().split('T')[0],
      };
      addMatch(newMatch);
      setMatchResult(null);
      setSelectedCandidate('');
      setSelectedJob('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--navy)]">Matching Engine</h2>
        <p className="text-sm text-[var(--charcoal)] mt-1">Match candidates with job openings and track compatibility scores</p>
      </div>

      {/* Matching Tool */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#101A36]/10 rounded-lg text-[var(--orange)]"><Zap size={20} /></div>
          <h3 className="font-bold text-[var(--navy)]">Create New Match</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Select
            label="Select Candidate"
            options={[{ value: '', label: 'Choose a candidate...' }, ...jobSeekers.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName} — ${c.skills.slice(0, 2).join(', ')}` }))]}
            value={selectedCandidate}
            onChange={e => setSelectedCandidate(e.target.value)}
          />
          <Select
            label="Select Job Opening"
            options={[{ value: '', label: 'Choose a job...' }, ...jobPostings.filter(j => j.status === 'Open').map(j => ({ value: j.id, label: `${j.jobTitle} at ${j.companyName}` }))]}
            value={selectedJob}
            onChange={e => setSelectedJob(e.target.value)}
          />
        </div>
        <Button onClick={handleMatch} disabled={!selectedCandidate || !selectedJob} className="gap-2">
          <GitMerge size={16} /> Calculate Match
        </Button>

        {/* Match Result */}
        {matchResult && (
          <div className="mt-6 p-4 bg-[var(--bg-warm)] rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider">Match Result</p>
                <p className="font-bold text-[var(--navy)] text-base">{matchResult.candidate.firstName} {matchResult.candidate.lastName} ↔ {matchResult.job.jobTitle} at {matchResult.job.companyName}</p>
              </div>
              <div className={`text-2xl font-bold px-4 py-2 rounded-xl border ${getScoreColor(matchResult.score)}`}>
                {matchResult.score}%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-[var(--charcoal)] font-medium">Skills Overlap:</span> <span className="text-[var(--navy)] font-semibold">{matchResult.candidate.skills.filter(s => matchResult.job.skillsRequired.some(js => js.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(js.toLowerCase()))).join(', ') || 'None'}</span></div>
              <div><span className="text-[var(--charcoal)] font-medium">Location Match:</span> <span className="text-[var(--navy)] font-semibold">{matchResult.candidate.state === matchResult.job.state ? 'Same state' : matchResult.candidate.willingToRelocate ? 'Willing to relocate' : 'Different state'}</span></div>
              <div><span className="text-[var(--charcoal)] font-medium">Salary Fit:</span> <span className="text-[var(--navy)] font-semibold">Expected ₹{parseInt(matchResult.candidate.expectedSalary).toLocaleString()} vs ₹{parseInt(matchResult.job.salaryMin).toLocaleString()}-{parseInt(matchResult.job.salaryMax).toLocaleString()}</span></div>
              <div><span className="text-[var(--charcoal)] font-medium">Experience:</span> <span className="text-[var(--navy)] font-semibold">{matchResult.candidate.totalExperience} yrs (Required: {matchResult.job.experienceRequired})</span></div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="success" onClick={confirmMatch} className="gap-1"><CheckCircle size={14} /> Confirm Match</Button>
              <Button size="sm" variant="ghost" onClick={() => setMatchResult(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Card>

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
              {matches.map(match => (
                <tr key={match.id} className="border-b border-slate-100 hover:bg-slate-100 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-[var(--navy)]">{match.candidateName}</td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)]">{match.jobTitle}</td>
                  <td className="px-4 py-3 text-sm text-[var(--charcoal)]">{match.companyName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-12 text-sm font-bold rounded-lg border px-2 py-0.5 ${getScoreColor(match.matchScore)}`}>
                      {match.matchScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3"><Badge variant={matchStatusVariant[match.status]}>{match.status}</Badge></td>
                  <td className="px-4 py-3">
                    <Select
                      options={[
                        { value: match.status, label: match.status },
                        { value: 'Pending', label: 'Pending' },
                        { value: 'Shortlisted', label: 'Shortlisted' },
                        { value: 'Interview Scheduled', label: 'Interview Scheduled' },
                        { value: 'Offered', label: 'Offered' },
                        { value: 'Rejected', label: 'Rejected' },
                      ]}
                      value={match.status}
                      onChange={e => updateMatchStatus(match.id, e.target.value as CandidateMatch['status'])}
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
