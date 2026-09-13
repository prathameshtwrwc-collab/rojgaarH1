import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, Building2, UserCheck, Sparkles, SlidersHorizontal,
  LayoutGrid, List, X, Filter, ChevronDown, TrendingUp,
} from 'lucide-react';
import { Button, Modal, Select, Toast } from '../components/ui';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { getOpenJobsPublic, getAllEmployers, getAllJobSkills, createApplication } from '../lib/supabase/data';
import { computeMatch } from '../lib/matching';
import { JobCard, JobCardData } from '../components/JobCard';
import {
  JobFiltersPanel, JobFilterState, emptyFilters, countActive, buildFilterChips,
} from '../components/JobFilters';

const PAGE_SIZE = 9;

function formatExperience(min: number | null, max: number | null): string {
  if (min != null && max != null) return `${min}-${max} years`;
  if (min != null) return `${min}+ years`;
  return 'Not specified';
}

function mapJob(job: any, employer: any, skills: string[]): JobCardData {
  return {
    id: job.id,
    employerId: job.employer_id,
    jobTitle: job.job_title,
    companyName: employer?.company_name || 'Company',
    city: job.city || '',
    state: job.state || '',
    salaryMin: String(job.salary_min ?? 0),
    salaryMax: String(job.salary_max ?? 0),
    employmentType: job.employment_type,
    qualificationRequired: job.qualification_required || '',
    experienceRequired: formatExperience(job.experience_min_years, job.experience_max_years),
    skillsRequired: skills,
    jobDescription: job.job_description,
    numberOfOpenings: job.number_of_openings,
    createdAt: job.created_at,
    isVerified: job.is_verified,
    status: job.status,
  };
}

export default function Jobs() {
  const { user } = useAuth();
  const { candidate, profile, applications, refresh } = useDatabase();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rawJobs, setRawJobs] = useState<any[]>([]);
  const [employersList, setEmployersList] = useState<any[]>([]);
  const [jobSkillsMap, setJobSkillsMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [openJobs, allEmployers] = await Promise.all([getOpenJobsPublic(), getAllEmployers()]);
      setRawJobs(openJobs);
      setEmployersList(allEmployers);
      const skillsMap = await getAllJobSkills(openJobs.map((j: any) => j.id));
      setJobSkillsMap(skillsMap);
      setLoading(false);
    })();
  }, []);

  const employersMap = useMemo(() => new Map(employersList.map((e: any) => [e.id, e])), [employersList]);
  const jobPostings = useMemo(
    () => rawJobs.map(j => mapJob(j, employersMap.get(j.employer_id), jobSkillsMap[j.id] || [])),
    [rawJobs, employersMap, jobSkillsMap]
  );

  const isCandidateLoggedIn = user?.role === 'candidate';
  const appliedJobIds = useMemo(() => new Set(applications.map((a: any) => a.job_id)), [applications]);

  const [activeTab, setActiveTab] = useState<'all' | 'forYou'>('all');

  const matchScores = useMemo(() => {
    const map = new Map<string, number>();
    if (!isCandidateLoggedIn || !candidate) return map;
    rawJobs.forEach((j: any) => {
      const { score } = computeMatch(candidate, { ...j, skills_required: jobSkillsMap[j.id] || [] });
      map.set(j.id, score);
    });
    return map;
  }, [isCandidateLoggedIn, candidate, rawJobs, jobSkillsMap]);

  // Search, view & sort state (synced to URL for shareable/bookmarkable searches)
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  const [selectedLocation, setSelectedLocation] = useState(() => searchParams.get('city') || '');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highestSalary' | 'lowestSalary'>('newest');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [filters, setFiltersState] = useState<JobFilterState>(emptyFilters);
  const updateFilters = (patch: Partial<JobFilterState>) => setFiltersState(f => ({ ...f, ...patch }));

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedLocation) params.set('city', selectedLocation);
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedLocation]);

  // Bookmarked Jobs
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('rojgaarhai_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });

  // Apply Modal State
  const [applyingJob, setApplyingJob] = useState<any | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const toggleSaveJob = (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let updated: string[];
    if (savedJobIds.includes(jobId)) {
      updated = savedJobIds.filter(id => id !== jobId);
      setToastMessage('Job removed from saved list');
    } else {
      updated = [...savedJobIds, jobId];
      setToastMessage('Job saved successfully!');
    }
    setSavedJobIds(updated);
    localStorage.setItem('rojgaarhai_saved_jobs', JSON.stringify(updated));
  };

  const handleApplyClick = (job: any, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!isCandidateLoggedIn) {
      navigate('/login/candidate');
      return;
    }
    setApplyingJob(job);
    setShowApplyModal(true);
  };

  const handleConfirmApply = async () => {
    if (!applyingJob || !user) return;
    setApplying(true);
    try {
      await createApplication({ candidate_id: user.id, job_id: applyingJob.id, status: 'applied' } as any);
      await refresh();
      setShowApplyModal(false);
      setToastMessage(`Your application for ${applyingJob.jobTitle} at ${applyingJob.companyName} has been submitted successfully!`);
      setApplyingJob(null);
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  // Derived filter option lists from real data
  const locations = useMemo(() => {
    const set = new Set<string>();
    jobPostings.forEach(j => j.city && set.add(j.city));
    return Array.from(set).sort();
  }, [jobPostings]);

  const industries = useMemo(() => {
    const set = new Set<string>();
    jobPostings.forEach(j => {
      const emp = employersMap.get(j.employerId);
      if (emp?.industry) set.add(emp.industry);
    });
    return Array.from(set).sort();
  }, [jobPostings, employersMap]);

  const topSkills = useMemo(() => {
    const freq = new Map<string, number>();
    jobPostings.forEach(j => j.skillsRequired.forEach(s => freq.set(s, (freq.get(s) || 0) + 1)));
    return Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([s]) => s);
  }, [jobPostings]);

  const educationBucketMatch = (bucket: string, qualification: string) => {
    if (bucket === '10th-12th') return ['10th Pass', '12th Pass'].includes(qualification);
    if (bucket === 'ITI-Diploma') return ['ITI', 'Diploma', 'ITI Welder', 'ITI Electrician', 'Diploma Civil'].includes(qualification);
    if (bucket === 'Graduate') return ['B.Com', 'B.Sc', 'B.Sc Agriculture', 'B.Sc Nursing', 'B.Tech/BCA', 'BA', 'BBA', 'B.Pharm/D.Pharm'].includes(qualification);
    if (bucket === 'Post-Graduate') return ['MBA', 'MBA / BBA', 'M.Sc', 'M.Com'].includes(qualification);
    return false;
  };

  // Filtered & Sorted Jobs
  const filteredJobs = useMemo(() => {
    return jobPostings.filter(job => {
      if (job.status !== 'Open') return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = job.jobTitle.toLowerCase().includes(query);
        const matchesCompany = job.companyName.toLowerCase().includes(query);
        const matchesSkill = job.skillsRequired.some(s => s.toLowerCase().includes(query));
        const matchesCity = job.city.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCompany && !matchesSkill && !matchesCity) return false;
      }

      if (selectedLocation && job.city !== selectedLocation) return false;

      if (filters.jobTypes.length && !filters.jobTypes.includes(job.employmentType)) return false;

      if (filters.education.length && !filters.education.some(b => educationBucketMatch(b, job.qualificationRequired))) return false;

      if (filters.industries.length) {
        const emp = employersMap.get(job.employerId);
        if (!emp?.industry || !filters.industries.includes(emp.industry)) return false;
      }

      if (filters.skills.length && !job.skillsRequired.some(s => filters.skills.includes(s))) return false;

      if (filters.verifiedOnly && job.isVerified === false) return false;

      if (filters.salaryMin) {
        if (parseInt(job.salaryMax || '0') < parseInt(filters.salaryMin)) return false;
      }
      if (filters.salaryMax) {
        if (parseInt(job.salaryMin || '0') > parseInt(filters.salaryMax)) return false;
      }

      if (filters.experience) {
        if (filters.experience === 'fresher' && !job.experienceRequired.includes('0-')) return false;
        if (filters.experience === '1to3' && !job.experienceRequired.includes('1-') && !job.experienceRequired.includes('2-')) return false;
        if (filters.experience === '3plus' && !job.experienceRequired.includes('3-') && !job.experienceRequired.includes('5-')) return false;
      }

      if (filters.datePosted) {
        const daysMap: Record<string, number> = { '24h': 1, '3d': 3, '7d': 7, '30d': 30 };
        const days = daysMap[filters.datePosted] ?? 0;
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        if (new Date(job.createdAt).getTime() < cutoff) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'highestSalary') return parseInt(b.salaryMax) - parseInt(a.salaryMax);
      if (sortBy === 'lowestSalary') return parseInt(a.salaryMin) - parseInt(b.salaryMin);
      return 0;
    });
  }, [jobPostings, employersMap, searchTerm, selectedLocation, filters, sortBy]);

  const visibleJobs = useMemo(() => {
    if (activeTab !== 'forYou') return filteredJobs;
    return [...filteredJobs]
      .filter(j => (matchScores.get(j.id) || 0) >= 30)
      .sort((a, b) => (matchScores.get(b.id) || 0) - (matchScores.get(a.id) || 0));
  }, [filteredJobs, activeTab, matchScores]);

  // Reset pagination whenever the active query changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedLocation, filters, sortBy, activeTab]);

  const pagedJobs = visibleJobs.slice(0, visibleCount);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setFiltersState(emptyFilters);
    setSortBy('newest');
  };

  const activeFilterCount = countActive(filters) + (selectedLocation ? 1 : 0);
  const hasActiveFilters = Boolean(searchTerm || activeFilterCount > 0);
  const chips = buildFilterChips(filters, updateFilters);

  const filterPanelProps = { filters, onChange: updateFilters, industries, skillOptions: topSkills, onReset: () => setFiltersState(emptyFilters) };

  return (
    <div className="min-h-screen bg-[var(--bg-warm)] transition-colors duration-300" style={{ fontFamily: 'var(--font)' }}>

      {/* ═══ PAGE HEADER ═══ */}
      <div className="border-b border-[#E7E2D9] bg-white">
        <div className="dash-container py-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[26px] sm:text-[32px] font-extrabold text-[var(--navy)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Find Your Next Opportunity
              </h1>
              <p className="mt-1.5 text-[13.5px] sm:text-sm text-[var(--charcoal)]">
                {loading ? 'Loading verified openings…' : (
                  <><span className="font-bold text-[var(--navy)]">{jobPostings.filter(j => j.status === 'Open').length.toLocaleString()}</span> verified job openings across India, updated daily.</>
                )}
              </p>
            </div>

            {isCandidateLoggedIn && (
              <div className="inline-flex bg-[var(--bg-warm)] border border-[#E7E2D9] rounded-full p-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${activeTab === 'all' ? 'bg-white text-[var(--navy)] shadow-sm border border-[#E7E2D9]' : 'text-[var(--charcoal)]'}`}
                >
                  All Jobs
                </button>
                <button
                  onClick={() => setActiveTab('forYou')}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors flex items-center gap-1.5 ${activeTab === 'forYou' ? 'bg-white text-[var(--navy)] shadow-sm border border-[#E7E2D9]' : 'text-[var(--charcoal)]'}`}
                >
                  <Sparkles size={13} className="text-[var(--orange)]" /> For You
                </button>
              </div>
            )}
          </div>

          {/* Dual search bar: keyword + location */}
          <div className="mt-5 flex flex-col sm:flex-row gap-2.5 sm:gap-0 sm:rounded-2xl sm:border sm:border-[#D8D2C6] sm:bg-white overflow-visible sm:overflow-hidden">
            <div className="relative flex-1 flex items-center">
              <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Job title, company, or skill (e.g. CNC Operator, Tally)"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl sm:rounded-none border border-[#D8D2C6] sm:border-0 bg-white text-[var(--navy)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--orange)] sm:focus:ring-0 sm:focus:bg-[var(--bg-warm)] transition-all text-sm"
              />
            </div>
            <div className="hidden sm:block w-px bg-[#E7E2D9] my-2.5" />
            <div className="relative sm:w-64 flex items-center">
              <MapPin size={17} className="absolute left-4 text-slate-400 pointer-events-none z-10" />
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="w-full pl-11 pr-8 py-3.5 rounded-2xl sm:rounded-none border border-[#D8D2C6] sm:border-0 bg-white text-[var(--navy)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--orange)] sm:focus:ring-0 sm:focus:bg-[var(--bg-warm)] text-sm cursor-pointer"
              >
                <option value="">All Locations</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 text-slate-400 pointer-events-none" />
            </div>
            <button className="hidden sm:flex items-center justify-center px-6 bg-[var(--orange)] text-white font-bold text-sm hover:bg-[#d94d1a] transition-colors">
              <Search size={17} />
            </button>
          </div>
        </div>
      </div>

      <div className="dash-container py-7">
        <div className="grid lg:grid-cols-[260px_1fr] gap-7 items-start">

          {/* ═══ DESKTOP SIDEBAR FILTERS ═══ */}
          <aside className="hidden lg:block sticky top-[92px] dash-surface dash-surface--pad max-h-[calc(100vh-112px)] overflow-y-auto" data-lenis-prevent>
            <JobFiltersPanel {...filterPanelProps} />
          </aside>

          {/* ═══ MAIN CONTENT ═══ */}
          <div className="min-w-0">

            {/* Results toolbar */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2 text-[13px] text-[var(--charcoal)]">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden dash-btn dash-btn-secondary dash-btn--compact"
                >
                  <SlidersHorizontal size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
                <span className="hidden sm:inline">
                  Showing <span className="font-extrabold text-[var(--navy)] text-base">{Math.min(visibleCount, visibleJobs.length)}</span>
                  {' '}of <span className="font-extrabold text-[var(--navy)]">{visibleJobs.length}</span>{' '}
                  {visibleJobs.length === 1 ? 'job' : 'jobs'}
                </span>
                <span className="sm:hidden font-semibold text-[var(--navy)]">
                  {Math.min(visibleCount, visibleJobs.length)}/{visibleJobs.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-white border border-[#E7E2D9] rounded-[10px] p-1">
                  <button onClick={() => setView('list')} className={`p-1.5 rounded-[7px] ${view === 'list' ? 'bg-[var(--bg-warm)] text-[var(--navy)]' : 'text-slate-400'}`} title="List view">
                    <List size={16} />
                  </button>
                  <button onClick={() => setView('grid')} className={`p-1.5 rounded-[7px] ${view === 'grid' ? 'bg-[var(--bg-warm)] text-[var(--navy)]' : 'text-slate-400'}`} title="Grid view">
                    <LayoutGrid size={16} />
                  </button>
                </div>

                <Select
                  options={[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' },
                    { value: 'highestSalary', label: 'Highest Salary' },
                    { value: 'lowestSalary', label: 'Lowest Salary' },
                  ]}
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="!py-1.5 !px-3 text-xs sm:text-[13px] w-auto"
                />
              </div>
            </div>

            {/* Active filter chips */}
            {(chips.length > 0 || selectedLocation) && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {selectedLocation && (
                  <span className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-white border border-[#E7E2D9] rounded-full text-[12.5px] font-semibold text-[var(--navy)]">
                    <MapPin size={12} className="text-slate-400" /> {selectedLocation}
                    <button onClick={() => setSelectedLocation('')} className="text-slate-400 hover:text-red-500"><X size={13} /></button>
                  </span>
                )}
                {chips.map(chip => (
                  <span key={chip.key} className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-white border border-[#E7E2D9] rounded-full text-[12.5px] font-semibold text-[var(--navy)]">
                    {chip.label}
                    <button onClick={chip.onRemove} className="text-slate-400 hover:text-red-500"><X size={13} /></button>
                  </span>
                ))}
                {hasActiveFilters && (
                  <button onClick={resetFilters} className="text-[12.5px] font-bold text-[var(--orange)] hover:underline ml-1">
                    Clear all
                  </button>
                )}
              </div>
            )}

            {activeTab === 'forYou' && (
              <p className="text-[12.5px] text-[var(--charcoal)] mb-4 flex items-center gap-1.5">
                <TrendingUp size={13} className="text-[var(--orange)]" /> Matched to your skills, experience, salary expectation & location.
              </p>
            )}

            {/* Loading skeleton */}
            {loading ? (
              <div className="dash-surface divide-y divide-[#EFEAE1]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-5 flex items-center gap-4">
                    <Skeleton className="w-11 h-11 rounded-[10px] flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-lg hidden sm:block" />
                  </div>
                ))}
              </div>
            ) : visibleJobs.length === 0 ? (
              <div className="dash-surface dash-surface--pad text-center py-14">
                <div className="w-16 h-16 bg-[var(--bg-warm)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Filter size={28} />
                </div>
                <h3 className="text-lg font-bold text-[var(--navy)]">
                  {activeTab === 'forYou' ? 'No strong matches yet' : 'No jobs match your criteria'}
                </h3>
                <p className="text-[var(--charcoal)] text-sm mt-1 max-w-md mx-auto">
                  {activeTab === 'forYou'
                    ? 'Complete your profile with skills and preferences to get better matches, or browse All Jobs.'
                    : 'Try adjusting your search terms or clearing some filters to see more available opportunities.'}
                </p>
                <Button onClick={resetFilters} variant="outline" className="mt-5">Reset Filters</Button>
              </div>
            ) : view === 'list' ? (
              <div key={visibleCount} className="dash-surface divide-y divide-[#EFEAE1] animate-fade-in">
                {pagedJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    view="list"
                    isSaved={savedJobIds.includes(job.id)}
                    isApplied={appliedJobIds.has(job.id)}
                    matchScore={matchScores.get(job.id)}
                    onToggleSave={toggleSaveJob}
                    onApply={handleApplyClick}
                  />
                ))}
              </div>
            ) : (
              <div key={visibleCount} className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
                {pagedJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    view="grid"
                    isSaved={savedJobIds.includes(job.id)}
                    isApplied={appliedJobIds.has(job.id)}
                    matchScore={matchScores.get(job.id)}
                    onToggleSave={toggleSaveJob}
                    onApply={handleApplyClick}
                  />
                ))}
              </div>
            )}

            {!loading && visibleJobs.length > visibleCount && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="dash-btn dash-btn-secondary"
                >
                  Load {Math.min(PAGE_SIZE, visibleJobs.length - visibleCount)} More Jobs
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MOBILE FILTERS DRAWER ═══ */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[min(88vw,360px)] bg-[var(--bg-warm)] shadow-2xl flex flex-col animate-slide-in">
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#E7E2D9] bg-white">
              <h3 className="font-extrabold text-[var(--navy)]">Filter Jobs</h3>
              <button onClick={() => setShowMobileFilters(false)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5" data-lenis-prevent>
              <JobFiltersPanel {...filterPanelProps} />
            </div>
            <div className="flex-shrink-0 p-4 border-t border-[#E7E2D9] bg-white">
              <Button fullWidth onClick={() => setShowMobileFilters(false)}>
                Show {visibleJobs.length} Jobs
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ APPLY CONFIRMATION MODAL ═══ */}
      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Confirm Your Application" size="md">
        {applyingJob && (
          <div className="space-y-5">
            <div className="bg-[rgba(241,90,36,0.1)] rounded-xl p-4 border border-[rgba(241,90,36,0.2)]">
              <p className="text-xs text-[var(--orange)] font-semibold uppercase tracking-wider">Applying For</p>
              <h3 className="text-lg font-bold text-[var(--navy)] mt-0.5">{applyingJob.jobTitle}</h3>
              <p className="text-sm font-medium text-[var(--charcoal)] flex items-center gap-1 mt-1">
                <Building2 size={14} /> {applyingJob.companyName} • {applyingJob.city}, {applyingJob.state}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Candidate Profile Summary</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Name</p>
                  <p className="font-semibold text-[var(--navy)]">{profile?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="font-semibold text-[var(--navy)] truncate">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Qualification</p>
                  <p className="font-semibold text-[var(--navy)]">{candidate?.qualification || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Experience</p>
                  <p className="font-semibold text-[var(--navy)]">{candidate?.total_experience_years ?? 0} years</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--charcoal)] leading-relaxed">
              Your profile information and uploaded resume will be shared directly with {applyingJob.companyName}'s hiring team.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowApplyModal(false)}>Cancel</Button>
              <Button onClick={handleConfirmApply} disabled={applying} variant="success" className="gap-1.5">
                <UserCheck size={16} /> {applying ? 'Submitting...' : 'Confirm Application'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {toastMessage && <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />}
    </div>
  );
}
