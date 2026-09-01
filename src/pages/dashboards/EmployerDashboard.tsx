import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, Briefcase, Users, MapPin, FileText, LogOut, Eye, IndianRupee,
  Plus, ShieldCheck, Star, ChevronDown, ChevronUp, Search,
  Download, Copy, Share2, PauseCircle, Trash2,
  XCircle, Video
} from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Activity03Icon } from '@hugeicons/core-free-icons';
import { Badge, Button, Modal, Toast } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { updateJobPosting, duplicateJobPosting, updateApplicationStatus, createCommunication, updateEmployerProfile } from '../../lib/supabase/data';
import { supabase } from '../../lib/supabase/client';
import { DashboardSkeleton } from '../../components/Skeleton';
import EditCompanyModal from '../../components/EditCompanyModal';

function formatExperience(min: number | null, max: number | null): string {
  if (min != null && max != null) return `${min}-${max} years`;
  if (min != null) return `${min}+ years`;
  return 'Not specified';
}

function mapJob(job: any, employerName: string, skillsMap: Record<string, string[]>): any {
  return {
    id: job.id,
    employerId: job.employer_id,
    companyName: employerName,
    jobTitle: job.job_title,
    numberOfOpenings: job.number_of_openings,
    city: job.city || '',
    state: job.state || '',
    salaryMin: job.salary_min?.toString() || '0',
    salaryMax: job.salary_max?.toString() || '0',
    employmentType: job.employment_type,
    qualificationRequired: job.qualification_required || '',
    experienceRequired: formatExperience(job.experience_min_years, job.experience_max_years),
    skillsRequired: skillsMap[job.id] || [],
    jobDescription: job.job_description,
    benefits: job.benefits || '',
    joiningTimeline: job.joining_timeline || '',
    accommodationProvided: job.accommodation_provided,
    transportationProvided: job.transportation_provided,
    additionalNotes: job.additional_notes || '',
    status: job.status,
    createdAt: job.created_at,
    isVerified: job.is_verified,
    approvedBy: job.approved_by,
    approvedAt: job.approved_at,
    deadline: job.deadline,
    workingHours: job.working_hours,
    recruiterName: job.recruiter_name,
    recruiterEmail: job.recruiter_email,
    recruiterPhone: job.recruiter_phone,
  };
}

function mapCandidateToApplicant(candidate: any): any {
  const fullName = candidate.profile_name || '';
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: candidate.id,
    firstName,
    lastName,
    phone: candidate.profile_phone || '',
    email: '',
    dob: candidate.date_of_birth || '',
    location: candidate.location || candidate.city || '',
    state: candidate.state || '',
    country: candidate.country || '',
    gender: candidate.gender || '',
    qualification: candidate.qualification || '',
    skills: candidate.skills || [],
    previousCompany: '',
    totalExperience: `${candidate.total_experience_years || 0} years`,
    willingToRelocate: candidate.willing_to_relocate,
    expectedSalary: candidate.expected_salary_min?.toString() || candidate.expected_salary_max?.toString() || '0',
    preferredJobType: candidate.preferred_job_type || '',
    status: candidate.status || 'New',
    createdAt: candidate.created_at,
    resumeFile: candidate.resume_url || '',
    profilePhotoFile: candidate.profile_photo_url || '',
    linkedin: candidate.linkedin_url || '',
    github: candidate.github_url || '',
    portfolio: candidate.portfolio_url || '',
    website: candidate.website_url || '',
    bio: candidate.bio || '',
    aadhaarNumber: candidate.aadhaar_number || '',
    panNumber: candidate.pan_number || '',
    nationality: candidate.nationality || '',
    maritalStatus: candidate.marital_status || '',
    currentStatus: candidate.current_status || '',
    immediateJoining: candidate.immediate_joining,
    noticePeriod: candidate.notice_period || '',
    preferredShift: candidate.preferred_shift || '',
    specialization: candidate.specialization || '',
    referredBy: candidate.referred_by || '',
    referralCodeUsed: candidate.referral_code_used || '',
  };
}

function EmployerDashboard() {
  const { employer: employerData, jobs, applications, candidates, matches, placements, jobSkills, loading, refresh } = useDatabase();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [expandedJobIds, setExpandedJobIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('All');
  const [viewingApplicant, setViewingApplicant] = useState<any | null>(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [showProfilePreviewModal, setShowProfilePreviewModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [applicantStageFilter, setApplicantStageFilter] = useState<string>('all');
  const [companyForm, setCompanyForm] = useState<any>(null);
  const [savingCompany, setSavingCompany] = useState(false);

  const mappedEmployer = useMemo(() => {
    if (!employerData) return null;
    return {
      id: employerData.id,
      companyName: employerData.company_name || '',
      companyNameSet: Boolean(employerData.company_name),
      industry: employerData.industry || '',
      companySize: employerData.company_size || '',
      yearEstablished: employerData.year_established?.toString() || '',
      website: employerData.website || '',
      address: employerData.address || '',
      city: employerData.city || '',
      state: employerData.state || '',
      contactName: employerData.contact_name || '',
      contactEmail: employerData.contact_email || '',
      contactPhone: employerData.contact_phone || '',
      gstNumber: employerData.gst_number || '',
      verified: employerData.verified,
      referralCode: employerData.referral_code,
      createdAt: employerData.created_at,
    };
  }, [employerData]);

  const candidatesMap = useMemo(() => {
    return new Map(candidates.map((c: any) => [c.id, c]));
  }, [candidates]);

  const myJobs = useMemo(() => {
    if (!mappedEmployer) return [];
    return jobs.map(j => mapJob(j, mappedEmployer.companyName, jobSkills));
  }, [jobs, mappedEmployer, jobSkills]);

  const myPlacements = useMemo(() => {
    if (!mappedEmployer) return [];
    return placements.filter((p: any) => p.employer_id === mappedEmployer.id);
  }, [placements, mappedEmployer]);

  const totalApplicants = useMemo(() => {
    return myJobs.reduce((sum, j) => sum + applications.filter((a: any) => a.job_id === j.id).length, 0);
  }, [myJobs, applications]);

  const activeJobs = useMemo(() => {
    return myJobs.filter(j => j.status === 'Open').length;
  }, [myJobs]);

  const interviewsScheduled = useMemo(() => {
    const myJobIds = new Set(myJobs.map(j => j.id));
    return matches.filter((m: any) => myJobIds.has(m.job_id) && m.status === 'Interview Scheduled').length;
  }, [matches, myJobs]);

  useEffect(() => {
    if (!mappedEmployer || mappedEmployer.companyNameSet) return;
    const dismissedKey = `rojgaarhai_company_profile_skipped_${mappedEmployer.id}`;
    if (localStorage.getItem(dismissedKey)) return;
    setCompanyForm({
      companyName: '', industry: '', companySize: '', yearEstablished: '', website: '', gstNumber: '', address: '',
      city: mappedEmployer.city, state: mappedEmployer.state,
      contactName: mappedEmployer.contactName, contactEmail: mappedEmployer.contactEmail, contactPhone: mappedEmployer.contactPhone,
    });
    setShowEditCompanyModal(true);
  }, [mappedEmployer?.id, mappedEmployer?.companyNameSet]);

  const employerActivities = useMemo(() => {
    const activities: any[] = [];
    jobs.slice(0, 3).forEach((job: any) => {
      activities.push({
        id: job.id,
        text: `Published new job opening for ${job.job_title} (${job.number_of_openings} vacancies)`,
        date: new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        icon: <Briefcase size={14} className="text-teal-500" />,
      });
    });
    applications.slice(0, 3).forEach((app: any) => {
      const candidate = candidatesMap.get(app.candidate_id);
      const job = jobs.find((j: any) => j.id === app.job_id);
      if (candidate && job) {
        activities.push({
          id: app.id,
          text: `${candidate.profile_name || 'A candidate'} applied for ${job.job_title} position`,
          date: new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          icon: <Users size={14} className="text-[var(--orange)]" />,
        });
      }
    });
    return activities.slice(0, 5);
  }, [jobs, applications, candidatesMap]);

  const employerNotifications = useMemo(() => {
    const notifications: any[] = [];
    const newApplicants = applications.filter((a: any) => {
      const diffMs = Date.now() - new Date(a.applied_at).getTime();
      return diffMs < 24 * 60 * 60 * 1000;
    });
    if (newApplicants.length > 0) {
      notifications.push({
        id: 'new-apps',
        title: `${newApplicants.length} New Applicant${newApplicants.length > 1 ? 's' : ''}`,
        text: `Candidates applied to your postings recently.`,
        time: 'Today',
      });
    }
    matches.filter((m: any) => m.status === 'Interview Scheduled').slice(0, 2).forEach((match: any) => {
      const job = jobs.find((j: any) => j.id === match.job_id);
      const candidate = candidatesMap.get(match.candidate_id);
      if (job && candidate) {
        notifications.push({
          id: match.id,
          title: 'Interview Scheduled',
          text: `Interview set with ${candidate.profile_name || 'a candidate'} for ${job.job_title}.`,
          time: 'Upcoming',
        });
      }
    });
    return notifications.slice(0, 5);
  }, [applications, matches, jobs, candidatesMap]);

  const atsInsights = useMemo(() => {
    const totalMatches = matches.length;
    const avgMatchScore = totalMatches > 0 ? Math.round(matches.reduce((sum: number, m: any) => sum + (m.match_score || 0), 0) / totalMatches) : 0;
    const respondedCount = applications.filter((a: any) => a.status !== 'applied').length;
    const responseRate = applications.length > 0 ? Math.round((respondedCount / applications.length) * 100) : 0;
    return {
      avgMatchScore,
      responseRate,
      totalApplications: applications.length,
    };
  }, [matches, applications]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!mappedEmployer) {
    navigate('/login/employer');
    return null;
  }

  const employer = mappedEmployer;

  const toggleExpandJob = (jobId: string) => {
    if (expandedJobIds.includes(jobId)) {
      setExpandedJobIds(expandedJobIds.filter(id => id !== jobId));
    } else {
      setExpandedJobIds([...expandedJobIds, jobId]);
    }
  };

  const getApplicantsForJob = (jobId: string) => {
    const jobApplications = applications.filter((a: any) => a.job_id === jobId);
    return jobApplications
      .map((a: any) => {
        const c = candidatesMap.get(a.candidate_id);
        if (!c) return null;
        return { ...mapCandidateToApplicant(c), applicationId: a.id, applicationStatus: a.status };
      })
      .filter(Boolean);
  };

  const getMatchesForJob = (jobId: string) => {
    return matches.filter((m: any) => m.job_id === jobId);
  };

  const filteredJobs = myJobs.filter((job: any) => {
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
      const matchSkill = job.skillsRequired.some((s: string) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchCity && !matchSkill) return false;
    }
    return true;
  });

  const handleJobAction = async (action: string, job: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (action === 'Pause') {
        const newStatus = job.status === 'On Hold' ? 'Open' : 'On Hold';
        await updateJobPosting(job.id, { status: newStatus });
        setToastMessage(`Job "${job.jobTitle}" status changed to ${newStatus}.`);
        await refresh();
      } else if (action === 'Close') {
        await updateJobPosting(job.id, { status: 'Closed' });
        setToastMessage(`Job "${job.jobTitle}" marked as Closed.`);
        await refresh();
      } else if (action === 'Duplicate') {
        await duplicateJobPosting(job.id);
        setToastMessage(`Duplicated "${job.jobTitle}" as a new draft pending approval.`);
        await refresh();
      } else if (action === 'Share') {
        const link = `${window.location.origin}/jobs/${job.id}`;
        await navigator.clipboard.writeText(link);
        setToastMessage(`Job link for "${job.jobTitle}" copied to clipboard!`);
      }
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Action failed. Please try again.');
    }
  };

  const handleCandidateAction = async (action: string, applicant: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (action === 'Shortlist') {
        await updateApplicationStatus(applicant.applicationId, 'shortlisted');
        setToastMessage(`${applicant.firstName} ${applicant.lastName} shortlisted successfully!`);
        await refresh();
      } else if (action === 'Interview') {
        await updateApplicationStatus(applicant.applicationId, 'interview_scheduled');
        await createCommunication({
          type: 'call',
          contact_type: 'candidate',
          candidate_id: applicant.id,
          employer_id: employer.id,
          contact_name: `${applicant.firstName} ${applicant.lastName}`,
          subject: 'Interview Scheduled',
          notes: `Interview invitation sent for application ${applicant.applicationId}.`,
        } as any);
        setToastMessage(`Interview scheduled invitation sent to ${applicant.firstName} ${applicant.lastName}.`);
        await refresh();
      } else if (action === 'Reject') {
        await updateApplicationStatus(applicant.applicationId, 'rejected');
        setToastMessage(`Application for ${applicant.firstName} ${applicant.lastName} moved to rejected.`);
        await refresh();
      } else if (action === 'Download') {
        if (applicant.resumeFile) {
          window.open(applicant.resumeFile, '_blank');
        } else {
          setToastMessage(`${applicant.firstName} ${applicant.lastName} has not uploaded a resume yet.`);
        }
      } else if (action === 'Message') {
        await createCommunication({
          type: 'email',
          contact_type: 'candidate',
          candidate_id: applicant.id,
          employer_id: employer.id,
          contact_name: `${applicant.firstName} ${applicant.lastName}`,
          subject: 'Message from Recruiter',
          notes: `Recruiter reached out to ${applicant.firstName} regarding their application.`,
        } as any);
        setToastMessage(`Message logged for ${applicant.firstName}. Our team will follow up.`);
        await refresh();
      }
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Action failed. Please try again.');
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('job_postings').delete().eq('id', jobToDelete.id);
      if (error) throw error;
      setToastMessage(`Job "${jobToDelete.jobTitle}" deleted successfully.`);
      setJobToDelete(null);
      await refresh();
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to delete job.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditCompany = () => {
    setCompanyForm({
      companyName: employer.companyName,
      industry: employer.industry,
      companySize: employer.companySize,
      yearEstablished: employer.yearEstablished,
      website: employer.website,
      gstNumber: employer.gstNumber,
      address: employer.address,
      city: employer.city,
      state: employer.state,
      contactName: employer.contactName,
      contactEmail: employer.contactEmail,
      contactPhone: employer.contactPhone,
    });
    setShowEditCompanyModal(true);
  };

  const saveCompanyEdit = async (submittedForm: typeof companyForm) => {
    if (!submittedForm) return;
    setSavingCompany(true);
    try {
      await updateEmployerProfile(employer.id, {
        company_name: submittedForm.companyName,
        industry: submittedForm.industry,
        company_size: submittedForm.companySize,
        year_established: submittedForm.yearEstablished ? Number(submittedForm.yearEstablished) : null,
        website: submittedForm.website,
        gst_number: submittedForm.gstNumber,
        address: submittedForm.address,
        city: submittedForm.city,
        state: submittedForm.state,
        contact_name: submittedForm.contactName,
        contact_email: submittedForm.contactEmail,
        contact_phone: submittedForm.contactPhone,
      } as any);
      setToastMessage('Company details updated successfully.');
      setShowEditCompanyModal(false);
      await refresh();
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to update company details.');
    } finally {
      setSavingCompany(false);
    }
  };

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
            <span className="dash-status dash-status--neutral ml-1">Employer Workspace</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/dashboard/employer/post-job">
              <button className="dash-btn dash-btn-primary dash-btn--compact hidden sm:inline-flex">
                <Plus size={14} /> Post New Job
              </button>
            </Link>

            <div className="flex items-center gap-3 pl-3 border-l border-[#E7E2D9]">
              <div className="dash-avatar">{employer.companyName.charAt(0) || '🏢'}</div>
              <button
                onClick={async () => { await logout(); navigate('/'); }}
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
              <h1 className="dash-header__title">{employer.companyName || 'Complete Your Company Profile'}</h1>
              {employer.verified && <span className="dash-status dash-status--success"><ShieldCheck size={11} /> Verified</span>}
            </div>
            <p className="dash-header__subtitle">
              Employer Workspace · {employer.industry} · {employer.city}, {employer.state} · Contact: {employer.contactName}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button onClick={openEditCompany} className="dash-btn dash-btn-secondary dash-btn--compact">
              Edit Company
            </button>
            <button onClick={() => setShowProfilePreviewModal(true)} className="dash-btn dash-btn-secondary dash-btn--compact">
              Preview Profile
            </button>
            <Link to="/dashboard/employer/post-job">
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
            <div className="dash-metric__value">{interviewsScheduled}</div>
            <div className="dash-metric__label">Interviews Scheduled</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric__value">{myPlacements.length}</div>
            <div className="dash-metric__label">Placements Joined</div>
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

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
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
              <Link to="/dashboard/employer/post-job">
                <button className="dash-btn dash-btn-primary mt-4 mx-auto">
                  <Plus size={16} /> Create First Job Posting
                </button>
              </Link>
            </div>
          ) : (
            <div className="dash-surface divide-y divide-[#EFEAE1]">
              {filteredJobs.map((job: any) => {
                const isExpanded = expandedJobIds.includes(job.id);
                const applicants = getApplicantsForJob(job.id);
                const jobMatches = getMatchesForJob(job.id);
                const statusVariant = job.status === 'Open' ? 'success' : job.status === 'Pending' ? 'warning' : job.status === 'On Hold' ? 'warning' : 'danger';

                // Filter applicants by selected stage
                const filteredApplicants = applicants.filter((a: any) => {
                  if (applicantStageFilter === 'all') return true;
                  if (applicantStageFilter === 'applied') return !['shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'joined', 'rejected', 'withdrawn'].includes(a.applicationStatus);
                  if (applicantStageFilter === 'reviewed') return a.applicationStatus !== 'applied';
                  if (applicantStageFilter === 'shortlisted') return a.applicationStatus === 'shortlisted';
                  if (applicantStageFilter === 'interview') return a.applicationStatus === 'interview_scheduled' || a.applicationStatus === 'interviewed';
                  if (applicantStageFilter === 'selected') return a.applicationStatus === 'selected';
                  if (applicantStageFilter === 'joined') return a.applicationStatus === 'joined';
                  return true;
                });

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
                              {job.status === 'Open' ? 'Open' : job.status === 'Pending' ? 'Pending Approval' : job.status === 'On Hold' ? 'Paused' : 'Closed'}
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
                            <span className="text-[12px] text-[var(--charcoal)] font-medium">Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'} · Expires {job.deadline || 'N/A'}</span>
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
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setJobToDelete(job); }}
                            className="dash-btn-tertiary h-8 w-8 !p-0 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete Job"
                          >
                            <Trash2 size={16} />
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
                           <div className="flex items-center justify-between mb-3">
                             <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--charcoal)]">
                               Recruitment Pipeline Progress
                             </div>
                             {applicantStageFilter !== 'all' && (
                               <button
                                 onClick={() => setApplicantStageFilter('all')}
                                 className="text-[10px] font-bold text-[var(--orange)] hover:underline"
                               >
                                 Clear Filter
                               </button>
                             )}
                           </div>
                           <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs font-bold">
                             <button
                               onClick={() => setApplicantStageFilter(applicantStageFilter === 'applied' ? 'all' : 'applied')}
                               className={`p-2 rounded-lg border transition-all ${applicantStageFilter === 'applied' ? 'bg-[var(--orange)] text-white border-[var(--orange)] shadow-md' : 'bg-[#FAF7F0] text-[var(--navy)] border-[#E7E2D9] hover:border-[var(--orange)]'}`}
                             >
                               Applied ({applicants.filter((a: any) => !['shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'joined', 'rejected', 'withdrawn'].includes(a.applicationStatus)).length})
                             </button>
                             <button
                               onClick={() => setApplicantStageFilter(applicantStageFilter === 'reviewed' ? 'all' : 'reviewed')}
                               className={`p-2 rounded-lg border transition-all ${applicantStageFilter === 'reviewed' ? 'bg-[var(--orange)] text-white border-[var(--orange)] shadow-md' : 'bg-[#FAF7F0] text-[var(--navy)] border-[#E7E2D9] hover:border-[var(--orange)]'}`}
                             >
                               Reviewed ({applicants.filter((a: any) => a.applicationStatus !== 'applied').length})
                             </button>
                             <button
                               onClick={() => setApplicantStageFilter(applicantStageFilter === 'shortlisted' ? 'all' : 'shortlisted')}
                               className={`p-2 rounded-lg border transition-all ${applicantStageFilter === 'shortlisted' ? 'bg-[var(--orange)] text-white border-[var(--orange)] shadow-md' : 'bg-[#FAF7F0] text-[var(--navy)] border-[#E7E2D9] hover:border-[var(--orange)]'}`}
                             >
                               Shortlisted ({applicants.filter((a: any) => a.applicationStatus === 'shortlisted').length})
                             </button>
                             <button
                               onClick={() => setApplicantStageFilter(applicantStageFilter === 'interview' ? 'all' : 'interview')}
                               className={`p-2 rounded-lg border transition-all ${applicantStageFilter === 'interview' ? 'bg-[var(--orange)] text-white border-[var(--orange)] shadow-md' : 'bg-[#FAF7F0] text-[var(--navy)] border-[#E7E2D9] hover:border-[var(--orange)]'}`}
                             >
                               Interview ({applicants.filter((a: any) => a.applicationStatus === 'interview_scheduled' || a.applicationStatus === 'interviewed').length})
                             </button>
                             <button
                               onClick={() => setApplicantStageFilter(applicantStageFilter === 'selected' ? 'all' : 'selected')}
                               className={`p-2 rounded-lg border transition-all ${applicantStageFilter === 'selected' ? 'bg-[var(--green)] text-white border-[var(--green)] shadow-md' : 'bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/30 hover:bg-[var(--green)]/20'}`}
                             >
                               Selected ({applicants.filter((a: any) => a.applicationStatus === 'selected').length})
                             </button>
                             <button
                               onClick={() => setApplicantStageFilter(applicantStageFilter === 'joined' ? 'all' : 'joined')}
                               className={`p-2 rounded-lg border transition-all ${applicantStageFilter === 'joined' ? 'bg-[var(--navy)] text-white border-[var(--navy)] shadow-md' : 'bg-[#FAF7F0] text-[var(--charcoal)] border-[#E7E2D9] hover:border-[var(--navy)]'}`}
                             >
                               Joined ({applicants.filter((a: any) => a.applicationStatus === 'joined').length})
                             </button>
                           </div>
                         </div>

                         {/* APPLICANT CARDS */}
                         <div>
                           <h5 className="text-sm font-extrabold text-[var(--navy)] mb-4 flex items-center gap-2">
                             <Users size={18} className="text-[var(--orange)]" />
                             Candidate Applicants ({filteredApplicants.length})
                             {applicantStageFilter !== 'all' && (
                               <span className="text-xs font-normal text-[var(--orange)]">
                                 (filtered by: {applicantStageFilter})
                               </span>
                             )}
                           </h5>

                           {filteredApplicants.length === 0 ? (
                                <p className="text-sm text-[var(--charcoal)] py-6 text-center bg-[var(--white)] rounded-2xl border border-slate-200">
                                  {applicants.length === 0
                                    ? 'No candidate has applied to this posting yet.'
                                    : 'No applicants match the selected filter.'}
                                </p>
                           ) : (
                             <div className="space-y-4">
                               {filteredApplicants.map((applicant: any) => {
                                 const match = jobMatches.find((m: any) => m.candidate_id === applicant.id);
                                 const isShortlisted = applicant.applicationStatus === 'shortlisted';
                                 const isRejected = applicant.applicationStatus === 'rejected';

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
                                            {applicant.qualification} • {applicant.totalExperience} • {applicant.location}, {applicant.state}
                                          </p>

                                          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--charcoal)] mt-2 font-medium">
                                             <span>Expected: <strong className="text-emerald-600 font-bold">₹{parseInt(applicant.expectedSalary).toLocaleString()}/mo</strong></span>
                                            <span>• Availability: ⚡ {applicant.immediateJoining ? 'Immediate' : 'As per notice period'}</span>
                                            <span>• Resume: 📄 {applicant.resumeFile ? 'Uploaded' : 'Not uploaded'}</span>
                                          </div>

                                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                                            {applicant.skills.slice(0, 4).map((s: string) => (
                                              <Badge key={s} variant="info" className="text-[10px]">{s}</Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Match Score & Actions */}
                                      <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-center">
                                        {/* Match Indicator */}
                                        <div className="text-center px-3 py-1.5 rounded-lg bg-[var(--orange)]/8 text-[var(--orange)]">
                                          <p className="text-lg font-extrabold leading-tight">{match?.match_score || 88}%</p>
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
                  <span className="text-base font-extrabold text-[var(--orange)]">{atsInsights.avgMatchScore}%</span>
                </div>
                <div className="dash-progress mt-2">
                  <div className="dash-progress__fill" style={{ width: `${atsInsights.avgMatchScore}%` }} />
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[13px] font-semibold text-[var(--charcoal)]">Response Rate</span>
                <span className="text-base font-extrabold text-[var(--navy)]">{atsInsights.responseRate}%</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[13px] font-semibold text-[var(--charcoal)]">Total Applications</span>
                <span className="text-base font-extrabold text-[var(--navy)]">{atsInsights.totalApplications}</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="dash-surface dash-surface--pad">
            <div className="dash-section-title mb-1">Recent Activity</div>
            <div className="divide-y divide-[#EFEAE1]">
              {employerActivities.map((act: any) => (
                <div key={act.id} className="flex items-start gap-2.5 py-2.5">
                  <HugeiconsIcon icon={Activity03Icon} size={15} className="text-[var(--charcoal)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[var(--navy)] text-[13px] leading-snug">{act.text}</p>
                    <p className="text-[11px] text-[var(--charcoal)] mt-0.5">{act.date}</p>
                  </div>
                </div>
              ))}
              {employerActivities.length === 0 && (
                <p className="text-xs text-[var(--charcoal)] py-4 text-center">No recent activity.</p>
              )}
            </div>
          </div>

          {/* Hiring Notification Panel */}
          <div className="dash-surface dash-surface--pad">
            <div className="dash-section-title mb-1">Hiring Notifications</div>
            <div className="divide-y divide-[#EFEAE1]">
              {employerNotifications.map((n: any) => (
                <div key={n.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-[13px] text-[var(--navy)]">{n.title}</p>
                    <span className="text-[11px] text-[var(--charcoal)] flex-shrink-0">{n.time}</span>
                  </div>
                  <p className="text-[13px] text-[var(--charcoal)] leading-relaxed mt-0.5">{n.text}</p>
                </div>
              ))}
              {employerNotifications.length === 0 && (
                <p className="text-xs text-[var(--charcoal)] py-4 text-center">No new notifications.</p>
              )}
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
                  <span className="text-xs text-[var(--charcoal)]">Registered {viewingApplicant.createdAt ? new Date(viewingApplicant.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Complete Submission Grid */}
             <div className="bg-[var(--white)] rounded-2xl p-4 border border-slate-200">
               <h4 className="text-sm font-bold text-[var(--navy)] mb-3 flex items-center gap-2"><FileText size={16} className="text-[var(--orange)]" /> Complete Candidate Form Submission</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Full Name', value: `${viewingApplicant.firstName} ${viewingApplicant.lastName}` },
                  { label: 'Date of Birth', value: viewingApplicant.dob },
                  { label: 'Gender', value: viewingApplicant.gender },
                  { label: 'Current Location', value: `${viewingApplicant.location}, ${viewingApplicant.state}` },
                  { label: 'Highest Qualification', value: viewingApplicant.qualification },
                  { label: 'Previous Company', value: viewingApplicant.previousCompany || 'N/A (Fresher)' },
                  { label: 'Total Experience', value: viewingApplicant.totalExperience },
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
              <p className="text-[11px] text-[var(--charcoal)] mt-3">
                Candidate contact details (phone, email, address) are kept private and are not shared with employers.
              </p>
            </div>

            {/* Skills */}
            <div>
              <p className="text-xs text-[var(--charcoal)] font-bold mb-1.5">Candidate Skills</p>
              <div className="flex flex-wrap gap-1.5">{viewingApplicant.skills.map((s: string) => <Badge key={s} variant="default">{s}</Badge>)}</div>
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
                <Button size="sm" variant="outline" onClick={() => window.open(viewingApplicant.resumeFile, '_blank')} className="bg-[var(--orange)]">
                  <Download size={14} className="mr-1" /> Download
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ═══ EDIT COMPANY MODAL (step-by-step) ═══ */}
      {companyForm && (
        <EditCompanyModal
          isOpen={showEditCompanyModal}
          onClose={() => setShowEditCompanyModal(false)}
          onSkip={() => {
            if (!mappedEmployer?.companyNameSet && mappedEmployer) {
              localStorage.setItem(`rojgaarhai_company_profile_skipped_${mappedEmployer.id}`, '1');
            }
            setShowEditCompanyModal(false);
          }}
          onSave={saveCompanyEdit}
          initial={companyForm}
          saving={savingCompany}
          isFirstRun={!mappedEmployer?.companyNameSet}
        />
      )}

      {/* ═══ PROFILE PREVIEW MODAL ═══ */}
      <Modal isOpen={showProfilePreviewModal} onClose={() => setShowProfilePreviewModal(false)} title="Your Company Profile" size="lg">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="dash-avatar w-14 h-14 text-xl">{employer.companyName.charAt(0) || '🏢'}</div>
            <div>
              <h3 className="text-lg font-bold text-[var(--navy)]">{employer.companyName || 'Unnamed Company'}</h3>
              <p className="text-sm text-[var(--charcoal)]">{employer.industry} · {employer.city}, {employer.state}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-400">Contact</span><p className="font-semibold text-[var(--navy)]">{employer.contactName}</p></div>
            <div><span className="text-slate-400">Email</span><p className="font-semibold text-[var(--navy)]">{employer.contactEmail}</p></div>
            <div><span className="text-slate-400">Phone</span><p className="font-semibold text-[var(--navy)]">{employer.contactPhone}</p></div>
            <div><span className="text-slate-400">Website</span><p className="font-semibold text-[var(--navy)]">{employer.website || 'N/A'}</p></div>
          </div>
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider mb-2">Active Job Openings ({activeJobs})</p>
            <div className="space-y-2">
              {myJobs.filter(j => j.status === 'Open').map(j => (
                <div key={j.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                  <span className="font-semibold text-[var(--navy)]">{j.jobTitle}</span>
                  <span className="text-xs text-[var(--charcoal)]">{j.city}, {j.state}</span>
                </div>
              ))}
              {activeJobs === 0 && <p className="text-sm text-[var(--charcoal)]">No open jobs right now.</p>}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!jobToDelete} onClose={() => setJobToDelete(null)} title="Delete Job Posting">
        <div className="space-y-4">
          <p className="text-sm text-[var(--charcoal)]">
            Are you sure you want to delete <strong className="text-[var(--navy)]">&quot;{jobToDelete?.jobTitle}&quot;</strong>? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setJobToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleDeleteJob} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}

export { EmployerDashboard };
