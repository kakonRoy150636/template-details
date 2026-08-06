import { ArrowLeft, Sparkles, Heart, BarChart3 } from 'lucide-react';
import type { ThemeConfig } from '@/lib/theme';

interface HeaderProps {
  theme: ThemeConfig;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenAnalytics: () => void;
}

export function Header({ theme, wishlistCount, onOpenWishlist, onOpenAnalytics }: HeaderProps) {
  return (
    <header
      className="relative z-10 px-4 pb-12 pt-20 sm:px-6"
      style={{ background: 'var(--header-gradient)' }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between">
          <a
            href="index.html"
            className="btn-glass inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm transition-all hover:translate-x-[-3px]"
          >
            <ArrowLeft className="h-4 w-4" /> হোমে ফিরে যান
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAnalytics}
              className="btn-glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
              title="Marketplace Analytics"
            >
              <BarChart3 className="h-4 w-4" /> <span className="hidden sm:inline">Analytics</span>
            </button>
            <button
              onClick={onOpenWishlist}
              className="btn-glass relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
              title="Wishlist"
            >
              <Heart className="h-4 w-4" /> <span className="hidden sm:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--primary-accent)] bg-[var(--surface-glass)] px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--primary-accent)] neon-glow">
            <span className="pulse-dot h-2 w-2 rounded-full bg-[var(--primary-accent)]" />
            {theme.badgeText}
          </div>
          <h1 className="font-heading mb-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {theme.title}
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-lg">
            {theme.subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}
