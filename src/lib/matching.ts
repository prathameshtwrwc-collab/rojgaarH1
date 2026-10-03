/**
 * Rojgaar Hai matching engine.
 *
 * Deterministic and explainable: no black-box AI call. Every point traces back to one of
 * the checks below, and every score says how much of the profile it was based on.
 *
 * Checks and weights (out of 100):
 *   Skills         40  share of the job's required skills the candidate has
 *   Experience     20  years against the job's minimum and maximum
 *   Salary         15  candidate's minimum expectation against the job's pay range
 *   Location       15  same city > same state > willing to relocate
 *   Job type        5  preferred full-time / part-time / contract matches
 *   Qualification   5  education level against the minimum the job asks for
 *
 * A check is only scored when both sides have data. If a job lists no skills, or the
 * candidate left salary blank, that check is skipped and the score is worked out from the
 * checks that remain. Skipped checks never earn free points, and `coverage` shows how much
 * of the 100 points were actually checked.
 */

import { skillKey } from '../constants/skills';
import { locationKey } from './location';

export const WEIGHTS = {
  skills: 40,
  experience: 20,
  salary: 15,
  location: 15,
  jobType: 5,
  qualification: 5,
} as const;

export type CheckKey = keyof typeof WEIGHTS;

const CHECK_LABELS: Record<CheckKey, string> = {
  skills: 'skills',
  experience: 'experience',
  salary: 'salary',
  location: 'location',
  jobType: 'job type',
  qualification: 'qualification',
};

/** Below this share of the 100 points, a score is labelled as based on limited data. */
export const CONFIDENT_COVERAGE = 0.6;
/** Jobs with less than this coverage are not recommended at all. */
export const MIN_RECOMMEND_COVERAGE = 0.4;

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
  id?: string;
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

export interface CheckResult {
  key: CheckKey;
  label: string;
  /** Points earned out of `max` (one decimal place). */
  points: number;
  max: number;
  /** Plain-language note for this check. */
  note: string;
}

export interface MatchBreakdown {
  /** 0-100, worked out from the checks that could be made. */
  score: number;
  /** Share of the 100 weighted points that could be checked, 0-1. */
  coverage: number;
  /** True when enough of the profile was checked to trust the score. */
  confident: boolean;
  /** The checks that were scored. Skipped checks are not listed. */
  checks: CheckResult[];
  /** Names of checks that could not be scored because data was missing. */
  unchecked: string[];
  /** Points per check, 0 when the check was skipped. */
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

/* ---------- qualification levels ---------- */

/**
 * Education level, 0 (no formal) to 5 (PhD). Ordered so that "post graduate" is tested
 * before "graduate", and "12th" before "10th", so no text matches two levels.
 * Returns null when the text is not a recognised qualification.
 */
export function qualificationLevel(text: string | null | undefined): number | null {
  if (!text) return null;
  const t = text.toLowerCase();
  if (/\bph\.?\s?d\b|doctorate/.test(t)) return 5;
  if (/post.?grad|\bmba\b|\bmca\b|\bmtech\b|\bm\.?\s?tech\b|\bmsc\b|\bm\.?\s?sc\b|\bm\.?\s?com\b|\bma\b|\bm\.?\s?a\b|\bmaster/.test(t)) return 4;
  if (/graduat|bachelor|\bbtech\b|\bb\.?\s?tech\b|\bbe\b|\bb\.?\s?e\b|\bbsc\b|\bb\.?\s?sc\b|\bbcom\b|\bb\.?\s?com\b|\bbca\b|\bbba\b|\bba\b|\bmbbs\b|\bllb\b|\bdegree\b/.test(t)) return 3;
  if (/\biti\b|diploma|12th|hsc|higher secondary|intermediate/.test(t)) return 2;
  if (/10th|\bssc\b|matric/.test(t)) return 1;
  if (/\b(5th|7th|8th|9th)\b|below|no formal|illiterate/.test(t)) return 0;
  return null;
}

/* ---------- the individual checks ---------- */

interface Outcome {
  /** 0 to 1 share of the check's weight earned. */
  fraction: number;
  note: string;
}

function skillsCheck(candidateSkills: string[], jobSkills: string[]): { outcome: Outcome; matched: string[]; missing: string[] } | null {
  if (jobSkills.length === 0) return null;
  const have = new Set(candidateSkills.map(skillKey));
  const matched = jobSkills.filter(js => have.has(skillKey(js)));
  const matchedKeys = new Set(matched.map(skillKey));
  const missing = jobSkills.filter(js => !matchedKeys.has(skillKey(js)));
  const fraction = matched.length / jobSkills.length;
  const note = matched.length === jobSkills.length
    ? `All ${jobSkills.length} required skills matched`
    : `${matched.length} of ${jobSkills.length} required skills matched`;
  return { outcome: { fraction, note }, matched, missing };
}

function experienceCheck(years: number, minYears: number | null | undefined, maxYears: number | null | undefined): Outcome | null {
  const min = minYears ?? null;
  const max = maxYears ?? null;
  if ((min === null || min <= 0) && max === null) return null;
  const lo = min ?? 0;
  if (max !== null && years > max) {
    // More experience than asked for: still a fit, with a small penalty per extra year
    const over = years - max;
    return { fraction: Math.max(0.6, 1 - 0.05 * over), note: `${years} yrs, more than the ${max} yrs asked for` };
  }
  if (years >= lo) return { fraction: 1, note: `${years} yrs meets the ${lo} yr minimum` };
  return { fraction: lo > 0 ? years / lo : 1, note: `${years} yrs, below the ${lo} yr minimum` };
}

function salaryCheck(expectedMin: number, jobMin: number | null | undefined, jobMax: number | null | undefined): Outcome | null {
  const jMax = jobMax || jobMin || 0;
  if (!jMax || !expectedMin || expectedMin <= 0) return null;
  if (expectedMin <= jMax) {
    return { fraction: 1, note: `Expects ₹${expectedMin.toLocaleString()}/mo, within the job's pay` };
  }
  const overRatio = (expectedMin - jMax) / jMax;
  return {
    fraction: Math.max(0, 1 - 2 * overRatio),
    note: `Expects ₹${expectedMin.toLocaleString()}/mo, above the job's ₹${jMax.toLocaleString()}/mo ceiling`,
  };
}

function locationCheck(candidate: MatchCandidate, job: MatchJob): Outcome | null {
  const jobCity = locationKey(job.city);
  const jobState = locationKey(job.state);
  if (!jobCity && !jobState) return null;
  const candCity = locationKey(candidate.city || candidate.location);
  const candState = locationKey(candidate.state);
  const relocateKnown = candidate.willing_to_relocate !== null && candidate.willing_to_relocate !== undefined;
  if (!candCity && !candState && !relocateKnown) return null;

  if (jobCity && candCity && jobCity === candCity) return { fraction: 1, note: 'Same city' };
  if (jobState && candState && jobState === candState) return { fraction: 11 / WEIGHTS.location, note: 'Same state' };
  if (candidate.willing_to_relocate) return { fraction: 6 / WEIGHTS.location, note: 'Not in the same area, but willing to relocate' };
  return { fraction: 0, note: 'Different area and not open to relocating' };
}

function jobTypeCheck(candidate: MatchCandidate, job: MatchJob): Outcome | null {
  const preferred = locationKey(candidate.preferred_job_type);
  const offered = locationKey(job.employment_type);
  if (!preferred || !offered) return null;
  return preferred === offered
    ? { fraction: 1, note: `Preferred job type (${job.employment_type}) matches` }
    : { fraction: 0, note: `Prefers ${candidate.preferred_job_type}, job is ${job.employment_type}` };
}

function qualificationCheck(candidate: MatchCandidate, job: MatchJob): Outcome | null {
  const need = job.qualification_required;
  const have = candidate.qualification;
  if (!need || !have) return null;
  const needLevel = qualificationLevel(need);
  const haveLevel = qualificationLevel(have);
  if (needLevel !== null && haveLevel !== null) {
    if (haveLevel >= needLevel) return { fraction: 1, note: `${have} meets the job's requirement` };
    const gap = needLevel - haveLevel;
    return { fraction: Math.max(0, 1 - 0.5 * gap), note: `${have} is below the job's requirement (${need})` };
  }
  // Text we cannot rank: only an exact match counts
  return locationKey(have) === locationKey(need)
    ? { fraction: 1, note: 'Qualification matches' }
    : { fraction: 0, note: `Job asks for ${need}, profile shows ${have}` };
}

/* ---------- public API ---------- */

export function computeMatch(candidate: MatchCandidate, job: MatchJob): MatchBreakdown {
  const jobSkills = job.skills_required || [];
  const skills = skillsCheck(candidate.skills || [], jobSkills);
  const experience = experienceCheck(
    candidate.total_experience_years ?? 0,
    job.experience_min_years,
    job.experience_max_years,
  );
  // An unknown experience figure is not the same as zero years
  const experienceKnown = candidate.total_experience_years !== null && candidate.total_experience_years !== undefined;
  const outcomes: Partial<Record<CheckKey, Outcome | null>> = {
    skills: skills?.outcome ?? null,
    experience: experienceKnown ? experience : null,
    salary: salaryCheck(candidate.expected_salary_min ?? 0, job.salary_min, job.salary_max),
    location: locationCheck(candidate, job),
    jobType: jobTypeCheck(candidate, job),
    qualification: qualificationCheck(candidate, job),
  };

  const checks: CheckResult[] = [];
  const unchecked: string[] = [];
  let earned = 0;
  let possible = 0;
  (Object.keys(WEIGHTS) as CheckKey[]).forEach(key => {
    const outcome = outcomes[key];
    if (!outcome) {
      unchecked.push(CHECK_LABELS[key]);
      return;
    }
    const max = WEIGHTS[key];
    const points = Math.round(outcome.fraction * max * 10) / 10;
    possible += max;
    earned += points;
    checks.push({ key, label: CHECK_LABELS[key], points, max, note: outcome.note });
  });

  const score = possible > 0 ? Math.round((100 * earned) / possible) : 0;
  const coverage = possible / 100;
  const confident = coverage >= CONFIDENT_COVERAGE;

  const pointsFor = (key: CheckKey) => checks.find(c => c.key === key)?.points ?? 0;
  const reasons = checks.map(c => c.note);
  if (unchecked.length > 0) reasons.push(`Not enough data to check: ${unchecked.join(', ')}`);

  return {
    score: Math.max(0, Math.min(100, score)),
    coverage,
    confident,
    checks,
    unchecked,
    skillsScore: pointsFor('skills'),
    experienceScore: pointsFor('experience'),
    salaryScore: pointsFor('salary'),
    locationScore: pointsFor('location'),
    jobTypeScore: pointsFor('jobType'),
    qualificationScore: pointsFor('qualification'),
    matchedSkills: skills?.matched ?? [],
    missingSkills: skills?.missing ?? [],
    reasons,
  };
}

/** "12/40" for a checked item, "Not checked" when the data was missing. */
export function checkText(breakdown: MatchBreakdown, key: CheckKey): string {
  const check = breakdown.checks.find(c => c.key === key);
  return check ? `${check.points}/${check.max}` : 'Not checked';
}

/** Groups job_skills rows as { jobId: [skill names] }. */
export function skillsByJob(rows: Array<{ job_id: string; skill_name: string }> | null | undefined): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  (rows || []).forEach(r => {
    (map[r.job_id] ||= []).push(r.skill_name);
  });
  return map;
}

export interface RankedJob<T> {
  job: T;
  match: MatchBreakdown;
}

/**
 * Scores every job for one candidate and returns the ones worth recommending,
 * best first. Jobs with too little checkable data are left out.
 */
export function rankJobs<T extends MatchJob & { id: string }>(
  candidate: MatchCandidate,
  jobs: T[],
  skillsMap: Record<string, string[]>,
): RankedJob<T>[] {
  return jobs
    .map(job => ({ job, match: computeMatch(candidate, { ...job, skills_required: skillsMap[job.id] || [] }) }))
    .filter(r => r.match.coverage >= MIN_RECOMMEND_COVERAGE)
    .sort((a, b) => b.match.score - a.match.score || b.match.coverage - a.match.coverage);
}

export function matchLabel(score: number): { label: string; tone: 'excellent' | 'good' | 'fair' | 'weak' } {
  if (score >= 80) return { label: 'Excellent Match', tone: 'excellent' };
  if (score >= 60) return { label: 'Good Match', tone: 'good' };
  if (score >= 40) return { label: 'Fair Match', tone: 'fair' };
  return { label: 'Weak Match', tone: 'weak' };
}
