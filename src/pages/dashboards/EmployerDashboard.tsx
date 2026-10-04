import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, Briefcase, Users, MapPin, FileText, LogOut, IndianRupee,
  Plus, ShieldCheck, ChevronDown, ChevronUp, Search,
  Download, Share2, PauseCircle, Trash2,
  CheckCircle, Clock
} from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Activity03Icon } from '@hugeicons/core-free-icons';
import { Badge, Button, Modal, Toast } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import CvRequestStatusCard from '../../components/CvRequestStatusCard';
import ApplicantRow, { sortLatestFirst } from '../../components/ApplicantRow';
import EmptyState from '../../components/EmptyState';
import { timeGreeting } from '../../lib/greeting';
import { AllApplicantsModal } from '../../components/AllApplicantsModal';
import { computeMatch } from '../../lib/matching';
import { PayFromUpiButton } from '../../components/UpiPaymentPanel';
import { updateJobPosting, updateApplicationStatus, createCommunication, updateEmployerProfile, createCvRequest, createPermanentRecruitmentRequest } from '../../lib/supabase/data';
import { supabase } from '../../lib/supabase/client';
import { DashboardSkeleton } from '../../components/Skeleton';
import EditCompanyModal from '../../components/EditCompanyModal';
import { useAppTranslation } from '../../hooks/useAppTranslation';

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
  const { t } = useAppTranslation();
  const { employer: employerData, jobs, applications, candidates, matches, placements, jobSkills, cvRequests, permanentRequests, loading, refresh } = useDatabase();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [expandedJobIds, setExpandedJobIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('All');
  const [viewingApplicant, setViewingApplicant] = useState<any | null>(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [allApplicantsJobId, setAllApplicantsJobId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [showProfilePreviewModal, setShowProfilePreviewModal] = useState(false);
  const [showPermanentRecruitmentModal, setShowPermanentRecruitmentModal] = useState(false);
  const [permanentPlan, setPermanentPlan] = useState<'unskilled' | 'skilled'>('unskilled');
  const [showPermanentPaymentModal, setShowPermanentPaymentModal] = useState(false);
  const [permanentUpiTxn, setPermanentUpiTxn] = useState('');
  const [processingPermanentRequest, setProcessingPermanentRequest] = useState(false);
  const [permanentRequestSuccess, setPermanentRequestSuccess] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [applicantStageFilter, setApplicantStageFilter] = useState<string>('all');
  const [companyForm, setCompanyForm] = useState<any>(null);
  const [savingCompany, setSavingCompany] = useState(false);
  const [showCvRequestModal, setShowCvRequestModal] = useState(false);
  const [showCvPlanSelectionModal, setShowCvPlanSelectionModal] = useState(false);
  const [selectedCvPlan, setSelectedCvPlan] = useState<any | null>(null);
  const [processingCvRequest, setProcessingCvRequest] = useState(false);
  const [cvRequestSuccess, setCvRequestSuccess] = useState(false);
  const [cvRequestJobId, setCvRequestJobId] = useState<string | null>(null);
  const [cvRequestUpiTxn, setCvRequestUpiTxn] = useState('');

  const mappedEmployer = useMemo(() => {
    if (!employerData) return null;
    return {
      id: employerData.id,
      companyName: employerData.company_name || '',
      companyNameSet: Boolean(employerData.company_name),
      industry: employerData.industry || '',
      department: (employerData as any).department || '',
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

  const pendingJobs = useMemo(() => {
    return myJobs.filter(j => j.status === 'Pending');
  }, [myJobs]);

  const activeJobsList = useMemo(() => {
    return myJobs.filter(j => j.status === 'Open');
  }, [myJobs]);

  const pendingApprovalCount = useMemo(() => {
    return pendingJobs.length;
  }, [pendingJobs]);

  const cvPlans = [
    { key: 'plan_10', label: '10 Verified CVs', count: 10, amount: 2000, gst: 360, total: 2360 },
    { key: 'plan_20', label: '20 CVs', count: 20, amount: 3000, gst: 540, total: 3540 },
    { key: 'plan_30', label: '30 CVs', count: 30, amount: 4000, gst: 720, total: 4720 },
    { key: 'plan_50', label: '50 CVs', count: 50, amount: 6000, gst: 1080, total: 7080 },
    { key: 'plan_100', label: '100 CVs', count: 100, amount: 8000, gst: 1440, total: 9440 },
  ];

  const permanentPlans = [
    { key: 'unskilled', label: 'Unskilled / General Labour', amount: 4000, gst: 720, total: 4720 },
    { key: 'skilled', label: 'Skilled / Technical Roles', amount: 5000, gst: 900, total: 5900 },
  ];
  const activePermanentPlan = permanentPlans.find(p => p.key === permanentPlan)!;

  const interviewsScheduled = useMemo(() => {
    const myJobIds = new Set(myJobs.map(j => j.id));
    return matches.filter((m: any) => myJobIds.has(m.job_id) && m.status === 'Interview Scheduled').length;
  }, [matches, myJobs]);

  // New employers land straight on the dashboard. Company details are now collected at
  // signup, and "Edit Company" is always available if they want to fill in the rest.

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
    // Live scores for every application on your jobs, from the same engine candidates see
    const liveScores = applications
      .map((a: any) => {
        const c = candidatesMap.get(a.candidate_id);
        const j = jobs.find((x: any) => x.id === a.job_id);
        return c && j ? computeMatch(c, { ...j, skills_required: jobSkills[j.id] || [] }).score : null;
      })
      .filter((v: number | null): v is number => v !== null);
    const totalMatches = liveScores.length;
    const avgMatchScore = totalMatches > 0 ? Math.round(liveScores.reduce((sum: number, v: number) => sum + v, 0) / totalMatches) : 0;
    const respondedCount = applications.filter((a: any) => a.status !== 'applied').length;
    const responseRate = applications.length > 0 ? Math.round((respondedCount / applications.length) * 100) : 0;
    return {
      avgMatchScore,
      responseRate,
      totalApplications: applications.length,
    };
  }, [applications, jobs, candidatesMap, jobSkills]);

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
        return { ...mapCandidateToApplicant(c), applicationId: a.id, applicationStatus: a.status, appliedAt: a.applied_at };
      })
      .filter(Boolean);
  };

  const getMatchesForJob = (jobId: string) => {
    return matches.filter((m: any) => m.job_id === jobId);
  };

  // Same engine candidates see, so the employer and the candidate read the same number
  const liveMatchFor = (candidateId: string, jobId: string): number => {
    const candidate = candidatesMap.get(candidateId);
    const job = jobs.find((j: any) => j.id === jobId);
    if (!candidate || !job) return 0;
    return computeMatch(candidate, { ...job, skills_required: jobSkills[jobId] || [] }).score;
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
        if (job.status !== 'Open') {
          setToastMessage('Only approved active jobs can be paused or resumed.');
          return;
        }
        const newStatus = job.status === 'On Hold' ? 'Open' : 'On Hold';
        await updateJobPosting(job.id, { status: newStatus });
        setToastMessage(`Job "${job.jobTitle}" status changed to ${newStatus}.`);
        await refresh();
      } else if (action === 'Close') {
        await updateJobPosting(job.id, { status: 'Closed' });
        setToastMessage(`Job "${job.jobTitle}" marked as Closed.`);
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
      } else if (action === 'RequestCV') {
        setSelectedCvPlan({ plan_key: 'plan_10', label: '10 Verified CVs', count: 10, amount: 2000 });
        setCvRequestUpiTxn('');
        setCvRequestSuccess(false);
        setShowCvRequestModal(true);
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

  const handleOpenCvRequestModal = (jobId: string | null = null) => {
    setCvRequestJobId(jobId);
    setSelectedCvPlan(null);
    setCvRequestUpiTxn('');
    setCvRequestSuccess(false);
    setShowCvPlanSelectionModal(true);
  };

  const handleSelectCvPlan = (plan: any) => {
    setSelectedCvPlan(plan);
    setShowCvPlanSelectionModal(false);
    setShowCvRequestModal(true);
  };

  const handleCvPaymentConfirm = async () => {
    if (!selectedCvPlan) return;
    if (!cvRequestUpiTxn.trim()) {
      setToastMessage('Please enter your UPI transaction ID.');
      return;
    }
    setProcessingCvRequest(true);
    try {
      await createCvRequest({
        employer_id: employer.id,
        job_id: cvRequestJobId,
        plan_key: selectedCvPlan.key,
        plan_label: selectedCvPlan.label,
        cv_count: selectedCvPlan.count,
        amount: selectedCvPlan.amount,
        upi_transaction_id: cvRequestUpiTxn.trim(),
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        status: 'pending',
        notes: 'Request submitted via employer dashboard',
      });
      setCvRequestSuccess(true);
      setToastMessage('Your CV request has been submitted. Our team will contact you shortly.');
      await refresh();
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to submit CV request.');
    } finally {
      setProcessingCvRequest(false);
    }
  };

  const handleOpenPermanentModal = () => {
    setPermanentPlan('unskilled');
    setShowPermanentRecruitmentModal(true);
  };

  const handleProceedToPermanentPayment = () => {
    setPermanentUpiTxn('');
    setPermanentRequestSuccess(false);
    setShowPermanentRecruitmentModal(false);
    setShowPermanentPaymentModal(true);
  };

  const handlePermanentPaymentConfirm = async () => {
    if (!permanentUpiTxn.trim()) {
      setToastMessage('Please enter your UPI transaction ID.');
      return;
    }
    setProcessingPermanentRequest(true);
    try {
      await createPermanentRecruitmentRequest({
        employer_id: employer.id,
        candidate_type: activePermanentPlan.key,
        plan_label: activePermanentPlan.label,
        amount: activePermanentPlan.amount,
        upi_transaction_id: permanentUpiTxn.trim(),
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        status: 'pending',
        notes: 'Request submitted via employer dashboard',
      });
      setPermanentRequestSuccess(true);
      setToastMessage('Your permanent recruitment request has been submitted. Our team will contact you shortly.');
      await refresh();
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to submit request.');
    } finally {
      setProcessingPermanentRequest(false);
    }
  };

  const openEditCompany = () => {
    setCompanyForm({
      companyName: employer.companyName,
      industry: employer.industry,
      department: employer.department,
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
        department: submittedForm.department,
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
            <span className="dash-brand-name font-extrabold text-[15px] text-[var(--navy)] tracking-tight hidden sm:inline">{t('app.name')}</span>
            <span className="dash-status dash-status--neutral ml-1 dash-hide-xs">{t('dashboard.employerWorkspace')}</span>
          </Link>

          <div className="flex items-center gap-3 dash-header-right">
            <Link to="/dashboard/employer/post-job">
              <button className="dash-btn dash-btn-primary dash-btn--compact hidden sm:inline-flex dash-desktop-only">
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
            <p className="text-[13px] font-semibold text-[var(--charcoal)] mb-1">{timeGreeting()}, {employer.contactName || 'there'}</p>
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
        <div className="dash-metrics dash-enter">
          <div className="dash-metric">
            <div className="dash-metric__value dash-metric__value--accent">{activeJobs}</div>
            <div className="dash-metric__label">Active Openings</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric__value">{totalApplicants}</div>
            <div className="dash-metric__label">Total Applicants</div>
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

        {/* ═══ APPLICANT FUNNEL: real counts from every application on your jobs ═══ */}
        {(() => {
          const reached = (...statuses: string[]) => applications.filter((a: any) => statuses.includes(a.status)).length;
          const total = applications.length;
          const stages = [
            { label: 'Applied', value: total, tone: 'bg-[var(--navy)]' },
            { label: 'Shortlisted', value: reached('shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'joined'), tone: 'bg-amber-500' },
            { label: 'Interviewed', value: reached('interviewed', 'selected', 'joined'), tone: 'bg-[var(--orange)]' },
            { label: 'Selected', value: reached('selected', 'joined'), tone: 'bg-emerald-600' },
            { label: 'Joined', value: reached('joined'), tone: 'bg-emerald-800' },
          ];
          return (
            <div className="dash-surface dash-surface--pad dash-surface--lift dash-enter dash-enter-d1">
              <div className="flex items-center justify-between mb-4">
                <div className="dash-section-title">Hiring funnel</div>
                <span className="text-xs text-[var(--charcoal)]">{total === 0 ? 'No applications yet' : `${total} applications across your jobs`}</span>
              </div>
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {stages.map((stage, i) => {
                  const pct = total > 0 ? Math.round((stage.value / total) * 100) : 0;
                  const prev = i > 0 ? stages[i - 1].value : 0;
                  const conversion = i > 0 && prev > 0 ? Math.round((stage.value / prev) * 100) : null;
                  return (
                    <div key={stage.label} className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--charcoal)] truncate">{stage.label}</p>
                      <p className="mt-1 text-xl sm:text-2xl font-extrabold text-[var(--navy)] leading-none">{stage.value}</p>
                      <div className="mt-2.5 h-2 rounded-full bg-[#EFEAE1] overflow-hidden">
                        <div className={`h-full rounded-full ${stage.tone} transition-[width] duration-700 ease-out`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1.5 text-[11px] text-[var(--charcoal)] truncate">{conversion === null ? `${pct}% of applied` : `${conversion}% from prev`}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ═══ PERMANENT RECRUITMENT PREMIUM CTA ═══ */}
        <div className="dash-premium-card bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--orange)]/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 right-10 w-24 h-24 bg-[var(--orange)]/10 rounded-full translate-y-1/2" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--orange)] text-white flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--orange)] bg-[var(--orange)]/20 px-2.5 py-1 rounded-full">Premium Service</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-400/10 px-2.5 py-1 rounded-full">Guaranteed Profiles</span>
                </div>
                <h3 className="dash-premium-title text-xl sm:text-2xl font-extrabold mb-1 leading-tight">Get Permanent Recruitment</h3>
                <p className="text-sm text-slate-300 max-w-xl">Verified individuals, guaranteed profiles, and end-to-end hiring support. We handle sourcing, verification, and onboarding — you get ready-to-join candidates.</p>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0">
              <div className="text-right">
                <div className="flex items-baseline gap-2">
                  <span className="dash-premium-price text-3xl font-extrabold text-white">₹4,000+</span>
                  <span className="text-xs text-slate-400">per candidate</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">₹4,000 unskilled · ₹5,000 skilled · + 18% GST</p>
              </div>
              <button onClick={handleOpenPermanentModal} className="inline-flex items-center gap-2 bg-[var(--orange)] hover:bg-[#d94d1f] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-900/30">
                <ShieldCheck size={16} /> Get Permanent Recruitment
              </button>
            </div>
          </div>
        </div>

        {/* ═══ PENDING APPROVAL JOBS ═══ */}
        <div>
          <div className="dash-section-title mb-4">Pending Approval ({pendingApprovalCount})</div>
          {pendingJobs.length === 0 ? (
            <div className="dash-surface text-center py-10">
              <p className="text-sm text-[var(--charcoal)]">No jobs pending approval.</p>
            </div>
          ) : (
            <div className="dash-surface divide-y divide-[#EFEAE1]">
              {pendingJobs.map((job: any) => {
                const isExpanded = expandedJobIds.includes(job.id);
                const applicants = getApplicantsForJob(job.id);
                const jobMatches = getMatchesForJob(job.id);

                return (
                  <div key={job.id}>
                    <div
                      onClick={() => toggleExpandJob(job.id)}
                      className="p-5 sm:p-6 hover:bg-[#FAF7F0] cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                            <h4 className="text-lg font-extrabold text-[var(--navy)]">{job.jobTitle}</h4>
                            <span className="dash-status dash-status--warning">Pending Approval</span>
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
                        <div className="flex items-center gap-1 self-start lg:self-center">
                          <div className="dash-job-expand flex items-center gap-1 ml-1 text-xs font-bold text-[var(--navy)] px-2.5 py-2 rounded-lg hover:bg-[#FAF7F0]">
                            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
           <div className="dash-section-title mb-4">Active Jobs ({activeJobsList.length})</div>

           {activeJobsList.length === 0 ? (
             <EmptyState
               icon={<Briefcase size={20} />}
               title="No active jobs yet"
               body="You don't have any approved active jobs right now. Create a vacancy to start receiving applicants."
               action={<Link to="/dashboard/employer/post-job" className="dash-btn dash-btn-primary dash-btn--compact"><Plus size={14} /> Post New Job</Link>}
             />
           ) : (
             <div className="dash-surface divide-y divide-[#EFEAE1]">
               {activeJobsList.map((job: any) => {
                const isExpanded = expandedJobIds.includes(job.id);
                const applicants = getApplicantsForJob(job.id);
                const jobMatches = getMatchesForJob(job.id);
                const statusVariant = job.status === 'Open' ? 'success' : job.status === 'Pending' ? 'warning' : job.status === 'On Hold' ? 'warning' : 'danger';

                // Filter applicants by selected stage
                const filteredApplicants = applicants.filter((a: any) => {
                  if (applicantStageFilter === 'all') return true;
                  if (applicantStageFilter === 'applied') return !['shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'joined', 'rejected', 'withdrawn', 'request_cv'].includes(a.applicationStatus);
                  if (applicantStageFilter === 'reviewed') return a.applicationStatus !== 'applied';
                  if (applicantStageFilter === 'shortlisted') return a.applicationStatus === 'shortlisted';
                  if (applicantStageFilter === 'request_cv') return a.applicationStatus === 'request_cv';
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
                            <h4 className="text-lg font-extrabold text-[var(--navy)] dash-job-title">
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
                         <div className="flex items-center gap-2 self-start lg:self-center dash-job-actions">
                           <button
                             type="button"
                              onClick={(e) => { e.stopPropagation(); handleOpenCvRequestModal(job.id); }}
                             className="dash-job-cv flex flex-col items-center justify-center gap-0.5 h-[44px] w-[68px] bg-[var(--orange)] text-white rounded-lg border-0 cursor-pointer"
                             title="Request CV"
                           >
                             <FileText size={18} />
                             <span className="text-[9px] font-bold leading-none">Request CV</span>
                           </button>
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

                           <div className="dash-job-expand flex items-center gap-1 ml-1 text-xs font-bold text-[var(--navy)] px-2.5 py-2 rounded-lg hover:bg-[#FAF7F0]">
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
                                onClick={() => setApplicantStageFilter(applicantStageFilter === 'request_cv' ? 'all' : 'request_cv')}
                                className={`p-2 rounded-lg border transition-all ${applicantStageFilter === 'request_cv' ? 'bg-[var(--orange)] text-white border-[var(--orange)] shadow-md' : 'bg-[#FAF7F0] text-[var(--navy)] border-[#E7E2D9] hover:border-[var(--orange)]'}`}
                              >
                                Request CV ({applicants.filter((a: any) => a.applicationStatus === 'request_cv').length})
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

                           {/* CV REQUESTS: below the filters. With "Request CV" selected, every request is shown. */}
                           {(() => {
                             const mine = cvRequests.filter((r: any) => r.employer_id === employer.id && r.job_id === job.id && r.status !== 'cancelled');
                             const showAll = applicantStageFilter === 'request_cv';
                             const list = showAll ? mine : mine.filter((r: any) => r.status !== 'delivered');
                             if (list.length === 0 && !showAll) return null;
                             return (
                               <div className="mt-4 pt-4 border-t border-[#EFEAE1] space-y-3">
                                 <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--charcoal)] flex items-center justify-between">
                                   <span>Your CV requests</span>
                                   <span className="text-[11px] normal-case font-semibold text-[var(--charcoal)]">{list.length} {list.length === 1 ? 'request' : 'requests'}</span>
                                 </div>
                                 {list.length === 0 ? (
                                   <p className="text-xs text-[var(--charcoal)]">No CV requests yet. Use Request CV on an applicant to ask for their CV.</p>
                                 ) : (
                                   list.map((r: any) => <CvRequestStatusCard key={r.id} req={r} />)
                                 )}
                               </div>
                             );
                           })()}
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
                                 <div className="py-6 text-center bg-[var(--white)] rounded-2xl border border-slate-200">
                                   <p className="text-sm text-[var(--charcoal)] mb-3">
                                     {applicants.length === 0
                                       ? 'No candidate has applied to this posting yet.'
                                       : 'No applicants match the selected filter.'}
                                   </p>
                                   {applicants.length === 0 && (
                                     <button
                                       onClick={(e) => { e.stopPropagation(); handleOpenCvRequestModal(job.id); }}
                                       className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--orange)] text-white text-xs font-bold rounded-full border-0 cursor-pointer"
                                     >
                                       <FileText size={14} /> Request Verified CVs
                                     </button>
                                   )}
                                 </div>
                            ) : (
                             <div className="space-y-3">
                               {[...filteredApplicants].sort(sortLatestFirst).slice(0, 2).map((applicant: any) => (
                                 <ApplicantRow
                                   key={applicant.id}
                                   applicant={applicant}
                                   matchScore={liveMatchFor(applicant.id, job.id)}
                                   onView={() => { setViewingApplicant(applicant); setShowApplicantModal(true); }}
                                   onShortlist={(e) => handleCandidateAction('Shortlist', applicant, e)}
                                   onReject={(e) => handleCandidateAction('Reject', applicant, e)}
                                 />
                               ))}
                               {filteredApplicants.length > 2 && (
                                 <button
                                   type="button"
                                   onClick={(e) => { e.stopPropagation(); setAllApplicantsJobId(job.id); }}
                                   className="w-full py-2.5 rounded-xl border border-dashed border-[var(--orange)]/40 text-sm font-bold text-[var(--orange)] hover:bg-[var(--orange)]/5 transition-colors"
                                 >
                                   See all {filteredApplicants.length} applicants →
                                 </button>
                               )}
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
      {(() => {
        const modalJob = allApplicantsJobId ? myJobs.find((j: any) => j.id === allApplicantsJobId) : null;
        return (
          <AllApplicantsModal
            isOpen={Boolean(modalJob)}
            onClose={() => setAllApplicantsJobId(null)}
            jobTitle={modalJob?.jobTitle || ''}
            applicants={allApplicantsJobId ? getApplicantsForJob(allApplicantsJobId) : []}
            matchFor={(candidateId: string) => (allApplicantsJobId ? liveMatchFor(candidateId, allApplicantsJobId) : 0)}
            onView={(applicant) => { setAllApplicantsJobId(null); setViewingApplicant(applicant); setShowApplicantModal(true); }}
            onShortlist={(applicant, e) => handleCandidateAction('Shortlist', applicant, e)}
            onReject={(applicant, e) => handleCandidateAction('Reject', applicant, e)}
          />
        );
      })()}

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

      {/* ═══ PERMANENT RECRUITMENT MODAL ═══ */}
      <Modal isOpen={showPermanentRecruitmentModal} onClose={() => setShowPermanentRecruitmentModal(false)} title="Permanent Recruitment Plan" size="lg">
        <div className="space-y-0">
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--orange)]/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 right-10 w-24 h-24 bg-[var(--orange)]/10 rounded-full translate-y-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--orange)] bg-[var(--orange)]/20 px-2.5 py-1 rounded-full">Premium</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-400/10 px-2.5 py-1 rounded-full">Guaranteed Profiles</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">Verified individuals. Guaranteed placement.</h3>
              <p className="text-sm text-slate-300 mb-5 max-w-lg">We personally handle sourcing, verification, and onboarding. You get ready-to-join, verified candidates — no screening hassle.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                {permanentPlans.map(plan => {
                  const isActive = permanentPlan === plan.key;
                  return (
                    <button
                      key={plan.key}
                      type="button"
                      onClick={() => setPermanentPlan(plan.key as 'unskilled' | 'skilled')}
                      className={`text-left rounded-xl border-2 p-4 transition-all ${isActive ? 'border-[var(--orange)] bg-white/10' : 'border-white/15 hover:border-white/30'}`}
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-300">{plan.label}</p>
                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className="text-2xl font-extrabold text-white">₹{plan.amount.toLocaleString()}</span>
                        <span className="text-xs text-slate-400">+ 18% GST</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Payable: ₹{plan.total.toLocaleString()}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400">One-time fee per candidate · 100% refund if profile doesn't match</p>
            </div>
          </div>

          <div className="py-5 space-y-3">
            <h4 className="text-xs font-bold text-[var(--charcoal)] uppercase tracking-widest">What's Included</h4>
            <div className="grid gap-2.5">
              {[
                { title: 'Verified Candidates', desc: 'Every profile is Aadhaar, experience, and skill verified.' },
                { title: 'Guaranteed Placement', desc: 'We ensure the candidate joins and stays for the agreed period.' },
                { title: 'End-to-End Support', desc: 'From sourcing to onboarding — we manage the entire process.' },
                { title: 'Dedicated Relationship Manager', desc: 'Single point of contact for all hiring needs.' },
                { title: 'Trusted, Placed Candidates', desc: 'Every placed candidate is tracked for trust and long-term fit.' },
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
              <p className="text-xs text-emerald-700 mt-0.5">If the candidate doesn't meet the agreed criteria, we refund. No questions asked.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button variant="ghost" onClick={() => setShowPermanentRecruitmentModal(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" className="flex-1 gap-2 bg-[var(--orange)] hover:bg-[#d94d1f]" onClick={handleProceedToPermanentPayment}>
              Proceed to Payment — ₹{activePermanentPlan.total.toLocaleString()}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ═══ PERMANENT RECRUITMENT PAYMENT MODAL ═══ */}
      <Modal isOpen={showPermanentPaymentModal} onClose={() => setShowPermanentPaymentModal(false)} title="Complete Payment" size="lg">
        <div className="space-y-0">
          {permanentRequestSuccess ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--green)] text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-[var(--navy)] mb-2">Request Submitted Successfully!</h3>
              <div className="bg-[var(--bg-warm)] rounded-xl p-4 text-left text-sm space-y-2 mb-4 max-w-sm mx-auto">
                <p className="font-bold text-[var(--navy)]">What happens next?</p>
                <ol className="list-decimal list-inside space-y-1 text-[var(--charcoal)]">
                  <li>Our relationship manager will call you within <strong>2-4 hours</strong> to confirm your hiring requirement.</li>
                  <li>We begin sourcing and verifying candidates for your role.</li>
                  <li>You can track the status in the <strong>"Your Permanent Recruitment Requests"</strong> section below.</li>
                </ol>
                <p className="text-xs text-[var(--charcoal)] mt-2">If you have any questions, please contact us at <strong>support@rojgaarhai.com</strong> or call <strong>+91-8422976666</strong>.</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-[var(--orange)] font-semibold">
                <Clock size={16} /> Thank you for your patience. We appreciate your business!
              </div>
            </div>
          ) : (
            <>
              <div className="relative text-white p-6" style={{ background: 'linear-gradient(135deg, #101A36 0%, #1C2B52 60%, #101A36 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--orange)] rounded-xl flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold">Payment Details</h3>
                    <p className="text-xs text-white/70">Pay to: Pacific Jobs India Pvt. Ltd.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex flex-col items-center">
                  <div className="w-full rounded-2xl border border-[var(--orange)]/20 bg-[var(--orange)]/5 p-4 text-center mb-4">
                    <p className="text-[11px] font-bold text-[var(--orange)] uppercase tracking-wider">Total Payable Amount</p>
                    <p className="text-3xl font-extrabold text-[var(--navy)] mt-1">₹{activePermanentPlan.total.toLocaleString()}</p>
                    <p className="text-xs text-[var(--charcoal)] mt-1">{activePermanentPlan.label}</p>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm mb-3">
                    <img
                      src={"https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent("upi://pay?pa=8422976666-2@ybl&pn=Pacific+Jobs+India+Pvt+Ltd&am=" + activePermanentPlan.total + "&cu=INR")}
                      alt="UPI QR Code"
                      width={180}
                      height={180}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="w-full mb-4">
                    <PayFromUpiButton amount={activePermanentPlan.total} note={`RojgaarHai Permanent Recruitment - ${activePermanentPlan.label}`} />
                  </div>
                  <div className="text-center mb-4">
                    <p className="text-xs text-[var(--charcoal)] uppercase tracking-wider font-semibold mb-1">Or scan the QR code, or pay to</p>
                    <p className="text-sm font-bold text-[var(--navy)]">8422976666-2@ybl</p>
                    <p className="text-xs text-[var(--charcoal)] mt-1">Receiver: Pacific Jobs India Pvt. Ltd.</p>
                  </div>

                  <div className="w-full rounded-xl border border-[#E7E2D9] overflow-hidden text-sm">
                    <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-warm)]">
                      <span className="text-[var(--charcoal)]">Base Amount</span>
                      <span className="font-semibold text-[var(--navy)]">₹{activePermanentPlan.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2 border-t border-[#EFEAE1]">
                      <span className="text-[var(--charcoal)]">GST (18%)</span>
                      <span className="font-semibold text-[var(--navy)]">₹{activePermanentPlan.gst.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#EFEAE1] bg-[var(--orange)]/5">
                      <span className="font-bold text-[var(--navy)]">Total to Pay</span>
                      <span className="font-extrabold text-[var(--orange)]">₹{activePermanentPlan.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--navy)] mb-1.5">Enter UPI Transaction ID *</label>
                  <input
                    value={permanentUpiTxn}
                    onChange={e => setPermanentUpiTxn(e.target.value)}
                    placeholder="e.g. TXN123456789"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                    disabled={processingPermanentRequest}
                  />
                  <p className="text-[11px] text-[var(--charcoal)]">Find this in your UPI app after completing the payment.</p>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="ghost" onClick={() => setShowPermanentPaymentModal(false)} disabled={processingPermanentRequest} className="flex-1">Cancel</Button>
                  <Button variant="primary" onClick={handlePermanentPaymentConfirm} disabled={processingPermanentRequest} className="flex-1 bg-[var(--orange)]">
                    {processingPermanentRequest ? 'Verifying...' : 'Proceed'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ═══ CV REQUEST PLAN SELECTION MODAL ═══ */}
      <Modal isOpen={showCvPlanSelectionModal} onClose={() => setShowCvPlanSelectionModal(false)} title="Select CV Request Plan" size="lg">
        <div className="p-6 space-y-5">
          <div className="text-center">
            <p className="text-sm text-[var(--charcoal)]">Choose a plan that fits your hiring needs. All plans include verified candidate profiles.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cvPlans.map((plan: any) => (
              <button
                key={plan.key}
                onClick={() => handleSelectCvPlan(plan)}
                className="group relative p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-[var(--orange)] hover:shadow-lg hover:shadow-[var(--orange)]/10 transition-all duration-200 text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--orange)]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-300" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-base font-extrabold text-[var(--navy)] group-hover:text-[var(--orange)] transition-colors">{plan.label}</p>
                      <p className="text-xs text-[var(--charcoal)] mt-0.5">{plan.count} verified candidate profiles</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[var(--orange)]/10 text-[var(--orange)] flex items-center justify-center group-hover:bg-[var(--orange)] group-hover:text-white transition-colors">
                      <FileText size={20} />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xl font-extrabold text-[var(--navy)] group-hover:text-[var(--orange)] transition-colors">₹{plan.amount.toLocaleString()}/-</span>
                      <span className="text-sm font-bold text-[var(--charcoal)]">+ 18% GST</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Payable amount: ₹{plan.total.toLocaleString()}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* ═══ CV REQUEST PAYMENT MODAL ═══ */}
      <Modal isOpen={showCvRequestModal} onClose={() => setShowCvRequestModal(false)} title="Complete Payment" size="lg">
        <div className="space-y-0">
          {cvRequestSuccess ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--green)] text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-[var(--navy)] mb-2">Request Submitted Successfully!</h3>
              <div className="bg-[var(--bg-warm)] rounded-xl p-4 text-left text-sm space-y-2 mb-4 max-w-sm mx-auto">
                <p className="font-bold text-[var(--navy)]">What happens next?</p>
                <ol className="list-decimal list-inside space-y-1 text-[var(--charcoal)]">
                  <li>Our team will call you within <strong>2-4 hours</strong> to confirm the request.</li>
                  <li>Resumes will be delivered to your email within <strong>24 hours</strong>.</li>
                  <li>You can track the status in the <strong>"Your Resume Requests"</strong> section below.</li>
                </ol>
                <p className="text-xs text-[var(--charcoal)] mt-2">If you have any questions, please contact us at <strong>support@rojgaarhai.com</strong> or call <strong>+91-8422976666</strong>.</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-[var(--orange)] font-semibold">
                <Clock size={16} /> Thank you for your patience. We appreciate your business!
              </div>
            </div>
          ) : (
            <>
              <div className="relative text-white p-6" style={{ background: 'linear-gradient(135deg, #101A36 0%, #1C2B52 60%, #101A36 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--orange)] rounded-xl flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold">Payment Details</h3>
                    <p className="text-xs text-white/70">Pay to: Pacific Jobs India Pvt. Ltd.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5">
                {selectedCvPlan && (
                  <div className="flex flex-col items-center">
                    <div className="w-full rounded-2xl border border-[var(--orange)]/20 bg-[var(--orange)]/5 p-4 text-center mb-4">
                      <p className="text-[11px] font-bold text-[var(--orange)] uppercase tracking-wider">Total Payable Amount</p>
                      <p className="text-3xl font-extrabold text-[var(--navy)] mt-1">₹{selectedCvPlan.total.toLocaleString()}</p>
                      <p className="text-xs text-[var(--charcoal)] mt-1">{selectedCvPlan.label} · {selectedCvPlan.count} verified CVs</p>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm mb-3">
                      <img
                        src={"https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent("upi://pay?pa=8422976666-2@ybl&pn=Pacific+Jobs+India+Pvt+Ltd&am=" + selectedCvPlan.total + "&cu=INR")}
                        alt="UPI QR Code"
                        width={180}
                        height={180}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="w-full mb-4">
                      <PayFromUpiButton amount={selectedCvPlan.total} note={`RojgaarHai CV request - ${selectedCvPlan.label}`} />
                    </div>
                    <div className="text-center mb-4">
                      <p className="text-xs text-[var(--charcoal)] uppercase tracking-wider font-semibold mb-1">Or scan the QR code, or pay to</p>
                      <p className="text-sm font-bold text-[var(--navy)]">8422976666-2@ybl</p>
                      <p className="text-xs text-[var(--charcoal)] mt-1">Receiver: Pacific Jobs India Pvt. Ltd.</p>
                    </div>

                    <div className="w-full rounded-xl border border-[#E7E2D9] overflow-hidden text-sm">
                      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-warm)]">
                        <span className="text-[var(--charcoal)]">Base Amount</span>
                        <span className="font-semibold text-[var(--navy)]">₹{selectedCvPlan.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-2 border-t border-[#EFEAE1]">
                        <span className="text-[var(--charcoal)]">GST (18%)</span>
                        <span className="font-semibold text-[var(--navy)]">₹{selectedCvPlan.gst.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#EFEAE1] bg-[var(--orange)]/5">
                        <span className="font-bold text-[var(--navy)]">Total to Pay</span>
                        <span className="font-extrabold text-[var(--orange)]">₹{selectedCvPlan.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--navy)] mb-1.5">Enter UPI Transaction ID *</label>
                  <input
                    value={cvRequestUpiTxn}
                    onChange={e => setCvRequestUpiTxn(e.target.value)}
                    placeholder="e.g. TXN123456789"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent"
                    disabled={processingCvRequest}
                  />
                  <p className="text-[11px] text-[var(--charcoal)]">Find this in your UPI app after completing the payment.</p>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="ghost" onClick={() => { setShowCvRequestModal(false); setSelectedCvPlan(null); }} disabled={processingCvRequest} className="flex-1">Cancel</Button>
                  <Button variant="primary" onClick={handleCvPaymentConfirm} disabled={processingCvRequest} className="flex-1 bg-[var(--orange)]">
                    {processingCvRequest ? 'Verifying...' : 'Proceed'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ═══ REQUESTED CVs SECTION ═══ */}
      {cvRequests.some((r: any) => r.employer_id === employer.id && !r.job_id && r.status !== 'cancelled') && (
        <div className="dash-surface dash-surface--pad">
          <div className="dash-section-title mb-4">Your Resume Requests</div>
          <div className="space-y-3">
            {cvRequests.filter((r: any) => r.employer_id === employer.id && !r.job_id && r.status !== 'cancelled').map((req: any) => (
              <div key={req.id} className="p-4 bg-[var(--white)] rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--navy)]">{req.plan_label}</p>
                    <p className="text-xs text-[var(--charcoal)] mt-0.5">
                      Requested on {new Date(req.created_at).toLocaleDateString('en-IN')} • ₹{Number(req.amount).toLocaleString()} + ₹{Math.round(Number(req.amount) * 0.18).toLocaleString()} GST = <strong className="text-[var(--navy)]">₹{Math.round(Number(req.amount) * 1.18).toLocaleString()}</strong>
                    </p>
                    <span className={`dash-status mt-1.5 ${req.status === 'delivered' ? 'dash-status--success' : req.status === 'processing' ? 'dash-status--warning' : req.status === 'cancelled' ? 'dash-status--danger' : 'dash-status--neutral'}`}>
                      {req.status === 'delivered' ? 'Delivered' : req.status === 'processing' ? 'Processing' : req.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                    </span>
                  </div>
                  {(req.status === 'pending' || req.status === 'processing') && (
                    <div className="bg-[var(--bg-warm)] rounded-xl p-3 text-xs text-[var(--charcoal)] space-y-1">
                      <p className="font-bold text-[var(--navy)]">Please note:</p>
                      {req.status === 'pending' ? (
                        <p>• Our team will call you within <strong>2-4 hours</strong> to confirm your request.</p>
                      ) : (
                        <p>• Your request is confirmed and being processed.</p>
                      )}
                      <p>• Verified resumes will be delivered to your email within <strong>24 hours</strong>.</p>
                      <p>• For urgent queries, contact <strong>support@rojgaarhai.com</strong> or call <strong>+91-8422976666</strong>.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ PERMANENT RECRUITMENT REQUESTS SECTION ═══ */}
      {permanentRequests.some((r: any) => r.employer_id === employer.id && r.status !== 'cancelled') && (
        <div className="dash-surface dash-surface--pad">
          <div className="dash-section-title mb-4">Your Permanent Recruitment Requests</div>
          <div className="space-y-3">
            {permanentRequests.filter((r: any) => r.employer_id === employer.id && r.status !== 'cancelled').map((req: any) => (
              <div key={req.id} className="p-4 bg-[var(--white)] rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--navy)]">{req.plan_label}</p>
                    <p className="text-xs text-[var(--charcoal)] mt-0.5">
                      Requested on {new Date(req.created_at).toLocaleDateString('en-IN')} • ₹{Number(req.amount).toLocaleString()} + ₹{Math.round(Number(req.amount) * 0.18).toLocaleString()} GST = <strong className="text-[var(--navy)]">₹{Math.round(Number(req.amount) * 1.18).toLocaleString()}</strong>
                    </p>
                    <span className={`dash-status mt-1.5 ${req.status === 'delivered' ? 'dash-status--success' : req.status === 'processing' ? 'dash-status--warning' : req.status === 'cancelled' ? 'dash-status--danger' : 'dash-status--neutral'}`}>
                      {req.status === 'delivered' ? 'Delivered' : req.status === 'processing' ? 'Processing' : req.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                    </span>
                  </div>
                  {(req.status === 'pending' || req.status === 'processing') && (
                    <div className="bg-[var(--bg-warm)] rounded-xl p-3 text-xs text-[var(--charcoal)] space-y-1">
                      <p className="font-bold text-[var(--navy)]">Please note:</p>
                      {req.status === 'pending' ? (
                        <p>• Our relationship manager will call you within <strong>2-4 hours</strong> to confirm your request.</p>
                      ) : (
                        <p>• Your request is confirmed and candidates are being sourced.</p>
                      )}
                      <p>• For urgent queries, contact <strong>support@rojgaarhai.com</strong> or call <strong>+91-8422976666</strong>.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}

export { EmployerDashboard };
