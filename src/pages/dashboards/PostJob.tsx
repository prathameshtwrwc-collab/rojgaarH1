import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, CheckCircle, Clock, Info, Home, Car, AlertCircle, Loader2 } from 'lucide-react';
import { haptic } from '../../lib/haptics';
import { useDatabase } from '../../context/DatabaseContext';
import { createJobPosting, setJobSkills } from '../../lib/supabase/data';
import { SkillTagInput } from '../../components/SkillTagInput';
import { SECTORS, getSubsectorsForSector } from '../../constants/sectors';
import { skillsForSubsector, allTaxonomySkills } from '../../constants/skills';
import { deadlineDateRange, isValidDeadline } from '../../lib/dateRange';

const ALL_ROLES = Array.from(new Set(SECTORS.flatMap(s => getSubsectorsForSector(s)))).sort((a, b) => a.localeCompare(b));

export default function PostJob() {
  const { employer, refresh } = useDatabase();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    jobTitle: '',
    numberOfOpenings: '1',
    city: '',
    state: '',
    address: '',
    salaryMin: '',
    salaryMax: '',
    employmentType: 'Full-time',
    qualificationRequired: '',
    experienceMinYears: '0',
    experienceMaxYears: '',
    jobDescription: '',
    benefits: '',
    joiningTimeline: '',
    workingHours: '',
    accommodationProvided: false,
    transportationProvided: false,
    sector: '',
    subsector: '',
    skills: [] as string[],
    deadline: '',
    recruiterName: employer?.contact_name || '',
    recruiterEmail: employer?.contact_email || '',
    recruiterPhone: employer?.contact_phone || '',
  });

  // The company record can arrive a moment after this page opens: fill the contact fields then,
  // without overwriting anything already typed.
  useEffect(() => {
    if (!employer) return;
    setForm(prev => ({
      ...prev,
      recruiterName: prev.recruiterName || employer.contact_name || '',
      recruiterEmail: prev.recruiterEmail || employer.contact_email || '',
      recruiterPhone: prev.recruiterPhone || employer.contact_phone || '',
    }));
  }, [employer]);

  // A new error is scrolled into view, so it is never missed below the fold on a phone
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [error]);

  // Role suggestions follow the typed sector when it is a known one; otherwise every role is offered.
  const roleOptions = SECTORS.includes(form.sector as (typeof SECTORS)[number]) ? getSubsectorsForSector(form.sector) : ALL_ROLES;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!employer) {
      setError('Employer profile not loaded yet. Please try again in a moment.');
      return;
    }
    if (!form.jobTitle || !form.jobDescription || !form.city || !form.state || !form.qualificationRequired || !form.sector.trim() || !form.subsector.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isValidDeadline(form.deadline)) {
      setError('Application deadline must be between today and 1.5 months from today.');
      return;
    }
    if (form.salaryMin && form.salaryMax && Number(form.salaryMax) < Number(form.salaryMin)) {
      setError('Maximum salary cannot be lower than the minimum salary.');
      return;
    }
    if (form.experienceMinYears && form.experienceMaxYears && Number(form.experienceMaxYears) < Number(form.experienceMinYears)) {
      setError('Maximum experience cannot be lower than the minimum experience.');
      return;
    }

    setLoading(true);

    try {
      const job = await createJobPosting({
        employer_id: employer.id,
        job_title: form.jobTitle,
        sector: form.sector.trim(),
        subsector: form.subsector.trim(),
        number_of_openings: parseInt(form.numberOfOpenings) || 1,
        city: form.city,
        state: form.state,
        address: form.address.trim() || null,
        salary_min: form.salaryMin ? Number(form.salaryMin) : null,
        salary_max: form.salaryMax ? Number(form.salaryMax) : null,
        employment_type: form.employmentType as any,
        qualification_required: form.qualificationRequired,
        experience_min_years: form.experienceMinYears ? Number(form.experienceMinYears) : null,
        experience_max_years: form.experienceMaxYears ? Number(form.experienceMaxYears) : null,
        job_description: form.jobDescription,
        benefits: form.benefits || null,
        joining_timeline: form.joiningTimeline || null,
        working_hours: form.workingHours || null,
        accommodation_provided: form.accommodationProvided,
        transportation_provided: form.transportationProvided,
        deadline: form.deadline || null,
        recruiter_name: form.recruiterName || null,
        recruiter_email: form.recruiterEmail || null,
        recruiter_phone: form.recruiterPhone || null,
        status: 'Pending',
        is_verified: false,
      } as any);

      if (form.skills.length > 0) await setJobSkills((job as any).id, form.skills);

      await refresh({ silent: true });
      haptic('success');
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        navigate('/dashboard/employer', { replace: true });
      }, 3500);
    } catch (err) {
      haptic('warn');
      const message = (err as { message?: string } | null)?.message;
      setError(message ? `Could not submit the job: ${message}` : 'Could not submit the job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "ui-field w-full px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[var(--navy)] min-w-0 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[var(--orange)]/20 focus:border-[var(--orange)] transition-[border-color,box-shadow]";
  const labelClass = "block text-sm font-semibold text-[var(--navy)] mb-1.5";
  const sectionTitle = "text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--orange)] pt-2";

  return (
    <div className="post-job-page min-h-screen bg-[var(--bg-warm)] px-3 pt-[calc(1.25rem+env(safe-area-inset-top,0px))] pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:px-4 sm:py-10" style={{ fontFamily: 'var(--font)' }}>
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard/employer" className="inline-flex items-center gap-1.5 -ml-1 h-10 px-1.5 rounded-full text-sm font-semibold text-[var(--charcoal)] hover:text-[var(--navy)] mb-3 sm:mb-6">
          <ArrowLeft size={17} /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-[22px] sm:rounded-2xl shadow-lg shadow-[#101A36]/5 border border-[#EFEAE1] p-5 sm:p-8 dash-enter">
          {submitted ? (
            <div className="p-4 sm:p-6 text-center" role="status">
              <div className="w-16 h-16 rounded-full bg-[var(--green)] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/25 animate-[ap-scale-in_520ms_cubic-bezier(0.16,1,0.3,1)_backwards]">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-[var(--navy)] mb-2">Job submitted</h3>
              <p className="text-sm text-[var(--charcoal)] mb-5 max-w-sm mx-auto">Our team reviews it next. It appears in your dashboard as "Pending approval" and goes live once approved.</p>
              <button
                type="button"
                onClick={() => navigate('/dashboard/employer', { replace: true })}
                className="dash-btn dash-btn-primary"
              >
                Go to dashboard
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Clock size={13} /> Taking you there in a moment…
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[var(--orange)]/10 text-[var(--orange)] rounded-xl flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-[var(--navy)]">Post a New Job</h1>
                  <p className="text-xs text-[var(--charcoal)] flex items-center gap-1"><Info size={12} className="flex-shrink-0" /> Free to post. It goes live after our team approves it.</p>
                </div>
              </div>

              {error && (
                <div ref={errorRef} role="alert" className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2 dash-enter">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> <span>{error}</span>
                </div>
              )}

              <form id="post-job-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
                <p className={sectionTitle}>The job</p>
                <div>
                  <label className={labelClass}>Job Title *</label>
                  <input name="jobTitle" value={form.jobTitle} onChange={handleChange} required className={inputClass} placeholder="e.g. CNC Machine Operator" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Number of Openings</label>
                    <input name="numberOfOpenings" type="number" inputMode="numeric" min={1} value={form.numberOfOpenings} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Employment Type</label>
                    <select name="employmentType" value={form.employmentType} onChange={handleChange} className={inputClass}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                </div>

                <p className={sectionTitle}>Location &amp; pay</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>City *</label>
                    <input name="city" value={form.city} onChange={handleChange} required className={inputClass} placeholder="e.g. Pune" />
                  </div>
                  <div>
                    <label className={labelClass}>State *</label>
                    <input name="state" value={form.state} onChange={handleChange} required className={inputClass} placeholder="e.g. Maharashtra" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Exact Location / Area (optional)</label>
                  <input name="address" value={form.address} onChange={handleChange} className={inputClass} placeholder="e.g. MIDC Phase 2, near Hinjewadi" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Salary Min (₹/month)</label>
                    <input name="salaryMin" type="number" inputMode="numeric" min={0} value={form.salaryMin} onChange={handleChange} className={inputClass} placeholder="15000" />
                  </div>
                  <div>
                    <label className={labelClass}>Salary Max (₹/month)</label>
                    <input name="salaryMax" type="number" inputMode="numeric" min={0} value={form.salaryMax} onChange={handleChange} className={inputClass} placeholder="22000" />
                  </div>
                </div>

                <p className={sectionTitle}>Who you need</p>
                <div>
                  <label className={labelClass}>Qualification Required *</label>
                  <input name="qualificationRequired" value={form.qualificationRequired} onChange={handleChange} required className={inputClass} placeholder="e.g. ITI, 12th Pass, B.Tech" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Min Experience (years)</label>
                    <input name="experienceMinYears" type="number" inputMode="numeric" min={0} value={form.experienceMinYears} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Max Experience (years)</label>
                    <input name="experienceMaxYears" type="number" inputMode="numeric" min={0} value={form.experienceMaxYears} onChange={handleChange} className={inputClass} placeholder="Any" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Job Description *</label>
                  <textarea name="jobDescription" value={form.jobDescription} onChange={handleChange} required rows={5} maxLength={4000} className={`${inputClass} resize-y`} placeholder="Describe the role, daily duties and what a good candidate looks like" />
                  <p className="text-[11px] text-slate-400 mt-1 text-right tabular-nums">{form.jobDescription.length}/4000</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Industry / Sector *</label>
                    <input name="sector" value={form.sector} onChange={handleChange} required list="sector-options" autoComplete="off" className={inputClass} placeholder="Type or pick a sector" />
                    <datalist id="sector-options">
                      {SECTORS.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className={labelClass}>Role / Subsector *</label>
                    <input name="subsector" value={form.subsector} onChange={handleChange} required list="subsector-options" autoComplete="off" className={inputClass} placeholder="Type or pick a role" />
                    <datalist id="subsector-options">
                      {roleOptions.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                </div>

                <SkillTagInput
                  label="Required Skills"
                  value={form.skills}
                  onChange={skills => setForm(prev => ({ ...prev, skills }))}
                  suggestions={form.sector && form.subsector ? skillsForSubsector(form.sector, form.subsector) : allTaxonomySkills()}
                  placeholder="Type a skill, then comma or Enter"
                  hint="Separate skills with a comma or press Enter. Tap a suggestion to add it."
                />

                <p className={sectionTitle}>Perks &amp; timing</p>
                <div>
                  <label className={labelClass}>Benefits</label>
                  <input name="benefits" value={form.benefits} onChange={handleChange} className={inputClass} placeholder="e.g. PF, ESI, annual bonus" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Joining Timeline</label>
                    <input name="joiningTimeline" value={form.joiningTimeline} onChange={handleChange} className={inputClass} placeholder="e.g. Immediate" />
                  </div>
                  <div>
                    <label className={labelClass}>Application Deadline</label>
                    <input
                      name="deadline"
                      type="date"
                      value={form.deadline}
                      onChange={handleChange}
                      min={deadlineDateRange().min}
                      max={deadlineDateRange().max}
                      className={inputClass}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Up to 1.5 months from today.</p>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Working Hours</label>
                  <input name="workingHours" value={form.workingHours} onChange={handleChange} className={inputClass} placeholder="e.g. 9 AM - 6 PM, 6-day week" />
                </div>

                {/* Facilities as tappable cards instead of tiny checkboxes */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {[
                    { name: 'accommodationProvided', label: 'Accommodation', icon: Home, on: form.accommodationProvided },
                    { name: 'transportationProvided', label: 'Transport', icon: Car, on: form.transportationProvided },
                  ].map(({ name, label, icon: Icon, on }) => (
                    <label
                      key={name}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer select-none transition-colors ${on ? 'border-[var(--green)] bg-[var(--green)]/5' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <input type="checkbox" name={name} checked={on} onChange={e => { haptic('select'); handleChange(e); }} className="sr-only peer" />
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${on ? 'bg-[var(--green)] text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {on ? <CheckCircle size={16} /> : <Icon size={16} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-bold text-[var(--navy)]">{label}</span>
                        <span className="block text-[11px] text-[var(--charcoal)]">{on ? 'Provided' : 'Not provided'}</span>
                      </span>
                    </label>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider mb-1">Contact person</p>
                  <p className="text-[11.5px] text-slate-400 mb-3">Applicants see only the name. Email and phone stay with our team.</p>
                  <div className="space-y-3">
                    <input name="recruiterName" value={form.recruiterName} onChange={handleChange} className={inputClass} placeholder="Contact person's name" autoComplete="name" aria-label="Contact person's name" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input name="recruiterEmail" type="email" inputMode="email" autoCapitalize="none" value={form.recruiterEmail} onChange={handleChange} className={inputClass} placeholder="Email" autoComplete="email" aria-label="Contact email" />
                      <input name="recruiterPhone" type="tel" inputMode="tel" value={form.recruiterPhone} onChange={handleChange} className={inputClass} placeholder="Phone" autoComplete="tel" aria-label="Contact phone" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="hidden sm:flex w-full items-center justify-center gap-2 h-[50px] px-4 leading-tight text-base bg-[var(--orange)] text-white font-bold rounded-full hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? 'Submitting…' : 'Submit for Approval'}
                </button>
              </form>

              {/* Phones: the submit button stays within thumb reach while scrolling the form */}
              <div className="sm:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E7E2D9] px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_-12px_rgba(16,26,54,0.18)]">
                <button
                  type="submit"
                  form="post-job-form"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 min-h-[52px] px-4 text-[15px] bg-[var(--orange)] text-white font-bold rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? 'Submitting…' : 'Submit for Approval'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
