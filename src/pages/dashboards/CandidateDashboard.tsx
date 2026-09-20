import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase, FileText, LogOut, CheckCircle,
  Bell, Search, Bookmark, ShieldCheck, Sparkles, UserCheck,
  Calendar, ChevronRight,
  CheckSquare, Upload, Video,
  Check
} from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon, CircleIcon, File01Icon, ViewIcon, Download04Icon,
  Upload04Icon, Activity03Icon,
} from '@hugeicons/core-free-icons';
import { Card, Badge, Button, Modal, Toast } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { createApplication, updateCandidateProfile, updateCandidateStatus, uploadCandidateResume } from '../../lib/supabase/data';
import { EditProfileModal } from '../../components/EditProfileModal';
import { DashboardSkeleton } from '../../components/Skeleton';

function downloadInterviewIcs(interview: { role: string; company: string; date: string }) {
  const start = new Date(interview.date);
  if (isNaN(start.getTime())) start.setTime(Date.now());
  start.setHours(10, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Interview - ${interview.role} at ${interview.company}`,
    `DESCRIPTION:Interview for ${interview.role} position at ${interview.company}. Exact time to be confirmed by the recruiter.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `interview-${interview.company.replace(/\s+/g, '-')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function CandidateDashboard() {
  const { candidate, profile, jobs, matches, applications, employers, jobSkills, loading, refresh } = useDatabase();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fullName = profile?.full_name || 'Candidate';
  const [firstName, ...lastNameParts] = fullName.split(' ');
  const lastName = lastNameParts.join(' ');
  const candidateEmail = user?.email || '';
  const candidatePhone = profile?.phone || '';

  const getEmployerName = (employerId: string) => {
    const employer = employers.find(e => e.id === employerId);
    return employer?.company_name || employerId;
  };

  const mapJob = (job: any) => ({
    ...job,
    jobTitle: job.job_title,
    companyName: getEmployerName(job.employer_id),
    city: job.city || '',
    state: job.state || '',
    salaryMin: String(job.salary_min ?? 0),
    salaryMax: String(job.salary_max ?? 0),
    employmentType: job.employment_type,
    experienceRequired: `${job.experience_min_years ?? 0}-${job.experience_max_years ?? 0} years`,
    skillsRequired: jobSkills[job.id] || [],
    applicants: [],
    isVerified: job.is_verified,
  });

  const displayJobs = useMemo(() => jobs.map(mapJob), [jobs, employers, jobSkills]);

  const appliedJobIds = useMemo(() => new Set(applications.map(a => a.job_id)), [applications]);

  const myMatches = useMemo(() => {
    return matches.map(m => {
      const job = jobs.find(j => j.id === m.job_id);
      return {
        ...m,
        jobTitle: job?.job_title || 'Unknown',
        companyName: getEmployerName(job?.employer_id || ''),
        matchScore: m.match_score,
      };
    });
  }, [matches, jobs]);

  const appliedJobs = useMemo(() => {
    return displayJobs.filter(j => appliedJobIds.has(j.id));
  }, [displayJobs, appliedJobIds]);

  const [candidateStatus, setCandidateStatus] = useState<'Open to Work' | 'Interviewing' | 'Placed' | 'Actively Looking'>('Open to Work');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<any | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('rojgaarhai_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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

  const savedJobs = useMemo(() => {
    return displayJobs.filter(j => savedJobIds.includes(j.id));
  }, [displayJobs, savedJobIds]);

  const mappedCandidate = useMemo(() => ({
    id: candidate?.id,
    firstName,
    lastName,
    phone: candidatePhone,
    email: candidateEmail,
    dob: candidate?.date_of_birth || '',
    location: candidate?.location || '',
    state: candidate?.state || '',
    qualification: candidate?.qualification || '',
    skills: candidate?.skills || [],
    previousCompany: '',
    totalExperience: String(candidate?.total_experience_years ?? 0),
    expectedSalary: String(candidate?.expected_salary_min ?? 0),
    preferredJobType: candidate?.preferred_job_type || '',
    gender: candidate?.gender || 'Male',
    willingToRelocate: candidate?.willing_to_relocate ?? false,
    preferredLocations: [],
    resumeFile: candidate?.resume_url || '',
    profilePhotoFile: candidate?.profile_photo_url || '',
    status: candidate?.status || 'New',
    createdAt: candidate?.created_at || '',
    educationList: (candidate?.education || []).map((e: any) => ({
      id: e.id, degree: e.degree || '', qualification: e.field_of_study || '',
      college: e.institution_name || '', university: '', passingYear: e.end_year ? String(e.end_year) : '', grade: e.grade || '',
    })),
    experienceList: (candidate?.experience || []).map((e: any) => ({
      id: e.id, company: e.company_name || '', designation: e.job_title || '',
      startDate: e.start_date || '', endDate: e.end_date || '', currentlyWorking: e.is_current || false, responsibilities: e.description || '',
    })),
    languageList: (candidate?.languages || []).map((l: any) => ({
      id: l.id, language: l.language_name || '', proficiency: l.proficiency || 'Basic',
    })),
    certificationList: (candidate?.certifications || []).map((c: any) => ({
      id: c.id, name: c.certification_name || '', organization: c.issuing_organization || '',
      year: c.issue_date ? String(new Date(c.issue_date).getFullYear()) : '', credentialId: c.credential_id || '',
    })),
  }), [candidate, profile, user]);

  const profileCompletion = useMemo(() => {
    if (!candidate) return 0;
    let score = 0;
    const fields = [
      firstName, lastName, candidatePhone, candidateEmail,
      candidate.date_of_birth, candidate.location, candidate.state, candidate.qualification,
      '', candidate.total_experience_years ? String(candidate.total_experience_years) : null,
      candidate.expected_salary_min ? String(candidate.expected_salary_min) : null,
      candidate.preferred_job_type,
    ];
    fields.forEach(f => { if (f && f !== 'N/A' && f !== 'Not Specified' && f !== '0') score++; });
    if (candidate.resume_url) score++;
    return Math.round((score / 12) * 100);
  }, [firstName, lastName, candidatePhone, candidateEmail, candidate]);

  useEffect(() => {
    if (candidate && !candidate.qualification) {
      setShowEditProfileModal(true);
    }
    if (candidate?.current_status) {
      setCandidateStatus(candidate.current_status as any);
    }
  }, [candidate]);

  const notifications: any[] = [];

  const upcomingInterviews = useMemo(() => {
    return matches
      .filter(m => m.status === 'Interview Scheduled')
      .map(m => {
        const job = jobs.find(j => j.id === m.job_id);
        return {
          id: m.id,
          company: getEmployerName(job?.employer_id || ''),
          role: job?.job_title || 'Unknown',
          date: m.created_at || 'TBD',
          time: 'TBD',
          mode: 'TBD',
          link: '#',
          countdown: 'Scheduled',
        };
      });
  }, [matches, jobs]);

  const activityLog = useMemo(() => {
    return applications.slice(0, 5).map(app => {
      const job = jobs.find(j => j.id === app.job_id);
      return {
        id: app.id,
        text: `Applied for ${job?.job_title || 'Unknown'} role`,
        date: new Date(app.applied_at).toLocaleString(),
        type: 'applied',
        icon: <CheckCircle size={14} className="text-emerald-500" />,
      };
    });
  }, [applications, jobs]);

  const jobMatchScores = useMemo(() => {
    const map: Record<string, number> = {};
    matches.forEach(m => {
      if (m.job_id && m.match_score != null) {
        map[m.job_id] = m.match_score;
      }
    });
    return map;
  }, [matches]);

  const handleApplyConfirm = async () => {
    if (showApplyModal && candidate) {
      await createApplication({
        candidate_id: candidate.id,
        job_id: showApplyModal.id,
        status: 'applied',
        applied_at: new Date().toISOString(),
      });
      setShowApplyModal(null);
      setToastMessage(`Application for ${showApplyModal.job_title} submitted successfully!`);
      refresh();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) { navigate('/login/candidate'); return null; }
  if (loading) {
    return <DashboardSkeleton />;
  }
  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-warm)]" style={{ fontFamily: 'var(--font)' }}>
        <p className="text-[var(--navy)] font-semibold">No candidate profile found.</p>
      </div>
    );
  }

  const timelineStages = [
    { stage: 1, label: 'Registered', isDone: true, date: candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : 'N/A' },
    { stage: 2, label: 'Profile Completed', isDone: profileCompletion >= 70, date: profileCompletion >= 70 ? 'Verified' : 'In Progress' },
    { stage: 3, label: 'Applied', isDone: appliedJobs.length > 0, date: `${appliedJobs.length} Jobs` },
    { stage: 4, label: 'Shortlisted', isDone: myMatches.some(m => ['Shortlisted', 'Interview Scheduled', 'Offered', 'Hired'].includes(m.status)), date: `${myMatches.length} Matches` },
    { stage: 5, label: 'Interview Scheduled', isDone: myMatches.some(m => ['Interview Scheduled', 'Offered', 'Hired'].includes(m.status)), date: `${upcomingInterviews.length} Scheduled` },
    { stage: 6, label: 'Offer Received', isDone: myMatches.some(m => ['Offered', 'Hired'].includes(m.status)), date: '1 Offer' },
    { stage: 7, label: 'Placed', isDone: candidate.status === 'Placed', date: candidate.status === 'Placed' ? 'Hired!' : 'Pending' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-warm)] text-[var(--navy)] transition-colors duration-300 pb-16" style={{ fontFamily: 'var(--font)' }}>
      <header className="sticky top-0 z-40 bg-[var(--white)]/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/jobs">
              <Button size="sm" variant="outline" className="hidden sm:inline-flex gap-1.5 text-xs">
                <Search size={14} /> Browse Jobs
              </Button>
            </Link>

            <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl hover:bg-slate-100 text-[var(--charcoal)] transition-colors relative"
              title="Notifications"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] sm:w-96 bg-[var(--white)] rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-[var(--navy)] text-sm flex items-center gap-2">
                    <Bell size={16} className="text-[var(--orange)]" /> Notifications
                  </h4>
                  {notifications.length > 0 && (
                    <span className="text-xs bg-[var(--orange)]/10 text-[var(--orange)] px-2 py-0.5 rounded-full font-semibold">
                      {notifications.length} New
                    </span>
                  )}
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto my-2" data-lenis-prevent>
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
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="dash-avatar w-8 h-8 text-[11px] !rounded-full">
              {firstName[0]}{lastName[0]}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-semibold text-[var(--charcoal)] hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="dash-container space-y-9">
        <div className="dash-header">
          <div>
            <h1 className="dash-header__title">Good morning, {firstName}</h1>
            <p className="dash-header__subtitle">
              {candidate.location || 'Unknown'}, {candidate.state || 'Unknown'} · {candidate.total_experience_years ?? 0} yrs exp · Expected ₹{(candidate.expected_salary_min ?? 0).toLocaleString()}/mo
            </p>
          </div>
          <div className="self-start">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--charcoal)] block mb-1.5">Availability</label>
            <select
              value={candidateStatus}
              onChange={async e => {
                const value = e.target.value;
                setCandidateStatus(value as any);
                try {
                  await updateCandidateStatus(candidate.id, value);
                  setToastMessage(`Status updated to "${value}"`);
                } catch (err) {
                  setToastMessage('Failed to update status.');
                }
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
            <div className="dash-metric__value">{appliedJobs.length}</div>
            <div className="dash-metric__label">Applications Sent</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric__value">{profileCompletion}%</div>
            <div className="dash-metric__label">Profile Score</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-2 -mt-4 text-[13px] font-semibold text-[var(--charcoal)]">
          <span>{savedJobs.length} Saved Jobs</span>
          <span>5 Recruiter Contacts</span>
          <span>{myMatches.filter(m => m.status === 'Shortlisted').length} Shortlisted</span>
          <span>{myMatches.filter(m => m.status === 'Offered').length} Offers Received</span>
          <span>{Math.round(myMatches.reduce((acc, m) => acc + m.matchScore, 0) / (myMatches.length || 1))}% Avg Match Score</span>
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-3 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--orange)]/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 right-10 w-20 h-20 bg-[var(--orange)]/10 rounded-full translate-y-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--orange)] bg-[var(--orange)]/20 px-2 py-0.5 rounded-full">Premium</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded-full">Guaranteed Placement</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-1 leading-tight">Get Placed Faster with Premium</h3>
              <p className="text-sm text-slate-300 mb-4 max-w-xl">Everything taken care of — dedicated call support, resume boost, priority matching, and end-to-end placement assistance.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowPremiumModal(true)} className="inline-flex items-center gap-2 bg-[var(--orange)] hover:bg-[#d94d1f] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-900/30">
                  <Sparkles size={16} /> Get Premium — ₹1,000
                </button>
                <span className="text-[11px] text-slate-400">One-time payment · No hidden charges</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--orange)]/10 text-[var(--orange)] flex items-center justify-center mb-2">
              <ShieldCheck size={24} />
            </div>
            <p className="text-sm font-bold text-[var(--navy)]">100% Satisfaction</p>
            <p className="text-xs text-[var(--charcoal)] mt-1">If we don't deliver, we refund. No questions asked.</p>
          </div>
        </div>

        <div className="dash-surface dash-surface--pad">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="dash-section-title">Recruitment Pipeline Progress</div>
              <p className="dash-section-sub">Track your end-to-end progress from registration to placement</p>
            </div>
            <span className="dash-status dash-status--accent">{candidate.status}</span>
          </div>

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

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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
                {displayJobs.slice(0, 4).map(job => {
                  const isSaved = savedJobIds.includes(job.id);
                  const isApplied = appliedJobIds.has(job.id);

                  return (
                    <div key={job.id} className="dash-row px-5 first:pt-4 last:pb-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="dash-avatar">{job.companyName?.charAt(0) || '?'}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link to={`/jobs/${job.id}`} className="font-bold text-[15px] text-[var(--navy)] hover:text-[var(--orange)] transition-colors">
                              {job.jobTitle}
                            </Link>
                             {job.isVerified !== false && (
                               <ShieldCheck size={13} className="text-[var(--green)]" />
                             )}
                             <span className="text-[12px] font-bold text-[var(--orange)]">
                               {jobMatchScores[job.id] != null ? `${jobMatchScores[job.id]}% Match` : 'New'}
                             </span>
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

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--navy)] flex items-center gap-2">
                  <Video size={20} className="text-emerald-500" /> Upcoming Interviews ({upcomingInterviews.length})
                </h3>
                {upcomingInterviews.length > 0 && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Confirmed
                  </span>
                )}
              </div>

              {upcomingInterviews.length === 0 ? (
                <p className="text-sm text-[var(--charcoal)] text-center py-6">
                  No upcoming interviews scheduled.
                </p>
              ) : (
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
                        <Button size="sm" variant="outline" className="text-xs px-2.5" onClick={() => downloadInterviewIcs(int)}>
                          <Calendar size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

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
          </div>

          <div className="space-y-8">
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
                  { label: 'Resume Uploaded', done: Boolean(candidate.resume_url) },
                  { label: 'Education Added', done: Boolean(candidate.qualification) },
                  { label: 'Experience Added', done: Boolean(candidate.total_experience_years) },
                  { label: 'Aadhaar Verification', done: false },
                  { label: 'Skills Assessment', done: false },
                  { label: 'Profile Picture', done: Boolean(candidate.profile_photo_url) },
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

            <div className="dash-surface dash-surface--pad">
              <div className="dash-section-title mb-3 flex items-center gap-2">
                <HugeiconsIcon icon={File01Icon} size={18} /> Resume Center
              </div>

              <p className="font-bold text-sm text-[var(--navy)] truncate">{candidate.resume_url ? candidate.resume_url.split('/').pop() : 'No resume uploaded'}</p>
              <p className="text-[11px] text-[var(--charcoal)] mb-3">
                {candidate.resume_url ? `Uploaded ${new Date(candidate.updated_at || candidate.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Upload a resume to let employers view it'}
              </p>

              <div className="flex gap-2">
                <button
                  className="dash-btn dash-btn-secondary dash-btn--compact flex-1"
                  onClick={() => candidate.resume_url ? window.open(candidate.resume_url, '_blank') : setToastMessage('No resume uploaded yet. Use Replace to upload one.')}
                >
                  <HugeiconsIcon icon={ViewIcon} size={15} /> Preview
                </button>
                <button
                  className="dash-btn dash-btn-secondary dash-btn--compact flex-1"
                  onClick={() => candidate.resume_url ? window.open(candidate.resume_url, '_blank') : setToastMessage('No resume uploaded yet. Use Replace to upload one.')}
                >
                  <HugeiconsIcon icon={Download04Icon} size={15} /> Download
                </button>
                <button className="dash-btn dash-btn-primary dash-btn--compact flex-1" onClick={() => setShowResumeModal(true)}>
                  <HugeiconsIcon icon={Upload04Icon} size={15} /> Replace
                </button>
              </div>
            </div>

            <div className="dash-surface dash-surface--pad">
              <div className="dash-section-title mb-3">Your Skills</div>
              <div className="flex flex-wrap gap-2">
                {candidate.skills && candidate.skills.length > 0 ? (
                  candidate.skills.map((skill: string) => (
                    <span key={skill} className="inline-flex items-center px-3 py-1.5 rounded-full bg-[var(--orange)]/10 text-[var(--orange)] text-xs font-bold border border-[var(--orange)]/20">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-[var(--charcoal)]">No skills added yet. Complete your profile to add skills.</p>
                )}
              </div>
            </div>

            <div className="dash-surface dash-surface--pad">
              <div className="dash-section-title mb-3 flex items-center gap-2">
                <HugeiconsIcon icon={Activity03Icon} size={18} /> Recent Activity
              </div>
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
          </div>
        </div>
      </div>

      {showApplyModal && (
        <Modal isOpen={Boolean(showApplyModal)} onClose={() => setShowApplyModal(null)} title="Confirm Job Application" size="md">
          <div className="space-y-4">
            <div className="p-4 bg-[var(--orange)]/10 rounded-xl border border-[var(--orange)]/20">
              <p className="text-xs text-[var(--orange)] font-semibold uppercase">Applying For</p>
              <h3 className="text-lg font-bold text-[var(--navy)] mt-0.5">{showApplyModal.jobTitle}</h3>
              <p className="text-xs text-[var(--charcoal)] font-medium">{showApplyModal.companyName} • {showApplyModal.city}</p>
            </div>
            <div className="p-4 bg-[var(--white)] rounded-xl border border-slate-200 text-xs space-y-1.5">
              <p><span className="text-slate-400">Applicant:</span> <strong className="text-[var(--navy)]">{firstName} {lastName}</strong></p>
              <p><span className="text-slate-400">Email:</span> <span className="text-[var(--navy)]">{candidateEmail}</span></p>
              <p><span className="text-slate-400">Experience:</span> <span className="text-[var(--navy)]">{candidate.total_experience_years ?? 0} Years</span></p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowApplyModal(null)}>Cancel</Button>
              <Button variant="success" onClick={handleApplyConfirm} className="gap-1 bg-[var(--orange)]"><UserCheck size={16} /> Confirm Application</Button>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={showResumeModal} onClose={() => setShowResumeModal(false)} title="Upload Updated Resume" size="md">
        <div className="space-y-4">
          <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-[var(--white)]">
            <Upload size={32} className="text-[var(--orange)] mx-auto mb-2" />
            <p className="text-sm font-bold text-[var(--navy)]">Choose a PDF or DOCX file</p>
            <p className="text-xs text-slate-400 mt-1">Maximum file size: 5MB</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              id="resume-upload-input"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !user) return;
                if (file.size > 5 * 1024 * 1024) {
                  setToastMessage('File too large. Maximum size is 5MB.');
                  return;
                }
                setUploadingResume(true);
                try {
                  await uploadCandidateResume(user.id, file);
                  await refresh();
                  setShowResumeModal(false);
                  setToastMessage('Resume uploaded successfully!');
                } catch (err) {
                  setToastMessage(err instanceof Error ? err.message : 'Failed to upload resume.');
                } finally {
                  setUploadingResume(false);
                }
              }}
            />
            <Button
              size="sm"
              className="mt-4 bg-[var(--orange)]"
              disabled={uploadingResume}
              onClick={() => document.getElementById('resume-upload-input')?.click()}
            >
              {uploadingResume ? 'Uploading...' : 'Select File'}
            </Button>
          </div>
        </div>
      </Modal>

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        candidate={mappedCandidate}
        onSave={async (updates) => {
          try {
            await updateCandidateProfile(user.id, updates);
            await refresh();
            setToastMessage('Profile updated successfully.');
          } catch (err) {
            setToastMessage(err instanceof Error ? err.message : 'Failed to save profile.');
          }
        }}
      />

      <Modal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} title="Premium Placement Plan" size="lg">
        <div className="space-y-0">
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--orange)]/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 right-10 w-24 h-24 bg-[var(--orange)]/10 rounded-full translate-y-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--orange)] bg-[var(--orange)]/20 px-2.5 py-1 rounded-full">Premium</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-400/10 px-2.5 py-1 rounded-full">Guaranteed Placement</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">Everything taken care of.</h3>
              <p className="text-sm text-slate-300 mb-5 max-w-lg">We personally ensure you get placed in a verified company. From resume to offer letter — we handle the entire process for you.</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-extrabold text-white">₹1,000</span>
                <span className="text-sm text-slate-400">one-time payment</span>
              </div>
              <p className="text-xs text-slate-400">No hidden charges · 100% refund if not placed</p>
            </div>
          </div>

          <div className="py-5 space-y-3">
            <h4 className="text-xs font-bold text-[var(--charcoal)] uppercase tracking-widest">What's Included</h4>
            <div className="grid gap-2.5">
              {[
                { title: 'Guaranteed Placement', desc: 'Personal placement guarantee in a verified company.' },
                { title: 'Dedicated Call Support', desc: 'Direct access to our placement team whenever you need.' },
                { title: 'Resume & Profile Boost', desc: 'Expert optimization for top employers.' },
                { title: 'Priority Matching', desc: 'Get matched with best-fit roles before others.' },
                { title: 'End-to-End Assistance', desc: 'Application to offer letter — we manage it all.' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 bg-[var(--bg-warm)] rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-[var(--orange)] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--navy)]">{feature.title}</p>
                    <p className="text-xs text-[var(--charcoal)] mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">100% Satisfaction Guarantee</p>
              <p className="text-xs text-emerald-700 mt-0.5">If we don't deliver placement within the agreed timeline, we refund. No questions asked.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button variant="ghost" onClick={() => setShowPremiumModal(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" className="flex-1 gap-2 bg-[var(--orange)] hover:bg-[#d94d1f]" onClick={() => {
              setShowPremiumModal(false);
              setToastMessage('Payment integration coming soon! Please contact support@rojgaarhai.com to proceed.');
            }}>
              Proceed to Payment — ₹1,000
            </Button>
          </div>
        </div>
      </Modal>

      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}

export { CandidateDashboard };
