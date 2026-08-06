import { useRef } from 'react';
import { Eye, ShoppingCart, Heart, GitCompare, Check, Sparkles } from 'lucide-react';
import type { Template } from '@/lib/types';
import { formatPrice } from '@/lib/theme';
import { PopularityBadges, PerformanceBadges } from './Badges';

interface TemplateCardProps {
  template: Template;
  index: number;
  wishlisted: boolean;
  comparing: boolean;
  compareFull: boolean;
  avgRating: number;
  reviewCount: number;
  onQuickView: (template: Template) => void;
  onToggleWishlist: (id: string) => void;
  onToggleCompare: (id: string) => void;
}

export function TemplateCard({
  template,
  index,
  wishlisted,
  comparing,
  compareFull,
  avgRating,
  reviewCount,
  onQuickView,
  onToggleWishlist,
  onToggleCompare,
}: TemplateCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mainCat, subCat] = template.category.split(':');

  function handleMouseMove(e: React.MouseEvent) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (card) card.style.transform = '';
  }

  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${(index % 3) * 80}ms`, opacity: 0 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="card-lift glass-card group relative flex h-full flex-col overflow-hidden rounded-2xl"
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-slate-900">
          <img
            src={template.thumbnail_url}
            alt={template.title}
            loading="lazy"
            className="img-zoom h-full w-full object-cover"
          />
          {/* Top badges */}
          <div className="absolute left-3 top-3 flex gap-2">
            <span className="gradient-accent rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--badge-text)] shadow-lg">
              {mainCat}
            </span>
            {template.is_new && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-1 text-xs font-bold text-cyan-300 backdrop-blur-sm">
                <Sparkles className="h-3 w-3" /> NEW
              </span>
            )}
          </div>

          {/* Wishlist + Compare buttons */}
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <button
              onClick={() => onToggleWishlist(template.id)}
              className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                wishlisted
                  ? 'bg-rose-500/90 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-black/40 text-white hover:bg-rose-500/80'
              }`}
              title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? 'fill-white' : ''}`} />
            </button>
            <button
              onClick={() => !compareFull && onToggleCompare(template.id)}
              disabled={compareFull && !comparing}
              className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all disabled:opacity-40 ${
                comparing
                  ? 'gradient-accent text-[var(--badge-text)] shadow-lg'
                  : 'bg-black/40 text-white hover:bg-white/20'
              }`}
              title={comparing ? 'Remove from compare' : compareFull ? 'Compare list full' : 'Add to compare'}
            >
              {comparing ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
            </button>
          </div>

          {/* Overlay quick view */}
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={() => onQuickView(template)}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              <Eye className="h-4 w-4" /> Quick View
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4">
          <span className="mb-2 inline-block w-fit rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--primary-accent)]">
            {subCat}
          </span>
          <h5 className="mb-1.5 font-heading text-lg font-bold text-white">{template.title}</h5>
          <p className="mb-3 line-clamp-2 text-sm text-slate-400">
            {template.description}
          </p>

          {/* Rating */}
          <div className="mb-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  className={`h-3.5 w-3.5 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-700'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.572-.955L10 0l2.938 5.955 6.572.955-4.755 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-xs font-semibold text-amber-400">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-slate-500">({reviewCount})</span>
          </div>

          <div className="mb-3">
            <PopularityBadges template={template} compact />
          </div>

          {/* Performance badges */}
          <div className="mb-4">
            <PerformanceBadges template={template} />
          </div>

          {/* Price + Actions */}
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/5 pt-4">
            <div>
              <span className="font-heading text-xl font-bold gradient-accent-text">
                {formatPrice(template.price_bdt)}
              </span>
            </div>
            <div className="flex gap-2">
              <a
                href={template.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glass btn-ripple inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm"
              >
                <Eye className="h-4 w-4" /> Demo
              </a>
              <button
                onClick={() => onQuickView(template)}
                className="btn-neon btn-ripple inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm"
              >
                <ShoppingCart className="h-4 w-4" /> Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
