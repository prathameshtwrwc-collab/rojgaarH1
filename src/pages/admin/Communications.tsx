import { useState } from 'react';
import { MessageSquare, Plus, Mail, Phone as PhoneIcon, Search } from 'lucide-react';
import { Card, Badge, Button, Modal, Select, Textarea, Input } from '../../components/ui';
import { useData, Communication } from '../../context/DataContext';

const typeIcon: Record<string, React.ReactNode> = {
  'Email': <Mail size={14} />,
  'Call': <PhoneIcon size={14} />,
  'SMS': <MessageSquare size={14} />,
  'In-Person': <PhoneIcon size={14} />,
};

const typeVariant: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
  'Email': 'info', 'Call': 'success', 'SMS': 'warning', 'In-Person': 'default',
};

export default function Communications() {
  const { communications, addCommunication } = useData();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newComm, setNewComm] = useState({
    type: 'Email' as Communication['type'],
    contactType: 'Candidate' as Communication['contactType'],
    contactName: '',
    subject: '',
    notes: '',
    outcome: '',
  });

  const filtered = communications.filter(c => {
    return !search ||
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAdd = () => {
    const comm: Communication = {
      id: `CO${String(Date.now()).slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      ...newComm,
      agentName: 'Admin',
    };
    addCommunication(comm);
    setShowModal(false);
    setNewComm({ type: 'Email', contactType: 'Candidate', contactName: '', subject: '', notes: '', outcome: '' });
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
        {filtered.map(comm => (
          <Card key={comm.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl text-sm ${comm.type === 'Email' ? 'bg-[#F15A24]/5 text-[var(--orange)]' : comm.type === 'Call' ? 'bg-[#0D604A]/5 text-[var(--green)]' : 'bg-[#F15A24]/5 text-[var(--orange)]'}`}>
                {typeIcon[comm.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-[var(--navy)]">{comm.subject}</h4>
                  <Badge variant={typeVariant[comm.type]}>{comm.type}</Badge>
                  <Badge variant={comm.contactType === 'Candidate' ? 'info' : 'success'}>{comm.contactType}</Badge>
                </div>
                <p className="text-sm text-[var(--charcoal)] mt-0.5 font-medium">With {comm.contactName} • {comm.date}</p>
                <p className="text-sm text-[var(--charcoal)] mt-2 line-clamp-2 leading-relaxed">{comm.notes}</p>
                {comm.outcome && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--bg-warm)] rounded-lg text-xs font-semibold text-[var(--charcoal)]">
                    Outcome: {comm.outcome}
                  </div>
                )}
              </div>
              <p className="text-xs text-[var(--charcoal)] flex-shrink-0">by {comm.agentName}</p>
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
                { value: 'Email', label: 'Email' },
                { value: 'Call', label: 'Phone Call' },
                { value: 'SMS', label: 'SMS' },
                { value: 'In-Person', label: 'In-Person' },
              ]}
              value={newComm.type}
              onChange={e => setNewComm(prev => ({ ...prev, type: e.target.value as Communication['type'] }))}
            />
            <Select
              label="Contact Type"
              options={[
                { value: 'Candidate', label: 'Candidate' },
                { value: 'Employer', label: 'Employer' },
              ]}
              value={newComm.contactType}
              onChange={e => setNewComm(prev => ({ ...prev, contactType: e.target.value as Communication['contactType'] }))}
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
            <Button onClick={handleAdd} className="gap-1"><Plus size={14} /> Save Communication</Button>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
