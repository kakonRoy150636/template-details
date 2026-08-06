import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import type { Template, ChatMessage } from '@/lib/types';
import { searchTemplates, generateAIResponse } from '@/lib/ai';
import { formatPrice, getMatchPercentageColor } from '@/lib/theme';

interface KroyAIAssistantProps {
  allTemplates: Template[];
  onSelectTemplate: (template: Template) => void;
}

const SUGGESTIONS = [
  'Need a luxury wedding website',
  'Need a portfolio template under 3000 BDT',
  'Need a dark restaurant website',
  'Need a premium business website',
];

export function KroyAIAssistant({ allTemplates, onSelectTemplate }: KroyAIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, isThinking]);

  function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { role: 'user', content: msg, timestamp: Date.now() }]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      const matches = searchTemplates(msg, allTemplates);
      const response = generateAIResponse(msg, matches);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response,
          templates: matches,
          timestamp: Date.now(),
        },
      ]);
      setIsThinking(false);
    }, 600);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="animate-float fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full gradient-accent shadow-lg neon-glow transition-transform hover:scale-110"
        title="KROY AI Assistant"
      >
        {open ? <X className="h-6 w-6 text-[var(--badge-text)]" /> : <Bot className="h-6 w-6 text-[var(--badge-text)]" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="animate-slide-in-up fixed bottom-24 right-6 z-40 flex h-[520px] w-[calc(100vw-3rem)] max-w-sm flex-col glass-card overflow-hidden rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/8 p-4">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full gradient-accent">
              <Bot className="h-5 w-5 text-[var(--badge-text)]" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0e1421] bg-emerald-400" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-white">KROY AI</h3>
              <p className="text-xs text-emerald-400">Online — Ready to help</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center py-4 text-center">
                <Sparkles className="mb-3 h-8 w-8 text-[var(--primary-accent)]" />
                <h4 className="mb-1 font-heading text-sm font-bold text-white">Hi! I am KROY AI</h4>
                <p className="mb-4 text-xs text-slate-400">
                  Tell me what kind of website you need and I will find the best templates for you.
                </p>
                <div className="flex w-full flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition-all hover:border-[var(--primary-accent)]/40 hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'w-full'}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'gradient-accent text-[var(--badge-text)]'
                        : 'glass-surface text-slate-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {/* Template recommendations in chat */}
                  {msg.templates && msg.templates.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.templates.slice(0, 3).map((t, idx) => {
                        // Calculate match percentage based on position
                        const match = Math.max(95 - idx * 5, 70);
                        const [, subCat] = t.category.split(':');
                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              onSelectTemplate(t);
                              setOpen(false);
                            }}
                            className="group flex w-full items-center gap-2.5 rounded-xl border border-white/8 bg-white/3 p-2 text-left transition-all hover:border-[var(--primary-accent)]/40"
                          >
                            <img src={t.thumbnail_url} alt={t.title} className="h-12 w-16 flex-shrink-0 rounded-md object-cover" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold ${getMatchPercentageColor(match)}`}>{match}% Match</span>
                              </div>
                              <h5 className="truncate text-xs font-semibold text-white">{t.title}</h5>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase text-slate-500">{subCat}</span>
                                <span className="text-xs font-bold gradient-accent-text">{formatPrice(t.price_bdt)}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="glass-surface rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/8 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Describe what you need..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[var(--primary-accent)] focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                className="btn-neon rounded-xl px-3 py-2.5"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
