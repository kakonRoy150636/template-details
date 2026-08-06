import type { Template, ChatMessage } from './types';

interface ParseResult {
  keywords: string[];
  maxPrice: number | null;
  packagePref: string | null;
  techPref: string | null;
  themePref: string | null;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  wedding: ['wedding', 'marriage', 'biye', 'biyebari', 'couple'],
  portfolio: ['portfolio', 'personal', 'creative', 'designer', 'photographer', 'showcase'],
  restaurant: ['restaurant', 'food', 'cafe', 'menu', 'dining', 'hotel'],
  'for bf/gf': ['love', 'romantic', 'bf', 'gf', 'girlfriend', 'boyfriend', 'valentine', 'anniversary'],
  'e-commerce': ['ecommerce', 'e-commerce', 'shop', 'store', 'fashion', 'cart', 'product', 'shopping'],
  business: ['business', 'corporate', 'agency', 'company', 'professional', 'startup'],
};

const PACKAGE_KEYWORDS: Record<string, string[]> = {
  regular: ['regular', 'cheap', 'budget', 'affordable', 'basic'],
  standard: ['standard', 'mid', 'professional'],
  premium: ['premium', 'luxury', 'luxurious', 'high-end', 'exclusive', 'advanced'],
};

const TECH_KEYWORDS: Record<string, string[]> = {
  html: ['html', 'bootstrap', 'css'],
  react: ['react', 'reactjs'],
  nextjs: ['nextjs', 'next.js', 'next'],
  wordpress: ['wordpress', 'wp', 'cms'],
};

const THEME_KEYWORDS: Record<string, string[]> = {
  dark: ['dark', 'black', 'night'],
  light: ['light', 'white', 'bright', 'clean'],
  'luxury-gold': ['gold', 'luxury', 'golden', 'royal', 'elegant'],
  blue: ['blue', 'ocean', 'corporate'],
  minimal: ['minimal', 'simple', 'minimalist'],
};

function parseQuery(query: string): ParseResult {
  const lower = query.toLowerCase();
  const keywords: string[] = [];
  let packagePref: string | null = null;
  let techPref: string | null = null;
  let themePref: string | null = null;

  // Category match
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) {
      keywords.push(cat);
      break;
    }
  }

  // Package match
  for (const [pkg, words] of Object.entries(PACKAGE_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) {
      packagePref = pkg;
      break;
    }
  }

  // Tech match
  for (const [tech, words] of Object.entries(TECH_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) {
      techPref = tech;
      break;
    }
  }

  // Theme match
  for (const [theme, words] of Object.entries(THEME_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) {
      themePref = theme;
      break;
    }
  }

  // Price extraction (e.g. "under 3000", "below 5000")
  const priceMatch = lower.match(/(?:under|below|less than|max|maximum)\s+(\d{3,6})/);
  const maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : null;

  // General keywords from query
  const generalWords = lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['need', 'want', 'looking', 'for', 'the', 'website', 'template', 'show', 'find', 'give'].includes(w));
  keywords.push(...generalWords);

  return { keywords, maxPrice, packagePref, techPref, themePref };
}

export function searchTemplates(
  query: string,
  all: Template[]
): Template[] {
  const parsed = parseQuery(query);
  const lower = query.toLowerCase();

  const scored = all
    .map((t) => {
      const [mainCat, subCat] = t.category.split(':');
      let score = 0;

      // Category keyword match
      if (parsed.keywords.includes(subCat)) score += 40;
      if (parsed.keywords.includes(mainCat)) score += 20;

      // Package match
      if (parsed.packagePref && t.package === parsed.packagePref) score += 15;

      // Tech match
      if (parsed.techPref && t.technology === parsed.techPref) score += 15;

      // Theme match
      if (parsed.themePref && t.color_theme === parsed.themePref) score += 15;

      // Price filter
      if (parsed.maxPrice !== null) {
        if (t.price_bdt <= parsed.maxPrice) score += 20;
        else score -= 30;
      }

      // Title/tag keyword overlap
      const titleLower = t.title.toLowerCase();
      parsed.keywords.forEach((kw) => {
        if (titleLower.includes(kw)) score += 10;
        if (t.tags.some((tag) => tag.toLowerCase().includes(kw))) score += 5;
      });

      // Direct query string match in title/description
      if (titleLower.includes(lower)) score += 15;
      if (t.description.toLowerCase().includes(lower)) score += 5;

      return { template: t, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return scored.map((r) => r.template);
}

export function generateAIResponse(
  query: string,
  matched: Template[]
): string {
  const parsed = parseQuery(query);

  if (matched.length === 0) {
    let suggestion = 'I could not find an exact match, but let me suggest exploring our full catalog.';
    if (parsed.maxPrice !== null) {
      suggestion = `I could not find templates under ${parsed.maxPrice} BDT matching your needs. Try increasing your budget slightly or adjusting the category.`;
    }
    return suggestion;
  }

  const top = matched[0];
  const [mainCat, subCat] = top.category.split(':');

  let response = `I found ${matched.length} template${matched.length > 1 ? 's' : ''} that match your request`;
  if (parsed.maxPrice !== null) {
    response += ` under ${parsed.maxPrice} BDT`;
  }
  if (parsed.keywords.length > 0) {
    response += ` for ${parsed.keywords[0]}`;
  }
  response += `. `;
  response += `My top pick is "${top.title}" — a ${top.package} ${subCat || mainCat} template at ${top.price_bdt.toLocaleString()} BDT, built with ${top.technology.toUpperCase()}. `;
  response += `It has a ${top.seo_score} SEO score, ${top.mobile_score} mobile score, and ${top.features.length}+ features. `;
  if (matched.length > 1) {
    response += `I also found ${matched.length - 1} other option${matched.length - 1 > 1 ? 's' : ''} you can compare below.`;
  }

  return response;
}

// AI Template Assistant (for QuickView modal) — answers questions about a specific template
export function answerTemplateQuestion(
  question: string,
  template: Template
): string {
  const q = question.toLowerCase().trim();

  if (/mobile|responsive|phone|tablet/.test(q)) {
    return `Yes, "${template.title}" is fully mobile responsive with a mobile score of ${template.mobile_score}/100. It adapts smoothly to phones, tablets, and desktops.`;
  }

  if (/restaurant|food|cafe|menu/.test(q)) {
    const [subCat] = template.category.split(':');
    if (subCat === 'restaurant') {
      return `Yes, "${template.title}" is designed specifically for restaurants. It includes menu showcase and reservation features.`;
    }
    return `"${template.title}" is a ${subCat} template, not built for restaurants. For restaurant websites, check our Restaurant category templates like "Restaurant Elegant" or "Restaurant Luxe Dark".`;
  }

  if (/domain|custom domain/.test(q)) {
    if (template.features.some((f) => f.toLowerCase().includes('custom domain'))) {
      return `Yes, "${template.title}" supports custom domain setup. You can connect your own domain name.`;
    }
    return `"${template.title}" does not include custom domain support. Consider upgrading to a Standard or Premium package for this feature.`;
  }

  if (/color|theme|change color|customize color/.test(q)) {
    return `Yes, you can change the colors in "${template.title}". It has a customization level of ${template.customization_level}/5, meaning ${template.customization_level >= 4 ? 'extensive' : 'moderate'} customization options including colors, fonts, and layouts.`;
  }

  if (/seo|search engine|google/.test(q)) {
    return `"${template.title}" has an SEO score of ${template.seo_score}/100. It is optimized for search engines with proper meta tags, semantic HTML, and fast loading speeds.`;
  }

  if (/price|cost|how much|bdt|taka/.test(q)) {
    return `"${template.title}" is priced at ${template.price_bdt.toLocaleString()} BDT as a ${template.package} package. This includes all features listed in the template details.`;
  }

  if (/technology|tech|built with|framework|react|next|html|wordpress/.test(q)) {
    const techName: Record<string, string> = {
      html: 'HTML, CSS, and JavaScript',
      react: 'React.js',
      nextjs: 'Next.js',
      wordpress: 'WordPress',
    };
    return `"${template.title}" is built with ${techName[template.technology] || template.technology}. This means ${template.technology === 'wordpress' ? 'you can manage content via the WordPress admin panel' : template.technology === 'html' ? 'it is easy to edit with basic HTML/CSS knowledge' : 'it offers modern component-based architecture with fast page transitions'}.`;
  }

  if (/feature|what.*include|what.*have/.test(q)) {
    return `"${template.title}" includes ${template.features.length} key features: ${template.features.slice(0, 5).join(', ')}${template.features.length > 5 ? ', and more' : ''}.`;
  }

  if (/animation|effect|motion/.test(q)) {
    const levelText = ['minimal', 'subtle', 'moderate', 'rich', 'cinematic'];
    return `"${template.title}" has a ${levelText[template.animation_level - 1] || 'moderate'} animation level (${template.animation_level}/5). ${template.animation_level >= 4 ? 'Expect smooth scroll effects, parallax, and cinematic transitions.' : 'It includes clean, professional transitions.'}`;
  }

  if (/speed|fast|performance|loading/.test(q)) {
    return `"${template.title}" has a performance/speed score of ${template.speed_score}/100. ${template.speed_score >= 90 ? 'It loads very fast, ensuring a great user experience.' : 'It has good loading speed with room for optimization.'}`;
  }

  if (/page|how many page/.test(q)) {
    return `"${template.title}" includes ${template.pages} pre-designed page${template.pages > 1 ? 's' : ''}.`;
  }

  if (/popular|trending|order|sell/.test(q)) {
    return `"${template.title}" has been ordered ${template.orders_count} times and saved to ${template.wishlist_count} wishlists. ${template.trending ? 'It is currently trending!' : 'It is a steady seller in our marketplace.'}`;
  }

  if (/secure|security/.test(q)) {
    return `Yes, "${template.title}" is built with secure, clean code. It follows best practices for web security and safe data handling.`;
  }

  if (/language|multi.?language|bangla|english|bengali/.test(q)) {
    if (template.features.some((f) => f.toLowerCase().includes('multi-language'))) {
      return `Yes, "${template.title}" supports multiple languages including Bangla and English.`;
    }
    return `"${template.title}" is a single-language template. For multi-language support, consider our Premium package templates.`;
  }

  // Default: provide general info
  return `Here is what I know about "${template.title}": It is a ${template.package} ${template.category.split(':')[1] || 'general'} template priced at ${template.price_bdt.toLocaleString()} BDT, built with ${template.technology.toUpperCase()}. It scores ${template.seo_score} on SEO, ${template.mobile_score} on mobile, and ${template.speed_score} on speed. Feel free to ask me about features, customization, technology, or anything else!`;
}

export const SUGGESTED_QUESTIONS = [
  'Is this mobile responsive?',
  'Can I use this for restaurants?',
  'Does it support custom domain?',
  'Can I change colors?',
  'What features are included?',
  'What technology is this built with?',
  'How fast does it load?',
  'Is it SEO optimized?',
];
