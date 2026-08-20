import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, Briefcase, MapPin, FileText, ArrowRight, LogOut, CheckCircle, AlertCircle,
  Bell, Search, Bookmark, ShieldCheck, Zap, Sparkles, UserCheck,
  TrendingUp, Calendar, Award, Star, Download, Eye, ChevronRight,
  BarChart3, CheckSquare, X, Upload, MessageSquare, Video,
  Target, GraduationCap, Check
} from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon, CircleIcon, File01Icon, ViewIcon, Download04Icon,
  Upload04Icon, Activity03Icon, JobSearchIcon, Notification03Icon,
} from '@hugeicons/core-free-icons';
import { Card, Badge, Button, Modal, Toast } from '../../components/ui';
import { useData, JobPosting } from '../../context/DataContext';
import { EditProfileModal } from '../../components/EditProfileModal';

function CandidateLogin() {
  const { candidateLogin } = useData();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const demoEmails = [
    { email: 'rajesh.kumar@email.com', name: 'Rajesh Kumar', category: 'Machine / Accounts' },
    { email: 'priya.sharma@email.com', name: 'Priya Sharma', category: 'Staff Nurse' },
    { email: 'meera.reddy@email.com', name: 'Meera Reddy', category: 'Junior Developer' },
    { email: 'vikram.singh@email.com', name: 'Vikram Singh', category: 'CNC / Welder' },
    { email: 'asha.bhosle@email.com', name: 'Asha Bhosle', category: 'B.Sc Nursing' },
  ];

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (candidateLogin(email)) {
      navigate('/dashboard/candidate');
    } else {
      setError('Candidate not found. Select a demo account below.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[var(--bg-warm)] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16" style={{ fontFamily: 'var(--font)' }}>
      <div className="w-full max-w-[460px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgba(241,90,36,0.1)] text-[var(--orange)] mb-4">
            <Users size={28} />
          </div>
          <h1 className="text-[32px] sm:text-[36px] font-extrabold text-[var(--navy)] tracking-tight leading-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Candidate Portal
          </h1>
          <p className="text-base text-[var(--charcoal)] leading-relaxed">
            Sign in to manage your applications and job matches
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[15px] font-semibold text-[var(--navy)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="Enter your registered email"
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
            <p className="text-xs text-[var(--charcoal)] mb-4">Preview the candidate workspace using a demo profile.</p>
            <div className="space-y-2">
              {demoEmails.map(d => (
                <button
                  key={d.email}
                  onClick={() => { setEmail(d.email); candidateLogin(d.email); navigate('/dashboard/candidate'); }}
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

function CandidateDashboard() {
  const { loggedCandidate, candidateLogout, jobPostings, matches, placements, applyToJob, updateJobSeeker } = useData();
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!loggedCandidate) { navigate('/login/candidate'); return null; }

  const candidate = loggedCandidate;

  // Local state for interactive elements
  const [candidateStatus, setCandidateStatus] = useState<'Open to Work' | 'Interviewing' | 'Placed' | 'Actively Looking'>('Open to Work');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<JobPosting | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved Jobs state
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('rojgaarhai_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });

  const toggleSaveJob = (jobId: string) => {
    let updated: string[];
    if (savedJobIds.includes(jobId)) {
      updated = savedJobIds.filter(id => id !== jobId);
      setToastMessage('Removed from saved jobs');
    } else {
      updated = [...savedJobIds, jobId];
      setToastMessage('Job saved to your bookmarks!');
    }
    setSavedJobIds(updated);
    localStorage.setItem('rojgaarhai_saved_jobs', JSON.stringify(updated));
  };

  // Data calculations
  const myMatches = useMemo(() => matches.filter(m => m.candidateId === candidate.id), [matches, candidate.id]);
  const myPlacements = useMemo(() => placements.filter(p => p.candidateId === candidate.id), [placements, candidate.id]);
  const appliedJobs = useMemo(() => jobPostings.filter(j => j.applicants.includes(candidate.id)), [jobPostings, candidate.id]);
  const savedJobs = useMemo(() => jobPostings.filter(j => savedJobIds.includes(j.id)), [jobPostings, savedJobIds]);

  // Profile completion score
  const profileCompletion = useMemo(() => {
    let score = 0;
    const fields = [
      candidate.firstName, candidate.lastName, candidate.phone, candidate.email,
      candidate.dob, candidate.location, candidate.state, candidate.qualification,
      candidate.previousCompany, candidate.totalExperience, candidate.expectedSalary,
      candidate.preferredJobType,
    ];
    fields.forEach(f => { if (f && f !== 'N/A' && f !== 'Not Specified') score++; });
    if (candidate.skills.length > 0) score++;
    if (candidate.resumeFile) score++;
    return Math.round((score / 14) * 100);
  }, [candidate]);

  // Notifications
  const notifications = [
    { id: 1, title: 'Employer Viewed Profile', text: 'Bharat Manufacturing Co. viewed your profile 2 hours ago.', time: '2h ago', icon: <Eye size={14} className="text-[var(--orange)]" /> },
    { id: 2, title: 'New Job Match Found', text: 'You match 91% with Machine Operator position.', time: '4h ago', icon: <Zap size={14} className="text-amber-500" /> },
    { id: 3, title: 'Interview Scheduled', text: 'Technical interview set with Metro Hospital for Staff Nurse.', time: '1d ago', icon: <Video size={14} className="text-emerald-500" /> },
    { id: 4, title: 'Application Update', text: 'Your application for Data Entry Operator was shortlisted.', time: '2d ago', icon: <CheckCircle size={14} className="text-purple-500" /> },
  ];

  // Dummy upcoming interviews
  const upcomingInterviews = [
    {
      id: 'INT-01',
      company: 'Metro Hospital Group',
      role: 'Staff Nurse',
      date: '10 Feb 2024',
      time: '11:00 AM IST',
      mode: 'Online (Video Call)',
      link: 'https://meet.rojgaarhai.com/interview/int-01',
      countdown: 'In 2 Days',
    },
    {
      id: 'INT-02',
      company: 'Bharat Manufacturing Co.',
      role: 'Machine Operator',
      date: '14 Feb 2024',
      time: '02:30 PM IST',
      mode: 'Offline (Plant Visit)',
      link: 'Plant Plot 45, Pune',
      countdown: 'In 6 Days',
    },
  ];

  // Dummy Recent Activity
  const activityLog = [
    { id: 'act-1', text: 'Applied for Accountant role at Bharat Mfg.', date: 'Today, 10:15 AM', type: 'applied', icon: <CheckCircle size={14} className="text-emerald-500" /> },
    { id: 'act-2', text: 'Updated skills: Tally Prime & Excel', date: 'Yesterday, 4:30 PM', type: 'updated', icon: <Sparkles size={14} className="text-[var(--orange)]" /> },
    { id: 'act-3', text: 'Recruiter from TechRural Solutions viewed your profile', date: '2 Feb 2024', type: 'viewed', icon: <Eye size={14} className="text-purple-500" /> },
    { id: 'act-4', text: 'Interview Scheduled with Metro Hospital Group', date: '1 Feb 2024', type: 'interview', icon: <Video size={14} className="text-amber-500" /> },
    { id: 'act-5', text: 'Bookmarked Junior Developer role at TechRural', date: '28 Jan 2024', type: 'saved', icon: <Bookmark size={14} className="text-teal-500" /> },
  ];

  // Dummy Learning Recommendations
  const courses = [
    { id: 'c1', title: 'Advanced Excel & Data Analytics', duration: '2 Hours', icon: <BarChart3 size={20} className="text-emerald-500" />, badge: 'Free' },
    { id: 'c2', title: 'Tally Prime & GST Accounting Masterclass', duration: '4 Hours', icon: <Briefcase size={20} className="text-[var(--orange)]" />, badge: 'Free' },
    { id: 'c3', title: 'Professional Interview Success & English Speaking', duration: '3 Hours', icon: <Video size={20} className="text-purple-500" />, badge: 'Recommended' },
    { id: 'c4', title: 'Resume Writing & ATS Optimization Workshop', duration: '1.5 Hours', icon: <FileText size={20} className="text-amber-500" />, badge: 'Free' },
  ];

  // Timeline stage definitions
  const timelineStages = [
    { stage: 1, label: 'Registered', isDone: true, date: candidate.createdAt },
    { stage: 2, label: 'Profile Completed', isDone: profileCompletion >= 70, date: 'Verified' },
    { stage: 3, label: 'Applied', isDone: appliedJobs.length > 0, date: `${appliedJobs.length} Jobs` },
    { stage: 4, label: 'Shortlisted', isDone: myMatches.some(m => ['Shortlisted', 'Interview Scheduled', 'Offered', 'Hired'].includes(m.status)), date: `${myMatches.length} Matches` },
    { stage: 5, label: 'Interview Scheduled', isDone: myMatches.some(m => ['Interview Scheduled', 'Offered', 'Hired'].includes(m.status)), date: `${upcomingInterviews.length} Scheduled` },
    { stage: 6, label: 'Offer Received', isDone: myMatches.some(m => ['Offered', 'Hired'].includes(m.status)), date: '1 Offer' },
    { stage: 7, label: 'Placed', isDone: candidate.status === 'Placed', date: candidate.status === 'Placed' ? 'Hired!' : 'Pending' },
  ];

  const handleApplyConfirm = () => {
    if (showApplyModal && loggedCandidate) {
      applyToJob(showApplyModal.id, loggedCandidate.id);
      setShowApplyModal(null);
      setToastMessage(`Application for ${showApplyModal.jobTitle} submitted successfully!`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-warm)] text-[var(--navy)] transition-colors duration-300 pb-16" style={{ fontFamily: 'var(--font)' }}>
      
      {/* ═══════════════════════════════════════════════════════
          NAVBAR — CANDIDATE WORKSPACE
          ═══════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[var(--white)]/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          
          {/* Left Logo / Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[var(--orange)] rounded-xl flex items-center justify-center text-white shadow-md">
                <Briefcase size={18} />
              </div>
              <span className="font-extrabold text-lg text-[var(--navy)] tracking-tight hidden sm:inline">ROJGAARHAI</span>
            </Link>
              <span className="text-xs font-bold px-2.5 py-1 bg-[var(--orange)]/10 text-[var(--orange)] rounded-full border border-[var(--orange)]/20">
              Candidate Workspace
            </span>
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Browse Jobs Link */}
            <Link to="/jobs">
              <Button size="sm" variant="outline" className="hidden sm:inline-flex gap-1.5 text-xs">
                <Search size={14} /> Browse Jobs
              </Button>
            </Link>

            {/* Notification Bell Dropdown */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl hover:bg-slate-100 text-[var(--charcoal)] transition-colors relative"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--white)] rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-bold text-[var(--navy)] text-sm flex items-center gap-2">
                       <Bell size={16} className="text-[var(--orange)]" /> Notifications
                    </h4>
                     <span className="text-xs bg-[var(--orange)]/10 text-[var(--orange)] px-2 py-0.5 rounded-full font-semibold">
                      4 New
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto my-2">
                    {notifications.map(n => (
                       <div key={n.id} className="py-2.5 px-2 hover:bg-[var(--orange)]/10 rounded-xl transition-colors flex items-start gap-2.5">
                         <div className="p-1.5 bg-[var(--white)] rounded-lg flex-shrink-0 mt-0.5">{n.icon}</div>
                        <div className="min-w-0 flex-1">
                           <p className="text-xs font-bold text-[var(--navy)]">{n.title}</p>
                          <p className="text-[11px] text-[var(--charcoal)] line-clamp-2 mt-0.5">{n.text}</p>
                          <span className="text-[10px] text-[var(--charcoal)] mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                   <button onClick={() => setShowNotifications(false)} className="w-full text-center py-2 text-xs font-semibold text-[var(--orange)] hover:underline border-t border-slate-100 pt-3">
                    Close Notifications
                  </button>
                </div>
              )}
            </div>

            {/* Candidate User Avatar + Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="dash-avatar w-8 h-8 text-[11px] !rounded-full">
                {candidate.firstName[0]}{candidate.lastName[0]}
              </div>
              <button
                onClick={() => { candidateLogout(); navigate('/'); }}
                className="flex items-center gap-1 text-xs font-semibold text-[var(--charcoal)] hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          MAIN DASHBOARD CONTAINER
          ═══════════════════════════════════════════════════════ */}
      <div className="dash-container space-y-9">

        {/* ═══ HEADER: greeting + status ═══ */}
        <div className="dash-header">
          <div>
            <h1 className="dash-header__title">Good morning, {candidate.firstName}</h1>
            <p className="dash-header__subtitle">
              {candidate.location}, {candidate.state} · {candidate.totalExperience} yrs exp · Expected ₹{parseInt(candidate.expectedSalary).toLocaleString()}/mo
            </p>
          </div>
          <div className="self-start">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--charcoal)] block mb-1.5">Availability</label>
            <select
              value={candidateStatus}
              onChange={e => {
                setCandidateStatus(e.target.value as any);
                setToastMessage(`Status updated to "${e.target.value}"`);
              }}
              className="h-10 px-3 rounded-[10px] border border-[#D8D2C6] bg-white text-[var(--navy)] font-bold text-[13px] cursor-pointer"
            >
              <option value="Open to Work">Open to Work</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Actively Looking">Actively Looking</option>
              <option value="Placed">Placed</option>
            </select>
          </div>
        </div>

        {/* ═══ METRICS STRIP ═══ */}
        <div className="dash-metrics">
          <div className="dash-metric">
            <div className="dash-metric__value dash-metric__value--accent">{myMatches.length}</div>
            <div className="dash-metric__label">Job Matches</div>
            <div className="dash-metric__trend">90%+ compatible</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric__value">{appliedJobs.length}</div>
            <div className="dash-metric__label">Applications</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric__value">{upcomingInterviews.length}</div>
            <div className="dash-metric__label">Interviews</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric__value">48</div>
            <div className="dash-metric__label">Recruiter Views</div>
            <div className="dash-metric__trend">↑ 18%</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric__value">{profileCompletion}%</div>
            <div className="dash-metric__label">Profile Score</div>
          </div>
        </div>

        {/* Secondary metrics — plain text, no cards */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 -mt-4 text-[13px] font-semibold text-[var(--charcoal)]">
          <span>{savedJobs.length} Saved Jobs</span>
          <span>5 Recruiter Contacts</span>
          <span>{myMatches.filter(m => m.status === 'Shortlisted').length} Shortlisted</span>
          <span>{myMatches.filter(m => m.status === 'Offered').length} Offers Received</span>
          <span>{Math.round(myMatches.reduce((acc, m) => acc + m.matchScore, 0) / (myMatches.length || 1))}% Avg Match Score</span>
        </div>

        {/* ═══ QUICK ACTIONS ═══ */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Complete Profile', icon: <CheckSquare size={15} />, action: () => setShowEditProfileModal(true) },
            { label: 'Upload Resume', icon: <Upload size={15} />, action: () => setShowResumeModal(true) },
            { label: 'Browse Jobs', icon: <Search size={15} />, action: () => navigate('/jobs') },
            { label: 'Saved Jobs', icon: <Bookmark size={15} />, action: () => setToastMessage(`You have ${savedJobs.length} saved jobs.`) },
            { label: 'My Applications', icon: <FileText size={15} />, action: () => setToastMessage(`You applied to ${appliedJobs.length} jobs.`) },
            { label: 'Edit Profile', icon: <UserCheck size={15} />, action: () => setShowEditProfileModal(true) },
          ].map((item, idx) => (
            <button key={idx} onClick={item.action} className="dash-btn dash-btn-secondary dash-btn--compact">
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* ═══ CAREER PROGRESS TRACKER TIMELINE ═══ */}
        <div className="dash-surface dash-surface--pad">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="dash-section-title">Recruitment Pipeline Progress</div>
              <p className="dash-section-sub">Track your end-to-end progress from registration to placement</p>
            </div>
            <span className="dash-status dash-status--accent">{candidate.status}</span>
          </div>

          {/* Timeline Nodes */}
          <div className="relative py-4">
            <div className="hidden md:block absolute top-1/2 left-4 right-4 h-px bg-[#E7E2D9] -translate-y-1/2 z-0" />
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 relative z-10">
              {timelineStages.map((stg) => (
                <div key={stg.stage} className="flex md:flex-col items-center md:items-center gap-3 md:gap-2 text-left md:text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm transition-all ${
                      stg.isDone
                        ? 'bg-[var(--green)] text-white'
                        : 'bg-[var(--bg-warm)] text-[var(--charcoal)] border border-[#E7E2D9]'
                    }`}
                  >
                    {stg.isDone ? <Check size={18} /> : stg.stage}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${stg.isDone ? 'text-[var(--navy)]' : 'text-[var(--charcoal)]'}`}>
                      {stg.label}
                    </p>
                    <p className="text-[10px] text-[var(--charcoal)]">{stg.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ MAIN CONTENT TWO-COLUMN LAYOUT ═══ */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN (2 COLS) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* RECOMMENDED JOBS SECTION */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[var(--navy)] flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-500" /> Recommended Jobs For You
                  </h3>
                  <p className="text-xs text-[var(--charcoal)]">Handpicked roles based on your skills and location preferences</p>
                </div>
                <Link to="/jobs" className="text-xs font-bold text-[var(--orange)] hover:underline flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </Link>
              </div>

              <div className="dash-surface">
                {jobPostings.slice(0, 4).map(job => {
                  const isSaved = savedJobIds.includes(job.id);
                  const isApplied = job.applicants.includes(candidate.id);

                  return (
                    <div key={job.id} className="dash-row px-5 first:pt-4 last:pb-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="dash-avatar">{job.companyName.charAt(0)}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link to={`/jobs/${job.id}`} className="font-bold text-[15px] text-[var(--navy)] hover:text-[var(--orange)] transition-colors">
                              {job.jobTitle}
                            </Link>
                            {job.isVerified !== false && (
                              <ShieldCheck size={13} className="text-[var(--green)]" />
                            )}
                            <span className="text-[12px] font-bold text-[var(--orange)]">92% Match</span>
                          </div>
                          <p className="text-[13px] text-[var(--charcoal)] font-medium mt-0.5">
                            {job.companyName} · {job.city}, {job.state}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[var(--charcoal)] mt-1.5 font-medium">
                            <span className="font-bold text-[var(--green)]">₹{parseInt(job.salaryMin).toLocaleString()}-{parseInt(job.salaryMax).toLocaleString()}/mo</span>
                            <span className="text-[#D8D2C6]">·</span>
                            <span>{job.employmentType}</span>
                            <span className="text-[#D8D2C6]">·</span>
                            <span>{job.experienceRequired}</span>
                            <span className="text-[#D8D2C6]">·</span>
                            <span>{job.skillsRequired.slice(0, 3).join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleSaveJob(job.id)}
                          className="dash-btn-tertiary h-9 w-9 !p-0 rounded-lg"
                          title="Bookmark Job"
                        >
                          <Bookmark size={16} className={isSaved ? 'fill-[var(--orange)] text-[var(--orange)]' : ''} />
                        </button>
                        {isApplied ? (
                          <span className="dash-status dash-status--success">Applied</span>
                        ) : (
                          <button onClick={() => setShowApplyModal(job)} className="dash-btn dash-btn-primary dash-btn--compact">
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MY APPLICATIONS TIMELINE TRACKER */}
            <Card>
              <h3 className="text-lg font-bold text-[var(--navy)] mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[var(--orange)]" /> Active Application Progress
              </h3>

              {appliedJobs.length === 0 ? (
                <p className="text-sm text-[var(--charcoal)] text-center py-6">
                  You haven't applied to any jobs yet. Browse recommended jobs above to apply!
                </p>
              ) : (
                <div className="space-y-4">
                  {appliedJobs.map(job => (
                    <div key={job.id} className="p-4 rounded-2xl bg-[var(--white)] border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-[var(--navy)] text-base">{job.jobTitle}</p>
                          <p className="text-xs text-[var(--charcoal)]">{job.companyName} • {job.city}</p>
                        </div>
                        <Badge variant="success" className="text-xs">Under Review</Badge>
                      </div>

                      {/* Mini Application Progress Bar */}
                      <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-bold text-[var(--charcoal)] mt-2">
                        <div className="py-1 bg-emerald-600 text-white rounded-l-lg">Applied ✓</div>
                         <div className="py-1 bg-[var(--orange)] text-white">Viewed ✓</div>
                        <div className="py-1 bg-amber-500 text-white">Shortlisted</div>
                  <div className="py-1 bg-slate-200 text-[var(--charcoal)]">Interview</div>
                  <div className="py-1 bg-slate-200 text-[var(--charcoal)] rounded-r-lg">Offer</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* UPCOMING INTERVIEWS WIDGET */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--navy)] flex items-center gap-2">
                  <Video size={20} className="text-emerald-500" /> Upcoming Interviews ({upcomingInterviews.length})
                </h3>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Confirmed
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {upcomingInterviews.map(int => (
                   <div key={int.id} className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-[var(--bg-warm)] border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-md">
                        {int.countdown}
                      </span>
                      <span className="text-xs text-[var(--charcoal)] font-medium">{int.mode}</span>
                    </div>
                    <h4 className="font-bold text-[var(--navy)] text-base">{int.role}</h4>
                    <p className="text-xs text-[var(--charcoal)] font-semibold">{int.company}</p>

                    <div className="my-3 text-xs text-[var(--charcoal)] space-y-1">
                      <p className="flex items-center gap-1.5"><Calendar size={12} className="text-emerald-600" /> {int.date} at {int.time}</p>
                    </div>

                     <div className="flex gap-2 pt-2 border-t border-slate-200">
                      <a href={int.link} target="_blank" rel="noreferrer" className="flex-1">
                        <Button size="sm" variant="success" fullWidth className="text-xs font-semibold gap-1">
                          <Video size={12} /> Join Interview
                        </Button>
                      </a>
                      <Button size="sm" variant="outline" className="text-xs px-2.5" onClick={() => setToastMessage('Added to your calendar!')}>
                        <Calendar size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* SAVED JOBS GRID */}
            {savedJobs.length > 0 && (
              <Card>
                <h3 className="text-lg font-bold text-[var(--navy)] mb-4 flex items-center gap-2">
                  <Bookmark size={20} className="text-amber-500" /> Bookmarked Jobs ({savedJobs.length})
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {savedJobs.map(job => (
                     <div key={job.id} className="p-4 rounded-2xl border border-slate-200 bg-[var(--white)] flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-[var(--navy)] text-sm">{job.jobTitle}</h4>
                        <p className="text-xs text-[var(--charcoal)]">{job.companyName} • {job.city}</p>
                         <p className="text-xs font-bold text-emerald-600 mt-2">₹{parseInt(job.salaryMin).toLocaleString()} - ₹{parseInt(job.salaryMax).toLocaleString()}/mo</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                        <button onClick={() => toggleSaveJob(job.id)} className="text-xs text-slate-400 hover:text-red-500">Remove</button>
                        <Button size="sm" onClick={() => setShowApplyModal(job)} className="text-xs">Apply Now</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* MONTHLY ACTIVITY HEATMAP */}
            <Card>
              <h3 className="text-base font-bold text-[var(--navy)] mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-purple-500" /> Monthly Activity Heatmap (February 2024)
              </h3>
              <p className="text-xs text-[var(--charcoal)] mb-4">Daily engagement intensity across job applications, views, and updates</p>
              <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 text-center">
                {Array.from({ length: 28 }, (_, i) => {
                  const intensity = (i * 7) % 4;
                    const bg = intensity === 3 ? 'bg-[var(--orange)] text-white' : intensity === 2 ? 'bg-[var(--orange)]/70 text-white' : intensity === 1 ? 'bg-[var(--orange)]/20 text-[var(--orange)]' : 'bg-slate-100 text-[var(--charcoal)]';
                  return (
                    <div key={i} className={`p-2 rounded-lg text-[10px] font-bold ${bg}`} title={`Day ${i+1}: ${intensity * 2} activities`}>
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN (1 COL) */}
          <div className="space-y-8">
            
            {/* PROFILE COMPLETION */}
            <div className="dash-surface dash-surface--pad">
              <div className="flex items-baseline justify-between mb-1.5">
                <div className="dash-section-title">Profile</div>
                <span className="text-lg font-extrabold text-[var(--navy)]">{profileCompletion}%</span>
              </div>
              <div className="dash-progress mb-1.5">
                <div className="dash-progress__fill" style={{ width: `${profileCompletion}%` }} />
              </div>
              <p className="text-[12px] text-[var(--charcoal)] mb-4">Profiles over 80% receive 3x more recruiter contacts</p>

              <div className="divide-y divide-[#EFEAE1]">
                {[
                  { label: 'Resume Uploaded', done: Boolean(candidate.resumeFile) },
                  { label: 'Education Added', done: Boolean(candidate.qualification) },
                  { label: 'Experience Added', done: Boolean(candidate.totalExperience) },
                  { label: 'Aadhaar Verification', done: false },
                  { label: 'Skills Assessment', done: candidate.skills.length >= 3 },
                  { label: 'Profile Picture', done: Boolean(candidate.profilePhotoFile) },
                ].map((item, i) => (
                  <div key={i} className="py-2 flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-1.5 font-medium text-[var(--charcoal)]">
                      <HugeiconsIcon icon={item.done ? CheckmarkCircle02Icon : CircleIcon} size={15} className={item.done ? 'text-[var(--green)]' : 'text-slate-300'} />
                      {item.label}
                    </span>
                    {!item.done && (
                      <button onClick={() => setShowEditProfileModal(true)} className="text-[12px] text-[var(--orange)] font-bold hover:underline">
                        Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* RESUME CENTER */}
            <div className="dash-surface dash-surface--pad">
              <div className="dash-section-title mb-3 flex items-center gap-2">
                <HugeiconsIcon icon={File01Icon} size={18} /> Resume Center
              </div>

              <p className="font-bold text-sm text-[var(--navy)] truncate">{candidate.resumeFile || 'My_Resume.pdf'}</p>
              <p className="text-[11px] text-[var(--charcoal)] mb-3">Uploaded Jan 2024 · PDF format</p>

              <div className="flex items-center justify-between py-2 border-t border-[#EFEAE1] text-[13px]">
                <span className="font-semibold text-[var(--charcoal)]">Resume Score</span>
                <span className="font-extrabold text-[var(--orange)]">88/100</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-[#EFEAE1] mb-3 text-[13px]">
                <span className="font-semibold text-[var(--charcoal)]">ATS Compatibility</span>
                <span className="font-extrabold text-[var(--navy)]">92%</span>
              </div>

              <div className="flex gap-2">
                <button className="dash-btn dash-btn-secondary dash-btn--compact flex-1" onClick={() => setToastMessage('Previewing resume...')}>
                  <HugeiconsIcon icon={ViewIcon} size={15} /> Preview
                </button>
                <button className="dash-btn dash-btn-secondary dash-btn--compact flex-1" onClick={() => setToastMessage('Downloading resume file...')}>
                  <HugeiconsIcon icon={Download04Icon} size={15} /> Download
                </button>
                <button className="dash-btn dash-btn-primary dash-btn--compact flex-1" onClick={() => setShowResumeModal(true)}>
                  <HugeiconsIcon icon={Upload04Icon} size={15} /> Replace
                </button>
              </div>
            </div>

            {/* SKILLS PROFICIENCY */}
            <div className="dash-surface dash-surface--pad">
              <div className="dash-section-title mb-4">Skills & Proficiency</div>
              <div className="space-y-3.5">
                {candidate.skills.map((skill, idx) => {
                  const score = 80 + (idx * 5) % 18;
                  return (
                    <div key={skill}>
                      <div className="flex justify-between text-[13px] font-semibold mb-1.5">
                        <span className="text-[var(--navy)]">{skill}</span>
                        <span className="text-[var(--charcoal)]">{score}%</span>
                      </div>
                      <div className="dash-progress">
                        <div className="dash-progress__fill" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RECENT ACTIVITY TIMELINE */}
            <div className="dash-surface dash-surface--pad">
              <div className="dash-section-title mb-1">Recent Activity</div>
              <div className="divide-y divide-[#EFEAE1]">
                {activityLog.map(act => (
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

            {/* CAREER INSIGHTS */}
            <div className="dash-surface dash-surface--pad">
              <div className="dash-section-title mb-4">Market Career Insights</div>
              <div>
                <p className="text-[13px] text-[var(--charcoal)] font-medium">Average Market Salary</p>
                <p className="text-xl font-extrabold text-[var(--green)] mt-0.5">₹22,000/mo</p>
                <p className="text-[12px] text-[var(--charcoal)] mt-0.5">Higher than your expected ₹{parseInt(candidate.expectedSalary).toLocaleString()}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#EFEAE1]">
                <p className="text-[13px] text-[var(--charcoal)] font-medium">Profile Ranking</p>
                <p className="text-xl font-extrabold text-[var(--orange)] mt-0.5">Top 5% in {candidate.state}</p>
              </div>
            </div>

            {/* LEARNING RECOMMENDATIONS */}
            <div className="dash-surface">
              <div className="dash-section-title p-5 pb-0">Free Skill Certification Courses</div>
              <div className="divide-y divide-[#EFEAE1] px-5">
                {courses.map(crs => (
                  <div key={crs.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-bold text-[13px] text-[var(--navy)] truncate">{crs.title}</p>
                      <p className="text-[11px] text-[var(--charcoal)] mt-0.5">{crs.duration} · {crs.badge}</p>
                    </div>
                    <button className="dash-btn dash-btn-tertiary dash-btn--compact flex-shrink-0" onClick={() => setToastMessage(`Enrolled in ${crs.title}!`)}>
                      Enroll
                    </button>
                  </div>
                ))}
              </div>
              <div className="h-1" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MODALS ═══ */}

      {/* Apply Modal */}
      {showApplyModal && (
        <Modal isOpen={Boolean(showApplyModal)} onClose={() => setShowApplyModal(null)} title="Confirm Job Application" size="md">
          <div className="space-y-4">
             <div className="p-4 bg-[var(--orange)]/10 rounded-xl border border-[var(--orange)]/20">
               <p className="text-xs text-[var(--orange)] font-semibold uppercase">Applying For</p>
              <h3 className="text-lg font-bold text-[var(--navy)] mt-0.5">{showApplyModal.jobTitle}</h3>
              <p className="text-xs text-[var(--charcoal)] font-medium">{showApplyModal.companyName} • {showApplyModal.city}</p>
            </div>
             <div className="p-4 bg-[var(--white)] rounded-xl border border-slate-200 text-xs space-y-1.5">
              <p><span className="text-slate-400">Applicant:</span> <strong className="text-[var(--navy)]">{candidate.firstName} {candidate.lastName}</strong></p>
              <p><span className="text-slate-400">Email:</span> <span className="text-[var(--navy)]">{candidate.email}</span></p>
              <p><span className="text-slate-400">Experience:</span> <span className="text-[var(--navy)]">{candidate.totalExperience} Years</span></p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowApplyModal(null)}>Cancel</Button>
              <Button variant="success" onClick={handleApplyConfirm} className="gap-1 bg-[var(--orange)]"><UserCheck size={16} /> Confirm Application</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Resume Modal */}
      <Modal isOpen={showResumeModal} onClose={() => setShowResumeModal(false)} title="Upload Updated Resume" size="md">
        <div className="space-y-4">
          <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-[var(--white)]">
            <Upload size={32} className="text-[var(--orange)] mx-auto mb-2" />
            <p className="text-sm font-bold text-[var(--navy)]">Choose a PDF or DOCX file</p>
            <p className="text-xs text-slate-400 mt-1">Maximum file size: 5MB</p>
            <Button size="sm" className="mt-4 bg-[var(--orange)]" onClick={() => { setShowResumeModal(false); setToastMessage('New resume uploaded and scanned by ATS!'); }}>
              Select File
            </Button>
          </div>
        </div>
      </Modal>

      {/* Full Multi-Section Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        candidate={candidate}
        onSave={(updatedData) => {
          updateJobSeeker(candidate.id, updatedData);
          setToastMessage('Profile updated successfully.');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}

export { CandidateLogin, CandidateDashboard };
