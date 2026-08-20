import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, IndianRupee, Clock, ShieldCheck, Bookmark, Building2, CheckCircle, Mail, Phone, UserCheck, AlertCircle } from 'lucide-react';
import { Badge, Button, Modal, Toast, Card } from '../components/ui';
import { useData } from '../context/DataContext';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobPostings, employers, isCandidateLoggedIn, loggedCandidate, applyToJob } = useData();

  const job = jobPostings.find(j => j.id === id);
  const employer = job ? employers.find(e => e.id === job.employerId) : null;

  // Bookmarked Jobs
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rojgaarhai_saved_jobs') || '[]');
      return id ? saved.includes(id) : false;
    } catch {
      return false;
    }
  });

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!job) {
    return (
      <div className="min-h-screen bg-[var(--bg-warm)] py-16 flex items-center justify-center" style={{ fontFamily: "var(--font)" }}>
        <Card className="text-center p-8 max-w-md">
          <AlertCircle size={48} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[var(--navy)]">Job Opening Not Found</h2>
          <p className="text-[var(--charcoal)] text-sm mt-1">The job listing you are looking for may have been closed or removed.</p>
          <Link to="/jobs"><Button className="mt-4">Back to All Jobs</Button></Link>
        </Card>
      </div>
    );
  }

  const isApplied = loggedCandidate ? job.applicants.includes(loggedCandidate.id) : false;

  const toggleBookmark = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('rojgaarhai_saved_jobs') || '[]');
      let updated: string[];
      if (saved.includes(job.id)) {
        updated = saved.filter((i: string) => i !== job.id);
        setIsSaved(false);
        setToastMessage('Removed from saved jobs');
      } else {
        updated = [...saved, job.id];
        setIsSaved(true);
        setToastMessage('Saved job successfully!');
      }
      localStorage.setItem('rojgaarhai_saved_jobs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyClick = () => {
    if (!isCandidateLoggedIn) {
      navigate('/login/candidate');
      return;
    }
    setShowApplyModal(true);
  };

  const handleConfirmApply = () => {
    if (loggedCandidate) {
      applyToJob(job.id, loggedCandidate.id);
      setShowApplyModal(false);
      setToastMessage(`Application for ${job.jobTitle} submitted successfully!`);
    }
  };

  // Similar Jobs
  const similarJobs = jobPostings
    .filter(j => j.id !== job.id && j.status === 'Open' && (j.city === job.city || j.qualificationRequired === job.qualificationRequired))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--bg-warm)] py-8 transition-colors duration-300" style={{ fontFamily: "var(--font)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--charcoal)] hover:text-[var(--orange)] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to All Jobs
        </Link>

        {/* ═══ TOP HERO BANNER CARD ═══ */}
        <div className="card-landing p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--orange)] to-[#d94d1a] text-white rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-md flex-shrink-0">
                {job.companyName.charAt(0)}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--navy)] tracking-tight">
                    {job.jobTitle}
                  </h1>
                  {job.isVerified !== false && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck size={14} /> Verified Employer
                    </span>
                  )}
                </div>

                <p className="text-base font-semibold text-[var(--charcoal)] flex items-center gap-2">
                  <Building2 size={16} className="text-[var(--orange)]" />
                  {job.companyName}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-[var(--charcoal)] mt-3">
                  <span className="flex items-center gap-1"><MapPin size={15} />{job.city}, {job.state}</span>
                  <span className="flex items-center gap-1"><Briefcase size={15} />{job.employmentType}</span>
                  <span className="flex items-center gap-1 text-[var(--green)] font-bold"><IndianRupee size={15} />₹{parseInt(job.salaryMin).toLocaleString()} - ₹{parseInt(job.salaryMax).toLocaleString()} / mo</span>
                  <span className="flex items-center gap-1"><Clock size={15} />{job.numberOfOpenings} openings</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 self-start lg:self-center">
              <button
                onClick={toggleBookmark}
                className={`p-3 rounded-xl border transition-colors ${
                  isSaved
                    ? 'bg-[var(--orange)]/10 border-[var(--orange)]/30 text-[var(--orange)]'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
                title={isSaved ? 'Saved' : 'Save Job'}
              >
                <Bookmark size={20} className={isSaved ? 'fill-[var(--orange)]' : ''} />
              </button>

              {isApplied ? (
                <div className="px-6 py-3 bg-[rgba(13,96,74,0.06)] border border-[rgba(13,96,74,0.2)] text-[var(--green)] rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm">
                  <CheckCircle size={18} /> Applied Successfully
                </div>
              ) : (
                <Button size="lg" onClick={handleApplyClick} className="shadow-lg gap-2 bg-[var(--orange)]">
                  Apply Now <UserCheck size={18} />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ═══ MAIN CONTENT GRID ═══ */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left Column (2 Cols): Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Job Description */}
            <Card>
              <h2 className="text-xl font-bold text-[var(--navy)] mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-[var(--orange)]" /> Job Overview & Description
              </h2>
              <p className="text-[var(--charcoal)] leading-relaxed text-sm sm:text-base">
                {job.jobDescription}
              </p>
            </Card>

            {/* Key Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <Card>
<h2 className="text-xl font-bold text-[var(--navy)] mb-4">
                  Key Responsibilities
                </h2>
                <ul className="space-y-2.5 text-sm sm:text-base text-[var(--charcoal)]">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--orange)] mt-2 flex-shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Requirements & Qualifications */}
            <Card>
<h2 className="text-xl font-bold text-[var(--navy)] mb-4">
                 Requirements & Qualifications
              </h2>
              {job.requirements && job.requirements.length > 0 ? (
                <ul className="space-y-2.5 text-sm sm:text-base text-[var(--charcoal)] mb-4">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={16} className="text-[var(--green)] mt-1 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--charcoal)] mb-4">
                  Candidate should have {job.qualificationRequired} qualification with minimum {job.experienceRequired} of relevant practical experience.
                </p>
              )}

              {/* Skills required tags */}
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Required Technical & Soft Skills</p>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map(skill => (
                  <Badge key={skill} variant="info" className="px-3 py-1 text-xs sm:text-sm font-medium">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Benefits & Perks */}
            <Card>
<h2 className="text-xl font-bold text-[var(--navy)] mb-4">
                 Benefits, Perks & Facilities
              </h2>
              <p className="text-sm sm:text-base text-[var(--charcoal)] mb-4">
                {job.benefits || 'Provident Fund (PF), Employee State Insurance (ESI), annual performance bonus.'}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className={`p-3 rounded-xl border ${job.accommodationProvided ? 'bg-[rgba(13,96,74,0.08)] border-[rgba(13,96,74,0.2)] text-[var(--green)]' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <p className="text-xs font-semibold">Accommodation</p>
                  <p className="text-sm font-bold mt-0.5">{job.accommodationProvided ? '✓ Provided Free by Employer' : 'Not Provided'}</p>
                </div>
                <div className={`p-3 rounded-xl border ${job.transportationProvided ? 'bg-[rgba(13,96,74,0.08)] border-[rgba(13,96,74,0.2)] text-[var(--green)]' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <p className="text-xs font-semibold">Transportation</p>
                  <p className="text-sm font-bold mt-0.5">{job.transportationProvided ? '✓ Provided Free by Employer' : 'Not Provided'}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (1 Col): Sidebar Specs & Recruiter Info */}
          <div className="space-y-6">
            
            {/* Specs Summary Card */}
            <Card>
              <h3 className="text-lg font-bold text-[var(--navy)] mb-4 border-b border-slate-100 pb-3">
                Job Overview
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Education</span>
                  <span className="font-semibold text-[var(--navy)]">{job.qualificationRequired}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Experience</span>
                  <span className="font-semibold text-[var(--navy)]">{job.experienceRequired}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Joining Timeline</span>
                  <span className="font-semibold text-[var(--navy)]">{job.joiningTimeline || 'Immediate'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Working Hours</span>
                  <span className="font-semibold text-[var(--navy)] text-right">{job.workingHours || 'Standard Shift'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Openings</span>
                  <span className="font-semibold text-[var(--navy)]">{job.numberOfOpenings} Vacancies</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Posted Date</span>
                  <span className="font-semibold text-[var(--navy)]">{job.createdAt}</span>
                </div>
                {job.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Application Deadline</span>
                    <span className="font-semibold text-amber-600">{job.deadline}</span>
                  </div>
                )}
              </div>
            </Card>

{/* Recruiter Contact Information */}
             <Card>
               <h3 className="text-lg font-bold text-[var(--navy)] mb-3">
                 Hiring Recruiter Contact
              </h3>
              <div className="space-y-2.5 text-sm">
                <p className="font-bold text-[var(--navy)] flex items-center gap-2">
                  <UserCheck size={16} className="text-[var(--orange)]" />
                  {job.recruiterName || employer?.contactName || 'HR Team'}
                </p>
                <p className="text-[var(--charcoal)] flex items-center gap-2">
                  <Mail size={15} className="text-slate-400" />
                  {job.recruiterEmail || employer?.contactEmail || 'hr@company.com'}
                </p>
                <p className="text-[var(--charcoal)] flex items-center gap-2">
                  <Phone size={15} className="text-slate-400" />
                  {job.recruiterPhone || employer?.contactPhone || '+91-9800000000'}
                </p>
              </div>
            </Card>

            {/* Company Info */}
            {employer && (
              <Card>
<h3 className="text-lg font-bold text-[var(--navy)] mb-3">
                  About {employer.companyName}
                </h3>
                <p className="text-xs text-[var(--charcoal)] mb-3 leading-relaxed">
                  Established in {employer.yearEstablished}, {employer.companyName} is a leading organization in the {employer.industry} sector with {employer.companySize} employees.
                </p>
                <div className="text-xs space-y-1.5 text-[var(--charcoal)]">
                  <p><span className="text-slate-400">Address:</span> {employer.address}, {employer.city}</p>
                  {employer.website && (
                    <p><span className="text-slate-400">Website:</span> <a href={`https://${employer.website}`} target="_blank" rel="noreferrer" className="text-[var(--orange)] hover:underline">{employer.website}</a></p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* ═══ SIMILAR JOBS SECTION ═══ */}
        {similarJobs.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--navy)]">
                Similar Job Openings
              </h2>
              <Link to="/jobs" className="text-sm font-semibold text-[var(--orange)] hover:underline">
                View All →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarJobs.map(simJob => (
                <Card key={simJob.id} className="hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="info" className="text-[10px]">{simJob.employmentType}</Badge>
                      <span className="text-xs text-slate-400">{simJob.city}</span>
                    </div>
                    <h3 className="font-bold text-base text-[var(--navy)] mb-1 line-clamp-1">{simJob.jobTitle}</h3>
                    <p className="text-xs text-[var(--charcoal)] mb-3">{simJob.companyName}</p>
                    <p className="text-xs font-semibold text-[var(--green)] mb-3">
                      ₹{parseInt(simJob.salaryMin).toLocaleString()} - ₹{parseInt(simJob.salaryMax).toLocaleString()} / mo
                    </p>
                  </div>
                  <Link to={`/jobs/${simJob.id}`} onClick={() => window.scrollTo(0,0)}>
                    <Button variant="outline" size="sm" fullWidth className="text-xs font-semibold">
                      View Opportunity
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ APPLY CONFIRMATION MODAL ═══ */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Confirm Application"
        size="md"
      >
        {loggedCandidate && (
          <div className="space-y-5">
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-xs text-[var(--orange)] font-semibold uppercase tracking-wider">Applying For</p>
              <h3 className="text-lg font-bold text-[var(--navy)] mt-0.5">{job.jobTitle}</h3>
              <p className="text-sm font-medium text-[var(--charcoal)] flex items-center gap-1 mt-1">
                <Building2 size={14} /> {job.companyName} • {job.city}, {job.state}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm space-y-2">
              <p><span className="text-slate-400">Candidate Name:</span> <strong className="text-[var(--navy)]">{loggedCandidate.firstName} {loggedCandidate.lastName}</strong></p>
              <p><span className="text-slate-400">Email:</span> <span className="text-[var(--navy)]">{loggedCandidate.email}</span></p>
              <p><span className="text-slate-400">Qualification:</span> <span className="text-[var(--navy)]">{loggedCandidate.qualification}</span></p>
            </div>

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
