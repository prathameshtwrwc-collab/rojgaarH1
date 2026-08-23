import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Building2 } from 'lucide-react';
import { Card, Badge, Button, Select } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';

export default function Employers() {
  const { employers, jobs: jobPostings } = useDatabase();
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  const industries = [...new Set(employers.map((e: any) => e.industry).filter(Boolean))] as string[];

  const filtered = employers.filter((e: any) => {
    const matchSearch = !search ||
      (e.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.contact_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.city || '').toLowerCase().includes(search.toLowerCase());
    const matchIndustry = !industryFilter || e.industry === industryFilter;
    return matchSearch && matchIndustry;
  });

  const getEmployerJobs = (employerId: string) => jobPostings.filter((j: any) => j.employer_id === employerId);

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
              {filtered.map((employer: any) => {
                const jobs = getEmployerJobs(employer.id);
                return (
                  <tr key={employer.id} className="border-b border-slate-100/60 hover:bg-slate-100 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/employer/${employer.id}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#0D604A]/10 text-[var(--green)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--navy)] truncate hover:underline">{employer.company_name}</p>
                          <p className="text-xs text-[var(--charcoal)]">{employer.company_size || 'N/A'} employees</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Badge variant="default">{employer.industry || 'N/A'}</Badge></td>
                    <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden md:table-cell">{employer.city}, {employer.state}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm font-bold text-[var(--orange)]">{jobs.length}</span>
                      <span className="text-xs text-[var(--charcoal)] ml-1">jobs</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-sm font-medium text-[var(--navy)]">{employer.contact_name}</p>
                      <p className="text-xs text-[var(--charcoal)]">{employer.contact_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/employer/${employer.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye size={16} />
                        </Button>
                      </Link>
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
    </div>
  );
}
