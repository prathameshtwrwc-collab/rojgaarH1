import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, Briefcase, Users, MapPin, FileText, LogOut, ArrowRight, Eye, IndianRupee,
  CheckCircle, Plus, ShieldCheck, Star, ChevronDown, ChevronUp, Search,
  TrendingUp, Download, Clock, Copy, Share2, PauseCircle,
  XCircle, MessageSquare, Video, AlertCircle
} from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Activity03Icon } from '@hugeicons/core-free-icons';
import { Card, Badge, Button, Modal, Toast } from '../../components/ui';
import { useData, JobSeeker, JobPosting } from '../../context/DataContext';

function EmployerLogin() {
  const { employerLogin } = useData();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const demoEmails = [
    { email: 'sanjay@bharatmfg.com', name: 'Sanjay Mehta', category: 'Bharat Mfg.' },
    { email: 'rohit@techrural.com', name: 'Rohit Agarwal', category: 'TechRural' },
    { email: 'krao@metrohospital.org', name: 'Dr. K. Rao', category: 'Metro Hospital' },
    { email: 'kapil@northernsteel.in', name: 'Kapil Sharma', category: 'Northern Steel' },
  ];

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (employerLogin(email)) {
      navigate('/dashboard/employer');
    } else {
      setError('Employer not found. Select a demo account below.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[var(--bg-warm)] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16" style={{ fontFamily: 'var(--font)' }}>
      <div className="w-full max-w-[460px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--navy)]/10 text-[var(--navy)] mb-4">
            <Building2 size={28} />
          </div>
          <h1 className="text-[32px] sm:text-[36px] font-extrabold text-[var(--navy)] tracking-tight leading-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Employer Portal
          </h1>
          <p className="text-base text-[var(--charcoal)] leading-relaxed">
            Sign in to manage job postings and your hiring pipeline
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[15px] font-semibold text-[var(--navy)] mb-2">
                Contact Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="your@company.com"
                className="w-full px-4 h-[50px] rounded-xl border border-slate-300 focus:ring-2 focus:ring-[rgba(241,90,36,0.2)] focus:border-[var(--orange)] focus:outline-none text-[15px] bg-white text-[var(--navy)] placeholder:text-[var(--charcoal)]"
              />
            </div>
            {error && (
              <p className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            <Button
              type="submit"
              fullWidth
              size="lg"
              className="bg-[var(--orange)] text-white font-bold rounded-full h-[50px] text-[15px] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Sign in to Workspace
            </Button>
          </form>

          <div className="mt-7 pt-6 border-t border-slate-200">
            <p className="text-sm font-semibold text-[var(--navy)] mb-1">Demo one-click accounts</p>
            <p className="text-xs text-[var(--charcoal)] mb-4">Preview the employer workspace using a demo profile.</p>
            <div className="space-y-2">
              {demoEmails.map(d => (
                <button
                  key={d.email}
                  onClick={() => { setEmail(d.email); employerLogin(d.email); navigate('/dashboard/employer'); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-left rounded-xl border border-slate-200 hover:border-[var(--orange)]/30 hover:bg-[rgba(241,90,36,0.04)] transition-all group"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[var(--navy)] group-hover:text-[var(--orange)] transition-colors">{d.name}</span>
                    <span className="text-xs text-[var(--charcoal)]">{d.category}</span>
                  </div>
                  <ArrowRight size={16} className="text-[var(--orange)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployerDashboard() {
  const { loggedEmployer, employerLogout, jobPostings, jobSeekers, matches, placements, updateJobPosting } = useData();
  const navigate = useNavigate();

  // Local interactive states
  const [expandedJobIds, setExpandedJobIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('All');
  const [viewingApplicant, setViewingApplicant] = useState<JobSeeker | null>(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shortlistedCandidateIds, setShortlistedCandidateIds] = useState<string[]>([]);
  const [rejectedCandidateIds, setRejectedCandidateIds] = useState<string[]>([]);

  if (!loggedEmployer) { navigate('/login/employer'); return null; }

  const employer = loggedEmployer;
  const myJobs = jobPostings.filter(j => j.employerId === employer.id);
  const myPlacements = placements.filter(p => p.employerId === employer.id);
  const totalApplicants = myJobs.reduce((sum, j) => sum + j.applicants.length, 0);
  const activeJobs = myJobs.filter(j => j.status === 'Open').length;

  const toggleExpandJob = (jobId: string) => {
    if (expandedJobIds.includes(jobId)) {
      setExpandedJobIds(expandedJobIds.filter(id => id !== jobId));
    } else {
      setExpandedJobIds([...expandedJobIds, jobId]);
    }
  };

  const getApplicantsForJob = (jobId: string) => {
    const job = myJobs.find(j => j.id === jobId);
    if (!job) return [];
    return job.applicants.map(id => jobSeekers.find(s => s.id === id)).filter(Boolean) as JobSeeker[];
  };

  const getMatchesForJob = (jobId: string) => matches.filter(m => m.jobId === jobId);

  // Filtered jobs
  const filteredJobs = myJobs.filter(job => {
    if (statusFilter !== 'All' && job.status !== statusFilter) return false;
    if (employmentTypeFilter !== 'All' && job.employmentType !== employmentTypeFilter) return false;
    if (dateFilter !== 'All' && job.createdAt) {
      const jobDate = new Date(job.createdAt);
      const now = new Date();
      const diffDays = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);
      if (dateFilter === 'Last 7 days' && diffDays > 7) return false;
      if (dateFilter === 'Last 30 days' && diffDays > 30) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = job.jobTitle.toLowerCase().includes(q);
      const matchCity = job.city.toLowerCase().includes(q);
      const matchSkill = job.skillsRequired.some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchCity && !matchSkill) return false;
    }
    return true;
  });

  // Action handlers
  const handleJobAction = (action: string, job: JobPosting, e: React.MouseEvent) => {
    e.stopPropagation();
    if (action === 'Pause') {
      updateJobPosting(job.id, { status: job.status === 'On Hold' ? 'Open' : 'On Hold' });
      setToastMessage(`Job "${job.jobTitle}" status changed to ${job.status === 'On Hold' ? 'Open' : 'On Hold'}.`);
    } else if (action === 'Close') {
      updateJobPosting(job.id, { status: 'Closed' });
      setToastMessage(`Job "${job.jobTitle}" marked as Closed.`);
    } else if (action === 'Duplicate') {
      setToastMessage(`Created duplicate draft for "${job.jobTitle}".`);
    } else if (action === 'Share') {
      setToastMessage(`Job link for "${job.jobTitle}" copied to clipboard!`);
    }
  };

  const handleCandidateAction = (action: string, candidate: JobSeeker, e: React.MouseEvent) => {
    e.stopPropagation();
    if (action === 'Shortlist') {
      if (shortlistedCandidateIds.includes(candidate.id)) {
        setShortlistedCandidateIds(shortlistedCandidateIds.filter(id => id !== candidate.id));
        setToastMessage(`${candidate.firstName} ${candidate.lastName} removed from shortlist.`);
      } else {
        setShortlistedCandidateIds([...shortlistedCandidateIds, candidate.id]);
        setToastMessage(`${candidate.firstName} ${candidate.lastName} shortlisted successfully!`);
      }
    } else if (action === 'Interview') {
      setToastMessage(`Interview scheduled invitation sent to ${candidate.firstName} ${candidate.lastName}.`);
    } else if (action === 'Reject') {
      setRejectedCandidateIds([...rejectedCandidateIds, candidate.id]);
      setToastMessage(`Application for ${candidate.firstName} ${candidate.lastName} moved to rejected.`);
    } else if (action === 'Download') {
      setToastMessage(`Downloading resume for ${candidate.firstName} ${candidate.lastName}...`);
    } else if (action === 'Message') {
      setToastMessage(`Direct message window opened for ${candidate.firstName}.`);
    }
  };

  // Recent activity logs
  const employerActivities = [
    { id: 1, text: 'Published new job opening for Machine Operator (5 vacancies)', date: 'Today, 9:30 AM', icon: <Briefcase size={14} className="text-teal-500" /> },
    { id: 2, text: 'Rajesh Kumar applied for Machine Operator position', date: 'Yesterday, 3:15 PM', icon: <Users size={14} className="text-[var(--orange)]" /> },
    { id: 3, text: 'Shortlisted Priya Sharma for Staff Nurse interview', date: '2 Feb 2024', icon: <Star size={14} className="text-amber-500" /> },
    { id: 4, text: 'Confirmed placement for Manoj Tiwari (Commission Paid)', date: '28 Jan 2024', icon: <CheckCircle size={14} className="text-emerald-500" /> },
  ];

  // Employer notifications
  const employerNotifications = [
    { id: 1, title: '5 New Applicants', text: '5 candidates applied to Machine Operator in Pune.', time: '1h ago' },
    { id: 2, title: 'Interview Tomorrow', text: 'Online interview set with Priya Sharma at 11:00 AM.', time: '3h ago' },
    { id: 3, title: 'Candidate Accepted Offer', text: 'Amit Patel accepted offer for Machine Operator.', time: '1d ago' },
  ];

  return (
    <div className="dash-shell text-[var(--navy)] pb-16" style={{ fontFamily: 'var(--font)' }}>

      {/* ═══════════════════════════════════════════════════════
          NAVBAR — quiet, functional
          ═══════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[var(--white)]/95 backdrop-blur-md border-b border-[#E7E2D9]">
        <div className="dash-container flex items-center justify-between h-16">

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--navy)] rounded-lg flex items-center justify-center text-white">
              <Building2 size={16} />
            </div>
            <span className="font-extrabold text-[15px] text-[var(--navy)] tracking-tight hidden sm:inline">Rojgaar Hai</span>
            <span className="dash-status dash-status--neutral ml-1">Recruiter Workspace</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/register/employer">
              <button className="dash-btn dash-btn-primary dash-btn--compact hidden sm:inline-flex">
                <Plus size={14} /> Post New Job
              </button>
            </Link>

            <div className="flex items-center gap-3 pl-3 border-l border-[#E7E2D9]">
              <div className="dash-avatar">{employer.companyName.charAt(0)}</div>
              <button
                onClick={() => { employerLogout(); navigate('/'); }}
                className="text-[var(--charcoal)] hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          MAIN RECRUITER DASHBOARD CONTENT
          ═══════════════════════════════════════════════════════ */}
      <div className="dash-container space-y-9">

        {/* ═══ HEADER: identity + primary action ═══ */}
        <div className="dash-header">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="dash-header__title">{employer.companyName}</h1>
              <span className="dash-status dash-status--success"><ShieldCheck size={11} /> Verified</span>
            </div>
            <p className="dash-header__subtitle">
              Recruiter Workspace · {employer.industry} · {employer.city}, {employer.state} · Contact: {employer.contactName}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <button onClick={() => setToastMessage('Company details editor opened.')} className="dash-btn dash-btn-secondary dash-btn--compact">
              Edit Company
            </button>
            <button onClick={() => setToastMessage(`Public recruiter profile URL: https://rojgaarhai.com/company/${employer.id}`)} className="dash-btn dash-btn-secondary dash-btn--compact">
              View Public Profile
            </button>
            <Link to="/register/employer">
              <button className="dash-btn dash-btn-primary">
                <Plus size={15} /> Post New Job
              </button>
            </Link>
          </div>
        </div>

        {/* ═══ METRICS STRIP ═══ */}
        <div className="dash-metrics">
          <div className="dash-metric">
            <div className="dash-metric__value dash-metric__value--accent">{activeJobs}</div>
            <div className="dash-metric__label">Active Openings</div>
            <div className="dash-metric__trend">↑ 12% this week</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric__value">{totalApplicants}</div>
            <div className="dash-metric__label">Total Applicants</div>
            <div className="dash-metric__trend">↑ 18% this week</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric__value">2</div>
            <div className="dash-metric__label">Interviews Scheduled</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric__value">{myPlacements.length}</div>
            <div className="dash-metric__label">Placements Joined</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric__value">₹{myJobs.reduce((sum, j) => sum + parseInt(j.salaryMax), 0).toLocaleString()}</div>
            <div className="dash-metric__label">Monthly Salary Budget</div>
          </div>
        </div>

        {/* ═══ SEARCH, FILTER & SORT BAR FOR POSTINGS ═══ */}
        <div className="dash-surface dash-surface--pad">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--charcoal)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search postings by job title, location, or skill..."
                 className="w-full pl-10 pr-4 h-11 rounded-[10px] border border-[#D8D2C6] bg-[var(--white)] text-[var(--navy)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/25 focus:border-[var(--orange)]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="h-11 px-3 rounded-[10px] border border-[#D8D2C6] bg-[var(--white)] text-[var(--navy)] text-xs font-bold"
              >
                <option value="All">All Dates</option>
                <option value="Last 7 days">Last 7 Days</option>
                <option value="Last 30 days">Last 30 Days</option>
              </select>

              <select
                value={employmentTypeFilter}
                onChange={e => setEmploymentTypeFilter(e.target.value)}
                className="h-11 px-3 rounded-[10px] border border-[#D8D2C6] bg-[var(--white)] text-[var(--navy)] text-xs font-bold"
              >
                <option value="All">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-11 px-3 rounded-[10px] border border-[#D8D2C6] bg-[var(--white)] text-[var(--navy)] text-xs font-bold"
              >
                <option value="All">All Job Statuses</option>
                <option value="Open">Open</option>
                <option value="On Hold">Paused / On Hold</option>
                <option value="Closed">Closed</option>
              </select>

              <span className="text-xs font-semibold text-[var(--charcoal)] whitespace-nowrap">
                {filteredJobs.length} Jobs
              </span>
            </div>
          </div>
        </div>

        {/* ═══ MY JOB POSTINGS ═══ */}
        <div>
          <div className="dash-section-title mb-4">My Active Job Openings ({filteredJobs.length})</div>

          {filteredJobs.length === 0 ? (
            <div className="dash-surface text-center py-12">
              <div className="w-16 h-16 bg-[var(--orange)]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-[var(--orange)]">
                <Briefcase size={32} />
              </div>
              <h4 className="text-lg font-bold text-[var(--navy)]">No Job Postings Found</h4>
              <p className="text-xs text-[var(--charcoal)] mt-1 max-w-sm mx-auto">
                No job postings match your current filter. Create a new vacancy requirement to start receiving pre-screened applicants.
              </p>
              <Link to="/register/employer">
                <button className="dash-btn dash-btn-primary mt-4 mx-auto">
                  <Plus size={16} /> Create First Job Posting
                </button>
              </Link>
            </div>
          ) : (
            <div className="dash-surface divide-y divide-[#EFEAE1]">
              {filteredJobs.map(job => {
                const isExpanded = expandedJobIds.includes(job.id);
                const applicants = getApplicantsForJob(job.id);
                const jobMatches = getMatchesForJob(job.id);
                const statusVariant = job.status === 'Open' ? 'success' : job.status === 'On Hold' ? 'warning' : 'danger';

                return (
                  <div key={job.id}>

                    {/* Collapsed Job Row Header */}
                    <div
                      onClick={() => toggleExpandJob(job.id)}
                      className="p-5 sm:p-6 hover:bg-[#FAF7F0] cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                            <h4 className="text-lg font-extrabold text-[var(--navy)]">
                              {job.jobTitle}
                            </h4>
                            <span className={`dash-status dash-status--${statusVariant}`}>
                              {job.status === 'Open' ? 'Open' : job.status === 'On Hold' ? 'Paused' : 'Closed'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--charcoal)] font-medium">
                            <span className="flex items-center gap-1"><MapPin size={13} />{job.city}, {job.state}</span>
                            <span className="text-[#D8D2C6]">·</span>
                            <span className="font-bold text-[var(--green)]"><IndianRupee size={13} className="inline -mt-0.5" />{parseInt(job.salaryMin).toLocaleString()} - {parseInt(job.salaryMax).toLocaleString()}/mo</span>
                            <span className="text-[#D8D2C6]">·</span>
                            <span>{job.employmentType}</span>
                            <span className="text-[#D8D2C6]">·</span>
                            <span>{job.experienceRequired}</span>
                            <span className="text-[#D8D2C6]">·</span>
                            <span>{job.numberOfOpenings} Vacancies</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[13px] font-semibold">
                            <span className="text-[var(--navy)]">{applicants.length} Applicants</span>
                            <span className="text-[var(--charcoal)]">{jobMatches.length} Compatible Matches</span>
                            <span className="text-[12px] text-[var(--charcoal)] font-medium">Posted {job.createdAt} · Expires {job.deadline || '15 May 2024'}</span>
                          </div>
                        </div>

                        {/* Right: Toggle Expand & Quick Actions */}
                        <div className="flex items-center gap-1 self-start lg:self-center">
                          <button
                            type="button"
                            onClick={(e) => handleJobAction('Pause', job, e)}
                            className="dash-btn-tertiary h-8 w-8 !p-0 rounded-lg"
                            title="Pause/Resume Job"
                          >
                            <PauseCircle size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleJobAction('Duplicate', job, e)}
                            className="dash-btn-tertiary h-8 w-8 !p-0 rounded-lg"
                            title="Duplicate Posting"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleJobAction('Share', job, e)}
                            className="dash-btn-tertiary h-8 w-8 !p-0 rounded-lg"
                            title="Share Posting"
                          >
                            <Share2 size={16} />
                          </button>

                          <div className="flex items-center gap-1 ml-1 text-xs font-bold text-[var(--navy)] px-2.5 py-2 rounded-lg hover:bg-[#FAF7F0]">
                            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Section */}
                    {isExpanded && (
                       <div className="p-5 sm:p-6 bg-[#FAF7F0] border-t border-[#EFEAE1] space-y-6">

                         {/* HIRING PIPELINE TRACKER */}
                         <div className="dash-surface dash-surface--pad">
                          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--charcoal)] mb-3">
                            Recruitment Pipeline Progress
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs font-bold">
                            <div className="p-2 rounded-lg bg-[#FAF7F0] text-[var(--navy)] border border-[#E7E2D9]">Applied ({applicants.length})</div>
                            <div className="p-2 rounded-lg bg-[#FAF7F0] text-[var(--navy)] border border-[#E7E2D9]">Reviewed ({applicants.length})</div>
                            <div className="p-2 rounded-lg bg-[#FAF7F0] text-[var(--navy)] border border-[#E7E2D9]">Shortlisted ({shortlistedCandidateIds.length})</div>
                            <div className="p-2 rounded-lg bg-[#FAF7F0] text-[var(--navy)] border border-[#E7E2D9]">Interview (2)</div>
                            <div className="p-2 rounded-lg bg-[var(--green)] text-white">Selected (1)</div>
                            <div className="p-2 rounded-lg bg-[#FAF7F0] text-[var(--charcoal)] border border-[#E7E2D9]">Joined (0)</div>
                          </div>
                        </div>

                        {/* APPLICANT CARDS */}
                        <div>
                          <h5 className="text-sm font-extrabold text-[var(--navy)] mb-4 flex items-center gap-2">
                            <Users size={18} className="text-[var(--orange)]" />
                            Candidate Applicants ({applicants.length})
                          </h5>

                          {applicants.length === 0 ? (
                               <p className="text-sm text-[var(--charcoal)] py-6 text-center bg-[var(--white)] rounded-2xl border border-slate-200">
                              No candidate has applied to this posting yet.
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {applicants.map(applicant => {
                                const match = jobMatches.find(m => m.candidateId === applicant.id);
                                const isShortlisted = shortlistedCandidateIds.includes(applicant.id);
                                const isRejected = rejectedCandidateIds.includes(applicant.id);

                                return (
                                  <div
                                    key={applicant.id}
                                    className={`p-4 rounded-2xl border transition-all duration-200 bg-[var(--white)] ${
                                      isRejected
                                        ? 'opacity-50 border-red-200'
                                        : isShortlisted
                                        ? 'border-amber-300 bg-amber-50/20'
                                        : 'border-slate-200 hover:shadow-md'
                                    }`}
                                  >
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                      
                                      {/* Candidate Info */}
                                      <div className="flex items-start gap-4">
                                        <div className="dash-avatar w-11 h-11 text-[13px]">
                                          {applicant.firstName[0]}{applicant.lastName[0]}
                                        </div>

                                        <div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h6 className="font-extrabold text-base text-[var(--navy)]">
                                              {applicant.firstName} {applicant.lastName}
                                            </h6>
                                             {isShortlisted && (
                                               <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                                                 ★ Shortlisted
                                               </span>
                                             )}
                                             {isRejected && (
                                               <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                                                 Rejected
                                               </span>
                                             )}
                                          </div>

                                          <p className="text-xs text-[var(--charcoal)] font-medium mt-0.5">
                                            {applicant.qualification} • {applicant.totalExperience} Years Exp • {applicant.location}, {applicant.state}
                                          </p>

                                          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--charcoal)] mt-2 font-medium">
                                             <span>Expected: <strong className="text-emerald-600 font-bold">₹{parseInt(applicant.expectedSalary).toLocaleString()}/mo</strong></span>
                                            <span>• Availability: ⚡ Immediate</span>
                                            <span>• Resume: 📄 Uploaded</span>
                                          </div>

                                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                                            {applicant.skills.slice(0, 4).map(s => (
                                              <Badge key={s} variant="info" className="text-[10px]">{s}</Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Match Score & Actions */}
                                      <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-center">
                                        {/* Match Indicator */}
                                        <div className="text-center px-3 py-1.5 rounded-lg bg-[var(--orange)]/8 text-[var(--orange)]">
                                          <p className="text-lg font-extrabold leading-tight">{match?.matchScore || 88}%</p>
                                          <p className="text-[9px] font-bold uppercase tracking-wider">Match</p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <Button size="sm" variant="outline" onClick={() => { setViewingApplicant(applicant); setShowApplicantModal(true); }} className="text-xs">
                                            <Eye size={12} className="mr-1" /> View
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={(e) => handleCandidateAction('Shortlist', applicant, e)}
                                            className="text-xs"
                                          >
                                            <Star size={12} className="mr-1" /> {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                                          </Button>
                                          <Button size="sm" variant="primary" onClick={(e) => handleCandidateAction('Interview', applicant, e)} className="text-xs">
                                            <Video size={12} className="mr-1" /> Interview
                                          </Button>
                                          <button onClick={(e) => handleCandidateAction('Reject', applicant, e)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg" title="Reject">
                                            <XCircle size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══ RECRUITMENT INSIGHTS, ACTIVITY & NOTIFICATIONS ═══ */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ATS Insights */}
          <div>
            <div className="dash-section-title mb-4">ATS Recruitment Insights</div>
            <div className="dash-surface dash-surface--pad space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold text-[var(--charcoal)]">Average Match Score</span>
                  <span className="text-base font-extrabold text-[var(--orange)]">84%</span>
                </div>
                <div className="dash-progress mt-2">
                  <div className="dash-progress__fill" style={{ width: '84%' }} />
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[13px] font-semibold text-[var(--charcoal)]">Response Rate</span>
                <span className="text-base font-extrabold text-[var(--navy)]">95%</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[13px] font-semibold text-[var(--charcoal)]">Total Resume Downloads</span>
                <span className="text-base font-extrabold text-[var(--navy)]">36</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="dash-surface dash-surface--pad">
            <div className="dash-section-title mb-1">Recent Activity</div>
            <div className="divide-y divide-[#EFEAE1]">
              {employerActivities.map(act => (
                <div key={act.id} className="flex items-start gap-2.5 py-2.5">
                  <HugeiconsIcon icon={Activity03Icon} size={15} className="text-[var(--charcoal)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[var(--navy)] text-[13px] leading-snug">{act.text}</p>
                    <p className="text-[11px] text-[var(--charcoal)] mt-0.5">{act.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Notification Panel */}
          <div className="dash-surface dash-surface--pad">
            <div className="dash-section-title mb-1">Hiring Notifications</div>
            <div className="divide-y divide-[#EFEAE1]">
              {employerNotifications.map(n => (
                <div key={n.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-[13px] text-[var(--navy)]">{n.title}</p>
                    <span className="text-[11px] text-[var(--charcoal)] flex-shrink-0">{n.time}</span>
                  </div>
                  <p className="text-[13px] text-[var(--charcoal)] leading-relaxed mt-0.5">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ APPLICANT DETAIL SUBMISSION MODAL ═══ */}
      <Modal isOpen={showApplicantModal} onClose={() => setShowApplicantModal(false)} title="Applicant Full Submission Profile" size="lg">
        {viewingApplicant && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="dash-avatar w-16 h-16 text-2xl">
                {viewingApplicant.firstName[0]}{viewingApplicant.lastName[0]}
              </div>
              <div>
                 <h3 className="text-xl font-extrabold text-[var(--navy)]">{viewingApplicant.firstName} {viewingApplicant.lastName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={viewingApplicant.status === 'Placed' ? 'success' : 'info'}>{viewingApplicant.status}</Badge>
                  <span className="text-xs text-[var(--charcoal)]">Registered {viewingApplicant.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Complete Submission Grid */}
             <div className="bg-[var(--white)] rounded-2xl p-4 border border-slate-200">
               <h4 className="text-sm font-bold text-[var(--navy)] mb-3 flex items-center gap-2"><FileText size={16} className="text-[var(--orange)]" /> Complete Candidate Form Submission</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Full Name', value: `${viewingApplicant.firstName} ${viewingApplicant.lastName}` },
                  { label: 'Phone Number', value: viewingApplicant.phone },
                  { label: 'Email Address', value: viewingApplicant.email },
                  { label: 'Date of Birth', value: viewingApplicant.dob },
                  { label: 'Gender', value: viewingApplicant.gender },
                  { label: 'Current Location', value: `${viewingApplicant.location}, ${viewingApplicant.state}` },
                  { label: 'Highest Qualification', value: viewingApplicant.qualification },
                  { label: 'Previous Company', value: viewingApplicant.previousCompany || 'N/A (Fresher)' },
                  { label: 'Total Experience', value: `${viewingApplicant.totalExperience} years` },
                  { label: 'Expected Salary', value: `₹${parseInt(viewingApplicant.expectedSalary).toLocaleString()}/month` },
                  { label: 'Preferred Job Type', value: viewingApplicant.preferredJobType },
                  { label: 'Willing to Relocate', value: viewingApplicant.willingToRelocate ? 'Yes' : 'No' },
                ].map(f => (
                   <div key={f.label} className="bg-[var(--white)] rounded-xl p-2.5 border border-slate-200">
                    <p className="text-[10px] text-[var(--charcoal)] uppercase tracking-wider font-semibold">{f.label}</p>
                     <p className="text-sm text-[var(--navy)] font-bold mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <p className="text-xs text-[var(--charcoal)] font-bold mb-1.5">Candidate Skills</p>
              <div className="flex flex-wrap gap-1.5">{viewingApplicant.skills.map(s => <Badge key={s} variant="default">{s}</Badge>)}</div>
            </div>

            {/* Resume File */}
            {viewingApplicant.resumeFile && (
               <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-[var(--orange)]" />
                    <div>
                      <p className="text-xs text-[var(--orange)] font-bold">Resume Document</p>
                     <p className="text-sm text-[var(--navy)] font-bold">{viewingApplicant.resumeFile}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setToastMessage(`Downloading ${viewingApplicant.resumeFile}...`)} className="bg-[var(--orange)]">
                  <Download size={14} className="mr-1" /> Download
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}

export { EmployerLogin, EmployerDashboard };
