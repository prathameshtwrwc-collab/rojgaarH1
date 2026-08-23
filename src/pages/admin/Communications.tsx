import { useState } from 'react';
import { MessageSquare, Plus, Mail, Phone as PhoneIcon, Search } from 'lucide-react';
import { Card, Badge, Button, Modal, Select, Textarea, Input } from '../../components/ui';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { createCommunication } from '../../lib/supabase/data';

const typeIcon: Record<string, React.ReactNode> = {
  'email': <Mail size={14} />,
  'call': <PhoneIcon size={14} />,
  'sms': <MessageSquare size={14} />,
  'in_person': <PhoneIcon size={14} />,
};

const typeVariant: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
  'email': 'info', 'call': 'success', 'sms': 'warning', 'in_person': 'default',
};

export default function Communications() {
  const { communications, refresh } = useDatabase();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newComm, setNewComm] = useState({
    type: 'email',
    contactType: 'candidate',
    contactName: '',
    subject: '',
    notes: '',
    outcome: '',
  });

  const filtered = communications.filter((c: any) => {
    return !search ||
      (c.contact_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.subject || '').toLowerCase().includes(search.toLowerCase());
  }).sort((a: any, b: any) => new Date(b.communication_date).getTime() - new Date(a.communication_date).getTime());

  const handleAdd = async () => {
    if (!newComm.contactName || !newComm.subject || !newComm.notes) return;
    setSaving(true);
    try {
      await createCommunication({
        communication_date: new Date().toISOString(),
        type: newComm.type as any,
        contact_type: newComm.contactType as any,
        contact_name: newComm.contactName,
        subject: newComm.subject,
        notes: newComm.notes,
        outcome: newComm.outcome || null,
        agent_id: user?.id,
      } as any);
      await refresh();
      setShowModal(false);
      setNewComm({ type: 'email', contactType: 'candidate', contactName: '', subject: '', notes: '', outcome: '' });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save communication');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--navy)]">Communications</h2>
          <p className="text-sm text-[var(--charcoal)] mt-1">{communications.length} logged interactions</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-1"><Plus size={16} /> Log Communication</Button>
      </div>

      <Card className="!p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--charcoal)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by contact name or subject..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[var(--orange)] focus:border-[var(--orange)] focus:outline-none text-sm bg-white text-[var(--navy)] placeholder:text-slate-400"
          />
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.map((comm: any) => (
          <Card key={comm.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl text-sm ${comm.type === 'email' ? 'bg-[#F15A24]/5 text-[var(--orange)]' : comm.type === 'call' ? 'bg-[#0D604A]/5 text-[var(--green)]' : 'bg-[#F15A24]/5 text-[var(--orange)]'}`}>
                {typeIcon[comm.type] || <MessageSquare size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-[var(--navy)]">{comm.subject}</h4>
                  <Badge variant={typeVariant[comm.type] || 'default'}>{comm.type}</Badge>
                  <Badge variant={comm.contact_type === 'candidate' ? 'info' : 'success'}>{comm.contact_type}</Badge>
                </div>
                <p className="text-sm text-[var(--charcoal)] mt-0.5 font-medium">With {comm.contact_name} • {new Date(comm.communication_date).toLocaleDateString()}</p>
                <p className="text-sm text-[var(--charcoal)] mt-2 line-clamp-2 leading-relaxed">{comm.notes}</p>
                {comm.outcome && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--bg-warm)] rounded-lg text-xs font-semibold text-[var(--charcoal)]">
                    Outcome: {comm.outcome}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[var(--charcoal)]"><p className="text-sm">No communications found</p></div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Communication" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              options={[
                { value: 'email', label: 'Email' },
                { value: 'call', label: 'Phone Call' },
                { value: 'sms', label: 'SMS' },
                { value: 'in_person', label: 'In-Person' },
              ]}
              value={newComm.type}
              onChange={e => setNewComm(prev => ({ ...prev, type: e.target.value }))}
            />
            <Select
              label="Contact Type"
              options={[
                { value: 'candidate', label: 'Candidate' },
                { value: 'employer', label: 'Employer' },
              ]}
              value={newComm.contactType}
              onChange={e => setNewComm(prev => ({ ...prev, contactType: e.target.value }))}
            />
          </div>
          <Input
            label="Contact Name"
            required
            value={newComm.contactName}
            onChange={e => setNewComm(prev => ({ ...prev, contactName: e.target.value }))}
            placeholder="e.g. Rajesh Kumar"
          />
          <Input
            label="Subject"
            required
            value={newComm.subject}
            onChange={e => setNewComm(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="e.g. Interview Discussion"
          />
          <Textarea
            label="Notes"
            required
            value={newComm.notes}
            onChange={e => setNewComm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Detailed notes about the communication..."
          />
          <Input
            label="Outcome"
            value={newComm.outcome}
            onChange={e => setNewComm(prev => ({ ...prev, outcome: e.target.value }))}
            placeholder="e.g. Interview confirmed, Candidate interested"
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={handleAdd} disabled={saving} className="gap-1"><Plus size={14} /> {saving ? 'Saving...' : 'Save Communication'}</Button>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
