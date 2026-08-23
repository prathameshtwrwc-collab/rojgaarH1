import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getProfile,
  getEmployerByUserId,
  getCandidateByUserId,
  getApprovedJobs,
  getJobsByEmployer,
  getApplicationsForCandidate,
  getMatchesForCandidate,
  getAllEmployers,
  getAllCandidates,
  getAllJobs,
  getAllMatches,
  getCommunications,
  getPlacements,
  getDashboardStats,
  getApplicationsForJobs,
  getMatchesForJobs,
  getAllCandidateSkills,
  getAllJobSkills,
  getCandidateSkills,
  getCandidateEducation,
  getCandidateExperience,
  getCandidateLanguages,
  getCandidateCertifications,
  getRecruiterByUserId,
  getAllRecruiters,
  getCandidatesReferredByRecruiter,
} from '../lib/supabase/data';

export interface DashboardStats {
  employers: number;
  candidates: number;
  jobs: number;
  matches: number;
  pendingJobs: number;
  openJobs: number;
}

interface DatabaseContextValue {
  loading: boolean;
  error: string | null;
  stats: DashboardStats | null;
  profile: any | null;
  employer: any | null;
  candidate: any | null;
  recruiter: any | null;
  recruiters: any[];
  jobs: any[];
  employers: any[];
  candidates: any[];
  applications: any[];
  matches: any[];
  communications: any[];
  placements: any[];
  jobSkills: Record<string, string[]>;
  refresh: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DatabaseContextValue['stats']>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [employer, setEmployer] = useState<any | null>(null);
  const [candidate, setCandidate] = useState<any | null>(null);
  const [recruiter, setRecruiter] = useState<any | null>(null);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [employers, setEmployers] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [communications, setCommunications] = useState<any[]>([]);
  const [placements, setPlacements] = useState<any[]>([]);
  const [jobSkills, setJobSkills] = useState<Record<string, string[]>>({});

  const loadData = async () => {
    if (!user) {
      setProfile(null);
      setEmployer(null);
      setCandidate(null);
      setRecruiter(null);
      setRecruiters([]);
      setJobs([]);
      setEmployers([]);
      setCandidates([]);
      setApplications([]);
      setMatches([]);
      setCommunications([]);
      setPlacements([]);
      setJobSkills({});
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [profileData, statsData] = await Promise.all([
        getProfile(user.id),
        getDashboardStats(),
      ]);

      setProfile(profileData);
      setStats(statsData);

      if (user.role === 'employer') {
        const [employerData, employerJobs] = await Promise.all([
          getEmployerByUserId(user.id),
          getJobsByEmployer(user.id),
        ]);
        const employerJobIds = (employerJobs || []).map((j: any) => j.id);
        const [employerApplications, employerMatches, employerPlacements, allCandidates, candidateSkillsMap, jobSkillsMap] = await Promise.all([
          getApplicationsForJobs(employerJobIds),
          getMatchesForJobs(employerJobIds),
          getPlacements({ employerId: user.id }),
          getAllCandidates(),
          getAllCandidateSkills(),
          getAllJobSkills(employerJobIds),
        ]);
        setEmployer(employerData);
        setJobs(employerJobs || []);
        setApplications(employerApplications || []);
        setMatches(employerMatches || []);
        setPlacements(employerPlacements || []);
        setCandidates((allCandidates || []).map((c: any) => ({
          ...c,
          skills: candidateSkillsMap[c.id] || [],
        })));
        setJobSkills(jobSkillsMap || {});
      } else if (user.role === 'candidate') {
        const [candidateData, candidateApplications, candidateMatches, approvedJobs, skills, education, experience, languages, certifications, allEmployers] = await Promise.all([
          getCandidateByUserId(user.id),
          getApplicationsForCandidate(user.id),
          getMatchesForCandidate(user.id),
          getApprovedJobs(),
          getCandidateSkills(user.id),
          getCandidateEducation(user.id),
          getCandidateExperience(user.id),
          getCandidateLanguages(user.id),
          getCandidateCertifications(user.id),
          getAllEmployers(),
        ]);
        const approvedJobIds = (approvedJobs || []).map((j: any) => j.id);
        const jobSkillsMap = await getAllJobSkills(approvedJobIds);
        setCandidate(candidateData ? { ...candidateData, skills, education, experience, languages, certifications } : null);
        setApplications(candidateApplications || []);
        setMatches(candidateMatches || []);
        setJobs(approvedJobs || []);
        setEmployers(allEmployers || []);
        setJobSkills(jobSkillsMap || {});
      } else if (user.role === 'recruiter') {
        const [recruiterData, referredCandidates] = await Promise.all([
          getRecruiterByUserId(user.id),
          getCandidatesReferredByRecruiter(user.id),
        ]);
        setRecruiter(recruiterData);
        setCandidates(referredCandidates || []);
      } else if (user.role === 'superadmin') {
        const [allEmployers, allCandidates, allJobs, allMatches, allPlacements, allCommunications, candidateSkillsMap, allRecruiters] = await Promise.all([
          getAllEmployers(),
          getAllCandidates(),
          getAllJobs(),
          getAllMatches(),
          getPlacements(),
          getCommunications(),
          getAllCandidateSkills(),
          getAllRecruiters(),
        ]);
        const jobIds = (allJobs || []).map((j: any) => j.id);
        const jobSkillsMap = await getAllJobSkills(jobIds);
        setEmployers(allEmployers || []);
        setCandidates((allCandidates || []).map((c: any) => ({ ...c, skills: candidateSkillsMap[c.id] || [] })));
        setJobs((allJobs || []).map((j: any) => ({ ...j, skills_required: jobSkillsMap[j.id] || [] })));
        setMatches(allMatches || []);
        setPlacements(allPlacements || []);
        setCommunications(allCommunications || []);
        setJobSkills(jobSkillsMap || {});
        setRecruiters(allRecruiters || []);
      }
    } catch (err) {
      console.error('Error loading database data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [user?.id, authLoading]);

  const value: DatabaseContextValue = {
    loading,
    error,
    stats,
    profile,
    employer,
    candidate,
    recruiter,
    recruiters,
    jobs,
    employers,
    candidates,
    applications,
    matches,
    communications,
    placements,
    jobSkills,
    refresh: loadData,
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabase() {
  const context = useContext(DatabaseContext);

  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }

  return context;
}
