import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserSearch, LogOut, Link2, Copy, Share2, UserPlus2, Clock, Users, CheckCircle2, TrendingUp } from 'lucide-react';
import { Badge, Button, Modal, Toast } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { createCandidateAccountByRecruiter } from '../../lib/supabase/data';
import { DashboardSkeleton } from '../../components/Skeleton';

export function RecruiterDashboard() {
  const { recruiter, candidates, loading, refresh, profile } = useDatabase();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', email: '' });
  const [adding, setAdding] = useState(false);
  const [newCreds, setNewCreds] = useState<{ email: string; password: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const referralLink = recruiter ? `${window.location.origin}/register/job-seeker?recruiter=${recruiter.referral_code}` : '';

  const handleAddCandidate = async () => {
    if (!form.fullName || !form.phone || !form.email || !recruiter) return;
    setAdding(true);
    try {
      const { password } = await createCandidateAccountByRecruiter(recruiter.id, form);
      setNewCreds({ email: form.email, password });
      setForm({ fullName: '', phone: '', email: '' });
      await refresh();
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to create candidate account.');
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
        <p className="text-[var(--charcoal)]">No recruiter profile found.</p>
      </div>
    );
  }

  const fullName = recruiter.full_name || profile?.full_name || 'Recruiter';

  return (
    <div className="dash-shell text-[var(--navy)] pb-16" style={{ fontFamily: 'var(--font)' }}>
      <header className="sticky top-0 z-40 bg-[var(--white)]/95 backdrop-blur-md border-b border-[#E7E2D9]">
        <div className="dash-container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#7655D9] rounded-lg flex items-center justify-center text-white">
              <UserSearch size={16} />
            </div>
            <span className="font-extrabold text-[15px] text-[var(--navy)] tracking-tight hidden sm:inline">Rojgaar Hai</span>
            <span className="dash-status dash-status--neutral ml-1">Recruiter Workspace</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="dash-avatar" style={{ background: '#7655D9' }}>{fullName.charAt(0)}</div>
            <button onClick={handleLogout} className="text-[var(--charcoal)] hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100" title="Log Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="dash-container space-y-9">
        <div className="dash-header">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="dash-header__title">{fullName}</h1>
              {recruiter.is_approved ? (
                <span className="dash-status dash-status--success"><CheckCircle2 size={11} /> Approved</span>
              ) : (
                <span className="dash-status dash-status--warning"><Clock size={11} /> Approval Pending</span>
              )}
            </div>
            <p className="dash-header__subtitle">Recruiter Workspace · Refer candidates and track your network</p>
          </div>
        </div>

        {!recruiter.is_approved ? (
          <div className="dash-surface dash-surface--pad text-center py-12">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600">
              <Clock size={32} />
            </div>
            <h3 className="text-lg font-bold text-[var(--navy)]">Your account is awaiting approval</h3>
            <p className="text-sm text-[var(--charcoal)] mt-1.5 max-w-md mx-auto">
              Our team reviews every new recruiter account before activating it. Once approved, your unique referral link,
              candidate onboarding tools, and network stats will unlock here automatically — no action needed from you.
            </p>
          </div>
        ) : (
          <>
            {/* ═══ METRICS STRIP ═══ */}
            <div className="dash-metrics">
              <div className="dash-metric">
                <div className="dash-metric__value dash-metric__value--accent">{stats.total}</div>
                <div className="dash-metric__label">Candidates Referred</div>
              </div>
              <div className="dash-metric">
                <div className="dash-metric__value">{stats.placed}</div>
                <div className="dash-metric__label">Successfully Placed</div>
              </div>
              <div className="dash-metric">
                <div className="dash-metric__value">{stats.thisMonth}</div>
                <div className="dash-metric__label">Added This Month</div>
              </div>
              <div className="dash-metric">
                <div className="dash-metric__value">{stats.pending}</div>
                <div className="dash-metric__label">Awaiting First Contact</div>
              </div>
            </div>

            {/* ═══ UNIQUE LINK ═══ */}
            <div>
              <div className="dash-section-title mb-4">Your Recruiter Network</div>
              <div className="dash-surface dash-surface--pad mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7655D9]/10 text-[#7655D9] flex items-center justify-center flex-shrink-0">
                    <Link2 size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--navy)] text-[14px]">Your Unique Referral Link</p>
                    <p className="text-xs text-[var(--charcoal)]">Share this — anyone who registers through it is mapped to your network automatically.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="flex-1 px-3.5 py-2.5 bg-[var(--bg-warm)] border border-[#E7E2D9] rounded-xl text-xs sm:text-sm font-mono text-[var(--navy)] truncate">
                    {referralLink}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard.writeText(referralLink); setToastMessage('Referral link copied!'); }} className="gap-1">
                      <Copy size={14} /> Copy
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={async () => {
                        if (navigator.share) {
                          try { await navigator.share({ title: 'Join Rojgaar Hai', text: 'Register as a candidate using my referral link:', url: referralLink }); } catch { /* cancelled */ }
                        } else {
                          navigator.clipboard.writeText(referralLink);
                          setToastMessage('Sharing not supported — link copied instead!');
                        }
                      }}
                      className="gap-1"
                    >
                      <Share2 size={14} /> Share
                    </Button>
                  </div>
                </div>
              </div>

              <div className="dash-surface dash-surface--pad mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-[var(--navy)] text-[14px]">Onboard a candidate in person</p>
                  <p className="text-xs text-[var(--charcoal)]">For candidates without internet access or tech familiarity — create their account for them.</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="gap-1.5 flex-shrink-0"><UserPlus2 size={16} /> Add Candidate</Button>
              </div>

              <div className="dash-surface dash-surface--pad">
                <div className="dash-section-title mb-3 flex items-center gap-2"><Users size={16} className="text-[#7655D9]" /> Candidates in Your Network ({candidates.length})</div>
                {candidates.length === 0 ? (
                  <p className="text-sm text-[var(--charcoal)] text-center py-4">No candidates in your network yet.</p>
                ) : (
                  <div className="divide-y divide-[#EFEAE1]">
                    {candidates.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between py-2.5">
                        <div>
                          <p className="font-semibold text-[13px] text-[var(--navy)]">{c.profile_name || 'Unnamed candidate'}</p>
                          <p className="text-[11px] text-[var(--charcoal)]">{c.profile_phone} · Registered {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <Badge variant="info" className="text-[10px]">{c.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ═══ INSIGHTS ═══ */}
            <div className="dash-surface dash-surface--pad">
              <div className="dash-section-title mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-[#7655D9]" /> Placement Rate</div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-[var(--charcoal)] font-medium">Of candidates you've referred</span>
                <span className="text-lg font-extrabold text-[var(--navy)]">{stats.total > 0 ? Math.round((stats.placed / stats.total) * 100) : 0}%</span>
              </div>
              <div className="dash-progress"><div className="dash-progress__fill" style={{ width: `${stats.total > 0 ? (stats.placed / stats.total) * 100 : 0}%` }} /></div>
            </div>
          </>
        )}
      </div>

      {/* ═══ ADD CANDIDATE MODAL ═══ */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setNewCreds(null); }} title="Add Candidate on Their Behalf" size="md">
        {newCreds ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <UserPlus2 size={28} className="text-[var(--green)] mx-auto mb-2" />
              <p className="font-bold text-[var(--navy)]">Candidate account created!</p>
              <p className="text-xs text-[var(--charcoal)] mt-1">Share these login details with the candidate.</p>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 text-sm">
              <p><span className="text-slate-400">Email:</span> <strong className="text-[var(--navy)]">{newCreds.email}</strong></p>
              <p><span className="text-slate-400">Temporary Password:</span> <strong className="text-[var(--navy)] font-mono">{newCreds.password}</strong></p>
            </div>
            <Button onClick={() => { setShowAddModal(false); setNewCreds(null); }} className="w-full">Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--navy)] mb-1">Full Name</label>
              <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" placeholder="Candidate's full name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--navy)] mb-1">Phone Number</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--navy)] mb-1">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" placeholder="candidate@example.com" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleAddCandidate} disabled={adding} variant="success">{adding ? 'Creating...' : 'Create Account'}</Button>
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      {toastMessage && <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />}
    </div>
  );
}
