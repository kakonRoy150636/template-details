import { X, Heart, Trash2, Eye, ShoppingCart, Clock } from 'lucide-react';
import type { Template } from '@/lib/types';
import { formatPrice } from '@/lib/theme';

interface WishlistDrawerProps {
  open: boolean;
  templates: Template[];
  recentTemplates: Template[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onQuickView: (template: Template) => void;
  onSelectRecent: (template: Template) => void;
}

export function WishlistDrawer({
  open,
  templates,
  recentTemplates,
  onClose,
  onRemove,
  onQuickView,
  onSelectRecent,
}: WishlistDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="animate-slide-in-right fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col glass-card border-l border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 p-4">
          <h2 className="font-heading flex items-center gap-2 text-lg font-bold text-white">
            <Heart className="h-5 w-5 text-rose-400" /> Wishlist
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-sm text-rose-300">
              {templates.length}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Heart className="mb-4 h-12 w-12 text-slate-600" />
              <h3 className="mb-2 font-heading text-lg font-bold text-white">No saved templates yet</h3>
              <p className="text-sm text-slate-400">
                Tap the heart icon on any template to save it here for later.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Heart className="h-3.5 w-3.5 text-rose-400" /> Saved Templates
              </div>
              <div className="space-y-3">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className="group glass-surface flex gap-3 rounded-xl p-2.5 transition-all hover:border-[var(--primary-accent)]/30"
                  >
                    <img
                      src={t.thumbnail_url}
                      alt={t.title}
                      className="h-16 w-24 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <h4 className="text-sm font-semibold text-white">{t.title}</h4>
                      <span className="text-xs text-slate-500">{t.category.split(':')[1]}</span>
                      <span className="mt-1 text-sm font-bold gradient-accent-text">
                        {formatPrice(t.price_bdt)}
                      </span>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => onQuickView(t)}
                          className="btn-glass inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs"
                        >
                          <Eye className="h-3 w-3" /> View
                        </button>
                        <button
                          onClick={() => onQuickView(t)}
                          className="btn-neon inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs"
                        >
                          <ShoppingCart className="h-3 w-3" /> Order
                        </button>
                        <button
                          onClick={() => onRemove(t.id)}
                          className="ml-auto inline-flex items-center justify-center rounded-md px-2 py-1.5 text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Recently viewed */}
          {recentTemplates.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Clock className="h-3.5 w-3.5 text-blue-400" /> Recently Viewed
              </div>
              <div className="space-y-2">
                {recentTemplates.slice(0, 5).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectRecent(t)}
                    className="group flex w-full items-center gap-3 rounded-lg border border-white/5 bg-white/3 p-2 text-left transition-all hover:border-white/10 hover:bg-white/5"
                  >
                    <img src={t.thumbnail_url} alt={t.title} className="h-10 w-16 rounded-md object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate text-sm font-medium text-white">{t.title}</h4>
                      <span className="text-xs text-slate-500">{t.category.split(':')[1]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
