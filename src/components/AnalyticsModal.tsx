import { useMemo } from 'react';
import {
  X,
  BarChart3,
  Eye,
  Heart,
  ShoppingBag,
  GitCompare,
  TrendingUp,
  Flame,
} from 'lucide-react';
import type { Template, Review } from '@/lib/types';

interface AnalyticsModalProps {
  open: boolean;
  templates: Template[];
  reviews: Review[];
  compareIds: string[];
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

export function AnalyticsModal({
  open,
  templates,
  reviews,
  compareIds,
  onClose,
  onSelectTemplate,
}: AnalyticsModalProps) {
  const stats = useMemo(() => {
    const totalViews = templates.reduce((s, t) => s + t.popularity, 0);
    const totalWishlist = templates.reduce((s, t) => s + t.wishlist_count, 0);
    const totalOrders = templates.reduce((s, t) => s + t.orders_count, 0);
    const totalCompares = compareIds.length;

    const mostViewed = [...templates].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
    const mostWishlisted = [...templates].sort((a, b) => b.wishlist_count - a.wishlist_count).slice(0, 5);
    const mostOrdered = [...templates].sort((a, b) => b.orders_count - a.orders_count).slice(0, 5);

    // Top categories
    const catMap: Record<string, number> = {};
    templates.forEach((t) => {
      const [, sub] = t.category.split(':');
      catMap[sub] = (catMap[sub] || 0) + t.popularity;
    });
    const topCategories = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Trending
    const trending = templates.filter((t) => t.trending);

    return {
      totalViews,
      totalWishlist,
      totalOrders,
      totalCompares,
      mostViewed,
      mostWishlisted,
      mostOrdered,
      topCategories,
      trending,
    };
  }, [templates, compareIds]);

  if (!open) return null;

  const statCards = [
    { icon: Eye, label: 'Total Views', value: stats.totalViews, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Heart, label: 'Wishlist Saves', value: stats.totalWishlist, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: GitCompare, label: 'Comparisons', value: stats.totalCompares, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const maxCatValue = Math.max(...stats.topCategories.map((c) => c[1]), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div
        className="animate-scale-in glass-card flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 p-4 sm:p-5">
          <h2 className="font-heading flex items-center gap-2 text-xl font-bold text-white">
            <BarChart3 className="h-5 w-5 text-[var(--primary-accent)]" /> Marketplace Analytics
          </h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-5">
          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statCards.map((stat) => (
              <div key={stat.label} className="glass-surface rounded-xl p-4">
                <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                </div>
                <div className="font-heading text-2xl font-bold text-white">{stat.value.toLocaleString()}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Top categories bar chart */}
          {stats.topCategories.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp className="h-4 w-4 text-[var(--primary-accent)]" /> Top Categories
              </h3>
              <div className="space-y-2">
                {stats.topCategories.map(([cat, value]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="w-24 flex-shrink-0 text-xs font-medium capitalize text-slate-300">{cat}</span>
                    <div className="h-6 flex-1 overflow-hidden rounded-lg bg-white/5">
                      <div
                        className="gradient-accent h-full rounded-lg transition-all"
                        style={{ width: `${(value / maxCatValue) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 flex-shrink-0 text-right text-xs font-semibold text-slate-400">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top lists */}
          <div className="grid gap-4 lg:grid-cols-3">
            <TopList
              title="Most Viewed"
              icon={Eye}
              iconColor="text-blue-400"
              templates={stats.mostViewed}
              metric={(t) => t.popularity}
              metricLabel="views"
              onSelectTemplate={onSelectTemplate}
            />
            <TopList
              title="Most Wishlisted"
              icon={Heart}
              iconColor="text-rose-400"
              templates={stats.mostWishlisted}
              metric={(t) => t.wishlist_count}
              metricLabel="saves"
              onSelectTemplate={onSelectTemplate}
            />
            <TopList
              title="Most Ordered"
              icon={ShoppingBag}
              iconColor="text-emerald-400"
              templates={stats.mostOrdered}
              metric={(t) => t.orders_count}
              metricLabel="orders"
              onSelectTemplate={onSelectTemplate}
            />
          </div>

          {/* Trending */}
          {stats.trending.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <Flame className="h-4 w-4 text-orange-400" /> Trending Now
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats.trending.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTemplate(t)}
                    className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-300 transition-all hover:bg-orange-500/20"
                  >
                    <Flame className="h-3 w-3" /> {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TopList({
  title,
  icon: Icon,
  iconColor,
  templates,
  metric,
  metricLabel,
  onSelectTemplate,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  templates: Template[];
  metric: (t: Template) => number;
  metricLabel: string;
  onSelectTemplate: (t: Template) => void;
}) {
  return (
    <div className="glass-surface rounded-xl p-4">
      <h4 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} /> {title}
      </h4>
      <div className="space-y-2">
        {templates.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onSelectTemplate(t)}
            className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-all hover:bg-white/5"
          >
            <span className="text-xs font-bold text-slate-600">#{i + 1}</span>
            <img src={t.thumbnail_url} alt={t.title} className="h-8 w-12 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <div className="truncate text-xs font-medium text-white">{t.title}</div>
              <div className={`text-[10px] ${iconColor}`}>{metric(t)} {metricLabel}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
