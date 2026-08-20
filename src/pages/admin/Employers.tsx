import { useState } from 'react';
import { Search, Eye, Mail, Phone as PhoneIcon, Building2 } from 'lucide-react';
import { Card, Badge, Button, Modal, Select } from '../../components/ui';
import { useData, Employer } from '../../context/DataContext';

export default function Employers() {
  const { employers, jobPostings } = useData();
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [showModal, setShowModal] = useState(false);

  const industries = [...new Set(employers.map(e => e.industry))];

  const filtered = employers.filter(e => {
    const matchSearch = !search ||
      e.companyName.toLowerCase().includes(search.toLowerCase()) ||
      e.contactName.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = !industryFilter || e.industry === industryFilter;
    return matchSearch && matchIndustry;
  });

  const getEmployerJobs = (employerId: string) => jobPostings.filter(j => j.employerId === employerId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--navy)]">Employers</h2>
        <p className="text-sm text-[var(--charcoal)] mt-1">{employers.length} registered companies</p>
      </div>

      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--charcoal)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by company, contact name, or city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none text-sm bg-white text-[var(--navy)] placeholder:text-slate-400"
            />
          </div>
          <Select
            options={[{ value: '', label: 'All Industries' }, ...industries.map(i => ({ value: i, label: i }))]}
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
          />
        </div>
      </Card>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-[var(--bg-warm)]">
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Company</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Industry</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Location</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Jobs</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Contact</th>
                <th className="text-left text-xs font-semibold text-[var(--charcoal)] uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(employer => {
                const jobs = getEmployerJobs(employer.id);
                return (
                  <tr key={employer.id} className="border-b border-slate-100/60 hover:bg-slate-100 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#0D604A]/10 text-[var(--green)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--navy)] truncate">{employer.companyName}</p>
                          <p className="text-xs text-[var(--charcoal)]">{employer.companySize} employees</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Badge variant="default">{employer.industry}</Badge></td>
                    <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden md:table-cell">{employer.city}, {employer.state}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm font-bold text-[var(--orange)] text-[var(--orange)]">{jobs.length}</span>
                      <span className="text-xs text-[var(--charcoal)] ml-1">jobs</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-sm font-medium text-[var(--navy)]">{employer.contactName}</p>
                      <p className="text-xs text-[var(--charcoal)]">{employer.contactEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedEmployer(employer); setShowModal(true); }}>
                        <Eye size={16} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[var(--charcoal)]"><p className="text-sm">No employers found</p></div>
          )}
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Employer Details" size="lg">
        {selectedEmployer && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#0D604A]/10 text-[var(--green)] rounded-xl flex items-center justify-center">
                <Building2 size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--navy)]">{selectedEmployer.companyName}</h3>
                <Badge variant="default" className="mt-1">{selectedEmployer.industry}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-[var(--charcoal)] font-medium">Contact Person</p><p className="text-sm font-semibold text-[var(--navy)]">{selectedEmployer.contactName}</p></div>
              <div><p className="text-xs text-[var(--charcoal)] font-medium">Email</p><p className="text-sm font-semibold text-[var(--navy)]">{selectedEmployer.contactEmail}</p></div>
              <div><p className="text-xs text-[var(--charcoal)] font-medium">Phone</p><p className="text-sm font-semibold text-[var(--navy)]">{selectedEmployer.contactPhone}</p></div>
              <div><p className="text-xs text-[var(--charcoal)] font-medium">Company Size</p><p className="text-sm font-semibold text-[var(--navy)]">{selectedEmployer.companySize} employees</p></div>
              <div><p className="text-xs text-[var(--charcoal)] font-medium">Year Established</p><p className="text-sm font-semibold text-[var(--navy)]">{selectedEmployer.yearEstablished}</p></div>
              <div><p className="text-xs text-[var(--charcoal)] font-medium">Website</p><p className="text-sm font-semibold text-[var(--navy)]">{selectedEmployer.website || 'N/A'}</p></div>
              <div><p className="text-xs text-[var(--charcoal)] font-medium">GST Number</p><p className="text-sm font-semibold text-[var(--navy)]">{selectedEmployer.gstNumber || 'N/A'}</p></div>
              <div><p className="text-xs text-[var(--charcoal)] font-medium">Location</p><p className="text-sm font-semibold text-[var(--navy)]">{selectedEmployer.city}, {selectedEmployer.state}</p></div>
            </div>

            {/* Job Postings */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="font-bold text-[var(--navy)] mb-3">Job Postings ({getEmployerJobs(selectedEmployer.id).length})</h4>
              <div className="space-y-3">
                {getEmployerJobs(selectedEmployer.id).map(job => (
                  <div key={job.id} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[var(--navy)]">{job.jobTitle}</p>
                        <p className="text-xs text-[var(--charcoal)] mt-0.5">{job.numberOfOpenings} openings • {job.employmentType} • {job.city}</p>
                      </div>
                      <Badge variant={job.status === 'Open' ? 'success' : 'default'}>{job.status}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {job.skillsRequired.map(s => <Badge key={s} variant="info" className="text-[10px]">{s}</Badge>)}
                    </div>
                    <p className="text-xs font-semibold text-[var(--green)] mt-1.5">Salary: ₹{parseInt(job.salaryMin).toLocaleString()} - ₹{parseInt(job.salaryMax).toLocaleString()}/month</p>
                  </div>
                ))}
                {getEmployerJobs(selectedEmployer.id).length === 0 && (
                  <p className="text-sm text-[var(--charcoal)]">No job postings yet</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-200">
              <Button size="sm" className="gap-1"><Mail size={14} /> Send Email</Button>
              <Button size="sm" variant="outline" className="gap-1"><PhoneIcon size={14} /> Log Call</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
