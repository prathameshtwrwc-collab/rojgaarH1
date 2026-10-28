import { useState, useEffect } from 'react';
import { lockBodyScroll } from '../lib/scrollLock';
import { Building2, MapPin, User, CheckCircle } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { Button } from './ui';
import { getSectorsList, getSubsectorsForSector } from '../constants/sectors';
import { useModalBackButton } from '../hooks/useModalBackButton';
import { useMountTransition } from '../hooks/useMountTransition';

export interface CompanyForm {
  companyName: string;
  industry: string;
  department: string;
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

const inputClass = 'w-full h-12 sm:h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-[15px] sm:text-sm text-[var(--navy)] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[var(--orange)]/15 focus:border-[var(--orange)] transition-[border-color,box-shadow] disabled:bg-slate-50 disabled:text-slate-400';
const labelClass = 'block text-xs font-bold text-[var(--navy)] mb-1.5';
const THIS_YEAR = new Date().getFullYear();

export default function EditCompanyModal({ isOpen, onClose, onSkip, onSave, initial, saving, isFirstRun }: EditCompanyModalProps) {
  const [form, setForm] = useState<CompanyForm>(initial);
  const [activeStep, setActiveStep] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [sectorInput, setSectorInput] = useState(initial.industry || '');
  const [sectorDropdownOpen, setSectorDropdownOpen] = useState(false);
  const [filteredSectors, setFilteredSectors] = useState<string[]>(getSectorsList());
  const [deptInput, setDeptInput] = useState(initial.department || '');
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [filteredDepts, setFilteredDepts] = useState<string[]>([]);
  const [nameError, setNameError] = useState('');
  // Which way the step content slides in
  const [dir, setDir] = useState<1 | -1>(1);

  useEffect(() => {
    if (isOpen) {
      setForm(initial);
      // The combobox text must follow the saved values too, or a cancelled edit lingers
      setSectorInput(initial.industry || '');
      setDeptInput(initial.department || '');
      setSectorDropdownOpen(false);
      setDeptDropdownOpen(false);
      setNameError('');
      setActiveStep(0);
      setVisited(new Set([0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Escape closes, unless a dropdown is open (then it just closes the dropdown)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (sectorDropdownOpen || deptDropdownOpen) {
        setSectorDropdownOpen(false);
        setDeptDropdownOpen(false);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, sectorDropdownOpen, deptDropdownOpen]);

  useEffect(() => {
    if (!isOpen) return;
    return lockBodyScroll();
  }, [isOpen]);

  // On a phone, back closes this editor instead of leaving the dashboard behind it.
  useModalBackButton(isOpen, onClose);

  // Stays mounted briefly after closing so the sheet can slide back down instead of vanishing.
  const { mounted, state } = useMountTransition(isOpen, 260);
  if (!mounted) return null;

  const steps = [
    { label: 'Company Basics', icon: <Building2 size={16} /> },
    { label: 'Location', icon: <MapPin size={16} /> },
    { label: 'Contact Info', icon: <User size={16} /> },
  ];

  const goToStep = (i: number) => {
    if (i === activeStep) return;
    setDir(i > activeStep ? 1 : -1);
    setActiveStep(i);
    setVisited(prev => new Set(prev).add(i));
  };

  const yearError = form.yearEstablished && (!/^\d{4}$/.test(form.yearEstablished) || Number(form.yearEstablished) < 1800 || Number(form.yearEstablished) > THIS_YEAR)
    ? `Enter a year between 1800 and ${THIS_YEAR}`
    : '';
  const emailError = form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.contactEmail.trim()) ? 'This email does not look right' : '';
  const phoneDigits = form.contactPhone.replace(/\D/g, '');
  const phoneError = form.contactPhone && (phoneDigits.length < 10 || phoneDigits.length > 12) ? 'Enter a 10-digit phone number' : '';

  const handleSave = () => {
    if (!form.companyName.trim()) {
      setNameError('Company name is required');
      goToStep(0);
      return;
    }
    if (yearError) { goToStep(0); return; }
    if (emailError || phoneError) { goToStep(2); return; }
    onSave({
      ...form,
      companyName: form.companyName.trim(),
      website: form.website.trim(),
      gstNumber: form.gstNumber.trim().toUpperCase(),
      city: form.city.trim(),
      contactName: form.contactName.trim(),
      contactEmail: form.contactEmail.trim().toLowerCase(),
      contactPhone: form.contactPhone.trim(),
    });
  };
  const goStep = (delta: number) => goToStep(Math.min(steps.length - 1, Math.max(0, activeStep + delta)));

  const update = (patch: Partial<CompanyForm>) => setForm(prev => ({ ...prev, ...patch }));

  // Sector combobox handlers
  const handleSectorInputChange = (value: string) => {
    setSectorInput(value);
    // A different industry means the old department no longer fits
    if (value !== form.industry) { setDeptInput(''); update({ industry: value, department: '' }); }
    else update({ industry: value });
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
    if (sector === 'Manual') {
      // "Manual" means "let me type my own", so clear the box and focus it
      setSectorInput('');
      setDeptInput('');
      update({ industry: '', department: '' });
      setSectorDropdownOpen(false);
      setTimeout(() => document.getElementById('company-sector-input')?.focus(), 50);
      return;
    }
    const next = sector.startsWith('✏️ Custom: ') ? sector.replace('✏️ Custom: ', '') : sector;
    if (next !== form.industry) setDeptInput('');
    setSectorInput(next);
    update(next !== form.industry ? { industry: next, department: '' } : { industry: next });
    setSectorDropdownOpen(false);
  };

  const handleDeptInputChange = (value: string) => {
    setDeptInput(value);
    update({ department: value });
    const subsectors = getSubsectorsForSector(form.industry || sectorInput);
    const filtered = subsectors.filter(d => d.toLowerCase().includes(value.toLowerCase()));
    const hasExactMatch = subsectors.some(d => d.toLowerCase() === value.toLowerCase());
    if (value && !hasExactMatch) {
      filtered.unshift(`✏️ Custom: ${value}`);
    }
    setFilteredDepts(filtered);
    setDeptDropdownOpen(true);
  };

  const handleDeptSelect = (dept: string) => {
    if (dept === 'Manual') {
      setDeptInput('');
      update({ department: '' });
      setDeptDropdownOpen(false);
      setTimeout(() => document.getElementById('company-dept-input')?.focus(), 50);
      return;
    }
    if (dept.startsWith('✏️ Custom: ')) {
      const customValue = dept.replace('✏️ Custom: ', '');
      setDeptInput(customValue);
      update({ department: customValue });
    } else {
      setDeptInput(dept);
      update({ department: dept });
    }
    setDeptDropdownOpen(false);
  };

  return (
    <div className="ui-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 sm:py-6" data-state={state}>
      <div className="ui-modal-backdrop fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />

      <div className="ui-modal-panel ui-modal-panel--full relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-3xl max-h-[calc(100dvh-48px)] flex flex-col overflow-hidden z-10">

        {/* HEADER */}
        <div
          className="ui-modal-header relative text-white p-5 sm:p-6 flex items-center justify-between gap-4 overflow-hidden"
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
              <p className="text-xs text-white/70 mt-0.5" aria-live="polite">Step {activeStep + 1} of {steps.length} · {steps[activeStep].label}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors flex-shrink-0"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={19} />
          </button>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="px-5 sm:px-6 py-3 bg-white border-b border-slate-100 flex items-center gap-3">
          <button
            type="button"
            onClick={() => goStep(-1)}
            disabled={activeStep === 0}
            className="w-8 h-8 text-lg flex-shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-[var(--navy)] hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Previous step"
          >
            ‹
          </button>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--orange)] to-[#d94d1a] rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => goStep(1)}
            disabled={activeStep === steps.length - 1}
            className="w-8 h-8 text-lg flex-shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-[var(--navy)] hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            aria-label="Next step"
          >
            ›
          </button>
        </div>

        {/* BODY: STEPPER SIDEBAR + FORM */}
        <div className="ui-modal-split flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-56 bg-slate-50 border-r border-slate-200 p-3 md:p-4 flex md:flex-col gap-1 md:gap-0 overflow-x-auto md:overflow-y-auto flex-shrink-0" data-lenis-prevent>
            {steps.map((step, i) => {
              const isActive = activeStep === i;
              const isDone = visited.has(i) && !isActive;
              return (
                <button
                  key={step.label}
                  type="button"
                  aria-current={isActive ? 'step' : undefined}
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

          <div className="flex-1 min-h-0 p-5 sm:p-7 overflow-y-auto overscroll-contain space-y-4 bg-white" data-lenis-prevent>
            <div key={activeStep} className={dir === 1 ? 'ecm-step ecm-step--fwd' : 'ecm-step ecm-step--back'}>
            {activeStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">1. Company Basics</h3>
                <div>
                  <label htmlFor="ecm-name" className={labelClass}>Company Name <span className="text-[var(--orange)]">*</span></label>
                  <input
                    id="ecm-name"
                    value={form.companyName}
                    onChange={e => { update({ companyName: e.target.value }); if (nameError) setNameError(''); }}
                    autoComplete="organization"
                    autoCapitalize="words"
                    maxLength={120}
                    aria-invalid={nameError ? true : undefined}
                    className={`${inputClass} ${nameError ? '!border-red-300' : ''}`}
                    placeholder="e.g. Bharat Manufacturing Co."
                  />
                  {nameError && <p className="auth-field__error mt-1.5 text-xs font-semibold text-red-600">{nameError}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <label className={labelClass}>Industry</label>
                    <div className="relative">
                      <input
                        id="company-sector-input"
                        value={sectorInput}
                        onChange={(e) => handleSectorInputChange(e.target.value)}
                        onFocus={() => { setSectorDropdownOpen(true); setFilteredSectors(getSectorsList()); }}
                        onBlur={() => setTimeout(() => setSectorDropdownOpen(false), 200)}
                        className={inputClass}
                        placeholder="Type or select industry..."
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={sectorDropdownOpen}
                        aria-controls="ecm-sector-list"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label="Show industries"
                        onClick={() => setSectorDropdownOpen(!sectorDropdownOpen)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"
                      >
                        <svg className={`w-4 h-4 transition-transform ${sectorDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                    {sectorDropdownOpen && filteredSectors.length > 0 && (
                      <div id="ecm-sector-list" role="listbox" className="ecm-pop absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto overscroll-contain py-1" data-lenis-prevent>
                        {filteredSectors.map((sector) => (
                          <button
                            key={sector}
                            type="button"
                            role="option"
                            aria-selected={sector === sectorInput}
                            onMouseDown={e => { e.preventDefault(); handleSectorSelect(sector); }}
                            className={`w-full text-left px-4 py-2.5 sm:py-2 text-sm hover:bg-orange-50 hover:text-[var(--orange)] ${sector === sectorInput ? 'bg-orange-50 text-[var(--orange)] font-semibold' : 'text-slate-700'}`}
                          >
                            {sector === 'Manual' ? 'Other (type your own)' : sector}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className={labelClass}>Department / Sub-Sector</label>
                    <div className="relative">
                      <input
                        id="company-dept-input"
                        value={deptInput}
                        onChange={(e) => handleDeptInputChange(e.target.value)}
                        onFocus={() => {
                          const subsectors = getSubsectorsForSector(form.industry || sectorInput);
                          setFilteredDepts(subsectors);
                          setDeptDropdownOpen(true);
                        }}
                        onBlur={() => setTimeout(() => setDeptDropdownOpen(false), 200)}
                        className={inputClass}
                        placeholder={form.industry || sectorInput ? 'Type or select department...' : 'Select sector first'}
                        disabled={!form.industry && !sectorInput}
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={deptDropdownOpen}
                        aria-controls="ecm-dept-list"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label="Show departments"
                        onClick={() => {
                          if (form.industry || sectorInput) {
                            const subsectors = getSubsectorsForSector(form.industry || sectorInput);
                            setFilteredDepts(subsectors);
                            setDeptDropdownOpen(!deptDropdownOpen);
                          }
                        }}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"
                      >
                        <svg className={`w-4 h-4 transition-transform ${deptDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                    {deptDropdownOpen && filteredDepts.length > 0 && (
                      <div id="ecm-dept-list" role="listbox" className="ecm-pop absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto overscroll-contain py-1" data-lenis-prevent>
                        {filteredDepts.map((dept) => (
                          <button
                            key={dept}
                            type="button"
                            role="option"
                            aria-selected={dept === deptInput}
                            onMouseDown={e => { e.preventDefault(); handleDeptSelect(dept); }}
                            className={`w-full text-left px-4 py-2.5 sm:py-2 text-sm hover:bg-orange-50 hover:text-[var(--orange)] ${dept === deptInput ? 'bg-orange-50 text-[var(--orange)] font-semibold' : 'text-slate-700'}`}
                          >
                            {dept === 'Manual' ? 'Other (type your own)' : dept}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Company Size</label>
                    <input value={form.companySize} onChange={e => update({ companySize: e.target.value })} className={inputClass} placeholder="e.g. 50-200" list="ecm-size-list" />
                    <datalist id="ecm-size-list">
                      {['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Year Established</label>
                    <input
                      value={form.yearEstablished}
                      onChange={e => update({ yearEstablished: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      inputMode="numeric"
                      maxLength={4}
                      aria-invalid={yearError ? true : undefined}
                      className={`${inputClass} ${yearError ? '!border-red-300' : ''}`}
                      placeholder="e.g. 2015"
                    />
                    {yearError && <p className="auth-field__error mt-1.5 text-xs font-semibold text-red-600">{yearError}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>GST Number</label>
                    <input
                      value={form.gstNumber}
                      onChange={e => update({ gstNumber: e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 15) })}
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      maxLength={15}
                      className={`${inputClass} font-mono tracking-wide`}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <input
                    value={form.website}
                    onChange={e => update({ website: e.target.value })}
                    type="url"
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className={inputClass}
                    placeholder="e.g. www.yourcompany.com"
                  />
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">2. Location</h3>
                <div>
                  <label className={labelClass}>Address</label>
                  <input value={form.address} onChange={e => update({ address: e.target.value })} autoComplete="street-address" className={inputClass} placeholder="Street address" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>City</label>
                    <input value={form.city} onChange={e => update({ city: e.target.value })} autoComplete="address-level2" autoCapitalize="words" className={inputClass} placeholder="e.g. Pune" />
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
                  <input value={form.contactName} onChange={e => update({ contactName: e.target.value })} autoComplete="name" autoCapitalize="words" className={inputClass} placeholder="Recruiter / HR contact name" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Contact Email</label>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      value={form.contactEmail}
                      onChange={e => update({ contactEmail: e.target.value })}
                      aria-invalid={emailError ? true : undefined}
                      className={`${inputClass} ${emailError ? '!border-red-300' : ''}`}
                      placeholder="hr@company.com"
                    />
                    {emailError && <p className="auth-field__error mt-1.5 text-xs font-semibold text-red-600">{emailError}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Contact Phone</label>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.contactPhone}
                      onChange={e => update({ contactPhone: e.target.value.replace(/[^\d+\s-]/g, '').slice(0, 16) })}
                      aria-invalid={phoneError ? true : undefined}
                      className={`${inputClass} ${phoneError ? '!border-red-300' : ''}`}
                      placeholder="98765 43210"
                    />
                    {phoneError && <p className="auth-field__error mt-1.5 text-xs font-semibold text-red-600">{phoneError}</p>}
                  </div>
                </div>
                <p className="text-xs text-slate-500">Candidates do not see these details. Our team uses them to reach you.</p>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="ui-modal-footer bg-slate-50 p-4 pb-[max(16px,env(safe-area-inset-bottom))] border-t border-slate-200 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            {isFirstRun ? 'Skip for now' : 'Cancel'}
          </Button>
          <div className="flex items-center gap-2">
            {activeStep > 0 && (
              <Button variant="ghost" size="md" onClick={() => goStep(-1)} className="hidden sm:inline-flex">Back</Button>
            )}
            {/* Editing an existing profile: save from any step. First run: walk through all three. */}
            {!isFirstRun && activeStep < steps.length - 1 && (
              <Button variant="outline" size="md" onClick={handleSave} disabled={saving} loading={saving}>Save</Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button variant="secondary" size="md" onClick={() => goStep(1)}>Next Step</Button>
            ) : (
              <Button variant="success" size="md" onClick={handleSave} disabled={saving} loading={saving} className="gap-1.5 text-sm font-bold shadow-lg">
                {!saving && <CheckCircle size={16} />} {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
