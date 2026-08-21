import { useState } from 'react';
import { Users, Building2, Briefcase, Award, MessageSquare, IndianRupee, ArrowUpRight, ArrowDownRight, Clock, MapPin, Zap, BarChart3, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserAdd01Icon, Target02Icon, Chat01Icon, Award01Icon, Briefcase01Icon, Building02Icon, Coins01Icon } from '@hugeicons/core-free-icons';
import { Card, Badge, Button } from '../../components/ui';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { jobSeekers, employers, jobPostings, matches, communications, placements } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('All');

  const totalCandidates = jobSeekers.length;
  const totalJobs = jobPostings.length;
  const activeJobs = jobPostings.filter(j => j.status === 'Open').length;
  const totalMatches = matches.length;
  const totalPlacements = placements.length;
  const totalRevenue = placements.reduce((sum, p) => sum + p.commission, 0);
  const unpaidCommission = placements.filter(p => p.commissionStatus === 'Unpaid' || p.commissionStatus === 'Partial').reduce((sum, p) => sum + p.commission, 0);
  const paidCommission = placements.filter(p => p.commissionStatus === 'Paid').reduce((sum, p) => sum + p.commission, 0);
  const newThisWeek = jobSeekers.filter(j => j.status === 'New').length;

  const filterByDate = (dateStr: string) => {
    if (dateFilter === 'All') return true;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    if (dateFilter === 'Last 7 days') return diffDays <= 7;
    if (dateFilter === 'Last 30 days') return diffDays <= 30;
    return true;
  };

  const filterBySearch = (item: Record<string, any>) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return Object.values(item).some(val => String(val).toLowerCase().includes(q));
  };

  const recentCandidates = [...jobSeekers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).filter(c => filterByDate(c.createdAt) && filterBySearch(c)).slice(0, 6);
  const recentJobs = [...jobPostings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).filter(j => filterByDate(j.createdAt) && filterBySearch(j)).slice(0, 4);
  const recentMatches = [...matches].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).filter(m => filterByDate(m.createdAt) && filterBySearch(m)).slice(0, 5);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const monthlyData = [
    { month: 'Sep', candidates: 45, placements: 8, revenue: 24000 },
    { month: 'Oct', candidates: 62, placements: 12, revenue: 36000 },
    { month: 'Nov', candidates: 78, placements: 15, revenue: 45000 },
    { month: 'Dec', candidates: 95, placements: 18, revenue: 54000 },
    { month: 'Jan', candidates: 120, placements: 22, revenue: 66000 },
    { month: 'Feb', candidates: 110, placements: 25, revenue: 75000 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-[var(--charcoal)]">{today}</p>
          <h2 className="dash-header__title !text-[26px] mt-0.5">Good evening, Admin</h2>
          <p className="text-[14px] text-[var(--charcoal)] mt-1.5 max-w-lg">
            <span className="font-bold text-[var(--navy)]">{newThisWeek} new candidates</span> and{' '}
            <span className="font-bold text-[var(--navy)]">{matches.filter(m => m.status === 'Pending').length} pending matches</span> need review today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/matching">
            <button className="dash-btn dash-btn-primary dash-btn--compact"><Zap size={14} /> Review Matches</button>
          </Link>
          <Link to="/admin/candidates">
            <button className="dash-btn dash-btn-secondary dash-btn--compact"><Users size={14} /> View Candidates</button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="dash-surface dash-surface--pad">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search candidates, jobs, matches..."
              className="w-full pl-4 pr-4 h-10 rounded-lg border border-[#D8D2C6] bg-[var(--white)] text-[var(--navy)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/25 focus:border-[var(--orange)]"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[#D8D2C6] bg-[var(--white)] text-[var(--navy)] text-xs font-bold"
            >
              <option value="All">All Dates</option>
              <option value="Last 7 days">Last 7 Days</option>
              <option value="Last 30 days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics strip */}
      <div className="dash-metrics">
        <div className="dash-metric">
          <div className="dash-metric__value dash-metric__value--accent">{totalCandidates}</div>
          <div className="dash-metric__label">Candidates</div>
          <div className="dash-metric__trend">↑ 12%</div>
        </div>
        <div className="dash-metric">
          <div className="dash-metric__value">{activeJobs}</div>
          <div className="dash-metric__label">Active Jobs</div>
          <div className="dash-metric__trend">{totalJobs} total</div>
        </div>
        <div className="dash-metric">
          <div className="dash-metric__value">{totalPlacements}</div>
          <div className="dash-metric__label">Placements</div>
          <div className="dash-metric__trend">+3 this week</div>
        </div>
        <div className="dash-metric">
          <div className="dash-metric__value">₹{totalRevenue.toLocaleString()}</div>
          <div className="dash-metric__label">Total Revenue</div>
          <div className="dash-metric__trend">₹{unpaidCommission.toLocaleString()} pending</div>
        </div>
        <div className="dash-metric">
          <div className="dash-metric__value">{employers.length}</div>
          <div className="dash-metric__label">Employers</div>
        </div>
        <div className="dash-metric">
          <div className="dash-metric__value">{totalMatches}</div>
          <div className="dash-metric__label">Total Matches</div>
        </div>
        <div className="dash-metric">
          <div className="dash-metric__value">{communications.length}</div>
          <div className="dash-metric__label">Communications</div>
        </div>
        <div className="dash-metric">
          <div className="dash-metric__value">{totalCandidates > 0 ? Math.round((totalPlacements / totalCandidates) * 100) : 0}%</div>
          <div className="dash-metric__label">Conversion Rate</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Trend - 2 cols */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--navy)]">Growth Trend</h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[var(--charcoal)]"><span className="w-2.5 h-2.5 rounded-full bg-[#F15A24]" /> Candidates</span>
              <span className="flex items-center gap-1.5 text-[var(--charcoal)]"><span className="w-2.5 h-2.5 rounded-full bg-[#0D604A]" /> Placements</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F15A24" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F15A24" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D604A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0D604A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} stroke="#CBD5E1" />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} stroke="#CBD5E1" />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: '10px', fontSize: '13px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="candidates" stroke="#F15A24" strokeWidth={2.5} fill="url(#colorCandidates)" name="Candidates" />
              <Area type="monotone" dataKey="placements" stroke="#0D604A" strokeWidth={2.5} fill="url(#colorPlacements)" name="Placements" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Candidates by Status - 1 col */}
        <Card>
          <h3 className="font-bold text-[var(--navy)] mb-4">Candidate Pipeline</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={candidatesByStatus} cx="50%" cy="50%" outerRadius={70} innerRadius={45} dataKey="value" strokeWidth={0}>
                {candidatesByStatus.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: '10px', fontSize: '13px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {candidatesByStatus.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                   <span className="text-[var(--charcoal)] font-medium">{d.name}</span>
                </div>
                 <span className="font-bold text-[var(--navy)]">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Candidates & Recent Matches */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Candidates */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--navy)]">Recent Candidates</h3>
            <Link to="/admin/candidates" className="text-xs text-[var(--orange)] font-semibold hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentCandidates.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                <div className="w-10 h-10 bg-gradient-to-br from-[#F15A24]/10 to-[#F15A24]/5 text-[var(--orange)] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {c.firstName[0]}{c.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--navy)] truncate">{c.firstName} {c.lastName}</p>
                  <p className="text-xs text-[var(--charcoal)] flex items-center gap-1 mt-0.5"><MapPin size={10} />{c.location}, {c.state} • {c.qualification}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge variant={c.status === 'New' ? 'info' : c.status === 'Placed' ? 'success' : c.status === 'Contacted' ? 'warning' : 'default'} className="text-[10px]">{c.status}</Badge>
                  <p className="text-[10px] text-[var(--charcoal)] mt-0.5 font-medium">{c.totalExperience} yrs exp</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Matches */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--navy)]">Recent Matches</h3>
            <Link to="/admin/matching" className="text-xs text-[var(--orange)] font-semibold hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentMatches.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 text-white shadow-sm ${
                   m.matchScore >= 80 ? 'bg-[#0D604A]' : m.matchScore >= 60 ? 'bg-[#F15A24]' : 'bg-red-600'
                 }`}>
                  {m.matchScore}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--navy)] truncate">{m.candidateName}</p>
                  <p className="text-xs text-[var(--charcoal)] truncate mt-0.5">→ {m.jobTitle} at {m.companyName}</p>
                </div>
                <Badge variant={m.status === 'Offered' ? 'success' : m.status === 'Pending' ? 'warning' : 'info'} className="text-[10px]">
                  {m.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Jobs by Industry & Revenue */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Jobs by Industry */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--navy)]">Jobs by Industry</h3>
            <Link to="/admin/employers" className="text-xs text-[var(--orange)] font-semibold hover:underline">View Employers →</Link>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={jobsByIndustry} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} stroke="#CBD5E1" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: '10px', fontSize: '13px' }} />
              <Bar dataKey="count" fill="#0D604A" radius={[6, 6, 0, 0]} name="Open Jobs" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Commission Overview */}
        <div className="dash-surface dash-surface--pad">
          <div className="dash-section-title mb-4">Commission Overview</div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-semibold text-[var(--charcoal)]">Paid</span>
              <span className="text-lg font-extrabold text-[var(--green)]">₹{paidCommission.toLocaleString()}</span>
            </div>
            <div className="dash-progress mt-1.5">
              <div className="h-full rounded-full bg-[var(--green)]" style={{ width: `${totalRevenue > 0 ? (paidCommission / totalRevenue) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#EFEAE1]">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-semibold text-[var(--charcoal)]">Unpaid / Partial</span>
              <span className="text-lg font-extrabold text-[var(--orange)]">₹{unpaidCommission.toLocaleString()}</span>
            </div>
            <div className="dash-progress mt-1.5">
              <div className="dash-progress__fill" style={{ width: `${totalRevenue > 0 ? (unpaidCommission / totalRevenue) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#EFEAE1] flex items-baseline justify-between">
            <div>
              <span className="text-[13px] font-semibold text-[var(--charcoal)] block">Total Revenue</span>
              <span className="text-[11px] text-[var(--charcoal)]">{placements.length} placements</span>
            </div>
            <span className="text-lg font-extrabold text-[var(--navy)]">₹{totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Recent Job Postings */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[var(--navy)]">Recent Job Postings</h3>
          <Link to="/admin/employers" className="text-xs text-[var(--orange)] font-semibold hover:underline">View All →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentJobs.map(job => (
            <div key={job.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all hover:-translate-y-0.5 bg-white">
              <div className="flex items-start justify-between mb-2">
                <Badge variant={job.status === 'Open' ? 'success' : 'default'} className="text-[10px]">{job.status}</Badge>
                <span className="text-[10px] text-[var(--charcoal)] font-medium">{job.numberOfOpenings} openings</span>
              </div>
              <h4 className="font-bold text-[var(--navy)] text-sm line-clamp-1">{job.jobTitle}</h4>
              <p className="text-xs text-[var(--charcoal)] mt-0.5 truncate">{job.companyName}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-[var(--charcoal)]">
                <MapPin size={12} />{job.city}, {job.state}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--green)]">₹{parseInt(job.salaryMin).toLocaleString()} - ₹{parseInt(job.salaryMax).toLocaleString()}</span>
                <span className="text-[10px] text-[var(--charcoal)] font-medium">{job.employmentType}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {job.skillsRequired.slice(0, 3).map(s => (
                  <Badge key={s} variant="info" className="text-[9px]">{s}</Badge>
                ))}
                {job.skillsRequired.length > 3 && <Badge className="text-[9px]">+{job.skillsRequired.length - 3}</Badge>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Activity Timeline */}
      <div className="dash-surface dash-surface--pad">
        <div className="dash-section-title mb-1">Recent Activity</div>
        <div className="divide-y divide-[#EFEAE1]">
          {[
            { icon: UserAdd01Icon, text: 'New candidate registered: Kamla Sharma (MBA, HR)', time: '2 hours ago' },
            { icon: Target02Icon, text: 'Match created: Asha Bhosle → Staff Nurse at Metro Hospital (92%)', time: '4 hours ago' },
            { icon: Chat01Icon, text: 'Communication logged: Call with Dr. Revathi Subramaniam', time: '6 hours ago' },
            { icon: Award01Icon, text: 'Placement confirmed: Sanjay Gupta → Welder at Northern Steel Works', time: '1 day ago' },
            { icon: Briefcase01Icon, text: 'New job posted: ANM/GMN Nurse at CareWell Hospitals (10 openings)', time: '1 day ago' },
            { icon: Building02Icon, text: 'New employer registered: CareWell Hospitals, Chennai', time: '2 days ago' },
            { icon: Coins01Icon, text: 'Commission received: ₹4,000 from TechRural Solutions (Sunita Devi)', time: '3 days ago' },
          ].map((activity, i) => (
            <div key={i} className="flex items-start gap-3 py-2.5">
              <HugeiconsIcon icon={activity.icon} size={16} className="text-[var(--charcoal)] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--charcoal)] leading-snug">{activity.text}</p>
                <p className="text-[11px] text-[var(--charcoal)] mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
