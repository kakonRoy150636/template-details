import { Clock } from 'lucide-react';
import type { Template } from '@/lib/types';
import { formatPrice } from '@/lib/theme';

interface RecentlyViewedProps {
  templates: Template[];
  onSelect: (template: Template) => void;
}

export function RecentlyViewed({ templates, onSelect }: RecentlyViewedProps) {
  if (templates.length === 0) return null;

  return (
    <section className="relative z-10 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          <h2 className="font-heading text-xl font-bold text-white">Recently Viewed</h2>
        </div>
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {templates.map((t) => {
            const [, subCat] = t.category.split(':');
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t)}
                className="group flex w-64 flex-shrink-0 flex-col overflow-hidden rounded-xl border border-white/8 bg-white/3 text-left transition-all hover:border-[var(--primary-accent)]/40 hover:bg-white/5"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={t.thumbnail_url}
                    alt={t.title}
                    className="img-zoom h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h4 className="mb-1 line-clamp-1 text-sm font-semibold text-white">{t.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase text-slate-500">{subCat}</span>
                    <span className="text-sm font-bold gradient-accent-text">{formatPrice(t.price_bdt)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
