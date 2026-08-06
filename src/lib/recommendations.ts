import type { Template } from './types';

export interface RecommendationResult {
  template: Template;
  matchPercentage: number;
}

function tagOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a.map((t) => t.toLowerCase()));
  const setB = new Set(b.map((t) => t.toLowerCase()));
  let common = 0;
  setA.forEach((t) => {
    if (setB.has(t)) common++;
  });
  return common / Math.max(setA.size, setB.size);
}

export function getRecommendations(
  base: Template,
  all: Template[],
  limit = 4
): RecommendationResult[] {
  const [mainCat] = base.category.split(':');

  const scored = all
    .filter((t) => t.id !== base.id)
    .map((t) => {
      const [tMainCat] = t.category.split(':');
      let score = 0;

      // Same main category (40%)
      if (tMainCat === mainCat) score += 40;

      // Tag overlap (25%)
      score += tagOverlap(base.tags, t.tags) * 25;

      // Same package (15%)
      if (t.package === base.package) score += 15;

      // Same technology (10%)
      if (t.technology === base.technology) score += 10;

      // Same color theme (10%)
      if (t.color_theme === base.color_theme) score += 10;

      return {
        template: t,
        matchPercentage: Math.min(Math.round(score), 99),
      };
    })
    .filter((r) => r.matchPercentage >= 40)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, limit);

  return scored;
}
