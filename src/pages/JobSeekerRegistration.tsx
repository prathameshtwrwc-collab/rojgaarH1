import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, User, Briefcase, MapPin } from 'lucide-react';
import { Button, Input, Select, ProgressBar, StepIndicator, SkillTags, FileUpload, Toast } from '../components/ui';
import { useData, JobSeeker } from '../context/DataContext';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh',
];

const skillSuggestions = [
  'Accounting', 'Agriculture', 'Assembly', 'AutoCAD', 'CNC Operation', 'Construction', 'Cooking',
  'Customer Service', 'Data Entry', 'Driving', 'Electrical Wiring', 'Embroidery', 'Excel',
  'Fabrication', 'First Aid', 'Handicraft', 'HR', 'Java', 'Machine Operation', 'Maintenance',
  'Microsoft Office', 'Motor Repair', 'Nursing', 'Patient Care', 'Payroll', 'Pharmacy',
  'Python', 'Quality Control', 'Recruitment', 'Sales', 'SQL', 'Tailoring', 'Teaching',
  'Team Management', 'Typing', 'Welding', 'Warehouse', 'Quality Check',
];

function JobSeekerRegistration() {
  const { addJobSeeker, candidateLogin } = useData();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '', dob: '',
    location: '', state: '', gender: '', qualification: '',
    skills: [] as string[], previousCompany: '', totalExperience: '',
    willingToRelocate: false, preferredLocations: [] as string[],
    expectedSalary: '', preferredJobType: '', resumeFile: null as File | null,
    profilePhoto: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[+]?[\d\s-]{10,}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.dob) e.dob = 'Date of birth is required';
    else {
      const age = (Date.now() - new Date(form.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 16) e.dob = 'You must be at least 16 years old';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.location.trim()) e.location = 'Current location is required';
    if (!form.state) e.state = 'State is required';
    if (!form.totalExperience.trim()) e.totalExperience = 'Experience is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (form.willingToRelocate && form.preferredLocations.length === 0) {
      e.preferredLocations = 'Select at least one preferred location';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = () => {
    if (!validateStep3()) return;

    const newSeeker: JobSeeker = {
      id: `JS${String(Date.now()).slice(-6)}`,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      email: form.email,
      dob: form.dob,
      location: form.location,
      state: form.state,
      gender: form.gender || 'Not Specified',
      qualification: form.qualification || 'Not Specified',
      skills: form.skills,
      previousCompany: form.previousCompany || 'N/A',
      totalExperience: form.totalExperience,
      willingToRelocate: form.willingToRelocate,
      preferredLocations: form.preferredLocations,
      expectedSalary: form.expectedSalary || 'Negotiable',
      preferredJobType: form.preferredJobType || 'Full-time',
      status: 'New',
      createdAt: new Date().toISOString().split('T')[0],
      resumeFile: form.resumeFile ? form.resumeFile.name : undefined,
      profilePhotoFile: form.profilePhoto ? form.profilePhoto.name : undefined,
    };
    addJobSeeker(newSeeker);
    setSubmitted(true);
  };

  const stepLabels = ['Personal Info', 'Professional', 'Preferences'];

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--bg-warm)] flex items-center justify-center p-4 transition-colors duration-300" style={{ fontFamily: 'var(--font)' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 success-icon-landing flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--navy)]">Profile Submitted!</h1>
          <p className="text-[var(--charcoal)] mt-3 leading-relaxed text-sm sm:text-base">
            Hello {form.firstName}, thank you for registering at ROJGAARHAI.
            You will receive a confirmation email shortly. Our team will review your profile and contact you with matching job opportunities.
          </p>
          <div className="mt-6 card-landing p-6 text-left shadow-md">
            <h3 className="font-bold text-[var(--navy)] mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-[var(--charcoal)]">
              <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[var(--green)] mt-0.5 flex-shrink-0" /> Check your email for a confirmation message</li>
              <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[var(--green)] mt-0.5 flex-shrink-0" /> Our agent will review your profile within 2-3 days</li>
              <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[var(--green)] mt-0.5 flex-shrink-0" /> You'll be contacted when a matching job is found</li>
              <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[var(--green)] mt-0.5 flex-shrink-0" /> Keep your phone accessible for our call</li>
            </ul>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => { candidateLogin(form.email); navigate('/dashboard/candidate'); }}>
              Go to Candidate Dashboard →
            </Button>
            <Link to="/"><Button variant="outline">Back to Home</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-[var(--bg-warm)] transition-colors duration-300" style={{ fontFamily: 'var(--font)' }}>
      {/* Header */}
      <div className="bg-[var(--bg-warm)] border-b border-[rgba(16,26,54,0.06)] backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-[var(--charcoal)] hover:text-[var(--navy)] transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm font-semibold">Back to Home</span>
            </Link>
            <h1 className="text-lg font-extrabold text-[var(--navy)]">Create Your Candidate Profile</h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <ProgressBar current={step} total={3} />
          <div className="mt-4">
            <StepIndicator steps={stepLabels} currentStep={step} />
          </div>
        </div>

        {/* Form Card */}
        <div className="card-landing p-6 sm:p-8">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 icon-box-landing"><User size={22} /></div>
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--navy)]">Personal Information</h2>
                  <p className="text-sm text-[var(--charcoal)]">Tell us about yourself</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="First Name" required value={form.firstName} onChange={e => update('firstName', e.target.value)} error={errors.firstName} placeholder="e.g. Rajesh" />
                <Input label="Last Name" required value={form.lastName} onChange={e => update('lastName', e.target.value)} error={errors.lastName} placeholder="e.g. Kumar" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Phone Number" required type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} error={errors.phone} placeholder="+91-9876543210" hint="Include country code" />
                <Input label="Email Address" required type="email" value={form.email} onChange={e => update('email', e.target.value)} error={errors.email} placeholder="you@email.com" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Date of Birth" required type="date" value={form.dob} onChange={e => update('dob', e.target.value)} error={errors.dob} />
                <Select
                  label="Gender"
                  options={[
                    { value: '', label: 'Select Gender (Optional)' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' },
                  ]}
                  value={form.gender}
                  onChange={e => update('gender', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Professional */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 icon-box-landing"><Briefcase size={22} /></div>
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--navy)]">Professional Details</h2>
                  <p className="text-sm text-[var(--charcoal)]">Tell us about your work experience</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Current Location (City/Village)" required value={form.location} onChange={e => update('location', e.target.value)} error={errors.location} placeholder="e.g. Jaipur" />
                <Select
                  label="State"
                  required
                  options={[{ value: '', label: 'Select State' }, ...indianStates.map(s => ({ value: s, label: s }))]}
                  value={form.state}
                  onChange={e => update('state', e.target.value)}
                  error={errors.state}
                />
              </div>
              <Select
                label="Highest Qualification"
                options={[
                  { value: '', label: 'Select Qualification (Optional)' },
                  { value: 'Below 10th', label: 'Below 10th' },
                  { value: '10th Pass', label: '10th Pass' },
                  { value: '12th Pass', label: '12th Pass' },
                  { value: 'ITI', label: 'ITI' },
                  { value: 'Diploma', label: 'Diploma' },
                  { value: 'BA', label: 'BA' },
                  { value: 'B.Sc', label: 'B.Sc' },
                  { value: 'B.Com', label: 'B.Com' },
                  { value: 'B.Tech', label: 'B.Tech' },
                  { value: 'BBA', label: 'BBA' },
                  { value: 'BCA', label: 'BCA' },
                  { value: 'MBA', label: 'MBA' },
                  { value: 'M.Sc', label: 'M.Sc' },
                  { value: 'M.Com', label: 'M.Com' },
                  { value: 'B.Ed', label: 'B.Ed' },
                  { value: 'B.Pharm', label: 'B.Pharm' },
                  { value: 'B.Sc Nursing', label: 'B.Sc Nursing' },
                  { value: 'Other', label: 'Other' },
                ]}
                value={form.qualification}
                onChange={e => update('qualification', e.target.value)}
              />
              <SkillTags
                label="Key Skills"
                value={form.skills}
                onChange={tags => update('skills', tags)}
                suggestions={skillSuggestions}
                placeholder="Type a skill and press Enter"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Previous Company" value={form.previousCompany} onChange={e => update('previousCompany', e.target.value)} placeholder="e.g. Local Traders Pvt Ltd" hint="Leave blank if fresher" />
                <Input label="Total Experience (Years)" required value={form.totalExperience} onChange={e => update('totalExperience', e.target.value)} error={errors.totalExperience} placeholder="e.g. 3" />
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 icon-box-landing"><MapPin size={22} /></div>
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--navy)]">Job Preferences</h2>
                  <p className="text-sm text-[var(--charcoal)]">Help us find the right match for you</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.willingToRelocate}
                  onChange={e => update('willingToRelocate', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[var(--orange)] focus:ring-[var(--orange)]"
                />
                <span className="text-sm font-semibold text-[var(--charcoal)]">Willing to Relocate?</span>
              </label>
              {form.willingToRelocate && (
                <div>
                  <label className="block text-sm font-semibold text-[var(--charcoal)] mb-1.5">Preferred Locations</label>
                  <div className="flex flex-wrap gap-2">
                    {indianStates.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          const locs = form.preferredLocations.includes(s)
                            ? form.preferredLocations.filter(l => l !== s)
                            : [...form.preferredLocations, s];
                          update('preferredLocations', locs);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          form.preferredLocations.includes(s)
                            ? 'bg-[var(--bg-warm)] border-[var(--orange)] text-[var(--orange)]'
                            : 'bg-[var(--bg-warm)] border-[rgba(16,26,54,0.06)] text-[var(--charcoal)] hover:border-[var(--navy)]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {errors.preferredLocations && <p className="mt-1 text-xs text-red-600">{errors.preferredLocations}</p>}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Expected Salary (₹/month)" type="number" value={form.expectedSalary} onChange={e => update('expectedSalary', e.target.value)} placeholder="e.g. 18000" hint="Monthly in-hand amount" />
                <Select
                  label="Preferred Job Type"
                  options={[
                    { value: '', label: 'Select Job Type (Optional)' },
                    { value: 'Full-time', label: 'Full-time' },
                    { value: 'Part-time', label: 'Part-time' },
                    { value: 'Contract', label: 'Contract' },
                  ]}
                  value={form.preferredJobType}
                  onChange={e => update('preferredJobType', e.target.value)}
                />
              </div>
              <FileUpload
                label="Resume Upload (Optional)"
                accept=".pdf,.doc,.docx"
                onChange={f => update('resumeFile', f)}
                hint="Accepted formats: PDF, DOC, DOCX. Max 5MB."
              />
              <FileUpload
                label="Profile Photo (Optional)"
                accept="image/*"
                onChange={f => update('profilePhoto', f)}
                hint="JPG or PNG. Helps employers recognize you."
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-[rgba(16,26,54,0.06)]">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-1">
                <ArrowLeft size={16} /> Previous
              </Button>
            ) : <div />}
            {step < 3 ? (
              <Button onClick={handleNext} className="gap-1">
                Next <ArrowRight size={16} />
              </Button>
            ) : (
              <Button variant="success" onClick={handleSubmit} size="lg" className="gap-2 btn-landing-primary">
                <CheckCircle size={18} /> Submit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--charcoal)]">
          <span className="flex items-center gap-1">🔒 Your data is secure</span>
          <span className="flex items-center gap-1">✓ Free registration</span>
          <span className="flex items-center gap-1">📧 Email confirmation</span>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default JobSeekerRegistration;

