import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminDeleteAccount } from '../../lib/supabase/data';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Search, Eye, Building2, Download, X, BadgeCheck } from 'lucide-react';
import { Card, Badge, Button, Select } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { exportToCsv } from '../../lib/csvExport';

export default function Employers() {
  const { employers, jobs: jobPostings, refresh } = useDatabase();
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  const industries = [...new Set(employers.map((e: any) => e.industry).filter(Boolean))] as string[];

  const filtered = employers.filter((e: any) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      [e.company_name, e.contact_name, e.city, e.state, e.contact_email, e.contact_phone]
        .some((v: string | null) => (v || '').toLowerCase().includes(q));
    const matchIndustry = !industryFilter || e.industry === industryFilter;
    return matchSearch && matchIndustry;
  });

  const getEmployerJobs = (employerId: string) => jobPostings.filter((j: any) => j.employer_id === employerId);

  const handleExportCsv = () => {
    exportToCsv('employers', filtered.map((e: any) => ({
      'Company Name': e.company_name || '',
      Industry: e.industry || '',
      'Company Size': e.company_size || '',
      'Year Established': e.year_established || '',
      Website: e.website || '',
      Address: e.address || '',
      City: e.city || '',
      State: e.state || '',
      'Contact Name': e.contact_name || '',
      'Contact Email': e.contact_email || '',
      'Contact Phone': e.contact_phone || '',
      'GST Number': e.gst_number || '',
      Verified: e.verified,
      'Referral Code': e.referral_code || '',
      'Job Postings Count': getEmployerJobs(e.id).length,
      'Date Joined': e.created_at ? e.created_at.split('T')[0] : '',
      'Employer ID': e.id,
    })));
  };

  const paging = usePagination(filtered, 10);

  return (
    <div className="space-y-6">
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this company?"
        description="This permanently deletes the company's sign-in, profile and all of its job postings, applications and CV requests. It cannot be undone. Companies with placement records cannot be deleted."
        confirmLabel="Delete company"
        onConfirm={async () => { await adminDeleteAccount(deleteTarget.id); await refresh({ silent: true }); }}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="admin-page-title text-2xl font-bold text-[var(--navy)]">Employers</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1" aria-live="polite">
            {filtered.length === employers.length
              ? <><span className="font-bold text-[var(--navy)] tabular-nums">{employers.length}</span> registered {employers.length === 1 ? 'company' : 'companies'}</>
              : <>Showing <span className="font-bold text-[var(--navy)] tabular-nums">{filtered.length}</span> of <span className="tabular-nums">{employers.length}</span> companies</>}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={filtered.length === 0} className="gap-1.5 flex-shrink-0 self-start sm:self-auto">
          <Download size={15} /> Download CSV
        </Button>
      </div>

      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--charcoal)]" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search company, contact, city, email or phone"
              aria-label="Search employers"
              className="w-full h-11 [&::-webkit-search-cancel-button]:hidden pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none text-sm bg-white text-[var(--navy)] placeholder:text-slate-400"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-[var(--navy)]">
                <X size={15} />
              </button>
            )}
          </div>
          <Select
            fullWidth={false}
            aria-label="Filter by industry"
            className="h-11 w-full sm:w-auto sm:min-w-[180px]"
            options={[{ value: '', label: 'All Industries' }, ...industries.map(i => ({ value: i, label: i }))]}
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
          />
        </div>
      </Card>

      <Card padding={false}>
        <div className="admin-table overflow-x-auto">
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
              {paging.pageItems.map((employer: any) => {
                const jobs = getEmployerJobs(employer.id);
                return (
                  <tr key={employer.id} className="border-b border-slate-100/60 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/employer/${employer.id}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#0D604A]/10 text-[var(--green)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--navy)] hover:underline flex items-center gap-1 min-w-0">
                            <span className="truncate">{employer.company_name || 'Unnamed company'}</span>
                            {employer.verified && <BadgeCheck size={14} className="text-[var(--green)] flex-shrink-0" aria-label="Verified" />}
                          </p>
                          <p className="text-xs text-[var(--charcoal)] truncate">
                            {employer.company_size ? `${String(employer.company_size).replace(/\s*employees$/i, '')} employees` : 'Size not set'}
                            <span className="sm:hidden">{employer.city ? ` · ${employer.city}` : ''}</span>
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Badge variant="default">{employer.industry || 'N/A'}</Badge></td>
                    <td className="px-4 py-3 text-sm text-[var(--charcoal)] hidden md:table-cell">{[employer.city, employer.state].filter(Boolean).join(', ') || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm font-bold text-[var(--orange)] tabular-nums">{jobs.length}</span>
                      <span className="text-xs text-[var(--charcoal)] ml-1">{jobs.length === 1 ? 'job' : 'jobs'}</span>
                      {jobs.some((j: any) => j.status === 'Open') && (
                        <span className="block text-[11px] text-[var(--green)] font-semibold">{jobs.filter((j: any) => j.status === 'Open').length} live</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-sm font-medium text-[var(--navy)]">{employer.contact_name || '—'}</p>
                      {employer.contact_email && <a href={`mailto:${employer.contact_email}`} className="text-xs text-[var(--charcoal)] hover:text-[var(--orange)] break-all">{employer.contact_email}</a>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/employer/${employer.id}`}
                          aria-label={`Open ${employer.company_name || 'company'}`}
                          title="Open company"
                          className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-[var(--charcoal)] hover:bg-slate-100 hover:text-[var(--navy)] transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(employer)} title="Delete company" aria-label={`Delete ${employer.company_name || 'company'}`} className="text-red-600 hover:text-red-700">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
                {paging.total === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon={<Inbox size={20} />}
                      title={employers.length === 0 ? 'No companies yet' : 'No companies match'}
                      body={employers.length === 0 ? 'Companies appear here as soon as they register.' : 'Try a different search or industry.'}
                      action={search || industryFilter ? <Button variant="outline" size="sm" onClick={() => { setSearch(''); setIndustryFilter(''); }}>Clear filters</Button> : undefined}
                    />
                  </div>
                ) : (
                  <Pagination page={paging.page} pageSize={paging.pageSize} total={paging.total} onPageChange={paging.setPage} label="employers" />
                )}
        </div>
      </Card>
    </div>
  );
}
