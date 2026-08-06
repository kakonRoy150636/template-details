import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Template, Review } from '@/lib/types';
import {
  getThemeFromUrl,
  getThemeConfig,
  formatPrice,
} from '@/lib/theme';
import {
  getWishlist,
  toggleWishlist,
  getRecent,
  addRecent,
  getCompare,
  toggleCompare,
  removeFromCompare,
  clearCompare,
} from '@/lib/storage';

import { Header } from '@/components/Header';
import { FilterBar, defaultFilters, type FilterState } from '@/components/FilterBar';
import { TemplateCard } from '@/components/TemplateCard';
import { SkeletonGrid } from '@/components/Skeletons';
import { QuickViewModal } from '@/components/QuickViewModal';
import { OrderModal } from '@/components/OrderModal';
import { CompareBar } from '@/components/CompareBar';
import { CompareModal } from '@/components/CompareModal';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { KroyAIAssistant } from '@/components/KroyAIAssistant';
import { AnalyticsModal } from '@/components/AnalyticsModal';
import { PackageOpen, Wand2 } from '@/components/icons';

function App() {
  // Theme
  const themeType = useMemo(() => getThemeFromUrl(), []);
  const theme = useMemo(() => getThemeConfig(themeType), [themeType]);

  // Data
  const [templates, setTemplates] = useState<Template[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // UI state
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [orderTemplate, setOrderTemplate] = useState<Template | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // LocalStorage state
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Apply theme class to body
  useEffect(() => {
    document.body.classList.remove('theme-regular', 'theme-standard', 'theme-premium');
    document.body.classList.add(`theme-${themeType}`);
  }, [themeType]);

  // Load localStorage on mount
  useEffect(() => {
    setWishlistIds(getWishlist());
    setRecentIds(getRecent());
    setCompareIds(getCompare());
  }, []);

  // Fetch templates + reviews
  useEffect(() => {
    async function fetchData() {
      try {
        const [tmplRes, revRes] = await Promise.all([
          supabase.from('templates').select('*'),
          supabase.from('reviews').select('*'),
        ]);

        if (tmplRes.error) throw tmplRes.error;

        setTemplates(tmplRes.data || []);
        setReviews(revRes.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filtered + sorted templates
  const filteredTemplates = useMemo(() => {
    let result = templates;

    // Filter by theme type (main category prefix)
    result = result.filter((t) => {
      const [mainCat] = t.category.split(':');
      return mainCat === themeType;
    });

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter((t) => {
        const [, sub] = t.category.split(':');
        return sub === filters.category;
      });
    }

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Package
    if (filters.package !== 'all') {
      result = result.filter((t) => t.package === filters.package);
    }

    // Technology
    if (filters.technology !== 'all') {
      result = result.filter((t) => t.technology === filters.technology);
    }

    // Color theme
    if (filters.colorTheme !== 'all') {
      result = result.filter((t) => t.color_theme === filters.colorTheme);
    }

    // Price range
    result = result.filter((t) => t.price_bdt >= filters.minPrice && t.price_bdt <= filters.maxPrice);

    // Sort
    const sorted = [...result];
    switch (filters.sort) {
      case 'popular':
        sorted.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'trending':
        sorted.sort((a, b) => Number(b.trending) - Number(a.trending) || b.popularity - a.popularity);
        break;
      case 'newest':
        sorted.sort((a, b) => Number(b.is_new) - Number(a.is_new) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'highest-rated':
        sorted.sort((a, b) => getAvgRating(b, reviews) - getAvgRating(a, reviews));
        break;
      case 'lowest-price':
        sorted.sort((a, b) => a.price_bdt - b.price_bdt);
        break;
      case 'highest-price':
        sorted.sort((a, b) => b.price_bdt - a.price_bdt);
        break;
    }

    return sorted;
  }, [templates, reviews, filters, themeType]);

  // Derived data
  const wishlistTemplates = useMemo(
    () => wishlistIds.map((id) => templates.find((t) => t.id === id)).filter(Boolean) as Template[],
    [wishlistIds, templates]
  );

  const recentTemplates = useMemo(
    () => recentIds.map((id) => templates.find((t) => t.id === id)).filter(Boolean) as Template[],
    [recentIds, templates]
  );

  const compareTemplates = useMemo(
    () => compareIds.map((id) => templates.find((t) => t.id === id)).filter(Boolean) as Template[],
    [compareIds, templates]
  );

  // Handlers
  const handleQuickView = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setQuickViewOpen(true);
    addRecent(template.id);
    setRecentIds(getRecent());
    // Increment popularity
    supabase
      .from('templates')
      .update({ popularity: template.popularity + 1 })
      .eq('id', template.id)
      .then(() => {
        setTemplates((prev) =>
          prev.map((t) => (t.id === template.id ? { ...t, popularity: t.popularity + 1 } : t))
        );
      });
  }, []);

  const handleToggleWishlist = useCallback((id: string) => {
    const newWishlist = toggleWishlist(id);
    setWishlistIds(newWishlist);
    // Update wishlist_count on template
    const template = templates.find((t) => t.id === id);
    if (template) {
      const isAdding = newWishlist.includes(id);
      const newCount = isAdding ? template.wishlist_count + 1 : Math.max(0, template.wishlist_count - 1);
      supabase.from('templates').update({ wishlist_count: newCount }).eq('id', id).then(() => {
        setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, wishlist_count: newCount } : t)));
      });
    }
  }, [templates]);

  const handleToggleCompare = useCallback((id: string) => {
    const newCompare = toggleCompare(id);
    setCompareIds(newCompare);
  }, []);

  const handleRemoveFromCompare = useCallback((id: string) => {
    const newCompare = removeFromCompare(id);
    setCompareIds(newCompare);
  }, []);

  const handleClearCompare = useCallback(() => {
    const newCompare = clearCompare();
    setCompareIds(newCompare);
  }, []);

  const handleOrder = useCallback((template: Template) => {
    setQuickViewOpen(false);
    setOrderTemplate(template);
    setOrderOpen(true);
    // Increment orders_count
    supabase
      .from('templates')
      .update({ orders_count: template.orders_count + 1 })
      .eq('id', template.id)
      .then(() => {
        setTemplates((prev) =>
          prev.map((t) => (t.id === template.id ? { ...t, orders_count: t.orders_count + 1 } : t))
        );
      });
  }, []);

  const handleSubmitReview = useCallback(
    (templateId: string, name: string, rating: number, comment: string) => {
      supabase
        .from('reviews')
        .insert({ template_id: templateId, name, rating, comment })
        .select()
        .single()
        .then(({ data }) => {
          if (data) {
            setReviews((prev) => [...prev, data]);
          }
        });
    },
    []
  );

  const handleSelectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setQuickViewOpen(true);
    addRecent(template.id);
    setRecentIds(getRecent());
  }, []);

  // Rating helper
  function getAvgRating(template: Template, allReviews: Review[]): number {
    const tReviews = allReviews.filter((r) => r.template_id === template.id);
    if (tReviews.length === 0) return 0;
    return tReviews.reduce((s, r) => s + r.rating, 0) / tReviews.length;
  }

  function getReviewCount(template: Template): number {
    return reviews.filter((r) => r.template_id === template.id).length;
  }

  const compareFull = compareIds.length >= 4;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="ambient-glow" />
      <div className="ambient-glow-bottom" />

      {/* Header */}
      <Header
        theme={theme}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenAnalytics={() => setAnalyticsOpen(true)}
      />

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filteredTemplates.length}
      />

      {/* Templates grid */}
      <section className="relative z-10 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <SkeletonGrid count={6} />
          ) : error ? (
            <div className="flex flex-col items-center py-16 text-center">
              <PackageOpen className="mb-4 h-12 w-12 text-slate-600" />
              <h4 className="mb-2 font-heading text-lg font-bold text-white">Could not load templates</h4>
              <p className="text-sm text-slate-400">Please check your connection and try again.</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <PackageOpen className="mb-4 h-12 w-12 text-slate-600" />
              <h4 className="mb-2 font-heading text-lg font-bold text-white">কোনো টেমপ্লেট পাওয়া যায়নি!</h4>
              <p className="text-sm text-slate-400">অন্য কোনো কিওয়ার্ড দিয়ে ফিল্টার বা সার্চ করে দেখুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  index={index}
                  wishlisted={wishlistIds.includes(template.id)}
                  comparing={compareIds.includes(template.id)}
                  compareFull={compareFull}
                  avgRating={getAvgRating(template, reviews)}
                  reviewCount={getReviewCount(template)}
                  onQuickView={handleQuickView}
                  onToggleWishlist={handleToggleWishlist}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recently viewed */}
      {!loading && recentTemplates.length > 0 && (
        <RecentlyViewed templates={recentTemplates} onSelect={handleSelectTemplate} />
      )}

      {/* CTA */}
      <section className="relative z-10 px-4 pb-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="glass-card relative overflow-hidden rounded-2xl p-8 text-center sm:p-12">
            <div className="absolute inset-0 -z-10 opacity-30" style={{ background: 'var(--header-gradient)' }} />
            <h2 className="font-heading mb-3 text-2xl font-bold text-white">
              কাস্টম ডিজাইন বা ইউনিক কোনো প্রজেক্ট চান?
            </h2>
            <p className="mx-auto mb-6 max-w-xl text-sm text-slate-400">
              আমাদের অভিজ্ঞ ডেভেলপার এবং ডিজাইনার টিম আপনার পছন্দ অনুযায়ী একদম নতুন ফিচার দিয়ে কাস্টম ওয়েবসাইট বানিয়ে দিতে প্রস্তুত।
            </p>
            <a
              href="index.html#lead-form"
              className="btn-neon btn-ripple inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm"
            >
              <Wand2 className="h-4 w-4" /> কাস্টম প্রজেক্ট অর্ডার করুন
            </a>
          </div>
        </div>
      </section>

      {/* Floating compare bar */}
      <CompareBar
        templates={compareTemplates}
        onOpen={() => setCompareOpen(true)}
        onRemove={handleRemoveFromCompare}
      />

      {/* Floating KROY AI */}
      <KroyAIAssistant allTemplates={templates} onSelectTemplate={handleSelectTemplate} />

      {/* Modals */}
      <QuickViewModal
        template={selectedTemplate}
        allTemplates={templates}
        reviews={reviews}
        wishlisted={selectedTemplate ? wishlistIds.includes(selectedTemplate.id) : false}
        comparing={selectedTemplate ? compareIds.includes(selectedTemplate.id) : false}
        compareFull={compareFull}
        onClose={() => setQuickViewOpen(false)}
        onToggleWishlist={handleToggleWishlist}
        onToggleCompare={handleToggleCompare}
        onOrder={handleOrder}
        onSelectTemplate={handleSelectTemplate}
        onSubmitReview={handleSubmitReview}
      />

      <OrderModal
        template={orderTemplate}
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
      />

      <CompareModal
        templates={compareTemplates}
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearCompare}
      />

      <WishlistDrawer
        open={wishlistOpen}
        templates={wishlistTemplates}
        recentTemplates={recentTemplates}
        onClose={() => setWishlistOpen(false)}
        onRemove={handleToggleWishlist}
        onQuickView={(t) => {
          setWishlistOpen(false);
          handleQuickView(t);
        }}
        onSelectRecent={(t) => {
          setWishlistOpen(false);
          handleSelectTemplate(t);
        }}
      />

      <AnalyticsModal
        open={analyticsOpen}
        templates={templates}
        reviews={reviews}
        compareIds={compareIds}
        onClose={() => setAnalyticsOpen(false)}
        onSelectTemplate={(t) => {
          setAnalyticsOpen(false);
          handleSelectTemplate(t);
        }}
      />
    </div>
  );
}

export default App;
