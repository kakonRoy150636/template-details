export type ThemeType = 'regular' | 'standard' | 'premium';

export interface ThemeConfig {
  type: ThemeType;
  badgeText: string;
  title: string;
  subtitle: string;
}

export function getThemeFromUrl(): ThemeType {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  if (type === 'standard') return 'standard';
  if (type === 'premium') return 'premium';
  return 'regular';
}

export function getThemeConfig(type: ThemeType): ThemeConfig {
  switch (type) {
    case 'premium':
      return {
        type: 'premium',
        badgeText: 'Premium Collection',
        title: 'আমাদের প্রিমিয়াম টেমপ্লেট সমূহ',
        subtitle: 'অ্যাডভান্সড ফিচার ও লাক্সারি অ্যানিমেশন সমৃদ্ধ সম্পূর্ণ প্রিমিয়াম কাস্টমাইজড টেমপ্লেট।',
      };
    case 'standard':
      return {
        type: 'standard',
        badgeText: 'Standard Collection',
        title: 'আমাদের স্ট্যান্ডার্ড টেমপ্লেট সমূহ',
        subtitle: 'আপনার ব্যবসা ও সেলস বৃদ্ধিতে কনভার্সন-ফোকাসড প্রফেশনাল স্ট্যান্ডার্ড লেআউট।',
      };
    default:
      return {
        type: 'regular',
        badgeText: 'Regular Collection',
        title: 'আমাদের রেগুলার টেমপ্লেট সমূহ',
        subtitle: 'যেকোনো ব্যক্তিগত ওয়েবসাইট বা ছোট প্রজেক্টের জন্য সাশ্রয়ী রেগুলার টেমপ্লেট।',
      };
  }
}

export const CATEGORIES = [
  { value: 'all', label: 'সব টেমপ্লেট' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'for bf/gf', label: 'For BF/GF' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'e-commerce', label: 'E-commerce' },
  { value: 'business', label: 'Business' },
];

export const PACKAGES = [
  { value: 'all', label: 'All Packages' },
  { value: 'regular', label: 'Regular' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
];

export const TECHNOLOGIES = [
  { value: 'all', label: 'All Tech' },
  { value: 'html', label: 'HTML' },
  { value: 'react', label: 'React' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'wordpress', label: 'WordPress' },
];

export const COLOR_THEMES = [
  { value: 'all', label: 'All Themes' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'luxury-gold', label: 'Luxury Gold' },
  { value: 'blue', label: 'Blue' },
  { value: 'minimal', label: 'Minimal' },
];

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'lowest-price', label: 'Lowest Price' },
  { value: 'highest-price', label: 'Highest Price' },
];

export function formatPrice(bdt: number): string {
  return `${bdt.toLocaleString()} BDT`;
}

export function getMatchPercentageColor(match: number): string {
  if (match >= 90) return 'text-emerald-400';
  if (match >= 75) return 'text-blue-400';
  if (match >= 60) return 'text-amber-400';
  return 'text-slate-400';
}

export function getScoreColor(score: number): string {
  if (score >= 95) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (score >= 85) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
}
