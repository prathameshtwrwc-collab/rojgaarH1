import { useState, useEffect } from 'react';
import { Building2, MapPin, User, CheckCircle } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { Button } from './ui';
import { getSectorsList } from '../constants/sectors';

export interface CompanyForm {
  companyName: string;
  industry: string;
  companySize: string;
  yearEstablished: string;
  website: string;
  gstNumber: string;
  address: string;
  city: string;
  state: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onSave: (form: CompanyForm) => Promise<void>;
  initial: CompanyForm;
  saving: boolean;
  isFirstRun: boolean;
}

const indianStatesList = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh',
];

const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent transition-colors';
const labelClass = 'block text-xs font-semibold text-[var(--navy)] mb-1.5';

export default function EditCompanyModal({ isOpen, onClose, onSkip, onSave, initial, saving, isFirstRun }: EditCompanyModalProps) {
  const [form, setForm] = useState<CompanyForm>(initial);
  const [activeStep, setActiveStep] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [sectorInput, setSectorInput] = useState(initial.industry || '');
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false);
  const [filteredSectors, setFilteredSectors] = useState<string[]>(getSectorsList());

  useEffect(() => {
    if (isOpen) {
      setForm(initial);
      setActiveStep(0);
      setVisited(new Set([0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = [
    { label: 'Company Basics', icon: <Building2 size={16} /> },
    { label: 'Location', icon: <MapPin size={16} /> },
    { label: 'Contact Info', icon: <User size={16} /> },
  ];

  const goToStep = (i: number) => {
    setActiveStep(i);
    setVisited(prev => new Set(prev).add(i));
  };
  const goStep = (delta: number) => goToStep(Math.min(steps.length - 1, Math.max(0, activeStep + delta)));

  const update = (patch: Partial<CompanyForm>) => setForm(prev => ({ ...prev, ...patch }));

  // Sector combobox handlers
  const handleSectorInputChange = (value: string) => {
    setSectorInput(value);
    update({ industry: value });
    const allSectors = getSectorsList();
    const filtered = allSectors.filter(s => s.toLowerCase().includes(value.toLowerCase()));
    const hasExactMatch = allSectors.some(s => s.toLowerCase() === value.toLowerCase());
    if (value && !hasExactMatch) {
      filtered.unshift(`✏️ Custom: ${value}`);
    }
    setFilteredSectors(filtered);
    setSectorDropdownOpen(true);
  };

  const handleSectorSelect = (sector: string) => {
    if (sector.startsWith('✏️ Custom: ')) {
      const customValue = sector.replace('✏️ Custom: ', '');
      setSectorInput(customValue);
      update({ industry: customValue });
    } else {
      setSectorInput(sector);
      update({ industry: sector });
    }
    setSectorDropdownOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 sm:py-6">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-3xl max-h-[calc(100dvh-48px)] flex flex-col overflow-hidden z-10 animate-fade-in">

        {/* HEADER */}
        <div
          className="relative text-white p-5 sm:p-6 flex items-center justify-between gap-4 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #101A36 0%, #1C2B52 60%, #101A36 100%)' }}
        >
          <div
            className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20 blur-2xl"
            style={{ background: 'radial-gradient(circle, var(--orange) 0%, transparent 70%)' }}
          />
          <div className="relative flex items-center gap-3.5">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--orange)] to-[#d94d1a] text-white rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/15">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {isFirstRun ? 'Complete Your Company Profile' : 'Edit Company Details'}
              </h2>
              <p className="text-xs text-white/70 mt-0.5">Step {activeStep + 1} of {steps.length} · {steps[activeStep].label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors flex-shrink-0"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={19} />
          </button>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="px-5 sm:px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-3">
          <button
            onClick={() => goStep(-1)}
            disabled={activeStep === 0}
            className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-[var(--navy)] hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Previous step"
          >
            ‹
          </button>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--orange)] to-[#d94d1a] rounded-full transition-all duration-400 ease-out"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <button
            onClick={() => goStep(1)}
            disabled={activeStep === steps.length - 1}
            className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-[var(--navy)] hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Next step"
          >
            ›
          </button>
        </div>

        {/* BODY: STEPPER SIDEBAR + FORM */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-56 bg-slate-50 border-r border-slate-200 p-3 md:p-4 flex md:flex-col gap-1 md:gap-0 overflow-x-auto md:overflow-y-auto flex-shrink-0" data-lenis-prevent>
            {steps.map((step, i) => {
              const isActive = activeStep === i;
              const isDone = visited.has(i) && !isActive;
              return (
                <button
                  key={step.label}
                  onClick={() => goToStep(i)}
                  className={`relative flex items-center gap-3 px-2.5 md:px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all text-left group ${
                    isActive ? 'bg-white shadow-md shadow-slate-900/5 border border-slate-200' : 'hover:bg-slate-100/80 border border-transparent'
                  }`}
                >
                  {i < steps.length - 1 && (
                    <span className="hidden md:block absolute left-[27px] top-[38px] w-px h-[calc(100%-14px)] bg-slate-200" />
                  )}
                  <span
                    className={`relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-colors ${
                      isActive
                        ? 'bg-[var(--orange)] text-white shadow-sm shadow-orange-600/30'
                        : isDone
                        ? 'bg-[var(--green)]/12 text-[var(--green)]'
                        : 'bg-slate-200/80 text-slate-500 group-hover:bg-slate-300/70'
                    }`}
                  >
                    {isDone ? <CheckCircle size={13} /> : i + 1}
                  </span>
                  <span className={`flex items-center gap-1.5 min-w-0 ${isActive ? 'text-[var(--navy)]' : isDone ? 'text-slate-700' : 'text-slate-500'}`}>
                    <span className={isActive ? 'text-[var(--orange)]' : 'opacity-60'}>{step.icon}</span>
                    <span className="truncate">{step.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-h-0 p-5 sm:p-7 overflow-y-auto space-y-4 bg-white" data-lenis-prevent>
            {activeStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">1. Company Basics</h3>
                <div>
                  <label className={labelClass}>Company Name</label>
                  <input value={form.companyName} onChange={e => update({ companyName: e.target.value })} className={inputClass} placeholder="e.g. Bharat Manufacturing Co." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className={labelClass}>Industry</label>
                    <div className="relative">
                      <input
                        value={sectorInput}
                        onChange={(e) => handleSectorInputChange(e.target.value)}
                        onFocus={() => { setSectorDropdownOpen(true); setFilteredSectors(getSectorsList()); }}
                        onBlur={() => setTimeout(() => setSectorDropdownOpen(false), 200)}
                        className={inputClass}
                        placeholder="Type or select industry..."
                      />
                      <button
                        type="button"
                        onClick={() => setSectorDropdownOpen(!sectorDropdownOpen)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <svg className={`w-4 h-4 transition-transform ${sectorDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                    {sectorDropdownOpen && filteredSectors.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredSectors.map((sector) => (
                          <button
                            key={sector}
                            type="button"
                            onMouseDown={() => handleSectorSelect(sector)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-[var(--orange)] ${sector === sectorInput ? 'bg-orange-50 text-[var(--orange)] font-medium' : 'text-slate-700'}`}
                          >
                            {sector}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Company Size</label>
                    <input value={form.companySize} onChange={e => update({ companySize: e.target.value })} className={inputClass} placeholder="e.g. 50-200" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Year Established</label>
                    <input value={form.yearEstablished} onChange={e => update({ yearEstablished: e.target.value })} className={inputClass} placeholder="e.g. 2015" />
                  </div>
                  <div>
                    <label className={labelClass}>GST Number</label>
                    <input value={form.gstNumber} onChange={e => update({ gstNumber: e.target.value })} className={inputClass} placeholder="Optional" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <input value={form.website} onChange={e => update({ website: e.target.value })} className={inputClass} placeholder="e.g. www.yourcompany.com" />
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">2. Location</h3>
                <div>
                  <label className={labelClass}>Address</label>
                  <input value={form.address} onChange={e => update({ address: e.target.value })} className={inputClass} placeholder="Street address" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>City</label>
                    <input value={form.city} onChange={e => update({ city: e.target.value })} className={inputClass} placeholder="e.g. Pune" />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <select value={form.state} onChange={e => update({ state: e.target.value })} className={inputClass}>
                      <option value="">Select state...</option>
                      {indianStatesList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">3. Contact Info</h3>
                <div>
                  <label className={labelClass}>Contact Name</label>
                  <input value={form.contactName} onChange={e => update({ contactName: e.target.value })} className={inputClass} placeholder="Recruiter / HR contact name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Contact Email</label>
                    <input type="email" value={form.contactEmail} onChange={e => update({ contactEmail: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Phone</label>
                    <input value={form.contactPhone} onChange={e => update({ contactPhone: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            {isFirstRun ? 'Skip for now' : 'Cancel'}
          </Button>
          <div className="flex items-center gap-2">
            {activeStep < steps.length - 1 ? (
              <Button variant="secondary" size="md" onClick={() => goStep(1)}>Next Step</Button>
            ) : (
              <Button variant="success" size="md" onClick={() => onSave(form)} disabled={saving} className="gap-1.5 text-sm font-bold shadow-lg">
                <CheckCircle size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
