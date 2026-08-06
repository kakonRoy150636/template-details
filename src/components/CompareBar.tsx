import { GitCompare, X, ArrowRight } from 'lucide-react';
import type { Template } from '@/lib/types';

interface CompareBarProps {
  templates: Template[];
  onOpen: () => void;
  onRemove: (id: string) => void;
}

export function CompareBar({ templates, onOpen, onRemove }: CompareBarProps) {
  if (templates.length === 0) return null;

  return (
    <div className="animate-slide-in-up fixed bottom-4 left-1/2 z-40 w-[95%] max-w-3xl -translate-x-1/2">
      <div className="glass-card flex items-center gap-3 rounded-2xl p-3 shadow-2xl">
        {/* Compare icon */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl gradient-accent">
          <GitCompare className="h-5 w-5 text-[var(--badge-text)]" />
        </div>

        {/* Selected templates */}
        <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
          {templates.map((t) => (
            <div
              key={t.id}
              className="group relative flex flex-shrink-0 items-center gap-2 rounded-xl border border-white/8 bg-white/5 p-1.5 pr-3"
            >
              <img src={t.thumbnail_url} alt={t.title} className="h-8 w-12 rounded-md object-cover" />
              <span className="max-w-[100px] truncate text-xs font-medium text-white">{t.title}</span>
              <button
                onClick={() => onRemove(t.id)}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/80 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: 4 - templates.length }).map((_, i) => (
            <div
              key={i}
              className="flex h-[52px] w-[120px] flex-shrink-0 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-slate-600"
            >
              Add more
            </div>
          ))}
        </div>

        {/* Compare button */}
        <button
          onClick={onOpen}
          disabled={templates.length < 2}
          className="btn-neon btn-ripple flex flex-shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm disabled:opacity-50"
        >
          Compare Now <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
