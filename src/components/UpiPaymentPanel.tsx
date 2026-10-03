import { useState } from 'react';
import { Smartphone, Copy, Check, ShieldCheck, HelpCircle, Info } from 'lucide-react';

export const UPI_VPA = '8422976666-2@ybl';
export const UPI_PAYEE_NAME = 'Pacific Jobs India Pvt Ltd';
export const GST_RATE = 0.18;

export function gstFor(base: number) {
  const gst = Math.round(base * GST_RATE);
  return { base, gst, total: base + gst };
}

function upiParams(amount: number, note: string) {
  const p = new URLSearchParams({ pa: UPI_VPA, pn: UPI_PAYEE_NAME, am: String(amount), cu: 'INR', tn: note });
  return p.toString();
}

/**
 * One button. upi://pay opens the phone's UPI app chooser (Google Pay, PhonePe, Paytm, BHIM, bank apps…)
 * with amount, payee and note already filled in.
 */
export function PayFromUpiButton({ amount, note }: { amount: number; note: string }) {
  const [hint, setHint] = useState<string | null>(null);
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const pay = () => {
    if (!isMobile) {
      setHint('To pay from a UPI app, open this page on your phone. On a computer, scan the QR code above with your phone.');
      return;
    }
    setHint('Opening your UPI app… choose the app you want to pay with.');
    window.location.href = 'upi://pay?' + upiParams(amount, note);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={pay}
        className="w-full h-12 rounded-xl bg-[var(--orange)] hover:bg-[#d94d1a] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 transition-colors"
      >
        <Smartphone size={17} /> Pay ₹{amount.toLocaleString()} from UPI app
      </button>
      {hint && (
        <p className="text-[11px] text-[var(--charcoal)] bg-[var(--bg-warm)] rounded-lg px-3 py-2 flex items-start gap-1.5 break-words">
          <Info size={12} className="mt-0.5 flex-shrink-0 text-[var(--orange)]" /> <span className="min-w-0">{hint}</span>
        </p>
      )}
    </div>
  );
}

export function PaymentBreakdown({ base, gst, total, label }: { base: number; gst: number; total: number; label: string }) {
  return (
    <div className="rounded-2xl border border-[var(--orange)]/20 overflow-hidden">
      <div className="px-4 py-3 bg-[var(--orange)]/5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--orange)]">Total to pay (incl. GST)</p>
        <p className="text-3xl font-extrabold text-[var(--navy)] mt-0.5">₹{total.toLocaleString()}</p>
        <p className="text-xs text-[var(--charcoal)] mt-0.5">{label}</p>
      </div>
      <div className="text-sm divide-y divide-[#EFEAE1]">
        <div className="flex justify-between px-4 py-2"><span className="text-[var(--charcoal)]">Base amount</span><span className="font-semibold text-[var(--navy)]">₹{base.toLocaleString()}</span></div>
        <div className="flex justify-between px-4 py-2"><span className="text-[var(--charcoal)]">GST @ 18%</span><span className="font-semibold text-[var(--navy)]">₹{gst.toLocaleString()}</span></div>
        <div className="flex justify-between px-4 py-2 font-bold"><span className="text-[var(--navy)]">Total</span><span className="text-[var(--orange)]">₹{total.toLocaleString()}</span></div>
      </div>
    </div>
  );
}

/** Where to find the UPI transaction ID — stacked layout so nothing can overflow the card. */
export function TransactionIdGuide() {
  const [open, setOpen] = useState(false);
  const steps = [
    'Open your UPI app and go to Payment history or Transactions.',
    'Tap the payment made to Pacific Jobs India Pvt. Ltd.',
    'Copy the UPI Ref No. / Transaction ID / UTR (usually a 12-digit number).',
    'Paste it in the box above. Do not use a different payment’s reference.',
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden min-w-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--navy)] min-w-0">
          <HelpCircle size={15} className="text-[var(--orange)] flex-shrink-0" />
          <span className="truncate">Where do I find the transaction ID?</span>
        </span>
        <span className="text-xs text-[var(--orange)] font-bold flex-shrink-0">{open ? 'Hide' : 'Show me'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 min-w-0">
          {/* Mock of a payment-success screen, highlighting the field */}
          <div className="mx-auto w-full max-w-[230px] rounded-2xl border border-slate-300 bg-white p-3 shadow-sm">
            <div className="flex flex-col items-center">
              <span className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check size={18} /></span>
              <p className="text-[12px] font-bold text-[var(--navy)] mt-1.5">Payment successful</p>
              <p className="text-[11px] text-slate-500">Paid to Pacific Jobs</p>
            </div>
            <div className="mt-3 rounded-lg bg-slate-50 p-2.5 space-y-1.5 text-[11px]">
              <div className="flex justify-between gap-2"><span className="text-slate-500">Amount</span><span className="font-semibold">₹590</span></div>
              <div className="flex justify-between gap-2"><span className="text-slate-500">Date</span><span>12 Sep 2026</span></div>
              <div className="rounded-md ring-2 ring-[var(--orange)] bg-[var(--orange)]/10 p-2">
                <p className="font-bold text-[var(--orange)] text-[10px] uppercase tracking-wide">UPI Ref / Transaction ID</p>
                <p className="font-mono font-bold text-[var(--navy)] text-[12px] break-all">412908716254</p>
              </div>
            </div>
          </div>

          <ol className="space-y-2">
            {steps.map((text, i) => (
              <li key={i} className="flex items-start gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-full bg-[var(--orange)] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span className="text-[13px] text-[var(--charcoal)] leading-snug break-words min-w-0">{text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export function CopyUpiId() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(UPI_VPA); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
      }}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--navy)] bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5"
    >
      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy UPI ID'}
    </button>
  );
}

export function isValidTxnId(v: string) {
  const t = v.trim();
  return t.length >= 8 && t.length <= 40 && /^[A-Za-z0-9-]+$/.test(t);
}

export function PaymentSteps({ step }: { step: 1 | 2 | 3 | 4 }) {
  const steps = ['Pay', 'Enter ID', 'Verification', 'Live'];
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1 min-w-0">
          <div className={`flex items-center gap-1.5 min-w-0 ${i + 1 <= step ? 'text-[var(--navy)]' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${i + 1 <= step ? 'bg-[var(--green)] text-white' : 'bg-slate-200 text-slate-500'}`}>
              {i + 1 < step ? <Check size={11} /> : i + 1}
            </span>
            <span className="text-[10px] font-semibold truncate">{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`flex-1 h-px mx-1.5 ${i + 1 < step ? 'bg-[var(--green)]' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  );
}

export function SecureNote({ text }: { text: string }) {
  return (
    <p className="text-[11px] text-[var(--charcoal)] flex items-start gap-1.5">
      <ShieldCheck size={12} className="mt-0.5 text-[var(--green)] flex-shrink-0" /> {text}
    </p>
  );
}
