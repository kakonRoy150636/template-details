/*
# KROY Marketplace — Templates & Reviews Schema

1. New Tables
- `templates`: the marketplace catalog. Each row is a purchasable template with
  rich metadata used by the search engine, comparison system, AI recommendations,
  live preview, trust signals, and performance badges.
  Columns: id (uuid), title, description, category (e.g. "regular:portfolio"),
  package (regular/standard/premium), technology (html/react/nextjs/wordpress),
  color_theme (dark/light/luxury-gold/blue/minimal), price_bdt (int),
  thumbnail_url, demo_url, pages (int), animation_level (1-5), seo_score (0-100),
  mobile_score (0-100), speed_score (0-100), accessibility_score (0-100),
  customization_level (1-5), tags (text[]), features (text[]), gallery (text[]),
  video_url, popularity (int counter), wishlist_count (int), orders_count (int),
  trending (bool), is_new (bool), created_at.
- `reviews`: user reviews for templates. Columns: id, template_id (fk), name,
  rating (1-5), comment, created_at. No login required — anyone can post a review.

2. Security
- Enable RLS on both tables.
- Single-tenant (no sign-in): use TO anon, authenticated on all policies so the
  anon-key frontend can read/write. The data is intentionally public/shared.
- reviews: SELECT/INSERT open to anon+authenticated; UPDATE/DELETE not needed.
- templates: SELECT open to anon+authenticated; INSERT/UPDATE/DELETE open to
  anon+authenticated so the catalog can be seeded/managed without auth.
- popularity/wishlist/orders counters are incremented via UPDATE policy.

3. Notes
- All scores stored as smallint to keep storage tight.
- `tags` and `features` are text arrays for flexible filtering and AI matching.
- `gallery` stores multiple preview image URLs for the live preview slider.
*/

CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL,
  package text NOT NULL DEFAULT 'regular',
  technology text NOT NULL DEFAULT 'html',
  color_theme text NOT NULL DEFAULT 'dark',
  price_bdt integer NOT NULL DEFAULT 0,
  thumbnail_url text NOT NULL DEFAULT '',
  demo_url text NOT NULL DEFAULT '',
  pages integer NOT NULL DEFAULT 1,
  animation_level smallint NOT NULL DEFAULT 3,
  seo_score smallint NOT NULL DEFAULT 90,
  mobile_score smallint NOT NULL DEFAULT 95,
  speed_score smallint NOT NULL DEFAULT 90,
  accessibility_score smallint NOT NULL DEFAULT 90,
  customization_level smallint NOT NULL DEFAULT 3,
  tags text[] NOT NULL DEFAULT '{}',
  features text[] NOT NULL DEFAULT '{}',
  gallery text[] NOT NULL DEFAULT '{}',
  video_url text NOT NULL DEFAULT '',
  popularity integer NOT NULL DEFAULT 0,
  wishlist_count integer NOT NULL DEFAULT 0,
  orders_count integer NOT NULL DEFAULT 0,
  trending boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_templates" ON templates;
CREATE POLICY "anon_select_templates" ON templates
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_templates" ON templates;
CREATE POLICY "anon_insert_templates" ON templates
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_templates" ON templates;
CREATE POLICY "anon_update_templates" ON templates
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_templates" ON templates;
CREATE POLICY "anon_delete_templates" ON templates
  FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  name text NOT NULL,
  rating smallint NOT NULL DEFAULT 5,
  comment text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_package ON templates(package);
CREATE INDEX IF NOT EXISTS idx_templates_technology ON templates(technology);
CREATE INDEX IF NOT EXISTS idx_templates_trending ON templates(trending);
CREATE INDEX IF NOT EXISTS idx_reviews_template_id ON reviews(template_id);
