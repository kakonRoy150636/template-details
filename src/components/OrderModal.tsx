import { useState } from 'react';
import { X, Send, CheckCircle, Loader2 } from 'lucide-react';
import type { Template } from '@/lib/types';

interface OrderModalProps {
  template: Template | null;
  open: boolean;
  onClose: () => void;
}

export function OrderModal({ template, open, onClose }: OrderModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open || !template) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName('');
        setPhone('');
        setMessage('');
        onClose();
      }, 2000);
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="animate-scale-in glass-card w-full max-w-md overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 p-4">
          <h2 className="font-heading flex items-center gap-2 text-lg font-bold text-white">
            <Send className="h-5 w-5 text-[var(--primary-accent)]" /> Order Submit
          </h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {success ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle className="mb-4 h-14 w-14 text-emerald-400" />
              <h3 className="mb-2 font-heading text-lg font-bold text-white">Order Received!</h3>
              <p className="text-sm text-slate-400">We will contact you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected template */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Selected Template</label>
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2.5">
                  <img src={template.thumbnail_url} alt={template.title} className="h-12 w-18 rounded-md object-cover" style={{ width: '72px' }} />
                  <div>
                    <div className="text-sm font-semibold text-white">{template.title}</div>
                    <div className="text-xs text-[var(--primary-accent)]">{template.price_bdt.toLocaleString()} BDT</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                  Your Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[var(--primary-accent)] focus:outline-none"
                  placeholder="যেমন: মো: রাশেদুল ইসলাম"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                  Mobile Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[var(--primary-accent)] focus:outline-none"
                  placeholder="017XXXXXXXX"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Message / Details (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[var(--primary-accent)] focus:outline-none"
                  placeholder={`I want to order "${template.title}" template.`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-neon btn-ripple flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" /> Confirm Order
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
