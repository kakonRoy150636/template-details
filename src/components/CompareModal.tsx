import { useState } from 'react';
import {
  X,
  GitCompare,
  Trophy,
  Zap,
  Star,
  Target,
  FileDown,
  Share2,
  Check,
} from 'lucide-react';
import type { Template } from '@/lib/types';
import { formatPrice } from '@/lib/theme';
import { PerformanceBadges } from './Badges';

interface CompareModalProps {
  templates: Template[];
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function CompareModal({ templates, open, onClose, onRemove, onClear }: CompareModalProps) {
  if (!open) return null;

  // Compute "best" for each metric
  const bestValueIdx = templates.indexOf(
    templates.reduce((best, t) => (t.price_bdt < best.price_bdt ? t : best), templates[0])
  );
  const fastestIdx = templates.indexOf(
    templates.reduce((best, t) => (t.speed_score > best.speed_score ? t : best), templates[0])
  );
  const popularIdx = templates.indexOf(
    templates.reduce((best, t) => (t.popularity > best.popularity ? t : best), templates[0])
  );
  const recommendedIdx = templates.indexOf(
    templates.reduce(
      (best, t) =>
        t.seo_score + t.mobile_score + t.speed_score > best.seo_score + best.mobile_score + best.speed_score
          ? t
          : best,
      templates[0]
    )
  );

  const awards = [
    { icon: Trophy, label: 'Best Value', idx: bestValueIdx, color: 'text-amber-400' },
    { icon: Zap, label: 'Fastest', idx: fastestIdx, color: 'text-blue-400' },
    { icon: Star, label: 'Most Popular', idx: popularIdx, color: 'text-orange-400' },
    { icon: Target, label: 'Recommended', idx: recommendedIdx, color: 'text-emerald-400' },
  ];

  const rows: { label: string; getValue: (t: Template) => string | number }[] = [
    { label: 'Price', getValue: (t) => formatPrice(t.price_bdt) },
    { label: 'Package', getValue: (t) => t.package },
    { label: 'Technology', getValue: (t) => t.technology.toUpperCase() },
    { label: 'Pages', getValue: (t) => t.pages },
    { label: 'Animation Level', getValue: (t) => `${t.animation_level}/5` },
    { label: 'Customization', getValue: (t) => `${t.customization_level}/5` },
    { label: 'SEO Score', getValue: (t) => t.seo_score },
    { label: 'Mobile Score', getValue: (t) => t.mobile_score },
    { label: 'Speed Score', getValue: (t) => t.speed_score },
    { label: 'Accessibility', getValue: (t) => t.accessibility_score },
    { label: 'Features Count', getValue: (t) => t.features.length },
    { label: 'Orders', getValue: (t) => t.orders_count },
    { label: 'Wishlist Saves', getValue: (t) => t.wishlist_count },
  ];

  function handleExport() {
    // Generate a simple printable comparison
    const win = window.open('', '_blank');
    if (!win) return;
    const html = generateComparisonHTML(templates, rows);
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  function handleShare() {
    const ids = templates.map((t) => t.id).join(',');
    const url = `${window.location.origin}${window.location.pathname}?compare=${ids}`;
    navigator.clipboard.writeText(url).then(() => {
      // Could show a toast; for now we just copy
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div
        className="animate-scale-in glass-card flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 p-4 sm:p-5">
          <h2 className="font-heading flex items-center gap-2 text-xl font-bold text-white">
            <GitCompare className="h-5 w-5 text-[var(--primary-accent)]" /> Template Comparison
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="btn-glass inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm">
              <FileDown className="h-4 w-4" /> <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button onClick={handleShare} className="btn-glass inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm">
              <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Share</span>
            </button>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto p-4 sm:p-5">
          {templates.length === 0 ? (
            <p className="py-12 text-center text-slate-400">Add templates to compare.</p>
          ) : (
            <>
              {/* Award badges */}
              <div className="mb-5 flex flex-wrap gap-3">
                {awards.map((award) => {
                  const t = templates[award.idx];
                  if (!t) return null;
                  return (
                    <div
                      key={award.label}
                      className={`glass-surface flex items-center gap-2 rounded-xl px-3 py-2 ${award.color}`}
                    >
                      <award.icon className="h-4 w-4" />
                      <div>
                        <div className="text-xs font-bold">{award.label}</div>
                        <div className="text-xs text-slate-400">{t.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comparison table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-[#0e1421] p-3 text-left text-xs font-bold uppercase text-slate-400">
                        Template
                      </th>
                      {templates.map((t) => (
                        <th key={t.id} className="min-w-[180px] p-3 text-center">
                          <div className="relative">
                            <button
                              onClick={() => onRemove(t.id)}
                              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/80 text-white hover:bg-rose-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <img src={t.thumbnail_url} alt={t.title} className="mx-auto mb-2 h-20 w-32 rounded-lg object-cover" />
                            <h5 className="font-heading text-sm font-bold text-white">{t.title}</h5>
                            <span className="text-xs text-slate-500">{t.category.split(':')[1]}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIdx) => (
                      <tr key={row.label} className={rowIdx % 2 === 0 ? 'bg-white/2' : ''}>
                        <td className="sticky left-0 z-10 bg-[#0e1421] p-3 text-xs font-semibold text-slate-400">
                          {row.label}
                        </td>
                        {templates.map((t) => (
                          <td key={t.id} className="p-3 text-center text-sm text-white">
                            {row.getValue(t)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* Performance badges row */}
                    <tr>
                      <td className="sticky left-0 z-10 bg-[#0e1421] p-3 text-xs font-semibold text-slate-400">
                        Performance
                      </td>
                      {templates.map((t) => (
                        <td key={t.id} className="p-3">
                          <div className="flex flex-wrap justify-center gap-1">
                            <PerformanceBadges template={t} />
                          </div>
                        </td>
                      ))}
                    </tr>
                    {/* Features row */}
                    <tr>
                      <td className="sticky left-0 z-10 bg-[#0e1421] p-3 text-xs font-semibold text-slate-400">
                        Key Features
                      </td>
                      {templates.map((t) => (
                        <td key={t.id} className="p-3">
                          <ul className="space-y-1 text-left">
                            {t.features.slice(0, 4).map((f) => (
                              <li key={f} className="flex items-start gap-1.5 text-xs text-slate-300">
                                <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" /> {f}
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <button onClick={onClear} className="text-sm text-slate-500 underline hover:text-rose-400">
                  Clear all comparisons
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function generateComparisonHTML(
  templates: Template[],
  rows: { label: string; getValue: (t: Template) => string | number }[]
): string {
  const rowsHtml = rows
    .map(
      (row) => `<tr><td style="padding:8px;font-weight:600;border:1px solid #ddd">${row.label}</td>${templates
        .map((t) => `<td style="padding:8px;text-align:center;border:1px solid #ddd">${row.getValue(t)}</td>`)
        .join('')}</tr>`
    )
    .join('');

  return `<!DOCTYPE html><html><head><title>KROY Template Comparison</title>
    <style>body{font-family:Arial,sans-serif;padding:20px}h1{color:#10b981}table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#f0fdf4;padding:8px}</style>
    </head><body><h1>KROY Marketplace — Template Comparison</h1>
    <table><thead><tr><th>Template</th>${templates
      .map((t) => `<th>${t.title}</th>`)
      .join('')}</tr></thead><tbody>${rowsHtml}</tbody></table>
    </body></html>`;
}
