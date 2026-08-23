import { useState } from 'react';
import { Search, Eye, Mail, Phone as PhoneIcon, MapPin, FileText, UserCheck, Briefcase, IndianRupee, Calendar, Award, X, Filter, Download } from 'lucide-react';
import { Card, Badge, Button, Modal, Select, Toast } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { hireCandidate as hireCandidateApi } from '../../lib/supabase/data';
import { exportToCsv } from '../../lib/csvExport';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
  'New': 'info', 'Contacted': 'warning', 'Interviewed': 'default', 'Placed': 'success', 'Inactive': 'danger',
};

function checkDateMatch(
  createdAtStr: string | undefined,
  dateFilter: string,
  startDate: string,
  endDate: string
): boolean {
  if (!dateFilter) return true;
  if (!createdAtStr) return true;

  const cYMD = createdAtStr.split('T')[0];
  const today = new Date();

  const toYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayYMD = toYMD(today);

  if (dateFilter === 'today') {
    return cYMD === todayYMD;
  }

  if (dateFilter === 'yesterday') {
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    return cYMD === toYMD(yest);
  }

  if (dateFilter === 'last7') {
    const d7 = new Date(today);
    d7.setDate(d7.getDate() - 7);
    return cYMD >= toYMD(d7);
  }

  if (dateFilter === 'last30') {
    const d30 = new Date(today);
    d30.setDate(d30.getDate() - 30);
    return cYMD >= toYMD(d30);
  }

  if (dateFilter === 'thisMonth') {
    const yearMonth = todayYMD.substring(0, 7);
    return cYMD.startsWith(yearMonth);
  }

  if (dateFilter === 'lastMonth') {
    const lastM = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMYMD = toYMD(lastM).substring(0, 7);
    return cYMD.startsWith(lastMYMD);
  }

  if (dateFilter === 'custom') {
    if (startDate && cYMD < startDate) return false;
    if (endDate && cYMD > endDate) return false;
    return true;
  }

  return true;
}

export default function Candidates() {
  const { candidates, jobs: jobPostings, employers, matches, refresh } = useDatabase();

  const employerName = (id: string) => employers.find((e: any) => e.id === id)?.company_name || 'Unknown';

  const jobSeekers = candidates.map((c: any) => {
    const [firstName, ...rest] = (c.profile_name || 'Unnamed').split(' ');
    return {
      ...c,
      firstName: firstName || 'Unnamed',
      lastName: rest.join(' '),
      phone: c.profile_phone || '',
      email: '',
      dob: c.date_of_birth || '',
      location: c.location || c.city || '',
      skills: c.skills || [],
      totalExperience: String(c.total_experience_years ?? 0),
      expectedSalary: String(c.expected_salary_min ?? 0),
      preferredJobType: c.preferred_job_type || '',
      willingToRelocate: c.willing_to_relocate ?? false,
      preferredLocations: [] as string[],
      resumeFile: c.resume_url || '',
      profilePhotoFile: c.profile_photo_url || '',
      createdAt: c.created_at ? c.created_at.split('T')[0] : '',
    };
  });

  const jobPostingsDisplay = jobPostings.map((j: any) => ({
    ...j,
    jobTitle: j.job_title,
    companyName: employerName(j.employer_id),
    salaryMin: String(j.salary_min ?? 0),
    salaryMax: String(j.salary_max ?? 0),
  }));

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals & Toast State
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireJobId, setHireJobId] = useState('');
  const [hiring, setHiring] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setDateFilter('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = Boolean(search || statusFilter || dateFilter || startDate || endDate);

  const filtered = jobSeekers.filter(c => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.skills.some((s: string) => s.toLowerCase().includes(q));

    const matchStatus = !statusFilter || c.status === statusFilter;
    const matchDate = checkDateMatch(c.createdAt, dateFilter, startDate, endDate);

    return matchSearch && matchStatus && matchDate;
  });

  const openDetail = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowDetailModal(true);
  };

  const openHire = (candidate: any) => {
    setSelectedCandidate(candidate);
    setHireJobId('');
    setShowHireModal(true);
  };

  const handleHire = async () => {
    if (!selectedCandidate || !hireJobId) return;
    const job = jobPostingsDisplay.find(j => j.id === hireJobId);
    if (!job) return;
    setHiring(true);
    try {
      const existingMatch = matches.find((m: any) => m.candidate_id === selectedCandidate.id && m.job_id === hireJobId);
      await hireCandidateApi(selectedCandidate.id, hireJobId, job.employer_id, existingMatch?.id);
      await refresh();
      setToast({ message: `${selectedCandidate.firstName} ${selectedCandidate.lastName} has been hired for ${job.jobTitle} at ${job.companyName}!`, type: 'success' });
      setShowHireModal(false);
      setSelectedCandidate(null);
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to hire candidate', type: 'error' });
    } finally {
      setHiring(false);
    }
  };

  const getCandidateMatches = (candidateId: string) => matches
    .filter((m: any) => m.candidate_id === candidateId)
    .map((m: any) => {
      const job = jobPostingsDisplay.find(j => j.id === m.job_id);
      return { ...m, jobTitle: job?.jobTitle || 'Unknown', companyName: job?.companyName || 'Unknown', matchScore: m.match_score };
    });

  const openJobs = jobPostingsDisplay.filter(j => j.status === 'Open');

  const handleExportCsv = () => {
    exportToCsv('candidates', filtered.map((c: any) => ({
      'Full Name': `${c.firstName} ${c.lastName}`.trim(),
      Phone: c.phone,
      'Date of Birth': c.dob,
      Gender: c.gender || '',
      Location: c.location,
      State: c.state || '',
      Country: c.country || '',
      Qualification: c.qualification || '',
      Skills: c.skills,
      'Total Experience (yrs)': c.totalExperience,
      'Expected Salary': c.expectedSalary,
      'Preferred Job Type': c.preferredJobType,
      'Willing To Relocate': c.willingToRelocate,
      Status: c.status,
      'Marital Status': c.marital_status || '',
      Nationality: c.nationality || '',
      'LinkedIn': c.linkedin_url || '',
      'GitHub': c.github_url || '',
      'Portfolio': c.portfolio_url || '',
      'Resume URL': c.resumeFile,
      'Referred By Employer ID': c.referred_by || '',
      'Referral Code Used': c.referral_code_used || '',
      'Date Joined': c.createdAt,
      'Candidate ID': c.id,
    })));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy)]">Candidates</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">
            Showing {filtered.length} of {jobSeekers.length} candidates • Search by name & filter by date joined
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCsv} className="gap-1.5 flex-shrink-0">
          <Download size={15} /> Download CSV
        </Button>
      </div>

      {/* ═══ FILTER BAR ═══ */}
      <Card className="!p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Candidates by Name Input */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--charcoal)]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search candidate by name..."
                className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none text-sm bg-white text-[var(--navy)] placeholder:text-slate-400 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--charcoal)] hover:text-[var(--navy)] transition-colors p-1"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <Select
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'New', label: 'New' },
                  { value: 'Contacted', label: 'Contacted' },
                  { value: 'Interviewed', label: 'Interviewed' },
                  { value: 'Placed', label: 'Placed' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              />
            </div>

            {/* Date Joined Filter */}
            <div className="w-full md:w-56">
              <Select
                options={[
                  { value: '', label: 'Date Joined: All Time' },
                  { value: 'today', label: 'Date Joined: Today' },
                  { value: 'yesterday', label: 'Date Joined: Yesterday' },
                  { value: 'last7', label: 'Date Joined: Last 7 Days' },
                  { value: 'last30', label: 'Date Joined: Last 30 Days' },
                  { value: 'thisMonth', label: 'Date Joined: This Month' },
                  { value: 'lastMonth', label: 'Date Joined: Last Month' },
                  { value: 'custom', label: 'Date Joined: Custom Range' },
                ]}
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
            </div>

            {/* Reset / Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs font-semibold text-red-600 hover:bg-red-50 gap-1 flex-shrink-0 self-center"
              >
                <X size={14} /> Clear Filters
              </Button>
            )}
          </div>

          {/* Custom Date Inputs Panel */}
          {dateFilter === 'custom' && (
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2.5 border-t border-slate-200/80 animate-fade-in">
              <span className="text-xs font-semibold text-[var(--charcoal)] flex items-center gap-1">
                <Calendar size={14} /> Custom Date Joined Range:
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs text-[var(--charcoal)] font-medium">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-[var(--navy)] focus:ring-2 focus:ring-[var(--orange)] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs text-[var(--charcoal)] font-medium">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-[var(--navy)] focus:ring-2 focus:ring-[var(--orange)] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ═══ TABLE ═══ */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-[var(--bg-warm)]/90">
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Candidate</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Skills</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Salary Exp.</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Date Joined</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Resume</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(candidate => (
                <tr key={candidate.id} className="border-b border-slate-100/60 hover:bg-slate-100 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F15A24]/10 text-[var(--orange)] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {candidate.firstName[0]}{candidate.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--navy)]">{candidate.firstName} {candidate.lastName}</p>
                        <p className="text-xs text-[var(--charcoal)]">{candidate.qualification} • {candidate.totalExperience}yrs • <MapPin size={10} className="inline" />{candidate.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 2).map((s: string) => <Badge key={s} variant="info" className="text-[10px]">{s}</Badge>)}
                      {candidate.skills.length > 2 && <Badge className="text-[10px]">+{candidate.skills.length - 2}</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--charcoal)] hidden md:table-cell">
                    ₹{parseInt(candidate.expectedSalary).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-[var(--charcoal)] hidden lg:table-cell">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      {candidate.createdAt}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {candidate.resumeFile ? <Badge variant="success" className="text-[10px]">📄 {candidate.resumeFile}</Badge> : <Badge variant="default" className="text-[10px]">Not uploaded</Badge>}
                  </td>
                  <td className="px-4 py-3"><Badge variant={statusVariant[candidate.status]}>{candidate.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(candidate)} title="View Submission"><Eye size={16} /></Button>
                      {candidate.status !== 'Placed' && (
                        <Button variant="ghost" size="sm" onClick={() => openHire(candidate)} title="Hire" className="text-[var(--green)] hover:text-[var(--green)]"><UserCheck size={16} /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[var(--charcoal)]">
              <Filter size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No candidates found matching your filters</p>
              <p className="text-xs text-[var(--charcoal)] mt-1">Try clearing filters or searching for a different candidate name.</p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4 text-xs">
                  Reset All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* ═══ FULL SUBMISSION DETAIL MODAL ═══ */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Full Candidate Submission" size="lg">
        {selectedCandidate && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[rgba(241,90,36,0.15)] to-[rgba(241,90,36,0.05)] text-[var(--orange)] rounded-xl flex items-center justify-center text-2xl font-bold">{selectedCandidate.firstName[0]}{selectedCandidate.lastName[0]}</div>
              <div>
                <h3 className="text-xl font-bold text-[var(--navy)]">{selectedCandidate.firstName} {selectedCandidate.lastName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={statusVariant[selectedCandidate.status]}>{selectedCandidate.status}</Badge>
                  <span className="text-xs text-[var(--charcoal)]">ID: {selectedCandidate.id} • Date Joined: {selectedCandidate.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-[#F15A24]/5 rounded-xl p-4 border border-[#F15A24]/10">
              <h4 className="text-sm font-bold text-[var(--navy)] mb-3 flex items-center gap-2"><span className="w-5 h-5 bg-[var(--orange)] text-white rounded text-[10px] flex items-center justify-center font-bold">1</span> Personal Information</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'First Name', value: selectedCandidate.firstName, icon: <UserCheck size={12} /> },
                  { label: 'Last Name', value: selectedCandidate.lastName, icon: <UserCheck size={12} /> },
                  { label: 'Phone Number', value: selectedCandidate.phone, icon: <PhoneIcon size={12} /> },
                  { label: 'Email Address', value: selectedCandidate.email, icon: <Mail size={12} /> },
                  { label: 'Date of Birth', value: selectedCandidate.dob, icon: <Calendar size={12} /> },
                  { label: 'Age', value: `${Math.floor((Date.now() - new Date(selectedCandidate.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`, icon: <Calendar size={12} /> },
                  { label: 'Gender', value: selectedCandidate.gender, icon: <UserCheck size={12} /> },
                  { label: 'Date Joined', value: selectedCandidate.createdAt, icon: <Calendar size={12} /> },
                ].map(f => (
                  <div key={f.label} className="bg-white rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[10px] text-[var(--charcoal)] uppercase tracking-wider font-semibold flex items-center gap-1">{f.icon}{f.label}</p>
                    <p className="text-sm text-[var(--navy)] font-semibold mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Details Section */}
            <div className="bg-[#0D604A]/5 rounded-xl p-4 border border-[#0D604A]/10">
              <h4 className="text-sm font-bold text-[var(--navy)] mb-3 flex items-center gap-2"><span className="w-5 h-5 bg-[var(--green)] text-white rounded text-[10px] flex items-center justify-center font-bold">2</span> Professional Details</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Current Location', value: `${selectedCandidate.location}, ${selectedCandidate.state}`, icon: <MapPin size={12} /> },
                  { label: 'Highest Qualification', value: selectedCandidate.qualification, icon: <Award size={12} /> },
                  { label: 'Previous Company', value: selectedCandidate.previousCompany || 'N/A (Fresher)', icon: <Briefcase size={12} /> },
                  { label: 'Total Experience', value: `${selectedCandidate.totalExperience} years`, icon: <Briefcase size={12} /> },
                ].map(f => (
                  <div key={f.label} className="bg-white rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[10px] text-[var(--charcoal)] uppercase tracking-wider font-semibold flex items-center gap-1">{f.icon}{f.label}</p>
                    <p className="text-sm text-[var(--navy)] font-semibold mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <p className="text-[10px] text-[var(--charcoal)] uppercase tracking-wider font-semibold mb-1.5">Key Skills</p>
                <div className="flex flex-wrap gap-1.5">{selectedCandidate.skills.map((s: string) => <Badge key={s} variant="default">{s}</Badge>)}</div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-[#101A36]/5 rounded-xl p-4 border border-[#101A36]/10">
              <h4 className="text-sm font-bold text-[var(--navy)] mb-3 flex items-center gap-2"><span className="w-5 h-5 bg-[var(--navy)] text-white rounded text-[10px] flex items-center justify-center font-bold">3</span> Job Preferences</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Expected Salary', value: `₹${parseInt(selectedCandidate.expectedSalary).toLocaleString()}/month`, icon: <IndianRupee size={12} /> },
                  { label: 'Preferred Job Type', value: selectedCandidate.preferredJobType, icon: <Briefcase size={12} /> },
                  { label: 'Willing to Relocate', value: selectedCandidate.willingToRelocate ? 'Yes' : 'No', icon: <MapPin size={12} /> },
                ].map(f => (
                  <div key={f.label} className="bg-white rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[10px] text-[var(--charcoal)] uppercase tracking-wider font-semibold flex items-center gap-1">{f.icon}{f.label}</p>
                    <p className="text-sm text-[var(--navy)] font-semibold mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
              {selectedCandidate.willingToRelocate && selectedCandidate.preferredLocations.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] text-[var(--charcoal)] uppercase tracking-wider font-semibold mb-1.5">Preferred Locations</p>
                  <div className="flex flex-wrap gap-1.5">{selectedCandidate.preferredLocations.map((l: string) => <Badge key={l} variant="info">{l}</Badge>)}</div>
                </div>
              )}
            </div>

            {/* Uploaded Documents */}
            <div className="bg-[#F15A24]/5 rounded-xl p-4 border border-[#F15A24]/10">
              <h4 className="text-sm font-bold text-[var(--navy)] mb-3 flex items-center gap-2"><span className="w-5 h-5 bg-[var(--orange)] text-white rounded text-[10px] flex items-center justify-center font-bold">4</span> Uploaded Documents</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-lg p-3 border ${selectedCandidate.resumeFile ? 'bg-[#0D604A]/5 border-[#0D604A]/10' : 'bg-white border-slate-200'}`}>
                  <p className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1 mb-1 text-[var(--charcoal)]">
                    <FileText size={12} /> Resume
                  </p>
                  {selectedCandidate.resumeFile ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[var(--navy)] font-semibold">{selectedCandidate.resumeFile}</p>
                      <Badge variant="success" className="text-[9px]">Uploaded</Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--charcoal)]">Not uploaded</p>
                  )}
                </div>
                <div className={`rounded-lg p-3 border ${selectedCandidate.profilePhotoFile ? 'bg-[#0D604A]/5 border-[#0D604A]/10' : 'bg-white border-slate-200'}`}>
                  <p className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1 mb-1 text-[var(--charcoal)]">
                    <UserCheck size={12} /> Profile Photo
                  </p>
                  {selectedCandidate.profilePhotoFile ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[var(--navy)] font-semibold">{selectedCandidate.profilePhotoFile}</p>
                      <Badge variant="success" className="text-[9px]">Uploaded</Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--charcoal)]">Not uploaded</p>
                  )}
                </div>
              </div>
            </div>

            {/* Current Matches */}
            {getCandidateMatches(selectedCandidate.id).length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-[var(--navy)] mb-3">Current Matches ({getCandidateMatches(selectedCandidate.id).length})</h4>
                <div className="space-y-2">
                  {getCandidateMatches(selectedCandidate.id).map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-warm)] border border-slate-200">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${m.matchScore >= 80 ? 'bg-[#0D604A]' : m.matchScore >= 60 ? 'bg-[var(--orange)]' : 'bg-red-600'}`}>{m.matchScore}%</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--navy)]">{m.jobTitle}</p>
                        <p className="text-xs text-[var(--charcoal)]">{m.companyName}</p>
                      </div>
                      <Badge variant={m.status === 'Hired' ? 'success' : m.status === 'Offered' ? 'success' : m.status === 'Interview Scheduled' ? 'info' : 'warning'}>{m.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-slate-200">
              {selectedCandidate.status !== 'Placed' && (
                <Button variant="success" className="gap-1.5" onClick={() => { setShowDetailModal(false); openHire(selectedCandidate); }}>
                  <UserCheck size={16} /> Hire for Job
                </Button>
              )}
              <Button variant="outline" className="gap-1.5"><Mail size={14} /> Send Email</Button>
              <Button variant="ghost" className="gap-1.5"><PhoneIcon size={14} /> Log Call</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══ HIRE MODAL ═══ */}
      <Modal isOpen={showHireModal} onClose={() => setShowHireModal(false)} title="Hire Candidate for Job" size="md">
        {selectedCandidate && (
          <div className="space-y-5">
            <div className="bg-[#F15A24]/5 rounded-xl p-4 border border-[#F15A24]/10">
              <p className="text-xs text-[var(--orange)] text-[var(--orange)] font-semibold">Candidate</p>
              <p className="text-lg font-bold text-[var(--navy)]">{selectedCandidate.firstName} {selectedCandidate.lastName}</p>
              <p className="text-sm text-[var(--charcoal)]">{selectedCandidate.qualification} • {selectedCandidate.totalExperience} yrs • ₹{parseInt(selectedCandidate.expectedSalary).toLocaleString()}/month</p>
              <div className="flex flex-wrap gap-1 mt-2">{selectedCandidate.skills.map((s: string) => <Badge key={s} variant="info" className="text-[10px]">{s}</Badge>)}</div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--charcoal)] mb-1.5">Select Job to Hire For <span className="text-red-500">*</span></label>
              <Select
                options={[
                  { value: '', label: 'Choose a job opening...' },
                  ...openJobs.map(j => ({ value: j.id, label: `${j.jobTitle} at ${j.companyName} (₹${parseInt(j.salaryMin).toLocaleString()}-${parseInt(j.salaryMax).toLocaleString()})` }))
                ]}
                value={hireJobId}
                onChange={e => setHireJobId(e.target.value)}
              />
            </div>

            {hireJobId && (() => {
              const job = jobPostingsDisplay.find(j => j.id === hireJobId);
              if (!job) return null;
              const salaryFit = parseInt(selectedCandidate.expectedSalary) >= parseInt(job.salaryMin) && parseInt(selectedCandidate.expectedSalary) <= parseInt(job.salaryMax);
              return (
                <div className={`rounded-xl p-4 border ${salaryFit ? 'bg-[#0D604A]/5 border-[#0D604A]/10' : 'bg-[#F15A24]/5 border-[#F15A24]/10'}`}>
                  <h4 className="text-sm font-bold text-[var(--navy)] mb-2">Salary Match</h4>
                  <div className="flex items-center justify-between text-[var(--navy)]">
                    <div>
                      <p className="text-xs text-[var(--charcoal)]">Candidate expects</p>
                      <p className="text-sm font-bold">₹{parseInt(selectedCandidate.expectedSalary).toLocaleString()}/mo</p>
                    </div>
                    <div className="text-2xl text-slate-400">↔</div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--charcoal)]">Job offers</p>
                      <p className="text-sm font-bold">₹{parseInt(job.salaryMin).toLocaleString()} - ₹{parseInt(job.salaryMax).toLocaleString()}/mo</p>
                    </div>
                  </div>
                  <p className={`text-xs mt-2 font-semibold ${salaryFit ? 'text-[var(--green)]' : 'text-[var(--orange)] text-[var(--orange)]'}`}>
                    {salaryFit ? '✓ Salary expectation is within the job range' : '⚠ Salary expectation is outside the job range'}
                  </p>
                </div>
              );
            })()}

            {hireJobId && (
              <div className="bg-[var(--bg-warm)] rounded-xl p-4 border border-slate-200">
                <h4 className="text-sm font-bold text-[var(--navy)] mb-2">Hire Summary</h4>
                <p className="text-sm text-[var(--charcoal)]">You are about to hire <span className="font-bold text-[var(--navy)]">{selectedCandidate.firstName} {selectedCandidate.lastName}</span> for the position of <span className="font-bold text-[var(--navy)]">{jobPostingsDisplay.find(j => j.id === hireJobId)?.jobTitle}</span> at <span className="font-bold text-[var(--navy)]">{jobPostingsDisplay.find(j => j.id === hireJobId)?.companyName}</span>.</p>
                <p className="text-xs text-[var(--charcoal)] mt-1">This will: update candidate status to "Placed", mark the match as "Hired", and create a placement record with ₹4,000 commission.</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="success" onClick={handleHire} disabled={!hireJobId || hiring} className="gap-1.5">
                <UserCheck size={16} /> {hiring ? 'Hiring...' : 'Confirm Hiring'}
              </Button>
              <Button variant="ghost" onClick={() => setShowHireModal(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
