import { Star, Eye, Heart, ShoppingBag, Flame } from 'lucide-react';
import type { Template } from '@/lib/types';

export function PopularityBadges({ template, compact }: { template: Template; compact?: boolean }) {
  const size = compact ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const textSize = compact ? 'text-[10px]' : 'text-xs';
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      {template.trending && (
        <span className={`inline-flex items-center gap-1 ${textSize} font-semibold text-orange-400`}>
          <Flame className={`${size}`} /> Trending
        </span>
      )}
      <span className={`inline-flex items-center gap-1 ${textSize} text-slate-400`}>
        <Eye className={`${size}`} /> {formatCompact(template.popularity)}
      </span>
      <span className={`inline-flex items-center gap-1 ${textSize} text-slate-400`}>
        <Heart className={`${size}`} /> {template.wishlist_count}
      </span>
      <span className={`inline-flex items-center gap-1 ${textSize} text-slate-400`}>
        <ShoppingBag className={`${size}`} /> {template.orders_count}
      </span>
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function StarRating({
  rating,
  size = 'h-4 w-4',
}: {
  rating: number;
  size?: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-700 text-slate-700'
          }`}
        />
      ))}
    </div>
  );
}

export function PerformanceBadges({ template }: { template: Template }) {
  const scores = [
    { label: 'SEO', value: template.seo_score },
    { label: 'Perf', value: template.speed_score },
    { label: 'A11y', value: template.accessibility_score },
    { label: 'Mobile', value: template.mobile_score },
  ];

  function colorFor(score: number): string {
    if (score >= 95) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 85) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  }

  return (
    <div className="flex flex-wrap gap-2">
      {scores.map((s) => (
        <span
          key={s.label}
          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold ${colorFor(s.value)}`}
        >
          {s.label} {s.value}
        </span>
      ))}
    </div>
  );
}
