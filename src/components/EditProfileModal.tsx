import { useState, useEffect } from 'react';
import {
  X, User, MapPin, Briefcase, GraduationCap, Sparkles, FileText,
  Upload, Shield, Globe, BookOpen, Award, CheckCircle,
  Plus, Trash2, Save, RefreshCw, Download, Eye
} from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { Button, Badge, Toast } from './ui';
import {
  JobSeeker, EducationEntry, ExperienceEntry, LanguageEntry, CertificationEntry
} from '../context/DataContext';
import { getSectorsList, getSubsectorsForSector } from '../constants/sectors';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: JobSeeker;
  onSave: (updatedData: Partial<JobSeeker>) => void;
}

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh'
];

const suggestedSkillList = [
  'Python', 'Java', 'Excel', 'Tally Prime', 'Communication', 'MS Office', 'React', 'SQL',
  'Machine Operation', 'CNC Turning', 'Quality Check', 'Welding', 'Patient Care', 'Nursing',
  'GST Filing', 'Data Entry', 'Autocad', 'Site Management', 'Sales', 'Customer Service'
];

const languageSuggestions = ['English', 'Hindi', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Bengali', 'Punjabi', 'Kannada', 'Malayalam'];

export function EditProfileModal({ isOpen, onClose, candidate, onSave }: EditProfileModalProps) {
  const [activeSection, setActiveSection] = useState('personal');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SECTION 1: Personal
  const [firstName, setFirstName] = useState(candidate.firstName || '');
  const [lastName, setLastName] = useState(candidate.lastName || '');
  const [email, setEmail] = useState(candidate.email || '');
  const [phone, setPhone] = useState(candidate.phone || '');
  const [altPhone, setAltPhone] = useState(candidate.altPhone || '');
  const [dob, setDob] = useState(candidate.dob || '');
  const [gender, setGender] = useState(candidate.gender || 'Male');
  const [maritalStatus, setMaritalStatus] = useState(candidate.maritalStatus || 'Single');
  const [nationality, setNationality] = useState(candidate.nationality || 'Indian');
  const [aadhaarNumber, setAadhaarNumber] = useState(candidate.aadhaarNumber || '5489 1234 9876');
  const [panNumber, setPanNumber] = useState(candidate.panNumber || 'ABCDE1234F');

  // SECTION 2: Location
  const [city, setCity] = useState(candidate.location || '');
  const [state, setState] = useState(candidate.state || '');
  const [country, setCountry] = useState(candidate.country || 'India');
  const [address, setAddress] = useState(candidate.address || '');
  const [pincode, setPincode] = useState(candidate.pincode || '');
  const [willingToRelocate, setWillingToRelocate] = useState(candidate.willingToRelocate ?? true);
  const [preferredLocations, setPreferredLocations] = useState<string[]>(candidate.preferredLocations || []);

  // SECTION 3: Professional Info
  const [currentJobTitle, setCurrentJobTitle] = useState(candidate.currentJobTitle || candidate.qualification || '');
  const [currentCompany, setCurrentCompany] = useState(candidate.currentCompany || candidate.previousCompany || '');
  const [previousCompany, setPreviousCompany] = useState(candidate.previousCompany || '');
  const [totalExperience, setTotalExperience] = useState(candidate.totalExperience || '2');
  const [relevantExperience, setRelevantExperience] = useState(candidate.relevantExperience || '2');
  const [industry, setIndustry] = useState(candidate.industry || '');
  const [department, setDepartment] = useState(candidate.department || '');
  const [currentStatus, setCurrentStatus] = useState<'Open to Work' | 'Employed' | 'Freelancer' | 'Student'>(candidate.currentStatus || 'Open to Work');

  // Combobox state for sector/department
  const [sectorInput, setSectorInput] = useState(candidate.industry || '');
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false);
  const [filteredSectors, setFilteredSectors] = useState<string[]>(getSectorsList());

  const [deptInput, setDeptInput] = useState(candidate.department || '');
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [filteredDepts, setFilteredDepts] = useState<string[]>([]);

  // Update filtered sectors when input changes
  const handleSectorInputChange = (value: string) => {
    setSectorInput(value);
    setIndustry(value);
    const allSectors = getSectorsList();
    const filtered = allSectors.filter(s =>
      s.toLowerCase().includes(value.toLowerCase())
    );
    // Add custom option at top if value doesn't exactly match any sector
    const hasExactMatch = allSectors.some(s => s.toLowerCase() === value.toLowerCase());
    if (value && !hasExactMatch) {
      filtered.unshift(`✏️ Custom: ${value}`);
    }
    setFilteredSectors(filtered);
    setSectorDropdownOpen(true);
  };

  const handleSectorSelect = (sector: string) => {
    // Check if custom option selected
    if (sector.startsWith('✏️ Custom: ')) {
      const customValue = sector.replace('✏️ Custom: ', '');
      setSectorInput(customValue);
      setIndustry(customValue);
    } else {
      setSectorInput(sector);
      setIndustry(sector);
    }
    setSectorDropdownOpen(false);
    // Reset department when sector changes
    setDeptInput('');
    setDepartment('');
    // Load subsectors for selected sector (use actual sector, not custom)
    const actualSector = sector.startsWith('✏️ Custom: ') ? '' : sector;
    const subsectors = getSubsectorsForSector(actualSector);
    setFilteredDepts(subsectors);
  };

  const handleDeptInputChange = (value: string) => {
    setDeptInput(value);
    setDepartment(value);
    const subsectors = getSubsectorsForSector(industry || sectorInput);
    const filtered = subsectors.filter(d =>
      d.toLowerCase().includes(value.toLowerCase())
    );
    // Add custom option at top if value doesn't exactly match any department
    const hasExactMatch = subsectors.some(d => d.toLowerCase() === value.toLowerCase());
    if (value && !hasExactMatch) {
      filtered.unshift(`✏️ Custom: ${value}`);
    }
    setFilteredDepts(filtered);
    setDeptDropdownOpen(true);
  };

  const handleDeptSelect = (dept: string) => {
    // Check if custom option selected
    if (dept.startsWith('✏️ Custom: ')) {
      const customValue = dept.replace('✏️ Custom: ', '');
      setDeptInput(customValue);
      setDepartment(customValue);
    } else {
      setDeptInput(dept);
      setDepartment(dept);
    }
    setDeptDropdownOpen(false);
  };


  // SECTION 4: Education
  const [educationList, setEducationList] = useState<EducationEntry[]>(candidate.educationList || [
    { id: 'edu-1', degree: candidate.qualification || 'B.Com', qualification: candidate.qualification || 'Graduate', college: 'Government College', university: 'State University', passingYear: '2020', grade: '78%' }
  ]);
  const [newEdu, setNewEdu] = useState<Partial<EducationEntry>>({ degree: '', qualification: 'B.Com', college: '', university: '', passingYear: '2021', grade: '' });
  const [showAddEdu, setShowAddEdu] = useState(false);

  // SECTION 5: Skills
  const [skills, setSkills] = useState<string[]>(candidate.skills || []);
  const [skillInput, setSkillInput] = useState('');

  // SECTION 6: Resume & Files
  const [resumeFile, setResumeFile] = useState(candidate.resumeFile || 'Rajesh_Kumar_Resume.pdf');
  const [profilePhotoFile, setProfilePhotoFile] = useState(candidate.profilePhotoFile || 'rajesh_photo.jpg');
  const [aadhaarFile, setAadhaarFile] = useState(candidate.aadhaarFile || 'Aadhaar_Copy.pdf');
  const [panFile, setPanFile] = useState(candidate.panFile || 'PAN_Copy.pdf');
  const [certificatesFile, setCertificatesFile] = useState(candidate.certificatesFile || 'Degree_Certificate.pdf');
  const [experienceLetterFile, setExperienceLetterFile] = useState(candidate.experienceLetterFile || 'Experience_Letter.pdf');

  // SECTION 7: Experience Entries
  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>(candidate.experienceList || [
    { id: 'exp-1', company: candidate.previousCompany || 'Bharat Manufacturing Co.', designation: candidate.currentJobTitle || 'Machine Operator', startDate: '2021-06-01', endDate: '2023-12-31', currentlyWorking: false, responsibilities: 'Operate CNC machinery, ensure safety guidelines, and manage daily quality inspection logs.' }
  ]);
  const [newExp, setNewExp] = useState<Partial<ExperienceEntry>>({ company: '', designation: '', startDate: '2022-01-01', endDate: '', currentlyWorking: true, responsibilities: '' });
  const [showAddExp, setShowAddExp] = useState(false);

  // SECTION 8: Expected Job Preferences
  const [expectedSalary, setExpectedSalary] = useState(candidate.expectedSalary || '20000');
  const [preferredJobRole, setPreferredJobRole] = useState(candidate.preferredJobRole || candidate.qualification || 'Machine Operator');
  const [preferredIndustry, setPreferredIndustry] = useState(candidate.preferredIndustry || 'Manufacturing');
  const [preferredJobType, setPreferredJobType] = useState(candidate.preferredJobType || 'Full-time');
  const [preferredShift, setPreferredShift] = useState(candidate.preferredShift || 'Day Shift');
  const [noticePeriod, setNoticePeriod] = useState(candidate.noticePeriod || 'Immediate');
  const [immediateJoining, setImmediateJoining] = useState(candidate.immediateJoining ?? true);

  // SECTION 10: Social Links
  const [linkedin, setLinkedin] = useState(candidate.linkedin || 'https://linkedin.com/in/rajeshkumar');
  const [github, setGithub] = useState(candidate.github || 'https://github.com/rajeshkumar');
  const [portfolio, setPortfolio] = useState(candidate.portfolio || 'https://rajeshkumar.dev');
  const [website, setWebsite] = useState(candidate.website || 'https://rajeshkumar.me');

  // SECTION 11: About Me
  const [bio, setBio] = useState(candidate.bio || 'Dedicated and results-driven professional with strong technical experience, eager to leverage skills in a dynamic environment to contribute to organizational success.');

  // SECTION 12: Languages
  const [languageList, setLanguageList] = useState<LanguageEntry[]>(candidate.languageList || [
    { id: 'lang-1', language: 'Hindi', proficiency: 'Native' },
    { id: 'lang-2', language: 'English', proficiency: 'Fluent' },
    { id: 'lang-3', language: 'Marathi', proficiency: 'Intermediate' }
  ]);
  const [newLang, setNewLang] = useState({ language: 'Hindi', proficiency: 'Fluent' as LanguageEntry['proficiency'] });

  // SECTION 13: Certifications
  const [certificationList, setCertificationList] = useState<CertificationEntry[]>(candidate.certificationList || [
    { id: 'cert-1', name: 'Certified CNC Machine Operator', organization: 'MSME Training Center', year: '2021', credentialId: 'MSME-CNC-9842' }
  ]);
  const [newCert, setNewCert] = useState({ name: '', organization: '', year: '2022', credentialId: '' });

  // SECTION 14: Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset to initial candidate values
  const handleReset = () => {
    setFirstName(candidate.firstName || '');
    setLastName(candidate.lastName || '');
    setEmail(candidate.email || '');
    setPhone(candidate.phone || '');
    setCity(candidate.location || '');
    setState(candidate.state || '');
    setExpectedSalary(candidate.expectedSalary || '20000');
    setSkills(candidate.skills || []);
    setErrors({});
    setToastMessage('Form reset to initial candidate profile.');
  };

  // Skill Handlers
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Education Handlers
  const handleAddEduEntry = () => {
    if (!newEdu.degree || !newEdu.college) return;
    const entry: EducationEntry = {
      id: `edu-${Date.now()}`,
      degree: newEdu.degree || '',
      qualification: newEdu.qualification || 'Graduate',
      college: newEdu.college || '',
      university: newEdu.university || 'State University',
      passingYear: newEdu.passingYear || '2021',
      grade: newEdu.grade || '75%',
    };
    setEducationList([...educationList, entry]);
    setNewEdu({ degree: '', qualification: 'B.Com', college: '', university: '', passingYear: '2021', grade: '' });
    setShowAddEdu(false);
  };

  // Experience Handlers
  const handleAddExpEntry = () => {
    if (!newExp.company || !newExp.designation) return;
    const entry: ExperienceEntry = {
      id: `exp-${Date.now()}`,
      company: newExp.company || '',
      designation: newExp.designation || '',
      startDate: newExp.startDate || '2022-01-01',
      endDate: newExp.currentlyWorking ? 'Present' : (newExp.endDate || '2023-12-31'),
      currentlyWorking: Boolean(newExp.currentlyWorking),
      responsibilities: newExp.responsibilities || '',
    };
    setExperienceList([...experienceList, entry]);
    setNewExp({ company: '', designation: '', startDate: '2022-01-01', endDate: '', currentlyWorking: true, responsibilities: '' });
    setShowAddExp(false);
  };

  // Language Handlers
  const handleAddLangEntry = () => {
    if (!newLang.language) return;
    const entry: LanguageEntry = {
      id: `lang-${Date.now()}`,
      language: newLang.language,
      proficiency: newLang.proficiency,
    };
    setLanguageList([...languageList, entry]);
  };

  // Certification Handlers
  const handleAddCertEntry = () => {
    if (!newCert.name || !newCert.organization) return;
    const entry: CertificationEntry = {
      id: `cert-${Date.now()}`,
      name: newCert.name,
      organization: newCert.organization,
      year: newCert.year,
      credentialId: newCert.credentialId || `CERT-${Math.floor(Math.random()*9000+1000)}`,
    };
    setCertificationList([...certificationList, entry]);
    setNewCert({ name: '', organization: '', year: '2022', credentialId: '' });
  };

  // Calculate live completion score
  const liveCompletion = (() => {
    let score = 0;
    if (firstName && lastName) score += 10;
    if (email && phone) score += 15;
    if (city && state) score += 10;
    if (skills.length >= 3) score += 15;
    if (resumeFile) score += 15;
    if (educationList.length > 0) score += 10;
    if (experienceList.length > 0) score += 10;
    if (expectedSalary) score += 5;
    if (profilePhotoFile) score += 5;
    if (bio) score += 5;
    return Math.min(score, 100);
  })();

  // Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!lastName.trim()) errs.lastName = 'Last name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Valid email is required';
    if (!phone.trim() || phone.length < 10) errs.phone = 'Valid 10-digit mobile number required';
    if (!city.trim()) errs.city = 'Current city is required';
    if (!state) errs.state = 'State is required';
    if (!expectedSalary || isNaN(Number(expectedSalary))) errs.expectedSalary = 'Valid monthly expected salary required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save changes and update candidate profile
  const handleSaveChanges = () => {
    if (!validateForm()) {
      setToastMessage('Please resolve form validation errors before saving.');
      setActiveSection('personal');
      return;
    }

    const updatedProfile: Partial<JobSeeker> = {
      firstName,
      lastName,
      email,
      phone,
      altPhone,
      dob,
      gender,
      maritalStatus,
      nationality,
      aadhaarNumber,
      panNumber,
      location: city,
      state,
      country,
      address,
      pincode,
      willingToRelocate,
      preferredLocations,
      currentJobTitle,
      currentCompany,
      previousCompany,
      totalExperience,
      relevantExperience,
      industry,
      department,
      qualification: educationList[0]?.degree || candidate.qualification,
      skills,
      resumeFile,
      profilePhotoFile,
      aadhaarFile,
      panFile,
      certificatesFile,
      experienceLetterFile,
      expectedSalary,
      preferredJobRole,
      preferredIndustry,
      preferredJobType,
      preferredShift,
      noticePeriod,
      immediateJoining,
      linkedin,
      github,
      portfolio,
      website,
      bio,
      educationList,
      experienceList,
      languageList,
      certificationList,
      currentStatus,
    };

    onSave(updatedProfile);
    setToastMessage('Profile updated successfully.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const sectionTabs = [
    { id: 'personal', label: 'Personal Info', icon: <User size={16} /> },
    { id: 'location', label: 'Location & Relocation', icon: <MapPin size={16} /> },
    { id: 'professional', label: 'Professional Info', icon: <Briefcase size={16} /> },
    { id: 'education', label: 'Education', icon: <GraduationCap size={16} /> },
    { id: 'skills', label: 'Skills', icon: <Sparkles size={16} /> },
    { id: 'resume', label: 'Resume', icon: <FileText size={16} /> },
    { id: 'experience', label: 'Experience', icon: <Award size={16} /> },
    { id: 'preferences', label: 'Expected Job', icon: <Briefcase size={16} /> },
    { id: 'documents', label: 'Documents Vault', icon: <Shield size={16} /> },
    { id: 'social', label: 'Social Links', icon: <Globe size={16} /> },
    { id: 'bio', label: 'About Me / Bio', icon: <BookOpen size={16} /> },
    { id: 'languages', label: 'Languages', icon: <Globe size={16} /> },
    { id: 'certifications', label: 'Certifications', icon: <Award size={16} /> },
  ];

  const activeStepIndex = sectionTabs.findIndex(t => t.id === activeSection);

  const [visitedSections, setVisitedSections] = useState<Set<string>>(new Set(['personal']));

  const goToSection = (id: string) => {
    setActiveSection(id);
    setVisitedSections(prev => new Set(prev).add(id));
  };

  const goStep = (delta: number) => {
    const nextIndex = Math.min(sectionTabs.length - 1, Math.max(0, activeStepIndex + delta));
    goToSection(sectionTabs[nextIndex].id);
  };

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 sm:py-6">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-6xl max-h-[calc(100dvh-48px)] flex flex-col overflow-hidden z-10 animate-fade-in">

        {/* ═══ HEADER BAR ═══ */}
        <div
          className="relative text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #101A36 0%, #1C2B52 60%, #101A36 100%)' }}
        >
          <div
            className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20 blur-2xl"
            style={{ background: 'radial-gradient(circle, var(--orange) 0%, transparent 70%)' }}
          />

          <div className="relative flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--orange)] to-[#d94d1a] text-white rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-lg ring-2 ring-white/15">
              {firstName[0] || 'C'}{lastName[0] || 'P'}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Manage & Edit Profile</h2>
              <p className="text-xs text-white/70 mt-0.5">Step {activeStepIndex + 1} of {sectionTabs.length} · {sectionTabs[activeStepIndex]?.label}</p>
            </div>
          </div>

          <div className="relative flex items-center gap-4">
            {/* Live Profile Completion Ring */}
            <div className="hidden sm:flex items-center gap-2.5 bg-white/[0.06] px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
              <div className="relative w-8 h-8 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                  <circle
                    cx="18" cy="18" r="15" fill="none" stroke="var(--orange)" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${(liveCompletion / 100) * 94.2} 94.2`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold">{liveCompletion}%</span>
              </div>
              <div className="leading-tight">
                <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wide">Profile Score</p>
                <p className="text-xs font-bold text-white">{liveCompletion >= 80 ? 'Excellent' : liveCompletion >= 50 ? 'Good progress' : 'Just getting started'}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={19} />
            </button>
          </div>
        </div>

        {/* ═══ STEP PROGRESS BAR ═══ */}
        <div className="px-5 sm:px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-3">
          <button
            onClick={() => goStep(-1)}
            disabled={activeStepIndex === 0}
            className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-[var(--navy)] hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Previous step"
          >
            ‹
          </button>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--orange)] to-[#d94d1a] rounded-full transition-all duration-400 ease-out"
              style={{ width: `${((activeStepIndex + 1) / sectionTabs.length) * 100}%` }}
            />
          </div>
          <button
            onClick={() => goStep(1)}
            disabled={activeStepIndex === sectionTabs.length - 1}
            className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-[var(--navy)] hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Next step"
          >
            ›
          </button>
        </div>

        {/* ═══ BODY SECTION (LEFT TAB SIDEBAR + RIGHT FORM EDITOR) ═══ */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">

          {/* LEFT STEPPER SIDEBAR (Desktop vertical stepper, Mobile scrollable pills) */}
          <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-3 md:p-4 flex md:flex-col gap-1 md:gap-0 overflow-x-auto md:overflow-y-auto flex-shrink-0" data-lenis-prevent>
            {sectionTabs.map((tab, i) => {
              const isActive = activeSection === tab.id;
              const isDone = visitedSections.has(tab.id) && !isActive;
              return (
                <button
                  key={tab.id}
                  onClick={() => goToSection(tab.id)}
                  className={`relative flex items-center gap-3 px-2.5 md:px-3 py-2.5 md:py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all text-left group ${
                    isActive ? 'bg-white shadow-md shadow-slate-900/5 border border-slate-200' : 'hover:bg-slate-100/80 border border-transparent'
                  }`}
                >
                  {/* Connecting line (desktop only) */}
                  {i < sectionTabs.length - 1 && (
                    <span className="hidden md:block absolute left-[27px] top-[38px] w-px h-[calc(100%-14px)] bg-slate-200" />
                  )}

                  <span
                    className={`relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-colors ${
                      isActive
                        ? 'bg-[var(--orange)] text-white shadow-sm shadow-orange-600/30'
                        : isDone
                        ? 'bg-[var(--green)]/12 text-[var(--green)]'
                        : 'bg-slate-200/80 text-slate-500 group-hover:bg-slate-300/70'
                    }`}
                  >
                    {isDone ? <CheckCircle size={13} /> : i + 1}
                  </span>

                  <span className={`flex items-center gap-1.5 min-w-0 ${isActive ? 'text-[var(--navy)]' : isDone ? 'text-slate-700' : 'text-slate-500'}`}>
                    <span className={isActive ? 'text-[var(--orange)]' : 'opacity-60'}>{tab.icon}</span>
                    <span className="truncate">{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* RIGHT SCROLLABLE SECTION EDITOR */}
          <div className="flex-1 min-h-0 p-5 sm:p-8 overflow-y-auto space-y-8 bg-white" data-lenis-prevent>
            
            {/* ═══ SECTION 1: PERSONAL INFORMATION ═══ */}
            {activeSection === 'personal' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <User className="text-[var(--orange)]" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">1. Personal Information</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                    {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                    {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alternate Mobile</label>
                    <input value={altPhone} onChange={e => setAltPhone(e.target.value)} placeholder="+91-9870000000" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Marital Status</label>
                    <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm">
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nationality</label>
                    <input value={nationality} onChange={e => setNationality(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Aadhaar Number (Dummy Verification)</label>
                    <input value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value)} placeholder="5489 1234 9876" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Number (Dummy Verification)</label>
                    <input value={panNumber} onChange={e => setPanNumber(e.target.value)} placeholder="ABCDE1234F" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-mono uppercase" />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ SECTION 2: LOCATION ═══ */}
            {activeSection === 'location' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <MapPin className="text-[var(--orange)]" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">2. Location & Relocation Preferences</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current City *</label>
                    <input value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                    <select value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm">
                      <option value="">Select State</option>
                      {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                    <input value={country} onChange={e => setCountry(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                    <input value={pincode} onChange={e => setPincode(e.target.value)} placeholder="302015" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Street Address</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} placeholder="House No., Street, Area, Landmark" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={willingToRelocate} onChange={e => setWillingToRelocate(e.target.checked)} className="w-4 h-4 text-[var(--orange)] rounded" />
                    <span className="text-sm font-bold text-slate-900">Willing to Relocate to other cities/states</span>
                  </label>

                  {willingToRelocate && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-500 mb-2 font-medium">Select Preferred Relocation Cities / States:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad', 'Jaipur', 'Lucknow'].map(loc => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              if (preferredLocations.includes(loc)) setPreferredLocations(preferredLocations.filter(l => l !== loc));
                              else setPreferredLocations([...preferredLocations, loc]);
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                              preferredLocations.includes(loc)
                                ? 'bg-[var(--orange)] text-white border-[var(--orange)]'
                                : 'bg-white text-slate-700 border-slate-300'
                            }`}
                          >
                            {preferredLocations.includes(loc) ? '✓ ' : '+ '}{loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ SECTION 3: PROFESSIONAL INFO ═══ */}
            {activeSection === 'professional' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Briefcase className="text-[var(--orange)]" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">3. Professional Information</h3>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current Job Title</label>
                    <input value={currentJobTitle} onChange={e => setCurrentJobTitle(e.target.value)} placeholder="e.g. Machine Operator" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current Company</label>
                    <input value={currentCompany} onChange={e => setCurrentCompany(e.target.value)} placeholder="e.g. Bharat Manufacturing Co." className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Company</label>
                    <input value={previousCompany} onChange={e => setPreviousCompany(e.target.value)} placeholder="e.g. Local Traders Pvt Ltd" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Total Experience (Years)</label>
                    <input value={totalExperience} onChange={e => setTotalExperience(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Relevant Exp. (Years)</label>
                    <input value={relevantExperience} onChange={e => setRelevantExperience(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current Status</label>
                    <select value={currentStatus} onChange={e => setCurrentStatus(e.target.value as any)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold">
                      <option value="Open to Work">🟢 Open to Work</option>
                      <option value="Employed">🏢 Employed</option>
                      <option value="Freelancer">💻 Freelancer</option>
                      <option value="Student">🎓 Student</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Industry / Sector</label>
                    <div className="relative">
                      <input value={sectorInput} onChange={(e) => handleSectorInputChange(e.target.value)} onFocus={() => { setSectorDropdownOpen(true); setFilteredSectors(getSectorsList()); }} onBlur={() => setTimeout(() => setSectorDropdownOpen(false), 200)} placeholder="Type or select sector..." className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm pr-8" />
                      <button type="button" onClick={() => setSectorDropdownOpen(!sectorDropdownOpen)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <svg className={`w-4 h-4 transition-transform ${sectorDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                    {sectorDropdownOpen && filteredSectors.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredSectors.map((sector) => (
                          <button key={sector} type="button" onMouseDown={() => handleSectorSelect(sector)} className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-[var(--orange)] ${sector === sectorInput ? 'bg-orange-50 text-[var(--orange)] font-medium' : 'text-slate-700'}`}>{sector}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Sub-Sector</label>
                    <div className="relative">
                      <input value={deptInput} onChange={(e) => handleDeptInputChange(e.target.value)} onFocus={() => { setDeptDropdownOpen(true); const subsectors = getSubsectorsForSector(industry || sectorInput); setFilteredDepts(subsectors); }} onBlur={() => setTimeout(() => setDeptDropdownOpen(false), 200)} placeholder={industry || sectorInput ? "Type or select department..." : "Select sector first"} disabled={!industry && !sectorInput} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm pr-8 disabled:bg-slate-50 disabled:text-slate-400" />
                      <button type="button" onClick={() => { if (industry || sectorInput) { setDeptDropdownOpen(!deptDropdownOpen); const subsectors = getSubsectorsForSector(industry || sectorInput); setFilteredDepts(subsectors); } }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <svg className={`w-4 h-4 transition-transform ${deptDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                    {deptDropdownOpen && filteredDepts.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredDepts.map((dept) => (
                          <button key={dept} type="button" onMouseDown={() => handleDeptSelect(dept)} className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-[var(--orange)] ${dept === deptInput ? 'bg-orange-50 text-[var(--orange)] font-medium' : 'text-slate-700'}`}>{dept}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ SECTION 4: EDUCATION ═══ */}
            {activeSection === 'education' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="text-[var(--orange)]" size={20} />
                    <h3 className="text-lg font-bold text-slate-900">4. Education History</h3>
                  </div>
                  <Button size="sm" onClick={() => setShowAddEdu(true)} className="gap-1 text-xs">
                    <Plus size={14} /> Add Education
                  </Button>
                </div>

                {/* Add Education Form Box */}
                {showAddEdu && (
                  <div className="p-4 rounded-2xl bg-[rgba(241,90,36,0.1)]/60 border border-[rgba(241,90,36,0.2)] space-y-3">
                    <h4 className="font-bold text-sm text-slate-900">Add New Qualification</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input placeholder="Degree (e.g. B.Com / ITI)" value={newEdu.degree} onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm" />
                      <input placeholder="College / School Name" value={newEdu.college} onChange={e => setNewEdu({ ...newEdu, college: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm" />
                      <input placeholder="University / Board" value={newEdu.university} onChange={e => setNewEdu({ ...newEdu, university: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm" />
                      <input placeholder="Passing Year (e.g. 2021)" value={newEdu.passingYear} onChange={e => setNewEdu({ ...newEdu, passingYear: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm" />
                      <input placeholder="Grade / Percentage (e.g. 78%)" value={newEdu.grade} onChange={e => setNewEdu({ ...newEdu, grade: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm" />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <Button size="sm" variant="ghost" onClick={() => setShowAddEdu(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleAddEduEntry}>Save Entry</Button>
                    </div>
                  </div>
                )}

                {/* Education List */}
                <div className="space-y-3">
                  {educationList.map(edu => (
                    <div key={edu.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{edu.degree} ({edu.qualification})</h4>
                        <p className="text-xs text-slate-500 font-medium">{edu.college} • {edu.university}</p>
                        <p className="text-xs text-[var(--orange)] font-semibold mt-1">Passing Year: {edu.passingYear} | Score: {edu.grade}</p>
                      </div>
                      <button onClick={() => setEducationList(educationList.filter(e => e.id !== edu.id))} className="text-red-500 hover:text-red-700 p-2 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ SECTION 5: SKILLS ═══ */}
            {activeSection === 'skills' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Sparkles className="text-[var(--orange)]" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">5. Skills Management</h3>
                </div>

                <div className="flex gap-2">
                  <input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(skillInput); } }}
                    placeholder="Type a skill and press Enter..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm"
                  />
                  <Button onClick={() => handleAddSkill(skillInput)} className="gap-1">
                    <Plus size={16} /> Add Skill
                  </Button>
                </div>

                {/* Active Skill Chips */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">My Selected Skills ({skills.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (
                      <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(241,90,36,0.1)] text-[var(--orange)] border border-[rgba(241,90,36,0.2)] rounded-xl text-xs font-bold shadow-2xs">
                        {s}
                        <button onClick={() => handleRemoveSkill(s)} className="text-[var(--orange)] hover:text-red-500 ml-1"><X size={14} /></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggested Skills */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-700 mb-2">Suggested High-Demand Skills (Click to Add):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedSkillList.filter(s => !skills.includes(s)).map(s => (
                      <button
                        key={s}
                        onClick={() => handleAddSkill(s)}
                        className="px-2.5 py-1 bg-white text-slate-700 hover:bg-[rgba(241,90,36,0.1)] border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ SECTION 6: RESUME ═══ */}
            {activeSection === 'resume' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <FileText className="text-[var(--orange)]" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">6. Resume Center</h3>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[rgba(241,90,36,0.1)] text-[var(--orange)] rounded-2xl">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{resumeFile}</h4>
                      <p className="text-xs text-slate-500">PDF Document • Uploaded Jan 2024</p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-xs font-bold">ATS Score: 92%</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Button variant="outline" size="sm" onClick={() => setToastMessage('Previewing current resume...')} className="gap-1">
                    <Eye size={14} /> Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setToastMessage('Downloading resume file...')} className="gap-1">
                    <Download size={14} /> Download
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setToastMessage('Select a file to replace current resume')} className="gap-1">
                    <Upload size={14} /> Replace
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setResumeFile('New_Updated_Resume.pdf')} className="gap-1">
                    <RefreshCw size={14} /> Re-Scan ATS
                  </Button>
                </div>
              </div>
            )}

            {/* ═══ SECTION 7: WORK EXPERIENCE ═══ */}
            {activeSection === 'experience' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Award className="text-[var(--orange)]" size={20} />
                    <h3 className="text-lg font-bold text-slate-900">7. Work Experience History</h3>
                  </div>
                  <Button size="sm" onClick={() => setShowAddExp(true)} className="gap-1 text-xs">
                    <Plus size={14} /> Add Work Experience
                  </Button>
                </div>

                {/* Add Experience Form */}
                {showAddExp && (
                  <div className="p-4 rounded-2xl bg-[rgba(241,90,36,0.1)]/60 border border-[rgba(241,90,36,0.2)] space-y-3">
                    <h4 className="font-bold text-sm text-slate-900">Add Past / Current Employment</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input placeholder="Company Name" value={newExp.company} onChange={e => setNewExp({ ...newExp, company: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm" />
                      <input placeholder="Designation / Job Role" value={newExp.designation} onChange={e => setNewExp({ ...newExp, designation: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm" />
                      <input type="date" value={newExp.startDate} onChange={e => setNewExp({ ...newExp, startDate: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm" />
                      <input type="date" disabled={newExp.currentlyWorking} value={newExp.endDate} onChange={e => setNewExp({ ...newExp, endDate: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm disabled:opacity-50" />
                    </div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input type="checkbox" checked={newExp.currentlyWorking} onChange={e => setNewExp({ ...newExp, currentlyWorking: e.target.checked })} className="rounded text-[var(--orange)]" />
                      <span>Currently Working Here</span>
                    </label>
                    <textarea placeholder="Key Responsibilities & Achievements..." value={newExp.responsibilities} onChange={e => setNewExp({ ...newExp, responsibilities: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-xl border bg-white text-sm" />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setShowAddExp(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleAddExpEntry}>Save Experience</Button>
                    </div>
                  </div>
                )}

                {/* Experience List */}
                <div className="space-y-3">
                  {experienceList.map(exp => (
                    <div key={exp.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{exp.designation}</h4>
                        <p className="text-xs text-[var(--orange)] font-semibold">{exp.company}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{exp.startDate} — {exp.currentlyWorking ? 'Present' : exp.endDate}</p>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{exp.responsibilities}</p>
                      </div>
                      <button onClick={() => setExperienceList(experienceList.filter(e => e.id !== exp.id))} className="text-red-500 hover:text-red-700 p-2 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ SECTION 8: EXPECTED JOB PREFERENCES ═══ */}
            {activeSection === 'preferences' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Briefcase className="text-[var(--orange)]" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">8. Expected Job & Salary Preferences</h3>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Monthly Salary (₹) *</label>
                    <input value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-bold" />
                    {errors.expectedSalary && <p className="text-xs text-red-500 mt-1">{errors.expectedSalary}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Job Role</label>
                    <input value={preferredJobRole} onChange={e => setPreferredJobRole(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Industry</label>
                    <input value={preferredIndustry} onChange={e => setPreferredIndustry(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Employment Type</label>
                    <select value={preferredJobType} onChange={e => setPreferredJobType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Shift</label>
                    <select value={preferredShift} onChange={e => setPreferredShift(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm">
                      <option value="Day Shift">Day Shift</option>
                      <option value="Night Shift">Night Shift</option>
                      <option value="Rotational Shift">Rotational Shift</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Period</label>
                    <select value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm">
                      <option value="Immediate">Immediate Joining</option>
                      <option value="15 Days">15 Days</option>
                      <option value="1 Month">1 Month</option>
                      <option value="2 Months">2 Months</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <input type="checkbox" checked={immediateJoining} onChange={e => setImmediateJoining(e.target.checked)} className="w-4 h-4 text-[var(--orange)] rounded" />
                  <span className="text-sm font-bold text-slate-900">Immediate Joining Available (Ready to join within 48 hours)</span>
                </label>
              </div>
            )}

            {/* ═══ SECTION 9: DOCUMENTS VAULT ═══ */}
            {activeSection === 'documents' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Shield className="text-[var(--orange)]" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">9. Documents Vault (Dummy Verification)</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Resume Document', file: resumeFile, setFile: setResumeFile },
                    { title: 'Profile Photo', file: profilePhotoFile, setFile: setProfilePhotoFile },
                    { title: 'Aadhaar Card Copy', file: aadhaarFile, setFile: setAadhaarFile },
                    { title: 'PAN Card Copy', file: panFile, setFile: setPanFile },
                    { title: 'Educational Degree Certificates', file: certificatesFile, setFile: setCertificatesFile },
                    { title: 'Work Experience Letter', file: experienceLetterFile, setFile: setExperienceLetterFile },
                  ].map((doc, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs text-slate-900">{doc.title}</p>
                        <p className="text-[11px] text-[var(--orange)] font-semibold mt-0.5">{doc.file}</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => setToastMessage(`Uploaded new file for ${doc.title}`)}>
                        <Upload size={12} className="mr-1" /> Upload
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ SECTION 10: SOCIAL LINKS ═══ */}
            {activeSection === 'social' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Globe className="text-[var(--orange)]" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">10. Social & Portfolio Web Links</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
                    <input value={linkedin} onChange={e => setLinkedin(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Profile</label>
                    <input value={github} onChange={e => setGithub(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio Website</label>
                    <input value={portfolio} onChange={e => setPortfolio(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Website / Blog</label>
                    <input value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ SECTION 11: ABOUT ME ═══ */}
            {activeSection === 'bio' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <BookOpen className="text-[var(--orange)]" size={20} />
                  <h3 className="text-lg font-bold text-slate-900">11. About Me & Professional Summary</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Career Objective & Bio Highlights</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={6} className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 text-sm leading-relaxed" />
                </div>
              </div>
            )}

            {/* ═══ SECTION 12: LANGUAGES ═══ */}
            {activeSection === 'languages' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Globe className="text-[var(--orange)]" size={20} />
                    <h3 className="text-lg font-bold text-slate-900">12. Languages Known</h3>
                  </div>
                </div>

                <div className="flex gap-2">
                  <select value={newLang.language} onChange={e => setNewLang({ ...newLang, language: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm">
                    {languageSuggestions.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <select value={newLang.proficiency} onChange={e => setNewLang({ ...newLang, proficiency: e.target.value as any })} className="px-3 py-2 rounded-xl border bg-white text-sm">
                    <option value="Basic">Basic</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Native">Native</option>
                  </select>
                  <Button size="sm" onClick={handleAddLangEntry} className="gap-1">
                    <Plus size={14} /> Add Language
                  </Button>
                </div>

                <div className="space-y-2">
                  {languageList.map(lng => (
                    <div key={lng.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{lng.language}</span>
                      <div className="flex items-center gap-3">
                        <Badge variant="info">{lng.proficiency}</Badge>
                        <button onClick={() => setLanguageList(languageList.filter(l => l.id !== lng.id))} className="text-red-500 p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══ SECTION 13: CERTIFICATIONS ═══ */}
            {activeSection === 'certifications' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Award className="text-[var(--orange)]" size={20} />
                    <h3 className="text-lg font-bold text-slate-900">13. Certifications & Licenses</h3>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(241,90,36,0.1)]/50 border border-[rgba(241,90,36,0.2)] space-y-3">
                  <h4 className="font-bold text-sm text-slate-900">Add Professional Certification</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input placeholder="Certification Name" value={newCert.name} onChange={e => setNewCert({ ...newCert, name: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm" />
                    <input placeholder="Issuing Organization" value={newCert.organization} onChange={e => setNewCert({ ...newCert, organization: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm" />
                    <input placeholder="Completion Year" value={newCert.year} onChange={e => setNewCert({ ...newCert, year: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm" />
                    <input placeholder="Credential ID (Optional)" value={newCert.credentialId} onChange={e => setNewCert({ ...newCert, credentialId: e.target.value })} className="px-3 py-2 rounded-xl border bg-white text-sm" />
                  </div>
                  <Button size="sm" onClick={handleAddCertEntry} className="gap-1">
                    <Plus size={14} /> Save Certification
                  </Button>
                </div>

                <div className="space-y-2">
                  {certificationList.map(crt => (
                    <div key={crt.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{crt.name}</h4>
                        <p className="text-xs text-slate-500">{crt.organization} • {crt.year} (ID: {crt.credentialId})</p>
                      </div>
                      <button onClick={() => setCertificationList(certificationList.filter(c => c.id !== crt.id))} className="text-red-500 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ BOTTOM ACTION BAR ═══ */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-slate-600 gap-1">
              <RefreshCw size={14} /> Reset Changes
            </Button>
            <Button variant="outline" size="sm" onClick={() => setToastMessage('Draft profile saved locally.')} className="text-xs gap-1">
              <Save size={14} /> Save Draft
            </Button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="success" size="md" onClick={handleSaveChanges} className="gap-1.5 text-sm font-bold shadow-lg">
              <CheckCircle size={16} /> Save Changes
            </Button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}


