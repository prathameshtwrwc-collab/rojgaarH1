import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, IndianRupee, Clock, ShieldCheck, Bookmark, ArrowRight, X, Filter, CheckCircle, GraduationCap, Building2, UserCheck, Sparkles } from 'lucide-react';
import { Badge, Button, Modal, Select, Toast } from '../components/ui';
import { useData, JobPosting } from '../context/DataContext';

export default function Jobs() {
  const { jobPostings, isCandidateLoggedIn, loggedCandidate, applyToJob, employers } = useData();
  const navigate = useNavigate();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedSalary, setSelectedSalary] = useState('');
  const [selectedEducation, setSelectedEducation] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highestSalary' | 'lowestSalary'>('newest');

  // Bookmarked Jobs
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('rojgaarhai_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });

  // Apply Modal State
  const [applyingJob, setApplyingJob] = useState<JobPosting | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleApplyClick = (job: JobPosting, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!isCandidateLoggedIn) {
      navigate('/login/candidate');
      return;
    }
    setApplyingJob(job);
    setShowApplyModal(true);
  };

  const handleConfirmApply = () => {
    if (applyingJob && loggedCandidate) {
      applyToJob(applyingJob.id, loggedCandidate.id);
      setShowApplyModal(false);
      setToastMessage(`Your application for ${applyingJob.jobTitle} at ${applyingJob.companyName} has been submitted successfully!`);
      setApplyingJob(null);
    }
  };

  // Filter Options Data
  const locations = useMemo(() => {
    const set = new Set<string>();
    jobPostings.forEach(j => set.add(j.city));
    return Array.from(set).sort();
  }, [jobPostings]);

  const industries = useMemo(() => {
    const set = new Set<string>();
    jobPostings.forEach(j => {
      const emp = employers.find(e => e.id === j.employerId);
      if (emp?.industry) set.add(emp.industry);
    });
    return Array.from(set).sort();
  }, [jobPostings, employers]);

  // Filtered & Sorted Jobs
  const filteredJobs = useMemo(() => {
    return jobPostings.filter(job => {
      if (job.status !== 'Open') return false;

      // Text Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = job.jobTitle.toLowerCase().includes(query);
        const matchesCompany = job.companyName.toLowerCase().includes(query);
        const matchesSkill = job.skillsRequired.some(s => s.toLowerCase().includes(query));
        const matchesCity = job.city.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCompany && !matchesSkill && !matchesCity) return false;
      }

      // Location
      if (selectedLocation && job.city !== selectedLocation) return false;

      // Job Type
      if (selectedJobType && job.employmentType !== selectedJobType) return false;

      // Education
      if (selectedEducation) {
        if (selectedEducation === '10th-12th' && !['10th Pass', '12th Pass'].includes(job.qualificationRequired)) return false;
        if (selectedEducation === 'ITI-Diploma' && !['ITI', 'Diploma', 'ITI Welder', 'ITI Electrician', 'Diploma Civil'].includes(job.qualificationRequired)) return false;
        if (selectedEducation === 'Graduate' && !['B.Com', 'B.Sc', 'B.Sc Agriculture', 'B.Sc Nursing', 'B.Tech/BCA', 'BA', 'BBA', 'B.Pharm/D.Pharm'].includes(job.qualificationRequired)) return false;
        if (selectedEducation === 'Post-Graduate' && !['MBA', 'MBA / BBA', 'M.Sc', 'M.Com'].includes(job.qualificationRequired)) return false;
      }

      // Industry
      if (selectedIndustry) {
        const emp = employers.find(e => e.id === job.employerId);
        if (emp?.industry !== selectedIndustry) return false;
      }

      // Salary Range
      if (selectedSalary) {
        const minVal = parseInt(job.salaryMin);
        if (selectedSalary === 'under15' && minVal >= 15000) return false;
        if (selectedSalary === '15to20' && (minVal < 15000 || minVal > 20000)) return false;
        if (selectedSalary === '20to25' && (minVal < 20000 || minVal > 25000)) return false;
        if (selectedSalary === '25plus' && minVal < 25000) return false;
      }

      // Experience
      if (selectedExperience) {
        if (selectedExperience === 'fresher' && !job.experienceRequired.includes('0-')) return false;
        if (selectedExperience === '1to3' && !job.experienceRequired.includes('1-') && !job.experienceRequired.includes('2-')) return false;
        if (selectedExperience === '3plus' && !job.experienceRequired.includes('3-') && !job.experienceRequired.includes('5-')) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'highestSalary') return parseInt(b.salaryMax) - parseInt(a.salaryMax);
      if (sortBy === 'lowestSalary') return parseInt(a.salaryMin) - parseInt(b.salaryMin);
      return 0;
    });
  }, [jobPostings, employers, searchTerm, selectedLocation, selectedJobType, selectedSalary, selectedExperience, selectedEducation, selectedIndustry, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedExperience('');
    setSelectedJobType('');
    setSelectedSalary('');
    setSelectedEducation('');
    setSelectedIndustry('');
    setSortBy('newest');
  };

  const hasActiveFilters = Boolean(searchTerm || selectedLocation || selectedExperience || selectedJobType || selectedSalary || selectedEducation || selectedIndustry);

  return (
    <div className="min-h-screen bg-[var(--bg-warm)] py-10 transition-colors duration-300" style={{ fontFamily: "var(--font)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--navy)] tracking-tight">
            Find Your Next Opportunity
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[var(--charcoal)] leading-relaxed">
            Browse the latest verified job openings across India and apply directly in seconds.
          </p>
        </div>

        {/* ═══ SEARCH & FILTERS CONTAINER ═══ */}
        <div className="card-landing p-5 sm:p-6 mb-8">
          
          {/* Main Search Bar */}
          <div className="relative mb-5">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by job title, company name, skill (e.g. Machine Operator, CNC, Tally)..."
              className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-slate-300 bg-slate-50 text-[var(--navy)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--orange)] transition-all text-sm sm:text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            {/* Location Filter */}
            <Select
              options={[{ value: '', label: 'All Locations' }, ...locations.map(loc => ({ value: loc, label: loc }))]}
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="text-xs sm:text-sm !py-2"
            />

            {/* Job Type Filter */}
            <Select
              options={[
                { value: '', label: 'All Job Types' },
                { value: 'Full-time', label: 'Full Time' },
                { value: 'Part-time', label: 'Part Time' },
                { value: 'Contract', label: 'Contract' },
                { value: 'Internship', label: 'Internship' },
              ]}
              value={selectedJobType}
              onChange={e => setSelectedJobType(e.target.value)}
              className="text-xs sm:text-sm !py-2"
            />

            {/* Experience Filter */}
            <Select
              options={[
                { value: '', label: 'All Experience' },
                { value: 'fresher', label: 'Freshers (0-1 yr)' },
                { value: '1to3', label: '1 - 3 Years' },
                { value: '3plus', label: '3+ Years' },
              ]}
              value={selectedExperience}
              onChange={e => setSelectedExperience(e.target.value)}
              className="text-xs sm:text-sm !py-2"
            />

            {/* Salary Range Filter */}
            <Select
              options={[
                { value: '', label: 'All Salaries' },
                { value: 'under15', label: 'Under ₹15,000' },
                { value: '15to20', label: '₹15,000 - ₹20,000' },
                { value: '20to25', label: '₹20,000 - ₹25,000' },
                { value: '25plus', label: '₹25,000+' },
              ]}
              value={selectedSalary}
              onChange={e => setSelectedSalary(e.target.value)}
              className="text-xs sm:text-sm !py-2"
            />

            {/* Education Filter */}
            <Select
              options={[
                { value: '', label: 'All Education' },
                { value: '10th-12th', label: '10th / 12th Pass' },
                { value: 'ITI-Diploma', label: 'ITI / Diploma' },
                { value: 'Graduate', label: 'Graduate' },
                { value: 'Post-Graduate', label: 'Post-Graduate' },
              ]}
              value={selectedEducation}
              onChange={e => setSelectedEducation(e.target.value)}
              className="text-xs sm:text-sm !py-2"
            />

            {/* Industry Filter */}
            <Select
              options={[{ value: '', label: 'All Industries' }, ...industries.map(ind => ({ value: ind, label: ind }))]}
              value={selectedIndustry}
              onChange={e => setSelectedIndustry(e.target.value)}
              className="text-xs sm:text-sm !py-2"
            />
          </div>

          {/* Sorting & Filter Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-semibold text-[var(--navy)] text-base">{filteredJobs.length}</span>
              <span>{filteredJobs.length === 1 ? 'job available' : 'jobs available'}</span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="ml-3 text-[var(--orange)] font-medium hover:underline flex items-center gap-1"
                >
                  <X size={14} /> Clear all filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
              <Select
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                  { value: 'highestSalary', label: 'Highest Salary' },
                  { value: 'lowestSalary', label: 'Lowest Salary' },
                ]}
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="!py-1.5 !px-3 text-xs sm:text-sm w-auto"
              />
            </div>
          </div>
        </div>

        {/* ═══ JOBS GRID ═══ */}
        {filteredJobs.length === 0 ? (
          <div className="card-landing p-12 text-center my-8 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Filter size={32} />
            </div>
            <h3 className="text-xl font-bold text-[var(--navy)]">No jobs match your criteria</h3>
            <p className="text-[var(--charcoal)] text-sm mt-1 max-w-md mx-auto">
              Try adjusting your search terms or clearing some filters to see more available opportunities.
            </p>
            <Button onClick={resetFilters} variant="outline" className="mt-5">
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => {
              const isSaved = savedJobIds.includes(job.id);
              const isApplied = loggedCandidate ? job.applicants.includes(loggedCandidate.id) : false;

              return (
                <div
                  key={job.id}
                  className="card-landing transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                >
                  <div className="p-6">
                    {/* Top Row: Verification + Bookmark */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="info" className="text-[11px] font-semibold px-2.5 py-0.5">
                          {job.employmentType}
                        </Badge>
                        {job.isVerified !== false && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--green)] bg-[rgba(13,96,74,0.06)] border border-[rgba(13,96,74,0.2)] px-2 py-0.5 rounded-full">
                            <ShieldCheck size={12} /> Verified
                          </span>
                        )}
                      </div>

                      {/* Bookmark Icon */}
                      <button
                        onClick={e => toggleSaveJob(job.id, e)}
                        title={isSaved ? 'Remove from saved' : 'Save job'}
                        className={`p-2 rounded-xl border transition-colors ${
                          isSaved
                            ? 'bg-[rgba(241,90,36,0.1)] border-[rgba(241,90,36,0.2)] text-[var(--orange)]'
                            : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Bookmark size={16} className={isSaved ? 'fill-[var(--orange)]' : ''} />
                      </button>
                    </div>

                    {/* Job Title & Company */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-[var(--orange)] to-[#d94d1a] text-white rounded-xl flex items-center justify-center font-extrabold text-base flex-shrink-0 shadow-sm">
                        {job.companyName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="font-bold text-lg text-[var(--navy)] group-hover:text-[var(--orange)] transition-colors line-clamp-1 block"
                        >
                          {job.jobTitle}
                        </Link>
                        <p className="text-xs text-[var(--charcoal)] font-medium truncate mt-0.5">
                          {job.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-[var(--charcoal)] bg-slate-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{job.city}, {job.state}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate font-semibold text-[var(--green)]">
                        <IndianRupee size={14} className="flex-shrink-0" />
                        <span>₹{parseInt(job.salaryMin).toLocaleString()} - ₹{parseInt(job.salaryMax).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Briefcase size={14} className="text-slate-400 flex-shrink-0" />
                        <span>{job.experienceRequired}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <GraduationCap size={14} className="text-slate-400 flex-shrink-0" />
                        <span>{job.qualificationRequired}</span>
                      </div>
                    </div>

                    {/* Description Snippet */}
                    <p className="text-xs sm:text-sm text-[var(--charcoal)] line-clamp-2 leading-relaxed mb-4">
                      {job.jobDescription}
                    </p>

                    {/* Skills Required Chips */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.skillsRequired.slice(0, 3).map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skillsRequired.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[11px] font-medium">
                          +{job.skillsRequired.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      <span>{job.numberOfOpenings} openings</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/jobs/${job.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs font-semibold">
                          Details
                        </Button>
                      </Link>

                      {isApplied ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--green)] bg-[rgba(13,96,74,0.06)] px-3 py-1.5 rounded-lg border border-[rgba(13,96,74,0.2)]">
                          <CheckCircle size={14} /> Applied
                        </span>
                      ) : (
                      <Button
                        size="sm"
                        onClick={e => handleApplyClick(job, e)}
                        className="text-xs font-semibold gap-1 bg-[var(--orange)]"
                      >
                        Apply Now <ArrowRight size={12} />
                      </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ APPLY CONFIRMATION MODAL ═══ */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Confirm Your Application"
        size="md"
      >
        {applyingJob && loggedCandidate && (
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
                  <p className="font-semibold text-[var(--navy)]">{loggedCandidate.firstName} {loggedCandidate.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="font-semibold text-[var(--navy)] truncate">{loggedCandidate.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Qualification</p>
                  <p className="font-semibold text-[var(--navy)]">{loggedCandidate.qualification}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Experience</p>
                  <p className="font-semibold text-[var(--navy)]">{loggedCandidate.totalExperience} years</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--charcoal)] leading-relaxed">
              Your profile information and uploaded resume will be shared directly with {applyingJob.companyName}'s hiring team.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmApply} variant="success" className="gap-1.5">
                <UserCheck size={16} /> Confirm Application
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
