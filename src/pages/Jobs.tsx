import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Search, MapPin, Building2, UserCheck, Sparkles, SlidersHorizontal,
  LayoutGrid, List, X, Filter, ChevronDown, TrendingUp, ShieldCheck, Clock, RefreshCw,
} from 'lucide-react';
import { haptic } from '../lib/haptics';
import { Button, Modal, Select, Toast } from '../components/ui';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { getOpenJobsPublic, getAllEmployers, getAllJobSkills, createApplication } from '../lib/supabase/data';
import { computeMatch, MIN_RECOMMEND_COVERAGE } from '../lib/matching';
import { JobCard, JobCardData } from '../components/JobCard';
import { locationKey, locationLabel } from '../lib/location';
import Pagination from '../components/Pagination';
import {
  JobFiltersPanel, JobFilterState, emptyFilters, countActive, buildFilterChips,
} from '../components/JobFilters';

const PAGE_SIZE = 9;

/** Lowest and highest years from "2-5 years" / "3+ years"; null when not specified. */
function experienceRange(text: string): [number, number] | null {
  const nums = (text.match(/\d+/g) || []).map(Number);
  if (nums.length === 0) return null;
  if (text.includes('+')) return [nums[0], Infinity];
  return [nums[0], nums[1] ?? nums[0]];
}

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
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rawJobs, setRawJobs] = useState<any[]>([]);
  const [employersList, setEmployersList] = useState<any[]>([]);
  const [jobSkillsMap, setJobSkillsMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const [openJobs, allEmployers] = await Promise.all([getOpenJobsPublic(), getAllEmployers()]);
        if (cancelled) return;
        setRawJobs(openJobs);
        setEmployersList(allEmployers);
        const skillsMap = await getAllJobSkills(openJobs.map((j: any) => j.id));
        if (!cancelled) setJobSkillsMap(skillsMap);
      } catch {
        // A flaky connection should offer a retry, not an empty "no jobs" page
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

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
      const result = computeMatch(candidate, { ...j, skills_required: jobSkillsMap[j.id] || [] });
      // Too little checkable data for a meaningful score: show no badge
      if (result.coverage >= MIN_RECOMMEND_COVERAGE) map.set(j.id, result.score);
    });
    return map;
  }, [isCandidateLoggedIn, candidate, rawJobs, jobSkillsMap]);

  // Search, view & sort state (synced to URL for shareable/bookmarkable searches)
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  const [selectedLocation, setSelectedLocation] = useState(() => searchParams.get('city') || '');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highestSalary' | 'lowestSalary'>('newest');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFiltersState] = useState<JobFilterState>(emptyFilters);
  const updateFilters = (patch: Partial<JobFilterState>) => setFiltersState(f => ({ ...f, ...patch }));

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedLocation) params.set('city', selectedLocation);
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedLocation]);

  // Recent searches, remembered on this device only
  const RECENT_KEY = 'rh.recentJobSearches';
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').slice(0, 6); } catch { return []; }
  });
  const [searchFocused, setSearchFocused] = useState(false);
  const rememberSearch = (term: string) => {
    const t = term.trim();
    if (t.length < 2) return;
    setRecentSearches(prev => {
      const next = [t, ...prev.filter(p => p.toLowerCase() !== t.toLowerCase())].slice(0, 6);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* blocked */ }
      return next;
    });
  };
  const clearRecent = () => {
    setRecentSearches([]);
    try { localStorage.removeItem(RECENT_KEY); } catch { /* blocked */ }
  };

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
      setToastMessage('Removed from your saved jobs');
    } else {
      updated = [...savedJobIds, jobId];
      setToastMessage('Saved. Find it any time under Saved in your dashboard.');
    }
    setSavedJobIds(updated);
    try { localStorage.setItem('rojgaarhai_saved_jobs', JSON.stringify(updated)); } catch { /* storage full or blocked */ }
  };

  const handleApplyClick = (job: any, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!isCandidateLoggedIn) {
      // Sign in, then come straight back to this search instead of the dashboard
      navigate('/login/candidate', { state: { from: { pathname: location.pathname + location.search } } });
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
      await refresh({ silent: true });
      setShowApplyModal(false);
      setToastMessage(`Applied to ${applyingJob.jobTitle} at ${applyingJob.companyName}. Track it under Applied in your dashboard.`);
      setApplyingJob(null);
    } catch (err) {
      const message = (err as { message?: string } | null)?.message;
      setToastMessage(message ? `Could not submit your application: ${message}` : 'Could not submit your application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  // Derived filter option lists from real data
  // "Mumbai", "mumbai" and " MUMBAI " are one location
  const locations = useMemo(() => {
    const byKey = new Map<string, string>();
    jobPostings.forEach(j => {
      const key = locationKey(j.city);
      if (key && !byKey.has(key)) byKey.set(key, locationLabel(j.city));
    });
    return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b));
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
        // Every word must appear somewhere, so "driver mumbai" or "welder pune" work
        const words = searchTerm.toLowerCase().split(/[\s,]+/).filter(Boolean);
        const hay = [job.jobTitle, job.companyName, job.city, ...job.skillsRequired].join(' ').toLowerCase();
        if (!words.every(w => hay.includes(w))) return false;
      }

      if (selectedLocation && locationKey(job.city) !== locationKey(selectedLocation)) return false;

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
        // Compare year ranges instead of matching text, so "1+ years" or "4-6 years" land where they should.
        // Jobs that do not state experience stay visible under every option.
        const range = experienceRange(job.experienceRequired);
        if (range) {
          const [lo, hi] = range;
          if (filters.experience === 'fresher' && lo > 1) return false;
          if (filters.experience === '1to3' && (lo > 3 || hi < 1)) return false;
          if (filters.experience === '3plus' && hi < 3) return false;
        }
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
      // Jobs without pay go last in both salary sorts (NaN would scramble the order)
      const top = (j: typeof a) => parseInt(j.salaryMax, 10) || parseInt(j.salaryMin, 10) || 0;
      const low = (j: typeof a) => parseInt(j.salaryMin, 10) || parseInt(j.salaryMax, 10) || 0;
      if (sortBy === 'highestSalary') return top(b) - top(a);
      if (sortBy === 'lowestSalary') {
        const la = low(a), lb = low(b);
        if (!la || !lb) return (lb ? 1 : 0) - (la ? 1 : 0);
        return la - lb;
      }
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
    setPage(1);
  }, [searchTerm, selectedLocation, filters, sortBy, activeTab]);

  const pageCount = Math.max(1, Math.ceil(visibleJobs.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedJobs = visibleJobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const shownTo = Math.min(currentPage * PAGE_SIZE, visibleJobs.length);
  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), pageCount));
    haptic('tap');
    document.getElementById('jobs-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // One-tap filters for the most common needs, shown as a swipeable chip row
  const quickChips = [
    {
      key: 'full', label: 'Full-time', active: filters.jobTypes.includes('Full-time'),
      toggle: () => updateFilters({ jobTypes: filters.jobTypes.includes('Full-time') ? filters.jobTypes.filter(t => t !== 'Full-time') : [...filters.jobTypes, 'Full-time'] }),
    },
    {
      key: 'part', label: 'Part-time', active: filters.jobTypes.includes('Part-time'),
      toggle: () => updateFilters({ jobTypes: filters.jobTypes.includes('Part-time') ? filters.jobTypes.filter(t => t !== 'Part-time') : [...filters.jobTypes, 'Part-time'] }),
    },
    { key: 'fresher', label: 'Freshers', active: filters.experience === 'fresher', toggle: () => updateFilters({ experience: filters.experience === 'fresher' ? '' : 'fresher' }) },
    { key: 'verified', label: 'Verified', icon: <ShieldCheck size={13} />, active: filters.verifiedOnly, toggle: () => updateFilters({ verifiedOnly: !filters.verifiedOnly }) },
    { key: 'recent', label: 'Last 7 days', icon: <Clock size={13} />, active: filters.datePosted === '7d', toggle: () => updateFilters({ datePosted: filters.datePosted === '7d' ? '' : '7d' }) },
    {
      key: 'pay', label: '₹25K+', active: filters.salaryMin === '25000' && !filters.salaryMax,
      toggle: () => updateFilters(filters.salaryMin === '25000' && !filters.salaryMax ? { salaryMin: '', salaryMax: '' } : { salaryMin: '25000', salaryMax: '' }),
    },
  ];

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
      <div className="bg-white">
        <div className="dash-container pt-5 pb-1 sm:pt-7 sm:pb-0">
          <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-[24px] sm:text-[32px] font-extrabold text-[var(--navy)] tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                <span className="sm:hidden">Find jobs</span>
                <span className="hidden sm:inline">Find Your Next Opportunity</span>
              </h1>
              <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-sm text-[var(--charcoal)]" aria-live="polite">
                {loading ? 'Loading verified openings…' : loadError ? 'Could not load jobs right now.' : (
                  <><span className="font-bold text-[var(--navy)] tabular-nums">{jobPostings.filter(j => j.status === 'Open').length.toLocaleString('en-IN')}</span> verified openings across India, updated daily.</>
                )}
              </p>
            </div>

            {isCandidateLoggedIn && (
              <div className="inline-flex bg-[var(--bg-warm)] border border-[#E7E2D9] rounded-full p-1 relative" role="tablist" aria-label="Which jobs to show">
                {/* Sliding thumb behind the selected tab */}
                <span
                  aria-hidden="true"
                  className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm border border-[#E7E2D9] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ transform: activeTab === 'forYou' ? 'translateX(100%)' : 'none' }}
                />
                <button
                  role="tab"
                  aria-selected={activeTab === 'all'}
                  onClick={() => { haptic('select'); setActiveTab('all'); }}
                  className={`relative z-10 w-[104px] py-1.5 rounded-full text-[13px] font-bold transition-colors ${activeTab === 'all' ? 'text-[var(--navy)]' : 'text-[var(--charcoal)]'}`}
                >
                  All Jobs
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'forYou'}
                  onClick={() => { haptic('select'); setActiveTab('forYou'); }}
                  className={`relative z-10 w-[104px] py-1.5 rounded-full text-[13px] font-bold transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'forYou' ? 'text-[var(--navy)]' : 'text-[var(--charcoal)]'}`}
                >
                  <Sparkles size={13} className="text-[var(--orange)]" /> For You
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dual search bar: keyword + location. A direct child of the page, so it can stick
          under the site header on phones for the whole length of the results. */}
      <div className="jobs-sticky-search bg-white border-b border-[#E7E2D9]">
          <div className="dash-container py-3 sm:pt-5 sm:pb-7">
            <form
              role="search"
              onSubmit={e => { e.preventDefault(); rememberSearch(searchTerm); (document.activeElement as HTMLElement | null)?.blur(); goToPage(1); }}
              className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:rounded-2xl sm:border sm:border-[#D8D2C6] sm:bg-white overflow-visible"
            >
              <div className="flex gap-2 sm:contents">
                <div className="relative flex-1 flex items-center">
                  <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="search"
                    inputMode="search"
                    enterKeyHint="search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => { setSearchFocused(false); rememberSearch(searchTerm); }}
                    placeholder="Job title, company or skill"
                    aria-label="Search jobs by title, company or skill"
                    autoComplete="off"
                    className="w-full pl-11 pr-10 h-12 sm:h-auto sm:py-3.5 rounded-2xl sm:rounded-r-none sm:rounded-l-[15px] border border-[#D8D2C6] sm:border-0 bg-[var(--bg-warm)] sm:bg-white text-[var(--navy)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:bg-white sm:focus:ring-0 sm:focus:bg-[var(--bg-warm)] transition-all text-sm [&::-webkit-search-cancel-button]:hidden"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      aria-label="Clear search"
                      className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-[var(--navy)] hover:bg-slate-100"
                    >
                      <X size={15} />
                    </button>
                  )}
                  {/* Recent searches: shown when the empty box is focused */}
                  {searchFocused && !searchTerm && recentSearches.length > 0 && (
                    <div className="ecm-pop absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-2xl border border-[#E7E2D9] shadow-[0_18px_40px_-16px_rgba(16,26,54,0.32)] p-2" role="listbox" aria-label="Recent searches">
                      <div className="flex items-center justify-between px-2 pt-1 pb-1.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Recent</span>
                        <button type="button" onMouseDown={e => { e.preventDefault(); clearRecent(); }} className="text-[11.5px] font-bold text-[var(--charcoal)] hover:text-[var(--orange)] px-1">Clear</button>
                      </div>
                      {recentSearches.map(term => (
                        <button
                          key={term}
                          type="button"
                          role="option"
                          aria-selected={false}
                          onMouseDown={e => { e.preventDefault(); haptic('select'); setSearchTerm(term); rememberSearch(term); (document.activeElement as HTMLElement | null)?.blur(); }}
                          className="w-full flex items-center gap-2.5 px-2.5 h-11 rounded-xl text-left text-sm font-semibold text-[var(--navy)] hover:bg-[var(--bg-warm)] active:bg-[var(--bg-warm)]"
                        >
                          <Clock size={15} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{term}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Phones: filters live right beside the search box */}
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  aria-label={`Filters${activeFilterCount ? `, ${activeFilterCount} active` : ''}`}
                  className="lg:hidden sm:hidden relative w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl border border-[#D8D2C6] bg-white text-[var(--navy)] active:scale-95 transition-transform"
                >
                  <SlidersHorizontal size={18} />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[var(--orange)] text-white text-[11px] font-extrabold flex items-center justify-center ring-2 ring-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
              <div className="hidden sm:block w-px bg-[#E7E2D9] my-2.5" />
              <div className="relative sm:w-64 flex items-center">
                <MapPin size={17} className="absolute left-4 text-slate-400 pointer-events-none z-10" />
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  aria-label="Location"
                  className="w-full pl-11 pr-8 h-11 sm:h-auto sm:py-3.5 rounded-2xl sm:rounded-none border border-[#D8D2C6] sm:border-0 bg-white text-[var(--navy)] appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--orange)] sm:focus:ring-0 sm:focus:bg-[var(--bg-warm)] text-sm cursor-pointer"
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 text-slate-400 pointer-events-none" />
              </div>
              <button type="submit" aria-label="Search" className="hidden sm:flex items-center justify-center px-6 rounded-r-[15px] bg-[var(--orange)] text-white font-bold text-sm hover:bg-[#d94d1a] transition-colors">
                <Search size={17} />
              </button>
            </form>

            {/* Quick filters */}
            <div className="ap-rail mt-3 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap lg:hidden" aria-label="Quick filters">
              {quickChips.map(chip => (
                <button
                  key={chip.key}
                  type="button"
                  aria-pressed={chip.active}
                  onClick={() => { haptic('select'); chip.toggle(); }}
                  className="ap-chip"
                >
                  {chip.icon}{chip.label}
                </button>
              ))}
            </div>
          </div>
      </div>

      <div className="dash-container py-5 sm:py-7">
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
                  className="hidden sm:inline-flex lg:hidden dash-btn dash-btn-secondary dash-btn--compact"
                >
                  <SlidersHorizontal size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
                <span className="hidden sm:inline">
                  Showing <span className="font-extrabold text-[var(--navy)] text-base">{shownTo}</span>
                  {' '}of <span className="font-extrabold text-[var(--navy)]">{visibleJobs.length}</span>{' '}
                  {visibleJobs.length === 1 ? 'job' : 'jobs'}
                </span>
                <span className="sm:hidden font-bold text-[var(--navy)] text-[14px] tabular-nums">
                  {loading ? 'Searching…' : `${visibleJobs.length.toLocaleString('en-IN')} ${visibleJobs.length === 1 ? 'job' : 'jobs'}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-white border border-[#E7E2D9] rounded-[10px] p-1">
                  <button onClick={() => setView('list')} aria-pressed={view === 'list'} aria-label="List view" className={`p-1.5 rounded-[7px] transition-colors ${view === 'list' ? 'bg-[var(--bg-warm)] text-[var(--navy)]' : 'text-slate-400 hover:text-[var(--navy)]'}`} title="List view">
                    <List size={16} />
                  </button>
                  <button onClick={() => setView('grid')} aria-pressed={view === 'grid'} aria-label="Grid view" className={`p-1.5 rounded-[7px] transition-colors ${view === 'grid' ? 'bg-[var(--bg-warm)] text-[var(--navy)]' : 'text-slate-400 hover:text-[var(--navy)]'}`} title="Grid view">
                    <LayoutGrid size={16} />
                  </button>
                </div>

                <Select
                  aria-label="Sort jobs"
                  options={[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' },
                    { value: 'highestSalary', label: 'Highest Salary' },
                    { value: 'lowestSalary', label: 'Lowest Salary' },
                  ]}
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="!py-1.5 !px-3 !pr-9 !min-h-[38px] text-[13px] w-auto font-semibold"
                />
              </div>
            </div>

            {/* Active filter chips */}
            {(chips.length > 0 || selectedLocation) && (
              <div className="ap-rail sm:flex-wrap items-center gap-2 mb-4 -mx-3 px-3 sm:mx-0 sm:px-0">
                {selectedLocation && (
                  <span className="dash-enter inline-flex items-center gap-1.5 pl-3 pr-1 py-1 bg-white border border-[#E7E2D9] rounded-full text-[12.5px] font-semibold text-[var(--navy)]">
                    <MapPin size={12} className="text-slate-400" /> {selectedLocation}
                    <button onClick={() => setSelectedLocation('')} aria-label={`Remove location ${selectedLocation}`} className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"><X size={13} /></button>
                  </span>
                )}
                {chips.map(chip => (
                  <span key={chip.key} className="dash-enter inline-flex items-center gap-1.5 pl-3 pr-1 py-1 bg-white border border-[#E7E2D9] rounded-full text-[12.5px] font-semibold text-[var(--navy)]">
                    {chip.label}
                    <button onClick={chip.onRemove} aria-label={`Remove filter ${chip.label}`} className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"><X size={13} /></button>
                  </span>
                ))}
                {hasActiveFilters && (
                  <button onClick={() => { haptic('tap'); resetFilters(); }} className="text-[12.5px] font-bold text-[var(--orange)] hover:underline ml-1 px-1 min-h-[32px] whitespace-nowrap">
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

            {/* Loading skeleton, shaped like the job cards it stands in for */}
            {loading ? (
              <div className="jobs-list dash-surface divide-y divide-[#EFEAE1]" role="status" aria-busy="true" aria-label="Loading jobs">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 sm:p-5 flex items-start sm:items-center gap-3.5">
                    <Skeleton className="w-10 h-10 rounded-[10px] flex-shrink-0" />
                    <div className="flex-1 space-y-2.5">
                      <Skeleton className="h-4 w-2/3 sm:w-1/3" />
                      <Skeleton className="h-3 w-1/2 sm:w-1/4" />
                      <div className="flex gap-1.5">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full hidden sm:block" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-24 rounded-lg hidden sm:block" />
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div className="dash-surface dash-surface--pad text-center py-12">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
                  <RefreshCw size={24} />
                </div>
                <h3 className="text-lg font-bold text-[var(--navy)]">Jobs could not load</h3>
                <p className="text-[var(--charcoal)] text-sm mt-1 max-w-sm mx-auto">Check your internet connection and try again.</p>
                <Button onClick={() => setReloadKey(k => k + 1)} className="mt-5"><RefreshCw size={15} /> Try again</Button>
              </div>
            ) : visibleJobs.length === 0 ? (
              <div className="dash-surface dash-surface--pad text-center py-12 sm:py-14">
                <div className="w-16 h-16 bg-[var(--bg-warm)] rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                  {activeTab === 'forYou' ? <Sparkles size={26} /> : searchTerm ? <Search size={26} /> : <Filter size={26} />}
                </div>
                <h3 className="text-lg font-bold text-[var(--navy)] break-words">
                  {activeTab === 'forYou'
                    ? 'No strong matches yet'
                    : searchTerm.trim()
                      ? <>No jobs for “{searchTerm.trim()}”</>
                      : 'No jobs match your filters'}
                </h3>
                <p className="text-[var(--charcoal)] text-sm mt-1 max-w-md mx-auto">
                  {activeTab === 'forYou'
                    ? 'Add your skills, experience and preferred location to your profile for sharper matches, or browse all jobs.'
                    : 'Try a shorter search, another city, or remove a filter or two.'}
                </p>
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
                  {activeTab === 'forYou' ? (
                    <Button onClick={() => setActiveTab('all')} variant="outline">See all jobs</Button>
                  ) : (
                    <Button onClick={resetFilters} variant="outline">Clear search & filters</Button>
                  )}
                </div>
              </div>
            ) : view === 'list' ? (
              <div id="jobs-results" key={currentPage} className="jobs-list dash-surface divide-y divide-[#EFEAE1] animate-fade-in scroll-mt-24">
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
              <div id="jobs-results" key={currentPage} className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in scroll-mt-24">
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

            {!loading && !loadError && (
              <Pagination page={currentPage} pageSize={PAGE_SIZE} total={visibleJobs.length} onPageChange={goToPage} label="jobs" />
            )}
          </div>
        </div>
      </div>

      {/* ═══ MOBILE FILTERS SHEET ═══ */}
      <div className="lg:hidden">
        <Modal
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          title="Filter Jobs"
          size="lg"
          footer={
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button variant="ghost" onClick={() => { haptic('tap'); setFiltersState(emptyFilters); setSelectedLocation(''); }} className="flex-shrink-0 !w-auto">
                  Reset
                </Button>
              )}
              <Button fullWidth onClick={() => setShowMobileFilters(false)} className="flex-1">
                Show {visibleJobs.length.toLocaleString('en-IN')} {visibleJobs.length === 1 ? 'job' : 'jobs'}
              </Button>
            </div>
          }
        >
          <JobFiltersPanel {...filterPanelProps} />
        </Modal>
      </div>

      {/* ═══ APPLY CONFIRMATION MODAL ═══ */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => { if (!applying) setShowApplyModal(false); }}
        title="Confirm your application"
        size="md"
        footer={applyingJob ? (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowApplyModal(false)} disabled={applying}>Cancel</Button>
            <Button onClick={handleConfirmApply} loading={applying} variant="success">
              {!applying && <UserCheck size={16} />} {applying ? 'Submitting…' : 'Confirm application'}
            </Button>
          </div>
        ) : undefined}
      >
        {applyingJob && (
          <div className="space-y-4">
            <div className="bg-[rgba(241,90,36,0.08)] rounded-2xl p-4 border border-[rgba(241,90,36,0.2)]">
              <p className="text-[11px] text-[var(--orange)] font-bold uppercase tracking-wider">Applying for</p>
              <h3 className="text-lg font-bold text-[var(--navy)] mt-0.5 break-words">{applyingJob.jobTitle}</h3>
              <p className="text-sm font-medium text-[var(--charcoal)] flex items-center gap-1.5 mt-1 min-w-0">
                <Building2 size={14} className="flex-shrink-0" />
                <span className="truncate">{[applyingJob.companyName, [applyingJob.city, applyingJob.state].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <p className="px-4 pt-3 text-[11px] text-slate-400 uppercase tracking-wider font-bold">Your profile summary</p>
              <dl className="grid grid-cols-2 gap-px bg-slate-100 mt-2 text-sm">
                {[
                  { k: 'Name', v: profile?.full_name || 'Not added' },
                  { k: 'Email', v: user?.email || 'Not added' },
                  { k: 'Qualification', v: candidate?.qualification || 'Not added' },
                  { k: 'Experience', v: `${candidate?.total_experience_years ?? 0} ${(candidate?.total_experience_years ?? 0) === 1 ? 'year' : 'years'}` },
                ].map(row => (
                  <div key={row.k} className="bg-white px-4 py-2.5 min-w-0">
                    <dt className="text-[11px] text-slate-400">{row.k}</dt>
                    <dd className="font-semibold text-[var(--navy)] truncate">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="text-xs text-[var(--charcoal)] leading-relaxed">
              Your profile and resume go straight to {applyingJob.companyName}'s hiring team. Your phone number and email stay private.
            </p>
          </div>
        )}
      </Modal>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
