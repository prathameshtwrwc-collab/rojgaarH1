import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';
import { createJobPosting, setJobSkills } from '../../lib/supabase/data';

export default function PostJob() {
  const { employer, refresh } = useDatabase();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    jobTitle: '',
    numberOfOpenings: '1',
    city: '',
    state: '',
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
    skills: '',
    deadline: '',
    recruiterName: employer?.contact_name || '',
    recruiterEmail: employer?.contact_email || '',
    recruiterPhone: employer?.contact_phone || '',
  });

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
    if (!form.jobTitle || !form.jobDescription || !form.city || !form.state || !form.qualificationRequired) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const job = await createJobPosting({
        employer_id: employer.id,
        job_title: form.jobTitle,
        number_of_openings: parseInt(form.numberOfOpenings) || 1,
        city: form.city,
        state: form.state,
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

      const skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skills.length > 0) await setJobSkills((job as any).id, skills);

      await refresh();
      navigate('/dashboard/employer', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job posting');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent";
  const labelClass = "block text-sm font-semibold text-[var(--navy)] mb-1.5";

  return (
    <div className="min-h-screen bg-[var(--bg-warm)] px-4 py-10" style={{ fontFamily: 'var(--font)' }}>
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard/employer" className="inline-flex items-center gap-2 text-sm text-[var(--charcoal)] hover:text-[var(--navy)] mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[var(--orange)]/10 text-[var(--orange)] rounded-xl flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[var(--navy)]">Post a New Job</h1>
              <p className="text-xs text-[var(--charcoal)]">Submitted jobs go live after admin approval.</p>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Job Title *</label>
              <input name="jobTitle" value={form.jobTitle} onChange={handleChange} required className={inputClass} placeholder="e.g. CNC Machine Operator" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Number of Openings</label>
                <input name="numberOfOpenings" type="number" min={1} value={form.numberOfOpenings} onChange={handleChange} className={inputClass} />
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>City *</label>
                <input name="city" value={form.city} onChange={handleChange} required className={inputClass} placeholder="e.g. Pune" />
              </div>
              <div>
                <label className={labelClass}>State *</label>
                <input name="state" value={form.state} onChange={handleChange} required className={inputClass} placeholder="e.g. Maharashtra" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Salary Min (₹/month)</label>
                <input name="salaryMin" type="number" value={form.salaryMin} onChange={handleChange} className={inputClass} placeholder="15000" />
              </div>
              <div>
                <label className={labelClass}>Salary Max (₹/month)</label>
                <input name="salaryMax" type="number" value={form.salaryMax} onChange={handleChange} className={inputClass} placeholder="22000" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Qualification Required *</label>
              <input name="qualificationRequired" value={form.qualificationRequired} onChange={handleChange} required className={inputClass} placeholder="e.g. ITI, 12th Pass, B.Tech" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Min Experience (years)</label>
                <input name="experienceMinYears" type="number" min={0} value={form.experienceMinYears} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Max Experience (years)</label>
                <input name="experienceMaxYears" type="number" min={0} value={form.experienceMaxYears} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Job Description *</label>
              <textarea name="jobDescription" value={form.jobDescription} onChange={handleChange} required rows={4} className={inputClass} placeholder="Describe the role, duties, and expectations..." />
            </div>

            <div>
              <label className={labelClass}>Required Skills (comma-separated)</label>
              <input name="skills" value={form.skills} onChange={handleChange} className={inputClass} placeholder="e.g. Welding, Tally, MS Excel" />
            </div>

            <div>
              <label className={labelClass}>Benefits</label>
              <input name="benefits" value={form.benefits} onChange={handleChange} className={inputClass} placeholder="e.g. PF, ESI, annual bonus" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Joining Timeline</label>
                <input name="joiningTimeline" value={form.joiningTimeline} onChange={handleChange} className={inputClass} placeholder="e.g. Immediate" />
              </div>
              <div>
                <label className={labelClass}>Application Deadline</label>
                <input name="deadline" type="date" value={form.deadline} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Working Hours</label>
              <input name="workingHours" value={form.workingHours} onChange={handleChange} className={inputClass} placeholder="e.g. 9 AM - 6 PM, 6-day week" />
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--navy)]">
                <input type="checkbox" name="accommodationProvided" checked={form.accommodationProvided} onChange={handleChange} className="w-4 h-4" />
                Accommodation Provided
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--navy)]">
                <input type="checkbox" name="transportationProvided" checked={form.transportationProvided} onChange={handleChange} className="w-4 h-4" />
                Transportation Provided
              </label>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider mb-3">Recruiter Contact (shown to applicants)</p>
              <div className="space-y-3">
                <input name="recruiterName" value={form.recruiterName} onChange={handleChange} className={inputClass} placeholder="Recruiter name" />
                <input name="recruiterEmail" type="email" value={form.recruiterEmail} onChange={handleChange} className={inputClass} placeholder="Recruiter email" />
                <input name="recruiterPhone" value={form.recruiterPhone} onChange={handleChange} className={inputClass} placeholder="Recruiter phone" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] bg-[var(--orange)] text-white font-bold rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting Job...' : 'Submit Job for Approval'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
