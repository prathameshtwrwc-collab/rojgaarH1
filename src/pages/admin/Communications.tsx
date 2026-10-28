import { useMemo, useState } from 'react';
import { MessageSquare, Plus, Mail, Phone as PhoneIcon, Search, Users, X } from 'lucide-react';
import { Card, Badge, Button, Modal, Select, Textarea, Input, Toast } from '../../components/ui';
import EmptyState from '../../components/EmptyState';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { createCommunication } from '../../lib/supabase/data';
import { haptic } from '../../lib/haptics';

const typeIcon: Record<string, React.ReactNode> = {
  'email': <Mail size={14} />,
  'call': <PhoneIcon size={14} />,
  'sms': <MessageSquare size={14} />,
  'in_person': <Users size={14} />,
};

const typeVariant: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
  'email': 'info', 'call': 'success', 'sms': 'warning', 'in_person': 'default',
};

const TYPE_LABEL: Record<string, string> = { email: 'Email', call: 'Call', sms: 'SMS', in_person: 'In person' };

// The database stores these as enums ('Email', 'In-Person', 'Candidate', ...), so the form's keys are mapped on save
const DB_TYPE: Record<string, string> = { email: 'Email', call: 'Call', sms: 'SMS', in_person: 'In-Person' };
const DB_CONTACT: Record<string, string> = { candidate: 'Candidate', employer: 'Employer' };
const typeKey = (v: string) => (v || '').toLowerCase().replace('-', '_');

const EMPTY_FORM = { type: 'email', contactType: 'candidate', contactName: '', subject: '', notes: '', outcome: '' };

/** "Today", "Yesterday", or a short date, for grouping the log by day. */
function dayLabel(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Undated';
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(new Date()) - start(d)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
}

export default function Communications() {
  const { communications, refresh } = useDatabase();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ contactName?: string; subject?: string; notes?: string }>({});
  const [newComm, setNewComm] = useState(EMPTY_FORM);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return communications
      .filter((c: any) => typeFilter === 'all' || typeKey(c.type) === typeFilter)
      .filter((c: any) => !q ||
        (c.contact_name || '').toLowerCase().includes(q) ||
        (c.subject || '').toLowerCase().includes(q) ||
        (c.notes || '').toLowerCase().includes(q))
      .sort((a: any, b: any) => new Date(b.communication_date).getTime() - new Date(a.communication_date).getTime());
  }, [communications, search, typeFilter]);

  // Consecutive entries from the same day sit under one heading
  const groups = useMemo(() => {
    const out: { label: string; items: any[] }[] = [];
    filtered.forEach((c: any) => {
      const label = dayLabel(c.communication_date);
      if (out.length && out[out.length - 1].label === label) out[out.length - 1].items.push(c);
      else out.push({ label, items: [c] });
    });
    return out;
  }, [filtered]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    communications.forEach((c: any) => { const k = typeKey(c.type); counts[k] = (counts[k] || 0) + 1; });
    return counts;
  }, [communications]);

  const update = (patch: Partial<typeof EMPTY_FORM>) => {
    setNewComm(prev => ({ ...prev, ...patch }));
    // A field stops showing its error as soon as it is being fixed
    setErrors(prev => {
      const next = { ...prev };
      (Object.keys(patch) as (keyof typeof prev)[]).forEach(k => { delete next[k]; });
      return next;
    });
  };

  const openModal = () => {
    setNewComm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const handleAdd = async () => {
    const nextErrors: typeof errors = {};
    if (!newComm.contactName.trim()) nextErrors.contactName = 'Who was this with?';
    if (!newComm.subject.trim()) nextErrors.subject = 'Add a short subject.';
    if (!newComm.notes.trim()) nextErrors.notes = 'Write down what was discussed.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      haptic('warn');
      return;
    }
    setSaving(true);
    try {
      await createCommunication({
        communication_date: new Date().toISOString(),
        type: DB_TYPE[newComm.type] as any,
        contact_type: DB_CONTACT[newComm.contactType] as any,
        contact_name: newComm.contactName.trim(),
        subject: newComm.subject.trim(),
        notes: newComm.notes.trim(),
        outcome: newComm.outcome.trim() || null,
        agent_id: user?.id ?? null,
      } as any);
      // Silent: the admin layout would otherwise swap the whole page for a skeleton mid-close
      await refresh({ silent: true });
      setShowModal(false);
      setToast(`Logged ${TYPE_LABEL[newComm.type].toLowerCase()} with ${newComm.contactName.trim()}.`);
    } catch (err) {
      // Supabase errors are plain objects, not Error instances
      const message = (err as { message?: string } | null)?.message;
      setToast(message ? `Could not save: ${message}` : 'Could not save this communication. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filterChips = [
    { key: 'all', label: 'All', count: communications.length },
    ...(['email', 'call', 'sms', 'in_person'] as const).map(k => ({ key: k, label: TYPE_LABEL[k], count: typeCounts[k] || 0 })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy)]">Communications</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1 tabular-nums">{communications.length} logged {communications.length === 1 ? 'interaction' : 'interactions'}</p>
        </div>
        <Button onClick={openModal} className="gap-1"><Plus size={16} /> Log Communication</Button>
      </div>

      <Card className="!p-4 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--charcoal)] pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, subject or notes"
            aria-label="Search communications"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none text-sm bg-white text-[var(--navy)] placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
              <X size={15} />
            </button>
          )}
        </div>
        <div className="ap-rail" aria-label="Filter by type">
          {filterChips.map(chip => (
            <button
              key={chip.key}
              type="button"
              aria-pressed={typeFilter === chip.key}
              onClick={() => { haptic('select'); setTypeFilter(chip.key); }}
              className="ap-chip !h-9"
            >
              {chip.label} <span className="opacity-60 tabular-nums">{chip.count}</span>
            </button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        communications.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={20} />}
            title="Nothing logged yet"
            body="Log every call, email or meeting with candidates and employers so the whole team can see where things stand."
            action={<Button size="sm" onClick={openModal}><Plus size={14} /> Log the first one</Button>}
          />
        ) : (
          <div className="text-center py-12 text-[var(--charcoal)]">
            <p className="text-sm font-semibold">No communications match.</p>
            <button type="button" onClick={() => { setSearch(''); setTypeFilter('all'); }} className="mt-2 text-sm font-bold text-[var(--orange)] hover:underline">Clear search and filter</button>
          </div>
        )
      ) : (
        <div className="space-y-6">
          {groups.map(group => (
            <section key={group.label} aria-label={group.label}>
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-1">{group.label}</h3>
              <div className="space-y-3">
                {group.items.map((comm: any) => {
                  const key = typeKey(comm.type);
                  return (
                    <Card key={comm.id} className="dash-enter !p-4 sm:!p-5">
                      <div className="flex items-start gap-3.5">
                        <div className={`p-2.5 rounded-xl text-sm flex-shrink-0 ${key === 'call' ? 'bg-[#0D604A]/5 text-[var(--green)]' : 'bg-[#F15A24]/5 text-[var(--orange)]'}`} aria-hidden="true">
                          {typeIcon[key] || <MessageSquare size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start sm:items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-[var(--navy)] break-words min-w-0">{comm.subject || 'No subject'}</h4>
                            <span className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0 tabular-nums">
                              {new Date(comm.communication_date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            <Badge variant={typeVariant[key] || 'default'}>{TYPE_LABEL[key] || comm.type}</Badge>
                            <Badge variant={(comm.contact_type || '').toLowerCase() === 'candidate' ? 'info' : 'success'}>{comm.contact_type}</Badge>
                            <span className="text-[12.5px] text-[var(--charcoal)] font-semibold truncate">with {comm.contact_name}</span>
                          </div>
                          {comm.notes && <p className="text-sm text-[var(--charcoal)] mt-2 line-clamp-3 leading-relaxed whitespace-pre-line break-words">{comm.notes}</p>}
                          {comm.outcome && (
                            <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--bg-warm)] rounded-lg text-xs font-semibold text-[var(--charcoal)] max-w-full">
                              <span className="text-slate-400">Outcome:</span> <span className="truncate">{comm.outcome}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => { if (!saving) setShowModal(false); }}
        title="Log communication"
        size="md"
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleAdd} loading={saving}>{!saving && <Plus size={14} />} {saving ? 'Saving…' : 'Save communication'}</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleAdd(); }} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              options={[
                { value: 'email', label: 'Email' },
                { value: 'call', label: 'Phone call' },
                { value: 'sms', label: 'SMS' },
                { value: 'in_person', label: 'In person' },
              ]}
              value={newComm.type}
              onChange={e => update({ type: e.target.value })}
            />
            <Select
              label="With a"
              options={[
                { value: 'candidate', label: 'Candidate' },
                { value: 'employer', label: 'Employer' },
              ]}
              value={newComm.contactType}
              onChange={e => update({ contactType: e.target.value })}
            />
          </div>
          <Input
            label="Contact name"
            required
            value={newComm.contactName}
            onChange={e => update({ contactName: e.target.value })}
            placeholder={newComm.contactType === 'employer' ? 'e.g. HR manager, company name' : 'e.g. Rajesh Kumar'}
            error={errors.contactName}
          />
          <Input
            label="Subject"
            required
            value={newComm.subject}
            onChange={e => update({ subject: e.target.value })}
            placeholder="e.g. Interview discussion"
            maxLength={120}
            error={errors.subject}
          />
          <Textarea
            label="Notes"
            required
            value={newComm.notes}
            onChange={e => update({ notes: e.target.value })}
            placeholder="What was discussed, and anything to follow up on"
            maxLength={2000}
            error={errors.notes}
          />
          <Input
            label="Outcome"
            value={newComm.outcome}
            onChange={e => update({ outcome: e.target.value })}
            placeholder="e.g. Interview confirmed, candidate interested"
            maxLength={160}
            hint="Optional"
          />
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
