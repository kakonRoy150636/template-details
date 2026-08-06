import { Heart, ShoppingBag } from 'lucide-react';
import type { Template } from '@/lib/types';
import { formatPrice, getMatchPercentageColor } from '@/lib/theme';

interface RecommendationCardProps {
  template: Template;
  matchPercentage: number;
  onClick: () => void;
}

export function RecommendationCard({ template, matchPercentage, onClick }: RecommendationCardProps) {
  const [, subCat] = template.category.split(':');

  return (
    <button
      onClick={onClick}
      className="group flex w-56 flex-shrink-0 overflow-hidden rounded-xl border border-white/8 bg-white/3 text-left transition-all hover:border-[var(--primary-accent)]/40 hover:bg-white/5"
    >
      {/* Thumbnail */}
      <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden bg-slate-900">
        <img src={template.thumbnail_url} alt={template.title} className="img-zoom h-full w-full object-cover" />
      </div>
      {/* Info */}
      <div className="flex flex-1 flex-col p-2.5">
        <span className={`text-xs font-bold ${getMatchPercentageColor(matchPercentage)}`}>
          {matchPercentage}% Match
        </span>
        <h5 className="mt-0.5 line-clamp-1 text-sm font-semibold text-white">{template.title}</h5>
        <span className="text-[10px] uppercase text-slate-500">{subCat}</span>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs font-bold gradient-accent-text">{formatPrice(template.price_bdt)}</span>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-0.5">
              <Heart className="h-2.5 w-2.5" /> {template.wishlist_count}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <ShoppingBag className="h-2.5 w-2.5" /> {template.orders_count}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
