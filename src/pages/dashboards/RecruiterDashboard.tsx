import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserSearch, LogOut, Link2, Copy, Share2, UserPlus2, Clock, Users, CheckCircle2, TrendingUp, Home, Search, Check, X } from 'lucide-react';
import { Badge, Button, Input, Modal, Toast } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { createCandidateAccountByRecruiter } from '../../lib/supabase/data';
import { DashboardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { MobileBottomNav, type BottomNavItem } from '../../components/MobileBottomNav';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { timeGreeting } from '../../lib/greeting';
import { haptic } from '../../lib/haptics';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function statusVariant(status: string): 'success' | 'warning' | 'info' | 'default' {
  if (status === 'Placed') return 'success';
  if (status === 'New') return 'warning';
  if (status === 'Contacted' || status === 'Interviewing') return 'info';
  return 'default';
}

export function RecruiterDashboard() {
  const { t } = useAppTranslation();
  const { recruiter, candidates, loading, refresh, profile } = useDatabase();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', email: '' });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [adding, setAdding] = useState(false);
  const [newCreds, setNewCreds] = useState<{ email: string; password: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [networkQuery, setNetworkQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const activeSection = useScrollSpy(['recruiter-network']);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = candidates.filter((c: any) => {
      if (!c.created_at) return false;
      const d = new Date(c.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return {
      total: candidates.length,
      placed: candidates.filter((c: any) => c.status === 'Placed').length,
      thisMonth,
      pending: candidates.filter((c: any) => c.status === 'New').length,
    };
  }, [candidates]);

  const visibleNetwork = useMemo(() => {
    const q = networkQuery.trim().toLowerCase();
    const sorted = [...candidates].sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    if (!q) return sorted;
    return sorted.filter((c: any) => (c.profile_name || '').toLowerCase().includes(q) || (c.profile_phone || '').includes(q));
  }, [candidates, networkQuery]);

  const referralLink = recruiter ? `${window.location.origin}/register/job-seeker?recruiter=${recruiter.referral_code}` : '';

  const copyText = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      haptic('success');
      setCopied(what);
      window.setTimeout(() => setCopied(c => (c === what ? null : c)), 1800);
    } catch {
      setToastMessage('Could not copy automatically. Press and hold the text to copy it.');
    }
  };

  const shareLink = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try { await navigator.share({ title: t('app.name'), text: 'Register as a job seeker using my referral link:', url: referralLink }); } catch { /* cancelled */ }
      return;
    }
    await copyText(referralLink, 'link');
    setToastMessage('Sharing is not available here, so the link was copied instead.');
  };

  const openAddModal = () => {
    setForm({ fullName: '', phone: '', email: '' });
    setFormErrors({});
    setNewCreds(null);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (adding) return;
    setShowAddModal(false);
    // Clear the one-time password only after the sheet has slid away
    window.setTimeout(() => setNewCreds(null), 300);
  };

  const handleAddCandidate = async () => {
    if (!recruiter) return;
    const errors: typeof formErrors = {};
    if (form.fullName.trim().length < 2) errors.fullName = 'Enter the candidate’s full name.';
    if (form.phone.replace(/\D/g, '').length !== 10) errors.phone = 'Enter a 10-digit mobile number.';
    if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address.';
    setFormErrors(errors);
    if (Object.keys(errors).length) {
      haptic('warn');
      return;
    }
    setAdding(true);
    try {
      const clean = { fullName: form.fullName.trim(), phone: form.phone.replace(/\D/g, ''), email: form.email.trim().toLowerCase() };
      const { password } = await createCandidateAccountByRecruiter(recruiter.id, clean);
      haptic('success');
      setNewCreds({ email: clean.email, password });
      setForm({ fullName: '', phone: '', email: '' });
      await refresh({ silent: true });
    } catch (err) {
      const message = (err as { message?: string } | null)?.message;
      setToastMessage(message ? `Could not create the account: ${message}` : 'Could not create the account. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) return <DashboardSkeleton />;

  if (!recruiter) {
    return (
      <div className="min-h-[calc(100vh-76px)] flex items-center justify-center bg-[var(--bg-warm)] px-4">
        <div className="dash-surface dash-surface--pad text-center max-w-sm w-full">
          <p className="font-bold text-[var(--navy)]">No recruiter profile found</p>
          <p className="text-sm text-[var(--charcoal)] mt-1">Sign in with your recruiter account, or contact support if this keeps happening.</p>
          <Button className="mt-4" onClick={handleLogout}>Sign in again</Button>
        </div>
      </div>
    );
  }

  const fullName = recruiter.full_name || profile?.full_name || 'Recruiter';
  const firstName = fullName.split(/\s+/)[0];
  const placementRate = stats.total > 0 ? Math.round((stats.placed / stats.total) * 100) : 0;

  const tabItems: BottomNavItem[] = [
    { key: 'home', label: 'Home', icon: <Home size={22} />, onSelect: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { key: 'recruiter-network', label: 'Network', icon: <Users size={22} />, badge: stats.pending, onSelect: () => document.getElementById('recruiter-network')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
    { key: 'add', label: 'Add', icon: <UserPlus2 size={23} />, accent: true, onSelect: () => (recruiter.is_approved ? openAddModal() : setToastMessage('You can add candidates once your account is approved.')) },
    { key: 'share', label: 'Share link', icon: <Share2 size={21} />, onSelect: () => (recruiter.is_approved ? shareLink() : setToastMessage('Your referral link unlocks once your account is approved.')) },
    { key: 'jobs', label: 'Jobs', icon: <Search size={22} />, onSelect: () => navigate('/jobs') },
  ];

  return (
    <div className="dash-shell has-bottom-nav text-[var(--navy)] pb-16" style={{ fontFamily: 'var(--font)' }}>
      <header className="sticky top-0 z-40 bg-[var(--white)]/95 backdrop-blur-md border-b border-[#E7E2D9]">
        <div className="dash-container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-[#7655D9] rounded-lg flex items-center justify-center text-white flex-shrink-0">
              <UserSearch size={16} />
            </div>
            <span className="dash-brand-name font-extrabold text-[15px] text-[var(--navy)] tracking-tight hidden sm:inline">{t('app.name')}</span>
            <span className="dash-status dash-status--neutral ml-1 dash-hide-xs">{t('dashboard.recruiterWorkspace')}</span>
          </Link>
          <div className="flex items-center gap-3 dash-header-right">
            <div className="dash-avatar" style={{ background: '#7655D9' }} aria-hidden="true">{fullName.charAt(0).toUpperCase()}</div>
            <button onClick={handleLogout} className="text-[var(--charcoal)] hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100" title="Log Out" aria-label="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="dash-container space-y-9">
        <div className="dash-header">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[var(--charcoal)] mb-1">{timeGreeting()}, {firstName}</p>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="dash-header__title">Your recruiter network</h1>
              {recruiter.is_approved ? (
                <span className="dash-status dash-status--success"><CheckCircle2 size={11} /> Approved</span>
              ) : (
                <span className="dash-status dash-status--warning"><Clock size={11} /> Approval pending</span>
              )}
            </div>
            <p className="dash-header__subtitle">Refer job seekers, onboard them in person and follow their progress.</p>
          </div>
          {recruiter.is_approved && (
            <div className="dash-desktop-only flex items-center gap-2">
              <button onClick={shareLink} className="dash-btn dash-btn-secondary dash-btn--compact"><Share2 size={15} /> Share link</button>
              <button onClick={openAddModal} className="dash-btn dash-btn-primary"><UserPlus2 size={15} /> Add candidate</button>
            </div>
          )}
        </div>

        {!recruiter.is_approved ? (
          <div className="dash-surface dash-surface--pad text-center py-12">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-bold text-[var(--navy)]">Your account is awaiting approval</h3>
            <p className="text-sm text-[var(--charcoal)] mt-1.5 max-w-md mx-auto">
              Our team reviews every new recruiter account before activating it. Once approved, your referral link,
              candidate onboarding and network stats unlock here automatically. Nothing else is needed from you.
            </p>
            <ol className="mt-6 max-w-xs mx-auto text-left space-y-2.5 text-[13px]">
              {[
                { label: 'Account created', done: true },
                { label: 'Team review', done: false, current: true },
                { label: 'Referral link unlocked', done: false },
              ].map(step => (
                <li key={step.label} className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-[var(--green)] text-white' : step.current ? 'border-2 border-amber-500 text-amber-600' : 'border border-[#E7E2D9] text-slate-300'}`}>
                    {step.done ? <Check size={13} /> : step.current ? <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> : null}
                  </span>
                  <span className={step.done || step.current ? 'font-bold text-[var(--navy)]' : 'text-slate-400'}>{step.label}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <>
            {/* ═══ METRICS STRIP ═══ */}
            <div className="dash-metrics">
              <div className="dash-metric">
                <div className="dash-metric__value dash-metric__value--accent">{stats.total}</div>
                <div className="dash-metric__label">Candidates referred</div>
              </div>
              <div className="dash-metric">
                <div className="dash-metric__value">{stats.placed}</div>
                <div className="dash-metric__label">Placed</div>
              </div>
              <div className="dash-metric">
                <div className="dash-metric__value">{stats.thisMonth}</div>
                <div className="dash-metric__label">Added this month</div>
              </div>
              <div className="dash-metric">
                <div className="dash-metric__value">{stats.pending}</div>
                <div className="dash-metric__label">Awaiting first contact</div>
              </div>
            </div>

            {/* ═══ UNIQUE LINK ═══ */}
            <div className="dash-surface dash-surface--pad relative overflow-hidden">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7655D9] via-[#a48cf0] to-[var(--orange)]" />
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#7655D9]/10 text-[#7655D9] flex items-center justify-center flex-shrink-0">
                  <Link2 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[var(--navy)] text-[14px]">Your referral link</p>
                  <p className="text-xs text-[var(--charcoal)]">Anyone who signs up through it joins your network automatically.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => copyText(referralLink, 'link')}
                  className="flex-1 min-w-0 text-left px-3.5 py-2.5 bg-[var(--bg-warm)] border border-[#E7E2D9] rounded-xl text-xs sm:text-sm font-mono text-[var(--navy)] truncate hover:border-[#7655D9]/40 transition-colors"
                  title="Copy link"
                >
                  {referralLink}
                </button>
                <div className="grid grid-cols-2 sm:flex gap-2 flex-shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => copyText(referralLink, 'link')} className="gap-1">
                    {copied === 'link' ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareLink} className="gap-1">
                    <Share2 size={14} /> Share
                  </Button>
                </div>
              </div>
            </div>

            <div className="dash-surface dash-surface--pad flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-[var(--navy)] text-[14px]">Onboard a candidate in person</p>
                <p className="text-xs text-[var(--charcoal)]">For job seekers without internet access or a smartphone: create their account for them.</p>
              </div>
              <Button onClick={openAddModal} className="gap-1.5 flex-shrink-0"><UserPlus2 size={16} /> Add Candidate</Button>
            </div>

            {/* ═══ NETWORK ═══ */}
            <div id="recruiter-network" className="dash-surface dash-surface--pad scroll-mt-20">
              <div className="ap-section-head !items-center">
                <div className="dash-section-title flex items-center gap-2">
                  <Users size={16} className="text-[#7655D9]" /> Candidates in your network
                  <span className="text-slate-400 font-bold tabular-nums">{candidates.length}</span>
                </div>
              </div>

              {candidates.length > 6 && (
                <div className="relative mb-2">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="search"
                    value={networkQuery}
                    onChange={e => setNetworkQuery(e.target.value)}
                    placeholder="Search by name or phone"
                    aria-label="Search your network"
                    className="w-full pl-9 pr-9 h-11 rounded-xl border border-[#D8D2C6] bg-white text-sm text-[var(--navy)] focus:outline-none focus:ring-2 focus:ring-[#7655D9]/25 focus:border-[#7655D9] [&::-webkit-search-cancel-button]:hidden"
                  />
                  {networkQuery && (
                    <button type="button" onClick={() => setNetworkQuery('')} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}

              {candidates.length === 0 ? (
                <EmptyState
                  icon={<Users size={20} />}
                  title="No one in your network yet"
                  body="Share your referral link, or add a candidate in person. Everyone you bring in shows up here."
                  action={<Button size="sm" onClick={shareLink}><Share2 size={14} /> Share link</Button>}
                />
              ) : visibleNetwork.length === 0 ? (
                <p className="text-sm text-[var(--charcoal)] text-center py-6">No one matches “{networkQuery.trim()}”.</p>
              ) : (
                <ul className="divide-y divide-[#EFEAE1]">
                  {visibleNetwork.map((c: any) => {
                    const name = c.profile_name || 'Unnamed candidate';
                    return (
                      <li key={c.id} className="flex items-center gap-3 py-3">
                        <span className="dash-avatar w-9 h-9 !rounded-full text-[12px]" style={{ background: '#7655D9' }} aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[13.5px] text-[var(--navy)] truncate">{name}</p>
                          <p className="text-[11.5px] text-[var(--charcoal)] truncate">
                            {[c.profile_phone, c.created_at && `Joined ${new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <Badge variant={statusVariant(c.status)} className="text-[10.5px] flex-shrink-0">{c.status || 'New'}</Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* ═══ INSIGHTS ═══ */}
            <div className="dash-surface dash-surface--pad">
              <div className="dash-section-title mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-[#7655D9]" /> Placement rate</div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-[var(--charcoal)] font-medium">Of the candidates you referred</span>
                <span className="text-lg font-extrabold text-[var(--navy)] tabular-nums">{placementRate}%</span>
              </div>
              <div className="dash-progress"><div className="dash-progress__fill" style={{ width: `${placementRate}%`, background: '#7655D9' }} /></div>
              <p className="text-[11.5px] text-[var(--charcoal)] mt-2">{stats.placed} of {stats.total} placed so far.</p>
            </div>
          </>
        )}
      </div>

      {/* ═══ ADD CANDIDATE MODAL ═══ */}
      <Modal
        isOpen={showAddModal}
        onClose={closeAddModal}
        title={newCreds ? 'Account created' : 'Add a candidate'}
        size="md"
        footer={newCreds ? (
          <Button onClick={closeAddModal} fullWidth>Done</Button>
        ) : (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="ghost" onClick={closeAddModal} disabled={adding}>Cancel</Button>
            <Button onClick={handleAddCandidate} loading={adding} variant="success">{adding ? 'Creating…' : 'Create account'}</Button>
          </div>
        )}
      >
        {newCreds ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center dash-enter">
              <div className="w-12 h-12 rounded-full bg-[var(--green)] text-white flex items-center justify-center mx-auto mb-2 animate-[ap-scale-in_520ms_cubic-bezier(0.16,1,0.3,1)_backwards]">
                <Check size={24} />
              </div>
              <p className="font-bold text-[var(--navy)]">The candidate can sign in now</p>
              <p className="text-xs text-[var(--charcoal)] mt-1">Share these details with them. The password is shown only once.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {[
                { key: 'email', label: 'Email', value: newCreds.email },
                { key: 'password', label: 'Temporary password', value: newCreds.password },
              ].map(row => (
                <div key={row.key} className="flex items-center justify-between gap-3 px-4 py-3 bg-white">
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">{row.label}</p>
                    <p className={`font-bold text-[var(--navy)] truncate ${row.key === 'password' ? 'font-mono tracking-wide' : ''}`}>{row.value}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(row.value, row.key)}
                    className="flex-shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-full border border-[#E7E2D9] text-xs font-bold text-[var(--navy)] hover:bg-slate-50 active:scale-95 transition-transform"
                  >
                    {copied === row.key ? <><Check size={13} className="text-[var(--green)]" /> Copied</> : <><Copy size={13} /> Copy</>}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[11.5px] text-[var(--charcoal)]">Ask them to change the password after their first sign-in.</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAddCandidate(); }} noValidate>
            <Input
              label="Full name"
              required
              autoComplete="off"
              value={form.fullName}
              onChange={e => { setForm({ ...form, fullName: e.target.value }); if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: undefined }); }}
              placeholder="Candidate's full name"
              error={formErrors.fullName}
            />
            <Input
              label="Mobile number"
              required
              type="tel"
              inputMode="numeric"
              autoComplete="off"
              maxLength={10}
              value={form.phone}
              onChange={e => { setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }); if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined }); }}
              placeholder="9876543210"
              error={formErrors.phone}
              hint="10 digits, without +91"
            />
            <Input
              label="Email address"
              required
              type="email"
              inputMode="email"
              autoComplete="off"
              autoCapitalize="none"
              value={form.email}
              onChange={e => { setForm({ ...form, email: e.target.value }); if (formErrors.email) setFormErrors({ ...formErrors, email: undefined }); }}
              placeholder="candidate@example.com"
              error={formErrors.email}
              hint="They sign in with this email"
            />
            {/* Lets the keyboard's Go/Enter key submit */}
            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
          </form>
        )}
      </Modal>

      <MobileBottomNav items={tabItems} activeKey={activeSection} />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
