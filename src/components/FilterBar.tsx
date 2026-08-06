import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import {
  CATEGORIES,
  PACKAGES,
  TECHNOLOGIES,
  COLOR_THEMES,
  SORT_OPTIONS,
} from '@/lib/theme';

export interface FilterState {
  category: string;
  search: string;
  package: string;
  technology: string;
  colorTheme: string;
  minPrice: number;
  maxPrice: number;
  sort: string;
}

export const defaultFilters: FilterState = {
  category: 'all',
  search: '',
  package: 'all',
  technology: 'all',
  colorTheme: 'all',
  minPrice: 0,
  maxPrice: 10000,
  sort: 'popular',
};

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
}

export function FilterBar({ filters, onChange, resultCount }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeBadges: { label: string; onClear: () => void }[] = [];
  if (filters.category !== 'all')
    activeBadges.push({
      label: CATEGORIES.find((c) => c.value === filters.category)?.label || filters.category,
      onClear: () => onChange({ ...filters, category: 'all' }),
    });
  if (filters.package !== 'all')
    activeBadges.push({
      label: PACKAGES.find((c) => c.value === filters.package)?.label || filters.package,
      onClear: () => onChange({ ...filters, package: 'all' }),
    });
  if (filters.technology !== 'all')
    activeBadges.push({
      label: TECHNOLOGIES.find((c) => c.value === filters.technology)?.label || filters.technology,
      onClear: () => onChange({ ...filters, technology: 'all' }),
    });
  if (filters.colorTheme !== 'all')
    activeBadges.push({
      label: COLOR_THEMES.find((c) => c.value === filters.colorTheme)?.label || filters.colorTheme,
      onClear: () => onChange({ ...filters, colorTheme: 'all' }),
    });
  if (filters.maxPrice < 10000)
    activeBadges.push({
      label: `Under ${filters.maxPrice} BDT`,
      onClear: () => onChange({ ...filters, maxPrice: 10000 }),
    });
  if (filters.search)
    activeBadges.push({
      label: `"${filters.search}"`,
      onClear: () => onChange({ ...filters, search: '' }),
    });

  return (
    <div className="sticky top-0 z-40 border-b border-white/8 bg-[#07090e]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        {/* Row 1: Categories + Search + Advanced toggle */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Category pills */}
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => onChange({ ...filters, category: cat.value })}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  filters.category === cat.value
                    ? 'gradient-accent font-bold text-[var(--badge-text)] neon-glow'
                    : 'btn-glass text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative lg:w-72">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="টেমপ্লেট খুঁজুন..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 transition-all focus:border-[var(--primary-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-glow)]"
            />
          </div>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
              showAdvanced ? 'gradient-accent text-[var(--badge-text)]' : 'btn-glass text-slate-300'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Row 2: Advanced filters */}
        {showAdvanced && (
          <div className="animate-slide-up mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <FilterSelect
              label="Package"
              value={filters.package}
              options={PACKAGES}
              onChange={(v) => onChange({ ...filters, package: v })}
            />
            <FilterSelect
              label="Technology"
              value={filters.technology}
              options={TECHNOLOGIES}
              onChange={(v) => onChange({ ...filters, technology: v })}
            />
            <FilterSelect
              label="Color Theme"
              value={filters.colorTheme}
              options={COLOR_THEMES}
              onChange={(v) => onChange({ ...filters, colorTheme: v })}
            />
            <FilterSelect
              label="Sort By"
              value={filters.sort}
              options={SORT_OPTIONS}
              onChange={(v) => onChange({ ...filters, sort: v })}
            />
            {/* Price range */}
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                Max Price: {filters.maxPrice.toLocaleString()} BDT
              </label>
              <input
                type="range"
                min={0}
                max={10000}
                step={500}
                value={filters.maxPrice}
                onChange={(e) => onChange({ ...filters, maxPrice: parseInt(e.target.value, 10) })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Active filter badges + result count */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">{resultCount} templates</span>
          {activeBadges.length > 0 && <span className="text-slate-600">•</span>}
          {activeBadges.map((badge, i) => (
            <button
              key={i}
              onClick={badge.onClear}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary-accent)]/30 bg-[var(--primary-glow)]/10 px-2.5 py-1 text-xs font-medium text-[var(--primary-accent)] transition-all hover:bg-[var(--primary-glow)]/20"
            >
              {badge.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          {activeBadges.length > 1 && (
            <button
              onClick={() => onChange(defaultFilters)}
              className="text-xs font-medium text-slate-500 underline hover:text-slate-300"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-all focus:border-[var(--primary-accent)] focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
