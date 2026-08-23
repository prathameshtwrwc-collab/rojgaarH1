/**
 * Rojgaar Hai matching engine.
 *
 * Deterministic, explainable, weighted scoring — no black-box AI call.
 * Every point awarded traces back to a concrete rule below, so the score
 * shown to a candidate or admin can always be justified.
 *
 * Weight distribution (sums to 100):
 *   Skills fit        40  — the single biggest predictor of job success
 *   Experience fit     20  — candidate's years vs. what the role asks for
 *   Salary fit         15  — candidate's expectation vs. what the job pays
 *   Location fit       15  — commute/relocation feasibility
 *   Job-type fit        5  — full-time/part-time/contract alignment
 *   Qualification fit   5  — education requirement alignment
 */

export interface MatchCandidate {
  skills?: string[] | null;
  total_experience_years?: number | null;
  expected_salary_min?: number | null;
  expected_salary_max?: number | null;
  state?: string | null;
  location?: string | null;
  city?: string | null;
  willing_to_relocate?: boolean | null;
  preferred_job_type?: string | null;
  qualification?: string | null;
}

export interface MatchJob {
  skills_required?: string[] | null;
  experience_min_years?: number | null;
  experience_max_years?: number | null;
  salary_min?: number | null;
  salary_max?: number | null;
  state?: string | null;
  city?: string | null;
  employment_type?: string | null;
  qualification_required?: string | null;
}

export interface MatchBreakdown {
  score: number;
  skillsScore: number;
  experienceScore: number;
  salaryScore: number;
  locationScore: number;
  jobTypeScore: number;
  qualificationScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/** Two skill labels are considered the same skill if either contains the other. */
function skillsEqual(a: string, b: string): boolean {
  const na = norm(a);
  const nb = norm(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

function scoreSkills(candidateSkills: string[], jobSkills: string[]): { score: number; matched: string[]; missing: string[] } {
  if (jobSkills.length === 0) {
    // Job didn't specify required skills — don't penalize, but don't over-credit either.
    return { score: 24, matched: [], missing: [] };
  }
  const matched = jobSkills.filter(js => candidateSkills.some(cs => skillsEqual(cs, js)));
  const missing = jobSkills.filter(js => !matched.includes(js));
  const ratio = matched.length / jobSkills.length;
  return { score: Math.round(ratio * 40), matched, missing };
}

function scoreExperience(candidateYears: number, minYears: number | null, maxYears: number | null): number {
  const min = minYears ?? 0;
  const max = maxYears ?? min + 5;
  if (candidateYears >= min && candidateYears <= max) return 20;
  if (candidateYears > max) {
    // overqualified — still capable, mild taper the further past the ceiling they are
    const over = candidateYears - max;
    return Math.max(12, 20 - over * 2);
  }
  // under-qualified — partial credit proportional to how close they are
  if (min === 0) return 20;
  const ratio = candidateYears / min;
  return Math.round(Math.max(0, ratio) * 20);
}

function scoreSalary(expectedMin: number, jobMin: number, jobMax: number): number {
  if (!jobMax && !jobMin) return 12;
  const jMax = jobMax || jobMin;
  const jMin = jobMin || 0;
  const cMin = expectedMin || 0;
  // Candidate's minimum ask fits within what the job pays.
  if (cMin <= jMax) {
    // Bonus if it also comfortably clears the job's minimum (good salary alignment)
    return cMin >= jMin ? 15 : 13;
  }
  // Candidate expects more than the job's ceiling — scale down by how far over
  const overRatio = (cMin - jMax) / jMax;
  return Math.max(0, Math.round(15 - overRatio * 30));
}

function scoreLocation(candidate: MatchCandidate, job: MatchJob): number {
  const cCity = norm(candidate.city || candidate.location || '');
  const jCity = norm(job.city || '');
  const cState = norm(candidate.state || '');
  const jState = norm(job.state || '');

  if (cCity && jCity && cCity === jCity) return 15;
  if (cState && jState && cState === jState) return 11;
  if (candidate.willing_to_relocate) return 6;
  return 0;
}

function scoreJobType(candidate: MatchCandidate, job: MatchJob): number {
  if (!candidate.preferred_job_type || !job.employment_type) return 2.5;
  return norm(candidate.preferred_job_type) === norm(job.employment_type) ? 5 : 0;
}

function scoreQualification(candidate: MatchCandidate, job: MatchJob): number {
  if (!candidate.qualification || !job.qualification_required) return 2.5;
  const cq = norm(candidate.qualification);
  const jq = norm(job.qualification_required);
  return cq === jq || cq.includes(jq) || jq.includes(cq) ? 5 : 0;
}

export function computeMatch(candidate: MatchCandidate, job: MatchJob): MatchBreakdown {
  const candidateSkills = candidate.skills || [];
  const jobSkills = job.skills_required || [];
  const { score: skillsScore, matched, missing } = scoreSkills(candidateSkills, jobSkills);
  const experienceScore = scoreExperience(candidate.total_experience_years || 0, job.experience_min_years ?? null, job.experience_max_years ?? null);
  const salaryScore = scoreSalary(candidate.expected_salary_min || 0, job.salary_min || 0, job.salary_max || 0);
  const locationScore = scoreLocation(candidate, job);
  const jobTypeScore = scoreJobType(candidate, job);
  const qualificationScore = scoreQualification(candidate, job);

  const score = Math.max(0, Math.min(100, Math.round(
    skillsScore + experienceScore + salaryScore + locationScore + jobTypeScore + qualificationScore
  )));

  const reasons: string[] = [];
  if (matched.length > 0) reasons.push(`${matched.length}/${jobSkills.length || matched.length} required skills matched`);
  if (locationScore >= 15) reasons.push('Same city');
  else if (locationScore >= 11) reasons.push('Same state');
  else if (locationScore > 0) reasons.push('Willing to relocate');
  if (experienceScore >= 18) reasons.push('Experience fits the role');
  if (salaryScore >= 13) reasons.push('Salary expectation aligns');
  if (missing.length > 0) reasons.push(`Missing: ${missing.slice(0, 3).join(', ')}`);

  return { score, skillsScore, experienceScore, salaryScore, locationScore, jobTypeScore, qualificationScore, matchedSkills: matched, missingSkills: missing, reasons };
}

export function matchLabel(score: number): { label: string; tone: 'excellent' | 'good' | 'fair' | 'weak' } {
  if (score >= 80) return { label: 'Excellent Match', tone: 'excellent' };
  if (score >= 60) return { label: 'Good Match', tone: 'good' };
  if (score >= 40) return { label: 'Fair Match', tone: 'fair' };
  return { label: 'Weak Match', tone: 'weak' };
}
