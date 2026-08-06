import { useState, useEffect, useRef } from 'react';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Play,
  ShoppingCart,
  Heart,
  GitCompare,
  Check,
  Send,
  Bot,
  Sparkles,
  ShieldCheck,
  Zap,
  Gauge,
  Palette,
  Star,
} from 'lucide-react';
import type { Template, Review, ChatMessage } from '@/lib/types';
import { formatPrice } from '@/lib/theme';
import { PerformanceBadges, StarRating } from './Badges';
import { answerTemplateQuestion, SUGGESTED_QUESTIONS } from '@/lib/ai';
import { getRecommendations } from '@/lib/recommendations';
import { RecommendationCard } from './RecommendationCard';

type PreviewMode = 'desktop' | 'tablet' | 'mobile';
type Tab = 'overview' | 'preview' | 'assistant' | 'reviews';

interface QuickViewModalProps {
  template: Template | null;
  allTemplates: Template[];
  reviews: Review[];
  wishlisted: boolean;
  comparing: boolean;
  compareFull: boolean;
  onClose: () => void;
  onToggleWishlist: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onOrder: (template: Template) => void;
  onSelectTemplate: (template: Template) => void;
  onSubmitReview: (templateId: string, name: string, rating: number, comment: string) => void;
}

export function QuickViewModal({
  template,
  allTemplates,
  reviews,
  wishlisted,
  comparing,
  compareFull,
  onClose,
  onToggleWishlist,
  onToggleCompare,
  onOrder,
  onSelectTemplate,
  onSubmitReview,
}: QuickViewModalProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (template) {
      setTab('overview');
      setGalleryIndex(0);
      setPreviewMode('desktop');
      setZoomed(false);
      setFullscreen(false);
      setChatMessages([
        {
          role: 'assistant',
          content: `Hi! I am your AI assistant for "${template.title}". Ask me anything about this template — features, customization, technology, pricing, and more.`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [template]);

  useEffect(() => {
    if (tab === 'assistant' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, tab]);

  if (!template) return null;

  const [mainCat, subCat] = template.category.split(':');
  const templateReviews = reviews.filter((r) => r.template_id === template.id);
  const avgRating =
    templateReviews.length > 0
      ? templateReviews.reduce((sum, r) => sum + r.rating, 0) / templateReviews.length
      : 0;
  const recommendations = getRecommendations(template, allTemplates, 4);
  const gallery = template.gallery.length > 0 ? template.gallery : [template.thumbnail_url];

  function handleSendChat(text?: string) {
    const msg = (text || chatInput).trim();
    if (!msg || !template) return;
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', content: msg, timestamp: Date.now() },
    ]);
    setChatInput('');
    // Simulate AI thinking then respond
    setTimeout(() => {
      const answer = answerTemplateQuestion(msg, template);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: answer, timestamp: Date.now() },
      ]);
    }, 400);
  }

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim() || !template) return;
    onSubmitReview(template.id, reviewName.trim(), reviewRating, reviewComment.trim());
    setReviewName('');
    setReviewRating(5);
    setReviewComment('');
  }

  const previewWidths: Record<PreviewMode, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const trustSignals = [
    { icon: Smartphone, label: 'Mobile Responsive' },
    { icon: ShieldCheck, label: 'SEO Optimized' },
    { icon: Zap, label: 'Fast Loading' },
    { icon: Palette, label: 'Easy Customization' },
    { icon: ShieldCheck, label: 'Secure Code' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm sm:p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="animate-scale-in glass-card relative flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-white/8 px-4 pt-3">
            <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} label="Overview" />
            <TabButton active={tab === 'preview'} onClick={() => setTab('preview')} label="Live Preview" />
            <TabButton active={tab === 'assistant'} onClick={() => setTab('assistant')} label="Ask AI" />
            <TabButton active={tab === 'reviews'} onClick={() => setTab('reviews')} label={`Reviews (${templateReviews.length})`} />
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-4 sm:p-6">
            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left: Image gallery */}
                <div>
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                    <img
                      src={gallery[galleryIndex]}
                      alt={template.title}
                      className={`w-full object-cover transition-transform duration-300 ${zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                      style={{ maxHeight: '380px' }}
                      onClick={() => setZoomed((v) => !v)}
                    />
                    {gallery.length > 1 && (
                      <>
                        <button
                          onClick={() => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                          className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/80"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)}
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/80"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setZoomed((v) => !v)}
                      className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Thumbnails */}
                  {gallery.length > 1 && (
                    <div className="mt-3 flex gap-2">
                      {gallery.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setGalleryIndex(i)}
                          className={`h-14 w-24 overflow-hidden rounded-lg border-2 transition-all ${
                            i === galleryIndex ? 'border-[var(--primary-accent)]' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="flex flex-col">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold uppercase text-[var(--primary-accent)]">
                      {subCat}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold uppercase text-slate-400">
                      {template.package}
                    </span>
                    {template.trending && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-bold text-orange-400">
                        <Sparkles className="h-3 w-3" /> Trending
                      </span>
                    )}
                  </div>

                  <h2 className="font-heading mb-2 text-2xl font-bold text-white">{template.title}</h2>
                  <p className="mb-4 text-sm text-slate-400">{template.description}</p>

                  {/* Rating */}
                  {templateReviews.length > 0 && (
                    <div className="mb-4 flex items-center gap-3">
                      <StarRating rating={avgRating} />
                      <span className="font-bold text-amber-400">{avgRating.toFixed(1)}</span>
                      <span className="text-sm text-slate-500">({templateReviews.length} reviews)</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <span className="font-heading text-3xl font-bold gradient-accent-text">
                      {formatPrice(template.price_bdt)}
                    </span>
                  </div>

                  {/* Trust signals */}
                  <div className="mb-4 rounded-xl border border-white/8 bg-white/3 p-3">
                    <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Trust & Quality
                    </h4>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {trustSignals.map((signal) => (
                        <div key={signal.label} className="flex items-center gap-2 text-sm text-slate-300">
                          <signal.icon className="h-4 w-4 text-emerald-400" />
                          <span>{signal.label}</span>
                        </div>
                      ))}
                    </div>
                    {/* Conversion stats */}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/5 pt-3 text-xs text-slate-500">
                      <span><strong className="text-white">{template.orders_count}</strong> Orders Completed</span>
                      <span><strong className="text-emerald-400">99%</strong> Satisfaction</span>
                      <span>Last ordered <strong className="text-white">3 hours ago</strong></span>
                    </div>
                  </div>

                  {/* Performance badges */}
                  <div className="mb-4">
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Performance Scores
                    </h4>
                    <PerformanceBadges template={template} />
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Features ({template.features.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {template.features.map((feat) => (
                        <span
                          key={feat}
                          className="rounded-lg border border-white/8 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => onOrder(template)}
                      className="btn-neon btn-ripple flex-1 rounded-xl px-4 py-3 text-sm"
                    >
                      <ShoppingCart className="mr-2 inline h-4 w-4" /> Order Now
                    </button>
                    <button
                      onClick={() => onToggleWishlist(template.id)}
                      className={`btn-glass rounded-xl px-4 py-3 transition-all ${wishlisted ? 'text-rose-400' : ''}`}
                    >
                      <Heart className={`h-5 w-5 ${wishlisted ? 'fill-rose-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => !compareFull && onToggleCompare(template.id)}
                      disabled={compareFull && !comparing}
                      className={`btn-glass rounded-xl px-4 py-3 transition-all disabled:opacity-40 ${comparing ? 'text-[var(--primary-accent)]' : ''}`}
                    >
                      {comparing ? <Check className="h-5 w-5" /> : <GitCompare className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW TAB */}
            {tab === 'preview' && (
              <div>
                {/* Preview controls */}
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <PreviewModeBtn active={previewMode === 'desktop'} onClick={() => setPreviewMode('desktop')} icon={Monitor} label="Desktop" />
                    <PreviewModeBtn active={previewMode === 'tablet'} onClick={() => setPreviewMode('tablet')} icon={Tablet} label="Tablet" />
                    <PreviewModeBtn active={previewMode === 'mobile'} onClick={() => setPreviewMode('mobile')} icon={Smartphone} label="Mobile" />
                  </div>
                  <div className="flex gap-2">
                    {template.video_url && (
                      <a
                        href={template.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-glass inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm"
                      >
                        <Play className="h-4 w-4" /> Video
                      </a>
                    )}
                    <button
                      onClick={() => setFullscreen((v) => !v)}
                      className="btn-glass inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm"
                    >
                      <Maximize2 className="h-4 w-4" /> Fullscreen
                    </button>
                  </div>
                </div>

                {/* Preview area */}
                <div className="flex items-start justify-center overflow-auto rounded-xl border border-white/10 bg-slate-950 p-4" style={{ minHeight: '400px' }}>
                  <div
                    className="overflow-hidden rounded-lg border border-white/10 bg-white transition-all duration-300"
                    style={{ width: previewWidths[previewMode], maxWidth: '100%' }}
                  >
                    <iframe
                      src={template.demo_url}
                      title={template.title}
                      className="block"
                      style={{
                        width: '100%',
                        height: previewMode === 'mobile' ? '600px' : previewMode === 'tablet' ? '500px' : '500px',
                        border: 'none',
                      }}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>

                {/* Gallery lightbox */}
                <div className="mt-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-300">Screenshot Gallery</h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {gallery.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setGalleryIndex(i);
                          setTab('overview');
                        }}
                        className="group/img relative aspect-video overflow-hidden rounded-lg border border-white/10"
                      >
                        <img src={img} alt="" className="img-zoom h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/img:opacity-100">
                          <ZoomIn className="h-6 w-6 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI ASSISTANT TAB */}
            {tab === 'assistant' && (
              <div className="flex flex-col" style={{ minHeight: '500px' }}>
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-[var(--primary-accent)]/30 bg-[var(--primary-glow)]/10 p-3">
                  <Bot className="h-5 w-5 text-[var(--primary-accent)]" />
                  <p className="text-sm text-slate-300">
                    Ask me anything about <strong className="text-white">{template.title}</strong>. I answer based on template data only — no guessing.
                  </p>
                </div>

                {/* Chat messages */}
                <div className="mb-3 max-h-80 flex-1 space-y-3 overflow-y-auto rounded-xl border border-white/8 bg-black/20 p-4">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.role === 'user'
                            ? 'gradient-accent text-[var(--badge-text)]'
                            : 'glass-surface text-slate-200'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Suggested questions */}
                {chatMessages.length <= 1 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.slice(0, 5).map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSendChat(q)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-[var(--primary-accent)]/40 hover:text-white"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Type your question..."
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[var(--primary-accent)] focus:outline-none"
                  />
                  <button
                    onClick={() => handleSendChat()}
                    className="btn-neon btn-ripple rounded-xl px-4 py-2.5"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {tab === 'reviews' && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Review list */}
                <div>
                  <h3 className="mb-4 font-heading text-lg font-bold text-white">
                    Customer Reviews ({templateReviews.length})
                  </h3>
                  {templateReviews.length === 0 ? (
                    <div className="rounded-xl border border-white/8 bg-white/3 p-8 text-center">
                      <Star className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                      <p className="text-sm text-slate-400">No reviews yet. Be the first to review!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {templateReviews.map((review) => (
                        <div key={review.id} className="glass-surface rounded-xl p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-semibold text-white">{review.name}</span>
                            <StarRating rating={review.rating} size="h-3.5 w-3.5" />
                          </div>
                          <p className="mb-2 text-sm text-slate-400">{review.comment}</p>
                          <span className="text-xs text-slate-600">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Review form */}
                <div>
                  <h3 className="mb-4 font-heading text-lg font-bold text-white">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="glass-surface space-y-3 rounded-xl p-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-400">Your Name</label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        required
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[var(--primary-accent)] focus:outline-none"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-400">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-7 w-7 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-700'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-400">Comment</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                        rows={4}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[var(--primary-accent)] focus:outline-none"
                        placeholder="Share your experience..."
                      />
                    </div>
                    <button type="submit" className="btn-neon btn-ripple w-full rounded-lg py-2.5 text-sm">
                      Submit Review
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Recommendations footer (all tabs except assistant) */}
          {tab !== 'assistant' && recommendations.length > 0 && (
            <div className="border-t border-white/8 p-4 sm:p-6">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <Sparkles className="h-4 w-4 text-[var(--primary-accent)]" /> You May Also Like
              </h4>
              <div className="no-scrollbar flex gap-3 overflow-x-auto">
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.template.id}
                    template={rec.template}
                    matchPercentage={rec.matchPercentage}
                    onClick={() => onSelectTemplate(rec.template)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen lightbox */}
      {fullscreen && (
        <div className="fixed inset-0 z-[60] bg-black/95 p-4" onClick={() => setFullscreen(false)}>
          <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
            <X className="h-5 w-5" />
          </button>
          <div className="flex h-full items-center justify-center">
            <iframe
              src={template.demo_url}
              title={template.title}
              className="h-full w-full rounded-lg"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
        active ? 'text-[var(--primary-accent)]' : 'text-slate-400 hover:text-white'
      }`}
    >
      {label}
      {active && (
        <div className="absolute bottom-0 left-0 h-0.5 w-full gradient-accent" />
      )}
    </button>
  );
}

function PreviewModeBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        active ? 'gradient-accent text-[var(--badge-text)]' : 'btn-glass text-slate-300'
      }`}
    >
      <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
