import { useState } from 'react';
import { CheckCircle2, PhoneCall, Clock, FileText, Mail, XCircle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { gstFor } from './UpiPaymentPanel';

const STATUS_COPY: Record<string, { title: string; body: string; tone: 'info' | 'progress' | 'done' | 'cancel' }> = {
  pending: {
    title: 'Request received — awaiting confirmation',
    body: 'Thank you! Your payment has been recorded. Our team will call you within 2–4 hours to confirm your hiring requirement. Verified resumes will be sent to your registered email soon after.',
    tone: 'info',
  },
  processing: {
    title: 'Confirmed — we are sourcing your candidates',
    body: 'Our team is shortlisting and verifying candidates for you. As each one is ready it appears under "CVs from Rojgaar Hai" on this dashboard, where you can open the resume and tell us who to arrange.',
    tone: 'progress',
  },
  delivered: {
    title: 'Delivered — your verified CVs are ready',
    body: 'Find them under "CVs from Rojgaar Hai" on this dashboard. Open each resume and mark who you want to meet. Need more profiles? Write to support@rojgaarhai.com.',
    tone: 'done',
  },
  cancelled: {
    title: 'Request cancelled',
    body: 'This CV request was cancelled. If this is unexpected, please contact support@rojgaarhai.com or call +91-8422976666.',
    tone: 'cancel',
  },
};

const TONE_CLS = {
  info: 'bg-[#F2F5FB] border-[#D6DEEE]',
  progress: 'bg-[var(--orange)]/5 border-[var(--orange)]/25',
  done: 'bg-[var(--green)]/5 border-[var(--green)]/25',
  cancel: 'bg-red-50 border-red-200',
};

const STEPS = ['Requested', 'Confirmed', 'Delivered'];

function stepIndex(status: string) {
  if (status === 'delivered') return 3;
  if (status === 'processing') return 2;
  return 1;
}

/**
 * Compact by default: status, plan and total. "Show details" opens the full
 * explanation, progress steps, payment breakdown and transaction ID.
 */
export default function CvRequestStatusCard({ req }: { req: any }) {
  const [open, setOpen] = useState(false);
  const copy = STATUS_COPY[req.status] || STATUS_COPY.pending;
  const { base, gst, total } = gstFor(Number(req.amount || 0));
  const idx = stepIndex(req.status);
  // "10 Verified CVs · 10 verified CVs" reads twice; only add the count when the plan name lacks it
  const planText = String(req.plan_label || '').match(/\d/) ? req.plan_label : `${req.plan_label} · ${req.cv_count} verified CVs`;
  const paid = req.payment_status === 'paid';
  const Icon = copy.tone === 'done' ? CheckCircle2 : copy.tone === 'cancel' ? XCircle : copy.tone === 'progress' ? PhoneCall : Clock;

  return (
    <div className={`rounded-2xl border p-4 ${TONE_CLS[copy.tone]}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-white border border-[#E7E2D9] flex items-center justify-center text-[var(--navy)] flex-shrink-0">
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-[var(--navy)] break-words">{copy.title}</p>
          <p className="text-xs text-[var(--charcoal)] mt-1 break-words">
            {planText} · <span className="font-bold text-[var(--navy)] tabular-nums">₹{total.toLocaleString('en-IN')}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1 min-h-[32px] text-xs font-bold text-[var(--orange)] hover:underline"
      >
        {open ? <>Hide details <ChevronUp size={14} /></> : <>Show details <ChevronDown size={14} /></>}
      </button>

      {open && (
        <div className="mt-3 space-y-4 dash-enter">
          <p className="text-xs text-[var(--charcoal)] leading-relaxed">{copy.body}</p>

          {req.status !== 'cancelled' && (
            <div className="flex items-center gap-1.5">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${i + 1 <= idx ? 'bg-[var(--green)] text-white' : 'bg-white border border-[#D8D2C6] text-slate-400'}`}>
                      {i + 1 < idx || (i + 1 === idx && req.status === 'delivered') ? <CheckCircle2 size={12} /> : i + 1}
                    </span>
                    <span className={`text-[10px] font-semibold truncate ${i + 1 <= idx ? 'text-[var(--navy)]' : 'text-slate-400'}`}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-1.5 ${i + 1 < idx ? 'bg-[var(--green)]' : 'bg-[#D8D2C6]'}`} />}
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl bg-white border border-[#E7E2D9] overflow-hidden">
            <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#EFEAE1]">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><FileText size={11} /> Plan purchased</p>
                <p className="text-sm font-bold text-[var(--navy)] break-words">{planText}</p>
              </div>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${paid ? 'text-[var(--green)] bg-[var(--green)]/10' : 'text-amber-700 bg-amber-50'}`}>
                {paid ? <ShieldCheck size={12} /> : <Clock size={12} />} {paid ? 'Payment received' : 'Payment pending'}
              </span>
            </div>
            <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div><p className="text-slate-400">Base amount</p><p className="font-semibold text-[var(--navy)] tabular-nums">₹{base.toLocaleString('en-IN')}</p></div>
              <div><p className="text-slate-400">GST (18%)</p><p className="font-semibold text-[var(--navy)] tabular-nums">₹{gst.toLocaleString('en-IN')}</p></div>
              <div><p className="text-slate-400">{paid ? 'Total paid' : 'Total due'}</p><p className="font-extrabold text-[var(--orange)] tabular-nums">₹{total.toLocaleString('en-IN')}</p></div>
              <div className="min-w-0"><p className="text-slate-400">Transaction ID</p><p className="font-mono font-semibold text-[var(--navy)] break-all">{req.upi_transaction_id || '—'}</p></div>
              <div><p className="text-slate-400">Requested on</p><p className="font-semibold text-[var(--navy)]">{new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
              {req.delivered_at && <div><p className="text-slate-400">Delivered on</p><p className="font-semibold text-[var(--navy)]">{new Date(req.delivered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>}
            </div>
          </div>

          {req.status !== 'delivered' && req.status !== 'cancelled' && (
            <p className="text-[11px] text-[var(--charcoal)] flex items-center gap-1.5">
              <Mail size={12} /> This card stays here until your resumes are marked as delivered.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
